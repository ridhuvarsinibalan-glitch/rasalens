from fastapi import APIRouter
from backend.services.recipe_service import recipe_service
from backend.services.ner_service import ner_service
from backend.services.classifier_service import classifier_service

router = APIRouter(prefix="/api/videos", tags=["Video Intelligence"])

@router.get("")
def list_videos():
    return recipe_service.get_videos()

@router.get("/{video_id}/analyze")
def analyze_video(video_id: str):
    videos = recipe_service.get_videos()
    matched = next((v for v in videos if v['id'] == video_id), None)
    if not matched:
        return {"error": f"Video '{video_id}' not found"}

    # Run NLP on video transcript only if real transcript is available
    has_real_transcript = (
        matched.get('transcript_status') == 'available'
        and matched.get('transcript')
        and matched['transcript'] != 'Transcript unavailable'
    )
    
    extracted_ingredients = []
    if has_real_transcript:
        ner_res = ner_service.process(matched['transcript'], model_choice="custom_spacy")
        extracted_ingredients = ner_res.get("extracted_ingredients", [])[:12]

    clf_res = classifier_service.predict(matched['title'])

    return {
        "video": matched,
        "transcript_status": matched.get('transcript_status', 'unavailable'),
        "extracted_ingredients": extracted_ingredients,
        "course_classification": clf_res["predicted_course"],
        "confidence": clf_res["confidence"]
    }
