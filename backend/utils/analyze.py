import sys
import json
import os
import time
import wave
import cv2
from deepface import DeepFace
import moviepy.editor as mp
from vosk import Model, KaldiRecognizer
import subprocess

# Check for video path
if len(sys.argv) < 2:
    print(json.dumps({"error": "No video file path provided"}))
    sys.exit(1)

video_path = sys.argv[1]

if not os.path.exists(video_path):
    print(json.dumps({"error": "Video file not found"}))
    sys.exit(1)

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
            clip = mp.VideoFileClip(video_path)
            clip.audio.write_audiofile(output_audio, codec='pcm_s16le', verbose=False, logger=None)
            return output_audio
        except Exception as e:
            raise RuntimeError(f"Audio extraction failed: {str(e)}")

# Enhanced Speech Analysis with detailed metrics
def calculate_speech_confidence(audio_path):
    model = Model("vosk-model")
    wf = wave.open(audio_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    full_text = ""
    start_time = time.time()

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            full_text += " " + result.get("text", "")

    final_result = json.loads(rec.FinalResult())
    full_text += " " + final_result.get("text", "")

    duration = time.time() - start_time
    words = full_text.strip().split()
    num_words = len(words)
    wpm = (num_words / duration) * 60 if duration > 0 else 0

    # Enhanced confidence scoring
    if wpm < 80:
        pace_score = max(0, (wpm / 80) * 50)
    elif wpm > 130:
        pace_score = max(0, (130 / wpm) * 50)
    else:
        pace_score = 50

    word_score = min(num_words, 50) / 50 * 50
    speech_score = round(pace_score + word_score, 2)

    return {
        "transcript": full_text.strip() or "[No clear speech detected]",
        "words_spoken": num_words,
        "duration_sec": round(duration, 2),
        "wpm": round(wpm, 2),
        "speech_score": speech_score
    }

# Enhanced Final Score with detailed breakdown
def final_confidence_score(video_path):
    try:
        emotion_score = analyze_emotions_with_deepface(video_path)
        audio_path = extract_audio_from_video(video_path)
        speech_data = calculate_speech_confidence(audio_path)

        final_score = round((emotion_score * 0.4) + (speech_data['speech_score'] * 0.6), 2)

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
                "speech_contribution": round(speech_data['speech_score'] * 0.6, 2)
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Run
if __name__ == "__main__":
    result = final_confidence_score(video_path)
    print(json.dumps(result))
