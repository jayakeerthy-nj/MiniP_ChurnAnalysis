import { Request, Response } from "express";
import { mlClientService } from "../services/mlClientService.js";
import { CustomerFeatures } from "../models/CustomerFeatures.js";

export const simulatorController = {
  async simulate(req: Request, res: Response): Promise<void> {
    const { customerId, originalFeatures, modifications } = req.body;

    let baseFeatures = originalFeatures;
    if (!baseFeatures && customerId) {
      const featDoc = await CustomerFeatures.findOne({ customerId });
      if (featDoc) {
        baseFeatures = featDoc.toObject();
      }
    }

    if (!baseFeatures) {
      res.status(400).json({ success: false, error: "Original features or valid customerId required" });
      return;
    }

    const result = await mlClientService.simulateIntervention(baseFeatures, modifications || {});
    res.json({ success: true, simulation: result });
  }
};
