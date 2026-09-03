"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";

export const CartIcon = () => {
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? items.reduce((acc, it) => acc + it.quantity, 0) : 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Shopping Bag"
      className="relative p-2.5 hover:bg-accent transition-colors duration-300 group rounded-none"
    >
      <ShoppingBag className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center pointer-events-none"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
