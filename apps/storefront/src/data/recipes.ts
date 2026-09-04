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
  difficulty: "Easy" | "Medium" | "Special";
  coverImage: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  instructionsBn: string[];
  instructionsEn?: string[];
}

export const POPULAR_RECIPES: Recipe[] = [
  {
    id: "rec-shorshe-ilish",
    slug: "shorshe-ilish",
    titleBn: "Authentic Mustard Hilsa (Shorshe Ilish)",
    titleEn: "Authentic Mustard Hilsa (Shorshe Ilish)",
    descriptionBn: "Classic delicacy of fresh Padma Hilsa simmered in pungent cold-pressed mustard gravy.",
    descriptionEn: "Classic delicacy of fresh Padma Hilsa simmered in pungent cold-pressed mustard gravy.",
    cookingTime: "25 mins",
    servings: 4,
    difficulty: "Easy",
    coverImage: "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=800&auto=format&fit=crop&q=80",
    totalCost: 1680,
    ingredients: [
      {
        productId: "fish-ilish-padma-01",
        nameBn: "Padma River Hilsa",
        nameEn: "Padma River Hilsa",
        weight: 1,
        unit: "kg",
        price: 1450,
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "oil-mustard-ghani-01",
        nameBn: "Cold Pressed Mustard Oil",
        nameEn: "Cold Pressed Mustard Oil",
        weight: 0.5,
        unit: "liter",
        price: 180,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "veg-chili-01",
        nameBn: "Fresh Green Chilies",
        nameEn: "Fresh Green Chilies",
        weight: 0.25,
        unit: "kg",
        price: 50,
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80",
      },
    ],
    instructionsBn: [
      "Wash Hilsa pieces thoroughly and marinate with turmeric and light salt.",
      "Blend mustard seeds with green chillies and a pinch of salt into a smooth paste.",
      "Heat cold-pressed mustard oil in a pan and temper with nigella seeds (kalonji) and split chilies.",
      "Sauté mustard paste gently with a splash of water, add fish cuts and simmer on medium heat for 10-12 mins.",
      "Finish with fresh green chilies and serve steaming hot with fragrant Kataribhog rice.",
    ],
  },
  {
    id: "rec-kala-bhuna",
    slug: "chittagong-kala-bhuna",
    titleBn: "Traditional Chittagong Mutton Kala Bhuna",
    titleEn: "Traditional Chittagong Mutton Kala Bhuna",
    descriptionBn: "Slow-roasted tender deshi mutton cooked to dark, aromatic perfection with pure ghee.",
    descriptionEn: "Slow-roasted tender deshi mutton cooked to dark, aromatic perfection with pure ghee.",
    cookingTime: "55 mins",
    servings: 5,
    difficulty: "Special",
    coverImage: "https://images.unsplash.com/photo-1545247181-516773cae7be?w=800&auto=format&fit=crop&q=80",
    totalCost: 1480,
    ingredients: [
      {
        productId: "meat-mutton-deshi-01",
        nameBn: "Fresh Deshi Mutton",
        nameEn: "Fresh Deshi Mutton",
        weight: 1,
        unit: "kg",
        price: 1100,
        image: "https://images.unsplash.com/photo-1545247181-516773cae7be?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "dairy-ghee-shahi-01",
        nameBn: "Pure Desi Ghee",
        nameEn: "Pure Desi Ghee",
        weight: 0.25,
        unit: "kg",
        price: 320,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "veg-onion-01",
        nameBn: "Desi Onions & Whole Spices",
        nameEn: "Desi Onions & Whole Spices",
        weight: 1,
        unit: "kg",
        price: 60,
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80",
      },
    ],
    instructionsBn: [
      "Wash mutton and marinate with yogurt, ginger-garlic paste, and roasted spice blend.",
      "Fry thinly sliced onions in mustard oil and pure ghee until golden brown, then slow cook meat with lid covered.",
      "Stir fry gradually until deep dark roasted color is achieved with rich caramelized coating.",
    ],
  },
];
