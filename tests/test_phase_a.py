import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models_loaded" in data
    assert data["dataset_records"] > 0

def test_etl_status():
    response = client.get("/api/etl/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert "metrics" in data

def test_ner_endpoint():
    payload = {
        "text": "2 cups diced tomatoes and 1 tbsp butter",
        "model_choice": "all"
    }
    response = client.post("/api/ner", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "custom_spacy" in data["results"]
    assert "extracted_ingredients" in data

def test_classification_endpoint():
    payload = {"text": "Decadent Chocolate Fudge Brownie Cake"}
    response = client.post("/api/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_course"] == "Dessert"
    assert data["confidence"] > 0

def test_market_basket_endpoint():
    payload = {
        "ingredients": ["sugar", "flour"],
        "top_n": 5
    }
    response = client.post("/api/market-basket", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0

def test_qa_endpoint():
    payload = {
        "query": "How to make creamy tomato curry",
        "top_k": 3
    }
    response = client.post("/api/qa", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["retrieved_recipes"]) > 0
    assert "grounded_answer" in data

def test_recipes_endpoints():
    # List recipes
    response = client.get("/api/recipes?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["recipes"]) == 5
    first_id = data["recipes"][0]["recipe_id"]
    
    # Recipe detail
    detail_res = client.get(f"/api/recipes/{first_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["recipe_id"] == first_id

def test_videos_endpoint():
    response = client.get("/api/videos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5

def test_evaluation_metrics_endpoint():
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["ner"] is not None
    assert data["classification"] is not None
    assert data["market_basket"] is not None
    assert data["qa_retrieval"] is not None

def test_translation_endpoint():
    payload = {"text": "தக்காளி மற்றும் வெங்காயம்"}
    response = client.post("/api/translation/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tomato" in data["translated_text"].lower()

def test_analyze_studio_endpoint():
    payload = {
        "input_mode": "text",
        "text": "I have two tomatoes, one onion and garlic"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_entities" in data
    assert "recommended_recipes" in data
    assert len(data["recommended_recipes"]) > 0

def test_veg_video_alignment_dietary_safeguard():
    # 1. Search for veg / veg biryani
    res = client.get("/api/recipes?q=veg%20biriyani&diet=Vegetarian")
    assert res.status_code == 200
    data = res.json()
    for rec in data.get("recipes", []):
        assert rec["diet"].lower() in ["vegetarian", "vegan"]
        if rec.get("video"):
            assert "chicken" not in rec["video"]["title"].lower()

    # 2. Recipe detail for a vegetarian biryani recipe
    detail_res = client.get("/api/recipes/rec_13498")
    assert detail_res.status_code == 200
    rec_detail = detail_res.json()
    assert rec_detail["diet"] == "Vegetarian"
    if rec_detail.get("video"):
        assert "chicken" not in rec_detail["video"]["title"].lower()
        assert rec_detail["video"]["title"] == "Lucknowi Vegetable Dum Biryani"

if __name__ == "__main__":
    print("Running automated backend verification tests...")
    test_root()
    print("[PASS] Root endpoint verified.")
    test_health()
    print("[PASS] Health endpoint verified.")
    test_etl_status()
    print("[PASS] ETL status verified.")
    test_ner_endpoint()
    print("[PASS] NER endpoint verified.")
    test_classification_endpoint()
    print("[PASS] Classification endpoint verified.")
    test_market_basket_endpoint()
    print("[PASS] Market Basket Analysis endpoint verified.")
    test_qa_endpoint()
    print("[PASS] QA / RAG endpoint verified.")
    test_recipes_endpoints()
    print("[PASS] Recipes listing & detail verified.")
    test_videos_endpoint()
    print("[PASS] Videos catalog verified.")
    test_evaluation_metrics_endpoint()
    print("[PASS] Evaluation metrics verified.")
    test_translation_endpoint()
    print("[PASS] Multilingual translation verified.")
    test_analyze_studio_endpoint()
    print("[PASS] Analyze Studio pipeline verified.")
    test_veg_video_alignment_dietary_safeguard()
    print("[PASS] Veg video alignment dietary safeguard verified.")
    print("\nALL 12 BACKEND API SUITES PASSED WITH 100% SUCCESS!")
