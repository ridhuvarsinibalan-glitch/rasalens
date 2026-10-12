import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/api/evaluation", tags=["Model Lab & Evaluation"])

NER_METRICS = os.path.join("evaluation", "results", "ner_metrics.json")
CLF_METRICS = os.path.join("evaluation", "results", "classification_metrics.json")
MBA_METRICS = os.path.join("evaluation", "results", "mba_rules.json")
QA_METRICS = os.path.join("evaluation", "results", "qa_metrics.json")
QUALITY_METRICS = os.path.join("evaluation", "results", "data_quality_metrics.json")
TRANSLATION_METRICS = os.path.join("evaluation", "results", "translation_metrics.json")

def load_json(path):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

@router.get("")
def get_all_evaluation_metrics():
    return {
        "ner": load_json(NER_METRICS),
        "classification": load_json(CLF_METRICS),
        "market_basket": load_json(MBA_METRICS),
        "qa_retrieval": load_json(QA_METRICS),
        "data_quality": load_json(QUALITY_METRICS),
        "translation": load_json(TRANSLATION_METRICS)
    }
