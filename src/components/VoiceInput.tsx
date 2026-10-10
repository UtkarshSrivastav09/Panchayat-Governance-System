"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export default function VoiceInput({
  onTranscript,
  placeholder,
  className = "",
  initialValue = "",
}: VoiceInputProps) {
  const { locale, t } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [text, setText] = useState(initialValue);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = locale === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setText(currentTranscript);
        onTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [locale, onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      alert(
        locale === "hi"
          ? "आपके ब्राउज़र में बोलकर इनपुट की सुविधा समर्थित नहीं है। कृपया लिखकर बताएं।"
          : "Voice recognition is not supported in this browser. Please type below."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = locale === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      <div className="relative flex items-center">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTranscript(e.target.value);
          }}
          rows={3}
          placeholder={
            placeholder ||
            (locale === "hi"
              ? "फसल की परेशानी बोलकर या लिखकर बताएं (उदा. गेहूं के पत्तों पर पीले-नारंगी धब्बे हैं)..."
              : "Describe crop problem by voice or text (e.g. yellow spots on wheat leaves)...")
          }
          className="w-full rounded-2xl border border-emerald-200/80 bg-white/95 px-4 py-3 pr-14 text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-base resize-none transition-all"
        />

        <button
          type="button"
          onClick={toggleListening}
          id="voice-mic-btn"
          aria-label={isListening ? t("crop_doctor.voice_stop") : t("crop_doctor.voice_label")}
          className={`absolute right-3 bottom-3 p-3 rounded-full transition-all flex items-center justify-center min-w-[48px] min-h-[48px] ${
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
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-rose-600 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 self-start animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          <Volume2 className="w-3.5 h-3.5" />
          <span>{t("crop_doctor.voice_listening")}</span>
        </div>
      )}
    </div>
  );
}
