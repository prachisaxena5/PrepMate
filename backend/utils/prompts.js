const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
You are an AI trained to generate **technical interview questions and detailed structured answers**.

### Task
- Role: ${role}
- Candidate Experience: ${experience} years
- Focus Topics: ${topicsToFocus}
- Write ${numberOfQuestions} interview questions.
- For each question, generate a detailed, beginner-friendly answer (minimum 150 words).

### Answer Format (STRICT)
For every answer:
- Break into multiple **sections**.
- Each section must have:
  - "heading": a short heading title (e.g., "Concept Overview", "Why It Matters", etc.)
  - "explanation": a long explanation (paragraphs, bullet points, code blocks allowed).

### Output Rules
- Return ONLY a valid JSON array.
- No text outside JSON.
- Strictly follow this format:

[
  {
    "question": "What is Express.js testing?",
    "answer": {
      "sections": [
        {
          "heading": "Concept Overview",
          "explanation": "Explain what the concept is..."
        },
        {
          "heading": "Why It Matters",
          "explanation": "Explain importance..."
        },
        {
          "heading": "Step-by-Step Explanation",
          "explanation": "Detailed breakdown..."
        },
        {
          "heading": "Example Code",
          "explanation": "\`\`\`js\\n// code here\\n\`\`\`"
        },
        {
          "heading": "Real-World Analogy",
          "explanation": "Relatable analogy..."
        }
      ]
    }
  }
]
`;


const conceptExplainPrompt = (question) => `
You are an AI trained to generate **structured explanations** for interview questions.

### Task
- Question: "${question}"
- Provide a **short title** summarizing the concept for a page/article header.
- Break the explanation into **sections**.
- Each section must have:
  - "heading": a short heading title
  - "explanation": a long explanation (paragraphs, bullet points, code blocks allowed).
- Minimum 4 sections required:
  - Concept Overview
  - Why It Matters
  - Step-by-Step Breakdown
  - Example Code
  - Real-World Analogy

### Output Rules
- Return ONLY a valid JSON object.
- No text outside JSON.
- Strictly follow this format:

{
  "title": "Express.js Testing",
  "sections": [
    {
      "heading": "Concept Overview",
      "explanation": "Explain what the concept is..."
    },
    {
      "heading": "Why It Matters",
      "explanation": "Explain importance..."
    },
    {
      "heading": "Step-by-Step Breakdown",
      "explanation": "Detailed walkthrough..."
    },
    {
      "heading": "Example Code",
      "explanation": "\`\`\`js\\n// code here\\n\`\`\`"
    },
    {
      "heading": "Real-World Analogy",
      "explanation": "Relatable analogy..."
    }
  ]
}
`;

export { questionAnswerPrompt, conceptExplainPrompt };
