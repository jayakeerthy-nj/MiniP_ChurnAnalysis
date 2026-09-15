import { Router } from "express";
import { simulatorController } from "../controllers/simulatorController.js";
import { authenticate } from "../middleware/auth.js";

export const simulatorRouter = Router();

simulatorRouter.post("/simulate", authenticate, simulatorController.simulate);
