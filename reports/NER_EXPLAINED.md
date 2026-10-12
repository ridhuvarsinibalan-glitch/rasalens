# Named Entity Recognition (NER) Methodology & Evaluation Report

## 1. Overview & Problem Definition
The culinary Named Entity Recognition task in RasaLens extracts structured information from unstructured text:
- **QUANTITY**: Numeric amounts, fractions, and count modifiers (e.g. `2`, `1/2`, `a handful`, `three`).
- **UNIT**: Measurement units (e.g. `tablespoons`, `cups`, `grams`, `cloves`, `can`).
- **FOOD_ITEM**: Culinary ingredients and food products (e.g. `extra virgin olive oil`, `paneer`, `chicken broth`).

### Circular Evaluation Flaw in Prior Baseline
Previously, gold test data was generated using the same regex rules as the rule-based baseline, artificially inflating rule-based F1 to 0.9882.
Under this hardening audit:
1. **Silver annotations are restricted strictly to TRAINING**.
2. An independent, 160-sentence evaluation test set was authored at `data/ner/gold_test.jsonl` (status: **pending manual review**), comprising:
   - 80 structured recipe ingredient lines (e.g., `"2 tablespoons extra virgin olive oil"`).
   - 80 conversational pantry sentences (e.g., `"I have 2 tomatoes, a handful of coriander and some paneer in my fridge"`).
3. **Strict Span-Exact Matching**: Predicted entities receive True Positive credit if and only if `start`, `end`, and `label` match gold annotations identically. Overlapping or fuzzy boundaries count as zero credit.

---

## 2. Evaluation Results (Strict Span-Exact)

| Model / Approach | Overall Precision | Overall Recall | Overall F1 Score | Notes & Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Rule-based Regex Baseline** | **0.8831** | **0.8161** | **0.8483** | Fast dictionary & regex heuristics; fails on freeform syntax. |
| **Generic spaCy (`en_core_web_sm`)** | **0.7849** | **0.2177** | **0.3409** | **Severe Limitation**: Trained on OntoNotes 5.0 (NEWS/WEB). Contains no native `FOOD_ITEM` or `UNIT` labels. |
| **Custom Fine-tuned spaCy NER** | **0.7241** | **0.6645** | **0.6930** | Dedicated transition-based parser trained on culinary corpus. |

### Per-Entity Breakdown

#### FOOD_ITEM
- **Rule-based**: Precision: `0.8054`, Recall: `0.6742`, F1: `0.734`
- **Generic spaCy**: Precision: `0.5`, Recall: `0.0038`, F1: `0.0075` (Limited to `PRODUCT`/`ORG` mapped chunks)
- **Custom spaCy**: Precision: `0.5135`, Recall: `0.5038`, F1: `0.5086`

#### QUANTITY
- **Rule-based**: Precision: `0.9809`, Recall: `0.9361`, F1: `0.9579`
- **Generic spaCy**: Precision: `0.7882`, Recall: `0.6119`, F1: `0.6889`
- **Custom spaCy**: Precision: `0.9357`, Recall: `0.7306`, F1: `0.8205`

#### UNIT
- **Rule-based**: Precision: `0.8601`, Recall: `0.8978`, F1: `0.8786`
- **Generic spaCy**: Precision: `0.0`, Recall: `0.0`, F1: `0.0` (No unit tag exists in standard OntoNotes)
- **Custom spaCy**: Precision: `0.8561`, Recall: `0.8686`, F1: `0.8623`

---

## 3. Training Logs (Loss Per Epoch)
Custom spaCy NER was trained for 20 epochs on 1000 silver examples using a compounding minibatch schedule (size 4 to 32) and dropout 0.2:

| Epoch | NER Loss |
| :--- | :--- |
| Epoch 01 | 2235.9019 |
| Epoch 02 | 646.7725 |
| Epoch 03 | 448.4359 |
| Epoch 04 | 365.0512 |
| Epoch 05 | 283.9735 |
| Epoch 06 | 245.5509 |
| Epoch 07 | 193.5070 |
| Epoch 08 | 209.4184 |
| Epoch 09 | 169.3174 |
| Epoch 10 | 162.9845 |
| Epoch 11 | 151.8013 |
| Epoch 12 | 96.3170 |
| Epoch 13 | 127.6621 |
| Epoch 14 | 135.7245 |
| Epoch 15 | 122.9015 |
| Epoch 16 | 113.8740 |
| Epoch 17 | 89.0863 |
| Epoch 18 | 108.7701 |
| Epoch 19 | 96.8437 |
| Epoch 20 | 86.9574 |

---

## 4. Annotation Guidelines
1. **QUANTITY**: Spans only the numeric quantity or colloquial count phrase (e.g. `2`, `1/2`, `3.5`, `a handful`, `some`, `two`). Do not include the trailing preposition `of`.
2. **UNIT**: Standard measurement tokens (e.g. `tablespoons`, `cups`, `grams`, `cloves`, `can`, `packet`). Modifiers such as `finely chopped` or `crushed` are preparation descriptors, not units.
3. **FOOD_ITEM**: The core edible substance including common culinary compound nouns (`extra virgin olive oil`, `boneless chicken breasts`, `yellow onion`). Do not include preparation adjectives (`diced`, `minced`, `beaten`) in the core food item span unless integral to identity (`baking powder`, `sour cream`).

---

## 5. Error Analysis & Method Comparison

### Where Custom Trained Model Beats Rule-Based
In natural pantry sentences, rule-based heuristics fail because ingredients are embedded inside prepositions, conversational verbs, and multi-clause statements:
1. Sentence: *"I have 2 tomatoes, a handful of coriander and some paneer in my fridge."*
   - Custom Model successfully extracts `tomatoes`, `coriander`, and `paneer` in context.
   - Rule-based misses multi-clause entity boundaries.
2. Sentence: *"Can I cook dinner with 3 eggs, half a cup of milk and cheddar cheese?"*
   - Custom Model correctly separates colloquial quantity `"half a cup"` and isolates `"milk"` and `"cheddar cheese"`.

### Where Rule-Based Baseline Wins
On clean standard recipe ingredient lines, strict keyword matching captures exact lexical boundaries without statistical boundary uncertainty:
1. Sentence: *"1 packet active dry yeast"* -> Rule-based matches known dictionary terms exactly.
2. Exact boundary offsets on single-word ingredients (`"water"`, `"butter"`) when preceded by standard digits.

Full JSON error analysis with 15 concrete failure cases per method is preserved in `evaluation/results/ner_error_analysis.json`.
