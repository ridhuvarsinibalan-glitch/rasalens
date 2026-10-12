from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    is_sample_mode: bool
    dataset_records: int
    models_loaded: Dict[str, bool]
    cpu_only: bool = True

class NERRequest(BaseModel):
    text: str = Field(..., description="Culinary sentence or ingredient list")
    model_choice: str = Field("all", description="'all', 'custom_spacy', 'generic_spacy', or 'rule_based'")

class EntityItem(BaseModel):
    text: str
    label: str
    start: int
    end: int

class NERModelResult(BaseModel):
    model_name: str
    entities: List[EntityItem]
    latency_ms: float

class NERResponse(BaseModel):
    query: str
    results: Dict[str, NERModelResult]
    extracted_ingredients: List[str]

class ClassificationRequest(BaseModel):
    text: str = Field(..., description="Recipe title or ingredient combination to classify")

class ClassificationResponse(BaseModel):
    input_text: str
    predicted_course: str
    confidence: Optional[float] = None
    all_probabilities: Optional[Dict[str, float]] = None
    latency_ms: float

class MBARequest(BaseModel):
    ingredients: List[str] = Field(..., description="List of seed ingredients (e.g. ['tomato', 'garlic'])")
    top_n: int = Field(5, description="Number of associated recommendations to return")

class MBARuleMatch(BaseModel):
    antecedents: List[str]
    consequents: List[str]
    support: float
    confidence: float
    lift: float
    reason: str

class MBAResponse(BaseModel):
    seed_ingredients: List[str]
    recommendations: List[Dict[str, Any]]
    matching_rules: List[MBARuleMatch]

class QARequest(BaseModel):
    query: str = Field(..., description="Culinary question, recipe search, or substitution inquiry")
    top_k: int = Field(5, description="Number of context recipes to retrieve")

class RetrievedRecipe(BaseModel):
    recipe_id: str
    title: str
    course: str
    cuisine: str
    diet: str
    cooking_time_mins: int
    ingredients: List[str]
    instructions_snippet: str
    similarity_score: float

class QAResponse(BaseModel):
    query: str
    grounded_answer: str
    retrieved_recipes: List[RetrievedRecipe]
    source_attribution: List[str]
    latency_ms: float
    is_llm_enhanced: bool = False
    confidence_threshold: float = 0.40
    is_grounded: bool = True

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text in English, Tamil, or Hindi to translate")
    source_lang: Optional[str] = Field(None, description="'en'/'eng_Latn', 'ta'/'tam_Taml', 'hi'/'hin_Deva', or auto-detect")
    target_lang: Optional[str] = Field(None, description="'en'/'eng_Latn', 'ta'/'tam_Taml', or 'hi'/'hin_Deva'")

class TranslationResponse(BaseModel):
    original_text: str
    detected_lang: str
    target_lang: str
    translated_text: str
    latency_ms: float

class AnalyzeStudioRequest(BaseModel):
    input_mode: str = Field("text", description="'text', 'chips', or 'file'")
    text: Optional[str] = None
    chips: Optional[List[str]] = None
    file_content: Optional[str] = None
    language: Optional[str] = "en"

class AnalyzeStudioResponse(BaseModel):
    normalized_query: str
    original_input: str
    detected_language: str
    translated_query: Optional[str] = None
    extracted_entities: List[EntityItem]
    inferred_course: str
    inferred_cuisine: str
    dietary_classification: str
    associated_ingredients: List[Dict[str, Any]]
    recommended_recipes: List[RetrievedRecipe]
    grounded_answer: str
    matched_video: Optional[Dict[str, Any]] = None
