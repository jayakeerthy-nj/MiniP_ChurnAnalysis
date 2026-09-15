import { Request, Response } from "express";
import { Customer } from "../models/Customer.js";
import { CustomerFeatures } from "../models/CustomerFeatures.js";
import { Account } from "../models/Account.js";
import { Transaction } from "../models/Transaction.js";
import { Complaint } from "../models/Complaint.js";
import { DigitalInteraction } from "../models/DigitalInteraction.js";
import { mlClientService } from "../services/mlClientService.js";
import { geminiService } from "../services/geminiService.js";
import { logAudit } from "../middleware/audit.js";

export const customerController = {
  async getCustomers(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || "15", 10)));
    const skip = (page - 1) * limit;

    const { search, risk, segment, city, minBalance, maxBalance, minEngagement, maxEngagement, sortBy, sortOrder } = req.query;

    const matchStage: Record<string, any> = {};

    if (risk && risk !== "ALL") {
      matchStage["features.predictedRiskLevel"] = risk;
    }
    if (segment && segment !== "ALL") {
      matchStage["features.cluster"] = parseInt(segment as string, 10);
    }
    if (city && city !== "ALL") {
      matchStage.city = city;
    }
    if (minBalance || maxBalance) {
      matchStage["features.currentBalance"] = {};
      if (minBalance) matchStage["features.currentBalance"].$gte = Number(minBalance);
      if (maxBalance) matchStage["features.currentBalance"].$lte = Number(maxBalance);
    }
    if (minEngagement || maxEngagement) {
      matchStage["features.engagementScore"] = {};
      if (minEngagement) matchStage["features.engagementScore"].$gte = Number(minEngagement);
      if (maxEngagement) matchStage["features.engagementScore"].$lte = Number(maxEngagement);
    }

    if (search) {
      const s = String(search).trim();
      matchStage.$or = [
        { customerId: { $regex: s, $options: "i" } },
        { name: { $regex: s, $options: "i" } },
        { city: { $regex: s, $options: "i" } }
      ];
    }

    const sortField = (sortBy as string) || "features.predictedChurnProb";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const pipeline: any[] = [
      {
        $lookup: {
          from: "customerfeatures",
          localField: "customerId",
          foreignField: "customerId",
          as: "features"
        }
      },
      { $unwind: { path: "$features", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      {
        $facet: {
          data: [
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                customerId: 1,
                name: 1,
                age: 1,
                city: 1,
                income: 1,
                creditScore: 1,
                tenureMonths: 1,
                accountStatus: 1,
                currentBalance: "$features.currentBalance",
                numberOfProducts: "$features.numberOfProducts",
                transactionsPerMonth: "$features.transactionsPerMonth",
                engagementScore: "$features.engagementScore",
                engagementCategory: "$features.engagementCategory",
                predictedChurnProb: "$features.predictedChurnProb",
                predictedRiskLevel: "$features.predictedRiskLevel",
                cluster: "$features.cluster",
                unresolvedComplaints: "$features.unresolvedComplaints"
              }
            }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const result = await Customer.aggregate(pipeline);
    const customers = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    res.json({
      success: true,
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  async getCustomer360(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const customer = await Customer.findOne({ customerId: id });
    if (!customer) {
      res.status(404).json({ success: false, error: "Customer not found" });
      return;
    }

    const [features, accounts, transactions, complaints, digitalInteractions] = await Promise.all([
      CustomerFeatures.findOne({ customerId: id }),
      Account.find({ customerId: id }),
      Transaction.find({ customerId: id }).sort({ date: -1 }).limit(30),
      Complaint.find({ customerId: id }).sort({ createdAt: -1 }),
      DigitalInteraction.find({ customerId: id }).sort({ date: -1 }).limit(40)
    ]);

    // Live or cached ML Prediction
    let prediction = null;
    if (features) {
      prediction = await mlClientService.predictChurn(features.toObject());
    }

    // Behavioral timeline (aggregate 6 months of historical activity)
    const timeline = [];
    const now = new Date("2026-09-01");
    for (let m = 5; m >= 0; m--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const monthName = monthStart.toLocaleString("default", { month: "short" });

      const txsInMonth = transactions.filter(
        (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
      );
      const txCount = txsInMonth.length;
      const txVol = txsInMonth.reduce((sum, t) => sum + t.amount, 0);

      const digInMonth = digitalInteractions.filter(
        (d) => new Date(d.date) >= monthStart && new Date(d.date) <= monthEnd
      );
      const digCount = digInMonth.length;

      const compInMonth = complaints.filter(
        (c) => new Date(c.createdAt) >= monthStart && new Date(c.createdAt) <= monthEnd
      );

      timeline.push({
        month: monthName,
        transactionCount: txCount,
        transactionVolume: Math.round(txVol),
        digitalLogins: digCount,
        complaints: compInMonth.length
      });
    }

    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: "CUSTOMER_VIEW",
        resource: customer.customerId,
        metadata: { customerName: customer.name }
      });
    }

    res.json({
      success: true,
      customer,
      features,
      accounts,
      transactions,
      complaints,
      prediction,
      timeline
    });
  },

  async getCustomerAiSummary(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const customer = await Customer.findOne({ customerId: id });
    if (!customer) {
      res.status(404).json({ success: false, error: "Customer not found" });
      return;
    }

    const features = await CustomerFeatures.findOne({ customerId: id });
    const prediction = features ? await mlClientService.predictChurn(features.toObject()) : null;

    const summary = await geminiService.generateCustomerInsight(
      customer.toObject(),
      features ? features.toObject() : {},
      prediction || { churnProbability: 0.2, riskLevel: "LOW" }
    );

    res.json({ success: true, summary });
  }
};
