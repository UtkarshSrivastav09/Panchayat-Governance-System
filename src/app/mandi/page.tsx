"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import MandiTable from "@/components/MandiTable";
import RevenueCalculator from "@/components/RevenueCalculator";
import { MandiRecord, MandiResponse } from "@/lib/mandi";
import { CROPS } from "@/data/crops";
import { getUserSession } from "@/lib/auth-storage";
import {
  TrendingUp,
  MapPin,
  RefreshCw,
  Coins,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function MandiPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Lucknow");
  const [mandiData, setMandiData] = useState<MandiResponse | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sp_cached_mandi_data");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });
  const [selectedMandi, setSelectedMandi] = useState<MandiRecord | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sp_cached_mandi_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.records && parsed.records.length > 0) return parsed.records[0];
        }
      } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("sp_cached_mandi_data");
    }
    return true;
  });

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const fetchPrices = async (crop: string, district: string) => {
    try {
      if (!mandiData) setLoading(true);
      const res = await fetch(
        `/api/mandi?state=UP&district=${encodeURIComponent(
          district
        )}&crop=${encodeURIComponent(crop)}`
      );
      if (res.ok) {
        const data: MandiResponse = await res.json();
        setMandiData(data);
        try {
          sessionStorage.setItem("sp_cached_mandi_data", JSON.stringify(data));
        } catch (e) {}
        if (data.records && data.records.length > 0) {
          // Set highest price mandi as selected by default
          const sorted = [...data.records].sort(
            (a, b) => b.modal_price - a.modal_price
          );
          setSelectedMandi(sorted[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch mandi prices:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(selectedCrop, selectedDistrict);
  }, [selectedCrop, selectedDistrict]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>{locale === "hi" ? "दैनिक कृषि उपज भाव" : "Daily Mandi Market Rates"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t("mandi.title")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          {t("mandi.subtitle")}
        </p>
      </div>

      {/* Control Bar: Crop & District Selection */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Crop Select */}
        <div className="space-y-1.5 flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t("mandi.select_crop")}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-base font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px]"
          >
            {CROPS.map((c) => (
              <option key={c.key} value={c.name_en}>
                {c.icon} {locale === "hi" ? c.name_hi : `${c.name_en} (${c.name_hi})`}
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div className="space-y-1.5 flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t("mandi.select_district")}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-base font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px]"
          >
            <option value="Lucknow">📍 लखनऊ (Lucknow)</option>
            <option value="Sitapur">📍 सीतापुर (Sitapur)</option>
            <option value="Barabanki">📍 बाराबंकी (Barabanki)</option>
            <option value="Unnao">📍 उन्नाव (Unnao)</option>
            <option value="Hardoi">📍 हरदोई (Hardoi)</option>
          </select>
        </div>
      </div>

      {/* Data Source Status Badge */}
      {mandiData && (
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between gap-3 text-xs sm:text-sm ${
            mandiData.source === "gov_api"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
              : mandiData.source === "mock"
              ? "bg-blue-50 border-blue-200 text-blue-900 font-semibold"
              : "bg-amber-50 border-amber-200 text-amber-900 font-semibold"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {mandiData.source === "gov_api" ? (
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-extrabold text-sm">
                {mandiData.source === "gov_api"
                  ? locale === "hi"
                    ? "🟢 लाइव सरकारी Agmarknet API डेटा"
                    : "🟢 Live Government Agmarknet Data"
                  : mandiData.source === "mock"
                  ? locale === "hi"
                    ? "🟡 मॉक डेटा मोड (ENV: USE_LIVE_MANDI_API=false)"
                    : "🟡 Mock Data Mode (ENV: USE_LIVE_MANDI_API=false)"
                  : locale === "hi"
                  ? "🟠 सरकारी मंडी सर्वर बैकअप डेटा (Agmarknet Live Fallback)"
                  : "🟠 Government Agmarknet Fallback Dataset"}
              </p>
              {mandiData.message && (
                <p className="text-xs opacity-80 mt-0.5">{mandiData.message}</p>
              )}
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 border shrink-0">
            {mandiData.source.toUpperCase()}
          </span>
        </div>
      )}

      {/* Main Grid: Mandi Rates Table & Revenue Calculator */}
      {loading ? (
        <div className="p-12 text-center bg-white/80 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="font-bold text-base">
            {locale === "hi" ? "मंडी भाव लोड हो रहे हैं..." : "Fetching latest mandi rates..."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Comparison Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {locale === "hi" ? "नजदीकी मंडियों के आज के भाव" : "Today's Mandi Market Rates"}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {locale === "hi" ? "क्लिक करके चुनें" : "Tap row to calculate revenue"}
              </span>
            </div>

            <MandiTable
              records={mandiData?.records || []}
              selectedMandi={selectedMandi}
              onSelectMandi={(m) => setSelectedMandi(m)}
            />
          </div>

          {/* Section 2: Revenue Calculator */}
          <RevenueCalculator
            records={mandiData?.records || []}
            selectedMandi={selectedMandi}
          />
        </div>
      )}
    </div>
  );
}
