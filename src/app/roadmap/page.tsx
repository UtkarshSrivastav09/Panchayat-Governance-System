"use client";

import { useI18n } from "@/lib/i18n";
import {
  FileText,
  Briefcase,
  GraduationCap,
  Landmark,
  HeartPulse,
  ShoppingBag,
  Cpu,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default function RoadmapPage() {
  const { locale } = useI18n();

  const futureModules = [
    {
      title_hi: "शिकायत पंजीकरण एवं त्वरित समाधान",
      title_en: "Panchayat Complaint Registration & Geo-Routing",
      desc_hi: "नाली, सड़क, स्ट्रीट लाइट और पानी की समस्या की फोटो खींचकर सीधे ग्राम प्रधान और बीडीओ तक पहुंचाना।",
      icon: FileText,
      badge: "Phase 2 Roadmap",
      color: "bg-blue-500",
    },
    {
      title_hi: "सरकारी योजनाएं और ग्रामीण रोजगार",
      title_en: "Government Welfare Schemes & Rural Jobs",
      desc_hi: "पीएम किसान, फसल बीमा, मनरेगा और वृद्धा पेंशन की पात्रता जांच और सीधे आवेदन लिंक।",
      icon: Briefcase,
      badge: "Phase 2 Roadmap",
      color: "bg-emerald-500",
    },
    {
      title_hi: "मुफ्त ग्रामीण शिक्षा व कौशल विकास",
      title_en: "Free Village Education & Skill Hub",
      desc_hi: "गाँव के बच्चों और युवाओं के लिए ऑडियो-वीडियो ज्ञान, परीक्षा तैयारी व कृषि कौशल कार्यशाला।",
      icon: GraduationCap,
      badge: "Phase 3 Roadmap",
      color: "bg-purple-500",
    },
    {
      title_hi: "भूलेख एवं खसरा-खतौनी लिंक",
      title_en: "Land Records (Khasra / Khatauni) Access",
      desc_hi: "उत्तर प्रदेश भूलेख पोर्टल से सीधा जुड़ाव ताकि किसान एक क्लिक में अपनी खतौनी देख सकें।",
      icon: Landmark,
      badge: "Phase 3 Roadmap",
      color: "bg-amber-500",
    },
    {
      title_hi: "ई-संजीवनी व ग्रामीण स्वास्थ्य सहायक",
      title_en: "e-Sanjeevani Tele-Consultation & Healthcare",
      desc_hi: "नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC), डॉक्टर से वीडियो सलाह और दवा उपलब्धता।",
      icon: HeartPulse,
      badge: "Phase 3 Roadmap",
      color: "bg-rose-500",
    },
    {
      title_hi: "स्थानीय किराना व स्वयं सहायता समूह बाजार",
      title_en: "SHG Local Market & Rural Payments",
      desc_hi: "गाँव के स्वयं सहायता समूहों द्वारा तैयार आचार, पापड़, बीज व खाद का स्थानीय हाट।",
      icon: ShoppingBag,
      badge: "Phase 4 Roadmap",
      color: "bg-teal-500",
    },
    {
      title_hi: "भविष्यवाणी एआई (ML Price Forecast)",
      title_en: "Advanced AI Mandi Price Prediction",
      desc_hi: "मौसम, आवक और ऐतिहासिक रुझानों के आधार पर अगले 15 दिनों के संभावित मंडी भाव का अनुमान।",
      icon: Cpu,
      badge: "Phase 4 Roadmap",
      color: "bg-indigo-500",
    },
    {
      title_hi: "व्हाट्सएप बॉट व एसएमएस अलर्ट",
      title_en: "WhatsApp Bot & Offline SMS Push",
      desc_hi: "बिना इंटरनेट वाले साधारण कीपैड फोन पर भी बीमारी चेतावनी और मौसम का एसएमएस।",
      icon: Smartphone,
      badge: "Phase 4 Roadmap",
      color: "bg-green-600",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === "hi" ? "उत्तर प्रदेश पंचायती राज • डिजिटल ग्राम मिशन" : "Digital Gram Mission • Strategic Roadmap"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {locale === "hi"
            ? "ग्रामसेतु: आगामी डिजिटल सेवाएं"
            : "GramSetu: Strategic Services Roadmap"}
        </h1>

        <p className="text-sm sm:text-base text-slate-600">
          {locale === "hi"
            ? "यह आगामी चरण हैं जिन्हें ग्रामीण विकास के लिए योजनाबद्ध किया गया है। वर्तमान में 3 प्रमुख मुख्य मॉड्यूल (फसल डॉक्टर, आउटब्रेक मैप, मंडी भाव) लाइव और पूरी तरह कार्यरत हैं।"
            : "These planned modules represent upcoming phases for comprehensive village governance. The 3 core pillars (Crop Doctor, Outbreak Map, Mandi Helper) are fully operational."}
        </p>
      </div>

      {/* Grid of future modules */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {futureModules.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md flex items-start gap-4 transition-all hover:border-emerald-300 hover:shadow-lg"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shrink-0 shadow-md`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {locale === "hi" ? item.title_hi : item.title_en}
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {locale === "hi" ? item.desc_hi : item.desc_hi}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
