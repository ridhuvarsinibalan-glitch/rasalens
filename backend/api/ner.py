from fastapi import APIRouter, HTTPException, status
from backend.schemas.models import NERRequest, NERResponse
from backend.services.ner_service import ner_service

router = APIRouter(prefix="/api", tags=["NER"])

@router.post("/ner", response_model=NERResponse)
def analyze_ner(request: NERRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Text cannot be empty"
        )
    result = ner_service.process(request.text, request.model_choice)
    return result
