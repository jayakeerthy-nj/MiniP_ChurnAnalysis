import React from "react";
import clsx from "clsx";

export const PageHeader = ({
  title,
  subtitle,
  category = "BANKING RISK INTELLIGENCE",
  action,
  className = ""
}) => {
  return (
    <div
      className={clsx(
        "p-5 bg-surface border border-border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm",
        className
      )}
    >
      <div>
        <span className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase block mb-1">
          {category}
        </span>
        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default PageHeader;
