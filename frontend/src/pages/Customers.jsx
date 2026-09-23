import React, { useState, useEffect, useCallback } from "react";
import { customerApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { CustomerTable } from "../components/customers/CustomerTable";
import { CustomerCard } from "../components/customers/CustomerCard";
import { Button } from "../components/ui/Button";
import { useDebounce } from "../hooks/useDebounce";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  RefreshCw
} from "lucide-react";

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const debouncedSearch = useDebounce(search, 300);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (risk !== "ALL") params.risk = risk;
      if (city !== "ALL") params.city = city;

      const res = await customerApi.getCustomers(params);
      setCustomers(res.data.customers || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, risk, city]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRiskFilter = (val) => {
    setRisk(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="CUSTOMER INTELLIGENCE"
        title="Institutional Customer Directory"
        subtitle="Explore retail and commercial account profiles, behavioral risk indicators, and predicted attrition scores."
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-subtle border border-border rounded p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-white"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchCustomers}
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-md p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by customer name or ID..."
            className="w-full bg-surface-subtle border border-border rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-muted-dark focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>RISK TIER:</span>
          </div>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRiskFilter(r)}
              className={`px-2 py-1 rounded text-[11px] font-medium border transition-all ${
                risk === r
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-subtle text-muted hover:text-white border-border"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {viewMode === "table" ? (
        <CustomerTable customers={customers} loading={loading} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <CustomerCard key={c.customerId} customer={c} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="bg-surface border border-border rounded-md px-4 py-3 flex items-center justify-between text-xs font-mono text-muted">
        <div>
          Showing page <span className="text-white font-bold">{pagination.page}</span> of{" "}
          <span className="text-white font-bold">{pagination.totalPages}</span> (
          {pagination.total} total accounts)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
