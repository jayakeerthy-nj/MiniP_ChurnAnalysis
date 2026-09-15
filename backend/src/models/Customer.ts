import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  age: number;
  gender: string;
  income: number;
  occupation: string;
  city: string;
  creditScore: number;
  tenureMonths: number;
  accountStatus: "ACTIVE" | "CHURNED" | "DORMANT";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  customerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  age: { type: Number, required: true, index: true },
  gender: { type: String, required: true },
  income: { type: Number, required: true, index: true },
  occupation: { type: String, required: true },
  city: { type: String, required: true, index: true },
  creditScore: { type: Number, required: true, index: true },
  tenureMonths: { type: Number, required: true, index: true },
  accountStatus: { type: String, enum: ["ACTIVE", "CHURNED", "DORMANT"], default: "ACTIVE", index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
