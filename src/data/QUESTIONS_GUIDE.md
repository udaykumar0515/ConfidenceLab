# Interview Questions Guide

## How to Add Questions

### Question Structure
Each question follows this TypeScript interface:

```typescript
interface Question {
  id: string;                    // Unique identifier (e.g., 'hr_001', 'tech_015')
  text: string;                  // The actual question text
  type: 'behavioral' | 'situational' | 'technical' | 'motivational' | 'strength_weakness';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;              // Grouping category (e.g., 'Data Structures', 'Leadership')
  tips?: string[];              // Optional tips for answering
  expectedTime: number;         // Expected answer time in seconds
}
```

### Question Types Explained

#### HR Interview Questions
- **motivational**: Why do you want this job? What are your career goals?
- **strength_weakness**: What are your strengths/weaknesses?
- **behavioral**: Tell me about a time when...
- **situational**: What would you do if...

#### Technical Interview Questions
- **technical**: Coding problems, system design, algorithms
- **behavioral**: How do you approach problem-solving?

#### Behavioral Interview Questions
- **behavioral**: STAR method questions (Situation, Task, Action, Result)

### Difficulty Levels
- **easy**: Basic questions, 1-2 minutes to answer
- **medium**: Moderate complexity, 2-3 minutes to answer
- **hard**: Complex scenarios, 3-5 minutes to answer

### Adding New Questions

1. **Choose the right array**: Add to `hrQuestions`, `technicalQuestions`, or `behavioralQuestions`

2. **Follow the ID pattern**:
   - HR: `hr_001`, `hr_002`, etc.
   - Technical: `tech_001`, `tech_002`, etc.
   - Behavioral: `beh_001`, `beh_002`, etc.

3. **Example new question**:
```typescript
{
  id: 'hr_009',
  text: 'How do you prioritize multiple competing deadlines?',
  type: 'situational',
  difficulty: 'medium',
  category: 'Time Management',
  tips: [
    'Show your prioritization framework',
    'Mention communication with stakeholders',
    'Highlight successful delivery'
  ],
  expectedTime: 120
}
```

### Categories by Interview Type

#### HR Interview Categories
- Introduction
- Company Interest
- Self Assessment
- Career Goals
- Teamwork
- Work Style
- Engagement

#### Technical Interview Categories
- Data Structures
- Algorithms
- System Design
- Web Technologies
- Databases
- Database Optimization
- APIs
- Development Tools

#### Behavioral Interview Categories
- Resilience
- Leadership
- Learning Agility
- Time Management
- Conflict Resolution
- Adaptability
- Customer Service
- Decision Making

## AI Prompts for Generating Questions

### HR Interview Questions Prompt
```
Generate 10 HR interview questions for [specific role/industry]. 
Include a mix of:
- Motivational questions (why this company/role)
- Behavioral questions (tell me about a time...)
- Situational questions (what would you do if...)
- Strength/weakness questions

For each question, provide:
- The question text
- Difficulty level (easy/medium/hard)
- Category
- 3-4 tips for answering
- Expected time to answer (in seconds)

Format as TypeScript objects following the Question interface.
```

### Technical Interview Questions Prompt
```
Generate 10 technical interview questions for [programming language/technology stack].
Include a mix of:
- Data structures and algorithms
- System design concepts
- Language-specific questions
- Problem-solving scenarios

For each question, provide:
- The question text
- Difficulty level (easy/medium/hard)
- Category
- 3-4 technical tips
- Expected time to answer (in seconds)

Format as TypeScript objects following the Question interface.
```

### Behavioral Interview Questions Prompt
```
Generate 10 behavioral interview questions using the STAR method.
Include scenarios covering:
- Leadership situations
- Conflict resolution
- Learning and adaptation
- Problem-solving
- Teamwork challenges

For each question, provide:
- The question text
- Difficulty level (easy/medium/hard)
- Category
- 3-4 STAR method tips
- Expected time to answer (in seconds)

Format as TypeScript objects following the Question interface.
```

## Usage in Components

### Getting a Random Question
```typescript
import { getRandomQuestion } from '../data/questions';

const question = getRandomQuestion('hr'); // or 'technical', 'behavioral'
```

### Getting Questions by Difficulty
```typescript
import { getQuestionsByDifficulty } from '../data/questions';

const easyQuestions = getQuestionsByDifficulty('hr', 'easy');
```

### Getting Questions by Category
```typescript
import { getQuestionsByCategory } from '../data/questions';

const leadershipQuestions = getQuestionsByCategory('behavioral', 'Leadership');
```
