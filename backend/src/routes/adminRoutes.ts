import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole(["ADMIN"]));

adminRouter.get("/users", adminController.getUsers);
adminRouter.post("/users", adminController.createUser);
adminRouter.get("/audit", adminController.getAuditLogs);
adminRouter.get("/models", adminController.getModelMonitoring);
adminRouter.post("/upload-dataset", adminController.uploadDatasetCsv);
