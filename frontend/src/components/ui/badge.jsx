import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-mono font-semibold uppercase tracking-wider transition-colors select-none border rounded-md",
  {
    variants: {
      variant: {
        default:
          "border-blue-600/40 bg-blue-950/50 text-blue-300 shadow-xs",
        primary:
          "border-blue-600/40 bg-blue-950/50 text-blue-300 shadow-xs",
        secondary:
          "border-border bg-surface-subtle text-zinc-300",
        neutral:
          "border-border bg-surface-subtle text-zinc-300",
        destructive:
          "border-red-600/50 bg-red-950/60 text-red-300 shadow-xs",
        critical:
          "border-red-600/50 bg-red-950/60 text-red-300 shadow-xs",
        warning:
          "border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-xs",
        safe:
          "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-xs",
        outline:
          "border-border text-foreground bg-transparent",
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5 gap-1",
        sm: "text-[11px] px-2 py-0.5 gap-1.5",
        md: "text-xs px-2.5 py-1 gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

const indicatorDotStyles = {
  default: "bg-blue-400",
  primary: "bg-blue-400",
  secondary: "bg-zinc-400",
  neutral: "bg-zinc-400",
  destructive: "bg-red-400 animate-pulse",
  critical: "bg-red-400 animate-pulse",
  warning: "bg-amber-400",
  safe: "bg-emerald-400",
  outline: "bg-zinc-400",
};

function Badge({
  className,
  variant = "default",
  size = "sm",
  indicator = false,
  children,
  ...props
}) {
  const normVariant = variant || "default";
  const dotColor = indicatorDotStyles[normVariant] || "bg-current";

  return (
    <span
      className={cn(badgeVariants({ variant: normVariant, size }), className)}
      {...props}
    >
      {indicator && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export default Badge;
