"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import OutbreakMap, { OutbreakCluster } from "@/components/OutbreakMap";
import AlertBanner from "@/components/AlertBanner";
import { getUserSession } from "@/lib/auth-storage";
import { getLocalizedCropName, getLocalizedDiseaseName } from "@/data/crops";
import {
  MapPin,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Filter,
} from "lucide-react";

export default function OutbreaksPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [clusters, setClusters] = useState<OutbreakCluster[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sp_outbreaks_clusters");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("sp_outbreaks_clusters");
    }
    return true;
  });

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace("/login");
      return;
    }
    async function fetchOutbreaks() {
      try {
        const res = await fetch("/api/outbreaks");
        if (res.ok) {
          const data = await res.json();
          if (data.clusters) {
            setClusters(data.clusters);
            try {
              sessionStorage.setItem("sp_outbreaks_clusters", JSON.stringify(data.clusters));
            } catch (e) {}
          }
        }
      } catch (e) {
        console.warn("Outbreak map fetch failed:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOutbreaks();
  }, [router]);

  const filteredClusters = clusters.filter((c) => {
    if (selectedCrop === "all") return true;
    return c.crop_key === selectedCrop;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 pt-4 sm:pt-8 space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>{locale === "hi" ? "सामुदायिक रोग निगरानी" : "Community Disease Monitoring"}</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight break-words">
          {t("outbreaks.title")}
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl">
          {t("outbreaks.subtitle")}
        </p>
      </div>

      {/* Outbreak Alert Banner */}
      <AlertBanner alerts={clusters} />

      {/* Filter Strip */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>{locale === "hi" ? "फसल के अनुसार फिल्टर:" : "Filter by Crop:"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label_hi: "सभी फसलें", label_en: "All Crops" },
            { key: "wheat", label_hi: "🌾 गेहूं", label_en: "🌾 Wheat" },
            { key: "potato", label_hi: "🥔 आलू", label_en: "🥔 Potato" },
            { key: "mustard", label_hi: "🌼 सरसों", label_en: "🌼 Mustard" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedCrop(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                selectedCrop === item.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {locale === "hi" ? item.label_hi : item.label_en}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map */}
      <OutbreakMap clusters={filteredClusters} />

      {/* Detailed Cluster Table / List below Map */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-md space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg">
          {locale === "hi" ? "सक्रिय बीमारी क्लस्टरों की सूची" : "Active Outbreak Clusters"}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {filteredClusters.map((cluster) => {
            const diseaseTitle =
              locale === "en"
                ? (cluster.disease_name_en || getLocalizedDiseaseName(cluster.crop_key, cluster.disease_key, "en"))
                : (cluster.disease_name_hi || getLocalizedDiseaseName(cluster.crop_key, cluster.disease_key, "hi"));
            const cropTitle =
              locale === "en"
                ? (cluster.crop_name_en || getLocalizedCropName(cluster.crop_key, "en"))
                : (cluster.crop_name_hi || getLocalizedCropName(cluster.crop_key, "hi"));
            const noteText = locale === "en" ? (cluster.note_en || cluster.note) : cluster.note;

            return (
              <div
                key={cluster.cluster_key}
                className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {diseaseTitle}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      {cropTitle}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      cluster.status === "verified"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {cluster.status === "verified"
                      ? t("outbreaks.status_verified")
                      : t("outbreaks.status_open")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong>{cluster.farmer_count}</strong> {locale === "hi" ? "प्रभावित किसान" : "Farmers"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(cluster.latest_report).toLocaleDateString(locale === "en" ? "en-IN" : "hi-IN")}</span>
                  </div>
                </div>

                {noteText && (
                  <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium">
                    📢 {noteText}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center pt-2">
          ℹ️ {t("outbreaks.disclaimer")}
        </p>
      </div>
    </div>
  );
}
