import cv2
from fer import FER
from moviepy.editor import VideoFileClip
import numpy as np

def analyze_video_emotions(video_path):
    detector = FER(mtcnn=True)
    video = VideoFileClip(video_path)
    
    frame_rate = int(video.fps)
    duration = int(video.duration)
    
    emotion_scores = {
        'happy': 0,
        'neutral': 0,
        'surprise': 0,
        'angry': 0,
        'sad': 0,
        'fear': 0,
        'disgust': 0
    }
    frame_count = 0

    print("🔍 Analyzing facial expressions...")

    for t in range(0, duration):
        frame = video.get_frame(t)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        results = detector.detect_emotions(frame)
        if results:
            top_emotion, score = detector.top_emotion(frame)
            if top_emotion:
                emotion_scores[top_emotion] += score
                frame_count += 1

    if frame_count == 0:
        print("⚠ No faces detected in the video.")
        return 0

    # Normalize emotion scores
    for key in emotion_scores:
        emotion_scores[key] /= frame_count

    # Confidence scoring logic
    confidence = (
        (emotion_scores['happy'] * 0.6) +
        (emotion_scores['neutral'] * 0.3) -
        ((emotion_scores['sad'] + emotion_scores['fear'] + emotion_scores['angry']) * 0.3)
    ) * 100

    confidence = np.clip(confidence, 0, 100)

    print(f"\n📊 Emotion Averages: {emotion_scores}")
    print(f"✅ Estimated Confidence Score: {confidence:.2f}%")

# Example usage
video_path = r"D:\uday\Vscode\Projects\SEM-4-MINIPROJECT\gettyimages-1922292127-640_adpp.mp4"  # Replace with the actual path
analyze_video_emotions(video_path)