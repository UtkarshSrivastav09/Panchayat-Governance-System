"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { GOVT_SCHEMES, GovtScheme } from "@/data/schemes";
import { getUserSession, UserProfile } from "@/lib/auth-storage";
import SchemeApplicationModal from "@/components/SchemeApplicationModal";
import {
  Award,
  Search,
  ExternalLink,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  PhoneCall,
  ArrowRight,
  Filter,
  Check,
  Send,
  Building2,
} from "lucide-react";

type CategoryFilter = "all" | "live" | "upcoming" | "financial" | "machinery" | "insurance";

export default function SchemesPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      return getUserSession();
    }
    return null;
  });
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<GovtScheme | null>(null);

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  // Filter schemes based on active category and search query
  const filteredSchemes = GOVT_SCHEMES.filter((scheme) => {
    // Category / status filter
    if (activeFilter === "live" && scheme.status !== "live") return false;
    if (activeFilter === "upcoming" && scheme.status !== "upcoming") return false;
    if (activeFilter === "financial" && scheme.category !== "financial") return false;
    if (activeFilter === "machinery" && scheme.category !== "machinery") return false;
    if (activeFilter === "insurance" && scheme.category !== "insurance") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = scheme.name_hi.toLowerCase().includes(q) || scheme.name_en.toLowerCase().includes(q);
      const matchBenefit = scheme.benefit_hi.toLowerCase().includes(q) || scheme.benefit_en.toLowerCase().includes(q);
      const matchDept = scheme.department_hi.toLowerCase().includes(q) || scheme.department_en.toLowerCase().includes(q);
      return matchName || matchBenefit || matchDept;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 space-y-6 sm:space-y-8">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-full shadow-md">
              {locale === "hi"
                ? "🏛️ उत्तर प्रदेश शासन • पंचायती राज व कृषि कल्याण"
                : "🏛️ Govt of Uttar Pradesh • Panchayati Raj & Agriculture"}
            </span>
            <span className="text-xs font-bold bg-white/20 text-emerald-100 px-3 py-1 rounded-full border border-white/20">
              {locale === "hi"
                ? `${GOVT_SCHEMES.length} योजनाएं सूचीबद्ध`
                : `${GOVT_SCHEMES.length} Welfare Schemes Listed`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {locale === "hi"
              ? "किसान कल्याण एवं सरकारी योजनाएं पोर्टल"
              : "Government Schemes & Welfare Portal"}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-medium">
            {locale === "hi"
              ? "ग्राम स्तर पर सभी सक्रिय एवं आगामी कृषि योजनाओं की सम्पूर्ण जानकारी, आवश्यक दस्तावेज, पात्रता एवं सीधे ऑनलाइन आवेदन की सुविधा।"
              : "Discover all live and upcoming agricultural welfare schemes in your village with eligibility details, documents checklist, and direct online application."}
          </p>
        </div>
      </div>

      {/* Interactive Category Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "all"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi"
                ? `🌟 सभी योजनाएं (${GOVT_SCHEMES.length})`
                : `🌟 All Schemes (${GOVT_SCHEMES.length})`}
            </button>

            <button
              onClick={() => setActiveFilter("live")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "live"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? "🟢 सक्रिय / लाइव (5)" : "🟢 Live & Active (5)"}
            </button>

            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "upcoming"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? "⏳ आगामी योजनाएं (2)" : "⏳ Upcoming Schemes (2)"}
            </button>

            <button
              onClick={() => setActiveFilter("financial")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "financial"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? "💰 डीबीटी व ऋण (DBT / Loan)" : "💰 DBT & Subsidized Credit"}
            </button>

            <button
              onClick={() => setActiveFilter("machinery")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "machinery"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? "🚜 सोलर व कृषि यंत्र" : "🚜 Solar Pumps & Machinery"}
            </button>

            <button
              onClick={() => setActiveFilter("insurance")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeFilter === "insurance"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? "🛡️ फसल बीमा (Crop Insurance)" : "🛡️ PMFBY Crop Insurance"}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "hi" ? "योजना या सब्सिडी खोजें..." : "Search scheme or subsidy..."}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredSchemes.map((scheme) => {
          const isLive = scheme.status === "live";

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header Status & Department */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block ${
                        isLive
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {isLive
                        ? locale === "hi" ? "🟢 आवेदन सक्रिय (Live)" : "🟢 Applications Open (Live)"
                        : locale === "hi" ? "⏳ आगामी (Upcoming)" : "⏳ Upcoming Scheme"}
                    </span>
                    <p className="text-[11px] font-bold text-slate-500">
                      {locale === "hi" ? scheme.department_hi : scheme.department_en}
                    </p>
                  </div>

                  <span className="text-xs font-black bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 text-right shrink-0">
                    {locale === "hi" ? scheme.subsidy_highlight_hi : scheme.subsidy_highlight_en}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {locale === "hi" ? scheme.name_hi : scheme.name_en}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {locale === "hi" ? scheme.description_hi : scheme.description_en}
                  </p>
                </div>

                {/* Benefit Highlight Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-black shrink-0">
                    ₹
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      {locale === "hi" ? "योजना से मिलने वाला लाभ:" : "Key Scheme Benefit:"}
                    </span>
                    <span className="font-extrabold text-emerald-950">
                      {locale === "hi" ? scheme.benefit_hi : scheme.benefit_en}
                    </span>
                  </div>
                </div>

                {/* Eligibility Bullet points */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-extrabold text-slate-800 block">
                    {locale === "hi" ? "पात्रता एवं शर्तें:" : "Eligibility Criteria:"}
                  </span>
                  <ul className="space-y-1 text-slate-600 pl-1">
                    {(locale === "hi" ? scheme.eligibility_hi : scheme.eligibility_en).map((elig, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{elig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div className="text-xs space-y-1 pt-1">
                  <span className="font-extrabold text-slate-800 block">
                    {locale === "hi" ? "आवश्यक दस्तावेज:" : "Required Documents:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(locale === "hi" ? scheme.documents_hi : scheme.documents_en).map((doc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
                {/* 1-Click Fast Form Button */}
                <button
                  type="button"
                  onClick={() => setSelectedSchemeForModal(scheme)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>
                    {locale === "hi" ? "सीधे आवेदन करें" : "Apply Online Direct"}
                  </span>
                </button>

                {/* Official Portal External Link */}
                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap"
                  title={locale === "hi" ? "आधिकारिक सरकारी वेबसाइट" : "Official Govt Portal"}
                >
                  <span>{locale === "hi" ? "ऑफिशियल पोर्टल" : "Official Portal"}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Modal */}
      {selectedSchemeForModal && (
        <SchemeApplicationModal
          scheme={selectedSchemeForModal}
          currentUser={currentUser}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}

      {/* Toll-free Kisan Helpline Callout */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-base sm:text-lg">
              {locale === "hi" ? "योजना सहायता व टोल फ्री हेल्पलाइन" : "Kisan Scheme Toll-Free Helpline"}
            </h4>
            <p className="text-xs text-slate-300">
              {locale === "hi"
                ? "किसी भी योजना में आवेदन में समस्या आ रही हो तो सीधे सरकारी सहायता केंद्र पर संपर्क करें।"
                : "Free official helpline for application assistance, DBT installment verification, and grievance redressal."}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shrink-0 transition-colors whitespace-nowrap"
        >
          {locale === "hi" ? "1800-180-1551 (टोल फ्री)" : "1800-180-1551 (Toll-Free)"}
        </a>
      </div>

    </div>
  );
}
