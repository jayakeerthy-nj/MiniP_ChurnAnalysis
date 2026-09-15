import mongoose, { Document, Schema } from "mongoose";

export interface IModelVersion extends Document {
  modelVersion: string;
  currentModel: string;
  trainingTimestamp: Date;
  datasetSize: number;
  featuresCount: number;
  evaluationMetrics: Record<string, any>;
  featureImportance: Array<{ feature: string; importance: number }>;
  silhouetteScore: number;
}

const ModelVersionSchema = new Schema<IModelVersion>({
  modelVersion: { type: String, required: true, unique: true },
  currentModel: { type: String, required: true },
  trainingTimestamp: { type: Date, required: true },
  datasetSize: { type: Number, required: true },
  featuresCount: { type: Number, required: true },
  evaluationMetrics: { type: Schema.Types.Mixed, required: true },
  featureImportance: [{ feature: String, importance: Number }],
  silhouetteScore: { type: Number, required: true }
});

export const ModelVersion = mongoose.model<IModelVersion>("ModelVersion", ModelVersionSchema);
