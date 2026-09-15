import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  userName: string;
  role: string;
  action: "LOGIN" | "LOGOUT" | "FAILED_LOGIN" | "CUSTOMER_VIEW" | "PREDICTION_GENERATED" | "REPORT_EXPORTED" | "DATA_UPLOADED" | "MODEL_TRAINED" | "USER_CREATED" | "PERMISSION_CHANGED";
  resource?: string;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  action: {
    type: String,
    enum: [
      "LOGIN", "LOGOUT", "FAILED_LOGIN", "CUSTOMER_VIEW", "PREDICTION_GENERATED",
      "REPORT_EXPORTED", "DATA_UPLOADED", "MODEL_TRAINED", "USER_CREATED", "PERMISSION_CHANGED"
    ],
    required: true,
    index: true
  },
  resource: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  success: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed }
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
