// =============================================================================
// Tatka Bazar — Translation Dictionary (English)
// =============================================================================

import { Locale } from "@/types";

const englishStrings = {
  // Brand & Header
  brandName: "Tatka Bazar",
  tagline: "Farm Fresh Every Day, Pure Trust",
  searchPlaceholder: "Search fresh fish, vegetables, fruits, rice, lentils...",
  deliverTo: "Deliver to",
  selectArea: "Select Area",
  dhakaHub: "Dhaka (Dhanmondi / Gulshan / Mirpur / Uttara)",
  chattogramHub: "Chattogram (GEC / Agrabad)",
  sylhetHub: "Sylhet",
  switchLanguage: "English",
  cart: "Cart",
  items: "items",
  total: "Total",
  wishlist: "Wishlist",
  account: "Account",
  login: "Sign In",
  register: "Register",
  logout: "Logout",
  wholesaleB2B: "Wholesale / B2B",

  // Top announcement
  topAnnouncement: "⚡ 7 AM - 9 AM Fresh Morning Express Delivery! Free shipping on ৳999+ orders",

  // Hero
  heroBadge: "Direct from Rivers & Organic Farms",
  heroTitle1: "Fresh Padma Hilsa & Morning Fish Market",
  heroSub1: "Daily fresh catch harvested at dawn, delivered directly to your kitchen.",
  heroCta1: "Shop Today's Catch",
  heroTitle2: "100% Certified Organic Produce",
  heroSub2: "Pure local vegetables & fruits with zero harmful chemicals or preservatives.",
  heroCta2: "Explore Organic",
  heroTitle3: "Dinajpur Premium Kataribhog & Aromatic Rice",
  heroSub3: "Aromatic, long-grain staples directly from the mill at unbeatable wholesale prices.",
  heroCta3: "Shop Grains & Lentils",

  // Flash deals
  flashDealsTitle: "Today's Daily Bazar — Flash Deals",
  flashDealsSubtitle: "Limited-time discounts! Stocks are selling out fast",
  endsIn: "Offer ends in",
  hours: "hrs",
  minutes: "mins",
  seconds: "secs",
  sold: "sold",

  // Weight Selector
  selectWeight: "Select Weight / Quantity",
  customWeight: "Custom Quantity",
  tieredDiscountBadge: "Bulk savings available!",
  pricePerKg: "per kg",
  pricePerUnit: "per unit",
  addToCart: "Add to Cart",
  addedToCart: "Added to Cart!",
  buyNow: "Buy Now",
  stockAvailable: "In Stock",
  outOfStock: "Out of Stock",
  freshnessMeter: "Freshness Index",
  freshFrom: "Sourced From",

  // Sections
  shopByCategory: "Shop by Category",
  viewAll: "View All",
  popularProducts: "Most Selling",
  bestSellers: "Customer Favorites",
  organicPicks: "Nature's Best Harvest",

  featuredVendors: "Verified Partner Shops",
  visitShop: "Visit Store",
  verifiedVendor: "Verified Partner",

  // Trust Strip
  trust1Title: "100% Freshness Guarantee",
  trust1Desc: "Instant replacement or refund if you're not fully satisfied with the freshness.",
  trust2Title: "60-Minute Express Delivery",
  trust2Desc: "Fastest morning & evening time-slotted doorstep delivery across hubs.",
  trust3Title: "Secure Payments & COD",
  trust3Desc: "Pay via bKash, Nagad, cards or Cash on Delivery with full peace of mind.",
  trust4Title: "Direct Farmer & River Sourcing",
  trust4Desc: "Fair prices with zero middlemen, directly connecting rural producers to you.",

  // Cart Drawer
  myCart: "My Shopping Bag",
  emptyCart: "Your cart is empty",
  emptyCartMsg: "Add farm-fresh produce and artisanal groceries to get started!",
  startShopping: "Start Shopping",
  vendorOrderGroup: "Split packaging by seller",
  officialTatkaBadge: "Tatka Bazar Official Stock",
  subtotal: "Subtotal",
  deliveryFee: "Delivery Fee",
  freeDelivery: "FREE",
  discount: "Discount",
  grandTotal: "Grand Total",
  couponPlaceholder: "Promo code (e.g. WELCOME10)",
  applyCoupon: "Apply",
  couponApplied: "Coupon applied successfully!",
  proceedToCheckout: "Proceed to Checkout",

  // Checkout
  checkoutTitle: "Secure Checkout",
  step1Title: "1. Delivery Address",
  fullName: "Full Name",
  phoneNumber: "Phone Number",
  emailAddress: "Email (optional)",
  division: "Division",
  district: "District",
  area: "Area / Thana",
  fullAddress: "House, Road, Apartment & Landmark details",
  step2Title: "2. Delivery Time Slot",
  slotMorning: "🌅 Fresh Morning (7:00 AM - 9:00 AM)",
  slotNoon: "☀️ Midday Express (12:00 PM - 2:00 PM)",
  slotEvening: "🌆 Evening Prime (6:00 PM - 8:30 PM)",
  step3Title: "3. Payment Method",
  bkash: "bKash (Instant Checkout)",
  nagad: "Nagad (Direct Pay)",
  sslcommerz: "Card / Internet Banking (SSLCommerz)",
  cod: "Cash on Delivery (Pay at Door)",
  orderSummary: "Order Summary",
  placeOrder: "Confirm Order (৳",
  orderSuccessTitle: "🎉 Your order has been placed successfully!",
  orderNumber: "Order Number",
  orderTrackingMsg: "Our rider will deliver your farm-fresh items right on time.",
  trackOrder: "Track Live Order",
  backToHome: "Return to Homepage",

  // Product Detail
  specifications: "Specifications & Details",
  nutritionFacts: "Nutritional Facts (per 100g)",
  originInfo: "Sourcing & Harvest Info",
  storageGuide: "Storage & Freshness Tips",
  customerReviews: "Customer Reviews & Ratings",
  writeReview: "Write a Review",
  frequentlyBoughtTogether: "Frequently Bought Together",
  comboDiscount: "Combo Savings",
  addAllToCart: "Add All to Cart",

  // Footer
  footerAbout: "Tatka Bazar is Bangladesh's premier online fresh marketplace. We deliver fresh fish, farm vegetables, aromatic rice, and daily staples straight from rivers and farms to your doorstep.",
  hubLocations: "Our Fulfillment Hubs",
  customerCare: "Customer Care",
  faq: "FAQ",
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  contactUs: "Contact Us",
  hotline: "Hotline: 01700-000000 (24/7)",
  allRightsReserved: "All rights reserved © 2026 Tatka Bazar Ltd.",
};

export const translations = {
  bn: englishStrings,
  en: englishStrings,
};

export function getTranslation(_locale?: Locale) {
  return englishStrings;
}
