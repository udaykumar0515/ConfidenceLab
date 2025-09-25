import sys
import json
import os
import time
import wave
import cv2
import numpy as np
import re
from deepface import DeepFace
from moviepy import VideoFileClip
from vosk import Model, KaldiRecognizer
import subprocess
import librosa

# Video path validation (only when run as script)
def validate_video_path():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No video file path provided"}))
        sys.exit(1)

    video_path = sys.argv[1]
    if not os.path.exists(video_path):
        print(json.dumps({"error": "Video file not found"}))
        sys.exit(1)
    return video_path

# Confidence-focused Facial Analysis
def analyze_confidence_emotions(video_path):
    """Analyze facial confidence indicators instead of basic emotions"""
    cap = cv2.VideoCapture(video_path)
    frame_interval = 15  # More frequent analysis for better accuracy
    frame_count = 0
    frame_num = 0
    
    # Confidence indicators
    eye_contact_scores = []
    facial_tension_scores = []
    head_movement_scores = []
    smile_authenticity_scores = []
    blink_rates = []
    
    # Initialize face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    prev_face_center = None
    blink_count = 0
    eyes_closed_frames = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_num % frame_interval == 0:
            try:
                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    # Take the largest face
                    face = max(faces, key=lambda x: x[2] * x[3])
                    x, y, w, h = face
                    face_roi = gray[y:y+h, x:x+w]
                    
                    # Analyze confidence indicators
                    eye_contact = analyze_eye_contact(face_roi, eye_cascade)
                    facial_tension = analyze_facial_tension(face_roi)
                    head_movement = analyze_head_movement(face, prev_face_center)
                    smile_auth = analyze_smile_authenticity(face_roi)
                    blink_detected = detect_blink(face_roi, eye_cascade)
                    
                    # Store scores
                    eye_contact_scores.append(eye_contact)
                    facial_tension_scores.append(facial_tension)
                    head_movement_scores.append(head_movement)
                    smile_authenticity_scores.append(smile_auth)
                    
                    # Track blinks
                    if blink_detected:
                        blink_count += 1
                        eyes_closed_frames = 0
                    else:
                        eyes_closed_frames += 1
                        if eyes_closed_frames > 3:  # Eyes closed for too long
                            blink_count += 1
                    
                    prev_face_center = (x + w//2, y + h//2)
                    frame_count += 1
                    
            except Exception as e:
                print(f"Frame analysis error: {e}")
                pass
                
        frame_num += 1
    
    cap.release()
    
    if frame_count == 0:
        return 0
    
    # Calculate average confidence scores
    avg_eye_contact = np.mean(eye_contact_scores) if eye_contact_scores else 50
    avg_facial_tension = np.mean(facial_tension_scores) if facial_tension_scores else 50
    avg_head_movement = np.mean(head_movement_scores) if head_movement_scores else 50
    avg_smile_auth = np.mean(smile_authenticity_scores) if smile_authenticity_scores else 50
    
    # Calculate blink rate (blinks per minute)
    video_duration = frame_num / cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 1
    blink_rate = (blink_count / video_duration) * 60  # blinks per minute
    blink_score = 100 - min(100, abs(blink_rate - 20) * 2)  # Optimal: 15-25 blinks/min
    
    # Combine confidence indicators
    confidence_score = (
        avg_eye_contact * 0.35 +      # Eye contact is most important
        avg_facial_tension * 0.25 +   # Relaxed face = confident
        avg_head_movement * 0.20 +    # Steady head = confident
        avg_smile_auth * 0.10 +       # Genuine smile = confident
        blink_score * 0.10            # Normal blink rate = confident
    )
    
    return {
        "confidence_score": round(confidence_score, 2),
        "breakdown": {
            "eye_contact": round(avg_eye_contact, 2),
            "facial_tension": round(avg_facial_tension, 2),
            "head_movement": round(avg_head_movement, 2),
            "smile_authenticity": round(avg_smile_auth, 2),
            "blink_rate": round(blink_score, 2)
        },
        "metrics": {
            "total_frames_analyzed": frame_count,
            "blink_count": blink_count,
            "blinks_per_minute": round(blink_rate, 2)
        }
    }

def analyze_eye_contact(face_roi, eye_cascade):
    """Analyze eye contact confidence (0-100)"""
    try:
        eyes = eye_cascade.detectMultiScale(face_roi, 1.1, 3)
        
        if len(eyes) >= 2:
            # Both eyes detected - good eye contact
            eye_areas = [w * h for (x, y, w, h) in eyes]
            avg_eye_area = np.mean(eye_areas)
            
            # Larger eye areas indicate better eye contact
            if avg_eye_area > 500:
                return 90  # Excellent eye contact
            elif avg_eye_area > 300:
                return 75  # Good eye contact
            elif avg_eye_area > 150:
                return 60  # Moderate eye contact
            else:
                return 40  # Poor eye contact
        elif len(eyes) == 1:
            return 30  # One eye visible - partial eye contact
        else:
            return 10  # No eyes visible - poor eye contact
            
    except Exception:
        return 50  # Default score

def analyze_facial_tension(face_roi):
    """Analyze facial tension (0-100, higher = more relaxed = more confident)"""
    try:
        # Calculate facial muscle tension using edge detection
        edges = cv2.Canny(face_roi, 50, 150)
        edge_density = np.sum(edges > 0) / (face_roi.shape[0] * face_roi.shape[1])
        
        # More edges = more tension = less confident
        if edge_density < 0.05:
            return 90  # Very relaxed
        elif edge_density < 0.10:
            return 75  # Relaxed
        elif edge_density < 0.15:
            return 60  # Moderate tension
        elif edge_density < 0.20:
            return 40  # Tense
        else:
            return 20  # Very tense
            
    except Exception:
        return 50  # Default score

def analyze_head_movement(face, prev_face_center):
    """Analyze head movement stability (0-100, higher = more stable = more confident)"""
    try:
        if prev_face_center is None:
            return 50  # First frame
        
        current_center = (face[0] + face[2]//2, face[1] + face[3]//2)
        movement = np.sqrt((current_center[0] - prev_face_center[0])**2 + 
                          (current_center[1] - prev_face_center[1])**2)
        
        # Less movement = more confident
        if movement < 5:
            return 95  # Very stable
        elif movement < 10:
            return 80  # Stable
        elif movement < 20:
            return 65  # Moderate movement
        elif movement < 30:
            return 45  # Some movement
        else:
            return 25  # Excessive movement
            
    except Exception:
        return 50  # Default score

def analyze_smile_authenticity(face_roi):
    """Analyze smile authenticity (0-100, higher = more genuine = more confident)"""
    try:
        # Use DeepFace for emotion analysis but focus on smile confidence
        result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
        emotions = result[0]['emotion']
        
        # Calculate smile confidence based on emotion distribution
        happy_score = emotions.get('happy', 0)
        neutral_score = emotions.get('neutral', 0)
        
        # Genuine smiles have high happy + some neutral (not forced)
        if happy_score > 60 and neutral_score > 20:
            return 85  # Genuine smile
        elif happy_score > 40:
            return 70  # Moderate smile
        elif happy_score > 20:
            return 50  # Slight smile
        else:
            return 30  # No smile or forced smile
            
    except Exception:
        return 50  # Default score

def detect_blink(face_roi, eye_cascade):
    """Detect if eyes are closed (blinking)"""
    try:
        eyes = eye_cascade.detectMultiScale(face_roi, 1.1, 3)
        return len(eyes) < 2  # Blink if less than 2 eyes detected
    except Exception:
        return False

# Enhanced Audio Extraction with FFmpeg (better for webm files)
def extract_audio_from_video(video_path, output_audio="temp.wav"):
    try:
        # Try FFmpeg first (better for webm files)
        command = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_audio
        ]
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return output_audio
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback to MoviePy if FFmpeg fails
        try:
            clip = VideoFileClip(video_path)
            clip.audio.write_audiofile(output_audio, codec='pcm_s16le')
            return output_audio
        except Exception as e:
            raise RuntimeError(f"Audio extraction failed: {str(e)}")

# Confidence-focused Speech Analysis
def calculate_speech_confidence(audio_path):
    # Get transcript using Vosk
    transcript_data = get_transcript_with_timing(audio_path)
    transcript = transcript_data["transcript"]
    words = transcript_data["words"]
    
    # Analyze audio features for confidence indicators
    audio_features = analyze_audio_features(audio_path)
    
    # Calculate confidence indicators
    hesitation_score = calculate_hesitation_score(transcript, words)
    tone_score = calculate_tone_confidence(audio_features)
    clarity_score = calculate_clarity_score(audio_features)
    pace_score = calculate_pace_confidence(words, transcript_data["duration"])
    
    # Combine scores for overall speech confidence
    speech_confidence = (
        hesitation_score * 0.3 +  # Less hesitation = more confident
        tone_score * 0.3 +        # Steady tone = more confident
        clarity_score * 0.2 +     # Clear speech = more confident
        pace_score * 0.2          # Appropriate pace = more confident
    )
    
    return {
        "transcript": transcript or "[No clear speech detected]",
        "words_spoken": len(words),
        "duration_sec": round(transcript_data["duration"], 2),
        "wpm": round(len(words) / (transcript_data["duration"] / 60), 2) if transcript_data["duration"] > 0 else 0,
        "speech_confidence": round(speech_confidence, 2),
        "confidence_breakdown": {
            "hesitation_score": round(hesitation_score, 2),
            "tone_score": round(tone_score, 2),
            "clarity_score": round(clarity_score, 2),
            "pace_score": round(pace_score, 2)
        },
        "hesitation_indicators": {
            "filler_words": count_filler_words(transcript),
            "pauses": count_long_pauses(words),
            "repetitions": count_repetitions(words)
        }
    }

def get_transcript_with_timing(audio_path):
    """Get transcript with word-level timing information"""
    model = Model("vosk-model")
    wf = wave.open(audio_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    
    full_text = ""
    words = []
    start_time = time.time()
    
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            if result.get("result"):
                for word_info in result["result"]:
                    words.append(word_info)
            full_text += " " + result.get("text", "")
    
    final_result = json.loads(rec.FinalResult())
    if final_result.get("result"):
        for word_info in final_result["result"]:
            words.append(word_info)
    full_text += " " + final_result.get("text", "")
    
    duration = time.time() - start_time
    wf.close()
    
    return {
        "transcript": full_text.strip(),
        "words": words,
        "duration": duration
    }

def analyze_audio_features(audio_path):
    """Analyze audio features for confidence indicators"""
    try:
        # Load audio file
        y, sr = librosa.load(audio_path, sr=16000)
        
        # Extract features
        features = {
            "pitch": librosa.yin(y, fmin=50, fmax=400),  # Fundamental frequency
            "energy": librosa.feature.rms(y=y)[0],       # Energy/volume
            "spectral_centroid": librosa.feature.spectral_centroid(y=y, sr=sr)[0],  # Brightness
            "zero_crossing_rate": librosa.feature.zero_crossing_rate(y)[0],  # Roughness
            "mfcc": librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)  # Mel-frequency cepstral coefficients
        }
        
        return features
    except Exception as e:
        print(f"Audio analysis error: {e}")
        return None

def calculate_hesitation_score(transcript, words):
    """Calculate confidence based on hesitation indicators (lower hesitation = higher confidence)"""
    if not transcript:
        return 0
    
    # Count hesitation indicators
    filler_words = count_filler_words(transcript)
    pauses = count_long_pauses(words)
    repetitions = count_repetitions(words)
    
    # Calculate hesitation score (0-100, higher = less hesitation = more confident)
    hesitation_penalty = (filler_words * 5) + (pauses * 3) + (repetitions * 4)
    hesitation_score = max(0, 100 - hesitation_penalty)
    
    return min(100, hesitation_score)

def count_filler_words(transcript):
    """Count filler words and hesitation sounds"""
    filler_patterns = [
        r'\b(um|uh|er|ah|like|you know|basically|actually|so|well)\b',
        r'\b(um+|uh+|er+|ah+)\b',  # Repeated hesitations
        r'\b(i mean|kind of|sort of)\b'
    ]
    
    count = 0
    for pattern in filler_patterns:
        matches = re.findall(pattern, transcript.lower())
        count += len(matches)
    
    return count

def count_long_pauses(words):
    """Count long pauses between words (indicating hesitation)"""
    if len(words) < 2:
        return 0
    
    long_pauses = 0
    for i in range(1, len(words)):
        if "end" in words[i-1] and "start" in words[i]:
            pause_duration = words[i]["start"] - words[i-1]["end"]
            if pause_duration > 1.0:  # Pause longer than 1 second
                long_pauses += 1
    
    return long_pauses

def count_repetitions(words):
    """Count word repetitions (indicating uncertainty)"""
    if len(words) < 3:
        return 0
    
    repetitions = 0
    for i in range(2, len(words)):
        if (words[i]["word"].lower() == words[i-1]["word"].lower() == words[i-2]["word"].lower()):
            repetitions += 1
    
    return repetitions

def calculate_tone_confidence(audio_features):
    """Calculate confidence based on voice tone stability"""
    if not audio_features:
        return 50  # Default score
    
    try:
        pitch = audio_features["pitch"]
        energy = audio_features["energy"]
        
        # Remove NaN values
        pitch = pitch[~np.isnan(pitch)]
        energy = energy[~np.isnan(energy)]
        
        if len(pitch) == 0 or len(energy) == 0:
            return 50
        
        # Calculate stability metrics
        pitch_stability = 100 - (np.std(pitch) / np.mean(pitch) * 100) if np.mean(pitch) > 0 else 50
        energy_stability = 100 - (np.std(energy) / np.mean(energy) * 100) if np.mean(energy) > 0 else 50
        
        # Confident voices have stable pitch and energy
        tone_score = (pitch_stability + energy_stability) / 2
        return max(0, min(100, tone_score))
        
    except Exception:
        return 50

def calculate_clarity_score(audio_features):
    """Calculate confidence based on speech clarity"""
    if not audio_features:
        return 50
    
    try:
        spectral_centroid = audio_features["spectral_centroid"]
        zero_crossing_rate = audio_features["zero_crossing_rate"]
        
        # Remove NaN values
        spectral_centroid = spectral_centroid[~np.isnan(spectral_centroid)]
        zero_crossing_rate = zero_crossing_rate[~np.isnan(zero_crossing_rate)]
        
        if len(spectral_centroid) == 0 or len(zero_crossing_rate) == 0:
            return 50
        
        # Clear speech has higher spectral centroid and moderate zero crossing rate
        clarity_score = (
            (np.mean(spectral_centroid) / 1000) * 50 +  # Normalize spectral centroid
            (1 - np.mean(zero_crossing_rate)) * 50       # Lower ZCR = clearer speech
        )
        
        return max(0, min(100, clarity_score))
        
    except Exception:
        return 50

def calculate_pace_confidence(words, duration):
    """Calculate confidence based on speaking pace"""
    if duration == 0 or len(words) == 0:
        return 50
    
    wpm = (len(words) / duration) * 60
    
    # Optimal pace for confidence: 120-160 WPM
    if 120 <= wpm <= 160:
        return 100
    elif 100 <= wpm < 120:
        return 80 + (wpm - 100)  # Gradual decrease
    elif 160 < wpm <= 180:
        return 100 - (wpm - 160)  # Gradual decrease
    else:
        return max(0, 100 - abs(wpm - 140) * 2)  # Penalty for very fast/slow

# Enhanced Final Score with detailed breakdown
def final_confidence_score(video_path):
    try:
        # Analyze facial confidence indicators
        facial_data = analyze_confidence_emotions(video_path)
        facial_confidence = facial_data.get('confidence_score', 0) if isinstance(facial_data, dict) else facial_data
        
        # Analyze speech confidence indicators
        audio_path = extract_audio_from_video(video_path)
        speech_data = calculate_speech_confidence(audio_path)
        speech_confidence = speech_data.get('speech_confidence', 0)

        # Calculate final confidence score with improved weighting
        final_score = round((facial_confidence * 0.5) + (speech_confidence * 0.5), 2)

        if os.path.exists(audio_path):
            os.remove(audio_path)

        return {
            "score": final_score,
            "facial_confidence": facial_confidence,
            "speech_confidence": speech_confidence,
            "facial_breakdown": facial_data.get('breakdown', {}) if isinstance(facial_data, dict) else {},
            "speech_breakdown": speech_data.get('confidence_breakdown', {}),
            "facial_metrics": facial_data.get('metrics', {}) if isinstance(facial_data, dict) else {},
            "speech_metrics": speech_data.get('hesitation_indicators', {}),
            "overall_breakdown": {
                "facial_weight": 0.5,
                "speech_weight": 0.5,
                "facial_contribution": round(facial_confidence * 0.5, 2),
                "speech_contribution": round(speech_confidence * 0.5, 2)
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Run
if __name__ == "__main__":
    video_path = validate_video_path()
    result = final_confidence_score(video_path)
    print(json.dumps(result))
