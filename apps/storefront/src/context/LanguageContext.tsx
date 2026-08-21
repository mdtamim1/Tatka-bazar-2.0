"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale } from "@/types";
import { translations, getTranslation } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  t: typeof translations.bn;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  formatNumber: (num: number) => string;
  formatPrice: (price: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Bangla digits converter
const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBnDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tatka_locale") as Locale;
    if (saved === "bn" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("tatka_locale", newLocale);
    document.cookie = `tatka_locale=${newLocale}; path=/; max-age=31536000`;
    document.documentElement.lang = newLocale;
  };

  const toggleLocale = () => {
    setLocale(locale === "bn" ? "en" : "bn");
  };

  const formatNumber = (num: number): string => {
    if (locale === "bn") {
      return toBnDigits(num);
    }
    return String(num);
  };

  const formatPrice = (price: number): string => {
    if (locale === "bn") {
      return `৳${toBnDigits(price)}`;
    }
    return `৳${price}`;
  };

  const t = getTranslation(locale);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        t,
        setLocale,
        toggleLocale,
        formatNumber,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
