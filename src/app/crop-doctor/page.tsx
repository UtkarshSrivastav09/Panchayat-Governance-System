"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import ImageUploader from "@/components/ImageUploader";
import VoiceInput from "@/components/VoiceInput";
import DiagnosisCard from "@/components/DiagnosisCard";
import { DiagnosisResult } from "@/lib/validators";
import { getCurrentLocation } from "@/lib/geo";
import { getUserSession } from "@/lib/auth-storage";
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  FileCheck,
} from "lucide-react";

export default function CropDoctorPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert(locale === "hi" ? "कृपया पहले पौधे या पत्ते की फोटो चुनें।" : "Please select or take a photo first.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Get farmer location for clustering
      const loc = await getCurrentLocation();

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("user_note", userNote);
      formData.append("lat", loc.lat.toString());
      formData.append("lng", loc.lng.toString());
      formData.append("village", "Malihabad, Lucknow");

      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "जांच प्रक्रिया में विफलता");
      }

      setDiagnosis(data.diagnosis);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setErrorMessage(err.message || "तकनीकी त्रुटि। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut for hackathon testing (sample image loader)
  const handleQuickDemoPhoto = async () => {
    try {
      const res = await fetch("/images/sample-wheat-rust.jpg");
      if (res.ok) {
        const blob = await res.blob();
        const testFile = new File([blob], "sample-wheat-yellow-rust.jpg", { type: "image/jpeg" });
        setSelectedFile(testFile);
        setUserNote(
          locale === "hi"
            ? "गेहूं के पत्तों पर पीले-नारंगी धब्बे और धारियां हैं, छूने पर पीला चूर्ण हाथ में लग रहा है।"
            : "Yellow-orange powdery stripes and pustules observed on wheat leaves."
        );
        return;
      }
    } catch (e) {
      console.warn("Could not load sample image from path:", e);
    }

    try {
      // Fallback canvas generator if network fetch is blocked
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#2d5a27";
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "#eab308";
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(50 + Math.random() * 300, 50 + Math.random() * 300, 8 + Math.random() * 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const testFile = new File([blob], "demo-wheat-leaf-rust.jpg", { type: "image/jpeg" });
          setSelectedFile(testFile);
          setUserNote("गेहूं के पत्तों पर पीले-नारंगी धब्बे हैं और हाथ में चूर्ण लग रहा है।");
        }
      }, "image/jpeg");
    } catch (e) {
      console.warn("Could not create test canvas blob:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === "hi" ? "एआई फसल चिकित्सक" : "AI Crop Health Specialist"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t("crop_doctor.title")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {t("crop_doctor.subtitle")}
        </p>
      </div>

      {/* Main Diagnostic Input Card */}
      {!diagnosis ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-6"
        >
          {/* Step 1: Image Picker */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              १. {locale === "hi" ? "फसल / पत्ते की तस्वीर लें या चुनें:" : "Take or upload photo of crop:"}
            </label>
            <ImageUploader selectedFile={selectedFile} onImageSelected={setSelectedFile} />
          </div>

          {/* Quick Demo Photo Shortcut */}
          {!selectedFile && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleQuickDemoPhoto}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-colors"
              >
                🌾 {locale === "hi" ? "परीक्षण पत्ता फोटो लोड करें" : "Load sample test leaf photo"}
              </button>
            </div>
          )}

          {/* Step 2: Voice or Text symptom note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm sm:text-base font-bold text-slate-800">
                २. {locale === "hi" ? "लक्षण बोलकर या लिखकर बताएं:" : "Describe symptoms:"}
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {locale === "hi" ? "पूर्णतः वैकल्पिक (Optional)" : "100% Optional"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {locale === "hi"
                ? "💡 इसे खाली भी छोड़ सकते हैं — एआई सीधे आपकी फोटो के लक्षणों को पहचान कर परिणाम दे देगा।"
                : "💡 You can leave this blank — AI will diagnose the problem directly from the leaf photo."}
            </p>
            <VoiceInput
              initialValue={userNote}
              onTranscript={setUserNote}
              placeholder={
                locale === "hi"
                  ? "वैकल्पिक: माइक दबाकर लक्षण बोलें या सीधे नीचे बटन दबाएं..."
                  : "Optional: Speak symptoms or submit directly below..."
              }
            />
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all min-h-[54px] active:scale-95 ${
              loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>{t("crop_doctor.analyzing")}</span>
              </>
            ) : (
              <>
                <span>{t("crop_doctor.submit")}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Diagnosis Results View */
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {locale === "hi" ? "जाँच परिणाम विवरण" : "Diagnosis Results"}
            </h2>

            <button
              onClick={() => {
                setDiagnosis(null);
                setSelectedFile(null);
                setUserNote("");
              }}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 font-bold text-xs sm:text-sm transition-all min-h-[44px]"
            >
              🔄 {locale === "hi" ? "नई जाँच करें" : "New Diagnosis"}
            </button>
          </div>

          <DiagnosisCard diagnosis={diagnosis} />
        </div>
      )}
    </div>
  );
}
