import express from "express";
import { searchYoutube } from "../controllers/youtubeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/search", protect, searchYoutube);

export default router;
