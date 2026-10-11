"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getLocalizedDiseaseName } from "@/data/crops";

export interface OutbreakAlertItem {
  cluster_key: string;
  crop_key: string;
  crop_name_hi?: string;
  crop_name_en?: string;
  disease_key: string;
  disease_name_hi?: string;
  disease_name_en?: string;
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
    crop_name_en: "Wheat",
    disease_key: "leaf_rust",
    disease_name_hi: "पत्ती का रतुआ (भूरा गेरुआ)",
    disease_name_en: "Leaf Rust (Brown Rust)",
    report_count: 3,
    farmer_count: 3,
    distance_km: 1.8,
    status: "verified",
  };

  const topAlert = alerts && alerts.length > 0 ? alerts[0] : defaultAlert;
  const diseaseTitle =
    locale === "en"
      ? (topAlert.disease_name_en || getLocalizedDiseaseName(topAlert.crop_key, topAlert.disease_key, "en"))
      : (topAlert.disease_name_hi || getLocalizedDiseaseName(topAlert.crop_key, topAlert.disease_key, "hi"));

  return (
    <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 p-[2px] shadow-lg shadow-rose-900/10 transition-all animate-fade-in mb-4 sm:mb-6">
      <div className="bg-white/95 backdrop-blur-md rounded-[18px] sm:rounded-[22px] p-3 sm:p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
        <div className="flex items-start gap-2.5 sm:gap-4 min-w-0 flex-1 w-full">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-100 text-rose-700 shrink-0">
            <ShieldAlert className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                {locale === "hi" ? "संक्रमण चेतावनी" : "OUTBREAK WARNING"}
              </span>
              <span className="text-[9px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                {locale === "hi" ? "✓ अधिकारी द्वारा सत्यापित" : "✓ Verified by Officer"}
              </span>
            </div>

            <h3 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 leading-snug break-words">
              {locale === "hi"
                ? `रोग चेतावनी: आपके क्षेत्र में ${topAlert.farmer_count || 3} पास के खेतों में ${diseaseTitle} पाया गया!`
                : `Disease Alert: ${diseaseTitle} detected in ${topAlert.farmer_count || 3} nearby farms in your area!`}
            </h3>

            <p className="text-[11px] sm:text-sm text-slate-600 mt-0.5 sm:mt-1 leading-relaxed break-words">
              {locale === "hi"
                ? "मलिहाबाद क्लस्टर में संक्रमण की पुष्टि हुई है। अपनी गेहूं की फसल का तुरंत निरीक्षण करें और आवश्यकतानुसार फफूंदनाशक छिड़कें।"
                : "Confirmed infection in Malihabad cluster. Inspect your wheat crops and spray preventive fungicide if needed."}
            </p>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <Link
            href="/outbreaks"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all min-h-[38px] sm:min-h-[44px] text-center"
          >
            <span>{locale === "hi" ? "नक्शे पर देखें" : "View Outbreak Map"}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </Link>

          <Link
            href="/crop-doctor"
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all min-h-[38px] sm:min-h-[44px] text-center"
          >
            <span>{locale === "hi" ? "फसल जांचें" : "Check Crop"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
