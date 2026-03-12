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
  return `You are an expert math tutor teaching a student who assessed themselves on ${courseName} and does NOT yet know this topic. Your goal: get them from zero to mastery in the shortest possible reading time.

Topic: ${topicName}
Unit: ${unitName}
What they need to learn: ${description}

TEACHING RULES — follow these strictly:
- Use LaTeX: $ for inline, $$ for display math
- Every sentence must teach. Zero filler, zero motivation speeches, zero "let's explore"
- Teach the MINIMUM needed to solve problems correctly — not a textbook chapter
- Use the "example sandwich": rule → worked example → rule restated with nuance
- Bold key terms on first use only
- If a concept has a shortcut or pattern, teach the pattern, not just the formal definition

## ${topicName}

> **Big picture:** One sentence — why this matters and where it connects in ${unitName}.

### The Ideas

For each concept (use as few as needed — combine related ideas):
1. State the rule/formula in a callout: > **Key Idea:** ...
2. Immediately show ONE clean worked example applying it (every algebraic step shown)
3. If students commonly mess this up: > ⚠️ **Common trap:** ... (with the wrong vs right approach)

Merge related concepts — don't split what can be taught together. If the topic has 1 core idea, teach 1. If it has 3, teach 3. Don't pad.

### Worked Examples

2-3 worked examples, progressing from straightforward to honors-level. For each:
- State the problem
- Show EVERY step with brief reasoning (student should be able to follow without guessing)
- Box or bold the final answer

### Cheat Sheet

Bullet-point reference card: just the formulas/rules, no explanations. This is what they'd write on a notecard.

Do NOT include practice problems — those come separately. Do NOT include introductions, conclusions, or summaries. Start teaching immediately.`;
}

export function practiceProblemsPrompt(courseName: string, unitName: string, topicName: string, description: string): string {
  return `Generate 5 multiple-choice problems to test whether an honors ${courseName} student has mastered this topic.

Topic: ${topicName} (${unitName})
What was taught: ${description}

PROBLEM DESIGN RULES:
- Each problem must test a DIFFERENT aspect or application of the topic — no two problems should test the same skill
- Wrong answers (distractors) must be answers a student would get by making a specific common mistake (sign error, forgetting a step, applying wrong rule). Never use random numbers as distractors
- The solution must teach: show every step, explain WHY each step works, and name the mistake that leads to each wrong answer
- Use LaTeX with $ delimiters for all math

DIFFICULTY (strict):
- Problems 1-2: "easy" — direct, single-step application of one concept
- Problems 3-4: "medium" — multi-step OR combines two concepts from the topic
- Problem 5: "hard" — requires creative application, edge cases, or connecting to prior knowledge. Honors-level

Return a JSON array:
[
  {
    "question": "problem text with $LaTeX$",
    "options": ["$A$", "$B$", "$C$", "$D$"],
    "correctIndex": 0,
    "difficulty": "easy",
    "solution": "Step-by-step solution that teaches HOW and WHY. Name the common mistake that produces each distractor."
  }
]

Exactly 5 problems, 4 options each, correctIndex 0-based.`;
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
