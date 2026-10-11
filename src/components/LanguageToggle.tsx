"use client";

import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90 shadow-inner shrink-0"
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-all whitespace-nowrap ${
          locale === "hi"
            ? "bg-emerald-700 text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
        }`}
        id="lang-btn-hi"
        title="हिन्दी भाषा चुनें"
      >
        हिन्दी
      </button>

      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-all whitespace-nowrap ${
          locale === "en"
            ? "bg-emerald-700 text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
        }`}
        id="lang-btn-en"
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

