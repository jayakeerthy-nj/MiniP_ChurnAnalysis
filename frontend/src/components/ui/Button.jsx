import React from "react";
import clsx from "clsx";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-white border border-primary/80 shadow-sm",
    secondary:
      "bg-surface-subtle hover:bg-surface-hover text-neutral-200 border border-border hover:border-border-light",
    destructive:
      "bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-700/50 hover:border-red-600",
    ghost:
      "bg-transparent hover:bg-surface-subtle text-neutral-300 hover:text-white border border-transparent",
    outline:
      "bg-transparent hover:bg-surface-subtle text-primary border border-primary/40 hover:border-primary"
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-xs px-3.5 py-2 gap-2",
    lg: "text-sm px-4 py-2.5 gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
