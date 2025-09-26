from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import tempfile
import shutil
import os
from utils.analyze import final_confidence_score
from utils.user_manager import create_user, authenticate_user, get_user_by_id, add_session, get_user_sessions, get_user_stats
import json

# Server startup information

app = FastAPI()

# Enable CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SessionCreate(BaseModel):
    user_id: str
    topic: str
    score: float
    duration: int
    question: Optional[str] = None
    detailed_metrics: Optional[Dict[str, Any]] = None

# Authentication endpoints
@app.post("/auth/signup")
async def signup(user_data: UserCreate):
    try:
        user = create_user(user_data.name, user_data.email, user_data.password)
        return {"success": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/auth/login")
async def login(login_data: UserLogin):
    user = authenticate_user(login_data.email, login_data.password)
    if user:
        return {"success": True, "user": user}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/auth/user/{user_id}")
async def get_user(user_id: str):
    user = get_user_by_id(user_id)
    if user:
        return {"success": True, "user": user}
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/auth/session")
async def create_session(session_data: SessionCreate):
    try:
        session = add_session(
            session_data.user_id,
            session_data.topic,
            session_data.score,
            session_data.duration,
            session_data.question,
            session_data.detailed_metrics
        )
        return {"success": True, "session": session}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/auth/user/{user_id}/sessions")
async def get_sessions(user_id: str):
    sessions = get_user_sessions(user_id)
    return {"success": True, "sessions": sessions}

@app.get("/auth/user/{user_id}/stats")
async def get_stats(user_id: str):
    stats = get_user_stats(user_id)
    return {"success": True, "stats": stats}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Get the original file extension
    original_filename = file.filename or "video"
    file_extension = os.path.splitext(original_filename)[1] or ".mp4"
    
    # Save uploaded video temporarily with original extension
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    # Ensure file is closed before processing
    file.file.close()

    try:
        # Direct function call
        result = final_confidence_score(tmp_path)
        return result

    except Exception as e:
        return {"error": "Analysis failed", "details": str(e)}
    finally:
        # Clean up temp file with retry mechanism
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except PermissionError:
            # File might still be in use, try again after a short delay
            import time
            time.sleep(0.1)
            try:
                os.remove(tmp_path)
            except:
                pass  # Give up if still can't delete

# Questions endpoints
@app.get("/questions/{interview_type}")
async def get_questions(interview_type: str):
    """Get questions for a specific interview type"""
    try:
        # Map interview types to file names
        type_mapping = {
            "hr": "hr_questions.json",
            "technical": "technical_questions.json", 
            "behavioral": "behavioral_questions.json"
        }
        
        if interview_type not in type_mapping:
            raise HTTPException(status_code=400, detail="Invalid interview type")
        
        # Get the project root directory (go up from backend/main.py to project root)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(project_root, "data", "questions", type_mapping[interview_type])
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Questions file not found")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        return questions_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading questions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
