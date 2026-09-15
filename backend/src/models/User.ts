import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "ANALYST" | "MANAGER";
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "ANALYST", "MANAGER"], default: "ANALYST" },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>("User", UserSchema);
