import { useState, useEffect, useRef } from 'react';
import { Video, X } from 'lucide-react';
import { addSession, getCurrentUser } from '../utils/auth';

interface HRInterviewProps {
  onClose: () => void;
}

function HRInterview({ onClose }: HRInterviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [cameraLabel, setCameraLabel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Save session when score is received
  useEffect(() => {
    const saveSession = async () => {
      if (score !== null && score > 0) {
        const currentUser = getCurrentUser();
        console.log("Score changed, saving session...", { score, timer, topic: "HR Interview", user: currentUser });
        
        if (currentUser) {
          try {
            const session = await addSession(currentUser.id, "HR Interview", score, timer);
            console.log("Session saved successfully:", session);
          } catch (error) {
            console.error("Failed to save session:", error);
          }
        } else {
          console.log("No current user found");
        }
      }
    };

    saveSession();
  }, [score, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");

      // Try to find a user-facing camera first, then fallback to any camera
      let selectedDevice = videoDevices.find((device) => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('user') ||
        device.label.toLowerCase().includes('facing')
      );

      // If no user-facing camera found, use the first available camera
      if (!selectedDevice && videoDevices.length > 0) {
        selectedDevice = videoDevices[0];
      }

      if (!selectedDevice) {
        throw new Error("No camera found. Please make sure a camera is connected and accessible.");
      }

      setCameraLabel(selectedDevice.label || "Default Camera");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: selectedDevice.deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true,
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const completeBlob = new Blob(chunksRef.current, { type: "video/webm" });
        const finalURL = URL.createObjectURL(completeBlob);
        setVideoURL(finalURL);
        chunksRef.current = [];

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = finalURL;
        }

        analyzeVideo(completeBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTimer(0);

      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("🛑 Could not start recording:", err);
      alert("⚠️ Could not access camera. Please check:\n• Camera permissions are allowed\n• Camera is connected and working\n• No other app is using the camera");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const analyzeVideo = async (blob: Blob) => {
    setIsAnalyzing(true);
    setScore(null);

    const formData = new FormData();
    formData.append("file", blob, "hr_interview.webm");

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setScore(data.score);
    } catch (err) {
      console.error("❌ Failed to analyze video:", err);
      alert("❌ Failed to analyze the video. Check backend connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
  
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">HR Interview Practice</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
  
          {/* Video Area */}
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted={isRecording}
              controls={!isRecording && !!videoURL}
              className="w-full h-full object-cover rounded-lg"
              src={!isRecording && videoURL ? videoURL : undefined}
            />
  
            {cameraLabel && (
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                🎥 {cameraLabel}
              </div>
            )}
  
            <div className="absolute top-2 right-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {formatTime(timer)}
            </div>
          </div>
  
          {/* Controls */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? (
                <>
                  <span className="animate-pulse">●</span> Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" /> Start Recording
                </>
              )}
            </button>
  
            {!isRecording && (videoURL || score !== null) && (
              <button
                onClick={() => {
                  setVideoURL(null);
                  setScore(null);
                  setTimer(0);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset Session
              </button>
            )}
          </div>
  
          {/* File Upload */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-2">Upload a video file for analysis</h3>
            <input
              type="file"
              accept="video/*"
              disabled={isAnalyzing}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setVideoURL(url);
                  analyzeVideo(file);
                }
              }}
              className="mb-4 block w-full"
            />
          </div>
  
          {/* Analyzing Loader */}
          {isAnalyzing && (
            <div className="text-center text-gray-600 my-4 animate-pulse">
              ⏳ Analyzing your HR interview performance...
            </div>
          )}
  
          {/* Download Link */}
          {!isRecording && videoURL && (
            <a
              href={videoURL}
              download="hr_interview.webm"
              className="text-blue-600 underline block text-center mb-4"
            >
              Download HR Interview Video
            </a>
          )}
  
          {/* Score Output */}
          {score !== null && (
            <div className="bg-gray-50 rounded-lg p-6 text-center border-t mt-6">
              <h3 className="text-xl font-semibold mb-2">HR Interview Score</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-4">{score}%</div>
              <div className="text-gray-600">
                <p className="mb-2">HR Interview Tips:</p>
                <ul className="text-left max-w-md mx-auto list-disc list-inside text-sm">
                  <li>Maintain professional eye contact</li>
                  <li>Use the STAR method for behavioral questions</li>
                  <li>Show enthusiasm for the role</li>
                  <li>Ask thoughtful questions about the company</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRInterview;
