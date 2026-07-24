import express from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  summarizeNote,
  generateFlashcardsFromNote,
} from "../controllers/noteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNote).put(updateNote).delete(deleteNote);
router.post("/:id/summarize", summarizeNote);
router.post("/:id/flashcards", generateFlashcardsFromNote);

export default router;
