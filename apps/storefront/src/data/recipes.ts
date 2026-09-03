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
    coverImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    totalCost: 1680,
    ingredients: [
      {
        productId: "fish-ilish-padma-01",
        nameBn: "Padma River Hilsa",
        nameEn: "Padma River Hilsa",
        weight: 1,
        unit: "kg",
        price: 1450,
        image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&auto=format&fit=crop&q=80",
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
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    totalCost: 1480,
    ingredients: [
      {
        productId: "meat-mutton-deshi-01",
        nameBn: "Fresh Deshi Mutton",
        nameEn: "Fresh Deshi Mutton",
        weight: 1,
        unit: "kg",
        price: 1100,
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80",
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
  {
    id: "rec-bhuna-khichuri",
    slug: "aromatic-bhuna-khichuri-egg",
    titleBn: "Aromatic Bhuna Khichuri with Desi Dim",
    titleEn: "Aromatic Bhuna Khichuri with Desi Dim",
    descriptionBn: "Comforting heritage dish of Kataribhog rice and roasted moong dal tempered in pure cow ghee.",
    descriptionEn: "Comforting heritage dish of Kataribhog rice and roasted moong dal tempered in pure cow ghee.",
    cookingTime: "35 mins",
    servings: 4,
    difficulty: "Medium",
    coverImage: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80",
    totalCost: 480,
    ingredients: [
      {
        productId: "grain-katari-01",
        nameBn: "Dinajpur Kataribhog Rice",
        nameEn: "Dinajpur Kataribhog Rice",
        weight: 1,
        unit: "kg",
        price: 110,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "egg-organic-01",
        nameBn: "Desi Farm Fresh Eggs",
        nameEn: "Desi Farm Fresh Eggs",
        weight: 1,
        unit: "packet",
        price: 165,
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
      },
      {
        productId: "dairy-ghee-01",
        nameBn: "Bogra Pure Cow Ghee",
        nameEn: "Bogra Pure Cow Ghee",
        weight: 0.25,
        unit: "kg",
        price: 205,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80",
      },
    ],
    instructionsBn: [
      "Dry roast moong dal until fragrant and rinse together with Kataribhog aromatic rice.",
      "Heat pure ghee in a heavy pot, add cinnamon, cardamom, cloves, and bay leaves.",
      "Add drained rice and dal mixture, sauté for 4-5 minutes until crackling.",
      "Pour hot water, simmer covered until rice and dal are tender, fluffy, and infused with ghee aroma.",
      "Serve hot with crispy fried desi brown eggs and cold-pressed mustard oil pickles.",
    ],
  },
];
