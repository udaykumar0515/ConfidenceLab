# Interview Questions Database

This directory contains JSON files with predefined interview questions for each interview type.

## File Structure

- `hr_questions.json` - HR Interview questions
- `technical_questions.json` - Technical Interview questions  
- `behavioral_questions.json` - Behavioral Interview questions

## Question Format

Each question follows this JSON structure:

```json
{
  "id": "unique_identifier",
  "text": "The actual question text",
  "type": "question_type",
  "difficulty": "easy|medium|hard",
  "category": "Question category",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "expectedTime": 120
}
```

## Question Types

### HR Interview Types
- `motivational` - Why do you want this job? Career goals?
- `strength_weakness` - What are your strengths/weaknesses?
- `behavioral` - Tell me about a time when...
- `situational` - What would you do if...

### Technical Interview Types
- `technical` - Coding problems, system design, algorithms

### Behavioral Interview Types
- `behavioral` - STAR method questions (Situation, Task, Action, Result)

## Difficulty Levels
- `easy` - Basic questions, 1-2 minutes to answer
- `medium` - Moderate complexity, 2-3 minutes to answer
- `hard` - Complex scenarios, 3-5 minutes to answer

## Adding New Questions

1. Open the appropriate JSON file (e.g., `hr_questions.json`)
2. Add your question to the `questions` array
3. Follow the existing format and ID pattern
4. Save the file

### ID Patterns
- HR: `hr_001`, `hr_002`, etc.
- Technical: `tech_001`, `tech_002`, etc.
- Behavioral: `beh_001`, `beh_002`, etc.

### Example New Question
```json
{
  "id": "hr_011",
  "text": "How do you handle constructive criticism?",
  "type": "behavioral",
  "difficulty": "medium",
  "category": "Professional Development",
  "tips": [
    "Show openness to feedback",
    "Mention specific improvements made",
    "Demonstrate growth mindset"
  ],
  "expectedTime": 120
}
```

## Categories by Interview Type

### HR Interview Categories
- Introduction
- Company Interest
- Self Assessment
- Career Goals
- Teamwork
- Work Style
- Engagement
- Time Management
- Learning Agility

### Technical Interview Categories
- Data Structures
- Algorithms
- System Design
- Web Technologies
- Databases
- Database Optimization
- APIs
- Development Tools
- Debugging

### Behavioral Interview Categories
- Resilience
- Leadership
- Learning Agility
- Time Management
- Conflict Resolution
- Adaptability
- Customer Service
- Decision Making
- Teamwork
- Communication

## AI Prompts for Generating Questions

### HR Questions
```
Generate 10 HR interview questions for [specific role/industry]. 
Include motivational, behavioral, situational, and strength/weakness questions.
For each question, provide the question text, difficulty level, category, 3-4 tips, and expected time in seconds.
Format as JSON objects following the Question structure.
```

### Technical Questions
```
Generate 10 technical interview questions for [programming language/technology stack].
Include data structures, algorithms, system design, and language-specific questions.
For each question, provide the question text, difficulty level, category, technical tips, and expected time in seconds.
Format as JSON objects following the Question structure.
```

### Behavioral Questions
```
Generate 10 behavioral interview questions using the STAR method.
Include leadership, conflict resolution, learning, problem-solving, and teamwork scenarios.
For each question, provide the question text, difficulty level, category, STAR method tips, and expected time in seconds.
Format as JSON objects following the Question structure.
```
