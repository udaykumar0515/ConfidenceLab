import subprocess
import tempfile
from fastapi import APIRouter, UploadFile, File
import shutil
import json
import os

router = APIRouter()

@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Save uploaded video temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Get the current script directory and construct Python path
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        python_path = os.path.join(current_dir, "venv8v", "Scripts", "python.exe")
        
        result = subprocess.run(
            [
                python_path,
                "utils/analyze.py",
                tmp_path
            ],
            capture_output=True,
            text=True
        )
        
        # Check if the command failed (non-zero exit code)
        if result.returncode != 0:
            return {
                "error": "Analysis failed",
                "details": result.stderr.strip(),
                "exit_code": result.returncode
            }
            
        output = result.stdout.strip()
        data = json.loads(output)
        return data  # e.g., { "score": 70 }

    except FileNotFoundError as e:
        return {"error": "Python executable not found", "details": str(e)}
    except json.JSONDecodeError as e:
        return {"error": "Invalid output from analysis script", "details": str(e)}
    except Exception as e:
        return {"error": "Unexpected error", "details": str(e)}
    finally:
        # Ensure the temp file is always deleted
        if os.path.exists(tmp_path):
            os.remove(tmp_path)