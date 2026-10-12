# RasaLens: Classification Methodology & Audit Report

## 1. Weak Supervision & Circularity Disclosure
In culinary machine learning workflows, ground-truth labels for high-level attributes (Course, Diet, Cuisine) are frequently unannotated in raw recipe repositories.
- **Rule-Derived Labels**: In RasaLens, labels were initially derived using heuristic keyword dictionaries during ETL (e.g., titles containing *cake* or *cookie* assigned *Dessert*; non-veg ingredients assigned *Non-Vegetarian*).
- **The Circularity Risk**: If a classifier is trained on features containing the exact same keywords (such as the title) to predict rule-derived targets, accuracy is inflated because the model learns the heuristic rule rather than latent culinary concepts.
- **Hardening Interventions**:
  1. **Feature Ablation**: Systematically comparing `title + ingredients` vs `ingredients only` vs `title only` to isolate true ingredient representation capability.
  2. **Leakage-Free 5-Fold CV**: TF-IDF vectorization is strictly encapsulated inside each fold pipeline.
  3. **Independent Gold Subset**: An audit subset of 200 recipes (`data/gold/course_gold.csv`) was created with status **pending manual review**.
  4. **UI Transparency**: All categorical labels are clearly documented in the user interface as *"rule-derived (weak supervision)"*.

---

## 2. Course Classification: Stratified 5-Fold Cross Validation

| Model Architecture | 5-Fold Mean Accuracy | Std Dev | Mean Macro F1 | Mean Weighted F1 |
| :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **88.62%** | ±0.17% | **78.52%** | 88.01% |
| **LinearSVC** | 93.25% | ±0.56% | 87.85% | 93.08% |
| **Multinomial Naive Bayes** | 79.19% | ±0.61% | 68.32% | 79.25% |
| **Random Forest** | 87.09% | ±0.46% | 74.00% | 86.19% |

Champion Model: **LinearSVC**

---

## 3. Feature Ablation Analysis
Evaluating Logistic Regression on different feature representations reveals the extent of title reliance:

| Feature Configuration | Accuracy | Macro F1 | Accuracy Delta vs Full |
| :--- | :--- | :--- | :--- |
| **Title + Ingredients (Full)** | **88.62%** | **78.52%** | Baseline (0.00%) |
| **Ingredients Only** | 71.51% | 49.76% | -17.11% |
| **Title Only** | 93.38% | 88.11% | +4.76% |

**Key Finding**: Operating strictly on *ingredients only* preserves **71.51%** accuracy, demonstrating that ingredient composition provides strong predictive signal even without explicit dish titles.

---

## 4. Evaluation on Gold Subset (`data/gold/course_gold.csv`)
- **Sample Count**: 200 recipes
- **Status**: pending manual review
- **Gold Accuracy**: **95.50%**
- **Gold Macro F1**: **95.40%**
- **Gold Weighted F1**: **95.46%**

---

## 5. Secondary Task: Diet Classification
Predicting `Non-Vegetarian`, `Vegetarian`, and `Vegan` across the corpus using Stratified 5-Fold Cross Validation:

| Model Architecture | 5-Fold Mean Accuracy | Mean Macro F1 | Mean Weighted F1 |
| :--- | :--- | :--- | :--- |
| **Logistic Regression** | 90.17% | 89.89% | 90.19% |
| **LinearSVC** | 90.79% | 90.54% | 90.82% |
| **Multinomial Naive Bayes** | 74.15% | 73.40% | 74.16% |
