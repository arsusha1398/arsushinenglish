import express from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticateToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken, authorize(["ADMIN"]));

router.get("/students", adminController.getStudents);
router.get("/stats/dashboard", adminController.getDashboardStats);

export default router;
