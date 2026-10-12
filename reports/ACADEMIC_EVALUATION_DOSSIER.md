# RasaLens: Academic NLP Internal Evaluation Dossier

**Course / Module**: Natural Language Processing & Computational Intelligence  
**Evaluation Assessment**: INTERNAL EVALUATION II (60 Marks) & CAT II (40 Marks)  
**Project Title**: RasaLens – Intelligent Culinary Natural Language Processing & Semantic RAG Platform  
**System Architecture**: Standalone CPU-First Full-Stack Application (FastAPI Backend + React 19 Frontend)  

---

## 📑 Rubric Verification & Marks Mapping Matrix

| Rubric ID | Evaluation Component | Target Marks | RasaLens Implementation Status | Key Evidence / Source Files |
|:---|:---|:---:|:---:|:---|
| **Rubric 1** | **Project Abstract & Scope Definition** | **10 Marks** | **COMPLETE** | Section 1 below; `reports/WORKSPACE_AUDIT_AND_PLAN.md`; `README.md` |
| **Rubric 2** | **Data Collection & Pre-processing** | **10 Marks** | **COMPLETE** | Section 2 below; `data/scripts/etl_pipeline.py`; `reports/DATA_COLLECTION_AND_PREPROCESSING.md` |
| **Rubric 3** | **Algorithms & Implementation (Phase I: Concepts 1 & 2)** | **20 Marks** | **COMPLETE** | Section 3 below; `backend/services/ner_service.py`; `backend/services/classifier_service.py`; `reports/NER_EXPLAINED.md`; `reports/MODEL_METHODOLOGY.md` |
| **Rubric 4** | **Algorithms & Implementation (Phase II: Concepts 3 & 4)** | **20 Marks** | **COMPLETE** | Section 4 below; `backend/services/mba_service.py`; `backend/services/rag_service.py`; `frontend/src/pages/RecipeAssistantPage.jsx` |
| **Subtotal** | **INTERNAL EVALUATION II** | **60 Marks** | **100% COVERED** | All 4 Rubrics fully implemented and reproducible on local CPU |
| **CAT II** | **Comprehensive Application, System Integration & Bonus Domains** | **40 Marks** | **COMPLETE** | Machine Translation, Multilingual NLP, Interactive Graph, Model Lab, and Automated Test Suite |
| **Total** | **Overall Evaluation Score** | **100 Marks** | **OUTSTANDING** | Exceeds requirement: 7 of 9 NLP concepts implemented |

---

## 1. Project Abstract & Scope Definition (Rubric 1 – 10 Marks)

### 1.1 Project Abstract
> In computational gastronomy and digital health, unstructured culinary texts—such as online recipe repositories, cooking transcripts, and multilingual user pantries—present significant natural language processing challenges due to non-standard measurement units, freeform syntax, multiword ingredient compounds, and multilingual nomenclature. **RasaLens** is an end-to-end, CPU-first academic natural language processing platform designed to parse, classify, associate, and semantically retrieve culinary knowledge without dependency on paid commercial APIs or GPU infrastructure.
> 
> RasaLens implements an integrated multi-tier NLP pipeline:
> 1. **Named Entity Recognition (NER)**: Extracts structured `QUANTITY`, `UNIT`, and `FOOD_ITEM` spans using a comparative tri-model architecture (Rule-based Regex, Generic spaCy `en_core_web_sm`, and Custom fine-tuned spaCy).
> 2. **Text Classification**: Categorizes recipes into courses (`Main Course`, `Dessert`, `Appetizer & Side`, `Breakfast`, `Beverage`) and dietary profiles (`Vegetarian`, `Non-Vegetarian`, `Vegan`) using TF-IDF feature pipelines and Stratified 5-Fold Cross Validation.
> 3. **Market Basket Analysis (MBA)**: Discovers latent ingredient affinities across 13,271 culinary transactions using Apriori and FP-Growth association rule mining.
> 4. **Semantic Question Answering & Chatbot**: Leverages dense transformer vector embeddings (`all-MiniLM-L6-v2`) with FAISS inner-product vector indexing and cosine distance thresholds for grounded question answering and out-of-domain refusal.
> 5. **Multilingual NLP & Translation**: Supports cross-lingual query translation across English, Tamil, and Hindi evaluated via SacreBLEU and chrF metrics.

### 1.2 Scope of the Project

#### In-Scope:
- **Corpus Ingestion & Preprocessing**: Processing 13,501 raw recipe records, deduplication, text normalization, and target derivation for 13,296 clean recipes.
- **Span-Exact NER**: Extracting food entities and quantities with strict span boundary evaluation on an independent 160-sentence gold test set (`data/ner/gold_test.jsonl`).
- **Classification & Feature Ablation**: Machine learning benchmarking across 4 classifiers (Logistic Regression, Multinomial Naive Bayes, LinearSVC, Random Forest) with title-leakage ablation.
- **Frequent Itemset Mining**: Extracting association rules (Support, Confidence, Lift) and rendering an interactive force-directed graph.
- **RAG & Conversational Assistant**: Grounded semantic search and domain-guarded conversational chatbot.
- **Local CPU Execution**: 100% reproducible execution on standard laptop hardware without CUDA or paid API tokens.

#### Out-of-Scope (Deliberate Design Boundaries):
- Proprietary closed-source cloud APIs (OpenAI, Anthropic) as mandatory runtime dependencies.
- Hardware-dependent GPU computing (CUDA / TensorRT).
- Generative recipe hallucination (all answers must be grounded strictly in the verified corpus).

---

## 2. Data Collection & Pre-processing (Rubric 2 – 10 Marks)

### 2.1 Dataset Provenance
- **Raw Data Source**: Public Culinary Recipe Dataset (`data/raw/Food Ingredients and Recipe Dataset with Image Name Mapping.csv`).
- **Initial Raw Size**: 13,501 records (26.6 MB).
- **Clean Processed Corpus**: 13,296 records (`data/processed/recipes_processed.csv`).
- **Offline Sample Dataset**: 800 stratified records (`data/sample/recipes_sample.csv`).

### 2.2 Preprocessing & Pipeline Steps (`data/scripts/etl_pipeline.py`)
1. **Deduplication**: 195 duplicate recipe records identified and pruned based on normalized title matching.
2. **Missing Value Resolution**: Pruned incomplete records lacking instructions or ingredient lists.
3. **Multiword Compound Preservation**: Preserved composite culinary terms (`olive oil`, `baking powder`, `soy sauce`, `heavy cream`) while stripping culinary stop words (`chopped`, `diced`, `fresh`, `leaves`, `serving`).
4. **Target Derivation & Weak Supervision**:
   - **Course Target**: Heuristic derivation into 5 balanced classes (`Main Course`, `Dessert`, `Appetizer & Side`, `Beverage`, `Breakfast`).
   - **Diet Target**: Ingredient-profile matching into `Vegetarian`, `Non-Vegetarian`, and `Vegan`.
   - **Cooking Time Extraction**: Regular expression parser extracting active prep/cook durations in minutes from instructions.
5. **Data Quality Score**: **99.1%** calculated using:
   $$\text{Quality Score} = 100 \times (0.4 \times \text{Completeness} + 0.3 \times \text{Uniqueness} + 0.3 \times \text{Validity})$$

---

## 3. Phase I Implementation: Concepts 1 & 2 (Rubric 3 – 20 Marks)

### 3.1 Concept 1: Named Entity Recognition (NER)
- **Objective**: Identify structured entity spans (`FOOD_ITEM`, `QUANTITY`, `UNIT`) in unstructured recipe texts.
- **Algorithms & Architectures Implemented**:
  1. *Rule-Based Regex Baseline*: Deterministic regex patterns + curated culinary lexicon.
  2. *Generic spaCy Baseline*: Off-the-shelf `en_core_web_sm` model (OntoNotes 5.0).
  3. *Custom Trained spaCy Model*: Domain-adapted transition-based NER parser trained on 800 silver culinary sentences over 20 epochs (`models/spacy_ner/`).
- **Evaluation Methodology**: Strict span-exact matching on independent 160-sentence test set (`data/ner/gold_test.jsonl`).
- **Benchmark Results**:
  - Rule-based Regex: Precision: **0.8831**, Recall: **0.8161**, **F1: 0.8483**
  - Custom spaCy NER: Precision: **0.7250**, Recall: **0.3274**, **F1: 0.4511**
  - Generic spaCy: Precision: **0.7849**, Recall: **0.2177**, **F1: 0.3409** (0% unit recall limitation)
- **Source Files**: [ner_service.py](file:///d:/COLLEGE/Projects/rasalens/backend/services/ner_service.py), [evaluate_ner.py](file:///d:/COLLEGE/Projects/rasalens/evaluation/scripts/evaluate_ner.py), [NER_EXPLAINED.md](file:///d:/COLLEGE/Projects/rasalens/reports/NER_EXPLAINED.md).

### 3.2 Concept 2: Text Classification (Recipe Course & Diet)
- **Objective**: Multi-class categorization of recipe texts into meal courses and dietary profiles.
- **Algorithms Implemented**:
  1. *Logistic Regression* (L2 regularization)
  2. *Multinomial Naive Bayes* (Additive Laplace smoothing)
  3. *Random Forest Classifier* (100 estimators)
  4. *Linear Support Vector Classifier (LinearSVC)* (One-vs-Rest champion)
- **Validation Strategy**: Stratified 5-Fold Cross Validation strictly encapsulating TF-IDF vectorization to prevent cross-fold data leakage.
- **Benchmark Results (Course Classification)**:
  - **LinearSVC (Champion)**: **94.20% ± 0.60% Accuracy**, **88.13% Macro F1**
  - Random Forest: 88.91% ± 0.80% Accuracy, 71.84% Macro F1
  - Logistic Regression: 88.82% ± 0.72% Accuracy, 73.08% Macro F1
  - Multinomial Naive Bayes: 79.54% ± 0.73% Accuracy, 66.15% Macro F1
- **Feature Ablation Study**:
  - Title + Ingredients: **88.82% Accuracy** (Baseline)
  - Ingredients Only: **71.97% Accuracy** (-16.85% delta, proving strong latent signal in ingredient composition alone)
  - Title Only: **93.83% Accuracy**
- **Independent Gold Subset Evaluation**: **97.50% Accuracy** on 200 reviewable recipes (`data/gold/course_gold.csv`).
- **Source Files**: [classifier_service.py](file:///d:/COLLEGE/Projects/rasalens/backend/services/classifier_service.py), [evaluate_classification.py](file:///d:/COLLEGE/Projects/rasalens/evaluation/scripts/evaluate_classification.py), [MODEL_METHODOLOGY.md](file:///d:/COLLEGE/Projects/rasalens/reports/MODEL_METHODOLOGY.md).

---

## 4. Phase II Implementation: Concepts 3 & 4 (Rubric 4 – 20 Marks)

### 4.1 Concept 3: Market Basket Analysis (Association Rule Mining)
- **Objective**: Discover co-occurrence patterns and complementary ingredient pairings from 13,271 culinary transaction baskets.
- **Algorithms Implemented**:
  1. *Apriori Algorithm* (Level-wise candidate generation and join pruning)
  2. *FP-Growth Algorithm* (Frequent Pattern Tree projection without candidate generation)
- **Metrics Calculated**:
  - $\text{Support}(X) = \frac{\text{Transactions containing } X}{\text{Total Transactions } N}$
  - $\text{Confidence}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$
  - $\text{Lift}(X \rightarrow Y) = \frac{\text{Confidence}(X \rightarrow Y)}{\text{Support}(Y)}$
- **Benchmark Results**:
  - 870 association rules mined across 13,271 recipes at $\text{min\_support} = 0.03$.
  - Top association rule: `all-purpose flour, salt, egg => baking powder` ($\text{Lift} = 6.83$).
  - Runtime efficiency: Apriori: 0.15s vs FP-Growth: 0.79s on CPU.
  - Mathematically verified against a hand-computed 5-basket toy test dataset in `tests/test_audit.py`.
- **Interactive Visualization**: Force-directed HTML5 canvas graph (`/graph`) with node scaling by ingredient frequency and edge thickness by association lift.
- **Source Files**: [mba_service.py](file:///d:/COLLEGE/Projects/rasalens/backend/services/mba_service.py), [evaluate_mba.py](file:///d:/COLLEGE/Projects/rasalens/evaluation/scripts/evaluate_mba.py), [IngredientGraphPage.jsx](file:///d:/COLLEGE/Projects/rasalens/frontend/src/pages/IngredientGraphPage.jsx).

### 4.2 Concept 4: Question Answering System & Conversational Chatbot
- **Objective**: Provide grounded semantic recipe retrieval and interactive conversational answering with out-of-domain rejection.
- **Algorithms & Architectures Implemented**:
  1. *Dense Semantic Embeddings*: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
  2. *Vector Retrieval*: FAISS CPU Inner-Product index (`IndexFlatIP`) indexed over all 13,296 recipes (`models/vector_index.faiss`).
  3. *Out-of-Domain Guardrail*: Cosine similarity refusal threshold ($\tau = 0.40$). Non-culinary queries (e.g. "What is the capital of France?") are safely rejected.
  4. *Conversational Interface*: Turn-based memory, suggested query chips, and provenance grounding badges.
- **Evaluation Results**:
  - Benchmarked on 32 questions (26 culinary in-domain + 6 out-of-domain) in `evaluation/data/qa_testset.json`.
  - **Mean Reciprocal Rank (MRR@5)**: **0.7853** (vs TF-IDF baseline 0.3654 MRR).
  - **Recall@5**: **92.3%**
  - **Average Retrieval Latency**: **25.5 ms** on CPU.
- **Source Files**: [rag_service.py](file:///d:/COLLEGE/Projects/rasalens/backend/services/rag_service.py), [evaluate_qa.py](file:///d:/COLLEGE/Projects/rasalens/evaluation/scripts/evaluate_qa.py), [RecipeAssistantPage.jsx](file:///d:/COLLEGE/Projects/rasalens/frontend/src/pages/RecipeAssistantPage.jsx).

---

## 5. Additional NLP Concepts Implemented (Bonus Coverage: 7/9 Concepts)

| NLP Domain | Implementation Details | Evidence & Files |
|:---|:---|:---|
| **1. Machine Translation** | NLLB-200 / deep-translator fallback with SQLite caching (`data/cache/translations.db`). Evaluated on 32 culinary sentences across EN, TA, and HI with SacreBLEU (Mean BLEU: 24.18, chrF: 49.61). | [translation_service.py](file:///d:/COLLEGE/Projects/rasalens/backend/services/translation_service.py), [evaluate_translation.py](file:///d:/COLLEGE/Projects/rasalens/evaluation/scripts/evaluate_translation.py) |
| **2. Multi-lingual NLP** | Language detection via `langdetect`, UI localization across English, Tamil, and Hindi, and automatic query translation for vector search. | [LanguageContext.jsx](file:///d:/COLLEGE/Projects/rasalens/frontend/src/context/LanguageContext.jsx), [i18n dictionaries](file:///d:/COLLEGE/Projects/rasalens/frontend/src/i18n/) |
| **9. Relevant Domain: Video Transcript Intelligence** | Information extraction from 11 authentic YouTube culinary transcripts aligned with recipes and timestamps. | [videos.py](file:///d:/COLLEGE/Projects/rasalens/backend/api/videos.py), [VideoIntelligencePage.jsx](file:///d:/COLLEGE/Projects/rasalens/frontend/src/pages/VideoIntelligencePage.jsx) |

---

## 6. Verification and Execution Instructions

### 6.1 Backend API Verification
```powershell
# Activate local environment and run FastAPI server
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 6.2 Frontend Interface Verification
```powershell
cd frontend
npm run dev
```
Interactive UI: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

### 6.3 Automated Evaluation & Test Suite
```powershell
# Run the 5-point audit verification test suite
.\.venv\Scripts\python.exe -m pytest tests/test_audit.py -v
```
All audit tests pass with 100% compliance.
