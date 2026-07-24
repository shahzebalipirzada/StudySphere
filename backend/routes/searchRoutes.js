import express from "express";
import { smartSearch } from "../controllers/searchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/", protect, smartSearch);

export default router;
