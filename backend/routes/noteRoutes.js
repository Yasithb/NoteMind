import express from "express";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  summarizeNote
} from "../controllers/noteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route("/")
  .get(getNotes)
  .post(createNote);

router.route("/:id")
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.post("/:id/summarize", summarizeNote);

export default router;