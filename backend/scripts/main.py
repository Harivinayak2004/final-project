from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
from openai import OpenAI
from pydantic import BaseModel
from .stress_manager import StressManager
from dotenv import load_dotenv


load_dotenv()  # this loads .env file
class ChatRequest(BaseModel):
    transcript: str
    emotion: str
    stress_score: float
    stress_level: int
    intent: str
# =============================
# APP INIT
# =============================
app = FastAPI(title="Stress Detection API")
CRISIS_WORDS = [
    "suicide",
    "kill myself",
    "self harm",
    "cut myself",
    "end my life",
    "i want to die",
    "killing myself",
    "going to die"
]


def is_crisis(text: str):
    text = text.lower()
    return any(word in text for word in CRISIS_WORDS)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stress_manager = StressManager()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Stress Detection API is running 🚀"}

@app.post("/predict")
async def predict_stress(
    file: UploadFile = File(None),
    text: str = None
):
    file_path = None

    try:

        # =====================
        # AUDIO INPUT
        # =====================
        if file is not None:

            unique_filename = f"{uuid.uuid4()}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            result = stress_manager.analyze_audio(file_path)
            transcript = result.get("transcript", "")
            print("TRANSCRIPT:", transcript)
            # 🚨 CRISIS DETECTION FOR SPEECH
            if is_crisis(transcript):
                return {
                    "success": True,
        "type": "audio",
        "crisis": True,
        "reply": "I'm really sorry you're feeling this way. You are not alone and support is available.",
        "helpline": {
            "name": "iCALL Mental Health Helpline",
            "image": "/helpline.jpg",
            "url": "https://icallhelpline.org/"
                    }
                        }
                
            text_stress_score = 0
            if transcript:
                text_response = client.chat.completions.create( model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
Analyze the emotional stress in the student's text.

Return JSON with:
emotion: neutral | happy | fearful | angry | sad
stress_score: number from 0-100
"""
            },
            {
                "role": "user",
                "content": transcript
            }
        ],
        response_format={"type": "json_object"}
    )
            text_result = eval(text_response.choices[0].message.content)
            text_stress_score = text_result["stress_score"]
            audio_stress = result["stress_score"]
            final_stress = (0.7 * audio_stress) + (0.3 * text_stress_score)
            result["stress_score"] = final_stress
            if final_stress < 20:
                result["stress_level"] = 0
            elif final_stress < 40:
                result["stress_level"] = 1
            elif final_stress < 60:
                result["stress_level"] = 2
            elif final_stress < 80:
                result["stress_level"] = 3
            else:
                result["stress_level"] = 4
            return {
                "success": True,
                "type": "audio",
                "data": result
                }
        # =====================
        # TEXT INPUT
        # =====================
        elif text:

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """
You are a compassionate AI assistant that supports students experiencing stress or emotional difficulties.

Respond empathetically and supportively. Provide encouragement, coping suggestions, or reflective questions if needed.

Keep responses concise and caring.Don't be clinical - be warm and human in your tone.Give diffferent responses for different messages and avoid repeating the same phrases. Always be supportive and understanding.Give some coping mechanisms and ask them to do something so that the detected emotion can be handled.Don't do this for every message.Give replies strictly based on text input.
"""
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                temperature=0.7,
            )

            return {
                "success": True,
                "type": "text",
                "reply": response.choices[0].message.content
            }

        else:
            return {
                "success": False,
                "error": "Provide either audio file or text"
            }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            
@app.post("/chat")
async def chat_with_ai(data: ChatRequest):

    if is_crisis(data.transcript):
        return {
        "success": True,
        "reply": "I'm really sorry you're feeling this way. You are not alone and support is available. It might help to speak with someone trained to listen and support you.",
        "crisis": True,
        "helpline": {
            "name": "iCALL Mental Health Helpline",
            "image": "/helpline.jg",
            "url": "https://icallhelpline.org/"
        }
    }
    try:
        system_prompt = f"""
        You are a compassionate AI assistant that supports students experiencing stress or emotional difficulties. Your role is to understand the student’s feelings, respond empathetically, and provide thoughtful encouragement, coping suggestions, or reflective questions to help them manage stress and feel supported.


Student emotional state:
- Transcript: "{data.transcript}"
- Detected emotion: {data.emotion}
- Stress score: {data.stress_score}/100
- Stress level: {data.stress_level}
- Intent category: {data.intent}

Respond supportively based on stress level:
0 → positive reinforcement
1 → gentle support
2 → emotional validation + coping advice
3 → calming techniques + structured help
4 → crisis-level guidance (encourage real-world help)

Keep response empathetic, supportive, and concise.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.transcript}
            ],
            temperature=0.7,
        )

        return {
            "success": True,
            "reply": response.choices[0].message.content
        }

    except Exception as e:
        return {"success": False, "error": str(e)}