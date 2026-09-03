import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        dark: "bg-foreground text-background",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground bg-background/80 backdrop-blur-sm",
        terracotta: "bg-terracotta text-white",
        linen: "bg-muted text-foreground border border-border/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
