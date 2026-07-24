import fetch from "node-fetch";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Core helper: send messages to Groq's free-tier chat completion endpoint.
 * Groq is OpenAI-API-compatible, so this can be swapped for OpenAI/Gemini
 * by changing the URL + headers if you have paid access.
 */
export const askAI = async (messages, { temperature = 0.6, maxTokens = 1000 } = {}) => {
  if (!process.env.GROQ_API_KEY) {
    throw Object.assign(new Error("AI provider not configured. Set GROQ_API_KEY in .env"), {
      statusCode: 500,
    });
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw Object.assign(new Error(`AI provider error: ${errText}`), { statusCode: 502 });
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
};

const SYSTEM_PROMPT = `You are StudySphere AI Tutor, a friendly, expert study companion for students.
- Explain concepts clearly, using simple language first, then depth if asked.
- Use Markdown formatting: headings, bullet points, and fenced code blocks with language tags.
- For math, use LaTeX inside $...$ for inline and $$...$$ for block equations.
- Be encouraging and concise. Avoid unnecessary filler.
- Adapt explanations to the student's apparent level based on their question.`;

// @route GET /api/ai/chats
export const listChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/chats
export const createChat = async (req, res, next) => {
  try {
    const chat = await Chat.create({ user: req.user._id, title: req.body.title || "New Chat" });
    res.status(201).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/ai/chats/:id/messages
export const getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/ai/chats/:id
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    await Message.deleteMany({ chat: chat._id });
    res.json({ success: true, message: "Chat deleted" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/chats/:id/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    await Message.create({ chat: chat._id, role: "user", content });

    // Pull recent history for context memory (last 12 messages)
    const history = await Message.find({ chat: chat._id }).sort({ createdAt: -1 }).limit(12);
    const orderedHistory = history.reverse().map((m) => ({ role: m.role, content: m.content }));

    const aiReply = await askAI([{ role: "system", content: SYSTEM_PROMPT }, ...orderedHistory]);

    const assistantMsg = await Message.create({ chat: chat._id, role: "assistant", content: aiReply });

    if (chat.title === "New Chat") {
      chat.title = content.slice(0, 50);
    }
    chat.updatedAt = new Date();
    await chat.save();

    res.json({ success: true, message: assistantMsg });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/quiz
export const generateQuiz = async (req, res, next) => {
  try {
    const { topic, numQuestions = 5, difficulty = "medium" } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic required" });

    const raw = await askAI(
      [
        {
          role: "system",
          content: `Generate a quiz as strict JSON only, no markdown fences, no commentary. Schema:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`,
        },
        {
          role: "user",
          content: `Topic: ${topic}. Difficulty: ${difficulty}. Number of questions: ${numQuestions}.`,
        },
      ],
      { maxTokens: 1800 }
    );

    let quiz;
    try {
      quiz = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return res.status(502).json({ success: false, message: "Failed to parse AI quiz output, try again." });
    }
    res.json({ success: true, quiz });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/flashcards
export const generateFlashcards = async (req, res, next) => {
  try {
    const { topic, count = 8 } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic required" });

    const raw = await askAI([
      {
        role: "system",
        content: `Generate flashcards as strict JSON only: {"flashcards":[{"question":"...","answer":"..."}]}. No markdown fences.`,
      },
      { role: "user", content: `Topic: ${topic}. Count: ${count}.` },
    ]);

    let flashcards = [];
    try {
      flashcards = JSON.parse(raw.replace(/```json|```/g, "").trim()).flashcards;
    } catch {
      flashcards = [];
    }
    res.json({ success: true, flashcards });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/roadmap
export const generateRoadmap = async (req, res, next) => {
  try {
    const { goal, weeks = 8 } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: "Goal required" });

    const raw = await askAI(
      [
        {
          role: "system",
          content: `Create a learning roadmap as strict JSON only:
{"roadmap":[{"week":1,"focus":"...","tasks":["...","..."]}]}`,
        },
        { role: "user", content: `Goal: ${goal}. Duration: ${weeks} weeks.` },
      ],
      { maxTokens: 1800 }
    );

    let roadmap;
    try {
      roadmap = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return res.status(502).json({ success: false, message: "Failed to parse AI roadmap output, try again." });
    }
    res.json({ success: true, roadmap: roadmap.roadmap || [] });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/ai/explain-code
export const explainCode = async (req, res, next) => {
  try {
    const { code, language = "auto" } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Code required" });

    const explanation = await askAI([
      {
        role: "system",
        content: "You are a patient programming tutor. Explain code clearly, line-by-line where useful, and mention complexity or bugs if relevant. Use Markdown with fenced code blocks.",
      },
      { role: "user", content: `Language: ${language}\n\n${code}` },
    ]);

    res.json({ success: true, explanation });
  } catch (err) {
    next(err);
  }
};
