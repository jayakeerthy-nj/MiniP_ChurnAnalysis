import mongoose, { Document, Schema } from "mongoose";

export interface ICustomerFeatures extends Document {
  customerId: string;
  // Financial
  currentBalance: number;
  averageBalance: number;
  minimumBalance: number;
  maximumBalance: number;
  balanceVolatility: number;
  averageTransactionValue: number;
  monthlyTransactionValue: number;
  // Engagement
  transactionsPerMonth: number;
  daysSinceLastTransaction: number;
  monthlyActiveDays: number;
  transactionGrowthRate: number;
  engagementScore: number;
  engagementCategory: string;
  scoreBreakdown: {
    transactionFrequency: number;
    digitalUsage: number;
    productUsage: number;
    recency: number;
    servicePenalty: number;
  };
  // Product
  numberOfProducts: number;
  hasCreditCard: boolean;
  hasLoan: boolean;
  hasInvestment: boolean;
  hasInsurance: boolean;
  // Service
  complaintCount: number;
  complaintsLast90Days: number;
  unresolvedComplaints: number;
  averageResolutionTime: number;
  // Digital
  digitalUsagePercentage: number;
  mobileLoginFrequency: number;
  webLoginFrequency: number;
  digitalSessionDuration: number;
  // Demographics
  age: number;
  income: number;
  creditScore: number;
  tenureMonths: number;
  // ML Labels & Clusters
  churn: number;
  predictedChurnProb?: number;
  predictedRiskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cluster?: number;
}

const CustomerFeaturesSchema = new Schema<ICustomerFeatures>({
  customerId: { type: String, required: true, unique: true, index: true },
  currentBalance: { type: Number, required: true, index: true },
  averageBalance: { type: Number, required: true },
  minimumBalance: { type: Number, required: true },
  maximumBalance: { type: Number, required: true },
  balanceVolatility: { type: Number, required: true },
  averageTransactionValue: { type: Number, required: true },
  monthlyTransactionValue: { type: Number, required: true },
  transactionsPerMonth: { type: Number, required: true },
  daysSinceLastTransaction: { type: Number, required: true, index: true },
  monthlyActiveDays: { type: Number, required: true },
  transactionGrowthRate: { type: Number, required: true },
  engagementScore: { type: Number, required: true, index: true },
  engagementCategory: { type: String, required: true, index: true },
  scoreBreakdown: {
    transactionFrequency: Number,
    digitalUsage: Number,
    productUsage: Number,
    recency: Number,
    servicePenalty: Number
  },
  numberOfProducts: { type: Number, required: true, index: true },
  hasCreditCard: { type: Boolean, default: false },
  hasLoan: { type: Boolean, default: false },
  hasInvestment: { type: Boolean, default: false },
  hasInsurance: { type: Boolean, default: false },
  complaintCount: { type: Number, required: true },
  complaintsLast90Days: { type: Number, required: true },
  unresolvedComplaints: { type: Number, required: true, index: true },
  averageResolutionTime: { type: Number, required: true },
  digitalUsagePercentage: { type: Number, required: true, index: true },
  mobileLoginFrequency: { type: Number, required: true },
  webLoginFrequency: { type: Number, required: true },
  digitalSessionDuration: { type: Number, required: true },
  age: { type: Number, required: true, index: true },
  income: { type: Number, required: true, index: true },
  creditScore: { type: Number, required: true, index: true },
  tenureMonths: { type: Number, required: true, index: true },
  churn: { type: Number, required: true, index: true },
  predictedChurnProb: { type: Number, index: true },
  predictedRiskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], index: true },
  cluster: { type: Number, index: true }
});

export const CustomerFeatures = mongoose.model<ICustomerFeatures>("CustomerFeatures", CustomerFeaturesSchema);
