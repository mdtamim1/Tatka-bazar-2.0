"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/catalog";

export const Footer = () => {
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-charcoal text-background mt-auto">
      {/* Top bar with Brand & Newsletter */}
      <div className="border-b border-background/10">
        <div className="container-full py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link
                href="/"
                className="font-serif text-3xl md:text-4xl tracking-tight text-background hover:text-primary transition-colors duration-300 inline-block"
              >
                Tatka Bazar
              </Link>
              <p className="mt-3 text-sm text-background/60 leading-relaxed max-w-sm">
                {locale === "bn"
                  ? "সততা ও পবিত্রতায় সংগৃহীত প্রতিদিনের সতেজ বাজার। পদ্মার রূপালী ইলিশ থেকে সুন্দরবনের খাঁটি মধু।"
                  : "Curated farm harvest, authentic heritage delicacies and pantry staples for considered living."}
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="max-w-sm w-full">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-background/50 mb-3">
                {locale === "bn" ? "যোগাযোগে থাকুন" : "Stay Connected"}
              </p>
              {subscribed ? (
                <p className="text-xs text-background/80 font-serif italic py-3">
                  {locale === "bn" ? "ধন্যবাদ! আমাদের মৌসুমি বুলেটিনে স্বাগতম।" : "Thank you. Welcome to our seasonal journal."}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={locale === "bn" ? "আপনার ইমেইল..." : "Enter your email"}
                    className="flex-1 h-12 px-4 text-sm bg-background/5 border border-background/15 text-background placeholder:text-background/40 focus:outline-none focus:border-background/40 transition-colors rounded-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="h-12 px-5 text-sm font-medium bg-background text-foreground hover:bg-background/90 transition-colors rounded-none flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content columns */}
      <div className="container-full py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          
          {/* Column 1: Collections */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              {locale === "bn" ? "কালেকশন" : "Collections"}
            </h4>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-background/65 hover:text-background transition-colors duration-300 block"
                  >
                    {locale === "bn" ? cat.nameBn : cat.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              {locale === "bn" ? "এক্সপ্লোর" : "Explore"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-background/65 hover:text-background transition-colors duration-300 block"
                >
                  {locale === "bn" ? "সব পণ্য" : "Shop All"}
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-background/65 hover:text-background transition-colors duration-300 block"
                >
                  {locale === "bn" ? "রেসিপি থেকে বাজার" : "Recipes to Bag"}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-background/65 hover:text-background transition-colors duration-300 block"
                >
                  {locale === "bn" ? "আমাদের দর্শন" : "Our Philosophy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-background/65 hover:text-background transition-colors duration-300 block"
                >
                  {locale === "bn" ? "শপিং ব্যাগ" : "Shopping Bag"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sourcing & Integrity */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              {locale === "bn" ? "বিশুদ্ধতা ও নিশ্চয়তা" : "Integrity & Care"}
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-background/65 block">
                  {locale === "bn" ? "১০০% প্রিজারভেটিভ মুক্ত" : "100% Preservative Free"}
                </span>
              </li>
              <li>
                <span className="text-sm text-background/65 block">
                  {locale === "bn" ? "মৌসুমি সরাসরি খামার সোর্সিং" : "Direct Farm Sourcing"}
                </span>
              </li>
              <li>
                <span className="text-sm text-background/65 block">
                  {locale === "bn" ? "কোল্ড-চেইন এক্সপ্রেস ডেলিভারি" : "Cold-Chain Express Delivery"}
                </span>
              </li>
              <li>
                <span className="text-sm text-background/65 block">
                  {locale === "bn" ? "তাত্ক্ষণিক গুণমান গ্যারান্টি" : "Freshness Guarantee"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              {locale === "bn" ? "সহায়তা" : "Concierge"}
            </h4>
            <ul className="space-y-3">
              <li className="text-sm text-background/65">
                support@tatkabazar.com
              </li>
              <li className="text-sm text-background/65">
                +880 1800-TATKA (82852)
              </li>
              <li className="text-sm text-background/65">
                Gulshan, Dhaka 1212, Bangladesh
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="p-2 bg-background/5 hover:bg-background/15 text-background transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="p-2 bg-background/5 hover:bg-background/15 text-background transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:support@tatkabazar.com"
                    aria-label="Email"
                    className="p-2 bg-background/5 hover:bg-background/15 text-background transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-background/10">
        <div className="container-full py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-background/50">
          <p>© {new Date().getFullYear()} Tatka Bazar. All rights reserved. Crafted for considered living.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-background transition-colors">
              Delivery Information
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
