"""
RasaLens Comprehensive Hardening & Audit Verification Test Suite.

Covers:
(a) NER extraction on known sentences (ingredient, quantity, unit extraction).
(b) Ingredient token normalization (multiword preservation, zero garbage tokens).
(c) MBA support, confidence, lift calculation against hand-computed values on a toy transaction set.
(d) Vector retrieval returns expected recipe for a known title/query from FAISS.
(e) FastAPI endpoints return 200 with valid schema, and 404 for nonexistent recipe ID.
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# (a) NER extraction on known sentences
# ---------------------------------------------------------------------------
def test_ner_extraction_known_sentences():
    from backend.services.ner_service import ner_service
    
    test_text = "Add 2 cups of chopped onions and 1 tablespoon of olive oil into the skillet."
    
    # 1. Test Rule-based NER on recipe ingredient line
    ingredient_line = "2 cups chopped onions"
    rule_res = ner_service.rule_based_extract(ingredient_line)
    rule_entities = rule_res["entities"]
    rule_labels = {e["label"] for e in rule_entities}
    rule_texts = {e["text"].lower() for e in rule_entities}
    
    assert "FOOD_ITEM" in rule_labels or "INGREDIENT" in rule_labels, "Rule NER should extract food/ingredient"
    assert "QUANTITY" in rule_labels, "Rule NER should extract QUANTITY"
    assert "UNIT" in rule_labels, "Rule NER should extract UNIT"
    assert "2" in rule_texts
    assert "cups" in rule_texts

    # 2. Test Custom spaCy NER Service on full culinary sentence
    all_ents = ner_service.process(test_text, model_choice="all")
    assert "results" in all_ents
    assert "custom_spacy" in all_ents["results"]
    custom_ents = all_ents["results"]["custom_spacy"]["entities"]
    assert len(custom_ents) > 0, "Custom spaCy should extract entities from known culinary sentence"


# ---------------------------------------------------------------------------
# (b) Ingredient token normalization & garbage removal
# ---------------------------------------------------------------------------
def test_ingredient_token_normalization():
    from data.scripts.etl_pipeline import extract_ingredient_token, COOKING_STOPWORDS
    
    raw_lines = [
        "2 tablespoons extra-virgin olive oil",
        "1 tsp baking powder",
        "fresh basil leaves, removed and sliced into wedges",
        "1/2 cup soy sauce"
    ]
    
    tokens = [extract_ingredient_token(line) for line in raw_lines]
    tokens = [t for t in tokens if t]
    
    # Check multiword preservation and canonical mapping
    assert "olive oil" in tokens, f"Expected 'olive oil' preserved as multiword, got {tokens}"
    assert "baking powder" in tokens, f"Expected 'baking powder' preserved as multiword, got {tokens}"
    assert "soy sauce" in tokens, f"Expected 'soy sauce' preserved as multiword, got {tokens}"
    assert "basil" in tokens, f"Expected 'basil' in tokens, got {tokens}"
    
    # Check garbage tokens are NOT present
    garbage_tokens = {"leav", "flak", "wedg", "into", "removed", "and", "serving", "lengthwise", "stem", "inch", "cub"}
    found_garbage = set(tokens).intersection(garbage_tokens)
    assert len(found_garbage) == 0, f"Found forbidden garbage tokens in output: {found_garbage}"


# ---------------------------------------------------------------------------
# (c) MBA support, confidence, lift calculation against hand-computed values
# ---------------------------------------------------------------------------
def test_mba_hand_computed_toy_dataset():
    """
    Toy dataset of 5 baskets:
    B1: ["bread", "butter", "milk"]
    B2: ["bread", "butter"]
    B3: ["bread", "milk"]
    B4: ["butter", "jam"]
    B5: ["bread", "butter", "jam"]
    
    Total transactions N = 5.
    count("bread") = 4 -> supp("bread") = 4/5 = 0.8
    count("butter") = 4 -> supp("butter") = 4/5 = 0.8
    count("milk") = 2 -> supp("milk") = 2/5 = 0.4
    count("bread", "butter") = 3 (B1, B2, B5) -> supp = 3/5 = 0.6
    count("bread", "milk") = 2 (B1, B3) -> supp = 2/5 = 0.4

    Rule: "bread" -> "butter":
      support = 0.6
      confidence = supp("bread", "butter") / supp("bread") = 0.6 / 0.8 = 0.75
      lift = supp("bread", "butter") / (supp("bread") * supp("butter")) = 0.6 / (0.8 * 0.8) = 0.6 / 0.64 = 0.9375

    Rule: "milk" -> "bread":
      support = 0.4
      confidence = supp("bread", "milk") / supp("milk") = 0.4 / 0.4 = 1.0
      lift = supp("bread", "milk") / (supp("bread") * supp("milk")) = 0.4 / (0.8 * 0.4) = 0.4 / 0.32 = 1.25
    """
    from mlxtend.preprocessing import TransactionEncoder
    from mlxtend.frequent_patterns import apriori, association_rules

    toy_baskets = [
        ["bread", "butter", "milk"],
        ["bread", "butter"],
        ["bread", "milk"],
        ["butter", "jam"],
        ["bread", "butter", "jam"]
    ]

    te = TransactionEncoder()
    te_ary = te.fit(toy_baskets).transform(toy_baskets)
    df = pd.DataFrame(te_ary, columns=te.columns_)

    frequent_itemsets = apriori(df, min_support=0.3, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)

    # 1. Verify "bread" -> "butter"
    rule_bread_butter = rules[
        (rules["antecedents"] == frozenset({"bread"})) & 
        (rules["consequents"] == frozenset({"butter"}))
    ]
    assert len(rule_bread_butter) == 1, "Rule 'bread' -> 'butter' not found"
    row1 = rule_bread_butter.iloc[0]
    assert np.isclose(row1["support"], 0.6, atol=1e-4)
    assert np.isclose(row1["confidence"], 0.75, atol=1e-4)
    assert np.isclose(row1["lift"], 0.9375, atol=1e-4)

    # 2. Verify "milk" -> "bread"
    rule_milk_bread = rules[
        (rules["antecedents"] == frozenset({"milk"})) & 
        (rules["consequents"] == frozenset({"bread"}))
    ]
    assert len(rule_milk_bread) == 1, "Rule 'milk' -> 'bread' not found"
    row2 = rule_milk_bread.iloc[0]
    assert np.isclose(row2["support"], 0.4, atol=1e-4)
    assert np.isclose(row2["confidence"], 1.0, atol=1e-4)
    assert np.isclose(row2["lift"], 1.25, atol=1e-4)


# ---------------------------------------------------------------------------
# (d) Vector retrieval returns expected recipe from FAISS
# ---------------------------------------------------------------------------
def test_faiss_retrieval_known_recipe():
    from backend.services.rag_service import rag_service
    
    assert rag_service.index is not None, "FAISS index should be loaded"
    assert rag_service.index.ntotal >= 13296, f"Expected at least 13,296 vectors in FAISS index, found {rag_service.index.ntotal}"
    
    # Query with exact or strong title keywords
    query_text = "Tomato and Goat Cheese Tart"
    result = rag_service.query(query_text, top_k=5)
    
    assert "retrieved_recipes" in result
    assert len(result["retrieved_recipes"]) > 0
    top_recipe = result["retrieved_recipes"][0]
    assert top_recipe["similarity_score"] > 0.60, f"Expected high similarity for targeted recipe, got {top_recipe['similarity_score']}"
    assert "tart" in top_recipe["title"].lower() or "cheese" in top_recipe["title"].lower() or "tomato" in top_recipe["title"].lower()

    # Query out-of-domain to test defensible fallback
    out_of_domain = "What is the quantum mechanical wave function of hydrogen?"
    ood_result = rag_service.query(out_of_domain, top_k=5)
    assert ood_result["is_grounded"] is False, "Out of domain query should have is_grounded=False"
    assert "below confidence threshold" in ood_result["grounded_answer"]


# ---------------------------------------------------------------------------
# (e) FastAPI endpoints return 200 with valid schema, and 404 for nonexistent ID
# ---------------------------------------------------------------------------
def test_fastapi_endpoints_schemas_and_404():
    from backend.main import app
    client = TestClient(app)

    # 1. Health endpoint
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    health_data = r_health.json()
    assert health_data["status"] == "healthy"
    assert health_data["dataset_records"] >= 13296

    # 2. Recipe detail - valid recipe ID
    r_recipe = client.get("/api/recipes/rec_00001")
    assert r_recipe.status_code == 200
    recipe_data = r_recipe.json()
    assert recipe_data["recipe_id"] == "rec_00001"
    assert "title" in recipe_data
    assert "ingredients" in recipe_data
    assert "instructions" in recipe_data

    # 3. Recipe detail - nonexistent recipe ID returns 404
    r_404 = client.get("/api/recipes/recipe_99999999_nonexistent")
    assert r_404.status_code == 404
    assert "not found" in r_404.json()["detail"].lower()

    # 4. Market Basket Graph endpoint
    r_graph = client.get("/api/market-basket/graph?top_n=30&min_lift=1.2")
    assert r_graph.status_code == 200
    graph_data = r_graph.json()
    assert "nodes" in graph_data
    assert "links" in graph_data
    assert len(graph_data["nodes"]) > 0

    # 5. QA endpoint returns 200
    r_qa = client.post("/api/qa", json={"query": "garlic herb roasted chicken", "top_k": 3})
    assert r_qa.status_code == 200
    qa_data = r_qa.json()
    assert "grounded_answer" in qa_data
    assert len(qa_data["retrieved_recipes"]) > 0

    # 6. Culinary translation endpoint verifies domain alignment
    r_trans = client.post("/api/translation/translate", json={
        "text": "Cook onions and tomatoes in oil",
        "source_lang": "en",
        "target_lang": "ta"
    })
    assert r_trans.status_code == 200
    trans_data = r_trans.json()
    translated_text = trans_data["translated_text"]
    assert "வெங்காயம்" in translated_text or "வெங்காயங்களை" in translated_text, f"Expected 'வெங்காயம்' in translation, got: {translated_text}"
    assert "மிளகு" not in translated_text, f"Unexpected black pepper ('மிளகு') in translation: {translated_text}"

    # 6b. Verify Hindi culinary terminology alignment (cumin seeds, kadai)
    r_trans_hi = client.post("/api/translation/translate", json={
        "text": "Heat oil in a pan, add cumin seeds and mustard seeds.",
        "source_lang": "en",
        "target_lang": "hi"
    })
    assert r_trans_hi.status_code == 200
    hi_text = r_trans_hi.json()["translated_text"]
    assert "जीरा" in hi_text, f"Expected 'जीरा' (cumin) in Hindi translation, got: {hi_text}"
    assert "कमिन" not in hi_text, f"Found garbled transliteration 'कमिन' in: {hi_text}"
    assert "कड़ाही" in hi_text or "पैन" in hi_text

    # 7. Verify Indian cuisine recipe query and retrieval
    r_indian = client.get("/api/recipes?query=biryani&cuisine=Indian&page_size=5")
    assert r_indian.status_code == 200
    indian_data = r_indian.json()
    assert indian_data["total"] > 0
    assert any("biryani" in r["title"].lower() for r in indian_data["recipes"])

