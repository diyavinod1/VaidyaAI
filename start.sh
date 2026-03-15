#!/bin/bash

# VaidyaAI Quick Start Script
echo "🏥 VaidyaAI – Multilingual Symptom Checker"
echo "============================================"

# Check for required tools
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 is required. Install from https://python.org"
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

# Check API key
if [ ! -f "backend/.env" ]; then
  echo ""
  echo "⚠️  No backend/.env found."
  read -p "   Enter your Gemini API key: " API_KEY
  echo "GEMINI_API_KEY=$API_KEY" > backend/.env
  echo "✅ API key saved to backend/.env"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q

echo ""
echo "🚀 Starting backend on http://localhost:8000 ..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

sleep 2

cd ../frontend
echo ""
echo "📦 Installing frontend dependencies..."
npm install --silent

echo ""
echo "🎨 Starting frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ VaidyaAI is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
