import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { CustomerRiskBadge } from "./CustomerRiskBadge";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import { ChevronRight, CreditCard, Activity, Clock } from "lucide-react";

export const CustomerCard = ({ customer }) => {
  if (!customer) return null;

  return (
    <Card
      className="hover:border-primary/50 transition-all cursor-pointer group"
      bodyClassName="p-4"
    >
      <Link to={`/customers/${customer.customerId}`} className="block">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">
              {customer.name}
            </div>
            <div className="text-[11px] text-muted font-mono">
              {customer.customerId} &bull; {customer.city || "Urban"}
            </div>
          </div>
          <CustomerRiskBadge
            level={customer.predictedRiskLevel}
            probability={customer.predictedChurnProb}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80 text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted uppercase block">Balance</span>
            <span className="text-white font-bold">
              {formatCurrency(customer.currentBalance)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase block">Tenure</span>
            <span className="text-neutral-300">
              {customer.tenureMonths || 12} Months
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase block">Products</span>
            <span className="text-neutral-300">
              {customer.numberOfProducts || 1} Active
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase block">Engagement</span>
            <span className="text-neutral-300">
              {customer.engagementScore || 50}/100
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-primary font-medium">
          <span>View 360 Analysis</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </Card>
  );
};

export default CustomerCard;
