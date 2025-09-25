import sounddevice as sd
import queue
import json
import time
from vosk import Model, KaldiRecognizer

model = Model("vosk-model")
recognizer = KaldiRecognizer(model, 16000)
q = queue.Queue()

def callback(indata, frames, time_, status):
    if status:
        print("⚠️", status)
    q.put(bytes(indata))

def calculate_confidence_score(wpm, word_count):
    if wpm < 80:
        pace_score = max(0, (wpm / 80) * 50)
    elif wpm > 130:
        pace_score = max(0, (130 / wpm) * 50)
    else:
        pace_score = 50

    word_score = min(word_count, 50) / 50 * 50
    return round(pace_score + word_score, 2)

def analyze_confidence(speech_text, duration_seconds):
    words = speech_text.strip().split()
    num_words = len(words)
    wpm = (num_words / duration_seconds) * 60 if duration_seconds > 0 else 0
    confidence_percent = calculate_confidence_score(wpm, num_words)

    print(f"\n🧾 Transcript: {speech_text.strip() or '[No clear speech detected]'}")
    print(f"\n📊 Words Spoken: {num_words}")
    print(f"⏱️ Duration: {duration_seconds:.2f} sec")
    print(f"🚀 Words per Minute (WPM): {wpm:.2f}")
    print(f"✅ Confidence Score: {confidence_percent:.2f}%")

def recognize_speech_offline():
    print("🎤 Speak now (recording will auto-stop after ~15 sec or Ctrl+C to stop early)...")
    full_text = ""
    start_time = time.time()

    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                           channels=1, callback=callback):
        try:
            while time.time() - start_time < 15:
                data = q.get()
                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    text = result.get("text", "")
                    if text:
                        print(f"🗣️ Final: {text}")
                        full_text += " " + text
                else:
                    partial = json.loads(recognizer.PartialResult()).get("partial", "")
                    if partial:
                        print(f"📶 Hearing: {partial}", end='\r')

        except KeyboardInterrupt:
            print("\n⏹️ Recording stopped manually.")

    # 🔄 Force final recognition
    try:
        final_result = json.loads(recognizer.FinalResult())
        final_text = final_result.get("text", "")
        if final_text:
            print(f"🗣️ Final Add-on: {final_text}")
            full_text += " " + final_text
    except Exception as e:
        print(f"⚠️ Final flush failed: {e}")

    duration = time.time() - start_time
    analyze_confidence(full_text, duration)

# Run it
recognize_speech_offline()
