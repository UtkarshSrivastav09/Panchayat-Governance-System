"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { OutbreakCluster } from "@/components/OutbreakMap";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  Building2,
  Coins,
  Hammer,
} from "lucide-react";

import { getUserSession, UserProfile } from "@/lib/auth-storage";
import { getLocalizedCropName, getLocalizedDiseaseName } from "@/data/crops";

export default function OfficerDashboardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [schemeApps, setSchemeApps] = useState<any[]>([]);
  const [villageWorks, setVillageWorks] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
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

      // Load Scheme Applications from /api/schemes and local storage
      try {
        let apiApplications: any[] = [];
        try {
          const schemeRes = await fetch("/api/schemes");
          if (schemeRes.ok) {
            const sData = await schemeRes.json();
            if (sData.applications) apiApplications = sData.applications;
          }
        } catch {}

        let localApplications: any[] = [];
        try {
          const stored = localStorage.getItem("panchayat_scheme_applications");
          if (stored) localApplications = JSON.parse(stored);
        } catch {}

        // Merge without duplicate IDs
        const appMap = new Map();
        [...localApplications, ...apiApplications].forEach((app) => {
          if (!appMap.has(app.id)) {
            appMap.set(app.id, app);
          }
        });
        const combined = Array.from(appMap.values());
        setSchemeApps(combined);
        try {
          localStorage.setItem("panchayat_scheme_applications", JSON.stringify(combined));
        } catch {}
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

      // Fetch village works and citizen grievances
      try {
        const vRes = await fetch("/api/village-development?block=Malihabad");
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.projects) setVillageWorks(vData.projects);
          if (vData.grievances) setGrievances(vData.grievances);
        }
      } catch (vErr) {
        console.warn("Failed to load village works:", vErr);
      }
    } catch (e) {
      console.warn("Failed to load officer data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh when farmer submits new application in another tab or window
    const handleSync = () => loadData();
    window.addEventListener("panchayat_scheme_submitted", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("panchayat_scheme_submitted", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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

  const handleVerifySchemeApplication = async (
    appId: string,
    decision: "approve" | "reject" = "approve",
    customReason?: string
  ) => {
    const isApprove = decision === "approve";
    const newStatus = isApprove
      ? "Verified by Officer & Forwarded to State/Central Portal"
      : "Correction Required (Rejected by Officer)";
    const officerName = currentUser?.full_name || (locale === "hi" ? "कृषि रक्षा अधिकारी (HQ)" : "Agriculture Officer (HQ)");
    const note = customReason || (isApprove
      ? "भूमि व पात्रता सत्यापन पूर्ण। मुख्य पोर्टल को अग्रसारित।"
      : "भूलेख विवरण (खतौनी/आधार) में त्रुटि पाई गई - संशोधन अपेक्षित।");

    // 1. Sync with API
    try {
      await fetch("/api/schemes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          action: isApprove ? "approve_and_forward" : "reject",
          officer_name: officerName,
          officer_notes: note,
        }),
      });
    } catch (e) {
      console.warn("API patch error:", e);
    }

    // 2. Update local state & localStorage
    const updated = schemeApps.map((app) => {
      if (app.id === appId) {
        return {
          ...app,
          status: newStatus,
          verified_by: officerName,
          verified_at: new Date().toISOString(),
          officer_notes: note,
        };
      }
      return app;
    });

    setSchemeApps(updated);
    try {
      localStorage.setItem("panchayat_scheme_applications", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Storage update error:", e);
    }

    alert(
      isApprove
        ? locale === "hi"
          ? `✓ आवेदन ${appId} सत्यापित कर मुख्य राज्य/केंद्रीय पोर्टल को सफलतापूर्वक प्रेषित कर दिया गया!`
          : `✓ Application ${appId} successfully verified & forwarded to State/Central Portal!`
        : locale === "hi"
          ? `✕ आवेदन ${appId} में त्रुटि दर्ज की गई। किसान को संशोधन हेतु सूचित कर दिया गया।`
          : `✕ Application ${appId} flagged for correction. Notification recorded.`
    );
  };

  const activeCount = clusters.filter((c) => c.status !== "resolved").length;
  const verifiedCount = clusters.filter((c) => c.status === "verified").length;
  const totalReportsCount = clusters.reduce((acc, c) => acc + (c.report_count || 0), 0);
  const pendingSchemeAppsCount = schemeApps.filter((a) => a.status.includes("Under Verification")).length;

  return (
    <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 pt-4 sm:pt-8 space-y-5 sm:space-y-8 w-full min-w-0">
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black">
              <Shield className="w-3.5 h-3.5" />
              <span>{currentUser?.designation || (locale === "hi" ? "कृषि रक्षा अधिकारी" : "Agriculture Officer")}</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-300">
              {currentUser?.department || "उत्तर प्रदेश कृषि रक्षा विभाग"}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight break-words">
            {currentUser?.full_name ? `${currentUser.full_name} - ${t("officer.title")}` : t("officer.title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
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

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : app.status.includes("Correction") || app.status.includes("Rejected")
                            ? "bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {isPending
                          ? locale === "hi"
                            ? "⏳ सत्यापन लंबित"
                            : "⏳ Pending Verification"
                          : app.status.includes("Correction") || app.status.includes("Rejected")
                          ? locale === "hi"
                            ? "✕ संशोधन अपेक्षित (अस्वीकृत)"
                            : "✕ Correction Required"
                          : locale === "hi"
                          ? "✓ सत्यापित व मुख्य पोर्टल को प्रेषित"
                          : "✓ Verified & Forwarded to Central Portal"}
                      </span>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerifySchemeApplication(app.id, "approve")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all whitespace-nowrap"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{locale === "hi" ? "✓ सही है (अग्रेसित करें)" : "✓ Verify & Forward"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt(
                                locale === "hi"
                                  ? "त्रुटि का कारण दर्ज करें (उदा. खतौनी में नाम भिन्न / अधूरा आधार):"
                                  : "Reason for rejection / correction:"
                              );
                              if (reason !== null) {
                                handleVerifySchemeApplication(app.id, "reject", reason || undefined);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs active:scale-95 transition-all whitespace-nowrap"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{locale === "hi" ? "✕ त्रुटि / संशोधन" : "✕ Reject / Correction"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Officer feedback note if reviewed */}
                  {app.officer_notes && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                      <strong>{locale === "hi" ? "अधिकारी की टिप्पणी:" : "Officer Note:"}</strong> {app.officer_notes}
                    </div>
                  )}
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
                          {locale === "en"
                            ? (cluster.disease_name_en || getLocalizedDiseaseName(cluster.crop_key, cluster.disease_key, "en"))
                            : (cluster.disease_name_hi || getLocalizedDiseaseName(cluster.crop_key, cluster.disease_key, "hi"))}
                        </span>
                        <span className="text-xs text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border">
                          {locale === "en"
                            ? (cluster.crop_name_en || getLocalizedCropName(cluster.crop_key, "en"))
                            : (cluster.crop_name_hi || getLocalizedCropName(cluster.crop_key, "hi"))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {locale === "hi"
                          ? `📍 केंद्र निर्देशांक: ${cluster.center_lat.toFixed(4)}, ${cluster.center_lng.toFixed(4)} • अंतिम रिपोर्ट: ${new Date(cluster.latest_report).toLocaleDateString("hi-IN")}`
                          : `📍 Center Coords: ${cluster.center_lat.toFixed(4)}, ${cluster.center_lng.toFixed(4)} • Latest Report: ${new Date(cluster.latest_report).toLocaleDateString("en-IN")}`}
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

      {/* Section 3: Gram Panchayat Public Works & Citizen Grievances Audit Desk */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/80 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-700 text-white px-2.5 py-0.5 rounded-full">
                {locale === "hi" ? "ई-ग्रामस्वराज अनुश्रवण" : "e-GramSwaraj Audit"}
              </span>
              <span className="text-xs font-bold text-indigo-900">
                {villageWorks.length} {locale === "hi" ? "कार्य सक्रिय" : "Active Public Works"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>{locale === "hi" ? "ग्राम पंचायत कार्य एवं नागरिक शिकायत निवारण डेस्क" : "Village Public Works & Citizen Grievances"}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {locale === "hi"
                ? "ग्राम प्रधानों द्वारा प्रस्तावित सड़क, नाली, सोलर लाइट कार्यों की प्रगति जांचें व ग्रामीणों द्वारा दर्ज शिकायतों का निस्तारण करें।"
                : "Monitor Pradhan-approved road and infrastructure works and inspect citizen quality grievances."}
            </p>
          </div>

          <a
            href="/village-development"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-bold text-xs transition-colors shrink-0"
          >
            <span>{locale === "hi" ? "सार्वजनिक ट्रैकर खोलें →" : "Open Public Tracker →"}</span>
          </a>
        </div>

        {/* Citizen Grievances List */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{locale === "hi" ? "नागरिकों द्वारा दर्ज की गई शिकायतें / ऑडिट रिपोर्ट:" : "Citizen Grievances & Quality Reports:"}</span>
          </h3>

          {grievances.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              {locale === "hi" ? "कोई लंबित नागरिक शिकायत नहीं है।" : "No pending citizen grievances."}
            </div>
          ) : (
            <div className="space-y-3">
              {grievances.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                        {g.id}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {g.citizen_name} (📞 {g.citizen_phone})
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        🏡 {g.village}
                      </span>
                    </div>

                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full w-fit">
                      {g.status === "resolved" ? "✓ निस्तारित" : "⚠️ जांच प्रक्रियाधीन"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">{locale === "hi" ? "परियोजना: " : "Project: "}</strong>
                    {g.project_title}
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    💬 &ldquo;{g.description}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(g.created_at).toLocaleDateString(locale === "en" ? "en-IN" : "hi-IN")}
                    </span>

                    <button
                      type="button"
                      onClick={() => alert(locale === "hi" ? `शिकायत ${g.id} पर अवर अभियंता को स्थलीय जांच आदेश प्रेषित किया गया!` : `Inspection order issued for ${g.id}!`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
                    >
                      {locale === "hi" ? "✓ स्थलीय जांच आदेश जारी करें" : "Issue Inspection Order"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
