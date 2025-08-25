import express from "express";
import { togglePinQuestion, updateQuestionNote, addQuestionToSession } from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addQuestionToSession);
router.post("/:id/pin", togglePinQuestion);
router.post("/:id/note", protect, updateQuestionNote);

export default router;
