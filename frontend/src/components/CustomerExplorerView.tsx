"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, ShieldAlert, Zap } from "lucide-react";

export const CustomerExplorerView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const { setSelectedCustomerId } = useAuthStore();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (risk !== "ALL") params.risk = risk;
      if (city !== "ALL") params.city = city;

      const res = await api.get("/customers", { params });
      setCustomers(res.data.customers || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, risk, city, page]);

  return (
    <div className="space-y-5">
      {/* Header Strip with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-borderMuted">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by customer ID, name, or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-app border border-borderMuted rounded-lg text-white font-sans text-sm focus:outline-none focus:border-cyanMain transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted">Risk Tier:</span>
            <select
              value={risk}
              onChange={(e) => { setRisk(e.target.value); setPage(1); }}
              className="bg-app border border-borderMuted text-white text-xs rounded-md px-2.5 py-1.5 focus:border-cyanMain"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical (&gt;80%)</option>
              <option value="HIGH">High (60-80%)</option>
              <option value="MEDIUM">Medium (30-60%)</option>
              <option value="LOW">Low (&lt;30%)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted">City:</span>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="bg-app border border-borderMuted text-white text-xs rounded-md px-2.5 py-1.5 focus:border-cyanMain"
            >
              <option value="ALL">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Explorer Table */}
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <span className="panel-tag">CUSTOMER 360 INTELLIGENCE</span>
            <h3 className="panel-title-sm">
              Portfolio Accounts ({pagination.total.toLocaleString()} Total)
            </h3>
          </div>
          <span className="text-xs font-mono text-muted">Page {pagination.page} of {pagination.totalPages}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-cyanMain font-mono animate-pulse">
            <Zap className="inline animate-spin mr-2" size={16} /> Fetching live portfolio records...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-muted">
            No customers match the active search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dark-table w-full">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>LOCATION</th>
                  <th>BALANCE</th>
                  <th>PRODUCTS</th>
                  <th>TX / MO</th>
                  <th>ENGAGEMENT</th>
                  <th>PREDICTED CHURN</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-subtle transition-colors">
                    <td>
                      <button
                        onClick={() => setSelectedCustomerId(c.customerId)}
                        className="text-left group"
                      >
                        <strong className="text-white group-hover:text-cyanBright block">{c.name}</strong>
                        <span className="sub-id font-mono text-[11px] text-muted">{c.customerId}</span>
                      </button>
                    </td>
                    <td><span className="tag-pill tag-neutral">{c.city}</span></td>
                    <td className="font-mono text-cyanBright">₹{Number(c.currentBalance || 0).toLocaleString()}</td>
                    <td className="font-mono">{c.numberOfProducts}</td>
                    <td className="font-mono">{c.transactionsPerMonth}</td>
                    <td>
                      <span className={`tag-pill ${
                        c.engagementScore >= 70 ? "tag-green" : c.engagementScore >= 45 ? "tag-yellow" : "tag-red"
                      }`}>
                        {c.engagementScore}/100 &bull; {c.engagementCategory}
                      </span>
                    </td>
                    <td>
                      <span className={`tag-pill ${
                        c.predictedRiskLevel === "CRITICAL"
                          ? "tag-red"
                          : c.predictedRiskLevel === "HIGH"
                          ? "tag-red"
                          : c.predictedRiskLevel === "MEDIUM"
                          ? "tag-yellow"
                          : "tag-green"
                      }`}>
                        {Math.round((c.predictedChurnProb || 0) * 100)}% {c.predictedRiskLevel}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedCustomerId(c.customerId)}
                        className="btn-table-action flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Inspect 360</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination Strip */}
        <div className="flex items-center justify-between p-4 border-t border-borderMuted">
          <span className="text-xs text-muted">
            Showing {(page - 1) * 12 + 1} - {Math.min(page * 12, pagination.total)} of {pagination.total} records
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-subtle text-xs rounded border border-borderMuted disabled:opacity-30 flex items-center gap-1 text-white hover:border-cyanMain"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-subtle text-xs rounded border border-borderMuted disabled:opacity-30 flex items-center gap-1 text-white hover:border-cyanMain"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};