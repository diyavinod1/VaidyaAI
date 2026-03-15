# 🩺 VaidyaAI
### Multilingual AI Health Assistant for Early Symptom Guidance

🚀 VaidyaAI is an AI-powered healthcare assistant designed to help users understand symptoms and receive preliminary guidance in their **native language**.

The platform bridges the communication gap between patients and healthcare information, especially for **rural communities, travelers, and non-English speakers**.

---

# 🌍 The Problem

Many people avoid visiting hospitals for minor symptoms, assuming they are not serious.

However:

• Small symptoms sometimes lead to major health issues.  
• Illiterate or rural patients struggle to explain symptoms.  
• Language barriers prevent clear communication with doctors.  

This leads to **delayed diagnosis and poor healthcare access**.

---

# 💡 Our Solution

**VaidyaAI** is an intelligent health assistant that:

✔ Understands symptoms through conversational AI  
✔ Supports multiple Indian languages  
✔ Provides early health guidance  
✔ Converts responses into natural voice output  

It acts as a **first-level digital health companion**.

---

# ⚙️ Key Features

🧠 **AI Symptom Analysis**  
Analyzes user-described symptoms and provides guidance.

🌐 **Multilingual Support**  
Users can interact in multiple Indian languages.

🔊 **Natural Voice Responses**  
AI responses are converted into speech for accessibility.

💬 **Conversational Interface**  
Users can interact with the system like chatting with a healthcare assistant.

🧑‍⚕️ **Guidance-Oriented Responses**  
Instead of diagnosis, it provides safe medical guidance.

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

# 🛠 Tech Stack

### Frontend
- React
- JavaScript
- HTML / CSS

### Backend
- FastAPI
- Python

### AI & APIs
- Sambanova API (LLM)
- Sarvam AI (Text-to-Speech)

### Deployment
- Render

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
cd VaidyaAI
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
# Edit .env and add your SAMBANOVA_API_KEY

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
# 🧪 Example Interaction

User:


I have fever and body pain.


AI Response:


Fever and body pain can be symptoms of infections like flu or viral fever.
If the fever persists for more than 2 days, it is recommended to consult a doctor.
Stay hydrated and take rest.


Voice output is generated for accessibility.

---

# 🎯 Impact

VaidyaAI can help:

👨‍🌾 Rural populations  
🧓 Elderly users  
🌏 Travelers in different states  
📚 People with low health literacy  

It improves **early health awareness and accessibility**.

---

# 🔮 Future Improvements

• Integration with nearby hospital locator  
• Medical dataset-based symptom classification  
• Doctor consultation integration  
• Health record storage  
• Mobile application version

---

# 👩‍💻 Author

**Diya Vinod**  
AI & ML Student  

Passionate about building AI solutions that solve real-world problems.

---

# ⭐ If you like this project

Give this repository a **star ⭐** and feel free to contribute!

---

## 🏥 Disclaimer

VaidyaAI is a **medical triage assistant only**. It does not diagnose diseases and should not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
