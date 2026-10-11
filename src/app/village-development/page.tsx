"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getUserSession, UserProfile } from "@/lib/auth-storage";
import {
  VillageWorkProject,
  CitizenGrievance,
  STATE_DISTRICT_BLOCK_DATA,
  INITIAL_VILLAGE_PROJECTS,
  getPanchayatSignatories,
  getVillageProjectsForLocation,
  PanchayatSignatories,
} from "@/data/village-works";
import {
  Building2,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Shield,
  Coins,
  ChevronRight,
  Filter,
  UserCheck,
  Award,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
  Send,
  X,
  Droplets,
  Sun,
  Hammer,
} from "lucide-react";

type ProjectCategory = "all" | "road" | "solar" | "drainage" | "water" | "community";
type StatusFilter = "all" | "in_progress" | "completed" | "sanctioned";

export default function VillageDevelopmentPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") return getUserSession();
    return null;
  });

  // Location Hierarchy Selectors
  const [selectedState, setSelectedState] = useState<string>("Uttar Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Lucknow");
  const [selectedBlock, setSelectedBlock] = useState<string>("Malihabad");
  const [selectedVillage, setSelectedVillage] = useState<string>("Malihabad Khas");
  const [signatories, setSignatories] = useState<PanchayatSignatories>(() =>
    getPanchayatSignatories("Uttar Pradesh", "Lucknow", "Malihabad", "Malihabad Khas")
  );

  // Filters
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data & State
  const [projects, setProjects] = useState<VillageWorkProject[]>(INITIAL_VILLAGE_PROJECTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProjectForGrievance, setSelectedProjectForGrievance] = useState<VillageWorkProject | null>(null);
  const [selectedProjectForDoc, setSelectedProjectForDoc] = useState<VillageWorkProject | null>(null);

  // Grievance Form State
  const [citizenName, setCitizenName] = useState<string>("");
  const [citizenPhone, setCitizenPhone] = useState<string>("");
  const [issueType, setIssueType] = useState<"delay" | "quality" | "fund_misuse" | "not_started" | "other">("delay");
  const [description, setDescription] = useState<string>("");
  const [grievanceSubmitting, setGrievanceSubmitting] = useState<boolean>(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState<string | null>(null);

  // Fetch updated projects from API
  const fetchVillageData = async (stateVal: string, distVal: string, blockVal: string, villVal: string) => {
    try {
      setLoading(true);
      const url = `/api/village-development?state=${encodeURIComponent(stateVal)}&district=${encodeURIComponent(distVal)}&block=${encodeURIComponent(blockVal)}&village=${encodeURIComponent(villVal)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.projects) {
          setProjects(data.projects);
        }
        if (data.signatories) {
          setSignatories(data.signatories);
        }
      }
    } catch (err) {
      console.warn("Error fetching village development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUserSession();
    if (user) {
      setCurrentUser(user);
      if (user.district) setSelectedDistrict(user.district);
      if (user.village) setSelectedVillage(user.village);
    }
  }, []);

  useEffect(() => {
    // Instant synchronous UI update for matching signatories
    const instantSig = getPanchayatSignatories(selectedState, selectedDistrict, selectedBlock, selectedVillage);
    setSignatories(instantSig);

    // Instant synchronous UI update for projects so every village/state changes immediately with zero delay
    const instantProjects = getVillageProjectsForLocation(selectedState, selectedDistrict, selectedBlock, selectedVillage);
    setProjects(instantProjects);

    fetchVillageData(selectedState, selectedDistrict, selectedBlock, selectedVillage);
  }, [selectedState, selectedDistrict, selectedBlock, selectedVillage]);

  // Derived location dropdown options
  const stateOptions = Object.keys(STATE_DISTRICT_BLOCK_DATA);
  const districtOptions = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts
    ? Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState].districts)
    : ["Lucknow"];
  const blockOptions = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks
    ? Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState].districts[selectedDistrict].blocks)
    : ["Malihabad"];
  const villageOptions = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks[selectedBlock] || [
    "Malihabad Khas",
    "Saspan",
    "Nabipanah",
    "Kasmandi Kalan",
  ];

  // Filtered project list
  const filteredProjects = projects.filter((proj) => {
    if (activeCategory !== "all" && proj.category !== activeCategory) return false;
    if (activeStatus !== "all" && proj.status !== activeStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = proj.title_hi.toLowerCase().includes(q) || proj.title_en.toLowerCase().includes(q);
      const matchFund = proj.scheme_fund_hi.toLowerCase().includes(q) || proj.scheme_fund_en.toLowerCase().includes(q);
      const matchOrder = proj.work_order_no.toLowerCase().includes(q) || proj.egs_activity_code.toLowerCase().includes(q);
      return matchTitle || matchFund || matchOrder;
    }
    return true;
  });

  // Calculate high-level financial metrics
  const totalSanctioned = filteredProjects.reduce((sum, p) => sum + (p.sanctioned_amount || 0), 0);
  const totalDisbursed = filteredProjects.reduce((sum, p) => sum + (p.disbursed_amount || 0), 0);
  const totalUtilized = filteredProjects.reduce((sum, p) => sum + (p.utilized_amount || 0), 0);
  const completedCount = filteredProjects.filter((p) => p.status === "completed").length;
  const inProgressCount = filteredProjects.filter((p) => p.status === "in_progress").length;

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForGrievance) return;
    setGrievanceSubmitting(true);

    try {
      const payload = {
        action: "create_grievance",
        project_id: selectedProjectForGrievance.id,
        project_title: selectedProjectForGrievance.title_hi,
        citizen_name: citizenName || currentUser?.full_name || "ग्रामवासी",
        citizen_phone: citizenPhone || currentUser?.phone || "9838000000",
        village: selectedVillage,
        issue_type: issueType,
        description,
      };

      const res = await fetch("/api/village-development", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setGrievanceSuccess(data.grievance?.id || "UP-GR-2026-SUCCESS");
        setDescription("");
      } else {
        alert("Failed to submit grievance. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Submission error. Please check your connection.");
    } finally {
      setGrievanceSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "road":
        return <Hammer className="w-4 h-4 text-amber-600" />;
      case "solar":
        return <Sun className="w-4 h-4 text-yellow-600" />;
      case "water":
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case "drainage":
        return <Layers className="w-4 h-4 text-blue-600" />;
      case "community":
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Award className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 sm:pb-20 space-y-5 sm:space-y-8 w-full min-w-0">
      
      {/* 1. Header Banner with e-GramSwaraj Badge */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                🏛️ {locale === "hi" ? "पंचायती राज मंत्रालय (e-GramSwaraj)" : "Ministry of Panchayati Raj"}
              </span>
              <span className="text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-emerald-200 px-3 py-1 rounded-full border border-white/20">
                15th FC & SFC Live Grants
              </span>
            </div>

            <h1 className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {locale === "hi"
                ? "ग्राम विकास एवं पंचायत निधि ट्रैकर"
                : "Village Development & Fund Tracker"}
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-emerald-100/90 font-medium leading-relaxed max-w-2xl">
              {locale === "hi"
                ? "जानिए आपके गाँव में ग्राम प्रधान, सचिव और बीडीओ द्वारा कौन-सी सड़क, सोलर लाइट या नाली का काम स्वीकृत हुआ है, कितना सरकारी फंड आया और काम कितना आगे बढ़ा।"
                : "Complete public transparency on road construction, solar lights, water canals, sanctioned government funds, and official officer sign-offs in your village."}
            </p>
          </div>

          {/* Verification Seal Badge */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              ✓
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {locale === "hi" ? "100% सार्वजनिक ऑडिट" : "100% Public Audit"}
              </div>
              <div className="text-sm font-extrabold text-white">
                {locale === "hi" ? "जियोटैग व वित्तीय रिकॉर्ड्स" : "Geotagged & Audited Funds"}
              </div>
              <div className="text-[11px] text-emerald-200">
                {locale === "hi" ? "प्रधान व अधिकारी द्वारा अधिकृत" : "Authorized by Pradhan & BDO"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Geographic Selectors (State -> District -> Block -> Gram Panchayat) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              {locale === "hi" ? "अपना राज्य, ज़िला व ग्राम पंचायत चुनें:" : "Select State, District, Block & Village:"}
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
            📍 {selectedVillage}, {selectedBlock} ({selectedDistrict})
          </span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* State */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">
              {locale === "hi" ? "1. राज्य (State)" : "1. State"}
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const firstDist = Object.keys(STATE_DISTRICT_BLOCK_DATA[e.target.value]?.districts || {})[0] || "Lucknow";
                setSelectedDistrict(firstDist);
                const firstBlock = Object.keys(STATE_DISTRICT_BLOCK_DATA[e.target.value]?.districts[firstDist]?.blocks || {})[0] || "Malihabad";
                setSelectedBlock(firstBlock);
                setSelectedVillage(STATE_DISTRICT_BLOCK_DATA[e.target.value]?.districts[firstDist]?.blocks[firstBlock]?.[0] || "Malihabad Khas");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            >
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">
              {locale === "hi" ? "2. ज़िला (District)" : "2. District"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                const firstBlock = Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[e.target.value]?.blocks || {})[0] || "Malihabad";
                setSelectedBlock(firstBlock);
                setSelectedVillage(STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[e.target.value]?.blocks[firstBlock]?.[0] || "Malihabad Khas");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            >
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Block */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">
              {locale === "hi" ? "3. विकास खंड (Block)" : "3. Block"}
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                const vList = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks[e.target.value] || ["Malihabad Khas"];
                setSelectedVillage(vList[0]);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            >
              {blockOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Village */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-800">
              {locale === "hi" ? "4. ग्राम पंचायत / गाँव (Village)" : "4. Gram Panchayat"}
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full bg-emerald-50/70 border-2 border-emerald-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-black text-emerald-950 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            >
              {villageOptions.map((v) => (
                <option key={v} value={v}>
                  🏡 {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. High-Impact Fund & Project Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sanctioned Fund */}
        <div className="bg-gradient-to-br from-white to-emerald-50/50 p-4 sm:p-5 rounded-2xl border-2 border-emerald-100 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              {locale === "hi" ? "कुल स्वीकृत बजट" : "Total Sanctioned"}
            </span>
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-emerald-950">
            ₹{(totalSanctioned / 100000).toFixed(2)} Lakh
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            {locale === "hi" ? "15वां वित्त व राज्य अनुदान" : "15th FC & State Grants"}
          </p>
        </div>

        {/* Disbursed & Spent */}
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-4 sm:p-5 rounded-2xl border-2 border-blue-100 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              {locale === "hi" ? "निधि उपभोग (व्यय)" : "Fund Utilized"}
            </span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-blue-950">
            ₹{(totalUtilized / 100000).toFixed(2)} Lakh
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-blue-700 font-bold">
            <span>{totalSanctioned > 0 ? Math.round((totalUtilized / totalSanctioned) * 100) : 0}%</span>
            <span>{locale === "hi" ? "व्यय अनुपात" : "Expenditure Ratio"}</span>
          </div>
        </div>

        {/* Works In Progress */}
        <div className="bg-gradient-to-br from-white to-amber-50/50 p-4 sm:p-5 rounded-2xl border-2 border-amber-100 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              {locale === "hi" ? "प्रगतिशील कार्य" : "In Progress"}
            </span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-amber-950">
            {inProgressCount} <span className="text-xs sm:text-sm font-bold text-slate-500">{locale === "hi" ? "योजनाएं" : "Projects"}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-amber-700 font-medium truncate">
            {locale === "hi" ? "सड़क, नाली व सोलर लाइट" : "Roads, drainage & solar"}
          </p>
        </div>

        {/* Completed Works */}
        <div className="bg-gradient-to-br from-white to-teal-50/50 p-4 sm:p-5 rounded-2xl border-2 border-teal-100 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              {locale === "hi" ? "पूर्ण व सत्यापित" : "Completed & Verified"}
            </span>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-teal-950">
            {completedCount} <span className="text-xs sm:text-sm font-bold text-slate-500">{locale === "hi" ? "योजनाएं" : "Works"}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-teal-700 font-medium truncate">
            {locale === "hi" ? "जियोटैग व सोशल ऑडिट पूर्ण" : "Geotagged & Social Audited"}
          </p>
        </div>
      </div>

      {/* 4. Local Authorities & Pradhan Contact Card */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            👨‍💼
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {locale === "hi" ? "ग्राम पंचायत के अधिकृत पदाधिकारी" : "Authorized Panchayat Signatories"}
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{signatories.pradhan_name}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {signatories.pradhan_designation}
              </span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span>सचिव: <strong>{signatories.sachiv_name}</strong></span>
              <span>•</span>
              <span>BDO: <strong>{signatories.bdo_name}</strong></span>
              <span>•</span>
              <span className="text-slate-500">JE: {signatories.je_name}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
              <span>🏛️ {signatories.panchayat_bhawan}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`tel:${signatories.pradhan_contact}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{signatories.pradhan_contact}</span>
          </a>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{locale === "hi" ? "सत्यापित ग्राम पंचायत" : "Verified Panchayat"}</span>
          </div>
        </div>
      </div>

      {/* 5. Filter Tabs and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {[
              { id: "all", label_hi: "सभी कार्य", label_en: "All Works" },
              { id: "road", label_hi: "सड़क व खड़ंजा", label_en: "Roads & Kharanja" },
              { id: "solar", label_hi: "सोलर व प्रकाश", label_en: "Solar & Lighting" },
              { id: "drainage", label_hi: "नाली व जल निकासी", label_en: "Drainage" },
              { id: "water", label_hi: "सिंचाई व तालाब", label_en: "Water & Irrigation" },
              { id: "community", label_hi: "पंचायत भवन व सेवा", label_en: "Community & CSC" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as ProjectCategory)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/10 scale-102"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {locale === "hi" ? tab.label_hi : tab.label_en}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "hi" ? "सड़क, सोलर या वर्क आर्डर खोजें..." : "Search project or work order..."}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      </div>

      {/* 6. List of Village Public Works Projects */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-bold text-slate-600">
              {locale === "hi" ? "ग्राम पंचायत कार्य डेटा लोड हो रहा है..." : "Loading public works records..."}
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-2">
            <div className="text-4xl">🌾</div>
            <h3 className="text-base font-black text-slate-900">
              {locale === "hi" ? "इस श्रेणी में कोई कार्य नहीं मिला" : "No public works found in this filter"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {locale === "hi"
                ? "कृपया अन्य श्रेणी चुनें या मलिहाबाद खास ग्राम पंचायत का चयन करें।"
                : "Try selecting All Works or change your village filter above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredProjects.map((proj) => {
              const isCompleted = proj.status === "completed";
              const progressPct = proj.progress_percent || 0;

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-slate-200/90 hover:border-emerald-500/80 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Bar: IDs and Category Badge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="p-1.5 rounded-lg bg-slate-100">
                          {getCategoryIcon(proj.category)}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {proj.work_order_no}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {proj.egs_activity_code}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                          isCompleted
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                            <span>{locale === "hi" ? "पूर्ण व सत्यापित" : "Completed"}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>{progressPct}% {locale === "hi" ? "प्रगतिशील" : "In Progress"}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Project Title */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                        {locale === "hi" ? proj.title_hi : proj.title_en}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {locale === "hi" ? proj.description_hi : proj.description_en}
                      </p>
                    </div>

                    {/* Scheme / Fund Banner */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-100/90 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <Coins className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate">{locale === "hi" ? proj.scheme_fund_hi : proj.scheme_fund_en}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          {locale === "hi" ? "स्वीकृत बजट" : "Budget"}
                        </div>
                        <div className="text-sm font-black text-emerald-900">
                          ₹{proj.sanctioned_amount.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Stages */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          {locale === "hi" ? "भौतिक निर्माण प्रगति:" : "Physical Construction Progress:"}
                        </span>
                        <span className="text-emerald-800 font-black">{progressPct}%</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted
                              ? "bg-gradient-to-r from-teal-500 to-emerald-600"
                              : "bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-600"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Current Stage Note */}
                      <div className="text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-150 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">📌</span>
                        <span>{locale === "hi" ? proj.current_stage_hi : proj.current_stage_en}</span>
                      </div>

                      {/* Next Milestone */}
                      {!isCompleted && (
                        <div className="text-[11px] font-medium text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold shrink-0">⏳</span>
                          <div>
                            <span className="font-bold">{locale === "hi" ? "अगला चरण: " : "Next Step: "}</span>
                            <span>{locale === "hi" ? proj.next_milestone_hi : proj.next_milestone_en}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Official Approving Officers Information */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-150 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="text-slate-400 font-bold uppercase text-[9px]">
                          {locale === "hi" ? "ग्राम प्रधान अनुमोदन" : "Gram Pradhan"}
                        </div>
                        <div className="font-bold text-slate-800 truncate">{proj.pradhan_name}</div>
                        <div className="text-[10px] text-slate-500">{proj.pradhan_contact}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-slate-400 font-bold uppercase text-[9px]">
                          {locale === "hi" ? "तकनीकी व वित्तीय स्वीकृति" : "Technical & BDO Signoff"}
                        </div>
                        <div className="font-bold text-slate-800 truncate">{proj.bdo_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{proj.je_name} ({locale === "hi" ? "अवर अभियंता" : "JE"})</div>
                      </div>
                    </div>

                    {/* Geotag & Audit Seal */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{proj.geotag.location_name}</span>
                      </div>
                      <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px] shrink-0">
                        {locale === "hi" ? proj.audit_status_hi : proj.audit_status_en}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Raise Grievance / Audit and View Official Order */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectForGrievance(proj);
                        setGrievanceSuccess(null);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{locale === "hi" ? "शिकायत / देरी रिपोर्ट करें" : "Report Delay / Issue"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProjectForDoc(proj)}
                      className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{locale === "hi" ? "स्वीकृति पत्र" : "Sanction Order"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Citizen Grievance Modal */}
      {selectedProjectForGrievance && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6">
            <button
              type="button"
              onClick={() => setSelectedProjectForGrievance(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            {grievanceSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl font-black">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {locale === "hi" ? "शिकायत सफलतापूर्वक दर्ज हुई!" : "Grievance Registered Successfully!"}
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-emerald-800 text-sm">
                  {locale === "hi" ? "शिकायत टोकन: " : "Complaint Token: "} {grievanceSuccess}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  {locale === "hi"
                    ? `आपकी रिपोर्ट बीडीओ (BDO ${selectedProjectForGrievance.block}) और जिला पंचायत राज अधिकारी (DPRO ${selectedProjectForGrievance.district}) पोर्टल पर जांच हेतु प्रेषित कर दी गई है। अवर अभियंता द्वारा 7 दिनों में स्थलीय सत्यापन किया जाएगा।`
                    : `Your report has been forwarded to the Block Development Officer (BDO ${selectedProjectForGrievance.block}) and DPRO ${selectedProjectForGrievance.district} portal. A Junior Engineer physical verification is scheduled within 7 days.`}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProjectForGrievance(null)}
                  className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm"
                >
                  {locale === "hi" ? "बंद करें" : "Close"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{locale === "hi" ? "सार्वजनिक ऑडिट व शिकायत फॉर्म" : "Public Audit & Grievance"}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {locale === "hi" ? "निर्माण कार्य पर शिकायत / देरी दर्ज करें" : "Report Work Delay or Quality Issue"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {locale === "hi" ? selectedProjectForGrievance.title_hi : selectedProjectForGrievance.title_en}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {locale === "hi" ? "आपका नाम" : "Your Full Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder={currentUser?.full_name || "सुरेश वर्मा"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {locale === "hi" ? "मोबाइल नंबर (SMS अपडेट हेतु)" : "Mobile Phone"} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {locale === "hi" ? "समस्या का प्रकार" : "Issue Type"} *
                    </label>
                    <select
                      value={issueType}
                      onChange={(e: any) => setIssueType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    >
                      <option value="delay">{locale === "hi" ? "काम में अत्यधिक देरी / काम रुका हुआ है" : "Work Halted or Delayed"}</option>
                      <option value="quality">{locale === "hi" ? "घटिया निर्माण सामग्री / दरारें दिख रही हैं" : "Poor Construction Quality / Cracks"}</option>
                      <option value="not_started">{locale === "hi" ? "बजट पास होने के बाद भी काम शुरू नहीं हुआ" : "Work Not Started Despite Sanction"}</option>
                      <option value="fund_misuse">{locale === "hi" ? "निधि उपयोग में अनियमितता" : "Fund Utilization Discrepancy"}</option>
                      <option value="other">{locale === "hi" ? "अन्य समस्या" : "Other Issue"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {locale === "hi" ? "विस्तृत विवरण" : "Detailed Description"} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        locale === "hi"
                          ? "सड़क पर कहां समस्या है, काम कब से रुका है या क्या कमी है..."
                          : "Provide specific details regarding location, halted days, or material issues..."
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectForGrievance(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    {locale === "hi" ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={grievanceSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{grievanceSubmitting ? (locale === "hi" ? "भेजा जा रहा है..." : "Submitting...") : (locale === "hi" ? "शिकायत दर्ज करें" : "Submit Grievance")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. Sanction Document Preview Modal */}
      {selectedProjectForDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 space-y-4">
            <button
              type="button"
              onClick={() => setSelectedProjectForDoc(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Document Seal */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {locale === "hi"
                  ? `कार्यालय खंड विकास अधिकारी, विकास खंड - ${selectedProjectForDoc.block} (${selectedProjectForDoc.district})`
                  : `Office of the Block Development Officer, Block - ${selectedProjectForDoc.block} (${selectedProjectForDoc.district})`}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {locale === "hi"
                  ? "पंचायती राज विभाग - प्रशासनिक एवं वित्तीय स्वीकृति आदेश"
                  : "Department of Panchayati Raj - Administrative & Financial Sanction Order"}
              </h2>
              <div className="text-xs font-mono font-bold text-emerald-800">
                {locale === "hi" ? "पत्रांक: " : "Order No: "}{selectedProjectForDoc.work_order_no} | {locale === "hi" ? "ई-ग्रामस्वराज कोड: " : "e-GramSwaraj: "}{selectedProjectForDoc.egs_activity_code}
              </div>
            </div>

            {/* Document Content Details */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <p>
                <strong>विषय:</strong> {selectedProjectForDoc.title_hi}
              </p>
              <p>
                ग्राम सभा <strong>{selectedProjectForDoc.village}</strong> द्वारा पारित प्रस्ताव एवं अवर अभियंता RES की तकनीकी आगणन आख्या के आधार पर निम्नलिखित वित्तीय स्वीकृति प्रदान की जाती है:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">योजना एवं निधि स्रोत:</span>
                  <span className="font-bold">{selectedProjectForDoc.scheme_fund_hi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">कुल स्वीकृत धनराशि:</span>
                  <span className="font-bold text-emerald-800">₹{selectedProjectForDoc.sanctioned_amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">जारी (विमुक्त) प्रथम/द्वितीय किश्त:</span>
                  <span className="font-bold">₹{selectedProjectForDoc.disbursed_amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">स्वीकृति दिनांक:</span>
                  <span className="font-bold">{selectedProjectForDoc.sanction_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">प्रत्याशित पूर्णता तिथि:</span>
                  <span className="font-bold">{selectedProjectForDoc.expected_completion}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">कार्यदायी संस्था / ठेकेदार:</span>
                  <span className="font-bold">{selectedProjectForDoc.contractor_name}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs">
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-900">{selectedProjectForDoc.pradhan_name}</div>
                  <div className="text-[11px] text-slate-500">{selectedProjectForDoc.pradhan_designation}</div>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-900">{selectedProjectForDoc.bdo_name}</div>
                  <div className="text-[11px] text-slate-500">{selectedProjectForDoc.bdo_designation}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 italic">
                ✓ डिजिटल प्रमाणित प्रतिलिपि (e-GramSwaraj पोर्टल से सत्यापित)
              </span>
              <button
                type="button"
                onClick={() => setSelectedProjectForDoc(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                {locale === "hi" ? "वापस जाएं" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
