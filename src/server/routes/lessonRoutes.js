import express from "express";
import * as lessonController from "../controllers/lessonController.js";
import { authenticateToken, authorize } from "../middleware/authMiddleware.js";
import {
  validate,
  createLessonSchema,
  updateLessonStatusSchema,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorize(["ADMIN"]), validate(createLessonSchema), lessonController.createLesson);
router.put(
  "/:id/status",
  authorize(["ADMIN"]),
  validate(updateLessonStatusSchema),
  lessonController.updateLessonStatus,
);

export default router;
