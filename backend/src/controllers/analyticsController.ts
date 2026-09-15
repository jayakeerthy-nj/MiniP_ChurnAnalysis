import { Request, Response } from "express";
import { analyticsService } from "../services/analyticsService.js";
import { geminiService } from "../services/geminiService.js";

export const analyticsController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getDashboardOverview();
    res.json({ success: true, ...data });
  },

  async getRisk(req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getRiskAnalytics();
    res.json({ success: true, ...data });
  },

  async getChurn(req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getChurnAnalytics();
    res.json({ success: true, ...data });
  },

  async getSegments(req: Request, res: Response): Promise<void> {
    const segments = await analyticsService.getSegmentsAnalytics();
    res.json({ success: true, segments });
  },

  async getExecutiveBrief(req: Request, res: Response): Promise<void> {
    const dashboard = await analyticsService.getDashboardOverview();
    const churn = await analyticsService.getChurnAnalytics();
    const brief = await geminiService.generateExecutiveBrief(
      dashboard.kpis,
      churn.correlationMatrix
    );
    res.json({ success: true, brief });
  }
};
