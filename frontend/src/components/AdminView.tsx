"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ShieldCheck, Cpu, UploadCloud, Users, History, CheckCircle, AlertTriangle } from "lucide-react";

export const AdminView: React.FC = () => {
  const [tab, setTab] = useState<"models" | "upload" | "users" | "audit">("models");
  const [modelData, setModelData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "ANALYST" });
  const [userCreatedMsg, setUserCreatedMsg] = useState("");

  // Upload simulation state
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "models") {
        const res = await api.get("/admin/models");
        setModelData(res.data.currentModel);
      } else if (tab === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data.users || []);
      } else if (tab === "audit") {
        const res = await api.get("/admin/audit");
        setAuditLogs(res.data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/users", newUser);
      setUserCreatedMsg(`User ${newUser.name} created successfully!`);
      setNewUser({ name: "", email: "", password: "", role: "ANALYST" });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleUploadSimulation = async () => {
    try {
      setUploading(true);
      const res = await api.post("/admin/upload-dataset");
      setUploadResult(res.data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain flex items-center justify-between">
        <div>
          <span className="panel-tag">ADMINISTRATIVE AUDIT & GOVERNANCE</span>
          <h2 className="text-xl font-bold text-white">Bank Model & Security Control Console</h2>
          <p className="text-xs text-muted mt-1">
            Restricted to ADMIN personnel &bull; Oversee ML pipelines, data ingestion integrity, user roles, and compliance logs.
          </p>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex gap-2 border-b border-borderMuted pb-2">
        {[
          { id: "models", label: "Model Governance & Metrics", icon: Cpu },
          { id: "upload", label: "Dataset Ingestion Pipeline", icon: UploadCloud },
          { id: "users", label: "Access & User RBAC", icon: Users },
          { id: "audit", label: "Compliance Audit Trail", icon: History },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                tab === t.id ? "bg-cyanMain text-black font-semibold" : "text-muted hover:text-white bg-subtle"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Model Monitoring Tab */}
      {tab === "models" && (
        <div className="space-y-5">
          <div className="panel-card">
            <div className="panel-head">
              <div>
                <span className="panel-tag">PRODUCTION ARTIFACT EVALUATION</span>
                <h3 className="panel-title-sm">Multi-Model Benchmarking (Stratified Holdout)</h3>
              </div>
              <span className="tag-pill tag-cyan font-mono">XGBoost Active</span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="dark-table w-full">
                <thead>
                  <tr>
                    <th>ALGORITHM / MODEL</th>
                    <th>ROC-AUC</th>
                    <th>PR-AUC</th>
                    <th>F1 SCORE</th>
                    <th>RECALL</th>
                    <th>PRECISION</th>
                    <th>ACCURACY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {modelData?.evaluationMetrics && Object.entries(modelData.evaluationMetrics).map(([name, m]: [string, any]) => (
                    <tr key={name} className="hover:bg-subtle transition-colors">
                      <td className="font-bold text-white">{name}</td>
                      <td className="font-mono text-cyanBright font-bold">{m.rocAuc}</td>
                      <td className="font-mono text-white">{m.prAuc}</td>
                      <td className="font-mono text-white">{m.f1}</td>
                      <td className="font-mono text-white">{m.recall}</td>
                      <td className="font-mono text-white">{m.precision}</td>
                      <td className="font-mono text-white">{m.accuracy}</td>
                      <td>
                        <span className={`tag-pill ${name === "XGBoost" ? "tag-cyan" : "tag-neutral"}`}>
                          {name === "XGBoost" ? "Active (Champion)" : "Challenger"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel-card">
              <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Top SHAP Global Predictors</h4>
              <div className="space-y-2">
                {modelData?.featureImportance?.map((f: any) => (
                  <div key={f.feature} className="flex justify-between text-xs p-2 bg-subtle rounded border border-borderMuted">
                    <span className="text-white">{f.feature}</span>
                    <span className="font-mono text-cyanMain font-bold">SHAP: {f.importance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card">
              <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Model Provenance & Specs</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-borderMuted">
                  <span className="text-muted">Model ID:</span>
                  <span className="font-mono text-white font-bold">{modelData?.modelVersion || "xgb-v1.4"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderMuted">
                  <span className="text-muted">Algorithm:</span>
                  <span className="font-mono text-white">{modelData?.currentModel || "XGBoost Classifier"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderMuted">
                  <span className="text-muted">Training Size:</span>
                  <span className="font-mono text-white">{modelData?.datasetSize || 1200} Customer Vectors</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderMuted">
                  <span className="text-muted">K-Means Silhouette Score:</span>
                  <span className="font-mono text-cyanMain">{modelData?.silhouetteScore || 0.1997}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dataset Ingestion Tab */}
      {tab === "upload" && (
        <div className="panel-card space-y-5">
          <div className="panel-head">
            <div>
              <span className="panel-tag">ENTERPRISE ETL PIPELINE</span>
              <h3 className="panel-title-sm">CSV Dataset Ingestion & Validation Engine</h3>
            </div>
          </div>

          <div className="p-8 border-2 border-dashed border-borderMuted rounded-xl text-center bg-app hover:border-cyanMain/50 transition-all">
            <UploadCloud size={36} className="mx-auto text-cyanMain mb-3 opacity-80" />
            <p className="text-sm font-semibold text-white">Upload New Customer Transactions or Profile Batch</p>
            <p className="text-xs text-muted mt-1">Accepts UTF-8 encoded .CSV files with schema verification and strict type checks</p>
            <button
              onClick={handleUploadSimulation}
              disabled={uploading}
              className="btn-cyan-sm mt-4 inline-flex items-center gap-2"
            >
              <UploadCloud size={14} />
              <span>{uploading ? "Executing Pipeline..." : "Trigger Test Dataset Upload (150 Records)"}</span>
            </button>
          </div>

          {uploadResult && (
            <div className="space-y-4 pt-4 border-t border-borderMuted">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ingestion Validation Report</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-subtle rounded border border-borderMuted text-center">
                  <span className="text-xs text-muted block">Records Received</span>
                  <span className="text-xl font-mono text-white font-bold">{uploadResult.recordsReceived}</span>
                </div>
                <div className="p-3 bg-subtle rounded border border-borderMuted text-center">
                  <span className="text-xs text-muted block">Records Accepted</span>
                  <span className="text-xl font-mono text-safe font-bold">{uploadResult.recordsAccepted}</span>
                </div>
                <div className="p-3 bg-subtle rounded border border-borderMuted text-center">
                  <span className="text-xs text-muted block">Records Rejected</span>
                  <span className="text-xl font-mono text-critical font-bold">{uploadResult.recordsRejected}</span>
                </div>
                <div className="p-3 bg-subtle rounded border border-borderMuted text-center">
                  <span className="text-xs text-muted block">Duplicates Identified</span>
                  <span className="text-xl font-mono text-warning font-bold">{uploadResult.duplicatesDetected}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-critical font-semibold block mb-1.5">Detected Validation Exceptions (Logged to Audit):</span>
                <div className="space-y-1.5">
                  {uploadResult.validationErrors?.map((err: any, idx: number) => (
                    <div key={idx} className="text-xs p-2 bg-app rounded border border-critical/30 text-white flex justify-between font-mono">
                      <span>Row {err.row}: [{err.column}] &bull; {err.error}</span>
                      <span className="text-critical uppercase text-[10px]">REJECTED</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. User Management Tab */}
      {tab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 panel-card">
            <h3 className="text-sm font-bold text-white mb-3">Provision New System User</h3>
            {userCreatedMsg && <div className="p-2 bg-safe/10 text-safe text-xs rounded mb-3">{userCreatedMsg}</div>}
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-app border border-borderMuted rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-app border border-borderMuted rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-1.5 bg-app border border-borderMuted rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Authorization Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-1.5 bg-app border border-borderMuted rounded text-white text-xs"
                >
                  <option value="ANALYST">ANALYST (Standard Customer 360 & Segments)</option>
                  <option value="MANAGER">MANAGER (Executive Dashboards & Recommendations)</option>
                  <option value="ADMIN">ADMIN (Full Governance, Ingestion & Models)</option>
                </select>
              </div>
              <button type="submit" className="btn-cyan-action w-full justify-center">
                Provision User
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 panel-card">
            <h3 className="text-sm font-bold text-white mb-3">Active System Operators</h3>
            <div className="overflow-x-auto">
              <table className="dark-table w-full">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>CREATED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId}>
                      <td className="font-bold text-white">{u.name}</td>
                      <td className="font-mono text-muted text-xs">{u.email}</td>
                      <td>
                        <span className={`tag-pill ${u.role === "ADMIN" ? "tag-red" : u.role === "MANAGER" ? "tag-cyan" : "tag-neutral"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Audit Trail Tab */}
      {tab === "audit" && (
        <div className="panel-card">
          <div className="panel-head">
            <div>
              <span className="panel-tag">SECURITY & COMPLIANCE LOGS</span>
              <h3 className="panel-title-sm">Immutable System Event Records</h3>
            </div>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="dark-table w-full">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>OPERATOR</th>
                  <th>ROLE</th>
                  <th>ACTION</th>
                  <th>TARGET RESOURCE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="font-mono text-xs text-muted">
                      {new Date(log.timestamp).toLocaleTimeString()} &bull; {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="font-semibold text-white">{log.userName}</td>
                    <td><span className="tag-pill tag-neutral text-[10px]">{log.role}</span></td>
                    <td className="font-mono text-cyanMain text-xs">{log.action}</td>
                    <td className="font-mono text-xs text-muted">{log.resource || "-"}</td>
                    <td>
                      <span className={`tag-pill ${log.success ? "tag-green" : "tag-red"}`}>
                        {log.success ? "SUCCESS" : "FAILED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};