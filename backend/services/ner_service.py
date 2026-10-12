import os
import re
import time
import logging
import spacy

logger = logging.getLogger("rasalens.ner")

CUSTOM_MODEL_PATH = os.path.join("models", "spacy_ner")

COMMON_UNITS = {
    'tsp', 'tsps', 'teaspoon', 'teaspoons', 'tbsp', 'tbsps', 'tablespoon', 'tablespoons',
    'cup', 'cups', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds', 'gram', 'grams',
    'g', 'kg', 'ml', 'clove', 'cloves', 'pinch', 'pinches', 'dash', 'bunch', 'bunches',
    'slice', 'slices', 'can', 'cans', 'piece', 'pieces', 'stalk', 'stalks', 'sprig', 'sprigs'
}

class NERService:
    def __init__(self):
        self.custom_nlp = None
        self.generic_nlp = None
        self._load_models()

    def _load_models(self):
        # 1. Load Custom Trained spaCy model
        if os.path.exists(CUSTOM_MODEL_PATH):
            try:
                self.custom_nlp = spacy.load(CUSTOM_MODEL_PATH)
                logger.info("Custom spaCy NER model loaded.")
            except Exception as e:
                logger.warning(f"Failed to load custom spaCy NER model: {e}")
                
        # 2. Load Generic spaCy model
        try:
            self.generic_nlp = spacy.load("en_core_web_sm")
            logger.info("Generic spaCy en_core_web_sm loaded.")
        except Exception as e:
            logger.warning(f"Failed to load generic spaCy: {e}")

    def rule_based_extract(self, text: str):
        t0 = time.time()
        entities = []
        lower = text.lower()
        
        # Match quantities
        qty_match = re.search(r"^([\d¼½¾⅓⅔⅛⅜⅝⅞/.-]+(?:\s*-\s*[\d¼½¾⅓⅔⅛⅜⅝⅞/.-]+)?(?:\s+[\d¼½¾⅓⅔⅛⅜⅝⅞/.-]+)?)", text)
        unit_end = 0
        if qty_match:
            s, e = qty_match.span(1)
            entities.append({"text": text[s:e], "label": "QUANTITY", "start": s, "end": e})
            unit_end = e
            
        # Match units
        for u in sorted(COMMON_UNITS, key=len, reverse=True):
            pat = rf"\b{u}\b"
            m = re.search(pat, lower)
            if m and m.start() >= unit_end:
                s, e = m.span()
                entities.append({"text": text[s:e], "label": "UNIT", "start": s, "end": e})
                unit_end = max(unit_end, e)
                break
                
        # Match food item
        rest = text[unit_end:].strip()
        if rest:
            clean_food = re.split(r"[,;]|\bdivided\b|\bto taste\b", rest)[0].strip()
            clean_food = re.sub(r"^(?:[,\s(]+|plus\b|of\b|divided\b)+", "", clean_food).strip()
            if len(clean_food) >= 2:
                idx = text.find(clean_food)
                if idx != -1:
                    entities.append({"text": clean_food, "label": "FOOD_ITEM", "start": idx, "end": idx + len(clean_food)})
                    
        latency = round((time.time() - t0) * 1000, 2)
        return {"model_name": "Rule-based Regex Heuristic", "entities": entities, "latency_ms": latency}

    def generic_spacy_extract(self, text: str):
        t0 = time.time()
        entities = []
        if self.generic_nlp:
            doc = self.generic_nlp(text)
            for ent in doc.ents:
                if ent.label_ in ("CARDINAL", "QUANTITY"):
                    entities.append({"text": ent.text, "label": "QUANTITY", "start": ent.start_char, "end": ent.end_char})
            for chunk in doc.noun_chunks:
                if not any(s["start"] <= chunk.start_char < s["end"] for s in entities):
                    entities.append({"text": chunk.text, "label": "FOOD_ITEM", "start": chunk.start_char, "end": chunk.end_char})
        latency = round((time.time() - t0) * 1000, 2)
        return {"model_name": "Generic spaCy (en_core_web_sm)", "entities": entities, "latency_ms": latency}

    def custom_spacy_extract(self, text: str):
        t0 = time.time()
        entities = []
        if self.custom_nlp:
            doc = self.custom_nlp(text)
            for ent in doc.ents:
                entities.append({"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char})
        else:
            # Fallback to rule-based if model not yet loaded
            return self.rule_based_extract(text)
        latency = round((time.time() - t0) * 1000, 2)
        return {"model_name": "Custom Fine-tuned RasaLens spaCy NER", "entities": entities, "latency_ms": latency}

    def process(self, text: str, model_choice: str = "all"):
        results = {}
        if model_choice in ("all", "custom_spacy"):
            results["custom_spacy"] = self.custom_spacy_extract(text)
        if model_choice in ("all", "generic_spacy"):
            results["generic_spacy"] = self.generic_spacy_extract(text)
        if model_choice in ("all", "rule_based"):
            results["rule_based"] = self.rule_based_extract(text)
            
        # Compile unique extracted food items
        food_items = set()
        if "custom_spacy" in results and results["custom_spacy"]:
            for ent in results["custom_spacy"].get("entities", []):
                if ent["label"] == "FOOD_ITEM":
                    food_items.add(ent["text"].lower().strip())
        else:
            for res in results.values():
                for ent in res.get("entities", []):
                    if ent["label"] == "FOOD_ITEM":
                        food_items.add(ent["text"].lower().strip())
                    
        return {
            "query": text,
            "results": results,
            "extracted_ingredients": sorted(list(food_items))
        }

ner_service = NERService()
