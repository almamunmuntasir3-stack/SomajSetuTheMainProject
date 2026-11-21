import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary",
        secondary: "bg-surface-muted text-foreground",
        navy: "bg-navy-900 text-white dark:bg-brand-400 dark:text-navy-950",
        outline: "border border-line bg-surface-raised/90 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

const BadgeComponent = React.forwardRef(Badge);
BadgeComponent.displayName = "Badge";

export { BadgeComponent as Badge, badgeVariants };
