"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getUserSession, updateUserSession } from "@/lib/auth-storage";
import {
  MapPin,
  Compass,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  CloudSun,
  Navigation,
} from "lucide-react";

interface LocationPromptProps {
  onLocationDetected?: (loc: {
    village: string;
    district: string;
    state: string;
    lat: number;
    lng: number;
  }) => void;
}

export default function LocationPromptModal({ onLocationDetected }: LocationPromptProps) {
  const { locale } = useI18n();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectedLocation, setDetectedLocation] = useState<{
    village: string;
    district: string;
    state: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadyDetected = sessionStorage.getItem("gramsetu_location_detected");
    if (alreadyDetected) {
      setDismissed(true);
      return;
    }

    // Check if navigator.geolocation exists
    if (navigator.geolocation) {
      // Check permission state if supported by browser
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permissionStatus) => {
            if (permissionStatus.state === "granted") {
              requestBrowserLocation(true);
            } else if (permissionStatus.state === "prompt") {
              // Show prompt banner so user has clear context before browser prompt
              setShowPrompt(true);
            } else {
              setDismissed(true);
            }
          })
          .catch(() => {
            setShowPrompt(true);
          });
      } else {
        setShowPrompt(true);
      }
    }
  }, []);

  const requestBrowserLocation = (isInitialAuto: boolean = false) => {
    if (!navigator.geolocation) {
      setShowPrompt(false);
      setDismissed(true);
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}&lang=${locale}`);
          let loc = {
            village: locale === "hi" ? "मलिहाबाद" : "Malihabad",
            district: locale === "hi" ? "लखनऊ" : "Lucknow",
            state: locale === "hi" ? "उत्तर प्रदेश" : "Uttar Pradesh",
            lat: latitude,
            lng: longitude,
          };

          if (res.ok) {
            const data = await res.json();
            loc = {
              village: data.village || (locale === "hi" ? "मलिहाबाद" : "Malihabad"),
              district: data.district || (locale === "hi" ? "लखनऊ" : "Lucknow"),
              state: data.state || (locale === "hi" ? "उत्तर प्रदेश" : "Uttar Pradesh"),
              lat: latitude,
              lng: longitude,
            };
          }

          setDetectedLocation(loc);
          sessionStorage.setItem("gramsetu_location_detected", "true");
          sessionStorage.setItem("gramsetu_user_lat", String(latitude));
          sessionStorage.setItem("gramsetu_user_lng", String(longitude));

          // Update user profile session in auth-storage
          updateUserSession({
            village: loc.village,
            district: loc.district,
            state: loc.state,
          });

          // Dispatch global event so Dashboard, Navbar & Maps update immediately
          window.dispatchEvent(
            new CustomEvent("gramsetu-location-updated", {
              detail: loc,
            })
          );

          if (onLocationDetected) {
            onLocationDetected(loc);
          }

          // Automatically remove the popup completely after 1.2s brief feedback
          setTimeout(() => {
            setShowPrompt(false);
            setDetectedLocation(null);
            setDismissed(true);
          }, 1200);
        } catch (err) {
          console.warn("Reverse geocode failed:", err);
          setShowPrompt(false);
          setDismissed(true);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (!isInitialAuto) {
          setErrorMsg(
            locale === "hi"
              ? "ब्राउज़र ने लोकेशन अनुमति अस्वीकार कर दी। कृपया ब्राउज़र सेटिंग्स में लोकेशन 'Allow' करें।"
              : "Location permission denied. Please allow location access in your browser address bar."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // If dismissed or neither prompt nor detected feedback is active, render nothing
  if (dismissed) return null;
  if (!showPrompt && !detectedLocation) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Subtle Government Portal Accent Bar (Tricolor stripe) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

        <button
          type="button"
          onClick={() => {
            setShowPrompt(false);
            setDetectedLocation(null);
            setDismissed(true);
            sessionStorage.setItem("gramsetu_location_detected", "dismissed");
          }}
          className="absolute right-3 top-3 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {detectedLocation ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                {locale === "hi" ? "लोकेशन सत्यापित" : "Location Synchronized"}
              </div>
              <div className="text-xs font-black text-white truncate">
                {detectedLocation.village}, {detectedLocation.district}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {detectedLocation.lat.toFixed(4)}° N, {detectedLocation.lng.toFixed(4)}° E
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                  {locale === "hi" ? "ग्राम पंचायत पहचान" : "PANCHAYAT VERIFICATION"}
                </div>
                <h4 className="text-xs font-black text-white leading-tight">
                  {locale === "hi"
                    ? "सटीक पंचायत डेटा हेतु लोकेशन चालू करें"
                    : "Enable Location for Panchayat Data"}
                </h4>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              {locale === "hi"
                ? "आपकी वास्तविक ग्राम पंचायत, मंडी भाव और विकास कार्यों को सीधे सरकारी पोर्टल से लोड करने हेतु आवश्यक है।"
                : "Required to load your exact village development records, wholesale mandi prices, and local weather."}
            </p>

            {errorMsg && (
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => requestBrowserLocation(false)}
                disabled={isDetecting}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isDetecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === "hi" ? "खोज रहे हैं..." : "Detecting..."}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{locale === "hi" ? "लोकेशन चालू करें" : "Allow Location"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPrompt(false);
                  setDismissed(true);
                  sessionStorage.setItem("gramsetu_location_detected", "dismissed");
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                {locale === "hi" ? "बाद में" : "Later"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
