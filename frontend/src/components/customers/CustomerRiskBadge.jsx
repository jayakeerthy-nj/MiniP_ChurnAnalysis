import React from "react";
import { Badge } from "../ui/Badge";
import { getRiskVariant } from "../../utils/formatters";

export const CustomerRiskBadge = ({ level, probability, size = "sm" }) => {
  const variant = getRiskVariant(level);

  const badgeVariant =
    variant.label === "CRITICAL"
      ? "critical"
      : variant.label === "HIGH"
      ? "warning"
      : variant.label === "MEDIUM"
      ? "warning"
      : "safe";

  return (
    <Badge variant={badgeVariant} size={size} indicator>
      <span>{variant.label}</span>
      {probability !== undefined && (
        <span className="opacity-80">({(probability * 100).toFixed(0)}%)</span>
      )}
    </Badge>
  );
};

export default CustomerRiskBadge;
