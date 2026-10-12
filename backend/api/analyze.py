import logging
from fastapi import APIRouter
from backend.schemas.models import AnalyzeStudioRequest, AnalyzeStudioResponse, EntityItem, RetrievedRecipe
from backend.services.ner_service import ner_service
from backend.services.classifier_service import classifier_service
from backend.services.mba_service import mba_service
from backend.services.rag_service import rag_service
from backend.services.translation_service import translation_service
from backend.services.recipe_service import recipe_service
from data.scripts.etl_pipeline import infer_cuisine, infer_diet

logger = logging.getLogger("rasalens.analyze")
router = APIRouter(prefix="/api/analyze", tags=["Analyze Studio"])

@router.post("", response_model=AnalyzeStudioResponse)
def analyze_studio_pipeline(request: AnalyzeStudioRequest):
    # 1. Determine working text based on input mode
    raw_input = ""
    if request.input_mode == "chips" and request.chips:
        raw_input = ", ".join(request.chips)
    elif request.input_mode == "file" and request.file_content:
        raw_input = request.file_content.strip()
    elif request.text:
        raw_input = request.text.strip()
    else:
        raw_input = "tomato, onion, garlic"

    # 2. Check for multilingual input (Tamil, Hindi) and translate to English for NLP pipeline
    detected_code = translation_service.detect_language(raw_input)
    working_query = raw_input
    translated_text = None
    
    code_to_simple = {
        "tam_Taml": "ta",
        "hin_Deva": "hi",
        "eng_Latn": "en"
    }
    simple_detected = code_to_simple.get(detected_code, "en")
    
    if detected_code in ["tam_Taml", "hin_Deva"]:
        try:
            trans_res = translation_service.translate(raw_input, source_lang=detected_code, target_lang="eng_Latn")
            working_query = trans_res.get("translated_text", raw_input)
            translated_text = working_query
        except Exception as e:
            logger.warning(f"Failed to translate query to English: {e}")

    # 3. Run Custom spaCy NER
    ner_output = ner_service.process(working_query, model_choice="custom_spacy")
    custom_ents = ner_output["results"].get("custom_spacy", {}).get("entities", [])
    extracted_ingredients = ner_output["extracted_ingredients"]

    # Fallback to chips if no food entities found
    if not extracted_ingredients and request.chips:
        extracted_ingredients = [c.lower().strip() for c in request.chips]

    # 4. Run Course Classifier
    clf_output = classifier_service.predict(working_query)
    inferred_course = clf_output["predicted_course"]

    # 5. Run Cuisine & Diet inference
    inferred_cuisine = infer_cuisine(working_query, extracted_ingredients)
    inferred_diet = infer_diet(extracted_ingredients) if extracted_ingredients else "Vegetarian"

    # 6. Run Market Basket Analysis for ingredient associations
    mba_output = mba_service.recommend(extracted_ingredients, top_n=6)
    associated = mba_output["recommendations"]

    # 7. Run Semantic Retrieval / RAG
    rag_output = rag_service.query(working_query, top_k=6)
    retrieved = [RetrievedRecipe(**r) for r in rag_output["retrieved_recipes"]]
    grounded_answer = rag_output["grounded_answer"]

    # 8. Match verified video respecting dietary categorization
    matched_video = recipe_service.find_matching_video(working_query, inferred_cuisine, inferred_diet)

    return AnalyzeStudioResponse(
        normalized_query=working_query,
        original_input=raw_input,
        detected_language=simple_detected,
        translated_query=translated_text,
        extracted_entities=[EntityItem(**e) for e in custom_ents],
        inferred_course=inferred_course,
        inferred_cuisine=inferred_cuisine,
        dietary_classification=inferred_diet,
        associated_ingredients=associated,
        recommended_recipes=retrieved,
        grounded_answer=grounded_answer,
        matched_video=matched_video
    )
