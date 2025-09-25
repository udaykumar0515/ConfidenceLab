import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Target, Eye, Mic, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface Session {
  id: string;
  user_id: string;
  topic: string;
  question?: string;
  score: number;
  duration: number;
  timestamp: string;
  detailed_metrics?: {
    facial_confidence: number;
    speech_confidence: number;
    body_confidence: number;
    facial_breakdown: {
      eye_contact: number;
      facial_tension: number;
      head_movement: number;
      smile_authenticity: number;
      blink_rate: number;
    };
    speech_breakdown: {
      hesitation_score: number;
      tone_score: number;
      clarity_score: number;
      pace_score: number;
    };
    body_breakdown: {
      posture: number;
      hand_gestures: number;
      body_openness: number;
      shoulder_alignment: number;
    };
    overall_breakdown: {
      facial_weight: number;
      speech_weight: number;
      body_weight: number;
      facial_contribution: number;
      speech_contribution: number;
      body_contribution: number;
    };
  };
}

interface SessionDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onBack: () => void;
}

function SessionDetails({ user, onBack }: SessionDetailsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/user/${user.id}/sessions`);
        const data = await response.json();
        if (data.success) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [user.id]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Sessions
              </button>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedSession.topic}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedSession.timestamp)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(selectedSession.duration)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(selectedSession.score)}`}>
                  {selectedSession.score}% Score
                </div>
              </div>
            </div>

            {selectedSession.question && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Question Asked:</h3>
                <p className="text-blue-800">{selectedSession.question}</p>
              </div>
            )}

                {selectedSession.detailed_metrics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Confidence Analysis</h2>
                
                {/* Main Confidence Scores */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Confidence Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{selectedSession.detailed_metrics.facial_confidence}%</div>
                      <div className="text-sm text-gray-600">Facial Confidence</div>
                      <div className="text-xs text-gray-500">Eye contact, expressions, tension</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedSession.detailed_metrics.speech_confidence}%</div>
                      <div className="text-sm text-gray-600">Speech Confidence</div>
                      <div className="text-xs text-gray-500">Clarity, tone, hesitation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedSession.detailed_metrics.body_confidence}%</div>
                      <div className="text-sm text-gray-600">Body Confidence</div>
                      <div className="text-xs text-gray-500">Posture, gestures, openness</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Interview Sessions</h1>
              <p className="text-gray-600">Review your performance and track your progress</p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600">Start practicing to see your sessions here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{session.topic}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(session.score)}`}>
                    {session.score}%
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.timestamp)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDuration(session.duration)}
                  </div>
                </div>

                {session.question && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{session.question}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-600 font-medium">View Details</span>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionDetails;
