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
        // Clear any old legacy cache with mock data
        sessionStorage.removeItem("sp_cached_mandi_data");
        const cached = sessionStorage.getItem("sp_agmarknet_mandi_v2");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.source !== "mock") return parsed;
        }
      } catch (e) {}
    }
    return null;
  });
  const [selectedMandi, setSelectedMandi] = useState<MandiRecord | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sp_agmarknet_mandi_v2");
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
      return !sessionStorage.getItem("sp_agmarknet_mandi_v2");
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
          sessionStorage.setItem("sp_agmarknet_mandi_v2", JSON.stringify(data));
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
    <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 pt-4 sm:pt-8 space-y-5 sm:space-y-8 w-full min-w-0">
      {/* Page Header */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>{locale === "hi" ? "दैनिक कृषि उपज भाव" : "Daily Mandi Market Rates"}</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight break-words">
          {t("mandi.title")}
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl">
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
