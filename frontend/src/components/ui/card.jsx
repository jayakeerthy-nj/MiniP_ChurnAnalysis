import * as React from "react";
import clsx from "clsx";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(
  (
    {
      className,
      children,
      title,
      subtitle,
      badge,
      action,
      headerClassName = "",
      bodyClassName = "",
      ...props
    },
    ref
  ) => {
    const hasStructuredHeader = Boolean(title || subtitle || badge || action);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-colors",
          className
        )}
        {...props}
      >
        {hasStructuredHeader && (
          <div
            className={clsx(
              "px-5 py-3.5 border-b border-border flex items-center justify-between gap-3 bg-panel/70",
              headerClassName
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                {title && (
                  <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wider font-mono">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5 font-sans leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        <div className={clsx(hasStructuredHeader ? (bodyClassName || "p-5") : "")}>
          {children}
        </div>
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-border/40", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-neutral-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t border-border/40 mt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;
