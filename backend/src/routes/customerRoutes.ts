import { Router } from "express";
import { customerController } from "../controllers/customerController.js";
import { authenticate } from "../middleware/auth.js";

export const customerRouter = Router();

customerRouter.get("/", authenticate, customerController.getCustomers);
customerRouter.get("/:id", authenticate, customerController.getCustomer360);
customerRouter.get("/:id/ai-summary", authenticate, customerController.getCustomerAiSummary);
