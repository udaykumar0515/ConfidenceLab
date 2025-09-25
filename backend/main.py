from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import shutil
import os
from utils.analyze import final_confidence_score

app = FastAPI()

# Enable CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Save uploaded video temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
