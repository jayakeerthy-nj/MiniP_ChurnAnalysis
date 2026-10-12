import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";
import { ArrowRight, ExternalLink } from "lucide-react";

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&q=80"
];

export const HighRiskCustomers = ({ watchlist = [] }) => {
  return (
    <div className="rounded-[16px] bg-card p-5 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[16px] font-semibold text-foreground tracking-[-0.01em]">
            High-Vulnerability Watchlist
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Top accounts flagged with critical attrition probability for priority outreach
          </p>
        </div>
        <Link
          to="/customers?risk=HIGH"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:text-white transition-colors"
        >
          <span>Full Watchlist</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2.5 font-medium">Customer</th>
              <th className="pb-2.5 font-medium">Account ID</th>
              <th className="pb-2.5 font-medium">Current Balance</th>
              <th className="pb-2.5 font-medium">Risk Tier</th>
              <th className="pb-2.5 font-medium">Complaints</th>
              <th className="pb-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {watchlist.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono">
                  No critical accounts in current watch window
                </td>
              </tr>
            ) : (
              watchlist.map((item, idx) => {
                const avatarUrl = AVATARS[idx % AVATARS.length];
                return (
                  <tr key={item.customerId || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={avatarUrl}
                          alt={item.name || "Customer"}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-border shrink-0 grayscale opacity-90"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{item.city || "Metropolitan"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">
                      {item.customerId}
                    </td>
                    <td className="py-2.5 pr-3 font-mono font-medium text-foreground">
                      {formatCurrency(item.currentBalance || 0)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-muted ring-1 ring-border text-foreground">
                        Critical ({item.predictedChurnProb ? `${Math.round(item.predictedChurnProb * 100)}%` : "100%"})
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground bg-muted/40 ring-1 ring-border/50">
                        {item.unresolvedComplaints || 0} Open
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <Link
                        to={`/customers/${item.customerId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:text-white transition-colors"
                      >
                        <span>INVESTIGATE</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-3 mt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          BankShield-Hybrid real-time scoring (XGBoost + CatBoost + LightGBM).
        </span>
        <span className="font-mono">
          Model v2.4
        </span>
      </div>
    </div>
  );
};

export default HighRiskCustomers;
