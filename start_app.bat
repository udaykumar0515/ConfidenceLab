@echo off
echo Starting ConfidenceLab...

echo Starting Backend...
start "ConfidenceLab Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend...
start "ConfidenceLab Frontend" cmd /k "npm run dev"

echo Done! Both services are starting in separate windows.
