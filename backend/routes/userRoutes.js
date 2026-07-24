import express from "express";
import { updateProfile, getDashboardSummary, trackStudyMinute } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.get("/dashboard", protect, getDashboardSummary);
router.post("/track-study", protect, trackStudyMinute);

export default router;