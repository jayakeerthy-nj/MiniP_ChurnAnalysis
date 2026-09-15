import { AuditLog } from "../models/AuditLog.js";

interface AuditParams {
  userId: string;
  userName: string;
  role: string;
  action: "LOGIN" | "LOGOUT" | "FAILED_LOGIN" | "CUSTOMER_VIEW" | "PREDICTION_GENERATED" | "REPORT_EXPORTED" | "DATA_UPLOADED" | "MODEL_TRAINED" | "USER_CREATED" | "PERMISSION_CHANGED";
  resource?: string;
  success?: boolean;
  metadata?: Record<string, any>;
}

export const logAudit = async (params: AuditParams): Promise<void> => {
  try {
    await AuditLog.create({
      userId: params.userId,
      userName: params.userName,
      role: params.role,
      action: params.action,
      resource: params.resource,
      success: params.success !== undefined ? params.success : true,
      metadata: params.metadata || {}
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};
