export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  sessions: Session[];
}

export interface Session {
  id: string;
  topic: string;
  score: number;
  timestamp: string;
  duration: number; // in seconds
}

const STORAGE_KEY = 'interview_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize users storage if it doesn't exist
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all users
export const getUsers = (): User[] => {
  initializeStorage();
  const users = localStorage.getItem(STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to storage
const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create new user
export const createUser = (name: string, email: string, password: string): User => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(user => user.email === email)) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    password, // In a real app, this should be hashed
    createdAt: new Date().toISOString(),
    sessions: []
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Authenticate user
export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  return currentUser ? JSON.parse(currentUser) : null;
};

// Set current user
export const setCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Logout current user
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Add session to user
export const addSession = (userId: string, session: Omit<Session, 'id' | 'timestamp'>) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const newSession: Session = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...session
  };

  users[userIndex].sessions.push(newSession);
  saveUsers(users);

  // Update current user if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.sessions.push(newSession);
    setCurrentUser(currentUser);
  }

  return newSession;
};

// Get user statistics
export const getUserStats = (userId: string) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return { totalSessions: 0, avgScore: 0, highestScore: 0, totalDuration: 0 };
  }

  const sessions = user.sessions;
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions) : 0;
  const highestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  return {
    totalSessions,
    avgScore,
    highestScore,
    totalDuration
  };
};
