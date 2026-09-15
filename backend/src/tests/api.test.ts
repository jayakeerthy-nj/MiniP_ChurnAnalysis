import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Customer } from "../models/Customer.js";
import { CustomerFeatures } from "../models/CustomerFeatures.js";
import { analyticsService } from "../services/analyticsService.js";
import { mlClientService } from "../services/mlClientService.js";

test("Backend Integration Suite", async (t) => {
  await connectDB();

  await t.test("MongoDB has seeded users", async () => {
    const admin = await User.findOne({ email: "admin@bank.com" });
    assert.ok(admin, "Admin user should exist");
    assert.strictEqual(admin.role, "ADMIN");
  });

  await t.test("MongoDB has populated customers and features", async () => {
    const count = await Customer.countDocuments();
    assert.ok(count >= 1000, `Expected >= 1000 customers, got ${count}`);

    const features = await CustomerFeatures.findOne({ customerId: "CUST-1001" });
    assert.ok(features, "Features record for CUST-1001 should exist");
    assert.ok(typeof features.engagementScore === "number");
    assert.ok(features.currentBalance > 0);
  });

  await t.test("Analytics Service returns real calculated KPIs", async () => {
    const overview = await analyticsService.getDashboardOverview();
    assert.ok(overview.kpis.totalCustomers >= 1000);
    assert.ok(overview.kpis.totalBalance > 0);
    assert.strictEqual(overview.riskDistribution.length, 4);
  });

  await t.test("ML Client Service returns structured risk predictions", async () => {
    const features = {
      currentBalance: 85000,
      transactionsPerMonth: 12,
      digitalUsagePercentage: 60,
      unresolvedComplaints: 0,
      numberOfProducts: 3,
      tenureMonths: 24,
      creditScore: 720
    };
    const pred = await mlClientService.predictChurn(features);
    assert.ok(pred.churnProbability >= 0 && pred.churnProbability <= 1);
    assert.ok(["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(pred.riskLevel));
    assert.ok(Array.isArray(pred.topRiskFactors));
  });

  await mongoose.disconnect();
});