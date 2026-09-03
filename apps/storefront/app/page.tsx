"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Leaf } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { CollectionCard } from "@/components/home/CollectionCard";
import { Button } from "@/components/ui/button";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";

export default function StorefrontHomePage() {
  const { locale, t } = useLanguage();

  // Featured products & collections
  const latestProducts = PRODUCTS.slice(0, 8);
  const featuredCollection = CATEGORIES[0]; // Fish & Seafood or seasonal
  const secondaryCollection = CATEGORIES[2]; // Vegetables
  const displayedCollections = CATEGORIES.slice(0, 6);

  // Curated Sourcing & Fresh Bazar Gallery Images
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
      caption: "Daily farm harvest",
    },
    {
      url: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
      caption: "Padma fresh catch",
    },
    {
      url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
      caption: "Organic farm greens",
    },
    {
      url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
      caption: "Heirloom grain harvest",
    },
    {
      url: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=800&auto=format&fit=crop&q=80",
      caption: "Padma river delta",
    },
    {
      url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
      caption: "Sundarbans raw honey",
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* ── 1. Hero Animated Carousel Banner ── */}
      <HeroCarousel />

      {/* ── 2. Editorial Marquee Ticker ── */}
      <div className="bg-[#581c87] text-white py-4 border-y border-purple-900/40 overflow-hidden shadow-sm">
        <div className="marquee">
          <div className="marquee-content font-serif text-xs md:text-sm tracking-[0.2em] uppercase">
            <span>✦ 100% Pure & Pesticide Free</span>
            <span className="text-purple-300">•</span>
            <span>Same-Day Express Cold Delivery</span>
            <span className="text-purple-300">•</span>
            <span>Authentic Padma Delta Fishery</span>
            <span className="text-purple-300">•</span>
            <span>Ethically Harvested Raw Forest Honey</span>
            <span className="text-purple-300">•</span>
            <span>Artisan Heritage Rice & Provisions</span>
            <span className="text-purple-300">•</span>
            <span>Considered Living & Zero Compromise</span>
            <span className="text-purple-300">•</span>
          </div>
          <div className="marquee-content font-serif text-xs md:text-sm tracking-[0.2em] uppercase" aria-hidden="true">
            <span>✦ 100% Pure & Pesticide Free</span>
            <span className="text-purple-300">•</span>
            <span>Same-Day Express Cold Delivery</span>
            <span className="text-purple-300">•</span>
            <span>Authentic Padma Delta Fishery</span>
            <span className="text-purple-300">•</span>
            <span>Ethically Harvested Raw Forest Honey</span>
            <span className="text-purple-300">•</span>
            <span>Artisan Heritage Rice & Provisions</span>
            <span className="text-purple-300">•</span>
            <span>Considered Living & Zero Compromise</span>
            <span className="text-purple-300">•</span>
          </div>
        </div>
      </div>

      {/* ── 3. Browse by Asymmetric Collections Grid (Image 2) ── */}
      <section className="py-12 sm:py-20 md:py-28">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary mb-2 sm:mb-3">
              {locale === "bn" ? "বিভাগ অনুযায়ী" : "Browse By"}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground">
              {locale === "bn" ? "আমাদের কালেকশন" : "Collections"}
            </h2>
          </motion.div>

          {/* 2-column mobile, 12-column desktop asymmetric grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-4 md:gap-6">
            {/* First row: 1 wide featured item spanning 2 cols on mobile, 7 cols on md */}
            {displayedCollections[0] && (
              <div className="col-span-2 md:col-span-7">
                <CollectionCard
                  collection={displayedCollections[0]}
                  index={0}
                  variant="wide"
                />
              </div>
            )}
            {/* 1 col on mobile, 5 cols on md */}
            {displayedCollections[1] && (
              <div className="col-span-1 md:col-span-5">
                <CollectionCard
                  collection={displayedCollections[1]}
                  index={1}
                />
              </div>
            )}

            {/* 1 col on mobile, 4 cols on md */}
            {displayedCollections[2] && (
              <div className="col-span-1 md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[2]}
                  index={2}
                />
              </div>
            )}
            {/* 1 col on mobile, 4 cols on md */}
            {displayedCollections[3] && (
              <div className="col-span-1 md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[3]}
                  index={3}
                />
              </div>
            )}
            {/* 1 col on mobile, 4 cols on md */}
            {displayedCollections[4] && (
              <div className="col-span-1 md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[4]}
                  index={4}
                />
              </div>
            )}

            {/* Third row: 1 wide featured item spanning 2 cols on mobile, 12 on md */}
            {displayedCollections[5] && (
              <div className="col-span-2 md:col-span-12">
                <CollectionCard
                  collection={displayedCollections[5]}
                  index={5}
                  variant="wide"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Latest Arrivals / Customer Favorites (Linen Background) ── */}
      <section className="py-12 sm:py-20 md:py-28 bg-linen">
        <div className="container-full">
          <div className="flex items-end justify-between mb-8 sm:mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary mb-2 sm:mb-3">
                {locale === "bn" ? "সদ্য আহরিত" : "Just Arrived"}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground">
                {locale === "bn" ? "দৈনিক তাজা সমাহার" : "Latest Pieces"}
              </h2>
            </motion.div>

            <Link
              href="/shop"
              className="hidden md:flex items-center gap-3 text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>{locale === "bn" ? "সব দেখুন" : "View All"}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

          {/* Product Editorial Grid (2 cols on mobile, 3 on md, 4 on lg) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {latestProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Button
              asChild
              variant="outline"
              className="rounded-none px-8 py-5 text-xs tracking-[0.15em] uppercase w-full sm:w-auto"
            >
              <Link href="/shop">
                {locale === "bn" ? "সব পণ্য দেখুন" : "View All Products"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. Featured Collection Split Editorial (Image 1) ── */}
      {featuredCollection && (
        <section className="py-20 md:py-28">
          <div className="container-full">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Image with zoom */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative aspect-[4/5] overflow-hidden group bg-muted"
              >
                <img
                  src={featuredCollection.image}
                  alt={featuredCollection.nameEn}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
              </motion.div>

              {/* Right Story Copy */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="md:py-10"
              >
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-4">
                  {locale === "bn" ? "বিশেষ সংগ্রহ" : "Featured Collection"}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-[0.96]">
                  {locale === "bn" ? featuredCollection.nameBn : featuredCollection.nameEn}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg text-sm md:text-base">
                  {locale === "bn"
                    ? `${featuredCollection.descriptionBn}। পদ্মার বুক থেকে ভোরে সংগৃহীত রূপালী ইলিশ এবং উপকূলীয় গলদা চিংড়ি। কোল্ড-চেইন সংরক্ষণে পৌঁছাবে অক্ষুণ্ণ স্বাদে।`
                    : `${featuredCollection.descriptionEn}. Sourced at daybreak from the legendary river deltas. Kept under strict temperature control to preserve the delicate sea-sweet texture and authentic heritage taste.`}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-none px-10 py-6 text-xs md:text-sm tracking-[0.15em] uppercase btn-premium"
                >
                  <Link href={`/category/${featuredCollection.slug}`}>
                    {locale === "bn" ? "কালেকশন ব্রাউজ করুন" : `Explore ${featuredCollection.nameEn}`}
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Philosophy / About Us Editorial ── */}
      <section className="py-24 md:py-32 bg-linen border-y border-border">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="divider-ornament mb-8 max-w-xs mx-auto">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
                {locale === "bn" ? "আমাদের দর্শন" : "Our Philosophy"}
              </span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.3] mb-8">
              {locale === "bn" ? (
                <>
                  আমরা বিশ্বাস করি স্লো লিভিং-এর শান্ত সৌন্দর্যে—যত্ম নিয়ে উৎপাদিত খাবারে,
                  মাটির খাঁটি স্বাদে এবং এমন খাদ্যে যা জীবনে আনে{" "}
                  <span className="italic">তৃপ্তি</span>।
                </>
              ) : (
                <>
                  We believe in the beauty of slow living—in food grown with care,
                  authentic traditions preserved, and daily meals that invite{" "}
                  <span className="italic">pause</span>.
                </>
              )}
            </h2>

            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 text-sm md:text-base">
              {locale === "bn"
                ? "আমাদের সংগ্রহের প্রতিটি পণ্য নির্বাচিত হয়েছে তার বিশুদ্ধতা, পরিবেশবান্ধব উৎপাদন প্রক্রিয়া এবং উৎপাদকের সততার ভিত্তিতে। আমরা কাজ করি এমন প্রান্তিক কৃষক ও জেলেদের সাথে, যারা ঐতিহ্য ও গুণমানে আপসহীন।"
                : "Every piece in our pantry is selected for its material purity, agricultural integrity, and its power to nourish beautifully. We work directly with smallholders and coastal artisans who share our dedication to craft and purity."}
            </p>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none px-10 py-6 text-xs md:text-sm tracking-[0.15em] uppercase border-foreground/30 hover:bg-foreground hover:text-background"
            >
              <Link href="/about">
                {locale === "bn" ? "আমাদের গল্প পড়ুন" : "Read Our Story"}
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── 7. Visual Community & Sourcing Moments (Instagram Grid) ── */}
      <section className="py-20 md:py-28">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              {locale === "bn" ? "আমাদের সাথে যুক্ত থাকুন" : "Follow Along"}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              @tatkabazar
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {locale === "bn"
                ? "খামার থেকে রান্নাঘরের দৈনন্দিন গল্প ও সতেজ রেসিপি দেখুন আমাদের সোশ্যাল প্ল্যাটফর্মে।"
                : "Join our community and get inspired by honest food stories, sustainable harvest, and considered living."}
            </p>
          </motion.div>

          {/* 6-Grid Sourcing Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {galleryImages.map((img, index) => (
              <motion.a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative aspect-square overflow-hidden group cursor-pointer bg-muted"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex flex-col items-center justify-center p-3 text-center">
                  <InstagramIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1" />
                  <span className="text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
                    {img.caption}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
