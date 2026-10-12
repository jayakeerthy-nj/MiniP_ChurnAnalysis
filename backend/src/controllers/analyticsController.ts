import { Request, Response } from "express";
import { analyticsService } from "../services/analyticsService.js";
import { geminiService } from "../services/geminiService.js";
import { mlClientService } from "../services/mlClientService.js";

export const analyticsController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    const model = (req.query.model as string) || "bankshield_hybrid";
    const combined = req.query.combined ? (req.query.combined as string).split(",") : undefined;
    const data = await analyticsService.getDashboardOverview(model, combined);
    res.json({ success: true, ...data });
  },

  async getRisk(req: Request, res: Response): Promise<void> {
    const model = (req.query.model as string) || "bankshield_hybrid";
    const combined = req.query.combined ? (req.query.combined as string).split(",") : undefined;
    const data = await analyticsService.getRiskAnalytics(model, combined);
    res.json({ success: true, ...data });
  },

  async getChurn(req: Request, res: Response): Promise<void> {
    const model = (req.query.model as string) || "bankshield_hybrid";
    const combined = req.query.combined ? (req.query.combined as string).split(",") : undefined;
    const data = await analyticsService.getChurnAnalytics(model, combined);
    res.json({ success: true, ...data });
  },

  async getSegments(req: Request, res: Response): Promise<void> {
    const segments = await analyticsService.getSegmentsAnalytics();
    res.json({ success: true, segments });
  },

  async getExecutiveBrief(req: Request, res: Response): Promise<void> {
    const model = (req.query.model as string) || "bankshield_hybrid";
    const dashboard = await analyticsService.getDashboardOverview(model);
    const churn = await analyticsService.getChurnAnalytics(model);
    const brief = await geminiService.generateExecutiveBrief(
      dashboard.kpis,
      churn.correlationMatrix
    );
    res.json({ success: true, brief });
  },

  async getModels(req: Request, res: Response): Promise<void> {
    const catalog = await mlClientService.getAvailableModels();
    res.json({ success: true, ...catalog });
  }
};
