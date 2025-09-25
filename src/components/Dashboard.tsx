import { useState, useEffect } from 'react';
import { Video, Brain, Users, Trophy, Sparkles, Target, Award, LogOut, History } from 'lucide-react';
import { getUserStats } from '../utils/auth';
import HRInterview from './HRInterview';
import TechnicalInterview from './TechnicalInterview';
import BehavioralInterview from './BehavioralInterview';
import SessionDetails from './SessionDetails';

const topics = [
  { 
    id: 'hr', 
    name: 'HR Interview', 
    icon: Users, 
    color: 'bg-blue-500',
    description: 'Master common HR questions and build confidence',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2069'
  },
  { 
    id: 'technical', 
    name: 'Technical Interview', 
    icon: Brain, 
    color: 'bg-purple-500',
    description: 'Practice coding problems and system design',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=2074'
  },
  { 
    id: 'behavioral', 
    name: 'Behavioral Interview', 
    icon: Users, 
    color: 'bg-green-500',
    description: 'Develop strong STAR method responses',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070'
  }
];

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    highestScore: 0,
    totalDuration: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const userStats = await getUserStats(user.id);
      setStats(userStats);
    };
    loadStats();
  }, [user.id]);

  const handleCloseInterview = () => {
    setSelectedTopic(null);
  };

  const handleBackToDashboard = () => {
    setShowSessions(false);
  };

  // Render specific interview component based on selection
  if (selectedTopic === 'hr') {
    return <HRInterview onClose={handleCloseInterview} />;
  }
  
  if (selectedTopic === 'technical') {
    return <TechnicalInterview onClose={handleCloseInterview} />;
  }
  
  if (selectedTopic === 'behavioral') {
    return <BehavioralInterview onClose={handleCloseInterview} />;
  }

  // Render sessions view
  if (showSessions) {
    return <SessionDetails user={user} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">{user.name[0].toUpperCase()}</span>
                </div>
                <Sparkles className="absolute -right-2 -top-2 w-6 h-6 text-emerald-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
                <p className="text-gray-600">Ready to boost your confidence with ConfidenceLab?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSessions(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <History className="w-5 h-5" />
                View Sessions
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Practice Sessions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                  {stats.totalSessions}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <Target className="w-12 h-12 text-blue-500 animate-pulse" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                  {stats.avgScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <Award className="w-12 h-12 text-green-500 animate-bounce" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Highest Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                  {stats.highestScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Choose Your Interview Path
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className="group bg-white/80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={topic.image} 
                  alt={topic.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className={`absolute top-4 left-4 ${topic.color} rounded-lg p-3 shadow-lg`}>
                  <topic.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
                <p className="text-gray-600">{topic.description}</p>
                
                <div className="mt-4 flex items-center text-blue-600 font-medium">
                  Start Practice
                  <Video className="w-4 h-4 ml-2 animate-pulse" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;