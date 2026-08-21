import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account/", "/checkout/"],
    },
    sitemap: "https://tatkabazar.com/sitemap.xml",
  };
}
