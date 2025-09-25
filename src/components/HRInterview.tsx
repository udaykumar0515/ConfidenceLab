import { useState, useEffect, useRef } from 'react';
import { Video, X, RotateCcw, Clock, Lightbulb } from 'lucide-react';
import { addSession, getCurrentUser } from '../utils/auth';
import { getRandomQuestion, Question } from '../utils/questionLoader';

interface HRInterviewProps {
  onClose: () => void;
}

function HRInterview({ onClose }: HRInterviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    facial_confidence: number;
    speech_confidence: number;
    body_confidence: number;
    video_duration?: number;
    facial_breakdown?: Record<string, number>;
    speech_breakdown?: Record<string, number>;
    body_breakdown?: Record<string, number>;
  } | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

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

  // Load all questions and initial question
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Loading HR questions...');
        // Load all HR questions
        const response = await fetch('/data/questions/hr_questions.json');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Loaded data:', data);
        const questions = data.questions || data; // Handle both structures
        console.log('Questions array:', questions);
        setAllQuestions(questions);
        
        // Set initial random question
        const randomIndex = Math.floor(Math.random() * questions.length);
        setCurrentQuestion(questions[randomIndex]);
        console.log('Set initial question:', questions[randomIndex]);
      } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to random question
        const question = await getRandomQuestion('hr');
        setCurrentQuestion(question);
      }
    };
    loadQuestions();
  }, []);

  const getNewQuestion = async () => {
    if (allQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      setCurrentQuestion(allQuestions[randomIndex]);
    } else {
      const question = await getRandomQuestion('hr');
      setCurrentQuestion(question);
    }
    setShowTips(false);
  };

  const selectQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setShowTips(false);
    setShowQuestionList(false);
  };

  // Save session when score is received
  useEffect(() => {
    const saveSession = async () => {
      if (score !== null && score > 0 && analysisResult && analysisResult.video_duration) {
        const currentUser = getCurrentUser();
        console.log("Score changed, saving session...", { score, timer, topic: "HR Interview", user: currentUser });
        
        if (currentUser) {
          try {
            const session = await addSession(
              currentUser.id, 
              "HR Interview", 
              score, 
              Math.round(analysisResult.video_duration),
              currentQuestion?.text || "HR Interview Question",
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
  }, [score, analysisResult, currentQuestion, timer]);


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
        setRecordedBlob(completeBlob);
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
      setAnalysisResult(data);
    } catch (err) {
      console.error("❌ Failed to analyze video:", err);
      alert("❌ Failed to analyze the video. Check backend connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">HR Interview Practice</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Question & Tips */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Question Section */}
          {currentQuestion ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
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
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion.text}
                  </h3>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setShowQuestionList(!showQuestionList)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="Select question"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={getNewQuestion}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="Get random question"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Selection Dropdown */}
              {showQuestionList && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-3">Select Question:</h4>
                  <div className="space-y-2">
                    {allQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => selectQuestion(question)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          currentQuestion?.text === question.text
                            ? 'bg-blue-100 border-blue-300 text-blue-900'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Question {index + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{question.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
              >
                <Lightbulb className="w-4 h-4" />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
              
              {showTips && currentQuestion.tips && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3">Answering Tips:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {currentQuestion.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* HR Interview Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-3">General Tips:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Maintain professional eye contact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Use the STAR method for behavioral questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Show enthusiasm for the role</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Ask thoughtful questions about the company</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p>Loading questions...</p>
              </div>
            </div>
          )}
        </div>

        {/* Center - Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-900 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!isRecording && !videoURL && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera Ready</p>
                  <p className="text-sm opacity-75">Click record to start your interview</p>
                </div>
              </div>
            )}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <span className="animate-pulse">●</span>
                <span className="text-sm font-medium">Recording</span>
                <span className="text-sm">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <>
                    <span className="animate-pulse">●</span> Stop Recording
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </button>

              {!isRecording && videoURL && recordedBlob && (
                <button
                  onClick={() => analyzeVideo(recordedBlob)}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5" />
                      Analyze Video
                    </>
                  )}
                </button>
              )}

              {!isRecording && (videoURL || score !== null) && (
                <button
                  onClick={() => {
                    setVideoURL(null);
                    setScore(null);
                    setTimer(0);
                    setRecordedBlob(null);
                    setAnalysisResult(null);
                    setShowDetailedAnalysis(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset Session
                </button>
              )}
            </div>

            {/* File Upload */}
            <div className="mt-4 text-center">
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
                className="text-sm text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Analysis & Results */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 overflow-y-auto">
            {/* Analyzing Loader */}
            {isAnalyzing && (
              <div className="text-center text-gray-600 py-8 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p>Analyzing your HR interview performance...</p>
              </div>
            )}

            {/* Download Link */}
            {!isRecording && videoURL && (
              <div className="mb-6">
                <a
                  href={videoURL}
                  download="hr_interview.webm"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Video
                </a>
              </div>
            )}

            {/* Score Display */}
            {score !== null && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white rounded-lg shadow-lg px-6 py-4">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{score}%</div>
                    <div className="text-sm text-gray-600">Confidence Score</div>
                  </div>
                </div>
              </div>
            )}
            
            {analysisResult && (
              <div className="mb-4">
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  {showDetailedAnalysis ? 'Hide' : 'View'} Detailed Analysis
                </button>
              </div>
            )}

            {showDetailedAnalysis && analysisResult && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.facial_confidence}%</div>
                    <div className="text-sm text-gray-600">Facial Confidence</div>
                    <div className="text-xs text-gray-500 mt-1">Eye contact, expressions</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.speech_confidence}%</div>
                    <div className="text-sm text-gray-600">Speech Confidence</div>
                    <div className="text-xs text-gray-500 mt-1">Clarity, tone, hesitation</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.body_confidence}%</div>
                    <div className="text-sm text-gray-600">Body Confidence</div>
                    <div className="text-xs text-gray-500 mt-1">Posture, gestures, openness</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRInterview;
