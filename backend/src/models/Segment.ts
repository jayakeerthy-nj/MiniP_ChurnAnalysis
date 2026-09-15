import mongoose, { Document, Schema } from "mongoose";

export interface ISegment extends Document {
  clusterId: number;
  label: string;
  color: string;
  description: string;
  size: number;
  percentage: number;
  avgBalance: number;
  avgEngagement: number;
  churnRate: number;
  avgComplaints: number;
  digitalUsage: number;
  avgProducts: number;
  avgIncome: number;
  avgTenureMonths: number;
}

const SegmentSchema = new Schema<ISegment>({
  clusterId: { type: Number, required: true, unique: true },
  label: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String, required: true },
  size: { type: Number, required: true },
  percentage: { type: Number, required: true },
  avgBalance: { type: Number, required: true },
  avgEngagement: { type: Number, required: true },
  churnRate: { type: Number, required: true },
  avgComplaints: { type: Number, required: true },
  digitalUsage: { type: Number, required: true },
  avgProducts: { type: Number, required: true },
  avgIncome: { type: Number, required: true },
  avgTenureMonths: { type: Number, required: true }
});

export const Segment = mongoose.model<ISegment>("Segment", SegmentSchema);
