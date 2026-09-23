import React from "react";
import clsx from "clsx";

export const Badge = ({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  indicator = false
}) => {
  const variants = {
    neutral: "bg-surface-subtle text-muted border-border",
    primary: "bg-blue-950/60 text-blue-400 border-blue-600/40",
    safe: "bg-emerald-950/60 text-emerald-400 border-emerald-600/40",
    warning: "bg-amber-950/60 text-amber-400 border-amber-600/40",
    critical: "bg-red-950/60 text-red-400 border-red-600/40"
  };

  const indicatorColors = {
    neutral: "bg-muted",
    primary: "bg-blue-400",
    safe: "bg-emerald-400",
    warning: "bg-amber-400",
    critical: "bg-red-400"
  };

  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5 font-mono",
    sm: "text-[11px] px-2 py-0.5 font-mono",
    md: "text-xs px-2.5 py-1 font-mono"
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium border rounded-[3px] uppercase tracking-wider select-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {indicator && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full shrink-0",
            indicatorColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
