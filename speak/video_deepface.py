from deepface import DeepFace
import cv2

def analyze_emotions_with_deepface(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_interval = 30  # adjust to reduce processing time

    emotion_scores = {
        'happy': 0,
        'neutral': 0,
        'sad': 0,
        'angry': 0,
        'fear': 0,
        'disgust': 0,
        'surprise': 0
    }

    frame_count = 0
    frame_num = 0

    print("🔍 Analyzing emotions using DeepFace...")

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
            except Exception as e:
                print(f"Skipping frame: {e}")

        frame_num += 1

    cap.release()

    if frame_count == 0:
        print("⚠ No faces detected.")
        return

    for key in emotion_scores:
        emotion_scores[key] /= frame_count

    confidence = (
        (emotion_scores['happy'] * 0.6) +
        (emotion_scores['neutral'] * 0.3) -
        ((emotion_scores['sad'] + emotion_scores['fear'] + emotion_scores['angry']) * 0.3)
    ) * 100

    print(f"\n📊 Emotion Averages: {emotion_scores}")
    print(f"✅ Estimated Confidence Score: {confidence:.2f}%")

# Example usage:
video_path = r"D:\uday\Vscode\Projects\SEM-4-MINIPROJECT\website\gettyimages-1922292127-640_adpp.mp4"  # Replace with the actual path
analyze_emotions_with_deepface(video_path)
