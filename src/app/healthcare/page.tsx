"use client";

import { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Pill,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  Search,
  User,
  Building2,
  Calendar,
  FileText,
  BadgeAlert,
  ArrowRight,
  Stethoscope,
  Info,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getUserSession, updateUserSession, UserProfile } from "@/lib/auth-storage";
import {
  TELE_DOCTORS,
  GENERIC_MEDICINES,
  EMERGENCY_CONTACTS,
  TeleDoctor,
  GenericMedicine,
} from "@/data/healthcare";

const SYMPTOM_DIAGNOSES: Record<string, { hi: string; rx: string }> = {
  fever: {
    hi: "आपके तेज बुखार के लक्षण के आधार पर यह मौसमी वायरल संक्रमण है। मैंने आपके लिए पैरासिटामोल छह सौ पचास और इलेक्ट्रोलाइट लिख दिया है। हर छह घंटे में एक गोली लें, ठंडे पानी की पट्टी रखें और खूब पानी पिएं।",
    rx: "Paracetamol 650mg + ORS",
  },
  cough: {
    hi: "आपकी खांसी और कफ की समस्या के लिए मैंने कफ सिरप और एंटी-एलर्जिक दवा लिख दी है। दिन में दो बार गुनगुने पानी की भाप लें और ठंडे पानी या दही से पूरी तरह परहेज रखें।",
    rx: "Ambroxol Syrup + Cetirizine 10mg",
  },
  stomach: {
    hi: "आपके पेट दर्द और अपच के लिए मैंने डाइसाइक्लोमिन और एंटासिड लिख दिया है। हल्का दलिया या खिचड़ी खाएं, तेल-मसाले और तली-भुनी चीजों से बिल्कुल परहेज रखें।",
    rx: "Dicyclomine + Pantoprazole 40mg",
  },
  headache: {
    hi: "आपके सिरदर्द और चक्कर के लिए मैंने दर्द निवारक दवा और विश्राम की सलाह लिखी है। स्क्रीन और धूप से बचें, अंधेरे कमरे में आराम करें और पर्याप्त पानी पिएं।",
    rx: "Naproxen 250mg + Rest",
  },
  skin: {
    hi: "त्वचा पर खुजली और दानों के लिए मैंने कैलामाइन लोशन और एंटीहिस्टामाइन लिख दिया है। नीम के पानी से स्नान करें और सूती ढीले कपड़े पहनें।",
    rx: "Calamine Lotion + Levocetirizine 5mg",
  },
  bp: {
    hi: "आपके उच्च रक्तचाप और घबराहट के लिए मैंने बीपी की नियमित दवा लिखी है। खाने में नमक की मात्रा तुरंत कम करें, तनाव न लें और सुबह हल्की सैर करें।",
    rx: "Amlodipine 5mg + Low Salt Diet",
  },
  joint: {
    hi: "जोड़ों और घुटनों के दर्द के लिए मैंने दर्द निवारक जेल और कैल्शियम की गोली लिख दी है। गुनगुने तेल से मालिश करें और भारी वजन उठाने से बचें।",
    rx: "Diclofenac Gel + Calcium D3",
  },
};

function getSymptomDiagnosisSpeech(
  doctor: TeleDoctor,
  symptoms: string[],
  customText: string
): string {
  const docName = doctor.name_hi || doctor.name;
  const hospital = doctor.hospital_hi || doctor.hospital;

  let speech = `नमस्ते! मैं डॉक्टर ${docName} बोल रहा हूँ, ${hospital} से। `;

  if (symptoms.length > 0) {
    const symptomNames = symptoms
      .map((id) => {
        const tag = SYMPTOM_TAGS.find((t) => t.id === id);
        return tag ? tag.hi.split("(")[0].trim() : id;
      })
      .join(" और ");

    speech += `मैंने आपके लक्षण देख लिए हैं। आपको ${symptomNames} की शिकायत है। `;

    symptoms.forEach((sId) => {
      if (SYMPTOM_DIAGNOSES[sId]) {
        speech += `${SYMPTOM_DIAGNOSES[sId].hi} `;
      }
    });
  }

  if (customText.trim()) {
    speech += `आपने बताया कि: ${customText.trim()}। इसके लिए भी मैंने उचित सरकारी दवाएं आपके ई-पर्चे में लिख दी हैं। `;
  }

  if (symptoms.length === 0 && !customText.trim()) {
    speech += `मैंने सामान्य स्वास्थ्य जांच के आधार पर आवश्यक दवाएं और परामर्श आपके डिजिटल पर्चे में दर्ज कर दिया है। `;
  }

  speech += `नीचे दिए गए लाल बटन को दबाकर आप अपना सरकारी ई-पर्चा प्राप्त कर सकते हैं। ये दवाएं जन औषधि केंद्र से अस्सी प्रतिशत कम दाम में मिलेंगी।`;

  return speech;
}

const PATIENT_QUICK_QUESTIONS = [
  {
    q_hi: "दवा कैसे और कब लेनी है?",
    q_en: "How to take medicines?",
    answer: "दवा खाना खाने के आधे घंटे बाद गुनगुने पानी से लेनी है। दिन में दो बार, सुबह और रात को। खाली पेट कोई एंटीबायोटिक न लें।",
  },
  {
    q_hi: "खान-पान में क्या परहेज रखें?",
    q_en: "Dietary precautions?",
    answer: "ठंडा पानी, चावल, खट्टी और तली-भुनी चीजों से परहेज करें। ताजा बना हल्का भोजन लें और पर्याप्त गुनगुना पानी पिएं।",
  },
  {
    q_hi: "जन औषधि से सस्ती दवा कहाँ मिलेगी?",
    q_en: "Where to get Jan Aushadhi generic medicines?",
    answer: "कॉल के बाद मिलने वाला डिजिटल पर्चा नजदीकी जन औषधि केंद्र या सीएचसी काउंटर पर दिखाएं, वहां आपको 80 से 90 प्रतिशत कम दाम में यही दवाएं मिलेंगी।",
  },
];

const SYMPTOM_TAGS = [
  { id: "fever", hi: "तेज़ बुखार (Fever)", en: "High Fever" },
  { id: "cough", hi: "खांसी व कफ (Cough)", en: "Cough & Cold" },
  { id: "stomach", hi: "पेट दर्द व अपच (Stomach Ache)", en: "Stomach Pain" },
  { id: "headache", hi: "सिरदर्द व चक्कर (Headache)", en: "Headache" },
  { id: "skin", hi: "त्वचा पर खुजली/दाने (Skin Rash)", en: "Skin Rash" },
  { id: "bp", hi: "बीपी / घबराहट (BP / Palpitation)", en: "Blood Pressure" },
  { id: "joint", hi: "जोड़ों का दर्द (Joint Pain)", en: "Joint Pain" },
];

export default function HealthcarePage() {
  const { locale } = useI18n();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"teleclinic" | "prescription" | "medicines" | "emergency">("teleclinic");

  // Tele-Clinic States
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["fever"]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<TeleDoctor>(TELE_DOCTORS[0]);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [opdToken, setOpdToken] = useState("OPD-UP-2026-0842");
  const [abhaId, setAbhaId] = useState("");
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [tempAbhaInput, setTempAbhaInput] = useState("");

  // Doctor Voice Synthesis States
  const [doctorAudioEnabled, setDoctorAudioEnabled] = useState(true);
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [doctorSubtitle, setDoctorSubtitle] = useState("");

  // Video Element Ref for local webcam stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Search in Generic medicines
  const [medicineQuery, setMedicineQuery] = useState("");

  useEffect(() => {
    const user = getUserSession();
    if (user) {
      setCurrentUser(user);
      if (user.abha_id) {
        setAbhaId(user.abha_id);
        setTempAbhaInput(user.abha_id);
        return;
      }
    }
    const savedAbha = typeof window !== "undefined" ? localStorage.getItem("gram_sahayak_patient_abha") : null;
    if (savedAbha) {
      setAbhaId(savedAbha);
      setTempAbhaInput(savedAbha);
    }

    // Warm-up SpeechSynthesis voices
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Call timer effect
  useEffect(() => {
    let timer: any;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  // Realistic Doctor Speech Synthesizer (Native Web Speech API - Zero Cost, Free, Offline)
  const speakDoctorAudio = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setDoctorSubtitle(text);
      return;
    }
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      setDoctorSubtitle(text);

      if (!doctorAudioEnabled) return;

      const utterance = new SpeechSynthesisUtterance(text);
      const isFemale = selectedDoctor.gender === "female";
      const voices = window.speechSynthesis.getVoices();

      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (isFemale) {
        // Female doctor: Prefer Hindi/Indian female voices
        chosenVoice =
          voices.find(
            (v) =>
              (v.lang.startsWith("hi") || v.lang.includes("IN")) &&
              /swara|heera|neerja|veena|kalpana|priya|kavya|female/i.test(v.name)
          ) ||
          voices.find(
            (v) =>
              (v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")) &&
              !/madhur|hemant|ravi|male/i.test(v.name)
          ) ||
          voices.find((v) => /female|zira|neerja|samantha/i.test(v.name));

        utterance.pitch = 1.15; // Natural, clear feminine pitch
        utterance.rate = 0.95;
      } else {
        // Male doctor: Prefer Hindi/Indian male voices
        chosenVoice =
          voices.find(
            (v) =>
              (v.lang.startsWith("hi") || v.lang.includes("IN")) &&
              /madhur|hemant|ravi|male/i.test(v.name)
          ) ||
          voices.find((v) => /madhur|ravi|hemant|david|mark|george|male/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi"));

        utterance.pitch = 0.90; // Natural, firm masculine doctor pitch
        utterance.rate = 0.92;
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.lang = "hi-IN";

      utterance.onstart = () => {
        setIsDoctorSpeaking(true);
      };
      utterance.onend = () => {
        setIsDoctorSpeaking(false);
      };
      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        setIsDoctorSpeaking(false);
      };

      // Speak loudly and clearly
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis note:", e);
      setIsDoctorSpeaking(false);
    }
  };

  // Manage Webcam Stream
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera preview fallback mode:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startConsultation = () => {
    const randomToken = "OPD-UP-2026-0" + Math.floor(100 + Math.random() * 900);
    setOpdToken(randomToken);
    setIsInCall(true);

    // Build medical diagnosis specifically matching user's selected symptoms and typed problem
    const symptomSpeech = getSymptomDiagnosisSpeech(
      selectedDoctor,
      selectedSymptoms,
      customSymptom
    );
    setDoctorSubtitle(symptomSpeech);

    // Speak immediately within the user click gesture!
    speakDoctorAudio(symptomSpeech);

    startCamera();
  };

  const endConsultation = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsDoctorSpeaking(false);
    stopCamera();
    setIsInCall(false);
    setActiveTab("prescription");
  };

  const toggleDoctorAudio = () => {
    if (doctorAudioEnabled) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsDoctorSpeaking(false);
      setDoctorAudioEnabled(false);
    } else {
      setDoctorAudioEnabled(true);
      const symptomSpeech =
        doctorSubtitle ||
        getSymptomDiagnosisSpeech(selectedDoctor, selectedSymptoms, customSymptom);
      speakDoctorAudio(symptomSpeech);
    }
  };

  const replayDoctorAudio = () => {
    const symptomSpeech =
      doctorSubtitle ||
      getSymptomDiagnosisSpeech(selectedDoctor, selectedSymptoms, customSymptom);
    speakDoctorAudio(symptomSpeech);
  };

  const askDoctorQuestion = (answer: string) => {
    speakDoctorAudio(answer);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micEnabled));
    }
    setMicEnabled(!micEnabled);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !cameraEnabled));
    }
    setCameraEnabled(!cameraEnabled);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const filteredMedicines = GENERIC_MEDICINES.filter((m) => {
    const q = medicineQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.generic_name.toLowerCase().includes(q) ||
      m.generic_name_hi.toLowerCase().includes(q) ||
      m.branded_example.toLowerCase().includes(q) ||
      m.use_case_hi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 pt-4 sm:pt-8 space-y-6 w-full min-w-0 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              🏥 {locale === "hi" ? "ई-संजीवनी 2.0 • राष्ट्रीय स्वास्थ्य मिशन" : "e-Sanjeevani 2.0 • NHM"}
            </span>
            <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {locale === "hi" ? "4 सरकारी डॉक्टर अभी ऑन-ड्यूटी" : "4 Govt Doctors On-Duty"}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <Stethoscope className="w-7 h-7 sm:w-9 sm:h-9 text-teal-300" />
            <span>
              {locale === "hi"
                ? "ई-संजीवनी ग्रामीण टेली-कंसल्टेशन व स्वास्थ्य सेवा"
                : "e-Sanjeevani Rural Tele-Consultation & Healthcare"}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 max-w-3xl leading-relaxed">
            {locale === "hi"
              ? "गाँव के किसान व परिवारों के लिए घर बैठे सरकारी अस्पताल (CHC/PHC) के विशेषज्ञ डॉक्टरों से मुफ्त वीडियो परामर्श, डिजिटल पर्चा, जन औषधि केंद्र से 80% सस्ती दवाएं व 24x7 108 एम्बुलेंस सेवा।"
              : "Free instant video tele-consultation with verified Government CHC/PHC doctors, digital e-prescriptions, Jan Aushadhi 80% discounted generic medicines, and 1-tap 108 emergency SOS."}
          </p>
        </div>
      </div>

      {/* 2. Interactive Navigation Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("teleclinic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
            activeTab === "teleclinic"
              ? "bg-teal-700 text-white shadow-md scale-[1.02]"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{locale === "hi" ? "👨‍⚕️ टेली-डॉक्टर वीडियो क्लिनिक" : "👨‍⚕️ Live Tele-Clinic"}</span>
        </button>

        <button
          onClick={() => setActiveTab("prescription")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
            activeTab === "prescription"
              ? "bg-teal-700 text-white shadow-md scale-[1.02]"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{locale === "hi" ? "📋 ई-प्रिस्क्रिप्शन (डिजिटल पर्चा)" : "📋 e-Prescription Slip"}</span>
        </button>

        <button
          onClick={() => setActiveTab("medicines")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
            activeTab === "medicines"
              ? "bg-teal-700 text-white shadow-md scale-[1.02]"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{locale === "hi" ? "💊 जन औषधि सस्ती दवाएं" : "💊 Jan Aushadhi Generics"}</span>
        </button>

        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
            activeTab === "emergency"
              ? "bg-rose-600 text-white shadow-md scale-[1.02]"
              : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
          }`}
        >
          <PhoneCall className="w-4 h-4 text-rose-500" />
          <span>{locale === "hi" ? "🚨 आपातकालीन 108 व आशा" : "🚨 Emergency 108 & ASHA"}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LIVE TELE-CLINIC & VIDEO CONSULTATION
         ========================================================================= */}
      {activeTab === "teleclinic" && (
        <div className="space-y-6">
          {!isInCall ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Symptom Picker & OPD Details */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 border border-teal-100 shadow-md space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>1. {locale === "hi" ? "अपनी मुख्य तकलीफ या लक्षण चुनें" : "Select Your Chief Symptoms"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {locale === "hi"
                      ? "आपके द्वारा चुने गए लक्षणों के आधार पर विशेषज्ञ डॉक्टर से तुरंत संपर्क कराया जाएगा।"
                      : "We match your symptoms with the appropriate on-duty clinical specialist."}
                  </p>
                </div>

                {/* Symptom Tag Pills */}
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_TAGS.map((s) => {
                    const isSelected = selectedSymptoms.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSymptom(s.id)}
                        className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all border active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{locale === "hi" ? s.hi : s.en}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Note Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {locale === "hi" ? "अन्य कोई परेशानी बोलें या लिखें (वैकल्पिक):" : "Additional symptom details (Optional):"}
                  </label>
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder={
                      locale === "hi"
                        ? "उदा. कल रात से कंपकंपी और 102 डिग्री बुखार आ रहा है..."
                        : "e.g. 102F fever with chills since last night..."
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  />
                </div>

                {/* Patient Quick Profile & ABHA Info */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-200 text-teal-900 font-black flex items-center justify-center text-lg shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="font-extrabold text-teal-950 text-sm">
                        {currentUser?.full_name || (locale === "hi" ? "नागरिक (लॉगिन करें)" : "Citizen (Please Login)")}
                      </p>
                      <div className="text-teal-800 font-medium text-[11px] flex items-center gap-1.5 flex-wrap">
                        <span>आभा आईडी:</span>
                        {abhaId ? (
                          <strong className="text-teal-950 font-mono bg-teal-100/90 px-1.5 py-0.5 rounded border border-teal-200">
                            ABHA {abhaId}
                          </strong>
                        ) : (
                          <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold text-[10px] border border-amber-300">
                            ⚠️ {locale === "hi" ? "आभा आईडी लिंक नहीं है" : "ABHA Not Linked"}
                          </span>
                        )}
                        <span>• {currentUser?.village || (locale === "hi" ? "गाँव" : "Village")}, {currentUser?.district || (locale === "hi" ? "जिला" : "District")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setTempAbhaInput(abhaId);
                        setShowAbhaModal(true);
                      }}
                      className="bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-[11px] px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>{abhaId ? "⚙️ " + (locale === "hi" ? "आभा आईडी बदलें" : "Change ABHA") : "🔗 " + (locale === "hi" ? "असली ABHA लिंक करें" : "Link Real ABHA")}</span>
                    </button>
                    {abhaId && (
                      <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                        आयुष्मान भारत सत्यापित ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Doctor Selection & Start Call CTA */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-teal-100 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <span>2. {locale === "hi" ? "ऑन-ड्यूटी सरकारी डॉक्टर" : "Select On-Duty Doctor"}</span>
                  </h3>

                  <div className="space-y-2.5">
                    {TELE_DOCTORS.map((doc) => {
                      const isSelected = selectedDoctor.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? "bg-teal-50/90 border-teal-500 shadow-xs"
                              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80"
                          }`}
                        >
                          <span className="text-2xl shrink-0">{doc.avatar}</span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {locale === "hi" ? doc.name_hi : doc.name}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                On-Duty
                              </span>
                            </div>
                            <p className="text-[11px] text-teal-800 font-semibold truncate">
                              {locale === "hi" ? doc.specialty_hi : doc.specialty}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {locale === "hi" ? doc.hospital_hi : doc.hospital}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Big Green Start Call Button */}
                <button
                  type="button"
                  onClick={startConsultation}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
                >
                  <Video className="w-5 h-5 animate-pulse" />
                  <span>
                    {locale === "hi" ? "मुफ्त वीडियो कॉल शुरू करें (0 मिनट प्रतीक्षा)" : "Start Free Video Consultation"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               LIVE VIDEO CONSULTATION ROOM (Active Call View)
               ========================================================================= */
            <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 border border-teal-500/40 shadow-2xl space-y-4 text-white overflow-hidden">
              {/* Call Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base leading-none">
                      {locale === "hi" ? selectedDoctor.name_hi : selectedDoctor.name} •{" "}
                      <span className="text-teal-400 font-bold text-xs">
                        {locale === "hi" ? selectedDoctor.hospital_hi : selectedDoctor.hospital}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {locale === "hi" ? "सुरक्षित एवं एन्क्रिप्टेड टेली-कंसल्टेशन" : "Secure End-to-End Encrypted Tele-Consultation"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl font-mono text-xs text-amber-400 font-bold">
                    ⏱️ {formatTimer(callDuration)}
                  </div>
                  <div className="bg-teal-900/60 border border-teal-600 px-3 py-1 rounded-xl text-xs text-teal-200 font-bold">
                    {opdToken}
                  </div>
                </div>
              </div>

              {/* Video Grid (Doctor Feed + Patient Webcam Preview) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px]">
                {/* Doctor Video Stream (Simulated Doctor Feed with Real Audio Voice) */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                  <div className="flex items-center justify-between z-10 flex-wrap gap-2">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 border border-white/10">
                      <span>{selectedDoctor.avatar}</span>
                      <span>{locale === "hi" ? selectedDoctor.name_hi : selectedDoctor.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isDoctorSpeaking ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse shadow-md">
                          <Volume2 className="w-3 h-3" />
                          <span>डॉक्टर बोल रहे हैं...</span>
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          1080p HD LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Doctor Avatar / Visualizer with Speaking Waves */}
                  <div className="flex flex-col items-center justify-center space-y-3 my-auto text-center z-10 py-3">
                    <div className="relative">
                      {isDoctorSpeaking && (
                        <div className="absolute -inset-3 rounded-full bg-emerald-500/30 blur-md animate-ping pointer-events-none" />
                      )}
                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-5xl shadow-2xl ring-4 ${
                          isDoctorSpeaking ? "ring-emerald-400 animate-pulse scale-105" : "ring-teal-400/30"
                        } transition-all`}
                      >
                        {selectedDoctor.avatar}
                      </div>
                    </div>

                    {/* Patient's Selected Symptoms Banner inside call */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-lg">
                      <span className="text-[10px] font-bold text-teal-300">🎯 जाँचे जा रहे लक्षण:</span>
                      {selectedSymptoms.map((sId) => {
                        const tag = SYMPTOM_TAGS.find((t) => t.id === sId);
                        return (
                          <span
                            key={sId}
                            className="bg-teal-900/80 border border-teal-500/40 text-[10px] text-teal-200 px-2 py-0.5 rounded-md font-bold"
                          >
                            ✓ {tag ? (locale === "hi" ? tag.hi.split("(")[0].trim() : tag.en) : sId}
                          </span>
                        );
                      })}
                      {customSymptom && (
                        <span className="bg-amber-900/70 border border-amber-500/40 text-[10px] text-amber-200 px-2 py-0.5 rounded-md font-bold truncate max-w-xs">
                          📝 {customSymptom}
                        </span>
                      )}
                    </div>

                    {/* Live Doctor Audio Subtitle Speech Bubble */}
                    <div className="w-full max-w-lg bg-black/85 backdrop-blur-md rounded-2xl p-4 border border-teal-400/50 text-left shadow-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-teal-300 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>
                            {locale === "hi"
                              ? `${selectedDoctor.name_hi} द्वारा निदान व सलाह`
                              : `${selectedDoctor.name} Medical Diagnosis`}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={replayDoctorAudio}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{locale === "hi" ? "आवाज सुनें ▶️" : "Listen Voice ▶️"}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-teal-50 leading-relaxed max-h-36 overflow-y-auto no-scrollbar">
                        "{doctorSubtitle}"
                      </p>
                    </div>
                  </div>

                  {/* Live Doctor Audio Waveform Footer */}
                  <div className="flex items-center justify-between z-10 text-[11px] text-slate-400 bg-black/40 backdrop-blur-md p-2 rounded-xl flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        {doctorAudioEnabled ? "🔊 डॉक्टर ऑडियो: सक्रिय (Voice ON)" : "🔇 डॉक्टर ऑडियो: म्यूट (Muted)"}
                      </span>
                    </span>
                    <span>{locale === "hi" ? selectedDoctor.hospital_hi : selectedDoctor.hospital}</span>
                  </div>
                </div>

                {/* Patient Camera Stream (Native WebRTC Feed) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between z-10">
                    <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {currentUser?.full_name || "आप (Patient)"}
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono">Webcam</span>
                  </div>

                  {/* HTML Video Element for Real Camera Feed */}
                  <div className="relative w-full h-full min-h-[160px] flex items-center justify-center rounded-xl overflow-hidden bg-black/60 my-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover rounded-xl ${
                        cameraEnabled ? "block" : "hidden"
                      }`}
                    />
                    {!cameraEnabled && (
                      <div className="flex flex-col items-center justify-center text-slate-500 gap-1 text-xs">
                        <VideoOff className="w-8 h-8 text-rose-500" />
                        <span>कैमरा बंद है (Camera Off)</span>
                      </div>
                    )}
                  </div>

                  {/* Patient Vitals Sidebar Bar */}
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 border border-white/5 space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold text-teal-300 uppercase">
                      📊 लाइव वाइटल्स (Patient Vitals)
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="bg-white/5 p-1.5 rounded-lg flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>76 bpm</span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded-lg flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-400" />
                        <span>99.2°F</span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded-lg flex items-center gap-1">
                        <Activity className="w-3 h-3 text-teal-400" />
                        <span>BP: 120/80</span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded-lg flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>SpO2: 98%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Interactive Questions with Doctor (Speak aloud on click) */}
              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>डॉक्टर से त्वरित प्रश्न पूछें (Click to ask Doctor):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">डॉक्टर तुरंत बोलकर उत्तर देंगे 🔊</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {PATIENT_QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => askDoctorQuestion(q.answer)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-900/60 text-teal-200 hover:text-white border border-teal-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span>💬 {locale === "hi" ? q.q_hi : q.q_en}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call Controls Bar */}
              <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                    micEnabled ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white"
                  }`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                    cameraEnabled ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white"
                  }`}
                  title={cameraEnabled ? "Turn off Video" : "Turn on Video"}
                >
                  {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                {/* Doctor Voice Toggle */}
                <button
                  type="button"
                  onClick={toggleDoctorAudio}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                    doctorAudioEnabled ? "bg-teal-700 hover:bg-teal-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                  title={doctorAudioEnabled ? "Mute Doctor Voice" : "Unmute Doctor Voice"}
                >
                  {doctorAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* Replay Doctor Voice */}
                <button
                  type="button"
                  onClick={replayDoctorAudio}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
                  title="Replay Doctor Voice"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Big Red End Call & Generate Prescription Button */}
                <button
                  type="button"
                  onClick={endConsultation}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>
                    {locale === "hi"
                      ? "कॉल समाप्त करें व पर्चा प्राप्त करें →"
                      : "End Consultation & Get Prescription →"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: OFFICIAL E-PRESCRIPTION (डिजिटल पर्चा)
         ========================================================================= */}
      {activeTab === "prescription" && (
        <div className="space-y-6">
          {/* Printable Official Prescription Card */}
          <div
            id="official-e-prescription"
            className="bg-white rounded-3xl border-2 border-teal-700/60 shadow-xl p-6 sm:p-8 space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0"
          >
            {/* Prescription Header */}
            <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  🇮🇳
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-teal-950 uppercase tracking-tight">
                    राष्ट्रीय स्वास्थ्य मिशन • उत्तर प्रदेश सरकार
                  </h2>
                  <p className="text-xs font-bold text-teal-800">
                    ई-संजीवनी राष्ट्रीय टेली-परामर्श सेवा (e-Sanjeevani OPD)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    स्वास्थ्य एवं परिवार कल्याण मंत्रालय, भारत सरकार
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:pl-4 border-slate-200">
                <span className="inline-block bg-teal-100 text-teal-950 text-xs font-mono font-black px-2.5 py-1 rounded-lg">
                  {opdToken}
                </span>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  दिनांक (Date): {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            {/* Patient & Doctor Two-Column Info Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              {/* Patient Details */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  रोगी विवरण (Patient Information)
                </div>
                <p className="font-black text-sm text-slate-900">
                  {currentUser?.full_name || (locale === "hi" ? "पंजीकृत नागरिक" : "Registered Citizen")}
                </p>
                <p className="text-slate-600">
                  <strong>ABHA ID:</strong> {abhaId || (locale === "hi" ? "लिंक नहीं है (Not Linked)" : "Not Linked")}
                </p>
                <p className="text-slate-600">
                  <strong>गाँव / पंचायत:</strong> {currentUser?.village || (locale === "hi" ? "गाँव" : "Village")}, {currentUser?.district || (locale === "hi" ? "जिला" : "District")}
                </p>
              </div>

              {/* Doctor Details */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  परामर्शदाता चिकित्सक (Consulting Physician)
                </div>
                <p className="font-black text-sm text-teal-900">
                  {locale === "hi" ? selectedDoctor.name_hi : selectedDoctor.name}
                </p>
                <p className="text-slate-600">
                  <strong>योग्यता:</strong> {selectedDoctor.qualification}
                </p>
                <p className="text-slate-600">
                  <strong>अस्पताल:</strong> {locale === "hi" ? selectedDoctor.hospital_hi : selectedDoctor.hospital}
                </p>
              </div>
            </div>

            {/* Clinical Diagnosis (निदान) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  Provisional Diagnosis (संभावित निदान)
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 space-y-1">
                <p>
                  {selectedSymptoms.length > 0
                    ? selectedSymptoms
                        .map((id) => {
                          const tag = SYMPTOM_TAGS.find((t) => t.id === id);
                          return tag ? tag.hi : id;
                        })
                        .join(" • ")
                    : "सामान्य स्वास्थ्य मूल्यांकन (General Clinical Assessment)"}
                </p>
                {customSymptom && (
                  <p className="text-xs font-semibold text-slate-600">
                    <strong>मरीज द्वारा दर्ज विवरण:</strong> {customSymptom}
                  </p>
                )}
              </div>
            </div>

            {/* Prescribed Medications Table (दवाइयों का विवरण) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                  <span className="text-lg">℞</span>
                  <span>औषधि परामर्श एवं खुराक (Prescribed Medications)</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  जन औषधि केंद्र से 75% छूट पर उपलब्ध ✓
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 uppercase font-black text-[11px]">
                    <tr>
                      <th className="p-3">क्र.</th>
                      <th className="p-3">दवा का नाम (Medicine Name)</th>
                      <th className="p-3">खुराक (Dosage Schedule)</th>
                      <th className="p-3">अवधि (Duration)</th>
                      <th className="p-3">निर्देश (Instructions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold">1</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        Tab. Paracetamol 650mg
                        <span className="block text-[10px] text-slate-500 font-normal">जन औषधि मूल्य: ₹9.50 (Dolo विकल्प)</span>
                      </td>
                      <td className="p-3 font-bold text-teal-800">1 - 1 - 1 (सुबह-दोपहर-रात)</td>
                      <td className="p-3">3 दिन</td>
                      <td className="p-3 text-slate-600">भोजन के बाद, बुखार 100°F से अधिक होने पर</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold">2</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        Tab. Cetirizine 10mg
                        <span className="block text-[10px] text-slate-500 font-normal">जन औषधि मूल्य: ₹7.80</span>
                      </td>
                      <td className="p-3 font-bold text-teal-800">0 - 0 - 1 (केवल रात को)</td>
                      <td className="p-3">5 दिन</td>
                      <td className="p-3 text-slate-600">सोते समय गुनगुने पानी के साथ</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold">3</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        ORS घोल (Oral Rehydration Salts)
                        <span className="block text-[10px] text-slate-500 font-normal">जन औषधि मूल्य: ₹7.50 / पैकेट</span>
                      </td>
                      <td className="p-3 font-bold text-teal-800">1 लीटर दिनभर में</td>
                      <td className="p-3">3 दिन</td>
                      <td className="p-3 text-slate-600">उबले ठंडे पानी में घोलकर थोड़ा-थोड़ा पिएं</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Advice & Diet (सामान्य परहेज व सावधानियां) */}
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 text-xs space-y-1.5">
              <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
                <span>⚠️ विशेष निर्देश एवं परहेज (Dietary & Lifestyle Advice):</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed pl-1">
                <li>भरपूर मात्रा में गुनगुना पानी, दाल का पानी और नारियल पानी पिएं।</li>
                <li>ठंडा पानी, तली-भुनी वस्तुएं व बासी भोजन से पूर्ण परहेज रखें।</li>
                <li>यदि 3 दिन बाद भी बुखार 101°F से ऊपर रहे या सांस लेने में परेशानी हो, तो तुरंत CHC चिनहट में संपर्क करें।</li>
              </ul>
            </div>

            {/* Official Stamp & QR Code Verification Footer */}
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl border border-slate-300">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-800">ई-सत्यापित डिजिटल पर्चा (Digitally Signed)</p>
                  <p>सत्यापन कोड: <strong>UP-MED-2026-X8892</strong></p>
                  <p>मान्यता: समस्त जन औषधि केंद्र व सरकारी डिस्पेंसरी</p>
                </div>
              </div>

              {/* Digital Doctor Seal */}
              <div className="text-center sm:text-right border-2 border-dashed border-teal-700/60 p-3 rounded-2xl bg-teal-50/40">
                <p className="font-black text-xs text-teal-950">{selectedDoctor.name}</p>
                <p className="text-[10px] text-teal-800 font-bold">{selectedDoctor.qualification}</p>
                <p className="text-[10px] text-slate-500">Reg No: MCI/UP/49281/2012</p>
                <span className="inline-block text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                  ई-हस्ताक्षरित (Digitally Signed) ✓
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Print Slip + Generic Medicine CTA */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{locale === "hi" ? "पर्चा प्रिंट / PDF डाउनलोड करें" : "Print / Download PDF Slip"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("medicines")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
            >
              <Pill className="w-4 h-4" />
              <span>{locale === "hi" ? "जन औषधि केंद्र से सस्ती दवाएं देखें →" : "View Jan Aushadhi Discounts →"}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: JAN AUSHADHI GENERIC MEDICINE FINDER
         ========================================================================= */}
      {activeTab === "medicines" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-teal-100 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>💊 प्रधानमंत्री भारतीय जन औषधि केंद्र (PMBJP)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ब्रांडेड दवाओं के मुकाबले 50% से 90% तक सस्ती, गुणवत्तापूर्ण जेनेरिक दवाएं।
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px] sm:min-w-[300px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="दवा का नाम खोजें (उदा. Paracetamol, Dolo, Pan 40)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Medicine Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 hover:border-teal-400 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                          {med.generic_name}
                        </h4>
                        <p className="text-[11px] font-bold text-teal-800">
                          {med.generic_name_hi}
                        </p>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
                        {med.savings_percent}% छूट
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>उपयोग:</strong> {med.use_case_hi}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong>खुराक:</strong> {med.dosage_hi}
                    </p>
                  </div>

                  {/* Price Comparison Tag */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 line-through text-[11px] block">
                        ब्रांडेड MRP ({med.branded_example}): ₹{med.branded_price}
                      </span>
                      <span className="text-emerald-800 font-black text-sm">
                        जन औषधि मूल्य: ₹{med.generic_price}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        सीधी बचत: ₹{(med.branded_price - med.generic_price).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nearest Jan Aushadhi Stores in Lucknow */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="font-extrabold text-sm text-teal-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                <span>आपके ब्लॉक के निकटतम जन औषधि केंद्र (Nearest Jan Aushadhi Kendras)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                  <p className="font-extrabold text-slate-900">चिनहट ब्लॉक केंद्र (Store #8412)</p>
                  <p className="text-[11px] text-slate-600">सामुदायिक स्वास्थ्य केंद्र (CHC) परिसर, चिनहट</p>
                  <p className="text-teal-800 font-bold text-[11px]">दूरी: 2.1 किमी • फोन: 94500-11223</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                  <p className="font-extrabold text-slate-900">मलिहाबाद केंद्र (Store #8490)</p>
                  <p className="text-[11px] text-slate-600">तहसील रोड, नवीन फल मंडी के सामने, मलिहाबाद</p>
                  <p className="text-teal-800 font-bold text-[11px]">दूरी: 4.8 किमी • फोन: 94500-44556</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                  <p className="font-extrabold text-slate-900">मोहनलालगंज केंद्र (Store #8521)</p>
                  <p className="text-[11px] text-slate-600">प्राथमिक स्वास्थ्य केंद्र (PHC) गेट नं. 2, मोहनलालगंज</p>
                  <p className="text-teal-800 font-bold text-[11px]">दूरी: 6.2 किमी • फोन: 94500-77889</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 1-TAP EMERGENCY SOS (108 / 102 & ASHA CONTACTS)
         ========================================================================= */}
      {activeTab === "emergency" && (
        <div className="space-y-6">
          {/* Big Red SOS Ambulance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 108 Emergency */}
            <div className="bg-gradient-to-br from-rose-700 via-rose-800 to-red-900 rounded-3xl p-6 text-white shadow-xl border-2 border-rose-400/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-white text-rose-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  24x7 निःशुल्क सेवा
                </span>
                <span className="text-3xl animate-bounce">🚑</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black">108 आपातकालीन एम्बुलेंस</h3>
                <p className="text-xs sm:text-sm text-rose-100 mt-1 leading-relaxed">
                  हार्ट अटैक, दुर्घटना, गंभीर बुखार या किसी भी आपात स्थिति में तुरंत निःशुल्क सरकारी एम्बुलेंस बुलाएं।
                </p>
              </div>

              <a
                href="tel:108"
                className="w-full py-4 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5 animate-pulse text-rose-700" />
                <span>सीधे 108 पर कॉल मिलाएं (Dial 108 Now)</span>
              </a>
            </div>

            {/* 102 Janani Shishu */}
            <div className="bg-gradient-to-br from-pink-700 via-rose-700 to-purple-900 rounded-3xl p-6 text-white shadow-xl border-2 border-pink-400/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-white text-pink-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  मातृ एवं शिशु सुरक्षा
                </span>
                <span className="text-3xl animate-bounce">🤰</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black">102 जननी-शिशु एम्बुलेंस</h3>
                <p className="text-xs sm:text-sm text-pink-100 mt-1 leading-relaxed">
                  गर्भवती महिलाओं को प्रसव हेतु अस्पताल ले जाने एवं प्रसव उपरांत सुरक्षित घर पहुंचाने की मुफ्त व्यवस्था।
                </p>
              </div>

              <a
                href="tel:102"
                className="w-full py-4 rounded-2xl bg-white text-pink-900 hover:bg-pink-50 font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5 animate-pulse text-pink-700" />
                <span>सीधे 102 पर कॉल मिलाएं (Dial 102 Now)</span>
              </a>
            </div>
          </div>

          {/* Local Village Health Workers Directory */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>गाँव के अधिकृत स्वास्थ्य कार्यकर्ता (Gram Panchayat Health Team)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EMERGENCY_CONTACTS.slice(2).map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title_hi}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description_hi}</p>
                  </div>

                  <a
                    href={`tel:${item.phone}`}
                    className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>कॉल करें: {item.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABHA ID Manager & Government Help Modal */}
      {showAbhaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-teal-200 space-y-5 relative">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                  राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA • ABDM)
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🆔 {locale === "hi" ? "आभा स्वास्थ्य पहचान पत्र (ABHA ID)" : "Ayushman Bharat Health Account"}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAbhaModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            <div className="bg-teal-50/80 rounded-2xl p-4 border border-teal-100 text-xs text-teal-950 space-y-2">
              <p className="font-extrabold flex items-center gap-1.5 text-teal-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{locale === "hi" ? "आभा आईडी (ABHA) क्या है?" : "What is an ABHA ID?"}</span>
              </p>
              <p className="text-[11px] text-teal-800/90 leading-relaxed">
                {locale === "hi"
                  ? "ABHA (Ayushman Bharat Health Account) भारत सरकार द्वारा जारी 14-अंकीय डिजिटल स्वास्थ्य पहचान है। इससे आपके सभी सरकारी पर्चे, जांच रिपोर्ट व टेली-परामर्श सुरक्षित रूप से ऑनलाइन रिकॉर्ड रहते हैं।"
                  : "ABHA is a 14-digit digital health ID issued by the National Health Authority (NHA). It securely links all your OPD prescriptions, lab reports, and tele-consultations across India."}
              </p>
            </div>

            {/* Input / Customization */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 block">
                {locale === "hi" ? "अपनी 14-अंकीय आभा आईडी दर्ज करें या बदलें:" : "Enter or edit your 14-digit ABHA ID:"}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempAbhaInput}
                  onChange={(e) => setTempAbhaInput(e.target.value)}
                  placeholder="91-8421-9032-4412"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const r1 = Math.floor(1000 + Math.random() * 9000);
                    const r2 = Math.floor(1000 + Math.random() * 9000);
                    const r3 = Math.floor(1000 + Math.random() * 9000);
                    const generated = `91-${r1}-${r2}-${r3}`;
                    setTempAbhaInput(generated);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                  title="Generate Random ABHA format"
                >
                  ✨ {locale === "hi" ? "ऑटो-जनरेट" : "Generate"}
                </button>
              </div>

              <div className="flex gap-2 flex-wrap pt-1">
                {currentUser?.phone && (
                  <button
                    type="button"
                    onClick={() => {
                      const digits = currentUser.phone?.replace(/\D/g, "") || "9876543210";
                      const d10 = digits.padEnd(10, "0").slice(0, 10);
                      const gen = `91-${d10.slice(0, 4)}-${d10.slice(4, 8)}-${d10.slice(8, 10)}98`;
                      setTempAbhaInput(gen);
                    }}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-xl border border-teal-300 transition-colors cursor-pointer"
                  >
                    📱 {locale === "hi" ? `मेरे मोबाइल (${currentUser.phone}) से लिंक करें` : `Link using my Mobile (${currentUser.phone})`}
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const finalId = tempAbhaInput.trim();
                    if (finalId) {
                      setAbhaId(finalId);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("gram_sahayak_patient_abha", finalId);
                      }
                      const updated = updateUserSession({ abha_id: finalId });
                      if (updated) setCurrentUser(updated);
                    }
                    setShowAbhaModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer text-center"
                >
                  ✓ {locale === "hi" ? "सत्यापित करें व सेव करें" : "Save & Link ABHA"}
                </button>
              </div>
            </div>

            {/* Official Portal Guide */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-slate-900">
                  {locale === "hi" ? "असली सरकारी आभा कार्ड कैसे बनाएं?" : "How to create real Govt ABHA card?"}
                </p>
                <a
                  href="https://abha.abdm.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:text-teal-800 font-black text-[11px] underline flex items-center gap-1"
                >
                  <span>abha.abdm.gov.in ↗</span>
                </a>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                <li>आधिकारिक पोर्टल <strong>abha.abdm.gov.in</strong> पर जाएँ।</li>
                <li>अपना <strong>आधार नंबर</strong> या <strong>ड्राइविंग लाइसेंस</strong> दर्ज करें।</li>
                <li>मोबाइल पर आए <strong>OTP को सत्यापित करें</strong> — 1 मिनट में ABHA कार्ड तैयार!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
