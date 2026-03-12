export function homeworkPrompt(question: string): string {
  return `You are a helpful tutor. A high school student needs help with this homework question. Explain the answer step-by-step in a clear, friendly way. Use markdown formatting with headers, bold, and numbered steps.

Question:
${question}

Provide a thorough step-by-step explanation.`;
}

export function summarizerPrompt(notes: string): string {
  return `You are an expert note summarizer. Summarize the following study notes into concise, well-organized bullet points. Use markdown formatting with headers for different topics/sections. Keep key terms bold.

Notes:
${notes}

Provide a concise bullet-point summary organized by topic.`;
}

export function quizPrompt(notes: string): string {
  return `You are a quiz generator for high school students. Based on the following study material, generate 7 multiple-choice quiz questions.

Study material:
${notes}

Return a JSON array of objects with this exact structure:
[
  {
    "question": "the question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0,
    "explanation": "brief explanation of the correct answer"
  }
]

Generate exactly 7 questions. Each must have exactly 4 options. correctIndex is 0-based.`;
}

export function flashcardPrompt(text: string): string {
  return `You are a flashcard generator for high school students. Based on the following study material, generate 10 flashcards.

Study material:
${text}

Return a JSON array of objects with this exact structure:
[
  {
    "front": "the question or term",
    "back": "the answer or definition"
  }
]

Generate exactly 10 flashcards covering the key concepts.`;
}

export function mathPrompt(problem: string): string {
  return `You are a math tutor. Solve the following math problem step-by-step. Show all work clearly using markdown formatting. Use LaTeX notation where helpful (e.g., wrap equations in single $ for inline).

Problem:
${problem}

Provide a complete step-by-step solution with the final answer clearly stated.`;
}

export function essayPrompt(topic: string): string {
  return `You are an essay writing tutor. Generate a detailed, structured essay outline for a high school student on the following topic.

Topic: ${topic}

Use markdown formatting. Include:
- **Thesis Statement**
- **Introduction** (with hook and context)
- **Body Paragraphs** (3-4, each with topic sentence, supporting evidence/examples, and analysis)
- **Conclusion** (restate thesis, summarize, final thought)
- **Suggested Sources/Research Areas**

Make it detailed enough that a student could write a complete essay from this outline.`;
}

export function chatSystemPrompt(): string {
  return `You are StudyBoost AI, a friendly and knowledgeable study tutor for high school students. You help with any subject. Be concise, clear, and encouraging. Use markdown formatting. When explaining math, use LaTeX notation with $ delimiters. If a student seems confused, break things down further. Always be supportive.`;
}

export function vocabPrompt(text: string): string {
  return `You are a vocabulary teacher. Extract 10-15 important vocabulary words from the following text. For each word, provide its definition, part of speech, and an example sentence.

Text:
${text}

Return a JSON array:
[
  {
    "word": "the vocabulary word",
    "definition": "clear definition",
    "partOfSpeech": "noun/verb/adjective/etc",
    "example": "example sentence using the word"
  }
]`;
}

export function practicePrompt(topic: string, difficulty: string): string {
  return `You are a teacher creating practice problems for high school students.

Topic: ${topic}
Difficulty: ${difficulty}

Generate 5 practice problems. For each, provide the problem, a hint, and a detailed solution.

Return a JSON array:
[
  {
    "problem": "the problem statement",
    "hint": "a helpful hint without giving away the answer",
    "solution": "complete step-by-step solution",
    "difficulty": "${difficulty}"
  }
]`;
}

export function writingFeedbackPrompt(essay: string): string {
  return `You are a writing tutor. Review this student's writing and provide constructive feedback in markdown format.

Student's writing:
${essay}

Provide:
1. **Overall Assessment** (1-2 sentences)
2. **Strengths** (2-3 bullet points)
3. **Areas for Improvement** (2-3 bullet points with specific suggestions)
4. **Grammar & Style** (list any errors with corrections)
5. **Score** (out of 10, with brief justification)

Be encouraging and constructive.`;
}

export function assessmentPrompt(units: { id: string; name: string; topicNames: string[] }[]): string {
  const unitList = units.map(u => `- Unit "${u.name}" (id: "${u.id}"): topics include ${u.topicNames.join(', ')}`).join('\n');
  return `You are a math assessment generator for honors-level high school math. Generate exactly 2 multiple-choice questions per unit listed below. Questions should test conceptual understanding and problem-solving at an honors level. Use LaTeX notation with $ delimiters for all math expressions.

Units:
${unitList}

Return a JSON array of objects with this exact structure:
[
  {
    "unitId": "the unit id",
    "question": "the question text with $LaTeX$ for math",
    "options": ["option A with $LaTeX$", "option B", "option C", "option D"],
    "correctIndex": 0,
    "explanation": "brief explanation of the correct answer"
  }
]

Generate exactly ${units.length * 2} questions (2 per unit). Each must have exactly 4 options. correctIndex is 0-based. Make questions challenging but fair for honors students.`;
}

export function lessonPrompt(courseName: string, unitName: string, topicName: string, description: string): string {
  return `You are an expert math tutor creating a lesson for an honors high school student.

Course: ${courseName}
Unit: ${unitName}
Topic: ${topicName}
Description: ${description}

Create a comprehensive lesson covering this topic. Use markdown formatting and LaTeX notation with $ for inline math and $$ for display math. Structure your response as follows:

## ${topicName}

### Key Concepts
Explain the core ideas clearly with examples. Use callout boxes (> **Key Idea:** ...) for important definitions and theorems.

### Worked Examples
Show 2-3 worked examples with step-by-step solutions.

### Practice Problems
Provide exactly 3 practice problems of increasing difficulty. Format each as:

**Problem 1:**
[problem statement]

<details>
<summary>Show Solution</summary>

[detailed solution]

</details>

### Summary
Brief recap of the key takeaways.

Make the lesson thorough, clear, and appropriate for honors-level students.`;
}

export function translatePrompt(text: string, targetLang: string): string {
  return `Translate the following text to ${targetLang}. Provide:
1. The translation
2. Key vocabulary words from the translation with definitions
3. Any grammar notes relevant to a student learning ${targetLang}

Use markdown formatting.

Text to translate:
${text}`;
}
