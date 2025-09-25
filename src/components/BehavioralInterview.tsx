import { useState, useEffect, useRef } from 'react';
import { Video, X, RotateCcw, Clock, Lightbulb } from 'lucide-react';
import { addSession, getCurrentUser } from '../utils/auth';
import { getRandomQuestion, Question } from '../utils/questionLoader';

interface BehavioralInterviewProps {
  onClose: () => void;
}

function BehavioralInterview({ onClose }: BehavioralInterviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [cameraLabel, setCameraLabel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

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

  // Load initial question
  useEffect(() => {
    const loadInitialQuestion = async () => {
      const question = await getRandomQuestion('behavioral');
      setCurrentQuestion(question);
    };
    loadInitialQuestion();
  }, []);

  const getNewQuestion = async () => {
    const question = await getRandomQuestion('behavioral');
    setCurrentQuestion(question);
    setShowTips(false);
  };

  // Save session when score is received
  useEffect(() => {
    const saveSession = async () => {
      if (score !== null && score > 0 && analysisResult) {
        const currentUser = getCurrentUser();
        console.log("Score changed, saving session...", { score, timer, topic: "Behavioral Interview", user: currentUser });
        
        if (currentUser) {
          try {
            const session = await addSession(
              currentUser.id, 
              "Behavioral Interview", 
              score, 
              timer,
              currentQuestion?.text || "Behavioral Interview Question",
              analysisResult
            );
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
  }, [score, analysisResult, currentQuestion]);

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
    formData.append("file", blob, "behavioral_interview.webm");

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
      setAnalysisResult(data);
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
            <h2 className="text-2xl font-bold text-gray-900">Behavioral Interview Practice</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Question Section */}
          {currentQuestion && (
            <div className="bg-green-50 rounded-lg p-6 mb-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      {currentQuestion.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(currentQuestion.expectedTime / 60)}m {currentQuestion.expectedTime % 60}s</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {currentQuestion.text}
                  </h3>
                </div>
                <button
                  onClick={getNewQuestion}
                  className="ml-4 p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                  title="Get new question"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <Lightbulb className="w-4 h-4" />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
              
              {showTips && currentQuestion.tips && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Answering Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {currentQuestion.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
  
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
                  : 'bg-green-600 hover:bg-green-700 text-white'
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
              ⏳ Analyzing your behavioral interview performance...
            </div>
          )}
  
          {/* Download Link */}
          {!isRecording && videoURL && (
            <a
              href={videoURL}
              download="behavioral_interview.webm"
              className="text-blue-600 underline block text-center mb-4"
            >
              Download Behavioral Interview Video
            </a>
          )}
  
          {/* Score Output */}
          {score !== null && (
            <div className="bg-gray-50 rounded-lg p-6 text-center border-t mt-6">
              <h3 className="text-xl font-semibold mb-2">Behavioral Interview Score</h3>
              <div className="text-4xl font-bold text-green-600 mb-4">{score}%</div>
              
              {analysisResult && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {showDetailedAnalysis ? 'Hide' : 'View'} Full Analysis
                  </button>
                </div>
              )}
              
              {showDetailedAnalysis && analysisResult && (
                <div className="mt-4 p-4 bg-white rounded-lg border text-left">
                  <h4 className="font-semibold mb-3">Confidence Analysis</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{analysisResult.facial_confidence}%</div>
                      <div className="text-sm text-gray-600">Facial Confidence</div>
                      <div className="text-xs text-gray-500">Eye contact, expressions, tension</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{analysisResult.speech_confidence}%</div>
                      <div className="text-sm text-gray-600">Speech Confidence</div>
                      <div className="text-xs text-gray-500">Clarity, tone, hesitation</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{analysisResult.body_confidence}%</div>
                      <div className="text-sm text-gray-600">Body Confidence</div>
                      <div className="text-xs text-gray-500">Posture, gestures, openness</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-gray-600">
                <p className="mb-2">Behavioral Interview Tips:</p>
                <ul className="text-left max-w-md mx-auto list-disc list-inside text-sm">
                  <li>Use the STAR method (Situation, Task, Action, Result)</li>
                  <li>Be specific with examples and outcomes</li>
                  <li>Show how you learned from challenges</li>
                  <li>Demonstrate leadership and teamwork skills</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BehavioralInterview;
