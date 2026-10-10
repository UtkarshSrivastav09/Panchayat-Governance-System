"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { OutbreakCluster } from "@/components/OutbreakMap";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import { getUserSession, UserProfile } from "@/lib/auth-storage";

export default function OfficerDashboardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [schemeApps, setSchemeApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = getUserSession();
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "officer") {
        router.replace("/dashboard");
        return;
      }
      setCurrentUser(user);

      // Load Scheme Applications from local storage (or seed initial realistic applications)
      try {
        const stored = localStorage.getItem("panchayat_scheme_applications");
        if (stored) {
          setSchemeApps(JSON.parse(stored));
        } else {
          const sample = [
            {
              id: "UP-GS-2026-894120",
              scheme_id: "pm-kisan",
              scheme_name: locale === "hi" ? "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)" : "PM Kisan Samman Nidhi (PM-KISAN)",
              applicant_name: "रामेश्वर सिंह",
              phone: "9876543210",
              village: "मलिहाबाद",
              district: "Lucknow",
              aadhaar: "XXXX-XXXX-4819",
              land_area: "2.5 एकड़",
              khata_number: "142/08",
              submitted_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              status: "Under Verification (Gram Panchayat)",
            },
            {
              id: "UP-GS-2026-341902",
              scheme_id: "up-kisan-credit-card",
              scheme_name: locale === "hi" ? "किसान क्रेडिट कार्ड (KCC)" : "Kisan Credit Card (KCC)",
              applicant_name: "सुरेश यादव",
              phone: "9812345678",
              village: "मलिहाबाद",
              district: "Lucknow",
              aadhaar: "XXXX-XXXX-9102",
              land_area: "3.2 एकड़",
              khata_number: "88/14",
              submitted_at: new Date(Date.now() - 3600000 * 5).toISOString(),
              status: "Under Verification (Gram Panchayat)",
            }
          ];
          localStorage.setItem("panchayat_scheme_applications", JSON.stringify(sample));
          setSchemeApps(sample);
        }
      } catch (err) {
        console.warn("Error loading scheme applications:", err);
      }

      const res = await fetch("/api/outbreaks");
      if (res.ok) {
        const data = await res.json();
        if (data.clusters) {
          setClusters(data.clusters);
        }
      }
    } catch (e) {
      console.warn("Failed to load officer data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    clusterKey: string,
    status: "verified" | "resolved"
  ) => {
    try {
      setUpdatingKey(clusterKey);
      const note = notes[clusterKey] || "";

      const res = await fetch(`/api/outbreaks/${encodeURIComponent(clusterKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });

      if (res.ok) {
        // Update local state immediately
        setClusters((prev) =>
          prev.map((c) =>
            c.cluster_key === clusterKey ? { ...c, status, note } : c
          )
        );
        alert(
          locale === "hi"
            ? `क्लस्टर स्थिति सफलतापूर्वक '${status === "verified" ? "सत्यापित" : "समाधानित"}' में बदली गई!`
            : `Cluster updated to ${status}!`
        );
      }
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleVerifySchemeApplication = (appId: string) => {
    const updated = schemeApps.map((app) => {
      if (app.id === appId) {
        return {
          ...app,
          status: "Verified by Officer & Forwarded to PM-Kisan State Nodal Desk",
          verified_by: currentUser?.full_name || "कृषि रक्षा अधिकारी (HQ)",
          verified_at: new Date().toISOString(),
        };
      }
      return app;
    });
    setSchemeApps(updated);
    try {
      localStorage.setItem("panchayat_scheme_applications", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage update error:", e);
    }
    alert(
      locale === "hi"
        ? `आवेदन ${appId} सत्यापित कर मुख्य राज्य/केंद्रीय पोर्टल को अग्रसारित कर दिया गया!`
        : `Application ${appId} successfully verified & forwarded to State/Central Portal!`
    );
  };

  const activeCount = clusters.filter((c) => c.status !== "resolved").length;
  const verifiedCount = clusters.filter((c) => c.status === "verified").length;
  const totalReportsCount = clusters.reduce((acc, c) => acc + (c.report_count || 0), 0);
  const pendingSchemeAppsCount = schemeApps.filter((a) => a.status.includes("Under Verification")).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              <Shield className="w-3.5 h-3.5" />
              <span>{currentUser?.designation || (locale === "hi" ? "कृषि रक्षा अधिकारी" : "Agriculture Officer")}</span>
            </span>
            <span className="text-xs text-slate-300">
              {currentUser?.department || "उत्तर प्रदेश कृषि रक्षा विभाग"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentUser?.full_name ? `${currentUser.full_name} - ${t("officer.title")}` : t("officer.title")}
          </h1>
          <p className="text-sm text-slate-300">
            {t("officer.subtitle")}
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{locale === "hi" ? "ताज़ा करें" : "Refresh"}</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-rose-100 shadow-md">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            {t("officer.stats_active_outbreaks")}
          </div>
          <div className="text-3xl font-black text-rose-600 mt-1">
            {activeCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "hi" ? "त्वरित क्षेत्रीय निरीक्षण आवश्यक" : "Requires field verification"}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-emerald-100 shadow-md">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {t("officer.stats_verified")}
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {verifiedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "hi" ? "गाँव में अलर्ट जारी किया गया" : "Broadcasted to local farmers"}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-blue-100 shadow-md">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {locale === "hi" ? "लंबित योजना आवेदन" : "Scheme Applications Pending"}
          </div>
          <div className="text-3xl font-black text-blue-600 mt-1">
            {pendingSchemeAppsCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "hi" ? "सत्यापन व अग्रसारण हेतु तैयार" : "Awaiting verification & forwarding"}
          </p>
        </div>
      </div>

      {/* Section 1: Welfare Scheme Applications Verification Desk */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/80 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                {locale === "hi" ? "ग्राम पंचायत सत्यापन डेस्क" : "Gram Panchayat Verification"}
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {schemeApps.length} {locale === "hi" ? "आवेदन कुल दर्ज" : "Total Applications"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>{locale === "hi" ? "किसान कल्याण योजना सत्यापन डेस्क" : "Farmer Scheme Applications Verification"}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {locale === "hi"
                ? "ग्राम स्तर से किसानों द्वारा भरे गए आवेदनों (PM-Kisan, KCC, सोलर पंप) की खतौनी व पात्रता जांच कर मुख्य पोर्टल को अग्रसारित करें।"
                : "Verify farmer land records, Aadhaar details, and eligibility before forwarding to the Central PM-Kisan / State portal."}
            </p>
          </div>
        </div>

        {schemeApps.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            {locale === "hi" ? "कोई लंबित योजना आवेदन नहीं है।" : "No pending scheme applications."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {schemeApps.map((app) => {
              const isPending = app.status.includes("Under Verification");
              return (
                <div key={app.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border">
                          {app.id}
                        </span>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {app.applicant_name} ({app.village}, {app.district})
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          📞 {app.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="font-bold text-emerald-800">
                          🏛️ {app.scheme_name}
                        </span>
                        <span>• भूमि: {app.land_area}</span>
                        <span>• खाता/गाटा: {app.khata_number}</span>
                        <span>• आधार: {app.aadhaar}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {isPending
                          ? locale === "hi"
                            ? "⏳ सत्यापन लंबित"
                            : "⏳ Pending Verification"
                          : locale === "hi"
                          ? "✓ सत्यापित व मुख्य पोर्टल को प्रेषित"
                          : "✓ Verified & Forwarded to Central Portal"}
                      </span>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleVerifySchemeApplication(app.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all whitespace-nowrap"
                        >
                          {locale === "hi" ? "सत्यापित कर मुख्य पोर्टल भेजें" : "Verify & Forward"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cluster Review Action List */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {locale === "hi" ? "बीमारी क्लस्टर समीक्षा एवं सत्यापन" : "Disease Cluster Review & Actions"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {locale === "hi"
              ? "अधिकारी यहाँ से मौके की पुष्टि करके क्लस्टर को 'सत्यापित' या 'समाधानित' कर सकते हैं।"
              : "Verify outbreaks after physical field check or resolve after spray distribution."}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="font-bold">{locale === "hi" ? "डेटा लोड हो रहा है..." : "Loading clusters..."}</p>
          </div>
        ) : clusters.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            {locale === "hi" ? "कोई सक्रिय क्लस्टर नहीं मिला।" : "No active disease clusters found."}
          </div>
        ) : (
          <div className="space-y-6">
            {clusters.map((cluster) => {
              const isUpdating = updatingKey === cluster.cluster_key;
              return (
                <div
                  key={cluster.cluster_key}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-slate-900">
                          {cluster.disease_name_hi || cluster.disease_key}
                        </span>
                        <span className="text-xs text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border">
                          {cluster.crop_name_hi || cluster.crop_key}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 केंद्र निर्देशांक: {cluster.center_lat.toFixed(4)}, {cluster.center_lng.toFixed(4)} • अंतिम रिपोर्ट: {new Date(cluster.latest_report).toLocaleDateString("hi-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                        👥 {cluster.farmer_count} {locale === "hi" ? "किसान" : "Farmers"} ({cluster.report_count} {locale === "hi" ? "रिपोर्ट" : "Reports"})
                      </span>
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                          cluster.status === "verified"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : cluster.status === "resolved"
                            ? "bg-slate-200 text-slate-700 border-slate-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {cluster.status === "verified"
                          ? t("outbreaks.status_verified")
                          : cluster.status === "resolved"
                          ? t("outbreaks.status_resolved")
                          : t("outbreaks.status_open")}
                      </span>
                    </div>
                  </div>

                  {/* Officer advisory input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      {locale === "hi" ? "अधिकारी की टिप्पणी / कृषि सलाह:" : "Officer Advisory / Notes:"}
                    </label>
                    <textarea
                      rows={2}
                      defaultValue={cluster.note || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [cluster.cluster_key]: e.target.value })
                      }
                      placeholder={t("officer.action_note_placeholder")}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Officer Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(cluster.cluster_key, "verified")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all min-h-[44px]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t("outbreaks.verify_action")}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(cluster.cluster_key, "resolved")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all min-h-[44px]"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{t("outbreaks.resolve_action")}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
