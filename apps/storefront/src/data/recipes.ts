export interface RecipeIngredient {
  productId: string;
  nameBn: string;
  nameEn: string;
  weight: number;
  unit: "kg" | "g" | "piece" | "packet" | "liter";
  price: number;
  image: string;
}

export interface Recipe {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  cookingTime: string;
  servings: number;
  difficulty: "সহজ" | "মাঝারি" | "স্পেশাল";
  coverImage: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  instructionsBn: string[];
}

export const POPULAR_RECIPES: Recipe[] = [
  {
    id: "rec-shorshe-ilish",
    slug: "shorshe-ilish",
    titleBn: "খাঁটি সর্ষে ইলিশ ও কাঁচামরিচ ফোড়ন",
    titleEn: "Authentic Mustard Hilsa (Shorshe Ilish)",
    descriptionBn: "ঘানিভাঙা খাঁটি সরিষার তেলে পদ্মার তাজা ইলিশের জিভে জল আনা ঐতিহ্যবাহী ভুনা।",
    descriptionEn: "Classic Bengali delicacy of fresh Padma Hilsa simmered in pungent cold-pressed mustard gravy.",
    cookingTime: "২৫ মিনিট",
    servings: 4,
    difficulty: "সহজ",
    coverImage: "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=800&auto=format&fit=crop&q=80",
    totalCost: 1680,
    ingredients: [
      {
        productId: "fish-ilish-padma-01",
        nameBn: "পদ্মার তাজা রূপালি ইলিশ (১ কেজি)",
        nameEn: "Padma River Hilsa",
        weight: 1,
        unit: "kg",
        price: 1450,
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "oil-mustard-ghani-01",
        nameBn: "ঘানিভাঙা খাঁটি সরিষার তেল (৫০০ মিলি)",
        nameEn: "Cold Pressed Mustard Oil",
        weight: 0.5,
        unit: "liter",
        price: 180,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "veg-chili-01",
        nameBn: "তাজা কাঁচা মরিচ ও কালোজিরা",
        nameEn: "Fresh Green Chilies",
        weight: 0.25,
        unit: "kg",
        price: 50,
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80",
      },
    ],
    instructionsBn: [
      "ইলিশ মাছ টুকরো করে ভালো করে ধুয়ে সামান্য হলুদ ও লবণ মেখে রাখুন।",
      "সরিষা বাটার সাথে কাঁচামরিচ ও সামান্য লবণ দিয়ে মিহি পেস্ট বানান।",
      "কড়াইয়ে ঘানিভাঙা খাঁটি সরিষার তেল গরম করে কালোজিরা ও চেরা কাঁচামরিচ ফোড়ন দিন।",
      "সরিষা পেস্ট ও সামান্য পানি দিয়ে কষিয়ে মাছের টুকরোগুলো দিয়ে ১০-১২ মিনিট মাঝারি আঁচে রান্না করুন।",
      "তেল ভেসে উঠলে উপরে আরও কয়েকটি কাঁচামরিচ দিয়ে গরম ভাতের সাথে পরিবেশন করুন।",
    ],
  },
  {
    id: "rec-kala-bhuna",
    slug: "chittagong-kala-bhuna",
    titleBn: "চট্টগ্রামের ঐতিহ্যবাহী খাসির কালা ভুনা",
    titleEn: "Traditional Chittagong Mutton Kala Bhuna",
    descriptionBn: "কচি খাসির মাংস, খাঁটি গাওয়া ঘি ও বিশেষ ভাজা মসলার যুগলবন্দীতে খাঁটি কালা ভুনা।",
    descriptionEn: "Slow-roasted tender deshi mutton cooked to dark, aromatic perfection with pure ghee.",
    cookingTime: "৫৫ মিনিট",
    servings: 5,
    difficulty: "স্পেশাল",
    coverImage: "https://images.unsplash.com/photo-1545247181-516773cae7be?w=800&auto=format&fit=crop&q=80",
    totalCost: 1480,
    ingredients: [
      {
        productId: "meat-mutton-deshi-01",
        nameBn: "তাজা খাসির ফ্রেশ মাংস (১ কেজি)",
        nameEn: "Fresh Deshi Mutton",
        weight: 1,
        unit: "kg",
        price: 1100,
        image: "https://images.unsplash.com/photo-1545247181-516773cae7be?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "dairy-ghee-shahi-01",
        nameBn: "বগুড়ার খাঁটি গাওয়া ঘি (২৫০ গ্রাম)",
        nameEn: "Pure Desi Ghee",
        weight: 0.25,
        unit: "kg",
        price: 320,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "veg-onion-01",
        nameBn: "দেশি পেঁয়াজ ও গোলমরিচ",
        nameEn: "Desi Onions & Whole Spices",
        weight: 1,
        unit: "kg",
        price: 60,
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80",
      },
    ],
    instructionsBn: [
      "মাংস ভালো করে ধুয়ে টকদই, আদা-রসুন বাটা, পেঁয়াজ বাটা ও গুড়া মসলা দিয়ে ম্যারিনেট করে রাখুন।",
      "তেল ও ঘিয়ে পেঁয়াজ বেরেস্তা করে মাংস অল্প আঁচে ঢাকনা দিয়ে কষাতে থাকুন।",
      "ধীরে ধীরে গাঢ় কালচে রং না আসা পর্যন্ত সামান্য পানি ছিটিয়ে কড়াইয়ে ভাজতে থাকুন।",
    ],
  },
];
