import os
from fastapi import APIRouter
from backend.schemas.models import HealthResponse
from backend.services.recipe_service import recipe_service
from backend.services.ner_service import ner_service
from backend.services.classifier_service import classifier_service
from backend.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    dataset_count = len(recipe_service.df) if recipe_service.df is not None else 0
    
    models_status = {
        "custom_spacy_ner": ner_service.custom_nlp is not None,
        "generic_spacy": ner_service.generic_nlp is not None,
        "course_classifier": classifier_service.pipeline is not None,
        "faiss_vector_index": rag_service.index is not None,
        "sentence_transformers": rag_service.embedder is not None
    }
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        is_sample_mode=recipe_service.is_sample_mode,
        dataset_records=dataset_count,
        models_loaded=models_status,
        cpu_only=True
    )
