"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import DiagnosisCard from "@/components/DiagnosisCard";
import {
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MyReportsPage() {
  const { t, locale } = useI18n();
  const [reports, setReports] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("sp_cached_my_reports");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  const [schemeApps, setSchemeApps] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("panchayat_scheme_applications");
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<"diagnoses" | "schemes">("diagnoses");
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("sp_cached_my_reports");
    }
    return true;
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports?limit=20");
        if (res.ok) {
          const data = await res.json();
          if (data.reports) {
            setReports(data.reports);
            try {
              sessionStorage.setItem("sp_cached_my_reports", JSON.stringify(data.reports));
            } catch (e) {}
          }
        }

        // Load Scheme applications from localStorage
        try {
          const stored = localStorage.getItem("panchayat_scheme_applications");
          if (stored) {
            setSchemeApps(JSON.parse(stored));
          }
        } catch (e) {
          console.warn("Error loading stored schemes:", e);
        }
      } catch (e) {
        console.warn("Error loading reports:", e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === "hi" ? "इतिहास व रिकॉर्ड" : "History & Records"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("nav.my_reports")}
        </h1>
        <p className="text-sm text-slate-600">
          {locale === "hi"
            ? "आपके द्वारा अब तक की गई सभी फसलों की जाँच और सरकारी योजना आवेदनों की स्थिति।"
            : "Review your past crop health checks and welfare scheme applications status."}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("diagnoses")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "diagnoses"
              ? "bg-white text-emerald-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {locale === "hi" ? `🌱 फसल रोग जांच (${reports.length})` : `🌱 Crop Diagnoses (${reports.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schemes")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "schemes"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {locale === "hi" ? `📜 योजना आवेदन (${schemeApps.length})` : `📜 Scheme Applications (${schemeApps.length})`}
        </button>
      </div>

      {activeTab === "schemes" ? (
        /* Scheme Applications List */
        schemeApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white/80 rounded-3xl border border-emerald-100 space-y-3">
            <p className="font-bold text-base">
              {locale === "hi" ? "अभी तक कोई सरकारी योजना आवेदन नहीं किया गया है।" : "No welfare scheme applications submitted yet."}
            </p>
            <p className="text-xs text-slate-400">
              {locale === "hi"
                ? "सरकारी योजनाएं पेज पर जाकर PM-KISAN, KCC या सोलर पंप हेतु सीधे आवेदन करें।"
                : "Visit the Govt Schemes page to apply for PM-KISAN, KCC or Solar Pump schemes."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schemeApps.map((app) => {
              const isPending = app.status.includes("Under Verification");
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-100/90 shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {app.id}
                        </span>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          {app.scheme_name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        📍 {app.applicant_name} • {app.village}, {app.district} • खतौनी: {app.khata_number} ({app.land_area})
                      </p>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${
                        isPending
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border-emerald-300"
                      }`}
                    >
                      {isPending
                        ? locale === "hi"
                          ? "⏳ ग्राम पंचायत स्तर पर सत्यापन चालू"
                          : "⏳ Gram Panchayat Verification in Progress"
                        : locale === "hi"
                        ? "✓ कृषि अधिकारी द्वारा सत्यापित व मुख्य पोर्टल को प्रेषित"
                        : "✓ Verified & Forwarded to Central PM-Kisan Portal"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {locale === "hi" ? "आवेदन तिथि: " : "Submitted on: "}
                      {new Date(app.submitted_at).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN")}
                    </span>

                    <a
                      href="https://pmkisan.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-extrabold hover:underline"
                    >
                      {locale === "hi" ? "मुख्य पोर्टल स्थिति →" : "Check Central Portal →"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : loading ? (
        <div className="p-12 text-center text-slate-500 bg-white/80 rounded-3xl border border-emerald-100">
          <p className="font-bold text-base">
            {locale === "hi" ? "रिपोर्ट लोड हो रही हैं..." : "Loading diagnostic reports..."}
          </p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white/80 rounded-3xl border border-emerald-100 space-y-3">
          <p className="font-bold text-base">
            {locale === "hi" ? "कोई पूर्व रिपोर्ट नहीं मिली।" : "No reports logged yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <div
                key={report.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100/90 shadow-md overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3.5 rounded-2xl shrink-0 ${
                        report.is_healthy
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {report.is_healthy ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Stethoscope className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                          {report.diagnosis?.crop_name_hi || report.crop_key}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            report.is_healthy
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {report.is_healthy
                            ? locale === "hi"
                              ? "स्वस्थ फसल"
                              : "Healthy"
                            : report.diagnosis?.disease_name_hi || "रोगग्रस्त"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {report.village || "लखनऊ"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.created_at).toLocaleDateString("hi-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? (locale === "hi" ? "छुपाएं" : "Collapse") : (locale === "hi" ? "पूरा विवरण देखें" : "View Report")}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded full diagnosis card */}
                {isExpanded && report.diagnosis && (
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
                    <DiagnosisCard diagnosis={report.diagnosis} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
