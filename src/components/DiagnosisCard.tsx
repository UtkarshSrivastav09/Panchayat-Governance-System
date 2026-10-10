"use client";

import { useState, useEffect } from "react";
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
  Languages,
} from "lucide-react";

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult;
}

export default function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const { t, locale, setLocale } = useI18n();
  // Language switcher state, initialized to current locale
  const [activeLang, setActiveLang] = useState<"hi" | "en">(locale);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync with global locale if user changes navbar toggle
  useEffect(() => {
    setActiveLang(locale);
  }, [locale]);

  // Preload speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const isEn = activeLang === "en";

  // Data mapping based on active language
  const cropName = isEn
    ? diagnosis.crop_name_en || diagnosis.crop_key?.toUpperCase() || "Wheat"
    : diagnosis.crop_name_hi || diagnosis.crop_key || "गेहूं (Wheat)";

  const diseasePrimary = isEn
    ? diagnosis.disease_name_en || diagnosis.disease_name_hi || "Leaf Rust"
    : diagnosis.disease_name_hi || diagnosis.disease_name_en || "पत्ती का रतुआ";

  const diseaseSecondary = isEn
    ? diagnosis.disease_name_hi
    : diagnosis.disease_name_en;

  const symptomsList =
    isEn && diagnosis.symptoms_en && diagnosis.symptoms_en.length > 0
      ? diagnosis.symptoms_en
      : diagnosis.symptoms_hi;

  const treatmentList =
    isEn && diagnosis.treatment_en && diagnosis.treatment_en.length > 0
      ? diagnosis.treatment_en
      : diagnosis.treatment_hi;

  const organicList =
    isEn && diagnosis.organic_options_en && diagnosis.organic_options_en.length > 0
      ? diagnosis.organic_options_en
      : diagnosis.organic_options_hi;

  const preventionList =
    isEn && diagnosis.prevention_en && diagnosis.prevention_en.length > 0
      ? diagnosis.prevention_en
      : diagnosis.prevention_hi;

  const expertAdvice =
    isEn && diagnosis.when_to_see_expert_en
      ? diagnosis.when_to_see_expert_en
      : diagnosis.when_to_see_expert_hi;

  const handleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(
        isEn
          ? "Text-to-speech is not supported in this browser."
          : "आपके ब्राउज़र में आवाज़ पढ़ने की सुविधा उपलब्ध नहीं है।"
      );
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = isEn
      ? diagnosis.is_healthy
        ? `Your crop is healthy. Crop identified: ${cropName}. No pathogen detected.`
        : `Crop: ${cropName}. Identified Disease: ${diseasePrimary}. Severity: ${
            diagnosis.severity === "high" ? "High action required" : diagnosis.severity === "medium" ? "Medium" : "Low"
          }. First treatment: ${treatmentList.slice(0, 2).join(". ")}. Organic option: ${organicList.slice(0, 1).join(". ")}. Advisory: Please confirm with your local agriculture officer before chemical spray.`
      : diagnosis.is_healthy
      ? `आपकी फसल बिल्कुल स्वस्थ है। फसल का नाम ${cropName} है। कोई बीमारी नहीं पाई गई।`
      : `फसल का नाम: ${cropName}। संभावित बीमारी: ${diseasePrimary}। रोग की गंभीरता: ${
          diagnosis.severity === "high" ? "गंभीर" : diagnosis.severity === "medium" ? "मध्यम" : "हल्की"
        }। मुख्य उपचार: ${treatmentList.slice(0, 2).join(". ")}। देशी उपाय: ${organicList.slice(0, 1).join(". ")}। ध्यान दें: रासायनिक दवा के छिड़काव से पहले कृषि अधिकारी से पुष्टि अवश्य करें।`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isEn ? "en-IN" : "hi-IN";
    utterance.rate = 0.95;

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

  const toggleLanguage = (lang: "hi" | "en") => {
    setActiveLang(lang);
    setLocale(lang);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const confidencePercent = Math.round(diagnosis.confidence * 100);
  const isLowConfidence = diagnosis.confidence < 0.6;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Banner Header */}
      <div
        className={`p-6 sm:p-7 border-b text-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          diagnosis.is_healthy
            ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800"
            : diagnosis.severity === "high"
            ? "bg-gradient-to-r from-rose-700 via-red-600 to-amber-700"
            : "bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
            {diagnosis.is_healthy ? (
              <ShieldCheck className="w-8 h-8 text-white" />
            ) : (
              <Stethoscope className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full bg-white/25 backdrop-blur-sm text-white">
                {cropName}
              </span>
              <span className="text-xs text-white/80 font-medium">
                ({diagnosis.crop_key?.toUpperCase() || "CROP"})
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
              {diagnosis.is_healthy
                ? isEn
                  ? "Healthy Crop - No Disease Detected"
                  : "फसल पूर्णतः स्वस्थ है"
                : diseasePrimary}
            </h3>

            {!diagnosis.is_healthy && diseaseSecondary && (
              <p className="text-sm text-white/90 font-medium mt-0.5">
                {diseaseSecondary}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Controls: Hindi/English Switcher & Voice Readout */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {/* Bilingual Switcher Pill */}
          <div className="inline-flex items-center rounded-2xl bg-black/25 backdrop-blur-md p-1 border border-white/20 shadow-inner">
            <button
              type="button"
              onClick={() => toggleLanguage("hi")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
                !isEn
                  ? "bg-white text-emerald-900 shadow-md scale-100"
                  : "text-white/85 hover:text-white"
              }`}
            >
              <span>🇮🇳</span>
              <span>हिन्दी</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage("en")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
                isEn
                  ? "bg-white text-emerald-900 shadow-md scale-100"
                  : "text-white/85 hover:text-white"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>

          {/* Read Aloud Voice Button */}
          <button
            onClick={handleReadAloud}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 min-h-[42px] ${
              isPlaying
                ? "bg-amber-400 text-slate-900 animate-pulse ring-4 ring-amber-200"
                : "bg-white text-slate-900 hover:bg-slate-50"
            }`}
            aria-label={isPlaying ? (isEn ? "Stop Audio" : "आवाज़ बंद करें") : isEn ? "Read Aloud" : "बोलकर सुनें"}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-900" />
                <span>{isEn ? "Stop Audio" : "आवाज़ बंद करें"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>{isEn ? "Read Aloud 🔊" : "बोलकर सुनें 🔊"}</span>
              </>
            )}
          </button>
        </div>
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
              {isEn ? "Confidence" : "सटीकता"}: {confidencePercent}%
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
                {isEn ? "Severity: " : "गंभीरता: "}
                {diagnosis.severity === "high"
                  ? isEn
                    ? "High (Action Required)"
                    : "गंभीर (तुरंत उपचार)"
                  : diagnosis.severity === "medium"
                  ? isEn
                    ? "Medium"
                    : "मध्यम"
                  : isEn
                  ? "Low"
                  : "हल्की"}
              </span>
            </div>
          )}
        </div>

        {diagnosis.photo_quality_note_hi && (
          <p className="text-xs text-amber-700 font-medium bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
            📸 {isEn ? (diagnosis.photo_quality_note_en || diagnosis.photo_quality_note_hi) : diagnosis.photo_quality_note_hi}
          </p>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Symptoms Section */}
        {symptomsList && symptomsList.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{isEn ? "Symptoms & Visual Indicators" : "पहचाने गए लक्षण"}</span>
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
              {symptomsList.map((sym, idx) => (
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
        {treatmentList && treatmentList.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              <span>{isEn ? "Treatment & Medicines" : "रासायनिक व मुख्य उपचार"}</span>
            </h4>
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2.5">
              {treatmentList.map((treat, idx) => (
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
        {organicList && organicList.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Leaf className="w-5 h-5 text-green-600" />
              <span>{isEn ? "Organic & Traditional Remedies" : "देशी एवं प्राकृतिक उपचार"}</span>
            </h4>
            <div className="bg-green-50/40 rounded-2xl p-4 border border-green-200/70 space-y-2.5">
              {organicList.map((org, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-green-950">
                  <span className="text-green-600 font-bold shrink-0">🌿</span>
                  <p className="leading-relaxed">{org}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prevention */}
        {preventionList && preventionList.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>{isEn ? "Preventive Measures" : "भविष्य से बचाव के उपाय"}</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {preventionList.map((prev, idx) => (
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
        {expertAdvice && (
          <div className="rounded-2xl p-4 bg-amber-50/80 border border-amber-200/90 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-amber-900">
                {isEn ? "When to consult an expert" : "कृषि विशेषज्ञ से कब संपर्क करें"}
              </h5>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {expertAdvice}
              </p>
            </div>
          </div>
        )}

        {/* Mandatory Safety Disclaimer */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-semibold bg-slate-100/70 py-2.5 px-4 rounded-xl border border-slate-200 inline-block">
            {isEn
              ? "⚠️ AI diagnostic guidance is advisory. Always consult your Block Agriculture Extension Officer before spraying chemicals."
              : "⚠️ एआई परामर्श केवल मार्गदर्शन के लिए है। रासायनिक छिड़काव से पहले कृषि रक्षा अधिकारी की पुष्टि अवश्य लें।"}
          </p>
        </div>
      </div>
    </div>
  );
}
