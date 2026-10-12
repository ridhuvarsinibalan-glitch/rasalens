from typing import Optional
from fastapi import APIRouter
from backend.schemas.models import MBARequest, MBAResponse
from backend.services.mba_service import mba_service

router = APIRouter(prefix="/api", tags=["Market Basket Analysis"])

@router.post("/market-basket", response_model=MBAResponse)
def get_associations(request: MBARequest):
    return mba_service.recommend(request.ingredients, request.top_n)

@router.get("/market-basket/graph")
def get_ingredient_graph(
    course: Optional[str] = None,
    cuisine: Optional[str] = None,
    top_n: int = 50,
    min_lift: float = 1.2
):
    return mba_service.get_graph(course=course, cuisine=cuisine, top_n=top_n, min_lift=min_lift)
