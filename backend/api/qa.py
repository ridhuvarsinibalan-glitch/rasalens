from fastapi import APIRouter
from backend.schemas.models import QARequest, QAResponse
from backend.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["QA / RAG"])

@router.post("/qa", response_model=QAResponse)
def culinary_qa(request: QARequest):
    return rag_service.query(request.query, request.top_k)
