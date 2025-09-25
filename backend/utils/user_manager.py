import json
import os
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
import uuid

# File paths
USERS_FILE = "users.json"
SESSIONS_FILE = "sessions.json"

def ensure_data_files():
    """Create data files if they don't exist"""
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, 'w') as f:
            json.dump({}, f)

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users() -> Dict:
    """Load users from JSON file"""
    ensure_data_files()
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_users(users: Dict):
    """Save users to JSON file"""
    ensure_data_files()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_sessions() -> Dict:
    """Load sessions from JSON file"""
    ensure_data_files()
    try:
        with open(SESSIONS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_sessions(sessions: Dict):
    """Save sessions to JSON file"""
    ensure_data_files()
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f, indent=2)

def create_user(name: str, email: str, password: str) -> Dict:
    """Create a new user"""
    users = load_users()
    
    # Check if user already exists
    if email in users:
        raise ValueError("User with this email already exists")
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)
    
    user_data = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now().isoformat(),
        "sessions": []
    }
    
    users[email] = user_data
    save_users(users)
    
    # Return user data without password
    return {
        "id": user_id,
        "name": name,
        "email": email,
        "created_at": user_data["created_at"]
    }

def authenticate_user(email: str, password: str) -> Optional[Dict]:
    """Authenticate user with email and password"""
    users = load_users()
    
    if email not in users:
        return None
    
    user = users[email]
    hashed_password = hash_password(password)
    
    if user["password"] != hashed_password:
        return None
    
    # Return user data without password
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user["created_at"]
    }

def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    users = load_users()
    
    for user in users.values():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "created_at": user["created_at"]
            }
    
    return None

def add_session(user_id: str, topic: str, score: int, duration: int) -> Dict:
    """Add a new session for a user"""
    users = load_users()
    sessions = load_sessions()
    
    # Find user by ID
    user_email = None
    for email, user in users.items():
        if user["id"] == user_id:
            user_email = email
            break
    
    if not user_email:
        raise ValueError("User not found")
    
    session_id = str(uuid.uuid4())
    session_data = {
        "id": session_id,
        "user_id": user_id,
        "topic": topic,
        "score": score,
        "duration": duration,
        "timestamp": datetime.now().isoformat()
    }
    
    # Add to sessions file
    sessions[session_id] = session_data
    
    # Add to user's sessions list
    users[user_email]["sessions"].append(session_id)
    
    save_sessions(sessions)
    save_users(users)
    
    return session_data

def get_user_sessions(user_id: str) -> List[Dict]:
    """Get all sessions for a user"""
    users = load_users()
    sessions = load_sessions()
    
    # Find user by ID
    user_sessions = []
    for email, user in users.items():
        if user["id"] == user_id:
            for session_id in user["sessions"]:
                if session_id in sessions:
                    user_sessions.append(sessions[session_id])
            break
    
    return sorted(user_sessions, key=lambda x: x["timestamp"], reverse=True)

def get_user_stats(user_id: str) -> Dict:
    """Get user statistics"""
    sessions = get_user_sessions(user_id)
    
    if not sessions:
        return {
            "total_sessions": 0,
            "avg_score": 0,
            "highest_score": 0,
            "total_duration": 0
        }
    
    total_sessions = len(sessions)
    scores = [session["score"] for session in sessions]
    avg_score = round(sum(scores) / len(scores)) if scores else 0
    highest_score = max(scores) if scores else 0
    total_duration = sum(session["duration"] for session in sessions)
    
    return {
        "total_sessions": total_sessions,
        "avg_score": avg_score,
        "highest_score": highest_score,
        "total_duration": total_duration
    }
