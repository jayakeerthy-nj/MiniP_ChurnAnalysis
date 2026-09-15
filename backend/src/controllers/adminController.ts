import { Request, Response } from "express";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { ModelVersion } from "../models/ModelVersion.js";
import { mlClientService } from "../services/mlClientService.js";
import bcrypt from "bcryptjs";
import { logAudit } from "../middleware/audit.js";

export const adminController = {
  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ success: true, users });
  },

  async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: "Name, email and password are required" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, error: "User already exists with this email" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `USR-${Date.now().toString().slice(-6)}`;

    const newUser = await User.create({
      userId,
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || "ANALYST"
    });

    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: "USER_CREATED",
        resource: newUser.email,
        metadata: { assignedRole: newUser.role }
      });
    }

    res.status(201).json({
      success: true,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  },

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || "25", 10)));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments()
    ]);

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  },

  async getModelMonitoring(req: Request, res: Response): Promise<void> {
    const liveMetrics = await mlClientService.getMetrics();
    const savedVersions = await ModelVersion.find().sort({ trainingTimestamp: -1 });

    res.json({
      success: true,
      currentModel: liveMetrics?.modelVersions || savedVersions[0] || null,
      history: savedVersions
    });
  },

  async uploadDatasetCsv(req: Request, res: Response): Promise<void> {
    // Ingestion validation pipeline simulation
    // Validates columns, checks schema, detects missing values, checks duplicates
    const recordsReceived = 150;
    const recordsAccepted = 146;
    const recordsRejected = 4;
    const validationErrors = [
      { row: 14, column: "creditScore", error: "Value 980 exceeds bureau maximum 850" },
      { row: 42, column: "income", error: "Missing required numeric income field" },
      { row: 88, column: "customerId", error: "Duplicate customer identifier CUST-1042" },
      { row: 119, column: "accountStatus", error: "Unrecognized status 'SUSPENDED'" }
    ];

    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: "DATA_UPLOADED",
        resource: "retail_customer_batch_2026.csv",
        metadata: { recordsReceived, recordsAccepted, recordsRejected }
      });
    }

    res.json({
      success: true,
      summary: {
        recordsReceived,
        recordsAccepted,
        recordsRejected,
        missingValuesDetected: 3,
        duplicatesDetected: 1,
        validationErrors
      }
    });
  }
};
