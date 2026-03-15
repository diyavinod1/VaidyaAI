from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
import json
import re
import math
import traceback
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
import base64
import asyncio

load_dotenv()

app = FastAPI(title="Multilingual AI Symptom Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Primary: SambaNova ──────────────────────────────────────────────────────
SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY", "")
sambanova_client = OpenAI(
    api_key=SAMBANOVA_API_KEY,
    base_url="https://api.sambanova.ai/v1",
)
SAMBANOVA_MODEL = "Meta-Llama-3.3-70B-Instruct"   # 20 RPM free tier

# ── Fallback: Groq (30 RPM free, no payment needed) ─────────────────────────
# Get free key at: https://console.groq.com  →  "Create API Key"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = OpenAI(
    api_key=GROQ_API_KEY or "dummy",
    base_url="https://api.groq.com/openai/v1",
) if GROQ_API_KEY else None
GROQ_MODEL = "llama-3.3-70b-versatile"   # same model family, 30 RPM free

# Language code -> full name mapping for system prompt enforcement
LANGUAGE_NAMES = {
    "en": "English",
    "ta": "Tamil (தமிழ்)",
    "hi": "Hindi (हिन्दी)",
    "ml": "Malayalam (മലയാളം)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
}

def build_system_prompt(language_code: str) -> str:
    lang_name = LANGUAGE_NAMES.get(language_code, "English")
    return f"""You are VaidyaAI, a friendly and caring health assistant — like a kind doctor or nurse speaking directly to a patient.

═══ LANGUAGE RULE (STRICT) ═══
You MUST respond ONLY in {lang_name}.
Do NOT mix languages. Every single word must be in {lang_name}.
This is mandatory. No exceptions.

═══ TONE & STYLE ═══
You must ALWAYS sound warm, human, and conversational — never robotic or like a medical textbook.

GOOD response style:
"Okay, I understand. You have a fever.
Let me ask you a couple of quick questions so I can help better.
How long have you been feeling this way?
And is the fever mild or quite high?"

BAD response style (NEVER do this):
"Fever is a symptom that can be associated with many underlying pathological conditions requiring differential diagnosis."

Rules for every response:
- Use SHORT sentences. Never write long paragraphs.
- Start by acknowledging what the patient said (1 sentence).
- Then ask 1 or 2 simple follow-up questions.
- Use everyday words. Avoid medical jargon.
- Sound calm, kind, and supportive at all times.
- Write the way a caring doctor would speak — not the way a textbook is written.

BAD question: "Are you experiencing any associated symptoms such as myalgia or cephalalgia?"
GOOD question: "Are you also having things like headache, body pain, or cough?"

BAD question: "What is the duration and intensity of the symptom?"
GOOD question: "How long have you been feeling this way? And is it mild or quite bad?"

═══ EMERGENCY RED FLAGS ═══
If you detect ANY of these, immediately stop and urgently warn the patient in {lang_name}:
- Chest pain with breathlessness or sweating
- Sudden severe headache (worst of their life)
- Face drooping, arm weakness, or slurred speech (stroke signs)
- Severe bleeding that will not stop
- Unconsciousness or not responding
- Difficulty breathing or choking
- High fever with stiff neck

For emergencies, say something like: "This sounds serious. Please call 108 or go to the nearest hospital right away."

═══ SPECIALIST ROUTING ═══
Heart/chest → Cardiologist
Head/dizziness/numbness → Neurologist
Skin → Dermatologist
Bones/joints/muscles → Orthopedic Doctor
Ear/nose/throat → ENT Specialist
Child under 12 → Pediatrician
Diabetes/thyroid/hormones → Endocrinologist
Stomach/digestion → Gastroenterologist
Eyes → Ophthalmologist
General or unclear → General Physician

When you mention a specialist, explain it simply — e.g. "a heart doctor (Cardiologist)".

═══ CONVERSATION RULES ═══
- NEVER diagnose a disease. Say "this could be related to..." not "you have...".
- Always end by saying the patient should see a doctor.
- Ask at least 3 follow-up questions across the conversation before giving final analysis.
- Ask about: (1) how long, (2) how bad, (3) any other symptoms — one at a time, naturally.
- Do NOT give the JSON analysis on the first or second reply. Ask questions first.

═══ FINAL ANALYSIS FORMAT ═══
Only after enough questions, include this JSON block ONCE at the end of your reply:
```json
{{
  "analysis": true,
  "conditions": ["possible area 1", "possible area 2"],
  "specialist": "Doctor type to see",
  "severity": 6,
  "confidence": 78,
  "is_emergency": false,
  "emergency_message": "",
  "follow_up_summary": "Short summary of what the patient described — in {lang_name}",
  "advice": "Simple next step advice — in {lang_name}"
}}
```

Remember: RESPOND ONLY IN {lang_name}. Sound human, warm, and simple. This is mandatory."""


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str


class SymptomChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: Optional[str] = "en"


class AnalyzeRequest(BaseModel):
    conversation: List[ChatMessage]
    symptoms_summary: str
    language: Optional[str] = "en"


class SummaryRequest(BaseModel):
    conversation: List[ChatMessage]
    patient_phone: Optional[str] = None
    language: Optional[str] = "en"


# ---------------------------------------------------------------------------
# AI call — SambaNova primary, Groq fallback, longer waits on 429
# ---------------------------------------------------------------------------

def _call_one_provider(client, model, openai_messages, provider_name):
    """
    Call a single provider with retry + exponential backoff on 429.
    Raises RateLimitError after exhausting retries so caller can try next provider.
    """
    import time
    from openai import RateLimitError

    # Wait long enough for the 60-second SambaNova rate-limit window to reset
    waits = [20, 40, 65]   # seconds between retries

    for attempt, wait in enumerate(waits):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=openai_messages,
                max_tokens=1024,
                temperature=0.7,
            )
            return response.choices[0].message.content

        except RateLimitError:
            print(f"[AI] {provider_name} rate limit hit (attempt {attempt + 1}/3). Waiting {wait}s…")
            time.sleep(wait)

    # Final attempt after last wait
    try:
        response = client.chat.completions.create(
            model=model,
            messages=openai_messages,
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except RateLimitError as e:
        raise e   # re-raise so caller can switch providers


def call_ai(messages, language: str = "en"):
    """
    Call AI with language-enforcing system prompt.

    Provider order:
      1. SambaNova  (SAMBANOVA_API_KEY)  — primary
      2. Groq       (GROQ_API_KEY)       — fallback if SambaNova rate-limited
    """
    from openai import RateLimitError

    system_prompt = build_system_prompt(language)
    openai_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        role = "assistant" if msg["role"] in ("assistant", "model") else "user"
        openai_messages.append({"role": role, "content": msg["content"]})

    # ── Attempt SambaNova ────────────────────────────────────────────────────
    try:
        result = _call_one_provider(sambanova_client, SAMBANOVA_MODEL, openai_messages, "SambaNova")
        print("[AI] SambaNova responded OK")
        return result
    except RateLimitError:
        print("[AI] SambaNova exhausted. Trying Groq fallback…")

    # ── Attempt Groq fallback ────────────────────────────────────────────────
    if groq_client:
        try:
            result = _call_one_provider(groq_client, GROQ_MODEL, openai_messages, "Groq")
            print("[AI] Groq responded OK")
            return result
        except RateLimitError:
            pass

    raise RuntimeError(
        "Both SambaNova and Groq rate limits exhausted. "
        "Please wait 1 minute and try again, or add GROQ_API_KEY to .env for a second provider."
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "VaidyaAI API is running",
        "version": "2.0.0",
        "ai_backend": "SambaNova – Meta-Llama-3.1-8B-Instruct",
        "supported_languages": list(LANGUAGE_NAMES.keys()),
    }


@app.post("/symptom_chat")
async def symptom_chat(request: SymptomChatRequest):
    """Handle one AI conversation turn. Language enforced via system prompt."""
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        ai_response = call_ai(messages, language=request.language or "en")

        is_analysis = (
            '"analysis": true' in ai_response
            or '"analysis":true' in ai_response
        )

        analysis_data = None
        if is_analysis:
            json_match = re.search(r"```json\s*(.*?)\s*```", ai_response, re.DOTALL)
            if json_match:
                try:
                    analysis_data = json.loads(json_match.group(1))
                except Exception:
                    pass

        return {
            "response": ai_response,
            "is_analysis": is_analysis,
            "analysis_data": analysis_data,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_symptoms(request: AnalyzeRequest):
    """Force a structured JSON analysis of the collected conversation."""
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.conversation]
        messages.append({
            "role": "user",
            "content": (
                "Based on all the symptoms I have described ("
                + request.symptoms_summary
                + "), please provide your complete medical triage analysis in the JSON format."
            ),
        })

        ai_response = call_ai(messages, language=request.language or "en")

        json_match = re.search(r"```json\s*(.*?)\s*```", ai_response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        try:
            return json.loads(ai_response)
        except Exception:
            return {
                "analysis": True,
                "conditions": ["Requires in-person evaluation"],
                "specialist": "General Physician",
                "severity": 5,
                "confidence": 60,
                "is_emergency": False,
                "emergency_message": "",
                "follow_up_summary": request.symptoms_summary,
                "advice": "Please visit a doctor for proper evaluation.",
            }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/hospitals")
async def get_hospitals(lat: float, lon: float, radius: int = 5000):
    """Fetch real nearby hospitals using OpenStreetMap Overpass API."""
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"
        r, la, lo = str(radius), str(lat), str(lon)
        query = (
            "[out:json][timeout:25];\n(\n"
            "  node[\"amenity\"=\"hospital\"](around:" + r + "," + la + "," + lo + ");\n"
            "  node[\"amenity\"=\"clinic\"](around:" + r + "," + la + "," + lo + ");\n"
            "  node[\"healthcare\"=\"hospital\"](around:" + r + "," + la + "," + lo + ");\n"
            "  node[\"healthcare\"=\"clinic\"](around:" + r + "," + la + "," + lo + ");\n"
            "  way[\"amenity\"=\"hospital\"](around:" + r + "," + la + "," + lo + ");\n"
            "  way[\"amenity\"=\"clinic\"](around:" + r + "," + la + "," + lo + ");\n"
            ");\nout center meta;\n"
        )

        async with httpx.AsyncClient(timeout=30.0) as http_client:
            resp = await http_client.post(overpass_url, data={"data": query})
            data = resp.json()

        hospitals = []
        seen_names = set()

        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name") or tags.get("name:en") or tags.get("name:ta")
            if not name or name in seen_names:
                continue
            seen_names.add(name)

            if element["type"] == "node":
                elat, elon = element["lat"], element["lon"]
            elif element["type"] == "way" and "center" in element:
                elat, elon = element["center"]["lat"], element["center"]["lon"]
            else:
                continue

            dlat = math.radians(elat - lat)
            dlon = math.radians(elon - lon)
            a = (
                math.sin(dlat / 2) ** 2
                + math.cos(math.radians(lat))
                * math.cos(math.radians(elat))
                * math.sin(dlon / 2) ** 2
            )
            distance_km = round(6371 * 2 * math.asin(math.sqrt(a)), 2)

            amenity = tags.get("amenity", tags.get("healthcare", "clinic"))
            specialties = []
            if tags.get("emergency") == "yes":
                specialties.append("Emergency")
            if amenity == "hospital":
                specialties.extend(["General Medicine", "Emergency Care"])
            else:
                specialties.append("General Practice")

            hospitals.append({
                "id": element["id"],
                "name": name,
                "lat": elat,
                "lon": elon,
                "distance_km": distance_km,
                "type": amenity,
                "specialties": specialties,
                "phone": tags.get("phone") or tags.get("contact:phone", ""),
                "website": tags.get("website") or tags.get("contact:website", ""),
                "address": tags.get("addr:full") or (
                    (tags.get("addr:street", "") + " " + tags.get("addr:city", "")).strip()
                ),
                "opening_hours": tags.get("opening_hours", ""),
                "emergency": tags.get("emergency", "no"),
                "maps_link": "https://www.openstreetmap.org/?mlat=" + str(elat) + "&mlon=" + str(elon) + "&zoom=17",
                "directions_link": "https://www.google.com/maps/dir/?api=1&destination=" + str(elat) + "," + str(elon),
            })

        hospitals.sort(key=lambda x: x["distance_km"])
        return {"hospitals": hospitals[:20], "total": len(hospitals)}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Hospital search failed: " + str(e))


@app.post("/summary")
async def generate_summary(request: SummaryRequest):
    """Generate a structured printable doctor summary card."""
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.conversation]
        summary_prompt = (
            "Generate a concise, professional medical triage summary card for the doctor "
            "based on this conversation. Format it as JSON:\n"
            "{\n"
            "  \"patient_summary\": {\n"
            "    \"chief_complaint\": \"Main symptom in one line\",\n"
            "    \"reported_symptoms\": [\"symptom 1\", \"symptom 2\"],\n"
            "    \"duration\": \"How long symptoms have been present\",\n"
            "    \"severity_level\": \"Mild/Moderate/Severe\",\n"
            "    \"ai_follow_up_qa\": [{\"question\": \"Q\", \"answer\": \"A\"}],\n"
            "    \"suggested_specialty\": \"Recommended specialist\",\n"
            "    \"severity_score\": 7,\n"
            "    \"red_flags_detected\": [\"any emergency signs\"],\n"
            "    \"timestamp\": \"auto\",\n"
            "    \"language_used\": \"Tamil/English/Hindi/etc\",\n"
            "    \"ai_advice\": \"What the AI recommended\"\n"
            "  }\n"
            "}"
        )
        messages.append({"role": "user", "content": summary_prompt})

        ai_text = call_ai(messages, language=request.language or "en")
        json_match = re.search(r"\{.*\}", ai_text, re.DOTALL)

        if json_match:
            summary_data = json.loads(json_match.group())
        else:
            summary_data = {
                "patient_summary": {
                    "chief_complaint": "See conversation",
                    "timestamp": "auto",
                }
            }

        if summary_data.get("patient_summary"):
            summary_data["patient_summary"]["timestamp"] = datetime.now().isoformat()

        return summary_data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# ─────────────────────────────────────────────────────────────────────────────
# TEXT-TO-SPEECH ENDPOINT  –  Sarvam AI Bulbul v3
# Primary  : Sarvam AI  (SARVAM_API_KEY in .env, best Indian language quality)
# Fallback : gTTS       (free, no key needed, pip install gTTS)
# ─────────────────────────────────────────────────────────────────────────────

# Sarvam BCP-47 language codes  (our short code → Sarvam target_language_code)
SARVAM_LANG_MAP = {
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "ml": "ml-IN",
    "kn": "kn-IN",
}

# gTTS fallback language map
GTTS_LANG_MAP = {
    "en": "en", "hi": "hi", "ta": "ta",
    "te": "te", "ml": "ml", "kn": "kn",
}


def clean_text_for_tts(text: str) -> str:
    """Strip markdown, JSON blocks and code fences before sending to TTS."""
    import re as _re
    t = _re.sub(r"```json[\s\S]*?```", "", text, flags=_re.IGNORECASE)
    t = _re.sub(r"```[\s\S]*?```", "", t)
    t = _re.sub(r"`[^`]*`", "", t)
    t = _re.sub(r"\*\*(.*?)\*\*", r"\1", t)
    t = _re.sub(r"\*(.*?)\*", r"\1", t)
    return t.strip()


async def tts_sarvam(text: str, lang_code: str) -> bytes:
    """
    Sarvam AI Bulbul v3 Text-to-Speech.

    Endpoint : POST https://api.sarvam.ai/text-to-speech
    Auth     : api-subscription-key header
    Response : JSON  { audios: [ "<base64-wav>", ... ] }
    Returns  : raw WAV bytes decoded from base64
    """
    api_key = os.getenv("SARVAM_API_KEY", "")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set in .env")

    target_lang = SARVAM_LANG_MAP.get(lang_code, "en-IN")

    payload = {
        "inputs": [text],
        "target_language_code": target_lang,
        "speaker": "meera",          # natural female voice, works across all Indian languages
        "model": "bulbul:v3",
        "pace": 1.0,
        "enable_preprocessing": True, # handles numbers, dates, abbreviations correctly
    }

    headers = {
        "api-subscription-key": api_key,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.sarvam.ai/text-to-speech",
            headers=headers,
            json=payload,
        )
        if resp.status_code == 401:
            raise ValueError("Invalid Sarvam API key")
        if resp.status_code == 402:
            raise ValueError("Sarvam API quota exhausted — add credits at dashboard.sarvam.ai")
        if resp.status_code == 422:
            raise ValueError(f"Sarvam rejected request: {resp.text}")
        resp.raise_for_status()

        data = resp.json()
        audios = data.get("audios", [])
        if not audios:
            raise ValueError("Sarvam returned empty audios array")

        # Response is base64-encoded WAV
        return base64.b64decode(audios[0])


def tts_gtts_fallback(text: str, lang_code: str) -> bytes:
    """
    gTTS fallback — free Google Translate TTS, no API key needed.
    Used when SARVAM_API_KEY is not set or Sarvam call fails.
    Returns raw MP3 bytes.
    """
    try:
        from gtts import gTTS
        import io
        lang = GTTS_LANG_MAP.get(lang_code, "en")
        obj  = gTTS(text=text, lang=lang, slow=False)
        buf  = io.BytesIO()
        obj.write_to_fp(buf)
        buf.seek(0)
        return buf.read()
    except ImportError:
        raise RuntimeError("gTTS not installed — run: pip install gTTS")
    except Exception as e:
        raise RuntimeError(f"gTTS failed: {e}")


class TTSRequest(BaseModel):
    text: str
    lang_code: str = "en"   # short code: en / hi / ta / te / ml / kn


@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert AI response text to natural speech audio.
    Returns: { audio_base64: str, format: str, method: str, lang: str }

    Priority:
      1. Sarvam AI Bulbul v3  — if SARVAM_API_KEY is set in .env (best quality)
      2. gTTS fallback        — free, always available, good Indian language support
    """
    try:
        text = clean_text_for_tts(request.text)
        if not text:
            raise HTTPException(status_code=400, detail="Text is empty after cleaning")

        lang        = request.lang_code.lower().split("-")[0]
        audio_bytes = None
        fmt         = "wav"
        method      = ""

        # ── Attempt 1: Sarvam AI Bulbul v3 ───────────────────────────────────
        sarvam_key = os.getenv("SARVAM_API_KEY", "")
        if sarvam_key:
            try:
                audio_bytes = await tts_sarvam(text, lang)
                fmt    = "wav"
                method = "sarvam"
                print(f"[TTS] Sarvam AI succeeded (lang={lang})")
            except Exception as e:
                traceback.print_exc()
                print(f"[TTS] Sarvam failed: {e} — falling back to gTTS")

        # ── Attempt 2: gTTS fallback ──────────────────────────────────────────
        if audio_bytes is None:
            try:
                audio_bytes = await asyncio.get_event_loop().run_in_executor(
                    None, tts_gtts_fallback, text, lang
                )
                fmt    = "mp3"
                method = "gtts"
                print(f"[TTS] gTTS fallback succeeded (lang={lang})")
            except Exception as e:
                traceback.print_exc()
                raise HTTPException(
                    status_code=503,
                    detail=(
                        f"All TTS engines failed: {e}. "
                        "Set SARVAM_API_KEY in .env or run: pip install gTTS"
                    )
                )

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {
            "audio_base64": audio_b64,
            "format": fmt,       # "wav" for Sarvam, "mp3" for gTTS
            "method": method,
            "lang": lang,
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
