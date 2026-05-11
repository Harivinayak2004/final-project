# =============================
# IMPORTS
# =============================
import time
import os
import torch
import librosa
import joblib
import whisper
import torch.nn.functional as F
from collections import deque
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification


# =============================
# CONFIG
# =============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "wav2vec2_finetuned")
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
SAMPLE_RATE = 16000

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", DEVICE)


# =============================
# LOAD MODELS (LOAD ONCE)
# =============================
print("Loading wav2vec2 model...")
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)

emotion_model = Wav2Vec2ForSequenceClassification.from_pretrained(
    MODEL_PATH
).to(DEVICE)

emotion_model.eval()

print("Loading label encoder...")
label_encoder = joblib.load(LABEL_ENCODER_PATH)

print("Loading Whisper model...")
whisper_model = whisper.load_model("base")


# =============================
# EMOTION SEVERITY TABLE
# =============================
EMOTION_SEVERITY = {
    "happy": 10,
    "neutral": 30,
    "sad": 60,
    "angry": 80,
    "fearful": 85
}

NEGATIVE_EMOTIONS = {"sad", "angry", "fearful"}


# =============================
# STRESS MANAGER
# =============================
class StressManager:
    def __init__(self, history_size=10):
        self.emotion_history = deque(maxlen=history_size)
        self.stress_score = 20.0
        self.last_update = time.time()

    # --------------------------------
    # Emotion Prediction
    # --------------------------------
    def predict_emotion(self, audio_path):
        audio, sr = librosa.load(audio_path, sr=SAMPLE_RATE)

        inputs = processor(
            audio,
            sampling_rate=SAMPLE_RATE,
            return_tensors="pt",
            padding=True
        )

        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = emotion_model(**inputs)

        probs = F.softmax(outputs.logits, dim=-1)
        idx = torch.argmax(probs, dim=-1).item()

        confidence = probs[0, idx].item()
        emotion = label_encoder.inverse_transform([idx])[0]

        return emotion, confidence

    # --------------------------------
    # Speech-to-Text
    # --------------------------------
    def transcribe(self, audio_path):
        result = whisper_model.transcribe(audio_path)
        print("WHISPER RAW OUTPUT:", result)  # 👈 add this
        return result["text"]

    # --------------------------------
    # Stress Score Update
    # --------------------------------
    def update_stress_score(self, emotion, confidence):
        now = time.time()

        severity = EMOTION_SEVERITY.get(emotion, 30)
        emotion_component = severity * confidence

        recent_neg = sum(e in NEGATIVE_EMOTIONS for e, _ in self.emotion_history)
        trend_component = min(recent_neg * 5, 20)

        time_gap = now - self.last_update
        decay = min(time_gap / 60, 5)

        delta = (
            0.6 * emotion_component +
            0.4 * trend_component
        )

        self.stress_score = 0.7 * self.stress_score + 0.3 * delta
        self.stress_score -= decay

        self.stress_score = max(0, min(self.stress_score, 100))

        self.emotion_history.append((emotion, now))
        self.last_update = now

    # --------------------------------
    # Stress Level Mapping
    # --------------------------------
    def get_stress_level(self):
        if self.stress_score < 20:
            return 0
        elif self.stress_score < 40:
            return 1
        elif self.stress_score < 60:
            return 2
        elif self.stress_score < 80:
            return 3
        else:
            return 4

    def get_intent(self, level):
        return [
            "casual_support",
            "light_reassurance",
            "emotional_support",
            "calming_support",
            "crisis_support"
        ][level]

    # --------------------------------
    # FULL PIPELINE
    # --------------------------------
    def analyze_audio(self, audio_path):
        emotion, confidence = self.predict_emotion(audio_path)
        transcript = self.transcribe(audio_path)

        self.update_stress_score(emotion, confidence)
        level = self.get_stress_level()

        return {
            "emotion": emotion,
            "confidence": round(confidence, 3),
            "stress_score": round(self.stress_score, 1),
            "stress_level": level,
            "intent": self.get_intent(level),
            "transcript": transcript
        }