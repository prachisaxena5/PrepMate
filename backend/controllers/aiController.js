import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { questionAnswerPrompt, conceptExplainPrompt } from "../utils/prompts.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// helper → clean Gemini output
function cleanGeminiResponse(text) {
  if (!text) return text;

  return text
    .replace(/```json|```/gi, "") // remove code fences
    .replace(/^Here.*?(?=\[|\{)/is, "") // remove "Here is..." before JSON
    .replace(/\\n/g, " ") // remove escaped newlines
    .replace(/[\r\n]+/g, " ") // collapse real newlines
    .replace(/\t+/g, " ") // remove tabs
    .replace(/[\u0000-\u001F]+/g, " ") // remove ALL control chars
    .trim();
}

// safe JSON.parse
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error("❌ JSON parse failed. Attempting recovery...\nRaw text:", str);

    let fixed = str
      .replace(/\\n/g, " ") // remove escaped newlines
      .replace(/[\r\n]+/g, " ") // collapse real newlines
      .replace(/\t+/g, " ") // remove tabs
      .replace(/\\"/g, '"') // fix escaped quotes
      .replace(/“|”/g, '"') // convert smart double quotes
      .replace(/‘|’/g, "'") // convert smart single quotes
      .replace(/,(\s*[\]}])/g, "$1"); // remove trailing commas

    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("❌ Recovery also failed. Returning raw text.\nFixed string:", fixed);
      return { rawText: fixed };
    }
  }
}

// Generate interview questions
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    let cleanText = cleanGeminiResponse(rawText);

    let questions = safeJsonParse(cleanText);
    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// Explain a concept
// export const generateConceptExplanation = async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ message: "Missing 'question' field" });
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//     const prompt = conceptExplainPrompt(question);

//     const result = await model.generateContent(prompt);
//     let rawText = result.response.text();
//     let cleanText = cleanGeminiResponse(rawText);

//     let explanation = safeJsonParse(cleanText);
//     res.json(explanation);
//   } catch (error) {
//     console.error("Error explaining concept:", error);
//     res.status(500).json({
//       message: "Failed to explain concept",
//       error: error.message,
//     });
//   }
// };


export const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing 'question' field" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = conceptExplainPrompt(question);

    const result = await model.generateContent(prompt);
    let rawText = result.response.text(); 
    let cleanText = cleanGeminiResponse(rawText);

    let explanation = safeJsonParse(cleanText);

    // ✅ send directly (no nested "explanation" wrapper)
    res.json(explanation);
  } catch (error) {
    console.error("Error explaining concept:", error);
    res.status(500).json({
      message: "Failed to explain concept",
      error: error.message,
    });
  }
};
