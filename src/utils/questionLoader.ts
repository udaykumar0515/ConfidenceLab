export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'situational' | 'technical' | 'motivational' | 'strength_weakness';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tips?: string[];
  expectedTime: number; // in seconds
}

export interface QuestionSet {
  interviewType: 'hr' | 'technical' | 'behavioral';
  questions: Question[];
}

// Cache for loaded questions
let questionsCache: { [key: string]: Question[] } = {};

// Load questions from JSON file
export const loadQuestions = async (interviewType: 'hr' | 'technical' | 'behavioral'): Promise<Question[]> => {
  // Check cache first
  if (questionsCache[interviewType]) {
    return questionsCache[interviewType];
  }

  try {
    const response = await fetch(`/data/questions/${interviewType}_questions.json`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    
    const data: QuestionSet = await response.json();
    questionsCache[interviewType] = data.questions;
    return data.questions;
  } catch (error) {
    console.error(`Error loading ${interviewType} questions:`, error);
    // Return empty array as fallback
    return [];
  }
};

// Get a random question from the specified interview type
export const getRandomQuestion = async (interviewType: 'hr' | 'technical' | 'behavioral'): Promise<Question | null> => {
  const questions = await loadQuestions(interviewType);
  
  if (questions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

// Get questions by difficulty level
export const getQuestionsByDifficulty = async (
  interviewType: 'hr' | 'technical' | 'behavioral',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question[]> => {
  const questions = await loadQuestions(interviewType);
  return questions.filter(q => q.difficulty === difficulty);
};

// Get questions by category
export const getQuestionsByCategory = async (
  interviewType: 'hr' | 'technical' | 'behavioral',
  category: string
): Promise<Question[]> => {
  const questions = await loadQuestions(interviewType);
  return questions.filter(q => q.category === category);
};

// Clear cache (useful for development/testing)
export const clearQuestionsCache = () => {
  questionsCache = {};
};
