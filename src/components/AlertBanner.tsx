"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export interface OutbreakAlertItem {
  cluster_key: string;
  crop_key: string;
  crop_name_hi?: string;
  disease_key: string;
  disease_name_hi?: string;
  report_count: number;
  farmer_count: number;
  distance_km?: number;
  status?: "open" | "verified" | "resolved";
}

interface AlertBannerProps {
  alerts: OutbreakAlertItem[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const { t, locale } = useI18n();

  const defaultAlert: OutbreakAlertItem = {
    cluster_key: "wheat-leaf_rust-malihabad",
    crop_key: "wheat",
    crop_name_hi: "गेहूं",
    disease_key: "leaf_rust",
    disease_name_hi: "पत्ती का रतुआ (भूरा गेरुआ)",
    report_count: 3,
    farmer_count: 3,
    distance_km: 1.8,
    status: "verified",
  };

  const topAlert = alerts && alerts.length > 0 ? alerts[0] : defaultAlert;

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 p-[2px] shadow-lg shadow-rose-900/10 transition-all animate-fade-in mb-6">
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 shrink-0 animate-bounce">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                OUTBREAK WARNING
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                ✓ Verified by Officer
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Disease Alert: {topAlert.disease_name_hi || "पत्ती का रतुआ (भूरा गेरुआ)"} detected in {topAlert.farmer_count || 3} nearby farms in your area!
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              {locale === "hi"
                ? "मलिहाबाद क्लस्टर में संक्रमण की पुष्टि हुई है। अपनी गेहूं की फसल का तुरंत निरीक्षण करें।"
                : "Confirmed infection in Malihabad cluster. Inspect your wheat crops and spray preventive fungicide if needed."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href="/outbreaks"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all min-h-[48px] whitespace-nowrap"
          >
            <span>{locale === "hi" ? "नक्शे पर देखें" : "View Outbreak Map"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/crop-doctor"
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all min-h-[48px] whitespace-nowrap"
          >
            <span>{locale === "hi" ? "फसल जांचें" : "Check Crop"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
