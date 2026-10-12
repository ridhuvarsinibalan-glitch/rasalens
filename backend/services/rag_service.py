import os
import json
import time
import logging
import joblib
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("rasalens.rag")

INDEX_PATH = os.path.join("models", "vector_index.faiss")
METADATA_PATH = os.path.join("models", "vector_metadata.joblib")

class RAGService:
    def __init__(self):
        self.embedder = None
        self.index = None
        self.metadata = []
        self._load_components()

    def _load_components(self):
        try:
            self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer (all-MiniLM-L6-v2) loaded.")
        except Exception as e:
            logger.error(f"Error loading SentenceTransformer: {e}")

        if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
            try:
                self.index = faiss.read_index(INDEX_PATH)
                self.metadata = joblib.load(METADATA_PATH)
                logger.info(f"FAISS index loaded with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Error loading FAISS index or metadata: {e}")
        else:
            logger.warning(f"Vector index missing at {INDEX_PATH}")

    def query(self, query_text: str, top_k: int = 5):
        t0 = time.time()
        if not self.index or not self.embedder:
            return {
                "query": query_text,
                "grounded_answer": "Vector retrieval index is not currently loaded.",
                "retrieved_recipes": [],
                "source_attribution": [],
                "latency_ms": 0.0,
                "is_llm_enhanced": False
            }

        # Translate Indic (Tamil / Hindi) queries to English for semantic embedding
        import re
        translated_query = None
        detected_lang = None
        embed_query = query_text

        if re.search(r"[\u0B80-\u0BFF\u0900-\u097F]", query_text):
            try:
                from backend.services.translation_service import translation_service
                trans_res = translation_service.translate(query_text, target_lang="eng_Latn")
                translated_query = trans_res.get("translated_text", "").strip()
                detected_lang = trans_res.get("detected_lang")
                if translated_query:
                    embed_query = translated_query
                    logger.info(f"Indic query translated for RAG: '{query_text}' -> '{embed_query}' ({detected_lang})")
            except Exception as e:
                logger.warning(f"Error translating Indic query for RAG: {e}")

        q_embed = self.embedder.encode([embed_query], normalize_embeddings=True).astype(np.float32)
        scores, indices = self.index.search(q_embed, min(top_k, self.index.ntotal))

        retrieved = []
        attributions = []

        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            item = self.metadata[idx]
            tokens = []
            try:
                tokens = json.loads(item['tokens_json'])
            except Exception:
                pass

            retrieved.append({
                "recipe_id": item['recipe_id'],
                "title": item['title'],
                "course": item['course'],
                "cuisine": item['cuisine'],
                "diet": item['diet'],
                "cooking_time_mins": item['cooking_time_mins'],
                "ingredients": tokens[:10],
                "instructions_snippet": item['instructions'][:200] + "...",
                "similarity_score": round(float(score), 4)
            })
            attributions.append(f"Recipe [{item['recipe_id']}] '{item['title']}' ({item['cuisine']} Cuisine)")

        # Synthesize Grounded Culinary Answer
        SIMILARITY_THRESHOLD = 0.40
        is_grounded = bool(retrieved and retrieved[0]["similarity_score"] >= SIMILARITY_THRESHOLD)

        if is_grounded:
            primary = retrieved[0]
            answer = (
                f"**Retrieval Grounding**: Based on the highest-scoring recipe **[{primary['recipe_id']}: {primary['title']}]** "
                f"({primary['cuisine']} Cuisine • {primary['course']} • {primary['diet']}):\n\n"
                f"• **Key Ingredients**: {', '.join(primary['ingredients'])}\n"
                f"• **Preparation Time**: Approximately {primary['cooking_time_mins']} minutes.\n"
                f"• **Culinary Method**: {primary['instructions_snippet']}\n\n"
                f"• **Related Variations Found**: " + ", ".join([f"*{r['title']}* (Similarity: {r['similarity_score']:.2f})" for r in retrieved[1:4]])
            )
        elif retrieved:
            highest_score = retrieved[0]["similarity_score"]
            total_corpus = len(self.metadata) if self.metadata else "culinary"
            answer = (
                f"No sufficiently relevant culinary recipe was found in the {total_corpus}-recipe corpus for this question "
                f"(highest similarity: {highest_score:.2f}, below confidence threshold {SIMILARITY_THRESHOLD}). "
                f"The RasaLens assistant is strictly grounded in culinary recipes and cannot answer out-of-domain queries."
            )
        else:
            answer = "No recipes matching the query were found in the knowledge base."

        latency = round((time.time() - t0) * 1000, 2)

        return {
            "query": query_text,
            "translated_query": translated_query,
            "detected_lang": detected_lang,
            "grounded_answer": answer,
            "retrieved_recipes": retrieved,
            "source_attribution": attributions,
            "latency_ms": latency,
            "is_llm_enhanced": False,
            "confidence_threshold": SIMILARITY_THRESHOLD,
            "is_grounded": is_grounded
        }

rag_service = RAGService()
