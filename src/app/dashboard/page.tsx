"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AlertBanner, { OutbreakAlertItem } from "@/components/AlertBanner";
import {
  Stethoscope,
  MapPin,
  TrendingUp,
  FileText,
  CloudSun,
  Camera,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Droplets,
  Wind,
  Award,
  ChevronRight,
  Leaf,
  Sprout,
  Info,
  ExternalLink,
} from "lucide-react";

import { getUserSession, UserProfile } from "@/lib/auth-storage";
import { GOVT_SCHEMES, GovtScheme } from "@/data/schemes";
import SchemeApplicationModal from "@/components/SchemeApplicationModal";

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [alerts, setAlerts] = useState<OutbreakAlertItem[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<GovtScheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);

    // Fast instant hydration from sessionStorage (0ms) on tab switch
    try {
      const cachedAlerts = sessionStorage.getItem("cached_alerts");
      const cachedReports = sessionStorage.getItem("cached_reports");
      if (cachedAlerts) setAlerts(JSON.parse(cachedAlerts));
      if (cachedReports) setRecentReports(JSON.parse(cachedReports));
      if (cachedAlerts || cachedReports) setLoading(false);
    } catch {
      // Quiet
    }

    async function loadData() {
      try {
        const [outbreakRes, reportsRes] = await Promise.all([
          fetch("/api/outbreaks"),
          fetch("/api/reports?limit=4"),
        ]);

        if (outbreakRes.ok) {
          const outData = await outbreakRes.json();
          if (outData.clusters && outData.clusters.length > 0) {
            setAlerts(outData.clusters);
            try {
              sessionStorage.setItem("cached_alerts", JSON.stringify(outData.clusters));
            } catch {}
          }
        }

        if (reportsRes.ok) {
          const repData = await reportsRes.json();
          if (repData.reports) {
            setRecentReports(repData.reports);
            try {
              sessionStorage.setItem("cached_reports", JSON.stringify(repData.reports));
            } catch {}
          }
        }
      } catch (e) {
        console.warn("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 sm:pb-12 space-y-5 sm:space-y-8">
      
      {/* 1. Awesome Kisan Background Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/10 min-h-[280px] sm:min-h-[360px] flex flex-col justify-end p-4 sm:p-10 text-white">
        {/* Background Photograph of Indian Kisans */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/kisan-banner.jpg"
            alt="Indian farmers in agricultural fields"
            fill
            priority
            className="object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Rich Vignette and Agrarian Gradients for Perfect Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/75 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/50 to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                🌾 {locale === "hi" ? "उत्तर प्रदेश पंचायती राज" : "UP Panchayati Raj"}
              </span>
              <span className="text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20">
                📍 {currentUser?.village || "मलिहाबाद"}, {currentUser?.district || "लखनऊ"} (UP)
              </span>
            </div>

            <h1 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {locale === "hi"
                ? `नमस्ते, ${currentUser?.full_name || "किसान साथी"}!`
                : `Welcome, ${currentUser?.full_name || "Farmer"}!`}
            </h1>

            <p className="text-xs sm:text-base text-emerald-100 max-w-xl font-medium leading-relaxed drop-shadow">
              {locale === "hi"
                ? "आपकी रबी फसल की सुरक्षा के लिए एआई डॉक्टर, लाइव मंडी भाव और गाँव में बीमारी सतर्कता प्रणाली तैयार है।"
                : "AI crop diagnostics, real-time APMC mandi prices, and neighborhood outbreak surveillance ready for your farm."}
            </p>
          </div>

          {/* Real-time Weather & Micro-climate Widget */}
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-3.5 sm:p-5 border border-white/25 shadow-xl flex items-center gap-3 sm:gap-4 shrink-0 self-start lg:self-auto">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <CloudSun className="w-7 h-7" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                <span>26°C</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/80 text-white">
                  {locale === "hi" ? "साफ मौसम" : "Clear Sky"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-100 font-medium">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                  <span>62% {locale === "hi" ? "नमी" : "Humidity"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-200" />
                  <span>9 km/h {locale === "hi" ? "हवा" : "Wind"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Priority Outbreak Warning Banner */}
      <AlertBanner alerts={alerts} />

      {/* 3. Primary Core Services Grid (4 Interactive Tiles) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>{locale === "hi" ? "मुख्य किसान सेवाएं" : "Core Kisan Services"}</span>
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {locale === "hi" ? "24x7 सक्रिय" : "24x7 Active"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Crop Doctor */}
          <Link
            href="/crop-doctor"
            className="group relative bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  AI Vision
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t("crop_doctor.title")}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "पत्ते की फोटो खींचें, 2 सेकंड में बीमारी व सटीक जैविक दवा जानें।"
                    : "Upload leaf photo with voice notes for instant diagnosis & treatment."}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-extrabold text-xs">
              <span>{locale === "hi" ? "फसल जांचें →" : "Diagnose Crop →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Outbreak Radar Map */}
          <Link
            href="/outbreaks"
            className="group relative bg-white rounded-3xl p-6 border-2 border-rose-100 shadow-md hover:shadow-xl hover:border-rose-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "अलर्ट रडार" : "Live Radar"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                  {t("outbreaks.title")}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "आसपास के खेतों में फैल रही बीमारियों का नक्शा व सतर्कता संदेश।"
                    : "Interactive 10km radius infection cluster map for farmer privacy."}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-rose-700 font-extrabold text-xs">
              <span>{locale === "hi" ? "नक्शा खोलें →" : "View Outbreak Map →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Mandi Rates & Sell Helper */}
          <Link
            href="/mandi"
            className="group relative bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-md hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  APMC Live
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                  {t("mandi.title")}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "मलिहाबाद, लखनऊ व आसपास मंडियों के भाव और कमाई कैलकुलेटर।"
                    : "Real-time government market prices and net revenue estimator."}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-800 font-extrabold text-xs">
              <span>{locale === "hi" ? "भाव जांचें →" : "Check Rates →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: My Reports History */}
          <Link
            href="/my-reports"
            className="group relative bg-white rounded-3xl p-6 border-2 border-teal-100 shadow-md hover:shadow-xl hover:border-teal-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "इतिहास" : "History"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                  {t("nav.my_reports")}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "आपके द्वारा जांची गई फसलों का रिकॉर्ड व रोग सुधार स्थिति।"
                    : "Archived crop diagnoses, treatment logs and recovery history."}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-teal-700 font-extrabold text-xs">
              <span>{locale === "hi" ? "रिकॉर्ड देखें →" : "View History →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Government Schemes & Direct Benefits (Kisan Kalyan Portal) */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200/90 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white px-2.5 py-0.5 rounded-full">
                {locale === "hi" ? "उत्तर प्रदेश शासन" : "Govt of Uttar Pradesh"}
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {locale === "hi" ? "प्रत्यक्ष लाभ अंतरण (DBT)" : "Direct Benefit Transfer (DBT)"}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-700" />
              <span>{locale === "hi" ? "किसान कल्याण एवं सरकारी योजनाएं" : "Government Schemes & Welfare"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {locale === "hi"
                ? "ग्राम स्तर पर सभी सक्रिय एवं आगामी योजनाओं की जानकारी व सीधे 1-क्लिक आवेदन"
                : "Village-level welfare schemes with eligibility criteria and direct digital application."}
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto shrink-0 whitespace-nowrap active:scale-95"
          >
            <span>{locale === "hi" ? "सभी योजनाएं व आवेदन देखें" : "View All Schemes & Apply"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Featured Scheme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scheme 1: PM-KISAN */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-400 shadow-sm transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  PM-KISAN
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "🟢 सक्रिय (Active)" : "🟢 Active / Live"}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {locale === "hi" ? "पीएम किसान सम्मान निधि" : "PM Kisan Samman Nidhi"}
              </h4>
              <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                {locale === "hi" ? "₹6,000/वर्ष (18वीं किस्त जारी)" : "₹6,000/Year (18th Installment Live)"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "hi"
                  ? "₹2,000 की त्रैमासिक किस्त आधार लिंक खाते में अंतरित।"
                  : "Direct quarterly installment credited to Aadhaar linked bank account."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedSchemeForModal(GOVT_SCHEMES[0])}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {locale === "hi" ? "सीधे आवेदन करें" : "Direct Apply"}
              </button>
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={locale === "hi" ? "ऑफिशियल साइट" : "Official Portal"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Scheme 2: KCC Loan */}
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-100 hover:border-amber-400 shadow-sm transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  KCC LOAN
                </span>
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "4% ब्याज" : "4% Interest"}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {locale === "hi" ? "किसान क्रेडिट कार्ड (KCC)" : "Kisan Credit Card (KCC)"}
              </h4>
              <div className="text-xs font-extrabold text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                {locale === "hi" ? "₹3 लाख तक रियायती ऋण" : "Subsidized Loan up to ₹3 Lakh"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "hi"
                  ? "खाद, बीज व कीटनाशक हेतु समय पर सस्ता संस्थागत ऋण।"
                  : "Subsidized working capital up to ₹3 Lakh for inputs & operations."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedSchemeForModal(GOVT_SCHEMES[1])}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {locale === "hi" ? "सीधे आवेदन करें" : "Direct Apply"}
              </button>
              <a
                href="https://agricoop.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={locale === "hi" ? "ऑफिशियल साइट" : "Official Portal"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Scheme 3: PMFBY Insurance */}
          <div className="bg-white p-5 rounded-2xl border-2 border-rose-100 hover:border-rose-400 shadow-sm transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  PMFBY
                </span>
                <span className="text-[10px] font-black bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "बीमा सुरक्षा" : "Crop Insurance"}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {locale === "hi" ? "प्रधानमंत्री फसल बीमा योजना" : "PM Fasal Bima Yojana"}
              </h4>
              <div className="text-xs font-extrabold text-rose-800 bg-rose-50/70 p-2 rounded-xl border border-rose-100">
                {locale === "hi" ? "रबी प्रीमियम केवल 1.5%" : "Rabi Premium Only 1.5%"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "hi"
                  ? "ओलावृष्टि या कीट प्रकोप से फसल क्षति पर 72 घंटे में सूचना दें।"
                  : "Report crop loss within 72 hours for prompt claim settlement."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedSchemeForModal(GOVT_SCHEMES[2])}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {locale === "hi" ? "सीधे आवेदन करें" : "Direct Apply"}
              </button>
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={locale === "hi" ? "ऑफिशियल साइट" : "Official Portal"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Scheme 4: Solar Pump & Soil Health */}
          <div className="bg-white p-5 rounded-2xl border-2 border-teal-100 hover:border-teal-400 shadow-sm transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  PM-KUSUM
                </span>
                <span className="text-[10px] font-black bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                  {locale === "hi" ? "60% सब्सिडी" : "60% Subsidy"}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {locale === "hi" ? "पीएम-कुसुम सोलर पंप योजना" : "Solar Pump Scheme"}
              </h4>
              <div className="text-xs font-extrabold text-teal-800 bg-teal-50/70 p-2 rounded-xl border border-teal-100">
                {locale === "hi" ? "2 HP से 10 HP सोलर पंप" : "2 HP to 10 HP Solar Pumps"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "hi"
                  ? "दिन के समय निःशुल्क सौर ऊर्जा से सिंचाई, 60% सरकारी अनुदान।"
                  : "Zero diesel cost solar water pump with 60% capital grant."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedSchemeForModal(GOVT_SCHEMES[3])}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {locale === "hi" ? "सीधे आवेदन करें" : "Direct Apply"}
              </button>
              <a
                href="https://upagriculture.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={locale === "hi" ? "ऑफिशियल साइट" : "Official Portal"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Seasonal Rabi Crop Advisory (रबी फसल विशेष सलाह) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">
                {locale === "hi" ? "रबी फसल विशेष कृषि सलाह (लखनऊ मंडल)" : "Seasonal Rabi Crop Advisory"}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {new Date().toLocaleDateString("hi-IN", { month: "long", year: "numeric" })}
            </span>
          </div>

          <div className="space-y-3">
            {/* Wheat Advice */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                🌾
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-extrabold text-amber-950">
                  {locale === "hi" ? "गेहूं (Wheat) - कल्ले फूटने की अवस्था" : "Wheat - Tillering Stage Care"}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {locale === "hi"
                    ? "बुवाई के 21-25 दिन बाद पहली सिंचाई (CRI) अवश्य करें। पीला रतुआ से बचाव हेतु पत्तियों के नीचे नारंगी धब्बों की नियमित निगरानी करें।"
                    : "Apply crown root initiation (CRI) irrigation 21-25 days after sowing. Monitor leaf undersides for orange rust spots."}
                </p>
              </div>
            </div>

            {/* Mustard Advice */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0">
                🌼
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-extrabold text-emerald-950">
                  {locale === "hi" ? "सरसों (Mustard) - माहू (एफिड) कीट नियंत्रण" : "Mustard - Aphid Pest Management"}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {locale === "hi"
                    ? "बादल छाए रहने पर माहू कीट का प्रकोप तेजी से फैलता है। शुरुआती अवस्था में नीम तेल (1500 PPM) 3 मिली प्रति लीटर पानी का छिड़काव करें।"
                    : "Overcast weather accelerates aphid infestation. Spray 1500 PPM Neem oil (3 ml/L) at first onset."}
                </p>
              </div>
            </div>

            {/* Gram/Pulses Advice */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-200 text-teal-900 font-black text-xs flex items-center justify-center shrink-0">
                🌱
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-extrabold text-teal-950">
                  {locale === "hi" ? "चना एवं दलहन (Gram & Pulses) - फली छेदक सुरक्षा" : "Gram & Pulses - Pod Borer Defense"}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {locale === "hi"
                    ? "खेत में टी-आकार की खूंटियां (बर्ड पर्चर) 15-20 प्रति एकड़ लगाएं ताकि चिड़ियां कीटों को खा सकें।"
                    : "Install 15-20 T-shaped bird perches per acre in gram fields for natural biological caterpillar control."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kisan Toll-free Helpline & Officer Desk */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black">
              {locale === "hi" ? "किसान सहायता केंद्र" : "Kisan Call Center"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {locale === "hi"
                ? "किसी भी फसल बीमारी या सरकारी सहायता के लिए सीधे कृषि रक्षा विशेषज्ञ से बात करें।"
                : "Free telephone helpline directly connecting you with local agronomists."}
            </p>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                {locale === "hi" ? "टोल फ्री नंबर" : "TOLL FREE HELPLINE"}
              </span>
              <a
                href="tel:18001801551"
                className="text-2xl font-black text-white hover:text-emerald-300 transition-colors block tracking-wide"
              >
                1800-180-1551
              </a>
              <span className="text-[10px] text-slate-300 block">
                {locale === "hi" ? "सुबह 6:00 से रात 10:00 बजे तक (निःशुल्क)" : "6:00 AM to 10:00 PM (All Days)"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{locale === "hi" ? "कृषि विज्ञान केंद्र (KVK) लखनऊ" : "KVK Lucknow Affiliated"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{locale === "hi" ? "अधिकारी सत्यापन व क्लस्टर अलर्ट" : "Officer Verified Advisory"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Crop Diagnostics Activity */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-lg">
              {locale === "hi" ? "हाल की फसल जांच रिपोर्टें" : "Recent Diagnostic Reports"}
            </h3>
          </div>
          <Link
            href="/my-reports"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{locale === "hi" ? "सभी रिपोर्टें देखें" : "View All Reports"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {locale === "hi"
              ? "अभी तक कोई रिपोर्ट दर्ज नहीं की गई है। अपनी फसल की पहली जांच करने के लिए ऊपर 'फसल डॉक्टर' पर क्लिक करें।"
              : "No diagnostic reports logged yet. Click Crop Doctor above to run your first diagnosis."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="py-3.5 flex items-center justify-between gap-3 text-sm flex-wrap sm:flex-nowrap"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {report.diagnosis?.crop_name_hi || report.crop_key}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        report.is_healthy
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {report.is_healthy
                        ? locale === "hi"
                          ? "स्वस्थ"
                          : "Healthy"
                        : report.diagnosis?.disease_name_hi || "रोगग्रस्त"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    📍 {report.village || "मलिहाबाद, लखनऊ"} • {new Date(report.created_at).toLocaleDateString("hi-IN")}
                  </p>
                </div>

                <Link
                  href="/crop-doctor"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors shrink-0"
                >
                  {locale === "hi" ? "दवा विवरण देखें →" : "View Treatment →"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct In-App Fast Application Modal */}
      {selectedSchemeForModal && (
        <SchemeApplicationModal
          scheme={selectedSchemeForModal}
          currentUser={currentUser}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}

    </div>
  );
}
