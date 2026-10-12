from fastapi import APIRouter, HTTPException
from backend.schemas.models import TranslationRequest, TranslationResponse
from backend.services.translation_service import translation_service, LANG_DISPLAY_NAMES, NLLB_LANG_MAP

router = APIRouter(prefix="/api/translation", tags=["Multilingual NLP"])

@router.get("/info")
def get_translation_info():
    return {
        "model_name": translation_service.model_name,
        "is_model_loaded": translation_service._is_loaded,
        "supported_languages": LANG_DISPLAY_NAMES,
        "code_mappings": NLLB_LANG_MAP
    }

@router.post("/translate", response_model=TranslationResponse)
def translate_text(request: TranslationRequest):
    try:
        return translation_service.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
