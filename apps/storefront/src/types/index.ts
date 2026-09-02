// =============================================================================
// Tatka Bazar — Storefront Types & Data Models
// =============================================================================

export type Locale = "bn" | "en";

export type WeightUnit = "kg" | "g" | "liter" | "ml" | "piece" | "packet" | "dozen";

export interface WeightOption {
  value: number; // in base unit (e.g. 0.25, 0.5, 1, 2, 5)
  unit: WeightUnit;
  labelBn: string;
  labelEn: string;
  multiplier: number; // price multiplier relative to base unit price
  popular?: boolean;
}

export interface TieredPrice {
  minQty: number; // e.g. 5 (kg)
  pricePerUnit: number; // e.g. ৳65
  discountPercent?: number;
  labelBn: string;
  labelEn: string;
}

export interface Product {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  subcategorySlug?: string;
  basePrice: number; // Price per base unit (e.g. ৳75 per 1 kg)
  comparePrice?: number;
  baseUnit: WeightUnit;
  pricingType: "variableWeight" | "fixed" | "pack";
  weightOptions?: WeightOption[];
  tieredPricing?: TieredPrice[];
  stock: number; // in base units
  images: string[];
  isOrganic?: boolean;
  isFeatured?: boolean;
  isDailyBazar?: boolean; // Flash deal
  flashDiscount?: number; // %
  originBn: string;
  originEn: string;
  freshnessGuaranteeBn: string;
  freshnessGuaranteeEn: string;
  nutritionInfo?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  storageTipsBn?: string;
  storageTipsEn?: string;
  rating: number;
  reviewsCount: number;
  vendorId?: string;
  vendorNameBn: string;
  vendorNameEn: string;
  vendorSlug: string;
  isOfficialTatka: boolean;
  sku: string;
  brandName?: string;
  brandSlug?: string;
  netContent?: string;
  netWeight?: string;
  shelfLife?: string;
  madeIn?: string;
  keyIngredients?: { name: string; desc: string; icon?: string }[];
  howToUseSteps?: string[];
  inciIngredients?: string;
  skinConcerns?: string[];
  suitableFor?: string[];
  reviewsList?: {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  qaList?: {
    id: string;
    question: string;
    askedBy: string;
    date: string;
    answer?: string;
    answeredBy?: string;
  }[];
}

export interface Category {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  icon: string; // emoji or icon name
  image: string;
  itemCount: number;
  subcategories?: {
    slug: string;
    nameBn: string;
    nameEn: string;
  }[];
}

export interface VendorShop {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  logo: string;
  banner: string;
  rating: number;
  reviewsCount: number;
  locationBn: string;
  locationEn: string;
  joinedYear: number;
  totalProducts: number;
  verified: boolean;
  badgeBn: string;
  badgeEn: string;
}

export interface Branch {
  id: string;
  nameBn: string;
  nameEn: string;
  areaBn: string;
  areaEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  deliveryTimeBn: string;
  deliveryTimeEn: string;
  isOpen: boolean;
}

export interface CartItem {
  id: string; // Unique cart item ID (productId + selectedWeight)
  productId: string;
  product: Product;
  selectedWeight: number; // e.g. 0.5, 1, 2
  selectedUnit: WeightUnit;
  unitPrice: number; // calculated unit price
  quantity: number; // number of packages/pieces
  totalPrice: number; // unitPrice * quantity
  vendorId: string;
  vendorNameBn: string;
  vendorNameEn: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  userLocation: string;
  rating: number;
  date: string;
  commentBn: string;
  commentEn: string;
  verifiedPurchase: boolean;
  likes: number;
  category?: "all" | "fish" | "veggies" | "village" | "express";
  productNameBn?: string;
  productNameEn?: string;
  userRoleBn?: string;
  userRoleEn?: string;
  deliveryTimeBn?: string;
  deliveryTimeEn?: string;
}

