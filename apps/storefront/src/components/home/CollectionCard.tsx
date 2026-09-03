"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Category;
  index?: number;
  variant?: "default" | "wide" | "tall";
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  index = 0,
  variant = "default",
}) => {
  const { locale } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full h-full"
    >
      <Link
        href={`/category/${collection.slug}`}
        className="group block relative w-full h-full overflow-hidden"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-muted/40 w-full",
            variant === "wide"
              ? "aspect-[16/9] md:aspect-[21/9]"
              : variant === "tall"
              ? "aspect-[2/3]"
              : "aspect-[3/4]"
          )}
        >
          {/* Image with smooth zoom on hover */}
          <img
            src={collection.image}
            alt={locale === "bn" ? collection.nameBn : collection.nameEn}
            className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
          />

          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-700" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            {/* Collection label */}
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/70 mb-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              {locale === "bn" ? "কালেকশন" : "Collection"}
            </p>

            {/* Title */}
            <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 transform group-hover:-translate-y-1 transition-transform duration-500">
              {locale === "bn" ? collection.nameBn : collection.nameEn}
            </h3>

            {/* Description with reveal */}
            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-sm transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500 delay-75 line-clamp-2">
              {locale === "bn" ? collection.descriptionBn : collection.descriptionEn}
            </p>

            {/* Arrow indicator */}
            <div className="flex items-center gap-2 mt-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/95">
                {locale === "bn" ? "পণ্য দেখুন" : "Explore Pieces"}
              </span>
              <ArrowRight className="w-4 h-4 text-white/95 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>

          {/* Top border accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
        </div>
      </Link>
    </motion.article>
  );
};
