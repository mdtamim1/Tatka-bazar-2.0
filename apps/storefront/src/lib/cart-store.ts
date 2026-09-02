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
  isWishlistOpen: boolean;
  appliedCoupon: Coupon | null;
  wishlistIds: string[];
  selectedHub: string;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
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
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  moveWishlistToCart: (product: Product, openCartDrawer?: boolean) => void;
  moveAllWishlistToCart: (products: Product[]) => void;

  // Computed helper values
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
  getVendorGroups: () => { vendorId: string; vendorNameBn: string; vendorNameEn: string; items: CartItem[] }[];
  submitOrder: (orderPayload: any) => Promise<{ success: boolean; orderNumber: string }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isWishlistOpen: false,
      appliedCoupon: null,
      wishlistIds: ["prod-ilish-padma", "prod-beef-sirloin", "prod-honey-sundarban"],
      selectedHub: "dhaka-dhanmondi",

      openCart: () => set({ isOpen: true, isWishlistOpen: false }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen, isWishlistOpen: false })),

      openWishlist: () => set({ isWishlistOpen: true, isOpen: false }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlistDrawer: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen, isOpen: false })),

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

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlistIds: state.wishlistIds.filter((id) => id !== productId),
        }));
      },

      clearWishlist: () => {
        set({ wishlistIds: [] });
      },

      isInWishlist: (productId) => get().wishlistIds.includes(productId),

      moveWishlistToCart: (product, openCartDrawer = false) => {
        const defaultWeight = product.weightOptions?.[0]?.value || 1;
        const defaultUnit = product.baseUnit || "kg";
        const unitPrice = product.basePrice;
        const itemId = `${product.id}-${defaultWeight}-${defaultUnit}`;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === itemId);
          let updatedItems: CartItem[];
          if (existingIndex > -1) {
            updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex]!;
            const newQty = existingItem.quantity + 1;
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
              selectedWeight: defaultWeight,
              selectedUnit: defaultUnit,
              unitPrice,
              quantity: 1,
              totalPrice: unitPrice,
              vendorId: product.vendorId || "tatka-official",
              vendorNameBn: product.vendorNameBn,
              vendorNameEn: product.vendorNameEn,
            };
            updatedItems = [newItem, ...state.items];
          }

          return {
            items: updatedItems,
            wishlistIds: state.wishlistIds.filter((id) => id !== product.id),
            ...(openCartDrawer ? { isOpen: true, isWishlistOpen: false } : {}),
          };
        });
      },

      moveAllWishlistToCart: (products) => {
        set((state) => {
          let updatedItems = [...state.items];
          const addedProductIds = new Set<string>();

          products.forEach((product) => {
            if (product.stock > 0) {
              const defaultWeight = product.weightOptions?.[0]?.value || 1;
              const defaultUnit = product.baseUnit || "kg";
              const unitPrice = product.basePrice;
              const itemId = `${product.id}-${defaultWeight}-${defaultUnit}`;

              const existingIndex = updatedItems.findIndex((item) => item.id === itemId);
              if (existingIndex > -1) {
                const existingItem = updatedItems[existingIndex]!;
                const newQty = existingItem.quantity + 1;
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
                  selectedWeight: defaultWeight,
                  selectedUnit: defaultUnit,
                  unitPrice,
                  quantity: 1,
                  totalPrice: unitPrice,
                  vendorId: product.vendorId || "tatka-official",
                  vendorNameBn: product.vendorNameBn,
                  vendorNameEn: product.vendorNameEn,
                };
                updatedItems = [newItem, ...updatedItems];
              }
              addedProductIds.add(product.id);
            }
          });

          return {
            items: updatedItems,
            wishlistIds: state.wishlistIds.filter((id) => !addedProductIds.has(id)),
          };
        });
      },

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

      submitOrder: async (orderPayload: any) => {
        return {
          success: true,
          orderNumber: "TB-" + Math.floor(1000000 + Math.random() * 9000000),
        };
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
