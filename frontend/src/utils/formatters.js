/**
 * Formatting utilities for Banking Risk & Churn Analytics
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return "0%";
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

export function getRiskVariant(level) {
  const norm = String(level || "").toUpperCase();
  switch (norm) {
    case "CRITICAL":
      return {
        bg: "bg-red-950/60",
        border: "border-red-600/40",
        text: "text-red-400",
        indicator: "bg-red-500",
        label: "CRITICAL"
      };
    case "HIGH":
      return {
        bg: "bg-orange-950/60",
        border: "border-orange-500/40",
        text: "text-orange-400",
        indicator: "bg-orange-500",
        label: "HIGH"
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-950/60",
        border: "border-amber-500/40",
        text: "text-amber-400",
        indicator: "bg-amber-400",
        label: "MEDIUM"
      };
    case "LOW":
    default:
      return {
        bg: "bg-emerald-950/60",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        indicator: "bg-emerald-500",
        label: "LOW"
      };
  }
}
