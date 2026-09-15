import { Router } from "express";
import { reportController } from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";

export const reportRouter = Router();

reportRouter.get("/export/csv", authenticate, reportController.exportCustomerRiskCsv);
reportRouter.get("/summary", authenticate, reportController.getExecutiveSummaryReport);
