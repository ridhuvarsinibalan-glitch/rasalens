"""
RasaLens Academic Concept 2: Text Classification Engine (Hardened P1.1)
- Stratified 5-Fold Cross Validation with vectorizer inside the pipeline (leakage prevention)
- Feature Ablation: (title + ingredients) vs (ingredients only) vs (title only)
- Gold Subset Evaluation: Benchmarks champion model on data/gold/course_gold.csv (200 recipes)
- Multi-Task: Recipe Course Classification + Diet Classification (Non-Vegetarian, Vegetarian, Vegan)
- Documents weak supervision circularity in reports/MODEL_METHODOLOGY.md
"""

import os
import sys
import json
import time
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.pipeline import Pipeline

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

PROCESSED_PATH = os.path.join("data", "processed", "recipes_processed.csv")
GOLD_PATH = os.path.join("data", "gold", "course_gold.csv")
MODEL_SAVE_PATH = os.path.join("models", "recipe_classifier.joblib")
DIET_MODEL_SAVE_PATH = os.path.join("models", "diet_classifier.joblib")
METRICS_SAVE_PATH = os.path.join("evaluation", "results", "classification_metrics.json")
REPORT_PATH = os.path.join("reports", "MODEL_METHODOLOGY.md")

def prepare_data():
    if not os.path.exists(PROCESSED_PATH):
        raise FileNotFoundError(f"Processed dataset missing at {PROCESSED_PATH}")
    df = pd.read_csv(PROCESSED_PATH)
    
    def parse_tokens(x):
        try:
            return " ".join(json.loads(x)) if isinstance(x, str) else ""
        except Exception:
            return ""

    df['ingredient_tokens'] = df['tokens_json'].apply(parse_tokens)
    df['title_clean'] = df['title'].astype(str)
    df['title_and_ingredients'] = (df['title_clean'] + " " + df['ingredient_tokens']).str.strip()
    
    # Filter rows with missing targets
    df = df.dropna(subset=['course', 'diet', 'title_and_ingredients'])
    df = df[df['title_and_ingredients'] != '']
    return df

def run_stratified_cv(X_series, y_series, candidate_models, n_splits=5):
    """Run Stratified 5-Fold Cross-Validation with TfidfVectorizer inside each pipeline fold."""
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    classes = sorted(y_series.unique().tolist())
    
    model_fold_results = {name: {"accuracies": [], "macro_f1s": [], "weighted_f1s": []} for name in candidate_models}
    
    for fold, (train_idx, val_idx) in enumerate(skf.split(X_series, y_series), 1):
        X_tr, X_val = X_series.iloc[train_idx], X_series.iloc[val_idx]
        y_tr, y_val = y_series.iloc[train_idx], y_series.iloc[val_idx]
        
        for name, clf_inst in candidate_models.items():
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)),
                ('clf', clf_inst)
            ])
            pipeline.fit(X_tr, y_tr)
            preds = pipeline.predict(X_val)
            
            acc = accuracy_score(y_val, preds)
            _, _, macro_f1, _ = precision_recall_fscore_support(y_val, preds, average='macro', zero_division=0)
            _, _, weighted_f1, _ = precision_recall_fscore_support(y_val, preds, average='weighted', zero_division=0)
            
            model_fold_results[name]["accuracies"].append(acc)
            model_fold_results[name]["macro_f1s"].append(macro_f1)
            model_fold_results[name]["weighted_f1s"].append(weighted_f1)
            
    summary = {}
    for name, metrics in model_fold_results.items():
        summary[name] = {
            "mean_accuracy": round(float(np.mean(metrics["accuracies"])), 4),
            "std_accuracy": round(float(np.std(metrics["accuracies"])), 4),
            "mean_macro_f1": round(float(np.mean(metrics["macro_f1s"])), 4),
            "std_macro_f1": round(float(np.std(metrics["macro_f1s"])), 4),
            "mean_weighted_f1": round(float(np.mean(metrics["weighted_f1s"])), 4),
            "std_weighted_f1": round(float(np.std(metrics["weighted_f1s"])), 4),
        }
    return summary

def run_feature_ablation(df, target_col='course'):
    """Feature ablation: title+ingredients vs ingredients only vs title only."""
    logging.info("Running Feature Ablation Experiments...")
    ablation_settings = {
        "title_and_ingredients": df['title_and_ingredients'],
        "ingredients_only": df['ingredient_tokens'],
        "title_only": df['title_clean']
    }
    
    ablation_results = {}
    y = df[target_col]
    
    for feature_name, X_feat in ablation_settings.items():
        logging.info(f"  Evaluating feature configuration: '{feature_name}'...")
        clf = LogisticRegression(max_iter=1000, random_state=42)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        accs, macro_f1s = [], []
        
        for train_idx, val_idx in skf.split(X_feat, y):
            X_tr, X_val = X_feat.iloc[train_idx], X_feat.iloc[val_idx]
            y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            pipe = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)),
                ('clf', clf)
            ])
            pipe.fit(X_tr, y_tr)
            preds = pipe.predict(X_val)
            accs.append(accuracy_score(y_val, preds))
            _, _, mf1, _ = precision_recall_fscore_support(y_val, preds, average='macro', zero_division=0)
            macro_f1s.append(mf1)
            
        ablation_results[feature_name] = {
            "mean_accuracy": round(float(np.mean(accs)), 4),
            "mean_macro_f1": round(float(np.mean(macro_f1s)), 4)
        }
        
    full_acc = ablation_results["title_and_ingredients"]["mean_accuracy"]
    full_f1 = ablation_results["title_and_ingredients"]["mean_macro_f1"]
    
    for k in ablation_results:
        ablation_results[k]["accuracy_delta"] = round(ablation_results[k]["mean_accuracy"] - full_acc, 4)
        ablation_results[k]["macro_f1_delta"] = round(ablation_results[k]["mean_macro_f1"] - full_f1, 4)
        
    return ablation_results

def evaluate_on_gold_subset(pipeline, gold_path, target_col='course'):
    """Evaluate trained model on the reviewable 200-sample gold dataset."""
    if not os.path.exists(gold_path):
        return None
    gold_df = pd.read_csv(gold_path)
    
    X_gold = (gold_df['title'].astype(str) + " " + gold_df['ingredients_summary'].astype(str)).str.strip()
    y_gold = gold_df[f'gold_{target_col}']
    
    preds = pipeline.predict(X_gold)
    acc = accuracy_score(y_gold, preds)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_gold, preds, average='macro', zero_division=0)
    p_weight, r_weight, f1_weight, _ = precision_recall_fscore_support(y_gold, preds, average='weighted', zero_division=0)
    
    classes = sorted(y_gold.unique().tolist())
    cm = confusion_matrix(y_gold, preds, labels=classes).tolist()
    report = classification_report(y_gold, preds, labels=classes, output_dict=True, zero_division=0)
    
    return {
        "gold_sample_count": len(gold_df),
        "status": "pending manual review",
        "accuracy": round(float(acc), 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_weight), 4),
        "confusion_matrix": {"labels": classes, "matrix": cm},
        "per_class": {cls: {
            "precision": round(report[cls]["precision"], 4),
            "recall": round(report[cls]["recall"], 4),
            "f1_score": round(report[cls]["f1-score"], 4),
            "support": int(report[cls]["support"])
        } for cls in classes if cls in report}
    }

def generate_methodology_report(metrics_data):
    """Write comprehensive reports/MODEL_METHODOLOGY.md."""
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    c_m = metrics_data["course_classification"]
    d_m = metrics_data["diet_classification"]
    abl = metrics_data["feature_ablation"]
    gold = metrics_data.get("gold_subset_evaluation", {})
    
    md = f"""# RasaLens: Classification Methodology & Audit Report

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
| **Logistic Regression** | **{c_m['models']['LogisticRegression']['accuracy']*100:.2f}%** | ±{c_m['models']['LogisticRegression']['metrics_std']['accuracy_std']*100:.2f}% | **{c_m['models']['LogisticRegression']['macro_f1']*100:.2f}%** | {c_m['models']['LogisticRegression']['weighted_f1']*100:.2f}% |
| **LinearSVC** | {c_m['models']['LinearSVC']['accuracy']*100:.2f}% | ±{c_m['models']['LinearSVC']['metrics_std']['accuracy_std']*100:.2f}% | {c_m['models']['LinearSVC']['macro_f1']*100:.2f}% | {c_m['models']['LinearSVC']['weighted_f1']*100:.2f}% |
| **Multinomial Naive Bayes** | {c_m['models']['MultinomialNB']['accuracy']*100:.2f}% | ±{c_m['models']['MultinomialNB']['metrics_std']['accuracy_std']*100:.2f}% | {c_m['models']['MultinomialNB']['macro_f1']*100:.2f}% | {c_m['models']['MultinomialNB']['weighted_f1']*100:.2f}% |
| **Random Forest** | {c_m['models']['RandomForest']['accuracy']*100:.2f}% | ±{c_m['models']['RandomForest']['metrics_std']['accuracy_std']*100:.2f}% | {c_m['models']['RandomForest']['macro_f1']*100:.2f}% | {c_m['models']['RandomForest']['weighted_f1']*100:.2f}% |

Champion Model: **{c_m['champion_model']}**

---

## 3. Feature Ablation Analysis
Evaluating Logistic Regression on different feature representations reveals the extent of title reliance:

| Feature Configuration | Accuracy | Macro F1 | Accuracy Delta vs Full |
| :--- | :--- | :--- | :--- |
| **Title + Ingredients (Full)** | **{abl['title_and_ingredients']['mean_accuracy']*100:.2f}%** | **{abl['title_and_ingredients']['mean_macro_f1']*100:.2f}%** | Baseline (0.00%) |
| **Ingredients Only** | {abl['ingredients_only']['mean_accuracy']*100:.2f}% | {abl['ingredients_only']['mean_macro_f1']*100:.2f}% | {abl['ingredients_only']['accuracy_delta']*100:+.2f}% |
| **Title Only** | {abl['title_only']['mean_accuracy']*100:.2f}% | {abl['title_only']['mean_macro_f1']*100:.2f}% | {abl['title_only']['accuracy_delta']*100:+.2f}% |

**Key Finding**: Operating strictly on *ingredients only* preserves **{abl['ingredients_only']['mean_accuracy']*100:.2f}%** accuracy, demonstrating that ingredient composition provides strong predictive signal even without explicit dish titles.

---

## 4. Evaluation on Gold Subset (`data/gold/course_gold.csv`)
- **Sample Count**: {gold.get('gold_sample_count', 200)} recipes
- **Status**: {gold.get('status', 'pending manual review')}
- **Gold Accuracy**: **{(gold.get('accuracy', 0)*100):.2f}%**
- **Gold Macro F1**: **{(gold.get('macro_f1', 0)*100):.2f}%**
- **Gold Weighted F1**: **{(gold.get('weighted_f1', 0)*100):.2f}%**

---

## 5. Secondary Task: Diet Classification
Predicting `Non-Vegetarian`, `Vegetarian`, and `Vegan` across the corpus using Stratified 5-Fold Cross Validation:

| Model Architecture | 5-Fold Mean Accuracy | Mean Macro F1 | Mean Weighted F1 |
| :--- | :--- | :--- | :--- |
| **Logistic Regression** | {d_m['models']['LogisticRegression']['accuracy']*100:.2f}% | {d_m['models']['LogisticRegression']['macro_f1']*100:.2f}% | {d_m['models']['LogisticRegression']['weighted_f1']*100:.2f}% |
| **LinearSVC** | {d_m['models']['LinearSVC']['accuracy']*100:.2f}% | {d_m['models']['LinearSVC']['macro_f1']*100:.2f}% | {d_m['models']['LinearSVC']['weighted_f1']*100:.2f}% |
| **Multinomial Naive Bayes** | {d_m['models']['MultinomialNB']['accuracy']*100:.2f}% | {d_m['models']['MultinomialNB']['macro_f1']*100:.2f}% | {d_m['models']['MultinomialNB']['weighted_f1']*100:.2f}% |
"""
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(md)
    logging.info(f"Saved methodology report to {REPORT_PATH}.")

def run_classification_experiments():
    logging.info("=== RasaLens Hardened Classification Benchmark (P1.1) ===")
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(METRICS_SAVE_PATH), exist_ok=True)
    
    df = prepare_data()
    total_samples = len(df)
    logging.info(f"Loaded {total_samples} recipes for classification.")
    
    # 1. Feature Ablation
    ablation_results = run_feature_ablation(df, target_col='course')
    
    # 2. Course Classification: Stratified 5-Fold CV
    logging.info("\n--- Running Course Classification Stratified 5-Fold CV ---")
    candidate_models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "MultinomialNB": MultinomialNB(alpha=0.1),
        "LinearSVC": LinearSVC(random_state=42, max_iter=2000, dual='auto'),
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    }
    
    course_cv = run_stratified_cv(df['title_and_ingredients'], df['course'], candidate_models, n_splits=5)
    best_course_model = max(course_cv, key=lambda k: course_cv[k]['mean_macro_f1'])
    logging.info(f"Best Course Model: {best_course_model} (Macro F1: {course_cv[best_course_model]['mean_macro_f1']:.4f})")
    
    # Fit and persist champion course model on full data
    champion_course_pipe = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)),
        ('clf', candidate_models[best_course_model])
    ])
    champion_course_pipe.fit(df['title_and_ingredients'], df['course'])
    joblib.dump(champion_course_pipe, MODEL_SAVE_PATH)
    logging.info(f"Persisted champion course classifier to {MODEL_SAVE_PATH}.")
    
    # 3. Gold Subset Evaluation
    logging.info("\n--- Evaluating Champion Model on Reviewable Gold Subset ---")
    gold_eval = evaluate_on_gold_subset(champion_course_pipe, GOLD_PATH, target_col='course')
    if gold_eval:
        logging.info(f"Gold Subset (200 recipes) Accuracy: {gold_eval['accuracy']:.4f}, Macro F1: {gold_eval['macro_f1']:.4f}")
        
    # 4. Diet Classification: Stratified 5-Fold CV
    logging.info("\n--- Running Diet Classification (Second Task) ---")
    diet_candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "MultinomialNB": MultinomialNB(alpha=0.1),
        "LinearSVC": LinearSVC(random_state=42, max_iter=2000, dual='auto')
    }
    diet_cv = run_stratified_cv(df['title_and_ingredients'], df['diet'], diet_candidates, n_splits=5)
    best_diet_model = max(diet_cv, key=lambda k: diet_cv[k]['mean_macro_f1'])
    
    champion_diet_pipe = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)),
        ('clf', diet_candidates[best_diet_model])
    ])
    champion_diet_pipe.fit(df['title_and_ingredients'], df['diet'])
    joblib.dump(champion_diet_pipe, DIET_MODEL_SAVE_PATH)
    logging.info(f"Persisted champion diet classifier to {DIET_MODEL_SAVE_PATH}.")
    
    # 5. Full Metrics Output
    output = {
        "concept": "Text Classification",
        "task_description": "Recipe Course and Diet classification with Stratified 5-Fold CV, feature ablation, and reviewable gold evaluation",
        "label_source": "rule-derived (weak supervision)",
        "course_classification": {
            "target": "course",
            "classes": sorted(df['course'].unique().tolist()),
            "class_distribution": df['course'].value_counts().to_dict(),
            "champion_model": best_course_model,
            "models": {
                name: {
                    "accuracy": course_cv[name]["mean_accuracy"],
                    "macro_f1": course_cv[name]["mean_macro_f1"],
                    "weighted_f1": course_cv[name]["mean_weighted_f1"],
                    "cv_folds": 5,
                    "metrics_std": {
                        "accuracy_std": course_cv[name]["std_accuracy"],
                        "macro_f1_std": course_cv[name]["std_macro_f1"]
                    }
                } for name in course_cv
            }
        },
        "feature_ablation": ablation_results,
        "gold_subset_evaluation": gold_eval,
        "diet_classification": {
            "target": "diet",
            "classes": sorted(df['diet'].unique().tolist()),
            "class_distribution": df['diet'].value_counts().to_dict(),
            "champion_model": best_diet_model,
            "models": {
                name: {
                    "accuracy": diet_cv[name]["mean_accuracy"],
                    "macro_f1": diet_cv[name]["mean_macro_f1"],
                    "weighted_f1": diet_cv[name]["mean_weighted_f1"]
                } for name in diet_cv
            }
        },
        "summary": {
            "course_champion": best_course_model,
            "course_mean_accuracy": course_cv[best_course_model]["mean_accuracy"],
            "course_mean_macro_f1": course_cv[best_course_model]["mean_macro_f1"],
            "gold_accuracy": gold_eval["accuracy"] if gold_eval else None,
            "diet_champion": best_diet_model,
            "diet_mean_accuracy": diet_cv[best_diet_model]["mean_accuracy"]
        }
    }
    
    # Backward compatibility with existing ModelLabPage chart reader
    output["champion_model"] = best_course_model
    output["models"] = output["course_classification"]["models"]
    
    with open(METRICS_SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    logging.info(f"Saved complete metrics to {METRICS_SAVE_PATH}.")
    
    # 6. Generate Methodology Documentation
    generate_methodology_report(output)
    
    print("\n================ CLASSIFICATION BENCHMARK SUMMARY (5-FOLD CV) ================")
    print(f"{'Model':<22} | {'Accuracy':<12} | {'Macro F1':<12} | {'Weighted F1':<12}")
    print("-" * 65)
    for name, m in course_cv.items():
        star = " * [CHAMPION]" if name == best_course_model else ""
        print(f"{name:<22} | {m['mean_accuracy']*100:6.2f}% ±{m['std_accuracy']*100:.1f}% | {m['mean_macro_f1']*100:6.2f}% ±{m['std_macro_f1']*100:.1f}% | {m['mean_weighted_f1']*100:6.2f}%{star}")
    print("\nFeature Ablation (Logistic Regression):")
    for feat, res in ablation_results.items():
        print(f"  {feat:<25}: Accuracy={res['mean_accuracy']*100:.2f}%, Macro F1={res['mean_macro_f1']*100:.2f}% (delta: {res['accuracy_delta']*100:+.2f}%)")
    if gold_eval:
        print(f"\nGold Subset (200 recipes): Accuracy={gold_eval['accuracy']*100:.2f}%, Macro F1={gold_eval['macro_f1']*100:.2f}%")
    print("================================================================================")

if __name__ == "__main__":
    run_classification_experiments()
