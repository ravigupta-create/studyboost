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
