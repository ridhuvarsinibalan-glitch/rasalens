import os
import json
import logging

logger = logging.getLogger("rasalens.mba")

RULES_PATH = os.path.join("evaluation", "results", "mba_rules.json")

class MBAService:
    def __init__(self):
        self.rules = []
        self._load_rules()

    def _load_rules(self):
        if os.path.exists(RULES_PATH):
            try:
                with open(RULES_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.rules = data.get("top_association_rules", [])
                logger.info(f"Loaded {len(self.rules)} MBA association rules.")
            except Exception as e:
                logger.error(f"Error loading MBA rules: {e}")
        else:
            logger.warning(f"MBA rules file missing at {RULES_PATH}")

    def recommend(self, seed_ingredients, top_n: int = 5):
        clean_seeds = {i.lower().strip() for i in seed_ingredients if i.strip()}
        if not clean_seeds:
            return {"seed_ingredients": [], "recommendations": [], "matching_rules": []}

        matches = []
        consequent_scores = {}

        for r in self.rules:
            antecedents = set(r["antecedents"])
            # Match if seed contains any antecedent (or subset)
            overlap = clean_seeds.intersection(antecedents)
            if overlap:
                matches.append({
                    "antecedents": r["antecedents"],
                    "consequents": r["consequents"],
                    "support": r["support"],
                    "confidence": r["confidence"],
                    "lift": r["lift"],
                    "reason": f"Matches seeds [{', '.join(overlap)}] (Lift: {r['lift']}, Confidence: {r['confidence']})"
                })
                
                # Aggregate score for each consequent
                for c in r["consequents"]:
                    c_clean = c.lower().strip()
                    if c_clean not in clean_seeds:
                        if c_clean not in consequent_scores:
                            consequent_scores[c_clean] = {
                                "ingredient": c_clean,
                                "total_lift": 0.0,
                                "max_confidence": 0.0,
                                "match_count": 0,
                                "reasons": []
                            }
                        consequent_scores[c_clean]["total_lift"] += r["lift"]
                        consequent_scores[c_clean]["max_confidence"] = max(consequent_scores[c_clean]["max_confidence"], r["confidence"])
                        consequent_scores[c_clean]["match_count"] += 1
                        consequent_scores[c_clean]["reasons"].append(f"Pairs with {', '.join(overlap)} (Lift: {r['lift']})")

        # Rank recommendations by total score
        ranked = sorted(
            consequent_scores.values(),
            key=lambda x: (x["match_count"], x["max_confidence"], x["total_lift"]),
            reverse=True
        )[:top_n]

        # Clean display object
        formatted_recs = []
        for item in ranked:
            formatted_recs.append({
                "ingredient": item["ingredient"],
                "affinity_score": round(item["max_confidence"] * 100, 1),
                "lift": round(item["total_lift"] / item["match_count"], 2),
                "frequency": item["match_count"],
                "pairing_rationale": item["reasons"][0] if item["reasons"] else "Common culinary complement"
            })

        return {
            "seed_ingredients": list(clean_seeds),
            "recommendations": formatted_recs,
            "matching_rules": matches[:10]
        }

    def get_graph(self, course: str = None, cuisine: str = None, top_n: int = 50, min_lift: float = 1.2):
        import pandas as pd
        from collections import Counter
        from itertools import combinations

        csv_path = os.path.join("data", "processed", "recipes_processed.csv")
        if not os.path.exists(csv_path):
            return {"nodes": [], "links": [], "total_recipes": 0}

        df = pd.read_csv(csv_path, usecols=['course', 'cuisine', 'tokens_json'])
        if course and course.lower() != 'all':
            df = df[df['course'].str.lower() == course.lower()]
        if cuisine and cuisine.lower() != 'all':
            df = df[df['cuisine'].str.lower() == cuisine.lower()]

        N = len(df)
        if N == 0:
            return {"nodes": [], "links": [], "total_recipes": 0}

        token_lists = [json.loads(t) for t in df['tokens_json']]

        counts = Counter()
        for tl in token_lists:
            counts.update(set(tl))

        top_ingredients = [item for item, c in counts.most_common(top_n)]
        top_set = set(top_ingredients)

        pair_counts = Counter()
        for tl in token_lists:
            present = top_set.intersection(tl)
            if len(present) > 1:
                for a, b in combinations(sorted(present), 2):
                    pair_counts[(a, b)] += 1

        CATEGORY_MAP = {
            "olive oil": "Fats & Oils", "butter": "Fats & Oils", "vegetable oil": "Fats & Oils", "canola oil": "Fats & Oils", "sesame oil": "Fats & Oils",
            "all-purpose flour": "Baking & Grains", "granulated sugar": "Baking & Grains", "brown sugar": "Baking & Grains", "baking powder": "Baking & Grains", "baking soda": "Baking & Grains", "vanilla extract": "Baking & Grains", "cornstarch": "Baking & Grains", "rolled oats": "Baking & Grains",
            "garlic": "Aromatics & Produce", "onion": "Aromatics & Produce", "lemon juice": "Aromatics & Produce", "lime juice": "Aromatics & Produce", "yellow onion": "Aromatics & Produce", "shallot": "Aromatics & Produce", "ginger": "Aromatics & Produce", "scallion": "Aromatics & Produce", "cilantro": "Aromatics & Produce", "parsley": "Aromatics & Produce", "tomato": "Aromatics & Produce",
            "salt": "Spices & Seasonings", "black pepper": "Spices & Seasonings", "kosher salt": "Spices & Seasonings", "ground cumin": "Spices & Seasonings", "paprika": "Spices & Seasonings", "dried oregano": "Spices & Seasonings", "chili powder": "Spices & Seasonings", "cinnamon": "Spices & Seasonings",
            "egg": "Dairy & Protein", "milk": "Dairy & Protein", "heavy cream": "Dairy & Protein", "parmesan": "Dairy & Protein", "cheddar": "Dairy & Protein", "sour cream": "Dairy & Protein", "chicken broth": "Dairy & Protein", "cream cheese": "Dairy & Protein",
            "soy sauce": "Condiments & Sauces", "dijon mustard": "Condiments & Sauces", "mayonnaise": "Condiments & Sauces", "worcestershire sauce": "Condiments & Sauces", "honey": "Condiments & Sauces", "maple syrup": "Condiments & Sauces"
        }

        nodes = []
        for ing in top_ingredients:
            c = counts[ing]
            nodes.append({
                "id": ing,
                "label": ing.title(),
                "val": c,
                "support": round(c / N, 4),
                "frequency": c,
                "category": CATEGORY_MAP.get(ing, "Pantry & Seasonings")
            })

        links = []
        for (a, b), cnt in pair_counts.items():
            supp_ab = cnt / N
            supp_a = counts[a] / N
            supp_b = counts[b] / N
            lift = supp_ab / (supp_a * supp_b)
            if lift >= min_lift:
                conf_a_b = supp_ab / supp_a
                conf_b_a = supp_ab / supp_b
                links.append({
                    "source": a,
                    "target": b,
                    "co_occurrence": cnt,
                    "support": round(supp_ab, 4),
                    "confidence": round(max(conf_a_b, conf_b_a), 4),
                    "lift": round(lift, 2)
                })

        links.sort(key=lambda x: x["lift"], reverse=True)

        return {
            "nodes": nodes,
            "links": links[:120],  # Top 120 strong links for optimal force layout clarity
            "total_recipes": N,
            "filter": {
                "course": course or "All",
                "cuisine": cuisine or "All",
                "min_lift": min_lift,
                "top_n": top_n
            }
        }

mba_service = MBAService()
