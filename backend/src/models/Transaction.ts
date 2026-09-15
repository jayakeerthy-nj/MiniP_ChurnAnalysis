import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  customerId: string;
  date: Date;
  amount: number;
  transactionType: "UPI" | "ATM" | "POS" | "NEFT" | "RTGS" | "IMPS" | "Cash" | "Card";
  channel: "Mobile" | "Web" | "ATM" | "Branch";
  category: string;
  merchant: string;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, required: true },
  channel: { type: String, required: true },
  category: { type: String, required: true },
  merchant: { type: String, required: true }
});

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
