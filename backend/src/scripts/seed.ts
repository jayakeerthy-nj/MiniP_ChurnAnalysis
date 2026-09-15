import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Customer } from "../models/Customer.js";
import { Account } from "../models/Account.js";
import { Transaction } from "../models/Transaction.js";
import { Complaint } from "../models/Complaint.js";
import { DigitalInteraction } from "../models/DigitalInteraction.js";
import { CustomerFeatures } from "../models/CustomerFeatures.js";
import { Segment } from "../models/Segment.js";
import { ModelVersion } from "../models/ModelVersion.js";
import { AuditLog } from "../models/AuditLog.js";

const DATA_DIR = "/home/jayy/minip/data";
const ARTIFACTS_DIR = "/home/jayy/minip/ml-service/artifacts";

async function seedDatabase() {
  console.log("🌱 Starting database seeding process...");
  await connectDB();

  // Clear existing collections
  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Account.deleteMany({}),
    Transaction.deleteMany({}),
    Complaint.deleteMany({}),
    DigitalInteraction.deleteMany({}),
    CustomerFeatures.deleteMany({}),
    Segment.deleteMany({}),
    ModelVersion.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  // 1. Seed RBAC Users
  console.log("Seeding RBAC Users...");
  const salt = await bcrypt.genSalt(10);
  const users = [
    {
      userId: "USR-001",
      name: "Arjun Kapoor",
      email: "admin@bank.com",
      passwordHash: await bcrypt.hash("Admin@123", salt),
      role: "ADMIN"
    },
    {
      userId: "USR-002",
      name: "Neha Sen",
      email: "analyst@bank.com",
      passwordHash: await bcrypt.hash("Analyst@123", salt),
      role: "ANALYST"
    },
    {
      userId: "USR-003",
      name: "Vikram Malhotra",
      email: "manager@bank.com",
      passwordHash: await bcrypt.hash("Manager@123", salt),
      role: "MANAGER"
    }
  ];
  await User.insertMany(users);
  console.log(`✅ Seeded ${users.length} RBAC users`);

  // 2. Load and seed Customer records
  if (fs.existsSync(path.join(DATA_DIR, "customers.json"))) {
    const custData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "customers.json"), "utf8"));
    await Customer.insertMany(custData);
    console.log(`✅ Seeded ${custData.length} customers`);
  }

  // 3. Accounts
  if (fs.existsSync(path.join(DATA_DIR, "accounts.json"))) {
    const accData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "accounts.json"), "utf8"));
    await Account.insertMany(accData);
    console.log(`✅ Seeded ${accData.length} accounts`);
  }

  // 4. Complaints
  if (fs.existsSync(path.join(DATA_DIR, "complaints.json"))) {
    const compData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "complaints.json"), "utf8"));
    await Complaint.insertMany(compData);
    console.log(`✅ Seeded ${compData.length} complaints`);
  }

  // 5. Digital Interactions (batch insert)
  if (fs.existsSync(path.join(DATA_DIR, "digitalInteractions.json"))) {
    const digData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "digitalInteractions.json"), "utf8"));
    await DigitalInteraction.insertMany(digData);
    console.log(`✅ Seeded ${digData.length} digital interactions`);
  }

  // 6. Transactions (batch insert in chunks of 10,000)
  if (fs.existsSync(path.join(DATA_DIR, "transactions.json"))) {
    const txData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "transactions.json"), "utf8"));
    const chunkSize = 10000;
    for (let i = 0; i < txData.length; i += chunkSize) {
      await Transaction.insertMany(txData.slice(i, i + chunkSize));
    }
    console.log(`✅ Seeded ${txData.length} transactions`);
  }

  // 7. Customer Features
  if (fs.existsSync(path.join(DATA_DIR, "customerFeatures.json"))) {
    const featData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "customerFeatures.json"), "utf8"));
    await CustomerFeatures.insertMany(featData);
    console.log(`✅ Seeded ${featData.length} customer feature records`);
  }

  // 8. Segments
  if (fs.existsSync(path.join(ARTIFACTS_DIR, "segments.json"))) {
    const segData = JSON.parse(fs.readFileSync(path.join(ARTIFACTS_DIR, "segments.json"), "utf8"));
    await Segment.insertMany(segData);
    console.log(`✅ Seeded ${segData.length} customer segments`);
  }

  // 9. Model Version
  if (fs.existsSync(path.join(ARTIFACTS_DIR, "metrics.json"))) {
    const mData = JSON.parse(fs.readFileSync(path.join(ARTIFACTS_DIR, "metrics.json"), "utf8"));
    await ModelVersion.create({
      modelVersion: mData.modelVersion,
      currentModel: mData.currentModel,
      trainingTimestamp: new Date(mData.trainingTimestamp),
      datasetSize: mData.datasetSize,
      featuresCount: mData.featuresCount,
      evaluationMetrics: mData.evaluationMetrics,
      featureImportance: mData.featureImportance,
      silhouetteScore: mData.silhouetteScore
    });
    console.log(`✅ Seeded ModelVersion (${mData.modelVersion})`);
  }

  // 10. Audit logs
  await AuditLog.insertMany([
    {
      userId: "USR-001",
      userName: "Arjun Kapoor",
      role: "ADMIN",
      action: "MODEL_TRAINED",
      resource: "xgb-v1.4",
      timestamp: new Date(Date.now() - 3600000),
      success: true,
      metadata: { datasetSize: 1200, rocAuc: 0.9984 }
    },
    {
      userId: "USR-001",
      userName: "Arjun Kapoor",
      role: "ADMIN",
      action: "DATA_UPLOADED",
      resource: "seed_retail_portfolio.csv",
      timestamp: new Date(Date.now() - 7200000),
      success: true,
      metadata: { totalRecords: 1200 }
    }
  ]);
  console.log("✅ Seeded initial audit logs");

  console.log("🎉 Seeding completed successfully!");
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
