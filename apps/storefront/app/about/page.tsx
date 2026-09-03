"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Heart, Leaf, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const { locale } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <div className="w-full overflow-hidden">
      {/* ── 1. Hero Section ── */}
      <section
        ref={heroRef}
        className="relative h-[80vh] md:h-screen -mt-16 md:-mt-20 overflow-hidden select-none"
      >
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=85"
            alt="Organic agro landscape"
            className="w-full h-[120%] object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/20 to-charcoal/65" />
        </motion.div>

        <div className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/70 mb-5">
              {locale === "bn" ? "আমাদের গল্প" : "Our Story"}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.92]">
              {locale === "bn" ? (
                <>
                  বিশুদ্ধতার নান্দনিক
                  <br />
                  <span className="italic font-normal">আবাস ও যাত্রা</span>
                </>
              ) : (
                <>
                  Curating Purity
                  <br />
                  <span className="italic font-normal">for Living</span>
                </>
              )}
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-lg leading-relaxed font-light">
              {locale === "bn"
                ? "খাদ্য ও প্রাকৃতিক উপাদানের এমন এক অনন্য সমাহার যা জীবনে আনে মানসিক প্রশান্তি এবং শারীরিক পুষ্টি।"
                : "Provisions grown with care, heritage varieties that endure gracefully, and meals that invite pause."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Philosophy ── */}
      <section className="py-28 md:py-40">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="divider-ornament mb-12 max-w-xs mx-auto">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
                {locale === "bn" ? "আমাদের দর্শন" : "Our Philosophy"}
              </span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.28] tracking-tight">
              {locale === "bn" ? (
                <>
                  আমরা বিশ্বাস করি যে খাবার আমরা গ্রহণ করি তা কেবল ক্ষুধা মেটায় না—তা গল্প বলে,
                  মাটির সাথে সংযোগ স্থাপন করে এবং দৈনন্দিন জীবনে আনে শান্ত{" "}
                  <span className="italic">আনন্দ</span>।
                </>
              ) : (
                <>
                  We believe that the food we nourish ourselves with should tell stories,
                  respect the seasons, and bring quiet{" "}
                  <span className="italic">joy</span> to everyday moments.
                </>
              )}
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ── 3. Story: Large Image + Narrative ── */}
      <section className="pb-20 md:pb-32">
        <div className="container-full">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center mb-24 md:mb-36">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
                {locale === "bn" ? "সূচনা" : "The Beginning"}
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                A Quest for
                <br />
                <span className="italic font-normal">Meaningful Purity</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5 text-sm md:text-base">
                {locale === "bn"
                  ? "টাটকা বাজার শুরু হয়েছিল এক আন্তরিক অনুসন্ধান থেকে—ভেজাল ও কৃত্রিমতার যুগে এমন খাঁটি খাদ্য খুঁজে পাওয়ার তাগিদ, যা শরীরের জন্য নিরাপদ এবং স্বাদে অনবদ্য।"
                  : "Tatka Bazar began as a quest—a search for honest provisions in an age of processed convenience. We journeyed across river deltas, certified eco-farms, and coastal villages to find artisans who value craft over mass production."}
              </p>
              <p className="text-muted-foreground leading-[1.8] text-sm md:text-base">
                {locale === "bn"
                  ? "পদ্মার তাজা মাছ, সুন্দরবনের প্রাকৃতিক চাকের মধু থেকে শুরু করে ঐতিহ্যবাহী কাটারিভোগ চাল—প্রতিটি পণ্য সরাসরি প্রস্তুতকারকদের থেকে যত্নসহকারে সংগৃহীত।"
                  : "What started as a small personal initiative has grown into a carefully curated marketplace of provisions and kitchen lifestyle pieces, each chosen for its ability to bring authentic warmth and health to your home."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="md:col-span-7"
            >
              <div className="aspect-[4/5] overflow-hidden group bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
                  alt="Organic farm fresh harvest"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          {/* Full-width editorial banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-24 md:mb-36"
          >
            <div className="relative h-[45vh] md:h-[65vh] overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1506484381205-f7945653044d?w=1920&q=80"
                alt="River delta and agro heritage"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/25" />
            </div>
          </motion.div>

          {/* Sourcing Values */}
          <div className="grid md:grid-cols-3 gap-10 md:gap-12 text-center md:text-left">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">01</p>
              <h4 className="font-serif text-2xl text-foreground">Zero Preservatives</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                No harmful chemicals or synthetic ripening agents. Only nature’s unhurried timeline.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">02</p>
              <h4 className="font-serif text-2xl text-foreground">Ethical Fair Sourcing</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Fair prices and direct partnerships with local farmers, bee-collectors, and fishermen.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">03</p>
              <h4 className="font-serif text-2xl text-foreground">Cold-Chain Speed</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                From morning catch to kitchen table in insulated temperature-controlled packaging.
              </p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 py-6 text-xs md:text-sm tracking-[0.15em] uppercase btn-premium"
            >
              <Link href="/shop">
                {locale === "bn" ? "আমাদের সংগ্রহ দেখুন" : "Explore The Collection"}
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
