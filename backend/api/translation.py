import re
from fastapi import APIRouter, HTTPException
from backend.schemas.models import TranslationRequest, TranslationResponse
from backend.services.translation_service import translation_service, LANG_DISPLAY_NAMES, NLLB_LANG_MAP

router = APIRouter(prefix="/api/translation", tags=["Multilingual NLP"])

def post_align_tamil(text: str, source_text: str) -> str:
    src_lower = source_text.lower()
    # Hot mustard oil
    text = re.sub(r'வெப்பமான\s+கடுகு\s+எண்ணெய்(?:இல்|ல்)?', 'சூடான கடுகு எண்ணெயில்', text)
    text = re.sub(r'வெப்பமான\s+எண்ணெய்(?:இல்|ல்)?', 'சூடான எண்ணெயில்', text)
    text = text.replace('வெப்பமான கடுகு எண்ணெயில்', 'சூடான கடுகு எண்ணெயில்')
    text = text.replace('வெப்பமான எண்ணெயில்', 'சூடான எண்ணெயில்')
    text = text.replace('வெப்பமான எண்ணெய்', 'சூடான எண்ணெய்')
    
    # Turmeric hallucinations (கர்பிக்குடன், கர்பியுடன், etc.)
    if 'turmeric' in src_lower:
        if 'with turmeric' in src_lower:
            text = re.sub(r'கர்பிக்குடன்|கர்பியுடன்|கர்பி[^\s]*டன்|துளசியுடன்|துளசி[^\s]*டன்|கர்முனையுடன்', 'மஞ்சளுடன்', text)
        text = re.sub(r'கர்பிக்குடன்|கர்பியுடன்|கர்பிக்கு|கர்பிக்[^\s]*|கர்பி[^\s]*', 'மஞ்சளுடன்' if 'with turmeric' in src_lower else 'மஞ்சள்', text)
        text = re.sub(r'துளசி\s*(?:பவுடர்|தூள்|ப்பொடி)?|கர்முனை[^\s]*', 'மஞ்சள் தூள்', text)
        
    # Onions vs Chili / Pepper
    has_onion = ('onion' in src_lower or 'onions' in src_lower)
    has_chili = any(k in src_lower for k in ['chili', 'chilli', 'pepper', 'capsicum', 'mirch'])
    if has_onion and not has_chili:
        text = re.sub(r'மிளகாய்\s+மற்றும்\s+தக்காளிகளை', 'வெங்காயம் மற்றும் தக்காளிகளை', text)
        text = re.sub(r'மிளகாய்\s+மற்றும்\s+தக்காளியை', 'வெங்காயம் மற்றும் தக்காளியை', text)
        text = re.sub(r'மிளகாய்\s+மற்றும்\s+தக்காளி', 'வெங்காயம் மற்றும் தக்காளி', text)
        text = text.replace('மிளகாயை', 'வெங்காயத்தை')
        text = text.replace('மிளகாய் மற்றும்', 'வெங்காயம் மற்றும்')
        text = text.replace('மிளகாயுடன்', 'வெங்காயத்துடன்')
        text = text.replace('மிளகாயில்', 'வெங்காயத்தில்')
        text = re.sub(r'\bமிளகாய்\b', 'வெங்காயம்', text)
        
    return text

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
        res = translation_service.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
        src = res.get("detected_lang", "eng_Latn")
        tgt = res.get("target_lang", "tam_Taml")
        aligned = translation_service._align_culinary_terminology(res["translated_text"], request.text, src, tgt)
        if tgt in ["tam_Taml", "ta"]:
            aligned = post_align_tamil(aligned, request.text)
        res["translated_text"] = aligned
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
