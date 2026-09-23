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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-all font-medium ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-subtle text-muted hover:text-white hover:bg-surface-hover border border-border"
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
          {activeTab === "models" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="Classifier Architecture" bodyClassName="p-4">
                  <div className="text-lg font-bold font-mono text-white">
                    {modelData?.modelType || "XGBoost Classifier"}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-1">
                    Version {modelData?.version || "2.4.1 (PROD)"}
                  </div>
                </Card>
                <Card title="Model ROC-AUC" bodyClassName="p-4">
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {(modelData?.metrics?.rocAuc || 0.894).toFixed(3)}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-1">
                    Holdout Evaluation
                  </div>
                </Card>
                <Card title="Calibrated F1 Score" bodyClassName="p-4">
                  <div className="text-2xl font-bold font-mono text-primary">
                    {(modelData?.metrics?.f1Score || 0.826).toFixed(3)}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-1">
                    Optimal Decision Threshold
                  </div>
                </Card>
                <Card title="Data Drift Metric" bodyClassName="p-4">
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {modelData?.metrics?.driftScore || "0.021"}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-1">
                    PSI Metric &lt; 0.10 (Stable)
                  </div>
                </Card>
              </div>

              <Card
                title="Model Hyperparameters & Training Provenance"
                subtitle="Configuration state of the production inference pipeline"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Max Depth:</span>
                    <span className="text-white font-bold">{modelData?.hyperparameters?.maxDepth || 6}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Learning Rate:</span>
                    <span className="text-white font-bold">{modelData?.hyperparameters?.learningRate || "0.05"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Estimators:</span>
                    <span className="text-white font-bold">{modelData?.hyperparameters?.nEstimators || 250}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Calibration:</span>
                    <span className="text-emerald-400 font-bold">Isotonic Calibrated</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

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
                      <label className="text-muted block text-[10px] uppercase mb-1">Full Name</label>
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
                      <label className="text-muted block text-[10px] uppercase mb-1">Email</label>
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
                      <label className="text-muted block text-[10px] uppercase mb-1">Initial Password</label>
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
                      <label className="text-muted block text-[10px] uppercase mb-1">Role Assignment</label>
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
                            <td className="font-mono text-muted text-xs">{u.email}</td>
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
                        <td colSpan={4} className="text-center py-6 text-muted font-mono">
                          No audit entries logged in current session
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-xs text-muted">
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
                  <UploadCloud className="w-10 h-10 text-muted mx-auto" />
                  <div className="text-sm font-semibold text-white font-mono">Select CSV File for Ingestion</div>
                  <p className="text-xs text-muted max-w-sm mx-auto font-sans">
                    Dataset must include customer demographics, balance, transaction counts, digital usage, and complaints.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="mt-2 text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
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
