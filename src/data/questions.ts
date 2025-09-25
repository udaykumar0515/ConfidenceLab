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

// HR Interview Questions
export const hrQuestions: Question[] = [
  {
    id: 'hr_001',
    text: 'Tell me about yourself.',
    type: 'motivational',
    difficulty: 'easy',
    category: 'Introduction',
    tips: [
      'Keep it concise (2-3 minutes)',
      'Focus on relevant experience',
      'End with why you want this role'
    ],
    expectedTime: 180
  },
  {
    id: 'hr_002',
    text: 'Why do you want to work for our company?',
    type: 'motivational',
    difficulty: 'medium',
    category: 'Company Interest',
    tips: [
      'Research the company beforehand',
      'Mention specific values or projects',
      'Connect your goals with company mission'
    ],
    expectedTime: 120
  },
  {
    id: 'hr_003',
    text: 'What are your greatest strengths?',
    type: 'strength_weakness',
    difficulty: 'easy',
    category: 'Self Assessment',
    tips: [
      'Choose 2-3 relevant strengths',
      'Provide specific examples',
      'Connect strengths to job requirements'
    ],
    expectedTime: 90
  },
  {
    id: 'hr_004',
    text: 'What is your greatest weakness?',
    type: 'strength_weakness',
    difficulty: 'medium',
    category: 'Self Assessment',
    tips: [
      'Choose a real but minor weakness',
      'Show how you are working to improve',
      'Turn it into a positive learning experience'
    ],
    expectedTime: 90
  },
  {
    id: 'hr_005',
    text: 'Where do you see yourself in 5 years?',
    type: 'motivational',
    difficulty: 'medium',
    category: 'Career Goals',
    tips: [
      'Show ambition but be realistic',
      'Connect to the role and company',
      'Mention skill development plans'
    ],
    expectedTime: 120
  },
  {
    id: 'hr_006',
    text: 'Tell me about a time you had to work with a difficult team member.',
    type: 'behavioral',
    difficulty: 'hard',
    category: 'Teamwork',
    tips: [
      'Use STAR method (Situation, Task, Action, Result)',
      'Focus on your actions, not blame',
      'Show positive outcome and learning'
    ],
    expectedTime: 180
  },
  {
    id: 'hr_007',
    text: 'How do you handle stress and pressure?',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Work Style',
    tips: [
      'Give specific examples',
      'Show healthy coping mechanisms',
      'Demonstrate resilience and adaptability'
    ],
    expectedTime: 120
  },
  {
    id: 'hr_008',
    text: 'What questions do you have for us?',
    type: 'situational',
    difficulty: 'easy',
    category: 'Engagement',
    tips: [
      'Prepare 3-5 thoughtful questions',
      'Ask about role, team, company culture',
      'Show genuine interest and research'
    ],
    expectedTime: 300
  }
];

// Technical Interview Questions
export const technicalQuestions: Question[] = [
  {
    id: 'tech_001',
    text: 'Explain the difference between a stack and a queue.',
    type: 'technical',
    difficulty: 'easy',
    category: 'Data Structures',
    tips: [
      'Use simple analogies (stack = plates, queue = line)',
      'Explain LIFO vs FIFO',
      'Give real-world examples'
    ],
    expectedTime: 120
  },
  {
    id: 'tech_002',
    text: 'What is the time complexity of binary search?',
    type: 'technical',
    difficulty: 'medium',
    category: 'Algorithms',
    tips: [
      'Explain O(log n) complexity',
      'Compare with linear search O(n)',
      'Mention when to use binary search'
    ],
    expectedTime: 90
  },
  {
    id: 'tech_003',
    text: 'Design a system to handle 1 million users.',
    type: 'technical',
    difficulty: 'hard',
    category: 'System Design',
    tips: [
      'Start with basic components',
      'Consider scalability bottlenecks',
      'Discuss load balancing and caching'
    ],
    expectedTime: 600
  },
  {
    id: 'tech_004',
    text: 'Explain what happens when you type a URL in your browser.',
    type: 'technical',
    difficulty: 'medium',
    category: 'Web Technologies',
    tips: [
      'Start from DNS lookup',
      'Explain HTTP request/response',
      'Mention rendering process'
    ],
    expectedTime: 180
  },
  {
    id: 'tech_005',
    text: 'What is the difference between SQL and NoSQL databases?',
    type: 'technical',
    difficulty: 'medium',
    category: 'Databases',
    tips: [
      'Explain ACID properties',
      'Discuss scalability differences',
      'Give use case examples'
    ],
    expectedTime: 150
  },
  {
    id: 'tech_006',
    text: 'How would you optimize a slow-running query?',
    type: 'technical',
    difficulty: 'hard',
    category: 'Database Optimization',
    tips: [
      'Identify bottlenecks first',
      'Discuss indexing strategies',
      'Mention query rewriting techniques'
    ],
    expectedTime: 180
  },
  {
    id: 'tech_007',
    text: 'Explain the concept of RESTful APIs.',
    type: 'technical',
    difficulty: 'medium',
    category: 'APIs',
    tips: [
      'Explain HTTP methods (GET, POST, PUT, DELETE)',
      'Discuss stateless nature',
      'Give example endpoints'
    ],
    expectedTime: 120
  },
  {
    id: 'tech_008',
    text: 'What is version control and why is it important?',
    type: 'technical',
    difficulty: 'easy',
    category: 'Development Tools',
    tips: [
      'Explain collaboration benefits',
      'Mention backup and rollback',
      'Discuss branching strategies'
    ],
    expectedTime: 90
  }
];

// Behavioral Interview Questions
export const behavioralQuestions: Question[] = [
  {
    id: 'beh_001',
    text: 'Tell me about a time you failed and how you handled it.',
    type: 'behavioral',
    difficulty: 'hard',
    category: 'Resilience',
    tips: [
      'Choose a real but not catastrophic failure',
      'Focus on lessons learned',
      'Show growth and improvement'
    ],
    expectedTime: 180
  },
  {
    id: 'beh_002',
    text: 'Describe a situation where you had to lead a team.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Leadership',
    tips: [
      'Use STAR method',
      'Show specific leadership actions',
      'Highlight team success'
    ],
    expectedTime: 180
  },
  {
    id: 'beh_003',
    text: 'Tell me about a time you had to learn something new quickly.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Learning Agility',
    tips: [
      'Show your learning process',
      'Mention resources used',
      'Demonstrate quick application'
    ],
    expectedTime: 150
  },
  {
    id: 'beh_004',
    text: 'Describe a time you had to work under a tight deadline.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Time Management',
    tips: [
      'Show prioritization skills',
      'Mention stress management',
      'Highlight successful delivery'
    ],
    expectedTime: 150
  },
  {
    id: 'beh_005',
    text: 'Tell me about a time you disagreed with your manager.',
    type: 'behavioral',
    difficulty: 'hard',
    category: 'Conflict Resolution',
    tips: [
      'Show respectful disagreement',
      'Focus on professional communication',
      'Highlight positive resolution'
    ],
    expectedTime: 180
  },
  {
    id: 'beh_006',
    text: 'Describe a situation where you had to adapt to change.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Adaptability',
    tips: [
      'Show flexibility and openness',
      'Mention positive attitude',
      'Highlight successful adaptation'
    ],
    expectedTime: 150
  },
  {
    id: 'beh_007',
    text: 'Tell me about a time you went above and beyond for a customer.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Customer Service',
    tips: [
      'Show empathy and understanding',
      'Mention specific actions taken',
      'Highlight positive outcome'
    ],
    expectedTime: 150
  },
  {
    id: 'beh_008',
    text: 'Describe a time you had to make a difficult decision.',
    type: 'behavioral',
    difficulty: 'hard',
    category: 'Decision Making',
    tips: [
      'Show your decision-making process',
      'Mention factors considered',
      'Highlight positive outcome'
    ],
    expectedTime: 180
  }
];

// Question sets organized by interview type
export const questionSets: QuestionSet[] = [
  {
    interviewType: 'hr',
    questions: hrQuestions
  },
  {
    interviewType: 'technical',
    questions: technicalQuestions
  },
  {
    interviewType: 'behavioral',
    questions: behavioralQuestions
  }
];

// Utility functions
export const getRandomQuestion = (interviewType: 'hr' | 'technical' | 'behavioral'): Question => {
  const questionSet = questionSets.find(set => set.interviewType === interviewType);
  if (!questionSet) {
    throw new Error(`No questions found for interview type: ${interviewType}`);
  }
  
  const randomIndex = Math.floor(Math.random() * questionSet.questions.length);
  return questionSet.questions[randomIndex];
};

export const getQuestionsByDifficulty = (
  interviewType: 'hr' | 'technical' | 'behavioral',
  difficulty: 'easy' | 'medium' | 'hard'
): Question[] => {
  const questionSet = questionSets.find(set => set.interviewType === interviewType);
  if (!questionSet) {
    return [];
  }
  
  return questionSet.questions.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (
  interviewType: 'hr' | 'technical' | 'behavioral',
  category: string
): Question[] => {
  const questionSet = questionSets.find(set => set.interviewType === interviewType);
  if (!questionSet) {
    return [];
  }
  
  return questionSet.questions.filter(q => q.category === category);
};
