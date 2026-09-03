"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideData {
  id: string;
  image: string;
  eyebrowBn: string;
  eyebrowEn: string;
  titleBn: React.ReactNode;
  titleEn: React.ReactNode;
  descBn: string;
  descEn: string;
  primaryLink: string;
  primaryTextBn: string;
  primaryTextEn: string;
  secondaryLink?: string;
  secondaryTextBn?: string;
  secondaryTextEn?: string;
}

const SLIDES: SlideData[] = [
  {
    id: "harvest-purity",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85",
    eyebrowBn: "বিশুদ্ধতার অনন্য সংগ্রহ",
    eyebrowEn: "Curated for Considered Living",
    titleBn: (
      <>
        প্রতিদিনের সতেজ <span className="italic font-normal">খাঁটি সমাহার</span>
      </>
    ),
    titleEn: (
      <>
        Harvest of <span className="italic font-normal">Quiet Purity</span>
      </>
    ),
    descBn: "পদ্মার তাজা রূপালী ইলিশ, সুন্দরবনের প্রাকৃতিক মধু ও বিষমুক্ত খামারের টাটকা শাকসবজি।",
    descEn: "Ethically harvested farm produce, authentic river delicacies and pantry pieces for daily intention.",
    primaryLink: "/shop",
    primaryTextBn: "কেনাকাটা করুন",
    primaryTextEn: "Shop Collection",
    secondaryLink: "/recipes",
    secondaryTextBn: "রেসিপি গল্প",
    secondaryTextEn: "Recipe Stories",
  },
  {
    id: "delta-honey",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=85",
    eyebrowBn: "প্রকৃতি ও ঐতিহ্যবাহী খাদ্য",
    eyebrowEn: "Raw Forest & Estuary",
    titleBn: (
      <>
        সুন্দরবনের মধু ও <span className="italic font-normal">খাঁটি উপাদান</span>
      </>
    ),
    titleEn: (
      <>
        Artisan Honey & <span className="italic font-normal">Pure Provisions</span>
      </>
    ),
    descBn: "সুন্দরবনের খাঁটি চাকের মধু, খাঁটি গাওয়া ঘি এবং রাসায়নিকমুক্ত ঐতিহ্যবাহী খাদ্যপণ্য।",
    descEn: "Raw Sundarban mangrove honey, hand-churned dairy ghee, and unadulterated pantry essentials.",
    primaryLink: "/category/pantry-staples",
    primaryTextBn: "প্যান্ট্রি সংগ্রহ",
    primaryTextEn: "Explore Pantry",
    secondaryLink: "/about",
    secondaryTextBn: "সোর্সিং দর্শন",
    secondaryTextEn: "Our Sourcing",
  },
  {
    id: "organic-farms",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85",
    eyebrowBn: "১০০% কীটনাশকমুক্ত",
    eyebrowEn: "Direct from Eco Farms",
    titleBn: (
      <>
        মাটি থেকে সরাসরি <span className="italic font-normal">আপনার ঘরে</span>
      </>
    ),
    titleEn: (
      <>
        Earth to Hearth <span className="italic font-normal">Fresh Greens</span>
      </>
    ),
    descBn: "ভোরে খামার থেকে আহরিত কচি শাকসবজি ও সুগন্ধি কাটারিভোগ চাল কোল্ড-চেইন এক্সপ্রেস ডেলিভারিতে।",
    descEn: "Morning-harvested organic greens and heirloom aromatic rice, delivered in temperature control.",
    primaryLink: "/category/vegetables",
    primaryTextBn: "টাটকা শাকসবজি",
    primaryTextEn: "Browse Harvest",
    secondaryLink: "/shop",
    secondaryTextBn: "সব পণ্য",
    secondaryTextEn: "View All",
  },
];

export function HeroCarousel() {
  const { locale } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !e.changedTouches[0]) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[currentIdx] ?? SLIDES[0]!;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden select-none bg-charcoal h-[52vh] min-h-[430px] max-h-[580px] md:h-[62vh] md:min-h-[500px] md:max-h-[640px]"
    >
      {/* ── Background Image Animation (Ken Burns + Crossfade) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slide.image}
            alt="Hero Banner"
            className="w-full h-full object-cover animate-ken-burns"
          />
          {/* Ambient gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/50" />
        </motion.div>
      </AnimatePresence>

      {/* ── Slide Text Content ── */}
      <div className="relative container-full h-full flex flex-col justify-center py-8 sm:py-12 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            {/* Eyebrow badge */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase text-white/75 mb-3 sm:mb-4"
            >
              {locale === "bn" ? slide.eyebrowBn : slide.eyebrowEn}
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-3 sm:mb-4 leading-[1.05] tracking-tight"
            >
              {locale === "bn" ? slide.titleBn : slide.titleEn}
            </motion.h1>

            {/* Subtitle description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base text-white/80 mb-6 sm:mb-7 leading-relaxed max-w-lg font-light line-clamp-2 sm:line-clamp-3"
            >
              {locale === "bn" ? slide.descBn : slide.descEn}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                asChild
                size="default"
                className="rounded-none px-6 sm:px-8 py-5 text-[11px] sm:text-xs tracking-[0.15em] uppercase btn-premium bg-primary text-primary-foreground border-none"
              >
                <Link href={slide.primaryLink}>
                  {locale === "bn" ? slide.primaryTextBn : slide.primaryTextEn}
                  <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </Link>
              </Button>

              {slide.secondaryLink && (
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="rounded-none px-5 sm:px-7 py-5 text-[11px] sm:text-xs tracking-[0.15em] uppercase bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <Link href={slide.secondaryLink}>
                    {locale === "bn" ? slide.secondaryTextBn : slide.secondaryTextEn}
                  </Link>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Left & Right Navigation Chevrons ── */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md text-white transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md text-white transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* ── Bottom Line Indicators / Dots ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "h-1 transition-all duration-500 rounded-full",
              currentIdx === idx
                ? "w-8 bg-primary"
                : "w-3 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
