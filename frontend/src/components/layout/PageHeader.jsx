import React from "react";
import clsx from "clsx";

export const PageHeader = ({
  title,
  subtitle,
  action,
  className = ""
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40",
        className
      )}
    >
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-[13px] text-muted-foreground max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
};

export default PageHeader;
