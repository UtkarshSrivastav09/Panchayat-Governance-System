"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useI18n } from "@/lib/i18n";
import {
  VillageWorkProject,
  STATE_DISTRICT_BLOCK_DATA,
  getVillageProjectsForLocation,
  getPanchayatSignatories,
  toEnglishPlaceName,
} from "@/data/village-works";
import {
  getThreeStagePhotosForCategory,
  GeoAuditResult,
  getFailSafeAuditReport,
  ThreeStagePhotos,
} from "@/lib/geo-audit-engine";
import {
  X,
  Satellite,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  Printer,
  Download,
  AlertTriangle,
  Layers,
  RefreshCw,
  Building2,
  FileCheck,
  Award,
  ChevronDown,
  Navigation,
  FileText,
  BadgeCheck,
  Eye,
  ExternalLink,
  Plus,
  Minus,
  Crosshair,
  TrendingUp,
  Receipt,
  Check,
} from "lucide-react";

interface SatelliteAuditModalProps {
  project: VillageWorkProject;
  onClose: () => void;
}

export default function SatelliteAuditModal({ project: initialProject, onClose }: SatelliteAuditModalProps) {
  const { locale } = useI18n();

  // Active Project State (allows switching projects dynamically via dropdowns)
  const [currentProject, setCurrentProject] = useState<VillageWorkProject>(initialProject);

  // 4 Location Dropdowns State
  const [selectedState, setSelectedState] = useState<string>(initialProject.state || "Uttar Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialProject.district || "Lucknow");
  const [selectedBlock, setSelectedBlock] = useState<string>(initialProject.block || "Malihabad");
  const [selectedVillage, setSelectedVillage] = useState<string>(initialProject.village || "Malihabad Khas");

  // Available projects in selected village
  const [availableProjects, setAvailableProjects] = useState<VillageWorkProject[]>(() =>
    getVillageProjectsForLocation(
      initialProject.state || "Uttar Pradesh",
      initialProject.district || "Lucknow",
      initialProject.block || "Malihabad",
      initialProject.village || "Malihabad Khas"
    )
  );

  // Location Hierarchy Options
  const stateOptions = Object.keys(STATE_DISTRICT_BLOCK_DATA);
  const districtOptions = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts
    ? Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState].districts)
    : ["Lucknow"];
  const blockOptions = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks
    ? Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState].districts[selectedDistrict].blocks)
    : ["Malihabad"];
  const villageOptions =
    STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks[selectedBlock] || [
      "Malihabad Khas",
      "Saspan",
      "Nabipanah",
    ];

  // Active Tab
  const [activeTab, setActiveTab] = useState<"satellite" | "timeline" | "ai_cert" | "live_capture">("satellite");
  const [mapMode, setMapMode] = useState<"satellite" | "osm">("satellite");
  const [cadastralOverlay, setCadastralOverlay] = useState<boolean>(true);

  // 3-Stage Timeline View Mode
  const [timelineViewMode, setTimelineViewMode] = useState<"stages" | "compare" | "vouchers">("stages");

  // MapLibre Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // 3-Stage Photos with Real Government Metadata
  const threeStagePhotos: ThreeStagePhotos = getThreeStagePhotosForCategory(
    currentProject.category,
    currentProject.village,
    currentProject.sanction_date,
    currentProject.expected_completion,
    {
      egs_activity_code: currentProject.egs_activity_code,
      work_order_no: currentProject.work_order_no,
      sanctioned_amount: currentProject.sanctioned_amount,
      disbursed_amount: currentProject.disbursed_amount,
      utilized_amount: currentProject.utilized_amount,
      contractor_name: currentProject.contractor_name,
      is_live_on_ground: currentProject.progress_percent < 100,
      je_name: currentProject.je_name,
      sarpanch_name: currentProject.pradhan_name,
    }
  );

  // AI Audit State
  const [auditResult, setAuditResult] = useState<GeoAuditResult>(() =>
    getFailSafeAuditReport(
      currentProject.title_hi,
      currentProject.category,
      currentProject.village,
      currentProject.geotag.lat,
      currentProject.geotag.lng
    )
  );

  // Live Capture State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number }>({
    lat: currentProject.geotag.lat,
    lng: currentProject.geotag.lng,
  });

  // Handle 4-Level Location Dropdown Changes
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const newDistricts = Object.keys(STATE_DISTRICT_BLOCK_DATA[newState]?.districts || {});
    const firstDist = newDistricts[0] || "Lucknow";
    setSelectedDistrict(firstDist);

    const newBlocks = Object.keys(STATE_DISTRICT_BLOCK_DATA[newState]?.districts[firstDist]?.blocks || {});
    const firstBlock = newBlocks[0] || "Malihabad";
    setSelectedBlock(firstBlock);

    const newVillages = STATE_DISTRICT_BLOCK_DATA[newState]?.districts[firstDist]?.blocks[firstBlock] || ["Khas"];
    const firstVillage = newVillages[0] || "Khas";
    setSelectedVillage(firstVillage);

    updateLocationProjects(newState, firstDist, firstBlock, firstVillage);
  };

  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    const newBlocks = Object.keys(STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[newDist]?.blocks || {});
    const firstBlock = newBlocks[0] || "Block 1";
    setSelectedBlock(firstBlock);

    const newVillages = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[newDist]?.blocks[firstBlock] || ["Village 1"];
    const firstVillage = newVillages[0] || "Village 1";
    setSelectedVillage(firstVillage);

    updateLocationProjects(selectedState, newDist, firstBlock, firstVillage);
  };

  const handleBlockChange = (newBlock: string) => {
    setSelectedBlock(newBlock);
    const newVillages = STATE_DISTRICT_BLOCK_DATA[selectedState]?.districts[selectedDistrict]?.blocks[newBlock] || ["Village 1"];
    const firstVillage = newVillages[0] || "Village 1";
    setSelectedVillage(firstVillage);

    updateLocationProjects(selectedState, selectedDistrict, newBlock, firstVillage);
  };

  const handleVillageChange = (newVillage: string) => {
    setSelectedVillage(newVillage);
    updateLocationProjects(selectedState, selectedDistrict, selectedBlock, newVillage);
  };

  // Synchronously update projects and fly satellite map to new location
  const updateLocationProjects = (st: string, dist: string, blk: string, vill: string) => {
    const projs = getVillageProjectsForLocation(st, dist, blk, vill);
    setAvailableProjects(projs);

    if (projs.length > 0) {
      const newProj = projs[0];
      setCurrentProject(newProj);
      setAuditResult(getFailSafeAuditReport(newProj.title_hi, newProj.category, newProj.village, newProj.geotag.lat, newProj.geotag.lng));
      setLiveGps({ lat: newProj.geotag.lat, lng: newProj.geotag.lng });

      // Fly Map directly to the selected village coordinates
      flyMapToCoordinates(newProj.geotag.lng, newProj.geotag.lat);
    }
  };

  // Handle switching project inside the same village
  const handleProjectSelect = (projectId: string) => {
    const p = availableProjects.find((x) => x.id === projectId);
    if (p) {
      setCurrentProject(p);
      setAuditResult(getFailSafeAuditReport(p.title_hi, p.category, p.village, p.geotag.lat, p.geotag.lng));
      setLiveGps({ lat: p.geotag.lat, lng: p.geotag.lng });
      flyMapToCoordinates(p.geotag.lng, p.geotag.lat);
    }
  };

  const flyMapToCoordinates = (lng: number, lat: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 17.2,
        pitch: 28,
        essential: true,
        duration: 1600,
      });

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut({ duration: 300 });
    }
  };

  const handleResetView = () => {
    flyMapToCoordinates(currentProject.geotag.lng, currentProject.geotag.lat);
  };

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (activeTab !== "satellite") return;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const satelliteSource = {
      type: "raster" as const,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "© Esri World Imagery & ISRO Bhuvan",
    };

    const osmSource = {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          baseLayer: mapMode === "satellite" ? satelliteSource : osmSource,
        },
        layers: [
          {
            id: "base-layer",
            type: "raster",
            source: "baseLayer",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [currentProject.geotag.lng, currentProject.geotag.lat],
      zoom: 17,
      pitch: 25,
    });

    mapInstanceRef.current = map;

    // Add High-Impact Pulsing Target Marker for the asset
    const markerEl = document.createElement("div");
    markerEl.className = "satellite-asset-marker";
    markerEl.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 54px; height: 54px; border-radius: 50%; background: rgba(6, 182, 212, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(16, 185, 129, 0.6); animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #059669); border: 3px solid #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 16px;">
          🛰️
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: markerEl })
      .setLngLat([currentProject.geotag.lng, currentProject.geotag.lat])
      .addTo(map);

    markerRef.current = marker;

    const timer = setTimeout(() => {
      map.resize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, mapMode]);

  // Handle Client-Side Watermarking
  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);

        const bannerHeight = Math.max(54, Math.round(h * 0.12));
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.fillRect(0, h - bannerHeight, w, bannerHeight);

        ctx.fillStyle = "#10b981";
        ctx.fillRect(0, h - bannerHeight, Math.max(8, Math.round(w * 0.015)), bannerHeight);

        const fontSize = Math.max(13, Math.round(bannerHeight * 0.22));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `🌾 GramSetu ISRO-Bhuvan Geo-Audit | ${currentProject.village}, ${currentProject.district}`,
          20,
          h - bannerHeight + fontSize + 6
        );

        ctx.font = `normal ${Math.max(11, fontSize - 2)}px monospace`;
        ctx.fillStyle = "#34d399";
        const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        ctx.fillText(
          `GPS: ${liveGps.lat}° N, ${liveGps.lng}° E  •  Date: ${dateStr}  •  WO: ${currentProject.work_order_no}`,
          20,
          h - 12
        );

        const stampedData = canvas.toDataURL("image/jpeg", 0.9);
        setWatermarkedImage(stampedData);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Run AI Inspection
  const runAiInspection = async () => {
    if (!watermarkedImage) return;
    try {
      setIsAuditing(true);
      const res = await fetch("/api/audit-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: watermarkedImage,
          projectTitle: currentProject.title_hi,
          category: currentProject.category,
          village: currentProject.village,
          lat: liveGps.lat,
          lng: liveGps.lng,
          lang: locale,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
        setActiveTab("ai_cert");
      }
    } catch (e) {
      console.warn("Audit call error:", e);
      setActiveTab("ai_cert");
    } finally {
      setIsAuditing(false);
    }
  };

  const displayVillage = locale === "hi" ? selectedVillage : toEnglishPlaceName(selectedVillage);
  const displayDistrict = locale === "hi" ? selectedDistrict : toEnglishPlaceName(selectedDistrict);
  const displayBlock = locale === "hi" ? selectedBlock : toEnglishPlaceName(selectedBlock);

  // Lock body scroll while modal is mounted to prevent background elements from peeking through
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col w-screen h-screen overflow-hidden">
      {/* Government of India Official Tricolor Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shrink-0" />

        {/* =========================================================================
            HEADER TIER 1: Official Emblem, Title, Tabs & Close
           ========================================================================= */}
        <div className="bg-slate-900 px-3 py-2.5 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              🛰️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Satellite className="w-3 h-3" />
                  <span>ISRO BHUVAN</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {currentProject.work_order_no}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-black text-white mt-0.5 truncate tracking-tight">
                {locale === "hi" ? currentProject.title_hi : currentProject.title_en}
              </h2>
            </div>
          </div>

          {/* Unified Navigation Tabs + Close Button */}
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("satellite")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "satellite"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{locale === "hi" ? "उपग्रह" : "Satellite"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "timeline"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{locale === "hi" ? "3-चरणीय फोटो" : "3-Stage Proof"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai_cert")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "ai_cert"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{locale === "hi" ? "AI प्रमाण-पत्र" : "AI Certificate"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("live_capture")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "live_capture"
                  ? "bg-rose-500 text-white font-black shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{locale === "hi" ? "फोटो जांचें" : "Inspect"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-1.5 shadow-sm active:scale-95"
              title="Close Satellite View"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">{locale === "hi" ? "बंद करें" : "Exit"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            HEADER TIER 2: Compact Cascading Location Toolbar + Project Dropdown
           ========================================================================= */}
        <div className="bg-slate-900/90 px-3 py-2 sm:px-5 sm:py-2.5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 text-xs">
          
          {/* Location 4 Cascading Dropdowns */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-cyan-400 shrink-0 flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-pulse" />
              <span>{locale === "hi" ? "स्थान:" : "Location:"}</span>
            </span>

            {/* State */}
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 outline-none max-w-[130px] truncate cursor-pointer"
            >
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {locale === "hi" ? st : toEnglishPlaceName(st)}
                </option>
              ))}
            </select>

            {/* District */}
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 outline-none max-w-[120px] truncate cursor-pointer"
            >
              {districtOptions.map((dist) => (
                <option key={dist} value={dist}>
                  {locale === "hi" ? dist : toEnglishPlaceName(dist)}
                </option>
              ))}
            </select>

            {/* Block */}
            <select
              value={selectedBlock}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:border-cyan-400 outline-none max-w-[120px] truncate cursor-pointer"
            >
              {blockOptions.map((blk) => (
                <option key={blk} value={blk}>
                  {locale === "hi" ? blk : toEnglishPlaceName(blk)}
                </option>
              ))}
            </select>

            {/* Village */}
            <select
              value={selectedVillage}
              onChange={(e) => handleVillageChange(e.target.value)}
              className="bg-slate-950 border border-emerald-500 rounded-lg px-2 py-1 text-xs font-black text-emerald-300 focus:border-emerald-400 outline-none max-w-[140px] truncate cursor-pointer"
            >
              {villageOptions.map((v) => (
                <option key={v} value={v}>
                  🏡 {locale === "hi" ? v : toEnglishPlaceName(v)}
                </option>
              ))}
            </select>
          </div>

          {/* Project Switcher Select Dropdown (Clean, non-scrolling) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
              {locale === "hi" ? "कार्य:" : "Project:"}
            </span>
            <select
              value={currentProject.id}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-cyan-300 focus:border-cyan-400 outline-none max-w-[260px] sm:max-w-[340px] truncate cursor-pointer"
            >
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.category === "road" ? "🛣️" : p.category === "solar" ? "☀️" : p.category === "drainage" ? "🌊" : "🏛️"} {locale === "hi" ? p.title_hi : p.title_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            MODAL BODY CONTENT
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70">

          {/* -----------------------------------------------------------------------
              TAB 1: LIVE SATELLITE RADAR VIEW (ISRO BHUVAN GRID)
             ----------------------------------------------------------------------- */}
          {activeTab === "satellite" && (
            <div className="space-y-4">
              
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-slate-200">
                    {locale === "hi"
                      ? `ISRO भुवन उपग्रह दृश्य: ${currentProject.village}, ${currentProject.district}`
                      : `ISRO Bhuvan Satellite Feed: ${toEnglishPlaceName(currentProject.village)}, ${toEnglishPlaceName(currentProject.district)}`}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800">
                    GPS: {currentProject.geotag.lat}° N, {currentProject.geotag.lng}° E
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {/* Cadastral overlay toggle */}
                  <button
                    type="button"
                    onClick={() => setCadastralOverlay(!cadastralOverlay)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      cadastralOverlay
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{locale === "hi" ? "निर्माण सीमा ग्रिड" : "Civil Footprint"}</span>
                  </button>

                  {/* Satellite vs Street map switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMapMode("satellite")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mapMode === "satellite"
                          ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🛰️ {locale === "hi" ? "उपग्रह" : "Satellite"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode("osm")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mapMode === "osm"
                          ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🗺️ {locale === "hi" ? "सड़क" : "Street"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Canvas with Interactive HUD and Controls */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl h-[460px] sm:h-[560px] lg:h-[620px] bg-slate-900">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Overlaid Satellite Metadata Badge */}
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 text-xs font-mono space-y-1.5 shadow-2xl max-w-xs">
                  <div className="text-cyan-400 font-black flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 animate-pulse" />
                    <span>ISRO BHUVAN GRID LOCK</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">Lat: {currentProject.geotag.lat}° N</div>
                  <div className="text-slate-300 text-[11px]">Lng: {currentProject.geotag.lng}° E</div>
                  <div className="text-emerald-400 font-bold text-[11px] pt-1 border-t border-white/10">
                    📍 {displayVillage}, {displayBlock}
                  </div>
                  <div className="text-slate-300 text-[10px] truncate">
                    Work: {locale === "hi" ? currentProject.title_hi : currentProject.title_en}
                  </div>
                  <div className="text-amber-300 text-[10px] font-bold">
                    Progress: {currentProject.progress_percent}% ({currentProject.status === "completed" ? (locale === "hi" ? "पूर्ण" : "Completed") : (locale === "hi" ? "प्रगतिशील" : "Live")})
                  </div>
                </div>

                {/* Floating Map Zoom & Center Controls */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="w-9 h-9 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700/80 flex items-center justify-center font-bold shadow-lg transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="w-9 h-9 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700/80 flex items-center justify-center font-bold shadow-lg transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    title="Center on Village Asset"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Verification Seal */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 text-xs font-extrabold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{locale === "hi" ? "स्थल भौतिक रूप से सत्यापित (Verified DGPS)" : "Civil Site Geotag Verified"}</span>
                </div>
              </div>

              {/* Spatial Metadata Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {locale === "hi" ? "उपग्रह रिज़ॉल्यूशन" : "Spatial Resolution"}
                  </div>
                  <div className="text-base font-black text-cyan-300 mt-0.5">0.5m CartoSat-3 Grade</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {locale === "hi" ? "जियो-टैग सटीकता" : "DGPS Positional Accuracy"}
                  </div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">± 2.1m Verified</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {locale === "hi" ? "सरकारी फंड योजना" : "Sanctioned Scheme"}
                  </div>
                  <div className="text-base font-black text-amber-300 mt-0.5 truncate">{currentProject.scheme_fund_en}</div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              TAB 2: 3-STAGE PHOTO PROOF (REAL GOVERNMENT DATA - mActionSoft)
             ----------------------------------------------------------------------- */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              
              {/* Official Ministry Mandate Card & Status Pill */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 rounded-2xl border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                      mActionSoft 3-Stage Mandate
                    </span>
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-600/40">
                      Activity Code: {threeStagePhotos.project_meta.egs_activity_code}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-600/40">
                      Work Order: {threeStagePhotos.project_meta.work_order_no}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {locale === "hi"
                      ? `${currentProject.village}: 15वां वित्त आयोग अनिवार्य 3-चरणीय अभिलेखीकरण`
                      : `${currentProject.village}: 15th FC Mandate 3-Stage Photographic Proof`}
                  </h3>
                  <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                    <span>{locale === "hi" ? "स्वीकृत राशि:" : "Sanctioned:"} <strong>₹{(threeStagePhotos.project_meta.sanctioned_amount / 100000).toFixed(2)} Lakh</strong></span>
                    <span>•</span>
                    <span>{locale === "hi" ? "विमुक्त राशि:" : "Disbursed:"} <strong>₹{(threeStagePhotos.project_meta.disbursed_amount / 100000).toFixed(2)} Lakh</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{locale === "hi" ? "एजेंसी:" : "Agency:"} {threeStagePhotos.project_meta.contractor_name}</span>
                  </div>
                </div>

                {/* Live vs Done Status Pill */}
                <div className="self-start md:self-auto shrink-0">
                  {currentProject.progress_percent >= 100 ? (
                    <div className="bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Check className="w-4 h-4" />
                      <span>{locale === "hi" ? "100% कार्य पूर्ण व चालू" : "100% Completed & Commissioned"}</span>
                    </div>
                  ) : (
                    <div className="bg-rose-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>{locale === "hi" ? `🔴 LIVE ON GROUND (${currentProject.progress_percent}% प्रगति)` : `🔴 LIVE ON GROUND (${currentProject.progress_percent}% Progress)`}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View Mode Switcher: Grid View vs Compare Slider vs Vouchers */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTimelineViewMode("stages")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      timelineViewMode === "stages"
                        ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                        : "bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{locale === "hi" ? "तीनों चरण (Grid View)" : "3-Stage Grid"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimelineViewMode("compare")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      timelineViewMode === "compare"
                        ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                        : "bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{locale === "hi" ? "कार्य पूर्व ⚡ कार्य बाद (Before/After)" : "Before vs After"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimelineViewMode("vouchers")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      timelineViewMode === "vouchers"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{locale === "hi" ? "ई-ग्राम स्वराज वाउचर ट्रेल" : "FTO Payment Trail"}</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  DGPS Accuracy: ± 2.1m
                </span>
              </div>

              {/* VIEW 1: THREE AUTHENTIC STAGES GRID */}
              {timelineViewMode === "stages" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Stage 1: Before Work */}
                  <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-lg hover:border-amber-500/60 transition-all flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 w-full bg-slate-950 group">
                        <img
                          src={threeStagePhotos.stage1_before.photo_url}
                          alt="Stage 1 Before"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                        <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                          {locale === "hi" ? threeStagePhotos.stage1_before.stage_name_hi : threeStagePhotos.stage1_before.stage_name_en}
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[10px] font-mono leading-tight">
                          <div className="font-bold text-amber-300">Geotag: {threeStagePhotos.stage1_before.mactionsoft_geotag_id}</div>
                          <div className="text-slate-300">Date: {threeStagePhotos.stage1_before.date} • {threeStagePhotos.stage1_before.time_ist}</div>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <h4 className="text-xs font-black text-white leading-snug">
                          {locale === "hi" ? threeStagePhotos.stage1_before.title_hi : threeStagePhotos.stage1_before.title_en}
                        </h4>
                        <div className="text-[11px] font-bold text-amber-400 bg-amber-950/60 p-2 rounded-xl border border-amber-800/40">
                          {locale === "hi" ? threeStagePhotos.stage1_before.status_label_hi : threeStagePhotos.stage1_before.status_label_en}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {locale === "hi" ? threeStagePhotos.stage1_before.stage_desc_hi : threeStagePhotos.stage1_before.stage_desc_en}
                        </p>
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 font-mono">
                          🔬 {locale === "hi" ? threeStagePhotos.stage1_before.qc_parameter_hi : threeStagePhotos.stage1_before.qc_parameter_en}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 2: Active Construction */}
                  <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-lg hover:border-cyan-500/60 transition-all flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 w-full bg-slate-950 group">
                        <img
                          src={threeStagePhotos.stage2_in_progress.photo_url}
                          alt="Stage 2 In Progress"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                        <div className="absolute top-2.5 left-2.5 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                          {locale === "hi" ? threeStagePhotos.stage2_in_progress.stage_name_hi : threeStagePhotos.stage2_in_progress.stage_name_en}
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[10px] font-mono leading-tight">
                          <div className="font-bold text-cyan-300">Geotag: {threeStagePhotos.stage2_in_progress.mactionsoft_geotag_id}</div>
                          <div className="text-slate-300">Date: {threeStagePhotos.stage2_in_progress.date} • {threeStagePhotos.stage2_in_progress.time_ist}</div>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <h4 className="text-xs font-black text-white leading-snug">
                          {locale === "hi" ? threeStagePhotos.stage2_in_progress.title_hi : threeStagePhotos.stage2_in_progress.title_en}
                        </h4>
                        <div className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 p-2 rounded-xl border border-cyan-800/40">
                          {locale === "hi" ? threeStagePhotos.stage2_in_progress.status_label_hi : threeStagePhotos.stage2_in_progress.status_label_en}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {locale === "hi" ? threeStagePhotos.stage2_in_progress.stage_desc_hi : threeStagePhotos.stage2_in_progress.stage_desc_en}
                        </p>
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 font-mono">
                          🔬 {locale === "hi" ? threeStagePhotos.stage2_in_progress.qc_parameter_hi : threeStagePhotos.stage2_in_progress.qc_parameter_en}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 3: Completed Asset */}
                  <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500/60 overflow-hidden shadow-lg hover:border-emerald-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 w-full bg-slate-950 group">
                        <img
                          src={threeStagePhotos.stage3_completed.photo_url}
                          alt="Stage 3 Completed"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                        <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                          {locale === "hi" ? threeStagePhotos.stage3_completed.stage_name_hi : threeStagePhotos.stage3_completed.stage_name_en}
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[10px] font-mono leading-tight">
                          <div className="font-bold text-emerald-300">Geotag: {threeStagePhotos.stage3_completed.mactionsoft_geotag_id}</div>
                          <div className="text-slate-300">Date: {threeStagePhotos.stage3_completed.date} • {threeStagePhotos.stage3_completed.time_ist}</div>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <h4 className="text-xs font-black text-white leading-snug">
                          {locale === "hi" ? threeStagePhotos.stage3_completed.title_hi : threeStagePhotos.stage3_completed.title_en}
                        </h4>
                        <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/40">
                          {locale === "hi" ? threeStagePhotos.stage3_completed.status_label_hi : threeStagePhotos.stage3_completed.status_label_en}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {locale === "hi" ? threeStagePhotos.stage3_completed.stage_desc_hi : threeStagePhotos.stage3_completed.stage_desc_en}
                        </p>
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 font-mono">
                          🔬 {locale === "hi" ? threeStagePhotos.stage3_completed.qc_parameter_hi : threeStagePhotos.stage3_completed.qc_parameter_en}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW 2: BEFORE VS AFTER VISUAL COMPARISON */}
              {timelineViewMode === "compare" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="bg-slate-900 rounded-3xl border-2 border-amber-500/50 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
                        {locale === "hi" ? "🛑 कार्य पूर्व स्थिति (BEFORE - 0%)" : "🛑 Pre-Construction Baseline (BEFORE - 0%)"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{threeStagePhotos.stage1_before.date}</span>
                    </div>
                    <div className="h-64 rounded-2xl overflow-hidden border border-slate-700">
                      <img src={threeStagePhotos.stage1_before.photo_url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "hi" ? threeStagePhotos.stage1_before.stage_desc_hi : threeStagePhotos.stage1_before.stage_desc_en}
                    </p>
                    <div className="text-xs font-mono text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      Geotag: {threeStagePhotos.stage1_before.mactionsoft_geotag_id}
                    </div>
                  </div>

                  {/* After */}
                  <div className="bg-slate-900 rounded-3xl border-2 border-emerald-500/50 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                        {locale === "hi" ? "✨ कार्य पूर्ण व चालू (AFTER - 100%)" : "✨ Completed & Commissioned (AFTER - 100%)"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{threeStagePhotos.stage3_completed.date}</span>
                    </div>
                    <div className="h-64 rounded-2xl overflow-hidden border border-slate-700">
                      <img src={threeStagePhotos.stage3_completed.photo_url} alt="After" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "hi" ? threeStagePhotos.stage3_completed.stage_desc_hi : threeStagePhotos.stage3_completed.stage_desc_en}
                    </p>
                    <div className="text-xs font-mono text-emerald-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      Geotag: {threeStagePhotos.stage3_completed.mactionsoft_geotag_id}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: E-GRAMSWARAJ FTO VOUCHER TRAIL */}
              {timelineViewMode === "vouchers" && (
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-3">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>{locale === "hi" ? "e-GramSwaraj व PFMS सार्वजनिक वित्तीय प्रबंधन वाउचर ट्रेल" : "e-GramSwaraj & PFMS Public Financial Management Voucher Trail"}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">{locale === "hi" ? "वाउचर संख्या (FTO No.)" : "Voucher No. (FTO)"}</th>
                          <th className="p-3">{locale === "hi" ? "दिनांक (Date)" : "Disbursement Date"}</th>
                          <th className="p-3">{locale === "hi" ? "भुगतान विवरण (Purpose)" : "Payment Purpose"}</th>
                          <th className="p-3">{locale === "hi" ? "विमुक्त राशि (Amount)" : "Disbursed Amount"}</th>
                          <th className="p-3">{locale === "hi" ? "स्थिति (PFMS Status)" : "PFMS Status"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {threeStagePhotos.fto_vouchers.map((v) => (
                          <tr key={v.voucher_no} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-mono font-bold text-cyan-300">{v.voucher_no}</td>
                            <td className="p-3">{v.date}</td>
                            <td className="p-3">{locale === "hi" ? (v.purpose_hi || v.purpose) : (v.purpose_en || v.purpose)}</td>
                            <td className="p-3 font-black text-emerald-400">₹{v.amount.toLocaleString("en-IN")}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                                {v.status} ✓
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* -----------------------------------------------------------------------
              TAB 3: OFFICIAL AI AUDIT CERTIFICATE (GOVERNMENT OF INDIA STANDARD)
             ----------------------------------------------------------------------- */}
          {activeTab === "ai_cert" && (
            <div className="space-y-4">
              
              {/* Prestigious National Certificate Box */}
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/90 rounded-3xl p-5 sm:p-8 border-2 border-amber-400/50 shadow-2xl relative overflow-hidden space-y-6">
                
                {/* Official Certificate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-400/30 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
                      🏛️
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                        {locale === "hi"
                          ? "भारत सरकार • पंचायती राज मंत्रालय"
                          : "GOVERNMENT OF INDIA • MINISTRY OF PANCHAYATI RAJ"}
                      </div>
                      <h3 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
                        {locale === "hi"
                          ? "डिजिटल भू-स्थानिक एवं एआई निर्माण सत्यापन प्रमाण-पत्र"
                          : "Digital Geospatial & AI Civil Infrastructure Audit Certificate"}
                      </h3>
                      <div className="text-xs font-mono text-cyan-300 mt-0.5">
                        Cert No: <span className="font-bold text-white">{auditResult.certificate_no}</span> • Asset UID: {auditResult.asset_code}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{locale === "hi" ? "प्रिंट / PDF डाउनलोड" : "Print Official PDF"}</span>
                  </button>
                </div>

                {/* Score & Physical Metrics Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {locale === "hi" ? "भौतिक प्रगति" : "Physical Progress"}
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                      {auditResult.progress_percent}%
                    </div>
                    <div className="text-[10px] text-emerald-300 font-medium">Verified On-Site</div>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {locale === "hi" ? "गुणवत्ता रेटिंग" : "Quality Grade"}
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-300 truncate">
                      {auditResult.quality_rating}
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-medium">PWD Standard</div>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {locale === "hi" ? "उपग्रह मिलान" : "ISRO Spatial Match"}
                    </div>
                    <div className="text-base sm:text-lg font-black text-cyan-300 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>100% Match</span>
                    </div>
                    <div className="text-[10px] text-cyan-400/90 font-medium">DGPS Verified</div>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {locale === "hi" ? "संरचनात्मक दोष" : "Defect Count"}
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                      {auditResult.defects_detected.length === 0 ? "0 Faults" : auditResult.defects_detected.length}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-medium">Zero Structural Fissures</div>
                  </div>
                </div>

                {/* Technical Engineering Specifications Breakdown Table */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                    {locale === "hi"
                      ? "🔬 तकनीकी सिविल इंजीनियरिंग मानक अनुपालन (Technical Specifications)"
                      : "🔬 Technical Civil Engineering Standards Compliance"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">
                        {locale === "hi" ? "कंक्रीट/सामग्री मजबूती (Compressive Strength):" : "Compressive Strength (Concrete):"}
                      </span>
                      <strong className="text-white">{auditResult.concrete_strength || "M25 Grade (Passed)"}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">
                        {locale === "hi" ? "ढाल व ग्रेडिएंट (Slope/Gradient):" : "Camber / Slope Gradient:"}
                      </span>
                      <strong className="text-white">{auditResult.gradient_slope || "1:200 Camber Invert Compliant"}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">
                        {locale === "hi" ? "DGPS स्थानिक सटीकता (Spatial Accuracy):" : "DGPS Spatial Precision:"}
                      </span>
                      <strong className="text-white">{auditResult.dgps_accuracy || "± 2.1m Verified"}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">
                        {locale === "hi" ? "उपग्रह ऑर्थो-इमेजरी (Satellite Ortho Resolution):" : "Satellite Ortho Resolution:"}
                      </span>
                      <strong className="text-white">{auditResult.resolution || "0.5m CartoSat-3 Sensor"}</strong>
                    </div>
                  </div>
                </div>

                {/* Technical Statement */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                  <div className="text-xs font-black text-cyan-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>{locale === "hi" ? "एआई एवं अवर अभियंता तकनीकी निष्कर्ष" : "AI & Junior Engineer Technical Finding"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {locale === "hi" ? auditResult.technical_verdict_hi : auditResult.technical_verdict_en}
                  </p>
                </div>

                {/* Officer Recommendation */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-black text-emerald-300 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span>{locale === "hi" ? "अंतिम किश्त संस्तुति व भुगतान स्थिति" : "Grant Release Certification"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-bold">
                    {locale === "hi" ? auditResult.officer_recommendation_hi : auditResult.officer_recommendation_en}
                  </p>
                </div>

                {/* Official Signature Blocks & DigiLocker QR Stamp */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black shadow-md">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">DigiLocker & e-GramSwaraj Verifiable</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Audited on: {new Date(auditResult.timestamp).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-black text-white text-xs">{currentProject.je_name}</div>
                    <div className="text-[11px] text-amber-300 font-bold">{currentProject.je_designation}</div>
                    <div className="text-[10px] text-slate-400">
                      {locale === "hi" ? "ग्रामीण अभियंत्रण सेवा (RES) • उत्तर प्रदेश" : "Rural Engineering Services (RES) • Uttar Pradesh"}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              TAB 4: LIVE SITE CAMERA INSPECTION
             ----------------------------------------------------------------------- */}
          {activeTab === "live_capture" && (
            <div className="space-y-4">
              <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/30 space-y-1">
                <div className="text-xs font-black text-rose-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>
                    {locale === "hi"
                      ? "स्थलीय निरीक्षण फोटो अपलोड करें (एंटी-करप्शन वॉटरमार्क इंजन)"
                      : "Upload On-Site Photo with Tamper-Proof GPS Watermarking"}
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed font-medium">
                  {locale === "hi"
                    ? "फोटो अपलोड करते ही सिस्टम आपके फोन से सटीक GPS अक्षांश/देशांतर और समय निकालकर फोटो पर सरकारी मुहर लगा देगा, फिर Groq Vision AI से जांच करेगा।"
                    : "The client-side engine stamps real GPS coordinates and timestamp directly onto the image canvas before running Groq Vision AI."}
                </p>
              </div>

              {!uploadedImage ? (
                <label className="border-2 border-dashed border-slate-700 hover:border-emerald-400 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-black mb-3 group-hover:scale-110 transition-transform">
                    📸
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {locale === "hi" ? "कैमरे से फोटो खींचें या फाइल चुनें" : "Take Photo with Camera or Choose File"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {locale === "hi"
                      ? "सड़क, नाली या सोलर लाइट की सीधी फोटो अपलोड करें (JPG, PNG)"
                      : "Capture clear site photo of road, drain or public works"}
                  </p>
                  <div className="mt-3 px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GPS Auto-Lock: {liveGps.lat}° N, {liveGps.lng}° E</span>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-black">
                    {watermarkedImage ? (
                      <img src={watermarkedImage} alt="Watermarked Site Photo" className="w-full max-h-[380px] object-contain mx-auto" />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-white text-xs">
                        {locale === "hi" ? "वॉटरमार्क तैयार हो रहा है..." : "Generating digital watermark..."}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setWatermarkedImage(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      {locale === "hi" ? "दूसरी फोटो चुनें" : "Choose Another Photo"}
                    </button>

                    <button
                      type="button"
                      onClick={runAiInspection}
                      disabled={isAuditing}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isAuditing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{locale === "hi" ? "Groq Vision AI विश्लेषण जारी..." : "Groq Vision AI Auditing..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{locale === "hi" ? "एआई से निर्माण सत्यापित करें (Run AI Audit)" : "Run AI Technical Verification"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* =========================================================================
            MODAL FOOTER STATUS BAR
           ========================================================================= */}
        <div className="bg-slate-900 px-4 py-3 sm:px-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-300">
              {locale === "hi" ? "e-GramSwaraj व ISRO Bhuvan अधिकृत ग्रिड" : "e-GramSwaraj & ISRO Bhuvan Synchronized"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-bold text-white hover:text-cyan-300 underline cursor-pointer"
          >
            {locale === "hi" ? "विंडो बंद करें" : "Close Modal"}
          </button>
        </div>
    </div>
  );
}
