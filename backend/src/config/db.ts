import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("[Database] MongoDB Connection Error:", error);
    process.exit(1);
  }
};
