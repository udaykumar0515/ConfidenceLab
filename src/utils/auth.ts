export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  topic: string;
  score: number;
  duration: number;
  timestamp: string;
}

export interface DetailedMetrics {
  [key: string]: string | number | boolean | null | undefined | Record<string, number>;
}

const API_BASE = 'http://127.0.0.1:8000';
const CURRENT_USER_KEY = 'current_user';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API call failed');
  }

  return response.json();
};

// Create new user
export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.success) {
    throw new Error('Failed to create user');
  }

  return response.user;
};

// Authenticate user
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      return response.user;
    }
    return null;
  } catch {
    return null;
  }
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  return currentUser ? JSON.parse(currentUser) : null;
};

// Set current user in localStorage
export const setCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Logout current user
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Add session to user
export const addSession = async (userId: string, topic: string, score: number, duration: number, question?: string, detailedMetrics?: DetailedMetrics): Promise<Session> => {
  const response = await apiCall('/auth/session', {
    method: 'POST',
    body: JSON.stringify({ 
      user_id: userId, 
      topic, 
      score, 
      duration,
      question,
      detailed_metrics: detailedMetrics
    }),
  });

  if (!response.success) {
    throw new Error('Failed to save session');
  }

  return response.session;
};

// Get user statistics
export const getUserStats = async (userId: string) => {
  try {
    const response = await apiCall(`/auth/user/${userId}/stats`);
    
    if (response.success) {
      return {
        totalSessions: response.stats.total_sessions,
        avgScore: response.stats.avg_score,
        highestScore: response.stats.highest_score,
        totalDuration: response.stats.total_duration
      };
    }
    
    return { totalSessions: 0, avgScore: 0, highestScore: 0, totalDuration: 0 };
  } catch  {
    return { totalSessions: 0, avgScore: 0, highestScore: 0, totalDuration: 0 };
  }
};

// Get user sessions
export const getUserSessions = async (userId: string): Promise<Session[]> => {
  try {
    const response = await apiCall(`/auth/user/${userId}/sessions`);
    
    if (response.success) {
      return response.sessions;
    }
    
    return [];
  } catch {
    return [];
  }
};
