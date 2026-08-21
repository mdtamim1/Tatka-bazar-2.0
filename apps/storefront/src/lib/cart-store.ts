// =============================================================================
// Tatka Bazar — Zustand Cart & Wishlist Store (with Multi-Vendor Grouping)
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, WeightUnit } from "@/types";

export interface Coupon {
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  minOrder: number;
}

const VALID_COUPONS: Record<string, Coupon> = {
  WELCOME10: { code: "WELCOME10", discountPercent: 10, minOrder: 300 },
  TATKA50: { code: "TATKA50", fixedDiscount: 50, minOrder: 500 },
  FRESH100: { code: "FRESH100", fixedDiscount: 100, minOrder: 1000 },
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: Coupon | null;
  wishlistIds: string[];
  selectedHub: string;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setSelectedHub: (hub: string) => void;

  // Cart operations
  addItem: (product: Product, weight: number, unit: WeightUnit, unitPrice: number, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Computed helper values
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
  getVendorGroups: () => { vendorId: string; vendorNameBn: string; vendorNameEn: string; items: CartItem[] }[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      wishlistIds: ["prod-ilish-padma"],
      selectedHub: "dhaka-dhanmondi",

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setSelectedHub: (hub) => set({ selectedHub: hub }),

      addItem: (product, weight, unit, unitPrice, quantity = 1) => {
        set((state) => {
          const itemId = `${product.id}-${weight}-${unit}`;
          const existingIndex = state.items.findIndex((item) => item.id === itemId);

          let updatedItems: CartItem[];
          if (existingIndex > -1) {
            updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex]!;
            const newQty = existingItem.quantity + quantity;
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQty,
              totalPrice: newQty * existingItem.unitPrice,
            };
          } else {
            const newItem: CartItem = {
              id: itemId,
              productId: product.id,
              product,
              selectedWeight: weight,
              selectedUnit: unit,
              unitPrice,
              quantity,
              totalPrice: unitPrice * quantity,
              vendorId: product.vendorId || "tatka-official",
              vendorNameBn: product.vendorNameBn,
              vendorNameEn: product.vendorNameEn,
            };
            updatedItems = [newItem, ...state.items];
          }

          return { items: updatedItems, isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          const updatedItems = state.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                totalPrice: item.unitPrice * quantity,
              };
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        const coupon = VALID_COUPONS[cleanCode];
        if (!coupon) {
          return { success: false, message: "Invalid coupon code" };
        }
        const subtotal = get().getSubtotal();
        if (subtotal < coupon.minOrder) {
          return {
            success: false,
            message: `Minimum order amount ৳${coupon.minOrder} required for this coupon`,
          };
        }
        set({ appliedCoupon: coupon });
        return { success: true, message: "Coupon applied successfully!" };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          return {
            wishlistIds: exists
              ? state.wishlistIds.filter((id) => id !== productId)
              : [...state.wishlistIds, productId],
          };
        });
      },

      isInWishlist: (productId) => get().wishlistIds.includes(productId),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        if (coupon.fixedDiscount) return Math.min(coupon.fixedDiscount, subtotal);
        if (coupon.discountPercent) return Math.round((subtotal * coupon.discountPercent) / 100);
        return 0;
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        if (subtotal >= 999) return 0; // Free delivery over ৳999
        return 49; // Standard ৳49 delivery
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscountAmount();
        const delivery = get().getDeliveryFee();
        return Math.max(0, subtotal - discount + delivery);
      },

      getVendorGroups: () => {
        const items = get().items;
        const groupMap = new Map<string, { vendorId: string; vendorNameBn: string; vendorNameEn: string; items: CartItem[] }>();

        items.forEach((item) => {
          const vId = item.vendorId;
          if (!groupMap.has(vId)) {
            groupMap.set(vId, {
              vendorId: vId,
              vendorNameBn: item.vendorNameBn,
              vendorNameEn: item.vendorNameEn,
              items: [],
            });
          }
          groupMap.get(vId)!.items.push(item);
        });

        return Array.from(groupMap.values());
      },
    }),
    {
      name: "tatka_cart_store_v1",
      partialize: (state) => ({
        items: state.items,
        wishlistIds: state.wishlistIds,
        selectedHub: state.selectedHub,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
