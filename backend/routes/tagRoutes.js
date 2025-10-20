import express from "express";
import {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag
} from "../controllers/tagController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route("/")
  .get(getTags)
  .post(createTag);

router.route("/:id")
  .get(getTag)
  .put(updateTag)
  .delete(deleteTag);

export default router;