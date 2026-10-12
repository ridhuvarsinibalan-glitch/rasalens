from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.services.recipe_service import recipe_service

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

@router.get("")
def list_recipes(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    q: Optional[str] = None,
    query: Optional[str] = None,
    course: Optional[str] = None,
    diet: Optional[str] = None,
    cuisine: Optional[str] = None
):
    search_query = q or query
    return recipe_service.get_recipes(
        page=page,
        page_size=page_size,
        query=search_query,
        course=course,
        diet=diet,
        cuisine=cuisine
    )

@router.get("/{recipe_id}")
def get_recipe_detail(recipe_id: str):
    recipe = recipe_service.get_recipe_by_id(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail=f"Recipe '{recipe_id}' not found")
    return recipe
