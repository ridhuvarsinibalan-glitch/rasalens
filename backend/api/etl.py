import os
import json
from fastapi import APIRouter
from backend.services.recipe_service import recipe_service
from data.scripts.etl_pipeline import run_etl

router = APIRouter(prefix="/api/etl", tags=["ETL & Data Quality"])

METRICS_PATH = os.path.join("evaluation", "results", "data_quality_metrics.json")

@router.get("/status")
def get_etl_status():
    metrics = {}
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                metrics = json.load(f)
        except Exception:
            pass
            
    return {
        "status": "active",
        "is_sample_mode": recipe_service.is_sample_mode,
        "total_recipes_loaded": len(recipe_service.df) if recipe_service.df is not None else 0,
        "metrics": metrics
    }

@router.post("/run")
def trigger_etl():
    run_etl()
    recipe_service._load_data()
    return {"message": "ETL pipeline executed successfully", "status": get_etl_status()}
