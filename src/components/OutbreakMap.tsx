"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useI18n } from "@/lib/i18n";
import { AlertTriangle, Users, Calendar, MapPin, CheckCircle, ShieldAlert } from "lucide-react";

export interface OutbreakCluster {
  cluster_key: string;
  crop_key: string;
  disease_key: string;
  report_count: number;
  farmer_count: number;
  center_lat: number;
  center_lng: number;
  latest_report: string;
  crop_name_hi?: string;
  disease_name_hi?: string;
  status?: "open" | "verified" | "resolved";
  distance_km?: number;
  note?: string;
}

interface OutbreakMapProps {
  clusters: OutbreakCluster[];
  userLocation?: { lat: number; lng: number };
  onSelectCluster?: (cluster: OutbreakCluster) => void;
}

export default function OutbreakMap({
  clusters,
  userLocation = { lat: 26.8467, lng: 80.9462 },
  onSelectCluster,
}: OutbreakMapProps) {
  const { t, locale } = useI18n();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<OutbreakCluster | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize MapLibre GL map with OpenStreetMap free raster tiles
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [userLocation.lng, userLocation.lat],
      zoom: 11,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add User Current Location Marker (blue pulsing icon)
    const userEl = document.createElement("div");
    userEl.className = "user-loc-marker";
    userEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-lg"></span>
      </div>
    `;
    new maplibregl.Marker({ element: userEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    // Add Markers for each Outbreak Cluster
    clusters.forEach((cluster) => {
      const el = document.createElement("div");
      el.className = "cluster-marker cursor-pointer transition-transform hover:scale-125";

      // Color based on status and severity
      const isVerified = cluster.status === "verified";
      const markerColor = isVerified ? "bg-amber-600 ring-amber-300" : "bg-rose-600 ring-rose-300";
      const markerSize = Math.min(48, 28 + cluster.farmer_count * 5);

      el.innerHTML = `
        <div class="relative flex items-center justify-center ${markerColor} text-white rounded-full font-black text-xs shadow-xl ring-4" style="width: ${markerSize}px; height: ${markerSize}px;">
          ${cluster.farmer_count}
          <span class="absolute -top-1 -right-1 text-[10px] bg-white text-slate-900 rounded-full px-1 shadow border">🌾</span>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedCluster(cluster);
        if (onSelectCluster) onSelectCluster(cluster);
        map.flyTo({ center: [cluster.center_lng, cluster.center_lat], zoom: 12.5 });
      });

      new maplibregl.Marker({ element: el })
        .setLngLat([cluster.center_lng, cluster.center_lat])
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [clusters, userLocation, onSelectCluster]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-emerald-200 shadow-xl bg-white">
      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-[420px] sm:h-[500px]" />

      {/* Legend overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md text-xs space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white" />
          <span>{locale === "hi" ? "आपकी वर्तमान स्थिति" : "Your Location"}</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-black">
            3
          </div>
          <span>{locale === "hi" ? "सक्रिय बीमारी क्लस्टर (3+ किसान)" : "Active Cluster (3+ farmers)"}</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-black">
            ✓
          </div>
          <span>{locale === "hi" ? "सत्यापित क्लस्टर" : "Verified by Officer"}</span>
        </div>
      </div>

      {/* Cluster Details Popup Sheet */}
      {selectedCluster && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-emerald-200 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {selectedCluster.disease_name_hi || selectedCluster.disease_key}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  {selectedCluster.crop_name_hi || selectedCluster.crop_key}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">{t("outbreaks.cluster_count")}</span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedCluster.farmer_count} {locale === "hi" ? "किसान" : "Farmers"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">{locale === "hi" ? "कुल रिपोर्ट" : "Reports"}</span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedCluster.report_count} {locale === "hi" ? "दर्ज" : "Filed"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(selectedCluster.latest_report).toLocaleDateString("hi-IN")}
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                selectedCluster.status === "verified"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {selectedCluster.status === "verified"
                ? t("outbreaks.status_verified")
                : t("outbreaks.status_open")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
