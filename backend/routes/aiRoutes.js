import express from "express";
import rateLimit from "express-rate-limit";
import {
  listChats,
  createChat,
  getChatMessages,
  deleteChat,
  sendMessage,
  generateQuiz,
  generateFlashcards,
  generateRoadmap,
  explainCode,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "You're sending requests too fast. Slow down a bit." },
});
router.use(aiLimiter);

router.get("/chats", listChats);
router.post("/chats", createChat);
router.get("/chats/:id/messages", getChatMessages);
router.delete("/chats/:id", deleteChat);
router.post("/chats/:id/messages", sendMessage);

router.post("/quiz", generateQuiz);
router.post("/flashcards", generateFlashcards);
router.post("/roadmap", generateRoadmap);
router.post("/explain-code", explainCode);

export default router;
