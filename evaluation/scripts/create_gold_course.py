"""
Create 200-recipe reviewable gold dataset for Course and Diet classification audit.
Marked 'pending manual review'.
"""

import os
import json
import pandas as pd

PROCESSED_PATH = os.path.join("data", "processed", "recipes_processed.csv")
OUT_PATH = os.path.join("data", "gold", "course_gold.csv")

def main():
    if not os.path.exists(PROCESSED_PATH):
        raise FileNotFoundError(f"Processed recipes missing at {PROCESSED_PATH}")
        
    df = pd.read_csv(PROCESSED_PATH)
    
    sample_per_course = {
        'Main Course': 60,
        'Dessert': 45,
        'Appetizer & Side': 45,
        'Breakfast': 25,
        'Beverage': 25
    }

    gold_dfs = []
    for course, count in sample_per_course.items():
        sub = df[df['course'] == course]
        n = min(count, len(sub))
        gold_dfs.append(sub.sample(n=n, random_state=42))

    gold_df = pd.concat(gold_dfs).sample(frac=1.0, random_state=42).reset_index(drop=True)

    def format_tokens(t_str):
        try:
            toks = json.loads(t_str) if isinstance(t_str, str) else []
            return ", ".join(toks[:8])
        except Exception:
            return ""

    out_df = pd.DataFrame({
        'recipe_id': gold_df['recipe_id'],
        'title': gold_df['title'],
        'ingredients_summary': gold_df['tokens_json'].apply(format_tokens),
        'etl_course': gold_df['course'],
        'gold_course': gold_df['course'],  # Ready for manual verification
        'etl_diet': gold_df['diet'],
        'gold_diet': gold_df['diet'],      # Ready for manual verification
        'status': 'pending manual review',
        'auditor_notes': 'Inspect and correct gold_course or gold_diet if rule-derived label is inaccurate'
    })

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    out_df.to_csv(OUT_PATH, index=False)
    print(f"Created {OUT_PATH} with {len(out_df)} records.")
    print("Class distribution:")
    for k, v in out_df['etl_course'].value_counts().items():
        print(f"  {k}: {v}")

if __name__ == "__main__":
    main()
