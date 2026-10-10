"use client";

import { useState } from "react";
import { DiagnosisResult } from "@/lib/validators";
import { useI18n } from "@/lib/i18n";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Leaf,
  FlaskConical,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
}

export default function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const { t, locale } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);

  // Preload voices on mount for Chrome/Edge
  useState(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  });

  const handleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(
        locale === "hi"
          ? "आपके ब्राउज़र में आवाज़ पढ़ने की सुविधा उपलब्ध नहीं है।"
          : "Text-to-speech is not supported in this browser."
      );
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const isEn = locale === "en";
    const textToSpeak = isEn
      ? (diagnosis.is_healthy
          ? `Your crop is completely healthy. Crop identified: ${diagnosis.crop_key || "crop"}. No pests or diseases detected.`
          : `Crop: ${diagnosis.crop_key || "Crop"}. Detected Disease: ${diagnosis.disease_name_en || diagnosis.disease_name_hi || "Leaf infection"}. Severity: ${
              diagnosis.severity === "high" ? "High" : diagnosis.severity === "medium" ? "Medium" : "Low"
            }. Recommended treatment: ${(diagnosis.treatment_hi || []).slice(0, 2).join(". ")}. Note: Please verify with your local agricultural officer before spraying.`)
      : (diagnosis.is_healthy
          ? `आपकी फसल बिल्कुल स्वस्थ है। फसल का नाम ${diagnosis.crop_name_hi || "फसल"} है। कोई बीमारी नहीं पाई गई।`
          : `फसल का नाम: ${diagnosis.crop_name_hi || "फसल"}। संभावित बीमारी: ${diagnosis.disease_name_hi || "बीमारी"}। रोग की गंभीरता: ${
              diagnosis.severity === "high" ? "गंभीर" : diagnosis.severity === "medium" ? "मध्यम" : "हल्की"
            }। मुख्य उपचार: ${(diagnosis.treatment_hi || []).slice(0, 2).join(". ")}। देशी उपाय: ${(diagnosis.organic_options_hi || []).slice(0, 1).join(". ")}। ध्यान दें: दवा छिड़कने से पहले कृषि अधिकारी से पुष्टि ज़रूर करें।`);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isEn ? "en-IN" : "hi-IN";
    utterance.rate = 0.95;

    // Pick voice
    const voices = window.speechSynthesis.getVoices();
    if (isEn) {
      const enVoice = voices.find(
        (v) => v.lang.includes("en-IN") || v.lang.includes("en-US") || v.lang.includes("en")
      );
      if (enVoice) utterance.voice = enVoice;
    } else {
      const hiVoice = voices.find(
        (v) => v.lang.includes("hi") || v.name.includes("Hindi")
      );
      if (hiVoice) utterance.voice = hiVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const confidencePercent = Math.round(diagnosis.confidence * 100);
  const isLowConfidence = diagnosis.confidence < 0.6;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Banner Header */}
      <div
        className={`p-6 sm:p-7 border-b text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          diagnosis.is_healthy
            ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800"
            : diagnosis.severity === "high"
            ? "bg-gradient-to-r from-rose-700 via-red-600 to-amber-700"
            : "bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
            {diagnosis.is_healthy ? (
              <ShieldCheck className="w-8 h-8 text-white" />
            ) : (
              <Stethoscope className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full bg-white/25 backdrop-blur-sm text-white">
                {diagnosis.crop_name_hi || diagnosis.crop_key || "फसल"}
              </span>
              <span className="text-xs text-white/80 font-medium">
                ({diagnosis.crop_key?.toUpperCase() || "CROP"})
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
              {diagnosis.is_healthy
                ? t("crop_doctor.healthy_crop")
                : diagnosis.disease_name_hi || "रोग की पहचान"}
            </h3>

            {!diagnosis.is_healthy && diagnosis.disease_name_en && (
              <p className="text-sm text-white/90 font-medium mt-0.5">
                {diagnosis.disease_name_en}
              </p>
            )}
          </div>
        </div>

        {/* Read Aloud Voice Button */}
        <button
          onClick={handleReadAloud}
          className={`self-start sm:self-center px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-md active:scale-95 min-h-[48px] ${
            isPlaying
              ? "bg-amber-400 text-slate-900 animate-pulse ring-4 ring-amber-200"
              : "bg-white text-slate-900 hover:bg-slate-50"
          }`}
          aria-label={isPlaying ? t("crop_doctor.stop_reading") : t("crop_doctor.read_aloud")}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-5 h-5 text-slate-900" />
              <span>{t("crop_doctor.stop_reading")}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-emerald-700" />
              <span>{t("crop_doctor.read_aloud")}</span>
            </>
          )}
        </button>
      </div>

      {/* Badges: Confidence & Severity */}
      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Confidence Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isLowConfidence
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}
          >
            {isLowConfidence ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>
              {t("crop_doctor.confidence")}: {confidencePercent}%
            </span>
          </div>

          {/* Severity Badge */}
          {!diagnosis.is_healthy && diagnosis.severity && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                diagnosis.severity === "high"
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : diagnosis.severity === "medium"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-blue-50 text-blue-800 border-blue-300"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {t("crop_doctor.severity")}:{" "}
                {diagnosis.severity === "high"
                  ? t("crop_doctor.severity_high")
                  : diagnosis.severity === "medium"
                  ? t("crop_doctor.severity_medium")
                  : t("crop_doctor.severity_low")}
              </span>
            </div>
          )}
        </div>

        {diagnosis.photo_quality_note_hi && (
          <p className="text-xs text-amber-700 font-medium bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
            📸 {diagnosis.photo_quality_note_hi}
          </p>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Symptoms Section */}
        {diagnosis.symptoms_hi && diagnosis.symptoms_hi.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{t("crop_doctor.symptoms")}</span>
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
              {diagnosis.symptoms_hi.map((sym, idx) => (
                <li
                  key={idx}
                  className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{sym}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Treatment Guidance (Chemical / Practical) */}
        {diagnosis.treatment_hi && diagnosis.treatment_hi.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              <span>{t("crop_doctor.treatment")}</span>
            </h4>
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2">
              {diagnosis.treatment_hi.map((treat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed font-medium">{treat}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organic & Traditional Remedies */}
        {diagnosis.organic_options_hi && diagnosis.organic_options_hi.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Leaf className="w-5 h-5 text-green-600" />
              <span>{t("crop_doctor.organic_options")}</span>
            </h4>
            <div className="bg-green-50/40 rounded-2xl p-4 border border-green-200/70 space-y-2">
              {diagnosis.organic_options_hi.map((org, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-green-950">
                  <span className="text-green-600 font-bold">🌿</span>
                  <p className="leading-relaxed">{org}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prevention */}
        {diagnosis.prevention_hi && diagnosis.prevention_hi.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>{t("crop_doctor.prevention")}</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {diagnosis.prevention_hi.map((prev, idx) => (
                <li
                  key={idx}
                  className="bg-teal-50/30 rounded-xl p-3 border border-teal-100/60 flex items-start gap-2"
                >
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{prev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* When to see Expert Warning */}
        {diagnosis.when_to_see_expert_hi && (
          <div className="rounded-2xl p-4 bg-amber-50/80 border border-amber-200/90 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-amber-900">
                {t("crop_doctor.expert_warning")}
              </h5>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {diagnosis.when_to_see_expert_hi}
              </p>
            </div>
          </div>
        )}

        {/* Mandatory Safety Disclaimer */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-semibold bg-slate-100/70 py-2.5 px-4 rounded-xl border border-slate-200 inline-block">
            ⚠️ {t("crop_doctor.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
