"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale } from "@/types";
import { translations, getTranslation } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  t: typeof translations.en;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  formatNumber: (num: number) => string;
  formatPrice: (price: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function toBnDigits(num: number | string): string {
  return String(num);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale] = useState<Locale>("en");

  useEffect(() => {
    localStorage.setItem("tatka_locale", "en");
    document.cookie = `tatka_locale=en; path=/; max-age=31536000`;
    document.documentElement.lang = "en";
  }, []);

  const setLocale = (_newLocale: Locale) => {
    // English only
  };

  const toggleLocale = () => {
    // English only
  };

  const formatNumber = (num: number): string => {
    return String(num);
  };

  const formatPrice = (price: number): string => {
    return `৳${price}`;
  };

  const t = getTranslation("en");

  return (
    <LanguageContext.Provider
      value={{
        locale: "en",
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
