import { Request, Response } from "express";
import { Customer } from "../models/Customer.js";
import { CustomerFeatures } from "../models/CustomerFeatures.js";
import { analyticsService } from "../services/analyticsService.js";
import { logAudit } from "../middleware/audit.js";

export const reportController = {
  async exportCustomerRiskCsv(req: Request, res: Response): Promise<void> {
    const customers = await Customer.find().limit(500);
    const features = await CustomerFeatures.find().limit(500);
    const fMap = new Map(features.map((f) => [f.customerId, f]));

    let csv = "Customer ID,Name,City,Age,Income,Credit Score,Tenure Months,Balance,Products,Transactions/Mo,Engagement Score,Risk Level,Churn Probability\n";
    
    customers.forEach((c) => {
      const f = fMap.get(c.customerId);
      csv += `"${c.customerId}","${c.name}","${c.city}",${c.age},${c.income},${c.creditScore},${c.tenureMonths},${f?.currentBalance || 0},${f?.numberOfProducts || 1},${f?.transactionsPerMonth || 0},${f?.engagementScore || 50},"${f?.predictedRiskLevel || 'MEDIUM'}",${f?.predictedChurnProb || 0.3}\n`;
    });

    if (req.user) {
      await logAudit({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: "REPORT_EXPORTED",
        resource: "CustomerRiskReport.csv"
      });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=Customer_Risk_Report.csv");
    res.status(200).send(csv);
  },

  async getExecutiveSummaryReport(req: Request, res: Response): Promise<void> {
    const dashboard = await analyticsService.getDashboardOverview();
    const risk = await analyticsService.getRiskAnalytics();
    const churn = await analyticsService.getChurnAnalytics();
    const segments = await analyticsService.getSegmentsAnalytics();

    res.json({
      success: true,
      report: {
        title: "Executive Banking Risk & Churn Intelligence Brief",
        generatedAt: new Date().toISOString(),
        kpis: dashboard.kpis,
        riskDistribution: dashboard.riskDistribution,
        riskByAge: risk.riskByAge,
        riskByProducts: risk.riskByProducts,
        churnDrivers: churn.correlationMatrix,
        segments
      }
    });
  }
};
