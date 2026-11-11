import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/60 shadow-sm",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/60 shadow-sm",
        secondary:
          "bg-surface-subtle text-neutral-200 hover:bg-surface-hover hover:text-white border border-border shadow-xs",
        destructive:
          "bg-rose-950/70 text-rose-300 hover:bg-rose-900/80 border border-rose-700/50 shadow-xs",
        outline:
          "border border-border bg-background/50 hover:bg-surface-hover text-neutral-200 hover:text-white",
        ghost:
          "hover:bg-surface-subtle text-neutral-300 hover:text-white border border-transparent",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default: "h-9 px-3.5 py-1.5 gap-2",
        sm: "min-h-[36px] sm:min-h-0 h-8 px-3 sm:px-2.5 text-[11px] gap-1.5",
        md: "h-9 px-3.5 py-1.5 gap-2",
        lg: "h-11 px-5 text-sm gap-2.5",
        icon: "h-9 w-9 min-h-[36px] sm:min-h-0 min-w-[36px] sm:min-w-0 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon: Icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <span
            className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : Icon ? (
          <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
