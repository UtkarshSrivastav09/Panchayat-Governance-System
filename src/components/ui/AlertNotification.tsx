"use client";

import { CheckCircle2, AlertCircle, X, AlertTriangle } from "lucide-react";

interface AlertNotificationProps {
  type: "success" | "error" | "warning";
  title?: string;
  message: string;
  onClose?: () => void;
}

export default function AlertNotification({
  type,
  title,
  message,
  onClose,
}: AlertNotificationProps) {
  if (!message) return null;

  // Clean leading emojis if passed in message
  const cleanMessage = message.replace(/^[\u{2700}-\u{27BF}\u{1F300}-\u{1F9FF}\s❌✓⚠️]+/gu, "").trim();

  const isSuccess = type === "success";
  const isError = type === "error";

  const defaultTitle = isSuccess
    ? "सत्यापन सफल (Success)"
    : isError
    ? "लॉगिन त्रुटि (Authentication Error)"
    : "ध्यान दें (Notice)";

  return (
    <div
      role="alert"
      className={`relative w-full rounded-2xl p-3.5 sm:p-4 border shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-200 flex items-start gap-3.5 ${
        isSuccess
          ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
          : isError
          ? "bg-rose-50/90 border-rose-200 text-rose-950"
          : "bg-amber-50/90 border-amber-200 text-amber-950"
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isSuccess
            ? "bg-emerald-100 text-emerald-700"
            : isError
            ? "bg-rose-100 text-rose-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 stroke-[2.2]" />
        ) : (
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4
          className={`text-xs sm:text-sm font-extrabold tracking-tight leading-none mb-1 ${
            isSuccess
              ? "text-emerald-900"
              : isError
              ? "text-rose-900"
              : "text-amber-900"
          }`}
        >
          {title || defaultTitle}
        </h4>
        <p className="text-xs sm:text-[13px] font-medium leading-relaxed opacity-90 break-words">
          {cleanMessage || message}
        </p>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors shrink-0 -mr-1 -mt-0.5 ${
            isSuccess
              ? "text-emerald-600 hover:bg-emerald-200/50"
              : isError
              ? "text-rose-600 hover:bg-rose-200/50"
              : "text-amber-600 hover:bg-amber-200/50"
          }`}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
