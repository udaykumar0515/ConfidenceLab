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

# Emotion Analysis
def analyze_emotions_with_deepface(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_interval = 30
    emotion_scores = {k: 0 for k in ['happy', 'neutral', 'sad', 'angry', 'fear', 'disgust', 'surprise']}
    frame_count = 0
    frame_num = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_num % frame_interval == 0:
            try:
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                emotion = result[0]['dominant_emotion']
                emotion_scores[emotion] += 1
                frame_count += 1
            except:
                pass
        frame_num += 1
    cap.release()

    if frame_count == 0:
        return 0

    for key in emotion_scores:
        emotion_scores[key] /= frame_count

    confidence = (
        (emotion_scores['happy'] * 0.6) +
        (emotion_scores['neutral'] * 0.3) -
        ((emotion_scores['sad'] + emotion_scores['fear'] + emotion_scores['angry']) * 0.3)
    ) * 100

    return round(confidence, 2)

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
        emotion_score = analyze_emotions_with_deepface(video_path)
        audio_path = extract_audio_from_video(video_path)
        speech_data = calculate_speech_confidence(audio_path)

        # Use the new speech_confidence instead of speech_score
        speech_confidence = speech_data.get('speech_confidence', 0)
        final_score = round((emotion_score * 0.4) + (speech_confidence * 0.6), 2)

        if os.path.exists(audio_path):
            os.remove(audio_path)

        return {
            "score": final_score,
            "emotion_score": emotion_score,
            "speech_data": speech_data,
            "breakdown": {
                "emotion_weight": 0.4,
                "speech_weight": 0.6,
                "emotion_contribution": round(emotion_score * 0.4, 2),
                "speech_contribution": round(speech_confidence * 0.6, 2)
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Run
if __name__ == "__main__":
    video_path = validate_video_path()
    result = final_confidence_score(video_path)
    print(json.dumps(result))
