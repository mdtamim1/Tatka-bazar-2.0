import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  className,
}) => {
  const decrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-0 border border-border bg-background", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={decrease}
        disabled={quantity <= min}
        className="h-10 w-10 rounded-none hover:bg-accent disabled:opacity-30 p-0"
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>
      <span className="w-10 text-center text-sm font-medium tabular-nums text-foreground select-none">
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={increase}
        disabled={quantity >= max}
        className="h-10 w-10 rounded-none hover:bg-accent disabled:opacity-30 p-0"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
