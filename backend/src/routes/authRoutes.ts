import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", authenticate, authController.logout);
