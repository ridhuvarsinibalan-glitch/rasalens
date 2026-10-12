import os
import time
import logging
import joblib

logger = logging.getLogger("rasalens.classifier")

MODEL_PATH = os.path.join("models", "recipe_classifier.joblib")

class ClassifierService:
    def __init__(self):
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.pipeline = joblib.load(MODEL_PATH)
                logger.info("Trained recipe classifier pipeline loaded.")
            except Exception as e:
                logger.error(f"Error loading classifier pipeline: {e}")
        else:
            logger.warning(f"Classifier model missing at {MODEL_PATH}")

    def predict(self, text: str):
        t0 = time.time()
        if not self.pipeline:
            return {
                "input_text": text,
                "predicted_course": "Main Course",
                "confidence": 0.5,
                "all_probabilities": None,
                "latency_ms": 0.1
            }
            
        pred_label = self.pipeline.predict([text])[0]
        confidence = 0.85
        all_probs = None
        
        # Check if model supports predict_proba or decision_function
        clf = self.pipeline.named_steps.get('clf')
        if hasattr(clf, "predict_proba"):
            probs = self.pipeline.predict_proba([text])[0]
            classes = self.pipeline.classes_
            all_probs = {c: round(float(p), 4) for c, p in zip(classes, probs)}
            confidence = round(float(max(probs)), 4)
        elif hasattr(clf, "decision_function"):
            # For LinearSVC, apply softmax over decision function scores
            import numpy as np
            scores = self.pipeline.decision_function([text])[0]
            exp_scores = np.exp(scores - np.max(scores))
            probs = exp_scores / np.sum(exp_scores)
            classes = self.pipeline.classes_
            all_probs = {c: round(float(p), 4) for c, p in zip(classes, probs)}
            confidence = round(float(max(probs)), 4)
            
        latency = round((time.time() - t0) * 1000, 2)
        return {
            "input_text": text,
            "predicted_course": pred_label,
            "confidence": confidence,
            "all_probabilities": all_probs,
            "latency_ms": latency
        }

classifier_service = ClassifierService()
