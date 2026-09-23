import React from "react";
import { Link } from "react-router-dom";
import { Table } from "../ui/Table";
import { CustomerRiskBadge } from "./CustomerRiskBadge";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import { ChevronRight } from "lucide-react";

export const CustomerTable = ({
  customers = [],
  loading = false,
  onSelectCustomer
}) => {
  const columns = [
    {
      key: "customerId",
      header: "Customer ID",
      render: (row) => (
        <span className="font-mono font-bold text-neutral-200">
          {row.customerId}
        </span>
      )
    },
    {
      key: "name",
      header: "Customer Name",
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.name}</div>
          <div className="text-[10px] text-muted font-mono">
            {row.age || 40} yrs &bull; {row.city || "Urban"}
          </div>
        </div>
      )
    },
    {
      key: "currentBalance",
      header: "Balance",
      render: (row) => (
        <span className="font-mono font-semibold text-neutral-100">
          {formatCurrency(row.currentBalance)}
        </span>
      )
    },
    {
      key: "tenureMonths",
      header: "Tenure",
      render: (row) => (
        <span className="font-mono text-muted">
          {row.tenureMonths || 12} mo
        </span>
      )
    },
    {
      key: "products",
      header: "Products",
      render: (row) => (
        <span className="font-mono text-neutral-300">
          {row.numberOfProducts || 1}
        </span>
      )
    },
    {
      key: "predictedRiskLevel",
      header: "Risk Tier",
      render: (row) => (
        <CustomerRiskBadge
          level={row.predictedRiskLevel}
          probability={row.predictedChurnProb}
        />
      )
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <Link
          to={`/customers/${row.customerId}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-white px-2 py-1 rounded bg-surface-subtle hover:bg-primary border border-border transition-colors font-mono uppercase"
        >
          <span>360 Profile</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={customers}
      keyField="customerId"
      loading={loading}
      emptyMessage="No customer records match the criteria"
    />
  );
};

export default CustomerTable;
