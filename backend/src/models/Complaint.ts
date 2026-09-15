import mongoose, { Document, Schema } from "mongoose";

export interface IComplaint extends Document {
  complaintId: string;
  customerId: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: Date;
  resolvedAt?: Date;
  resolutionTime?: number;
}

const ComplaintSchema = new Schema<IComplaint>({
  complaintId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
  status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], required: true, index: true },
  createdAt: { type: Date, required: true, index: true },
  resolvedAt: { type: Date },
  resolutionTime: { type: Number }
});

export const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);
