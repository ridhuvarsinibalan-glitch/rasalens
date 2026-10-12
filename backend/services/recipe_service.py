import os
import json
import logging
import re
import pandas as pd
from typing import Optional, List, Dict, Any

logger = logging.getLogger("rasalens.recipes")

PROCESSED_PATH = os.path.join("data", "processed", "recipes_processed.csv")
SAMPLE_PATH = os.path.join("data", "sample", "recipes_sample.csv")
VIDEOS_PATH = os.path.join("data", "videos.csv")

def clean_param(val: Optional[str]) -> Optional[str]:
    """Clean string parameter, converting 'undefined', 'null', 'All' to None."""
    if val is None:
        return None
    s = str(val).strip()
    if s.lower() in ["", "none", "undefined", "null", "all"]:
        return None
    return s

def get_word_variants(term: str) -> List[str]:
    """Generate stem/plural/singular variants and culinary synonyms for flexible keyword matching."""
    variants = [term]
    t = term.lower()
    # Culinary variant synonyms
    if t in ["biryani", "biriyani", "birianis", "biriyanis"]:
        variants.extend(["biryani", "biriyani", "biriani"])
    elif t in ["pulav", "pulao", "pilaf"]:
        variants.extend(["pulav", "pulao", "pilaf"])
    elif t in ["paneer", "panir"]:
        variants.extend(["paneer", "panir"])
    elif t in ["paratha", "parotta", "porotta"]:
        variants.extend(["paratha", "parotta", "porotta"])
    
    if t.endswith("ies") and len(t) > 4:
        variants.append(t[:-3] + "y")
    elif t.endswith("es") and len(t) > 3:
        variants.append(t[:-2])
        variants.append(t[:-1])
    elif t.endswith("s") and len(t) > 3:
        variants.append(t[:-1])
    else:
        variants.append(t + "s")
        variants.append(t + "es")
    return list(dict.fromkeys(variants))

class RecipeService:
    def __init__(self):
        self.df = None
        self.videos_df = None
        self.is_sample_mode = False
        self._load_data()

    def _load_data(self):
        # 1. Load Recipes
        if os.path.exists(PROCESSED_PATH):
            try:
                self.df = pd.read_csv(PROCESSED_PATH)
                self.is_sample_mode = False
                logger.info(f"Loaded master recipes ({len(self.df)} records).")
            except Exception as e:
                logger.error(f"Error loading master dataset: {e}")

        if self.df is None and os.path.exists(SAMPLE_PATH):
            self.df = pd.read_csv(SAMPLE_PATH)
            self.is_sample_mode = True
            logger.info(f"Fallback to sample recipes ({len(self.df)} records).")

        # 2. Load Videos
        if os.path.exists(VIDEOS_PATH):
            try:
                self.videos_df = pd.read_csv(VIDEOS_PATH)
                logger.info(f"Loaded {len(self.videos_df)} verified recipe video records.")
            except Exception as e:
                logger.error(f"Error loading videos catalog: {e}")

    def get_recipes(
        self,
        page: int = 1,
        page_size: int = 12,
        query: Optional[str] = None,
        course: Optional[str] = None,
        diet: Optional[str] = None,
        cuisine: Optional[str] = None
    ) -> Dict[str, Any]:
        if self.df is None:
            return {"total": 0, "page": page, "page_size": page_size, "total_pages": 1, "is_sample_mode": self.is_sample_mode, "search_mode": "keyword", "recipes": []}

        # Clean filter parameters
        query = clean_param(query)
        course = clean_param(course)
        diet = clean_param(diet)
        cuisine = clean_param(cuisine)

        filtered = self.df.copy()

        # Apply categorical filters first
        if course:
            filtered = filtered[filtered['course'].str.lower() == course.lower()]

        if diet:
            filtered = filtered[filtered['diet'].str.lower() == diet.lower()]

        if cuisine:
            filtered = filtered[filtered['cuisine'].str.lower() == cuisine.lower()]

        search_mode = "keyword"
        semantic_scores = {}
        translated_query = None
        detected_lang = None

        if query:
            q_clean = query.strip()
            
            # Detect Indic characters (Tamil U+0B80-U+0BFF or Hindi U+0900-U+097F)
            if re.search(r"[\u0B80-\u0BFF\u0900-\u097F]", q_clean):
                try:
                    from backend.services.translation_service import translation_service
                    trans_res = translation_service.translate(q_clean, target_lang="eng_Latn")
                    translated_query = trans_res.get("translated_text", "").strip()
                    detected_lang = trans_res.get("detected_lang", "tam_Taml" if re.search(r"[\u0B80-\u0BFF]", q_clean) else "hin_Deva")
                    logger.info(f"Indic recipe query: '{query}' -> '{translated_query}' ({detected_lang})")
                except Exception as e:
                    logger.warning(f"Failed to translate Indic search query '{query}': {e}")

            # Active search term for English recipe dataset
            active_search = (translated_query or q_clean).lower().strip()

            # If user explicitly searched for veg/vegetarian and did not pick Non-Vegetarian diet filter, enforce vegetarian diet
            if active_search in ["veg", "vegetarian"] and (not diet or str(diet).lower() not in ["non-vegetarian", "non-veg"]):
                filtered = filtered[filtered['diet'].str.lower().isin(["vegetarian", "vegan"])]
            elif active_search == "vegan" and (not diet or str(diet).lower() not in ["non-vegetarian", "non-veg"]):
                filtered = filtered[filtered['diet'].str.lower() == "vegan"]

            # Tier 1: Exact phrase match across title, ingredients, or cuisine
            pattern_exact = re.escape(active_search)
            mask_exact = (
                filtered['title'].str.contains(pattern_exact, case=False, na=False) |
                filtered['ingredients_json'].str.contains(pattern_exact, case=False, na=False) |
                filtered['cuisine'].str.contains(pattern_exact, case=False, na=False)
            )
            exact_matches = filtered[mask_exact]

            # Split multi-word query into meaningful terms
            terms = [t for t in re.split(r"\s+", active_search) if t and t not in ["and", "with", "or", "in", "the", "a", "of", "for"]]
            if not terms:
                terms = [active_search]

            mask_all = pd.Series(True, index=filtered.index)
            mask_any = pd.Series(False, index=filtered.index)

            for term in terms:
                variants = get_word_variants(term)
                pattern = "|".join(re.escape(v) for v in variants)
                term_mask = (
                    filtered['title'].str.contains(pattern, case=False, na=False) |
                    filtered['ingredients_json'].str.contains(pattern, case=False, na=False) |
                    filtered['tokens_json'].str.contains(pattern, case=False, na=False) |
                    filtered['cuisine'].str.contains(pattern, case=False, na=False) |
                    filtered['course'].str.contains(pattern, case=False, na=False)
                )
                mask_all = mask_all & term_mask
                mask_any = mask_any | term_mask

            all_matches = filtered[mask_all]
            any_matches = filtered[mask_any]

            if len(exact_matches) > 0:
                filtered = exact_matches
                search_mode = "keyword"
            elif len(all_matches) > 0:
                filtered = all_matches
                search_mode = "keyword"
            elif len(any_matches) > 0:
                filtered = any_matches
                search_mode = "keyword"
            else:
                # Fallback to FAISS Semantic Retrieval if keyword returned 0 results
                fallback_q = translated_query or query
                logger.info(f"Keyword search for '{fallback_q}' returned 0 results. Triggering FAISS semantic fallback...")
                try:
                    from backend.services.rag_service import rag_service
                    rag_res = rag_service.query(fallback_q, top_k=min(page_size * 3, 36))
                    retrieved = rag_res.get("retrieved_recipes", [])
                    if retrieved:
                        sem_ids = [r["recipe_id"] for r in retrieved]
                        semantic_scores = {r["recipe_id"]: r.get("similarity_score", 0.0) for r in retrieved}
                        # Retrieve recipes by ID from our master dataset
                        sem_filtered = self.df[self.df['recipe_id'].isin(sem_ids)].copy()
                        # Apply course/diet/cuisine filters if active
                        if course:
                            sem_filtered = sem_filtered[sem_filtered['course'].str.lower() == course.lower()]
                        if diet:
                            sem_filtered = sem_filtered[sem_filtered['diet'].str.lower() == diet.lower()]
                        if cuisine:
                            sem_filtered = sem_filtered[sem_filtered['cuisine'].str.lower() == cuisine.lower()]

                        if len(sem_filtered) > 0:
                            sem_filtered['rank_order'] = sem_filtered['recipe_id'].map(lambda x: sem_ids.index(x) if x in sem_ids else 999)
                            sem_filtered = sem_filtered.sort_values('rank_order')
                            filtered = sem_filtered
                            search_mode = "semantic"
                except Exception as e:
                    logger.warning(f"Semantic fallback failed: {e}")

        total = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_items = filtered.iloc[start_idx:end_idx]

        recipes = []
        for _, row in page_items.iterrows():
            ingredients = []
            try:
                ingredients = json.loads(row['ingredients_json'])
            except Exception:
                pass
            tokens = []
            try:
                tokens = json.loads(row['tokens_json'])
            except Exception:
                pass

            matched_vid = self.find_matching_video(row['title'], row['cuisine'], row['diet'])

            rec_id = row['recipe_id']
            match_type = "semantic" if (search_mode == "semantic" and rec_id in semantic_scores) else "keyword"

            recipes.append({
                "recipe_id": rec_id,
                "title": row['title'],
                "course": row['course'],
                "diet": row['diet'],
                "cuisine": row['cuisine'],
                "cooking_time_mins": int(row['cooking_time_mins']),
                "ingredient_count": int(row['ingredient_count']),
                "ingredients": ingredients,
                "tokens": tokens,
                "instructions": str(row['instructions']),
                "image_name": str(row['image_name']),
                "video": matched_vid,
                "match_type": match_type,
                "similarity_score": round(float(semantic_scores.get(rec_id, 1.0)), 3) if match_type == "semantic" else None
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            "is_sample_mode": self.is_sample_mode,
            "search_mode": search_mode,
            "query": query,
            "translated_query": translated_query,
            "detected_lang": detected_lang,
            "recipes": recipes
        }

    def get_recipe_by_id(self, recipe_id: str):
        if self.df is None:
            return None
        match = self.df[self.df['recipe_id'] == recipe_id]
        if match.empty:
            return None
        row = match.iloc[0]
        try:
            ingredients = json.loads(row['ingredients_json'])
        except Exception:
            ingredients = []
        try:
            tokens = json.loads(row['tokens_json'])
        except Exception:
            tokens = []

        return {
            "recipe_id": row['recipe_id'],
            "title": row['title'],
            "course": row['course'],
            "diet": row['diet'],
            "cuisine": row['cuisine'],
            "cooking_time_mins": int(row['cooking_time_mins']),
            "ingredient_count": int(row['ingredient_count']),
            "ingredients": ingredients,
            "tokens": tokens,
            "instructions": str(row['instructions']),
            "image_name": str(row['image_name']),
            "video": self.find_matching_video(row['title'], row['cuisine'], row['diet'])
        }

    def get_videos(self):
        if self.videos_df is None:
            return []
        vids = []
        for _, row in self.videos_df.iterrows():
            vids.append({
                "id": str(row['id']),
                "title": str(row['title']),
                "channel": str(row['channel']),
                "duration": str(row['duration']),
                "thumbnail_url": str(row['thumbnail_url']),
                "video_url": str(row['video_url']),
                "cuisine": str(row['cuisine']),
                "diet": str(row['diet']),
                "recipe_match": str(row['recipe_match']),
                "transcript_status": str(row.get('transcript_status', 'available' if str(row.get('transcript', '')) != 'Transcript unavailable' else 'unavailable')),
                "transcript_file": str(row.get('transcript_file', '')),
                "transcript": str(row.get('transcript', 'Transcript unavailable'))
            })
        return vids

    def find_matching_video(self, title: str, cuisine: Optional[str] = None, diet: Optional[str] = None):
        if self.videos_df is None or not title:
            return None
        
        t_clean = str(title).strip()
        t_lower = " " + t_clean.lower() + " "
        
        # Dietary classification check
        diet_str = str(diet).lower().strip() if diet else ""
        is_diet_veg = diet_str in ["vegetarian", "vegan"]
        is_diet_nonveg = diet_str in ["non-vegetarian", "non-veg"]

        veg_keywords = [
            "veg", "vegetable", "vegetables", "vegetarian", "paneer", "tofu", "mushroom", 
            "dal", "lentil", "chana", "aloo", "gobi", "soya", "palak", "kathal", "jackfruit",
            "subz", "sabzi", "pattani", "kofta", "semiya", "peas", "brinjal", "potato"
        ]
        nonveg_keywords = [
            "chicken", "mutton", "fish", "meat", "prawn", "shrimp", 
            "beef", "pork", "lamb", "bacon", "seafood"
        ]
        
        is_explicit_nonveg = is_diet_nonveg or (not is_diet_veg and any(re.search(rf"\b{k}s?\b", t_lower) for k in nonveg_keywords))
        is_explicit_veg = is_diet_veg or (
            any(re.search(rf"\b{k}s?\b", t_lower) for k in veg_keywords) and not is_explicit_nonveg
        )

        # Tier 1: Exact substring match against verified recipe_match, respecting diet
        for _, v in self.videos_df.iterrows():
            rm = str(v.get('recipe_match', '')).lower().strip()
            v_diet = str(v.get('diet', '')).lower().strip()
            if rm and rm in t_lower:
                if (is_explicit_veg or is_diet_veg) and v_diet == "non-vegetarian":
                    continue
                return {
                    "id": str(v['id']),
                    "title": str(v['title']),
                    "channel": str(v['channel']),
                    "duration": str(v['duration']),
                    "thumbnail_url": str(v['thumbnail_url']),
                    "video_url": str(v['video_url'])
                }

        # Tier 2: Priority-ordered canonical culinary dish profiles
        dish_rules = [
            # 1. Explicit Vegetarian Biryani
            (r'veg(?:etabl?e?)?\s*biri?yani|paneer\s*biri?yani|mushroom\s*biri?yani|soya\s*biri?yani|subz\s*biri?yani|pattani\s*biri?yani|kofta\s*biri?yani|aloo\s*biri?yani', 'gYE9zOmJwsg'),
            # 2. General Biryani (Veg Dum Biryani if veg context, else Chicken Dum Biryani)
            (r'biri?yani', 'gYE9zOmJwsg' if (is_explicit_veg or is_diet_veg) else 'DCcVzvotemg'),
            # 3. Chicken Curry / Non-Veg Curries
            (r'chicken\s*curry|chicken\s*gravy|murgh\s*curry|curry\s*chicken|chettinad\s*chicken|punjabi\s*chicken', 'Ei1-YXCJmFc'),
            # 4. Noodles (Veg Hakka Noodles)
            (r'\bnoodles?\b|\bhakka\s*noodles?\b|\bchow\s*mein\b|\bchowmein\b|\blo\s*mein\b|\bramen\b', 'R4GAb4-1l4A'),
            # 5. Pasta (Vegetarian 10-Minute Pasta)
            (r'\bpasta\b|\bspaghetti\b|\bfettuccine\b|\bpenne\b|\brigatoni\b|\blinguine\b|\bmacaroni\b', 'o68_P91c49Q'),
            # 6. Dal Makhani (Vegetarian Black Lentils)
            (r'dal\s*makh[a|n]ni|makhani\s*dal|maa\s*ki\s*dal|black\s*lentil\s*dal', 'mA5XjhdwJHc'),
            # 7. Paneer (Vegetarian)
            (r'paneer|panir', 'aY_hV58N2-A'),
            # 8. General 'veg' / 'vegetable' query fallback
            (r'\bveg\b|\bvegetable\b|\bvegetarian\b', 'gYE9zOmJwsg'),
            # 9. Carbonara (Non-Veg)
            (r'carbonara', '0NX_Y6HjBZI'),
            # 10. Aglio e Olio
            (r'aglio\s*e\s*olio|aglio\s*olio', 'bJUiWdM__Qw'),
            # 11. Pizza
            (r'pizza|margherita', '5A_6RGlM0_s'),
            # 12. Tacos & Mexican Street Food
            (r'\btacos?\b|\bfajitas?\b|\bquesadillas?\b', '2gE8qVbLqV4'),
            # 13. Scrambled Eggs
            (r'scrambled\s*eggs?', 'PUP7U5vTMMg'),
            # 14. Ratatouille
            (r'ratatouille|confit\s*byaldi', 'rB3H0pWbMjg'),
            # 15. Roast Potatoes
            (r'roast(?:ed)?\s*potato(?:es)?|crispy\s*potatoes', '1IszT_zGfKA'),
            # 16. Burgers
            (r'\bburgers?\b|\bcheeseburgers?\b|\bhamburgers?\b', 'iM_KMYulI_s'),
            # 17. French Onion Soup
            (r'onion\s*soup|french\s*onion', 'Ptauy20rLjg'),
            # 18. Chocolate Chip Cookies & Cookies
            (r'chocolate\s*chip\s*cookies?|\bcookies?\b', 'rEdl2Uetpvo'),
            # 19. Beef Bourguignon
            (r'bourguignon|boeuf\s*bourguignon', 'C4HPRQVQMNs'),
            # 20. Shakshuka
            (r'shakshuka|shakshouka', '6cjTrD-s37c'),
            # 21. Hummus
            (r'hummus|hommus', 'aXkyFSSjseo'),
            # 22. Pancakes
            (r'\bpancakes?\b', 'RaLzxZryEoA'),
        ]

        for pat, vid_id in dish_rules:
            if re.search(pat, t_lower):
                match_row = self.videos_df[self.videos_df['id'] == vid_id]
                if not match_row.empty:
                    v = match_row.iloc[0]
                    v_diet = str(v.get('diet', '')).lower().strip()
                    # Dietary safeguard: never attach non-veg video to veg query/recipe
                    if (is_explicit_veg or is_diet_veg) and v_diet == "non-vegetarian":
                        continue
                    return {
                        "id": str(v['id']),
                        "title": str(v['title']),
                        "channel": str(v['channel']),
                        "duration": str(v['duration']),
                        "thumbnail_url": str(v['thumbnail_url']),
                        "video_url": str(v['video_url'])
                    }
        return None

        return None

recipe_service = RecipeService()
