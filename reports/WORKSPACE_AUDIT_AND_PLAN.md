# RasaLens: Workspace Audit and Implementation Plan

**Date**: 2026-10-03  
**Status**: In Progress (Executing Phase A)

---

## 1. Workspace Audit

### 1.1 Environment & System State
- **OS**: Windows (x64)
- **Python**: 3.13.15 in `.venv` (`d:\COLLEGE\Projects\rasalens\.venv\Scripts\python.exe`)
- **Node**: v24.18.0 (`D:\DELL UZER\Program Files\nodejs\node.exe`)
- **NPM**: 11.16.0 (`D:\DELL UZER\Program Files\nodejs\npm.cmd`)
- **Workspace Directory**: `d:\COLLEGE\Projects\rasalens`
- **Initial Workspace Files**:
  - `MASTER_PROMPT.md` (authoritative specification)
  - `data/raw/Food Ingredients and Recipe Dataset with Image Name Mapping.csv` (13,501 rows, 26.6 MB)
  - `.venv/` (Python virtual environment)
- **Version Control & Ignores**: `.gitignore` created with `.venv/`, `node_modules/`, `dist/`, etc.

### 1.2 Raw Dataset Schema & Inspection
- **Source**: `data/raw/Food Ingredients and Recipe Dataset with Image Name Mapping.csv`
- **Rows**: 13,501 recipes
- **Raw Columns**:
  1. `''` (Index)
  2. `Title`: Recipe title / dish name
  3. `Ingredients`: Raw ingredient list string (e.g., `['1 (3/4-lb.) whole chicken', '2 tsp. kosher salt', ...]`)
  4. `Instructions`: Detailed preparation and cooking steps
  5. `Image_Name`: Unique image slug/identifier
  6. `Cleaned_Ingredients`: Normalized ingredient strings

### 1.3 Feasibility Assessment for Core Requirements
| Requirement | Dataset Capability | Planned Strategy |
|---|---|---|
| **NER (Ingredients/Quantities)** | Full ingredient lists with quantities and units | Rule-based baseline + trained custom spaCy entity recognizer (`FOOD_ITEM`, `QUANTITY`, `UNIT`) on extracted/annotated recipe segments. |
| **Classification** | Dish titles and ingredients contain rich signals for Course/Diet/Cuisine | Derive multi-class labels (e.g., Course: Main Course, Dessert, Appetizer/Side, Breakfast, Beverage; or Cuisine: American, Italian, Mexican, Asian, Indian, Mediterranean) using keyword/ingredient heuristics + train scikit-learn models (TF-IDF + Logistic Regression / Naive Bayes / Random Forest / SVM) with full metrics (Accuracy, Precision, Recall, F1). |
| **Market Basket Analysis** | Cleaned list of ingredients per recipe | Frequent itemset mining via mlxtend (Apriori and FP-Growth), calculating Support, Confidence, Lift. |
| **QA / RAG** | Rich Titles, Instructions, Ingredients | Vector search index with `sentence-transformers` (`all-MiniLM-L6-v2`) and FAISS / cosine similarity nearest neighbors, generating retrieval-grounded answers. Optional Gemini enhancement with local fallback. |
| **Multilingual (Tamil/English)** | Recipe queries & ingredient translation | Lexical and dictionary-based neural translation layer with language detection (`langdetect`), supporting Tamil and English cross-lingual queries and SacreBLEU evaluation. |
| **Recipe-Video Intelligence** | Verified video metadata catalog | Curated catalog in `data/videos.csv` mapped to recipe categories and ingredients, with timestamped transcript intelligence. |

---

## 2. Implementation Architecture

### 2.1 Backend (`backend/`)
- `backend/main.py`: FastAPI entrypoint with CORS, health check, router mounting.
- `backend/api/`:
  - `health.py`: Status, offline/sample indicators, loaded model statuses.
  - `etl.py`: Pipeline triggers, schema stats, quality metrics.
  - `ner.py`: Extraction comparison (spaCy baseline vs trained custom model vs rule-based).
  - `classification.py`: Category prediction, model inference, confusion matrix data.
  - `market_basket.py`: Frequent itemsets, association rules, ingredient recommendations.
  - `qa.py`: Semantic retrieval, RAG responses, context provenance.
  - `analyze.py`: Unified dynamic studio endpoint (text, voice transcript, chips, file).
  - `recipes.py`: Recipe search, pagination, detail views, dietary filters.
  - `videos.py`: Video catalog, transcript segments, recipe mapping.
  - `evaluation.py`: Precomputed benchmark results, metrics comparison.
- `backend/services/`:
  - `etl_service.py`: Ingestion, deduplication, cleaning, sample extraction.
  - `ner_service.py`: Entity extraction and model inference.
  - `classifier_service.py`: Classification model loader and prediction pipeline.
  - `mba_service.py`: Association rule engine.
  - `rag_service.py`: FAISS/vector index retriever & grounding service.
  - `translation_service.py`: Tamil-English translation & language detection.
- `backend/schemas/`: Pydantic models for request/response validation.

### 2.2 Frontend (`frontend/`)
- Built with **Vite + React + Tailwind CSS + Lucide Icons + Recharts + Framer Motion**.
- Pages:
  - **Home / Overview**: System stats, quick links, architectural summary.
  - **Analyze Studio**: Dynamic input (Text, Voice transcript, Ingredient chips, File upload).
  - **Recipe Explorer**: Full searchable database with filters and video links.
  - **Model Lab**: Interactive model comparison (NER, Classifiers, MBA, RAG metrics).
  - **Insights & ETL Dashboard**: Data quality distributions, missing values, association graph.
  - **Video Intelligence**: Timestamped transcripts, recipe alignment.
  - **About & Provenance**: Academic citations, dataset provenance, system specifications.

---

## 3. Execution Roadmap

### Phase A: Core Academic Concepts & Data Foundation (Current)
1. **Audit & Plan**: Finalize architecture, document schema, write `.gitignore` and requirements.
2. **Dependencies & Runtimes**: Install backend packages and verify imports on Python 3.13.
3. **ETL & Data Preprocessing**:
   - Create `data/scripts/etl_pipeline.py`.
   - Process raw dataset, clean text, derive classification targets, extract ingredient tokens.
   - Generate bundled offline sample dataset (`data/sample/recipes_sample.csv`, ~800 rows).
   - Generate `data/videos.csv` with verified recipe video metadata & transcripts.
   - Generate `reports/DATA_COLLECTION_AND_PREPROCESSING.md`.
4. **Academic ML/NLP Modules & Evaluation**:
   - **Module 1: NER**: Rule-based + spaCy baseline + trained spaCy model. Evaluate Precision/Recall/F1.
   - **Module 2: Classification**: TF-IDF + LogisticRegression, MultinomialNB, RandomForest, LinearSVC. Full evaluation metrics & confusion matrices saved to `evaluation/results/classification_metrics.json`.
   - **Module 3: Market Basket Analysis**: Apriori & FP-Growth via mlxtend. Rules saved to `evaluation/results/mba_rules.json`.
   - **Module 4: RAG / QA**: Semantic index (`all-MiniLM-L6-v2` + FAISS/vector store), retrieval evaluation metrics saved to `evaluation/results/qa_metrics.json`.
5. **Phase A API & Verification**:
   - FastAPI endpoints for ETL, NER, Classify, MBA, QA.
   - Automated test suite verifying all 4 endpoints and evaluation outputs.
   - Internal Phase A Implementation Report.

### Phase B: Full System Integration & Delivery (Automatic Transition)
6. **Dynamic Analyze Studio**: Multi-modal input pipeline (chips, text, voice, file).
7. **Recipe Explorer & Video Intelligence**: Interactive search, video player sync, transcript timestamps.
8. **Multilingual Processing**: English-Tamil bidirectional translation & SacreBLEU evaluation.
9. **Modern React Frontend**: High-impact UI with glassmorphism, dynamic charts, dark mode, responsive layout.
10. **Final Acceptance & Demonstration**: Verification of all 24 acceptance criteria without requiring paid APIs.
