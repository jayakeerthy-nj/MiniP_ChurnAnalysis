import { Router } from "express";
import { recommendationController } from "../controllers/recommendationController.js";
import { authenticate } from "../middleware/auth.js";

export const recommendationRouter = Router();

recommendationRouter.get("/", authenticate, recommendationController.getRecommendations);
