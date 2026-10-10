"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import hiDict from "@/data/locales/hi.json";
import enDict from "@/data/locales/en.json";

export type Locale = "hi" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dict: typeof hiDict;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang") as Locale | null;
    if (saved === "hi" || saved === "en") {
      setLocaleState(saved);
      document.cookie = `preferred_lang=${saved}; path=/; max-age=31536000`;
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("preferred_lang", l);
    document.cookie = `preferred_lang=${l}; path=/; max-age=31536000`;
  };

  const dict = locale === "hi" ? hiDict : enDict;

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = dict;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }
    return typeof current === "string" ? current : path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const dict = hiDict;
    const t = (path: string): string => {
      const keys = path.split(".");
      let current: any = dict;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return path;
        }
      }
      return typeof current === "string" ? current : path;
    };
    return {
      locale: "hi" as Locale,
      setLocale: () => {},
      t,
      dict,
    };
  }
  return ctx;
}
