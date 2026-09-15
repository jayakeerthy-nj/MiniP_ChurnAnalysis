import mongoose, { Document, Schema } from "mongoose";

export interface IDigitalInteraction extends Document {
  interactionId: string;
  customerId: string;
  date: Date;
  platform: "Mobile" | "Web";
  loginCount: number;
  sessionDuration: number;
  featureUsed: string;
}

const DigitalInteractionSchema = new Schema<IDigitalInteraction>({
  interactionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  platform: { type: String, required: true },
  loginCount: { type: Number, required: true },
  sessionDuration: { type: Number, required: true },
  featureUsed: { type: String, required: true }
});

export const DigitalInteraction = mongoose.model<IDigitalInteraction>("DigitalInteraction", DigitalInteractionSchema);
