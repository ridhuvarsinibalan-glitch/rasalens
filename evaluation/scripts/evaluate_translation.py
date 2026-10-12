import os
import sys
import json
import time
import pandas as pd
import sacrebleu
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

TESTSET_PATH = os.path.join("data", "eval", "translation_testset.csv")
OUTPUT_METRICS_PATH = os.path.join("evaluation", "results", "translation_metrics.json")
MODEL_NAME = "facebook/nllb-200-distilled-600M"

DIRECTIONS = [
    {
        "key": "en_to_ta",
        "name": "English to Tamil",
        "src_lang": "eng_Latn",
        "tgt_lang": "tam_Taml",
        "input_col": "en_sentence",
        "ref_col": "ta_reference"
    },
    {
        "key": "en_to_hi",
        "name": "English to Hindi",
        "src_lang": "eng_Latn",
        "tgt_lang": "hin_Deva",
        "input_col": "en_sentence",
        "ref_col": "hi_reference"
    },
    {
        "key": "ta_to_en",
        "name": "Tamil to English",
        "src_lang": "tam_Taml",
        "tgt_lang": "eng_Latn",
        "input_col": "ta_reference",
        "ref_col": "en_sentence"
    },
    {
        "key": "hi_to_en",
        "name": "Hindi to English",
        "src_lang": "hin_Deva",
        "tgt_lang": "eng_Latn",
        "input_col": "hi_reference",
        "ref_col": "en_sentence"
    }
]

def batch_translate(model, tokenizer, texts, src_lang, tgt_lang, batch_size=8, max_length=128):
    tokenizer.src_lang = src_lang
    forced_bos_token_id = tokenizer.convert_tokens_to_ids(tgt_lang)
    
    outputs = []
    latencies = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        t0 = time.time()
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
        generated = model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_new_tokens=max_length
        )
        decoded = tokenizer.batch_decode(generated, skip_special_tokens=True)
        batch_duration_ms = (time.time() - t0) * 1000
        per_item_ms = batch_duration_ms / len(batch)
        
        outputs.extend(decoded)
        latencies.extend([per_item_ms] * len(batch))
        print(f"  Processed {min(i + batch_size, len(texts))}/{len(texts)} samples (avg {per_item_ms:.1f}ms/sent)...")
        
    return outputs, latencies

def main():
    print(f"=== Evaluating Translation with SacreBLEU & chrF ===")
    if not os.path.exists(TESTSET_PATH):
        print(f"Error: Testset not found at {TESTSET_PATH}")
        sys.exit(1)
        
    df = pd.read_csv(TESTSET_PATH)
    print(f"Loaded testset from {TESTSET_PATH}: {len(df)} samples")
    
    print(f"Loading NLLB-200 model: {MODEL_NAME}...")
    t_load = time.time()
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    print(f"Model loaded in {time.time() - t_load:.2f}s")
    
    metrics_by_dir = {}
    
    for d in DIRECTIONS:
        key = d["key"]
        print(f"\n--- Evaluating {d['name']} ({d['src_lang']} -> {d['tgt_lang']}) ---")
        inputs = df[d["input_col"]].astype(str).tolist()
        references = df[d["ref_col"]].astype(str).tolist()
        
        hypotheses, latencies = batch_translate(
            model=model,
            tokenizer=tokenizer,
            texts=inputs,
            src_lang=d["src_lang"],
            tgt_lang=d["tgt_lang"],
            batch_size=8,
            max_length=128
        )
        
        # sacrebleu expects references as a list of reference streams: [[ref1, ref2, ...]]
        bleu = sacrebleu.corpus_bleu(hypotheses, [references])
        chrf = sacrebleu.corpus_chrf(hypotheses, [references])
        avg_lat = sum(latencies) / len(latencies) if latencies else 0.0
        
        print(f"  Result -> SacreBLEU: {bleu.score:.2f} | chrF: {chrf.score:.2f} | Avg Latency: {avg_lat:.1f} ms")
        
        sample_pairs = []
        for i in range(min(5, len(inputs))):
            sample_pairs.append({
                "id": int(df.iloc[i].get("id", i + 1)),
                "input": inputs[i],
                "reference": references[i],
                "hypothesis": hypotheses[i],
                "latency_ms": round(latencies[i], 1)
            })
            
        metrics_by_dir[key] = {
            "name": d["name"],
            "source_lang": d["src_lang"],
            "target_lang": d["tgt_lang"],
            "sample_count": len(inputs),
            "bleu": round(float(bleu.score), 2),
            "chrf": round(float(chrf.score), 2),
            "avg_latency_ms": round(float(avg_lat), 1),
            "sample_pairs": sample_pairs
        }
        
    mean_bleu = sum(m["bleu"] for m in metrics_by_dir.values()) / len(metrics_by_dir)
    mean_chrf = sum(m["chrf"] for m in metrics_by_dir.values()) / len(metrics_by_dir)
    mean_lat = sum(m["avg_latency_ms"] for m in metrics_by_dir.values()) / len(metrics_by_dir)
    
    final_output = {
        "model_name": MODEL_NAME,
        "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "testset_path": TESTSET_PATH,
        "testset_samples": len(df),
        "testset_status": "pending manual review",
        "metric_libraries": {
            "sacrebleu_version": sacrebleu.__version__
        },
        "summary": {
            "mean_bleu": round(mean_bleu, 2),
            "mean_chrf": round(mean_chrf, 2),
            "mean_latency_ms": round(mean_lat, 1)
        },
        "directions": metrics_by_dir
    }
    
    os.makedirs(os.path.dirname(OUTPUT_METRICS_PATH), exist_ok=True)
    with open(OUTPUT_METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
        
    print(f"\n==========================================")
    print(f"Translation Metrics saved to: {OUTPUT_METRICS_PATH}")
    print(f"Summary: Mean BLEU = {mean_bleu:.2f}, Mean chrF = {mean_chrf:.2f}, Mean Latency = {mean_lat:.1f}ms")
    print(f"==========================================")

if __name__ == "__main__":
    main()
