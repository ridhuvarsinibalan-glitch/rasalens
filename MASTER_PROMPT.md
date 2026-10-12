# 18. FIXED TECH STACK, DATASET, RUNTIME CONSTRAINTS & EXECUTION MODE

This section is authoritative for technical implementation.

If any earlier instruction conflicts with this section, **this section takes precedence for technology choices, runtime constraints, dataset strategy, and implementation execution order.**

---

## 18.1 FIXED BACKEND STACK

Use:

* Python
* FastAPI
* Pydantic
* pandas
* scikit-learn
* spaCy
* `en_core_web_sm`
* mlxtend
* sentence-transformers
* `all-MiniLM-L6-v2`
* FAISS / `faiss-cpu`
* langdetect
* sacrebleu
* SQLite
* joblib

Do not replace the backend stack with Flask, Django, Streamlit, or another backend framework unless an unavoidable technical blocker is discovered in the existing RasaLens implementation.

Use FastAPI for the main backend API.

Use Pydantic models for API request/response validation where appropriate.

Use pandas for ETL and tabular data processing.

Use scikit-learn for the required classification experiments and evaluation.

Use spaCy for NER and the required trained NER comparison.

Use mlxtend for Apriori / FP-Growth and association-rule mining where appropriate.

Use sentence-transformers with:

`all-MiniLM-L6-v2`

for semantic embeddings.

Use FAISS CPU for vector retrieval.

Use SQLite for lightweight application metadata, run logs, and other structured local persistence where appropriate.

Use joblib for persisting suitable trained scikit-learn models and preprocessing pipelines.

---

# 18.2 FIXED FRONTEND STACK

Use:

* React
* Vite
* Tailwind CSS
* Recharts
* Framer Motion
* lucide-react
* react-router-dom
* react-force-graph-2d

The frontend should communicate with the FastAPI backend through clearly defined API endpoints.

Do not move the ML/NLP processing into browser JavaScript simply to avoid creating backend endpoints.

Browser-side processing is appropriate for:

* UI state.
* Voice capture through Web Speech API.
* Editable transcripts.
* Visualizations.
* Client-side interaction.

ML/NLP/data-processing logic should remain in the Python backend or evaluation scripts.

---

# 18.3 RUNTIME CONSTRAINT

The complete application must be designed to run on a normal Windows laptop using CPU resources.

Do not require:

* CUDA.
* GPU acceleration.
* paid cloud inference.
* proprietary infrastructure.
* a continuously running external server.
* a paid API subscription.

The project should remain demonstrable without a paid API.

---

# 18.4 OPTIONAL GEMINI / LLM INTEGRATION

A Gemini or other LLM API may be integrated as an optional enhancement.

However:

**RasaLens must NOT depend on an LLM API for its core functionality.**

If no API key is available:

* NER must still work.
* Classification must still work.
* Market Basket Analysis must still work.
* Recipe retrieval must still work.
* QA must still provide retrieval-grounded answers or a retrieval-only response.
* ETL must still work.
* Model Lab must still work.
* Video transcript analysis must still work for available transcripts.
* The application must still launch.

The application must detect missing API credentials and gracefully switch to the supported local/retrieval-only path.

Never show a fake AI-generated answer merely because the API key is unavailable.

---

# 18.5 DATASET STRATEGY

Use a real public recipe dataset.

Prefer an Indian recipe / Indian food dataset where it provides useful structured fields.

Possible sources include:

* Kaggle Indian food / Indian recipe datasets.
* Hugging Face public recipe datasets.
* IndianFoodDatasetCSV-style datasets.
* RecipeNLG subset as a supplementary source if necessary.

Prefer a dataset containing fields such as:

* Recipe name/title.
* Ingredients.
* Diet.
* Course.
* Cuisine.
* Cooking time, where available.
* Instructions, where available.

Do not select a dataset merely because it is large.

Select a dataset that supports:

* NER.
* Text classification.
* Recipe retrieval.
* Market Basket Analysis.
* ETL/data-quality analysis.
* Meaningful dashboard statistics.

Before implementation, inspect the actual dataset schema.

Do not assume that a field exists because an example dataset description says it exists.

---

# 18.6 DATASET ACQUISITION

Create:

`data/scripts/download_data.py`

or, if the existing project has a better established data-script structure:

`data/download_data.py`

The script must:

1. Download or retrieve the selected public dataset through an appropriate permitted mechanism.
2. Store it in the project data directory.
3. Validate that the expected file exists.
4. Inspect and report its schema.
5. Record the source information.
6. Avoid silently replacing an existing verified dataset.
7. Fail with a clear actionable message if the download cannot be completed.

Do not fabricate download success.

If automatic download fails because of:

* Kaggle authentication.
* Network restrictions.
* Dataset removal.
* Access permissions.
* URL changes.

Tell the user exactly:

* Which dataset is required.
* Which file should be downloaded manually.
* The expected filename.
* The exact folder where it should be placed.

Do not switch to a completely unrelated dataset merely to hide a download failure.

---

# 18.7 OFFLINE SAMPLE DATASET

The project must include a small bundled sample dataset so that the application can run without downloading the complete dataset.

Target:

**500–1000 real recipe records.**

Store it under an appropriate location such as:

`data/sample/`

The sample must be derived from the selected real public dataset.

Do not generate fake recipe records simply to reach 500–1000 rows.

The sample should preserve the important schema required by the application.

The application must be capable of running in an **offline demo mode** using this bundled sample.

Clearly identify whether the application is currently running with:

* Full dataset.
* Bundled sample dataset.

---

# 18.8 DATASET PROVENANCE

Create or update:

`reports/DATA_COLLECTION_AND_PREPROCESSING.md`

Record:

* Exact dataset name.
* Source URL or source identifier.
* Dataset publisher/creator where available.
* License or usage terms where available.
* Download/retrieval date.
* Original row count.
* Original column names.
* Processed row count.
* Sample dataset row count.
* Missing-value statistics.
* Duplicate statistics.
* Cleaning decisions.
* Normalization steps.
* Final data schema.
* Any fields removed and why.
* Any assumptions made.
* Dataset limitations.

Do not invent licensing information.

If the source license cannot be verified, explicitly state that it requires manual verification.

---

# 18.9 DATASET SELECTION AND ACADEMIC REQUIREMENTS

The selected dataset must support the academic project rather than being selected only for UI convenience.

Before locking the dataset, verify:

### For NER

There is sufficient ingredient and quantity text to construct a defensible labeled subset.

### For classification

There is at least one useful categorical field such as:

* diet,
* cuisine,
* course,
  or another meaningful recipe category.

### For Market Basket Analysis

There are structured or extractable ingredient lists.

### For QA/RAG

There is enough recipe content such as:

* title,
* ingredients,
* instructions,
  or other recipe information.

### For multilingual processing

The recipe dataset itself does not need to be multilingual if the multilingual workflow is implemented through a separate translation layer. Clearly document this.

### For video intelligence

Video records may be maintained separately in:

`data/videos.csv`

Do not force video metadata into the recipe dataset if that damages the data model.

---

# 18.10 FIXED PROJECT DATA LAYOUT

Use a clean structure similar to:

RasaLens/
│
├── backend/
│   ├── main.py
│   ├── api/
│   ├── schemas/
│   ├── services/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── sample/
│   ├── videos.csv
│   └── ...
│
├── models/
│
├── evaluation/
│   ├── scripts/
│   ├── results/
│   └── README.md
│
├── reports/
│
├── tests/
│
├── config/
│
├── .env.example
├── requirements.txt
└── README.md

This is a target architecture.

If the audited RasaLens workspace already has a clean equivalent structure, preserve it rather than restructuring purely for naming consistency.

---

# 18.11 MODEL STORAGE

Persist trained models and reusable preprocessing components where appropriate.

For example:

* spaCy NER model → `models/`
* classification pipelines → `models/`
* TF-IDF vectorizer → persisted with the appropriate model pipeline
* Retrieval index → `models/` or a dedicated index directory
* Metadata → JSON/SQLite as appropriate

Do not retrain models unnecessarily every time the application starts.

Do not commit enormous generated model artifacts unless appropriate for the project repository.

Document how the models are generated.

---

# 18.12 API DESIGN

Create a clear FastAPI API structure.

Possible endpoints include:

* `/api/health`
* `/api/config`
* `/api/etl/status`
* `/api/etl/run`
* `/api/analyze`
* `/api/ner`
* `/api/classify`
* `/api/market-basket`
* `/api/qa`
* `/api/recipes`
* `/api/videos`
* `/api/videos/analyze`
* `/api/evaluation`
* `/api/demo`

Adapt endpoint names to the actual implementation.

Use Pydantic request/response models.

Return meaningful errors rather than generic server failures.

Do not expose API keys through responses.

---

# 18.13 DYNAMIC INPUT IS MANDATORY

The central Analyze Studio workflow must use real backend processing.

Examples:

### Text

User enters:

"I have two tomatoes, one onion and some rice."

The backend must actually:

* process the text,
* run the implemented NER path,
* normalize extracted ingredients,
* invoke the relevant downstream modules,
* return actual results.

### Ingredient chips

User adds:

* tomato
* onion
* rice

The backend must use those ingredients to retrieve or recommend actual recipes.

### File upload

If a supported recipe/ingredient file is uploaded:

* validate the file,
* parse it,
* process its contents,
* return actual results.

### Voice

Browser voice input creates a transcript.

The transcript must be editable and then sent through the same processing path as typed text.

### Verified video

Selecting a verified video must load its actual metadata and available transcript/caption information.

Do not create separate "demo-only" fake outputs for these workflows.

---

# 18.14 EXECUTION MODE

After completing the initial workspace audit and implementation plan, execute the project in two major phases.

## PHASE A — MUST COMPLETE AND VERIFY FIRST

Build:

### Priority 1

Workspace audit and project foundation.

### Priority 2

ETL and data-quality pipeline.

### Priority 3

The four core academic concepts:

1. NER.
2. Text Classification.
3. Market Basket Analysis.
4. Question Answering / RAG.

For these four concepts:

* Implement.
* Evaluate.
* Run the evaluation scripts.
* Save actual results.
* Verify backend endpoints.
* Verify basic frontend integration.
* Resolve blocking errors.

Then provide an internal implementation report containing:

* What is working.
* What was reused.
* What was created.
* Dataset status.
* Actual evaluation metrics.
* Test results.
* Remaining blockers.

### IMPORTANT

Do **not** stop and wait for user approval after this report.

Continue automatically into Phase B unless a genuine external blocker requires user input.

---

# 18.15 PHASE B — CONTINUE AUTOMATICALLY

Continue with:

### Priority 4

Integrated dynamic Analyze Studio.

### Priority 5

Recipe Explorer and recipe-video integration.

### Priority 6

Multilingual NLP and English–Tamil translation.

### Priority 7

Speech processing and browser voice input.

### Priority 8

Insights Dashboard, Model Lab, Video Intelligence, About, Demo Mode, premium UI, documentation, screenshot guide, and final testing.

Do not ask for confirmation between these priorities.

Only pause when a genuine blocker requires information that cannot reasonably be inferred, such as:

* College name.
* Missing private API credential.
* Required dataset that cannot be legally or technically retrieved.
* A user decision that materially changes the project requirements.

For routine implementation decisions, choose the most reasonable option and continue.

---

# 18.16 NO-PAID-API DEMO REQUIREMENT

The following must work without any paid API:

* Home.
* ETL.
* NER.
* Text classification.
* Market Basket Analysis.
* Retrieval.
* Recipe Explorer.
* Model Lab.
* Data-quality dashboard.
* Video metadata.
* Available cached transcript processing.
* Browser speech input where supported.

LLM generation is an optional enhancement.

The absence of an API key must never cause the whole application to fail.

---

# 18.17 CPU-FIRST MODEL POLICY

The project must remain practical on a normal Windows CPU.

Before adding any model or dependency, consider:

* Download size.
* CPU inference time.
* Memory usage.
* Startup time.
* Offline availability.
* Reproducibility.

Do not introduce unnecessarily large language models.

Use:

`all-MiniLM-L6-v2`

for embeddings unless an unavoidable compatibility problem exists.

Use:

`en_core_web_sm`

for the spaCy baseline and supporting NLP tasks.

For the trained NER experiment, train a task-specific spaCy model using the prepared labeled dataset.

---

# 18.18 DEPENDENCY DISCIPLINE

Do not install large numbers of unnecessary packages.

Every new dependency should have a clear purpose.

Maintain:

* `requirements.txt`
* frontend `package.json`

Pin or constrain versions when compatibility requires it.

Before finalizing:

* verify installation,
* verify imports,
* verify backend startup,
* verify frontend startup,
* verify API connectivity,
* verify core model loading.

---

# 18.19 OFFLINE FALLBACK

The application should detect whether the full dataset is available.

If not:

* automatically use the bundled sample dataset where appropriate,
* show a clear "Sample Dataset / Offline Mode" indicator,
* keep core functionality working.

Do not silently pretend that the sample dataset is the full dataset.

Similarly, if a retrieval index is unavailable:

* build it from the sample/processed dataset when practical,
* otherwise provide a clear setup action or fallback.

---

# 18.20 FINAL TECHNICAL ACCEPTANCE TEST

Before final completion, perform a clean end-to-end test:

1. Install backend dependencies.
2. Install frontend dependencies.
3. Start FastAPI.
4. Start React/Vite.
5. Verify frontend-backend communication.
6. Load sample data if the full dataset is unavailable.
7. Run ETL.
8. Test NER.
9. Test classification.
10. Test Market Basket Analysis.
11. Test QA/RAG retrieval.
12. Test Analyze Studio.
13. Test Recipe Explorer.
14. Test video records.
15. Test cached transcript analysis.
16. Test Tamil input and translation path.
17. Test browser voice input where supported.
18. Open Model Lab.
19. Open Insights Dashboard.
20. Open About.
21. Run Demo Mode.
22. Verify that no page displays fabricated metrics.
23. Verify that displayed evaluation metrics match saved JSON/CSV results.
24. Verify that all major errors have readable fallback states.

---

# 18.21 FINAL RULE

The fixed stack is not an invitation to create unnecessary complexity.

The objective is:

**A technically credible, CPU-friendly, fully integrated, six-concept NLP project with real data, reproducible evaluation, dynamic input, recipe-video intelligence, and a premium user experience.**

Do not sacrifice:

* correctness,
* reproducibility,
* academic defensibility,
* real algorithm execution,
* or explainability

for the sake of:

* more features,
* larger models,
* more animations,
* or unnecessary dependencies.

If a feature cannot be implemented reliably, implement the strongest honest fallback and document the limitation.
