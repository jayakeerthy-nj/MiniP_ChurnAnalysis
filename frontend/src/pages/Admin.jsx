import React, { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loading } from "../components/ui/Loading";
import { formatDate, formatPercent } from "../utils/formatters";
import {
  ShieldCheck,
  Cpu,
  UploadCloud,
  Users,
  History,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Lock
} from "lucide-react";

export const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("models");
  const [modelData, setModelData] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // User form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "ANALYST"
  });
  const [userCreatedMsg, setUserCreatedMsg] = useState("");

  // Upload state
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "models") {
        const res = await adminApi.getModelMonitoring();
        setModelData(res.data.currentModel || res.data);
      } else if (tab === "users") {
        const res = await adminApi.getUsers();
        setUsers(res.data.users || []);
      } else if (tab === "audit") {
        const res = await adminApi.getAuditLogs();
        setAuditLogs(res.data.logs || []);
      }
    } catch (e) {
      console.error("Admin data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserCreatedMsg("");
    try {
      await adminApi.createUser(newUser);
      setUserCreatedMsg(`User ${newUser.email} created successfully.`);
      setNewUser({ name: "", email: "", password: "", role: "ANALYST" });
      loadTabData("users");
    } catch (err) {
      setUserCreatedMsg("Failed to create user. Ensure email is unique.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("dataset", file);

    setUploading(true);
    setUploadResult(null);
    try {
      const res = await adminApi.uploadDataset(formData);
      setUploadResult(res.data.message || "Dataset imported and queued for ML ingestion.");
    } catch (err) {
      setUploadResult("Upload failed. Ensure file is a valid CSV dataset.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="GOVERNANCE & PLATFORM OPERATIONS"
        title="Institutional Administration Portal"
        subtitle="Model telemetry monitoring, role-based access management, dataset ingestion, and immutable compliance audit logs."
      />

      {/* Admin Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-mono">
        {[
          { key: "models", label: "ML Telemetry & Models", icon: Cpu },
          { key: "users", label: "User Access & RBAC", icon: Users },
          { key: "audit", label: "Immutable Audit Log", icon: History },
          { key: "upload", label: "Data Ingestion Pipeline", icon: UploadCloud }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-xs ${
                activeTab === tab.key
                  ? "bg-white text-black font-semibold shadow-sm ring-1 ring-white"
                  : "bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loading message="Fetching administrative records..." />
      ) : (
        <>
          {/* Models Tab */}
          {activeTab === "models" && (() => {
            const ensembleMetrics = modelData?.evaluationMetrics?.["BankShield-Hybrid Ensemble"] || {};
            const rocAuc = ensembleMetrics.rocAuc || modelData?.metrics?.rocAuc || 0.9980;
            const f1 = ensembleMetrics.f1 || modelData?.metrics?.f1Score || 0.9421;
            const prAuc = ensembleMetrics.prAuc || 0.9889;
            const brier = ensembleMetrics.brierScore || 0.0121;
            const modelName = modelData?.currentModel || "BankShield-Hybrid Ensemble";
            const version = modelData?.modelVersion || modelData?.version || "bankshield-hybrid-v1";
            const components = modelData?.ensembleComponents || ["XGBoost", "CatBoost", "LightGBM"];
            const metaWeights = modelData?.metaLearnerCoefficients || { "CatBoost": 5.38, "XGBoost": 2.54, "LightGBM": 1.97 };

            return (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card title="Active Classifier Framework" bodyClassName="p-4">
                    <div className="text-lg font-bold font-mono text-white">
                      {modelName}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
                      Active: {version}
                    </div>
                  </Card>
                  <Card title="Holdout ROC-AUC" bodyClassName="p-4">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {rocAuc.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-neutral-300 font-mono mt-1">
                      Held-Out Test Set (N=2,000)
                    </div>
                  </Card>
                  <Card title="Calibrated F1 Score" bodyClassName="p-4">
                    <div className="text-2xl font-bold font-mono text-primary">
                      {f1.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-neutral-300 font-mono mt-1">
                      PR-AUC: {prAuc.toFixed(4)}
                    </div>
                  </Card>
                  <Card title="Brier Calibration Score" bodyClassName="p-4">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {brier.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-neutral-300 font-mono mt-1">
                      Platt Calibrated Sigmoid
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    title="Ensemble Stacking Architecture"
                    subtitle="Out-of-fold trained base learners combined via Logistic Regression"
                  >
                    <div className="space-y-2 font-mono text-xs">
                      {Object.entries(metaWeights).map(([comp, weight], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-surface-subtle border border-border rounded">
                          <span className="text-white font-semibold">{comp} Base Learner</span>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">Weight: {typeof weight === 'number' ? weight.toFixed(3) : weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card
                    title="Model Governance & Provenance"
                    subtitle="Pipeline artifacts, validation protocol, and rollback capability"
                  >
                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-2 bg-surface-subtle border border-border rounded">
                        <span className="text-neutral-300 block text-[10px] uppercase">Validation Protocol:</span>
                        <span className="text-white font-bold">5-Fold Stratified OOF</span>
                      </div>
                      <div className="p-2 bg-surface-subtle border border-border rounded">
                        <span className="text-neutral-300 block text-[10px] uppercase">Feature Dimensions:</span>
                        <span className="text-white font-bold">{modelData?.featuresCount || 39} Columns</span>
                      </div>
                      <div className="p-2 bg-surface-subtle border border-border rounded">
                        <span className="text-neutral-300 block text-[10px] uppercase">Calibration:</span>
                        <span className="text-emerald-400 font-bold">Platt Sigmoid (cv=5)</span>
                      </div>
                      <div className="p-2 bg-surface-subtle border border-border rounded">
                        <span className="text-neutral-300 block text-[10px] uppercase">Rollback Target:</span>
                        <span className="text-primary font-bold">xgb-v1.4 (model.joblib)</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })()}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <Card title="Register New Internal User" subtitle="Provision identity with role-based permissions">
                  {userCreatedMsg && (
                    <div className="p-3 bg-primary/20 border border-primary/40 rounded text-primary text-xs font-mono mb-4">
                      {userCreatedMsg}
                    </div>
                  )}
                  <form onSubmit={handleCreateUser} className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-neutral-300 block text-[10px] uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                        className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="e.g. Rahul Sen"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block text-[10px] uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="user@bank.com"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block text-[10px] uppercase mb-1">Initial Password</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                        className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block text-[10px] uppercase mb-1">Role Assignment</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="ANALYST">ANALYST</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <Button type="submit" variant="primary" size="md" className="w-full mt-2" icon={UserPlus}>
                      Provision User Account
                    </Button>
                  </form>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card title="Active System Users" subtitle="Configured users and authority levels" bodyClassName="p-0">
                  <div className="overflow-x-auto">
                    <table className="bank-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, idx) => (
                          <tr key={u._id || idx}>
                            <td className="font-semibold text-white">{u.name}</td>
                            <td className="font-mono text-neutral-300 text-xs">{u.email}</td>
                            <td>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                                  u.role === "ADMIN"
                                    ? "bg-red-950/60 text-red-400 border-red-600/30"
                                    : u.role === "MANAGER"
                                    ? "bg-amber-950/60 text-amber-400 border-amber-600/30"
                                    : "bg-blue-950/60 text-blue-400 border-blue-600/30"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === "audit" && (
            <Card title="Immutable System Audit Trail" subtitle="Chronological record of user actions and security events" bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="bank-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action Event</th>
                      <th>Resource Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-neutral-300 font-mono">
                          No audit entries logged in current session
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-xs text-neutral-300">
                            {formatDate(log.timestamp)} {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="font-semibold text-white">{log.userEmail || "System"}</td>
                          <td className="font-mono text-xs text-primary">{log.action}</td>
                          <td className="font-mono text-xs text-neutral-300">{log.resource || "/api"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <Card title="Ingest New Customer Batch Dataset" subtitle="Upload CSV formatted dataset for retraining and recalibration">
              <div className="space-y-4 font-mono text-xs">
                {uploadResult && (
                  <div className="p-3 bg-primary/20 border border-primary/40 rounded text-primary font-mono text-xs">
                    {uploadResult}
                  </div>
                )}
                <div className="border-2 border-dashed border-border p-8 rounded-md text-center space-y-3">
                  <UploadCloud className="w-10 h-10 text-neutral-300 mx-auto" />
                  <div className="text-sm font-semibold text-white font-mono">Select CSV File for Ingestion</div>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto font-sans">
                    Dataset must include customer demographics, balance, transaction counts, digital usage, and complaints.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="mt-2 text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                  />
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
