import React from "react";
import clsx from "clsx";

export const Card = ({
  children,
  className = "",
  title,
  subtitle,
  badge,
  action,
  headerClassName = "",
  bodyClassName = "",
  ...props
}) => {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-md shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || subtitle || badge || action) && (
        <div
          className={clsx(
            "px-4 py-3 border-b border-border flex items-center justify-between gap-3 bg-panel",
            headerClassName
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={clsx("p-4", bodyClassName)}>{children}</div>
    </div>
  );
};

export default Card;
