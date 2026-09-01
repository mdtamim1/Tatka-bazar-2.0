import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tatkabazar.com";

  // Static core routes
  const routes = [
    "",
    "/b2b",
    "/cart",
    "/checkout",
    "/recipes",
    "/bundles",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Product routes
  const productSlugs = [
    "padma-fresh-ilish-fish",
    "organic-red-tomatoes",
    "bogura-shahi-sweet-curd",
    "pure-mustard-oil-cold-pressed",
    "fresh-deshi-mutton-cut",
  ];
  const productRoutes = productSlugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // Dynamic Category routes
  const categorySlugs = [
    "fish-and-meat",
    "vegetables",
    "fruits",
    "dairy-and-sweets",
    "rice-and-staples",
    "oil-and-ghee",
  ];
  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
