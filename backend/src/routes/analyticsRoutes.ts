import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.get("/dashboard", authenticate, analyticsController.getDashboard);
analyticsRouter.get("/risk", authenticate, analyticsController.getRisk);
analyticsRouter.get("/churn", authenticate, analyticsController.getChurn);
analyticsRouter.get("/segments", authenticate, analyticsController.getSegments);
analyticsRouter.get("/executive-brief", authenticate, analyticsController.getExecutiveBrief);
