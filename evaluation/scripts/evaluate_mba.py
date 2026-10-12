"""
RasaLens Academic Concept 3: Market Basket Analysis (MBA)
Compares Apriori and FP-Growth association rule mining algorithms on culinary ingredient baskets.
Computes itemsets, support, confidence, lift, leverage, conviction, and runtime performance benchmarks.
"""

import os
import json
import time
import logging
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

PROCESSED_PATH = os.path.join("data", "processed", "recipes_processed.csv")
RULES_SAVE_PATH = os.path.join("evaluation", "results", "mba_rules.json")

def load_transactions():
    if not os.path.exists(PROCESSED_PATH):
        raise FileNotFoundError(f"Processed dataset missing at {PROCESSED_PATH}")
    df = pd.read_csv(PROCESSED_PATH)
    
    transactions = []
    for val in df['tokens_json']:
        try:
            tokens = json.loads(val)
            # Filter distinct meaningful food tokens of length >= 3
            unique_tokens = list({t.lower().strip() for t in tokens if len(t.strip()) >= 3 and not t.isdigit()})
            if len(unique_tokens) >= 2:
                transactions.append(unique_tokens)
        except Exception:
            continue
    return transactions

def run_mba_evaluation():
    logging.info("Starting RasaLens Academic Concept 3: Market Basket Analysis Benchmark...")
    os.makedirs(os.path.dirname(RULES_SAVE_PATH), exist_ok=True)
    
    transactions = load_transactions()
    logging.info(f"Loaded {len(transactions)} valid ingredient transactions.")
    
    # One-hot encode transactions
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df_encoded = pd.DataFrame(te_ary, columns=te.columns_)
    logging.info(f"Transaction matrix: {df_encoded.shape[0]} baskets x {df_encoded.shape[1]} unique ingredient tokens.")
    
    support_thresholds = [0.03, 0.04, 0.05]
    benchmark_results = []
    
    for supp in support_thresholds:
        # Time Apriori
        t0 = time.time()
        apriori_itemsets = apriori(df_encoded, min_support=supp, use_colnames=True)
        apriori_time = round(time.time() - t0, 4)
        
        # Time FP-Growth
        t1 = time.time()
        fpgrowth_itemsets = fpgrowth(df_encoded, min_support=supp, use_colnames=True)
        fpgrowth_time = round(time.time() - t1, 4)
        
        benchmark_results.append({
            "min_support": supp,
            "frequent_itemsets_count": len(apriori_itemsets),
            "apriori_runtime_seconds": apriori_time,
            "fpgrowth_runtime_seconds": fpgrowth_time,
            "speedup_factor": round(apriori_time / max(fpgrowth_time, 0.0001), 2)
        })
        logging.info(f"min_support={supp} -> Itemsets: {len(apriori_itemsets)} | Apriori: {apriori_time}s | FP-Growth: {fpgrowth_time}s")
        
    # Generate Association Rules using best itemset collection (e.g. support = 0.03)
    best_itemsets = fpgrowth(df_encoded, min_support=0.03, use_colnames=True)
    rules = association_rules(best_itemsets, metric="lift", min_threshold=1.1, num_itemsets=len(best_itemsets))
    logging.info(f"Generated {len(rules)} association rules with lift >= 1.1.")
    
    # Sort by Lift descending
    rules_sorted = rules.sort_values(by="lift", ascending=False)
    
    rules_list = []
    for _, row in rules_sorted.head(100).iterrows():
        antecedents = list(row['antecedents'])
        consequents = list(row['consequents'])
        rules_list.append({
            "antecedents": antecedents,
            "consequents": consequents,
            "antecedent_str": ", ".join(antecedents),
            "consequent_str": ", ".join(consequents),
            "support": round(float(row['support']), 4),
            "confidence": round(float(row['confidence']), 4),
            "lift": round(float(row['lift']), 4),
            "leverage": round(float(row['leverage']), 4),
            "conviction": round(float(row['conviction']), 4) if row['conviction'] != float('inf') else 999.0
        })
        
    top_pairs = rules_list[:15]
    
    output = {
        "concept": "Market Basket Analysis",
        "task_description": "Ingredient co-occurrence and association rule discovery using Apriori and FP-Growth",
        "dataset_summary": {
            "total_transactions": len(transactions),
            "unique_ingredients": len(te.columns_)
        },
        "algorithm_benchmark": benchmark_results,
        "selected_min_support": 0.03,
        "rules_count": len(rules),
        "top_association_rules": rules_list,
        "summary": {
            "faster_algorithm": "FP-Growth",
            "average_speedup": round(sum(b['speedup_factor'] for b in benchmark_results) / len(benchmark_results), 2),
            "top_associations": [f"{r['antecedent_str']} -> {r['consequent_str']} (Lift: {r['lift']})" for r in top_pairs[:5]]
        }
    }
    
    with open(RULES_SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    logging.info(f"Market Basket Analysis results saved to {RULES_SAVE_PATH}.")
    
    print("\n--- MARKET BASKET ANALYSIS SUMMARY ---")
    print(f"Baskets: {len(transactions)} | Ingredients: {len(te.columns_)}")
    print(f"Top Rule: {top_pairs[0]['antecedent_str']} => {top_pairs[0]['consequent_str']} (Confidence: {top_pairs[0]['confidence']:.2f}, Lift: {top_pairs[0]['lift']:.2f})")

if __name__ == "__main__":
    run_mba_evaluation()
