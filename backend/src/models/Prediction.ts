import mongoose, { Document, Schema } from "mongoose";

export interface IPrediction extends Document {
  predictionId: string;
  customerId: string;
  churnProbability: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  topRiskFactors: Array<{ feature: string; label: string; value: number; shapValue: number; impact: string }>;
  protectiveFactors: Array<{ feature: string; label: string; value: number; shapValue: number; impact: string }>;
  modelVersion: string;
  timestamp: Date;
}

const PredictionSchema = new Schema<IPrediction>({
  predictionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  churnProbability: { type: Number, required: true, index: true },
  riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true, index: true },
  topRiskFactors: [{ feature: String, label: String, value: Number, shapValue: Number, impact: String }],
  protectiveFactors: [{ feature: String, label: String, value: Number, shapValue: Number, impact: String }],
  modelVersion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const Prediction = mongoose.model<IPrediction>("Prediction", PredictionSchema);
