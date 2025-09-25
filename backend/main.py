from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import interview  # Import the route we just created

app = FastAPI()

# Enable CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or replace with ["http://localhost:5173"] if you want stricter
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our analysis route
app.include_router(interview.router)
