import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { CustomerRiskBadge } from "../customers/CustomerRiskBadge";
import { formatCurrency } from "../../utils/formatters";
import { ShieldAlert, ArrowUpRight } from "lucide-react";

export const HighRiskCustomers = ({ watchlist = [] }) => {
  return (
    <Card
      title="High-Vulnerability Watchlist"
      subtitle="Top accounts flagged with critical attrition probability"
      action={
        <Link
          to="/customers?risk=HIGH"
          className="text-[11px] text-primary hover:text-white font-mono flex items-center gap-1 uppercase"
        >
          <span>Full Watchlist</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="bank-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Current Balance</th>
              <th>Risk Tier</th>
              <th>Grievances</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted font-mono">
                  No critical accounts in current watch window
                </td>
              </tr>
            ) : (
              watchlist.map((item) => (
                <tr key={item.customerId}>
                  <td className="font-mono font-bold text-neutral-300">
                    {item.customerId}
                  </td>
                  <td>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-[10px] text-muted font-mono">{item.city}</div>
                  </td>
                  <td className="font-mono font-semibold text-neutral-100">
                    {formatCurrency(item.currentBalance)}
                  </td>
                  <td>
                    <CustomerRiskBadge
                      level={item.predictedRiskLevel}
                      probability={item.predictedChurnProb}
                    />
                  </td>
                  <td className="font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (item.unresolvedComplaints || 0) > 0
                          ? "bg-red-950/60 text-red-400 border border-red-600/30"
                          : "text-muted"
                      }`}
                    >
                      {item.unresolvedComplaints || 0} Open
                    </span>
                  </td>
                  <td className="text-right font-mono">
                    <Link
                      to={`/customers/${item.customerId}`}
                      className="text-[11px] text-primary hover:text-white hover:underline font-semibold"
                    >
                      INVESTIGATE &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default HighRiskCustomers;
