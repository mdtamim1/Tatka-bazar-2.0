"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown, Sparkles, ShieldCheck, Truck, Leaf } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/product/ProductCard";
import { CollectionCard } from "@/components/home/CollectionCard";
import { Button } from "@/components/ui/button";
import { PRODUCTS, CATEGORIES } from "@/lib/catalog";

export default function StorefrontHomePage() {
  const { locale, t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Featured products & collections
  const latestProducts = PRODUCTS.slice(0, 8);
  const featuredCollection = CATEGORIES[0]; // Fish & Seafood or seasonal
  const secondaryCollection = CATEGORIES[2]; // Vegetables
  const displayedCollections = CATEGORIES.slice(0, 6);

  // Curated Lifestyle & Sourcing Gallery Images
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
      caption: "Daily farm harvest",
    },
    {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80",
      caption: "Considered kitchen living",
    },
    {
      url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80",
      caption: "Artisan pantry objects",
    },
    {
      url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
      caption: "Slow living sanctuary",
    },
    {
      url: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=800&auto=format&fit=crop&q=80",
      caption: "Padma river delta",
    },
    {
      url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
      caption: "Earthen provisions",
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* ── 1. Hero Section (Full Viewport with Ken Burns) ── */}
      <section
        ref={heroRef}
        className="relative h-[100svh] -mt-16 md:-mt-20 overflow-hidden select-none"
      >
        {/* Parallax background image */}
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85"
            alt="Considered living and pure harvest"
            className="w-full h-[120%] object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/45 via-charcoal/20 to-charcoal/65" />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28 pt-16 md:pt-20"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/70 mb-5">
              {locale === "bn" ? "বিশুদ্ধতার অনন্য সংগ্রহ" : "Curated for Considered Living"}
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white mb-6 leading-[0.92] tracking-tight">
              {locale === "bn" ? (
                <>
                  প্রতিদিনের সতেজ
                  <br />
                  <span className="italic font-normal">খাঁটি সমাহার</span>
                </>
              ) : (
                <>
                  Harvest of
                  <br />
                  <span className="italic font-normal">Quiet Purity</span>
                </>
              )}
            </h1>

            <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed max-w-xl font-light">
              {locale === "bn"
                ? "পদ্মার তাজা রূপালী ইলিশ, সুন্দরবনের প্রাকৃতিক মধু ও বিষমুক্ত খামারের টাটকা শাকসবজি। প্রতিদিন সতেজ পৌঁছাবে আপনার দরজায়।"
                : "Ethically harvested farm produce, authentic river delicacies and pantry pieces designed to bring pure nourishment and intention to everyday living."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-none px-10 py-6 text-xs md:text-sm tracking-[0.15em] uppercase btn-premium bg-primary text-primary-foreground border-none"
              >
                <Link href="/shop">
                  {locale === "bn" ? "কেনাকাটা করুন" : "Shop Collection"}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-none px-8 py-6 text-xs md:text-sm tracking-[0.15em] uppercase bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <Link href="/recipes">
                  {locale === "bn" ? "রেসিপি থেকে বাজার" : "Recipe Stories"}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Bouncing Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-white/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. Editorial Marquee Ticker ── */}
      <div className="bg-charcoal text-background py-4 border-y border-background/10 overflow-hidden">
        <div className="marquee">
          <div className="marquee-content font-serif text-xs md:text-sm tracking-[0.2em] uppercase">
            <span>✦ 100% Pure & Pesticide Free</span>
            <span className="text-primary">•</span>
            <span>Same-Day Express Cold Delivery</span>
            <span className="text-primary">•</span>
            <span>Authentic Padma Delta Fishery</span>
            <span className="text-primary">•</span>
            <span>Ethically Harvested Raw Forest Honey</span>
            <span className="text-primary">•</span>
            <span>Artisan Heritage Rice & Provisions</span>
            <span className="text-primary">•</span>
            <span>Considered Living & Zero Compromise</span>
            <span className="text-primary">•</span>
          </div>
          <div className="marquee-content font-serif text-xs md:text-sm tracking-[0.2em] uppercase" aria-hidden="true">
            <span>✦ 100% Pure & Pesticide Free</span>
            <span className="text-primary">•</span>
            <span>Same-Day Express Cold Delivery</span>
            <span className="text-primary">•</span>
            <span>Authentic Padma Delta Fishery</span>
            <span className="text-primary">•</span>
            <span>Ethically Harvested Raw Forest Honey</span>
            <span className="text-primary">•</span>
            <span>Artisan Heritage Rice & Provisions</span>
            <span className="text-primary">•</span>
            <span>Considered Living & Zero Compromise</span>
            <span className="text-primary">•</span>
          </div>
        </div>
      </div>

      {/* ── 3. Featured Collection Split Editorial ── */}
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

      {/* ── 4. Latest Arrivals / Customer Favorites (Linen Background) ── */}
      <section className="py-20 md:py-28 bg-linen">
        <div className="container-full">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
                {locale === "bn" ? "সদ্য আহরিত" : "Just Arrived"}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">
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

          {/* Product Editorial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
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

      {/* ── 5. Browse by Asymmetric Collections Grid ── */}
      <section className="py-24 md:py-32">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-18"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              {locale === "bn" ? "বিভাগ অনুযায়ী" : "Browse By"}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              {locale === "bn" ? "আমাদের কালেকশন" : "Collections"}
            </h2>
          </motion.div>

          {/* Asymmetric grid layout (7-5, 4-4-4, 12) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* First row: 2 items */}
            {displayedCollections[0] && (
              <div className="md:col-span-7">
                <CollectionCard
                  collection={displayedCollections[0]}
                  index={0}
                  variant="wide"
                />
              </div>
            )}
            {displayedCollections[1] && (
              <div className="md:col-span-5">
                <CollectionCard
                  collection={displayedCollections[1]}
                  index={1}
                />
              </div>
            )}

            {/* Second row: 3 items */}
            {displayedCollections[2] && (
              <div className="md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[2]}
                  index={2}
                />
              </div>
            )}
            {displayedCollections[3] && (
              <div className="md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[3]}
                  index={3}
                />
              </div>
            )}
            {displayedCollections[4] && (
              <div className="md:col-span-4">
                <CollectionCard
                  collection={displayedCollections[4]}
                  index={4}
                />
              </div>
            )}

            {/* Third row: 1 wide featured item */}
            {displayedCollections[5] && (
              <div className="md:col-span-12">
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
