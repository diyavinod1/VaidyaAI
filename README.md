# VaidyaAI – Multilingual AI Symptom Checker
### TN Impact Hackathon 2025 · Built for Tamil Nadu

> **Voice-first AI healthcare assistant for rural and semi-urban Tamil Nadu.**
> Speak symptoms in Tamil or English, get intelligent triage, find nearby hospitals.

---

## 🏗️ Project Structure

```
symptom-ai/
├── frontend/                    # React + Vite + TailwindCSS
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js         # Axios API service layer
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   ├── VoiceButton.jsx  # Mic button with ripple animation
│   │   │   ├── EmergencyAlert.jsx # Red alert component
│   │   │   └── TypingIndicator.jsx # AI typing dots
│   │   ├── hooks/
│   │   │   └── useVoice.js      # Web Speech API hook
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── SymptomChecker.jsx # Chat interface
│   │   │   ├── Results.jsx      # Analysis results
│   │   │   ├── NearbyHospitals.jsx # OSM hospital map
│   │   │   └── Summary.jsx      # Printable doctor card
│   │   ├── styles/
│   │   │   └── index.css        # Tailwind + custom styles
│   │   ├── App.jsx              # Router setup
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                     # Python FastAPI
│   ├── main.py                  # All API endpoints
│   ├── requirements.txt
│   └── .env.example
│
├── start.sh                     # Quick start script
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anthropic API key (get at https://console.anthropic.com)

---

### 1. Clone and Setup

```bash
git clone <repo-url>
cd symptom-ai
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run backend
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure
cp .env.example .env
# Edit .env if backend is on a different URL

# Start dev server
npm run dev
```

The app will be available at: http://localhost:5173

---

### 4. Setting API Keys

**Backend (`backend/.env`):**
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your key at: https://console.anthropic.com/settings/keys

---

## 🎤 Testing Voice Input

1. Open the app in **Google Chrome** (voice recognition works best in Chrome)
2. Navigate to Symptom Checker
3. Click the green microphone button
4. Allow microphone access when prompted
5. Speak your symptoms in English: *"I have a severe headache and fever"*
6. Or switch to Tamil mode and speak: *"என் தலையில் வலி இருக்கிறது"*
7. The text will auto-populate in the input field
8. Press Enter or click Send

**Voice Language Selection:**
- Toggle between EN / தமிழ் in the top-right of the chat screen
- EN uses `en-IN` locale
- தமிழ் uses `ta-IN` locale

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/symptom_chat` | AI conversation turn |
| POST | `/analyze` | Force structured analysis |
| GET | `/hospitals?lat=&lon=&radius=` | Nearby hospitals (OSM) |
| POST | `/summary` | Generate doctor summary |

### Example: POST /symptom_chat
```json
{
  "messages": [
    {"role": "user", "content": "I have chest pain and shortness of breath"}
  ]
}
```

### Example Response:
```json
{
  "response": "I'm concerned about your symptoms. How long have you had the chest pain?...",
  "is_analysis": false,
  "analysis_data": null
}
```

---

## 🗺️ Hospital Data

Hospitals are fetched in real-time from **OpenStreetMap Overpass API** – no mock data.

Query searches for:
- `amenity=hospital`
- `amenity=clinic`
- `healthcare=hospital`
- `healthcare=clinic`

Within configurable radius (2km to 20km) around user's GPS location.

Fallback: Rānipet, Tamil Nadu coordinates if GPS unavailable.

---

## 🧠 AI Behavior

The AI is powered by Claude (Anthropic) with a specialized medical triage system prompt:

1. **Greets in Tamil/English** based on user's input language
2. **Asks 2-3 follow-up questions** per symptom cluster
3. **Detects emergency red flags** immediately
4. **After 3-4 exchanges**, generates structured JSON analysis
5. **Never diagnoses** – always recommends specialist type

**Emergency detection triggers:**
- Chest pain + breathlessness
- Stroke symptoms (face drooping, arm weakness)
- Severe headache ("worst of life")
- Loss of consciousness
- Severe bleeding

---

## 🎨 Design System

- **Primary**: Teal (#0d9488)
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Cards**: White rounded-2xl with soft shadows
- **Emergency**: Red with pulse animation
- **Mobile first**: Responsive for smartphone users

---

## 🏆 Three WOW Features

### 1. Voice-First AI Interview
- Web Speech API with Tamil (`ta-IN`) and English (`en-IN`) support
- Live transcript shown while recording
- Works offline for speech recognition, online for AI response

### 2. Emergency Risk Detector
- Real-time pattern matching in AI response
- Red pulsing banner with `⚠ POSSIBLE MEDICAL EMERGENCY`
- Direct link to call 108 (Tamil Nadu ambulance)
- Auto-navigate to emergency hospitals

### 3. Printable Doctor Summary Card
- AI generates structured medical triage report
- Includes: chief complaint, symptom list, duration, severity, Q&A log, specialist recommendation
- Formatted for direct presentation to doctor
- Print-optimized CSS (`@media print`)

---

## 🔒 Privacy

- No user accounts required
- No data stored on server (stateless API)
- Conversation exists only in browser memory
- Phone number input is optional and not stored

---

## 🏥 Disclaimer

VaidyaAI is a **medical triage assistant only**. It does not diagnose diseases and should not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.

---

*Built with ❤️ for TN Impact Hackathon 2025 – Rānipet, Tamil Nadu*
