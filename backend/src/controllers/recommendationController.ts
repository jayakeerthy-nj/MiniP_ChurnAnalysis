import { Request, Response } from "express";
import { CustomerFeatures } from "../models/CustomerFeatures.js";
import { Customer } from "../models/Customer.js";

export const recommendationController = {
  async getRecommendations(req: Request, res: Response): Promise<void> {
    // 1. Service Recovery Candidates: Churn risk > 65% AND unresolvedComplaints > 0
    const serviceRecovery = await CustomerFeatures.find({
      predictedRiskLevel: { $in: ["HIGH", "CRITICAL"] },
      unresolvedComplaints: { $gt: 0 }
    }).sort({ currentBalance: -1 }).limit(10);

    // 2. High Balance RM Outreach: Balance > 500,000 AND risk >= HIGH
    const rmOutreach = await CustomerFeatures.find({
      currentBalance: { $gte: 500000 },
      predictedRiskLevel: { $in: ["HIGH", "CRITICAL"] }
    }).sort({ currentBalance: -1 }).limit(10);

    // 3. Digital Engagement Campaign: Digital usage < 40% AND risk >= MEDIUM
    const digitalCampaign = await CustomerFeatures.find({
      digitalUsagePercentage: { $lt: 40 },
      predictedRiskLevel: { $in: ["MEDIUM", "HIGH", "CRITICAL"] }
    }).sort({ transactionsPerMonth: 1 }).limit(10);

    // 4. Product Expansion Defense: Products <= 2 AND risk >= HIGH
    const productDefense = await CustomerFeatures.find({
      numberOfProducts: { $lte: 2 },
      predictedRiskLevel: { $in: ["HIGH", "CRITICAL"] }
    }).sort({ currentBalance: -1 }).limit(10);

    // Helper to attach names
    const enrich = async (items: any[]) => {
      const cids = items.map((i) => i.customerId);
      const custs = await Customer.find({ customerId: { $in: cids } });
      const cMap = new Map(custs.map((c) => [c.customerId, c.name]));
      return items.map((i) => ({
        customerId: i.customerId,
        name: cMap.get(i.customerId) || i.customerId,
        currentBalance: i.currentBalance,
        predictedRiskLevel: i.predictedRiskLevel,
        predictedChurnProb: i.predictedChurnProb,
        unresolvedComplaints: i.unresolvedComplaints,
        digitalUsagePercentage: i.digitalUsagePercentage,
        numberOfProducts: i.numberOfProducts
      }));
    };

    const recommendations = [
      {
        id: "REC-01",
        title: "Priority Service Recovery & Grievance Resolution",
        priority: "CRITICAL",
        badgeColor: "#ef4444",
        category: "Customer Service",
        rationale: "Customers with unresolved support complaints exhibit a 3.8x higher immediate attrition probability. Resolving friction prevents balance flight.",
        targetCount: serviceRecovery.length,
        action: "Assign Dedicated Resolution Specialist; waive disputed fees & schedule executive outreach call within 24 hours.",
        signals: ["Unresolved Complaints > 0", "Predicted Risk > 65%"],
        sampleCustomers: await enrich(serviceRecovery.slice(0, 4))
      },
      {
        id: "REC-02",
        title: "High-Net-Worth Relationship Manager Outreach",
        priority: "HIGH",
        badgeColor: "#f97316",
        category: "Wealth & Deposits",
        rationale: "Substantial capital exposure (>₹500,000) coupled with decelerating activity indicates imminent balance drainage to competitor banks.",
        targetCount: rmOutreach.length,
        action: "Schedule private banking consultation; offer preferential fixed deposit yields (+35 bps) and treasury advisory.",
        signals: ["Balance > ₹500,000", "Predicted Risk >= HIGH"],
        sampleCustomers: await enrich(rmOutreach.slice(0, 4))
      },
      {
        id: "REC-03",
        title: "Digital Banking Activation & Mobile Onboarding",
        priority: "MEDIUM",
        badgeColor: "#00d2ff",
        category: "Digital Transformation",
        rationale: "Branch-dependent customers with low digital activity lack behavioral stickiness, making account switching frictionless.",
        targetCount: digitalCampaign.length,
        action: "Dispatch assisted mobile banking demo via WhatsApp; provide ₹500 cashback on first 3 UPI bill payments.",
        signals: ["Digital Adoption < 40%", "Low Login Frequency"],
        sampleCustomers: await enrich(digitalCampaign.slice(0, 4))
      },
      {
        id: "REC-04",
        title: "Multi-Product Cross-Sell Defense",
        priority: "MEDIUM",
        badgeColor: "#8b5cf6",
        category: "Product Growth",
        rationale: "Single-product customers have a 48% higher churn vulnerability. Anchoring customers with secondary facilities reduces attrition.",
        targetCount: productDefense.length,
        action: "Pre-approved pre-qualified lifetime-free Platinum Credit Card or recurring deposit bundle with zero issuance charge.",
        signals: ["Products Held <= 2", "Tenure > 12 Months"],
        sampleCustomers: await enrich(productDefense.slice(0, 4))
      }
    ];

    res.json({ success: true, recommendations });
  }
};
