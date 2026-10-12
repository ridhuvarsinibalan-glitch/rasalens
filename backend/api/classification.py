from fastapi import APIRouter
from backend.schemas.models import ClassificationRequest, ClassificationResponse
from backend.services.classifier_service import classifier_service

router = APIRouter(prefix="/api", tags=["Classification"])

@router.post("/classify", response_model=ClassificationResponse)
def classify_text(request: ClassificationRequest):
    return classifier_service.predict(request.text)
