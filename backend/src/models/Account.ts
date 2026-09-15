import mongoose, { Document, Schema } from "mongoose";

export interface IAccount extends Document {
  accountId: string;
  customerId: string;
  accountType: "SAVINGS" | "CURRENT" | "SALARY" | "FD";
  balance: number;
  openedAt: Date;
  status: "ACTIVE" | "DORMANT" | "CLOSED";
  branch: string;
}

const AccountSchema = new Schema<IAccount>({
  accountId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  accountType: { type: String, required: true },
  balance: { type: Number, required: true, index: true },
  openedAt: { type: Date, required: true },
  status: { type: String, default: "ACTIVE" },
  branch: { type: String, required: true }
});

export const Account = mongoose.model<IAccount>("Account", AccountSchema);
