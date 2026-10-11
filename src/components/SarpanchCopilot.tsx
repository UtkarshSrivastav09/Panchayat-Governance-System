"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Message {
  id: string;
  sender: "user" | "sarpanch";
  text: string;
  action?: {
    label_hi: string;
    label_en: string;
    href: string;
  };
  source?: "groq_llm" | "pretrained_engine";
}

const STARTER_PROMPTS = [
  {
    hi: "इस ग्रामसेतु पोर्टल के बारे में बताओ",
    en: "Tell me about GramSetu portal",
    icon: "🧭",
  },
  {
    hi: "गेहूं में पीला रतुआ का इलाज क्या है?",
    en: "Treatment for wheat yellow rust?",
    icon: "🌾",
  },
  {
    hi: "PM किसान सम्मान निधि के ₹2,000 कैसे मिलेंगे?",
    en: "How to get PM-KISAN ₹2,000 installment?",
    icon: "🏛️",
  },
  {
    hi: "आज गेहूं और धान की मंडी दर क्या है?",
    en: "What are today's mandi rates for wheat?",
    icon: "⚖️",
  },
  {
    hi: "गांव के खड़ंजे और नाली का बजट कैसे चेक करें?",
    en: "How to check village infrastructure budget?",
    icon: "🏗️",
  },
  {
    hi: "दुधारू गाय-भैंस का दूध कैसे बढ़ाएं?",
    en: "How to increase cattle milk yield?",
    icon: "🥛",
  },
];

export default function SarpanchCopilot() {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "sarpanch",
      text:
        locale === "hi"
          ? "राम-राम किसान भाई! मैं हूँ आपका 'सरपंच AI आवाज़ी सलाहकार'। आप मुझसे खेती-बाड़ी, फसल की बीमारी, सरकारी योजनाएं, मंडी भाव या गांव के विकास कार्य के बारे में कुछ भी पूछ सकते हैं। बोलकर या लिखकर बताइए!"
          : "Welcome farmer friend! I am your 'Sarpanch AI Voice Copilot'. You can ask me anything about crop diseases, government schemes, mandi rates, or village development works. Type or speak below!",
      action: {
        label_hi: "🧭 ग्रामसेतु की सभी सुविधाएं देखें",
        label_en: "🧭 Explore GramSetu Features",
        href: "/roadmap",
      },
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech Recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = locale === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [locale]);

  // Text to Speech playback in Hindi/English
  const speakText = (text: string) => {
    if (typeof window === "undefined" || voiceMuted) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      // Strip markdown asterisks and URLs for cleaner audio
      const cleanText = text
        .replace(/[*#_`]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .slice(0, 300); // speak key portion

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = locale === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.95; // slightly slower, clear village tone

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis notice:", e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle mic listening
  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) {
      alert(
        locale === "hi"
          ? "इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है। कृपया लिखकर पूछें।"
          : "Voice recognition is not supported in this browser. Please type."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.lang = locale === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  // Send message to Copilot API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    setInputText("");

    const userMsg: Message = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyContext = messages.slice(-4).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyContext,
          lang: locale,
        }),
      });

      const data = await res.json();
      const replyText =
        locale === "hi"
          ? data.answer_hi || data.answer_en || "राम-राम भाई! मैं आपकी सेवा में हाज़िर हूँ।"
          : data.answer_en || data.answer_hi || "Hello friend! How can I assist you?";

      const botMsg: Message = {
        id: "s-" + Date.now(),
        sender: "sarpanch",
        text: replyText,
        action: data.suggested_action,
        source: data.source,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);
    } catch (err) {
      console.warn("Copilot client fallback:", err);
      const fallbackText =
        locale === "hi"
          ? "राम-राम भाई! किसी भी फसल रोग की जांच के लिए आप सीधे 'AI फसल डॉक्टर' में फोटो अपलोड कर सकते हैं, या टोल-फ्री किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।"
          : "Farmer friend, for crop diagnosis, upload a leaf photo directly in our AI Crop Doctor or call Kisan Call Centre at 1800-180-1551.";

      const fallbackMsg: Message = {
        id: "s-" + Date.now(),
        sender: "sarpanch",
        text: fallbackText,
        action: {
          label_hi: "📸 AI फसल डॉक्टर खोलें",
          label_en: "📸 Open AI Crop Doctor",
          href: "/crop-doctor",
        },
        source: "pretrained_engine",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <div className="fixed bottom-24 right-4 sm:bottom-7 sm:right-7 z-50 flex items-center gap-3">
        {/* Subtle Tooltip Banner when closed */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-white/95 text-emerald-950 px-3.5 py-2 rounded-2xl shadow-lg border border-emerald-200/80 cursor-pointer text-xs font-semibold hover:border-emerald-400 hover:scale-105 transition-all animate-bounce"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{locale === "hi" ? "👳‍♂️ सरपंच जी से पूछें (Voice AI)" : "👳‍♂️ Ask Sarpanch AI"}</span>
          </div>
        )}

        <button
          onClick={() => {
            if (isOpen) {
              stopSpeaking();
            }
            setIsOpen(!isOpen);
          }}
          id="sarpanch-copilot-launcher"
          aria-label="Sarpanch AI Copilot"
          className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 text-white shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-amber-300/40"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-md group-hover:bg-amber-400/40 transition-all pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl filter drop-shadow">👳‍♂️</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300 border-2 border-emerald-800" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 2. Floating Copilot Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-7 sm:bottom-24 w-auto sm:w-[420px] max-h-[85vh] sm:max-h-[640px] h-[580px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-300/80 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-2xl border border-amber-300/30 shadow-inner">
                👳‍♂️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {locale === "hi" ? "सरपंच AI सलाहकार" : "Sarpanch AI Copilot"}
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mr-1 animate-pulse" />
                    24/7 Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90">
                  {locale === "hi" ? "ग्रामसेतु आवाज़ी मार्गदर्शक" : "Voice Rural Companion"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!voiceMuted) stopSpeaking();
                  setVoiceMuted(!voiceMuted);
                }}
                title={voiceMuted ? "Unmute voice audio" : "Mute voice audio"}
                className={`p-2 rounded-xl text-white transition-all ${
                  voiceMuted
                    ? "bg-rose-500/30 text-rose-200"
                    : isSpeaking
                    ? "bg-amber-400/40 text-amber-200 animate-pulse"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {voiceMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-emerald-800 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {locale === "hi" ? "सुझाव:" : "Quick:"}
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(locale === "hi" ? prompt.hi : prompt.en)}
                className="text-xs whitespace-nowrap bg-white hover:bg-emerald-600 hover:text-white text-slate-700 px-2.5 py-1 rounded-full border border-emerald-200/90 shadow-2xs font-medium transition-all active:scale-95 flex items-center gap-1"
              >
                <span>{prompt.icon}</span>
                <span>{locale === "hi" ? prompt.hi : prompt.en}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50/60 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-700 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-emerald-200/80 rounded-tl-xs shadow-sm"
                  }`}
                >
                  {msg.sender === "sarpanch" && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                      <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                        <span>👳‍♂️ सरपंच जी</span>
                        {msg.source === "groq_llm" ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-semibold">
                            Groq AI
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-semibold">
                            ज्ञान-कोश
                          </span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        title="सुनें (Listen)"
                        className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Deep Link Action Button */}
                  {msg.action && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <Link
                        href={msg.action.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-3 py-1.5 rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <span>{locale === "hi" ? msg.action.label_hi : msg.action.label_en}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 text-slate-500 text-xs bg-white border border-emerald-200 rounded-2xl px-4 py-3 w-fit shadow-xs animate-pulse">
                <span className="text-lg">👳‍♂️</span>
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  {locale === "hi"
                    ? "सरपंच जी विचार कर रहे हैं..."
                    : "Sarpanch Ji is thinking..."}
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening State Banner */}
          {isListening && (
            <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-fade-in">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>{locale === "hi" ? "सरपंच जी आपकी आवाज़ सुन रहे हैं..." : "Listening to your voice..."}</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] font-bold underline hover:text-rose-900"
              >
                {locale === "hi" ? "रोकें" : "Stop"}
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white border-t border-emerald-100 flex items-center gap-2">
            {/* Big Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              id="copilot-voice-mic"
              aria-label="Voice Input"
              className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 shadow-lg scale-105"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder={
                locale === "hi"
                  ? "बोलकर या लिखकर पूछें..."
                  : "Speak or type your question..."
              }
              className="flex-1 bg-slate-100/80 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 transition-all shadow-xs active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
