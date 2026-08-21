import React from "react";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tatka Bazar 2.0 (তাতকা বাজার)",
    url: "https://tatkabazar.com",
    logo: "https://tatkabazar.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+8801700000000",
      contactType: "Customer Support",
      areaServed: "BD",
      availableLanguage: ["bn", "en"],
    },
    sameAs: [
      "https://facebook.com/tatkabazar",
      "https://instagram.com/tatkabazar",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    alternateName: product.nameBn,
    image: product.images,
    description: product.descriptionEn || product.nameEn,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      url: `https://tatkabazar.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.basePrice,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.vendorName || "Tatka Bazar",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || "4.9",
      reviewCount: product.reviewsCount || "120",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
