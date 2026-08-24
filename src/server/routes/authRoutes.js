import express from "express";
import * as authController from "../controllers/authController.js";
import { validate, registerSchema, loginSchema } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
