"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { saveUserSession, verifyCredentials } from "@/lib/auth-storage";
import AlertNotification from "@/components/ui/AlertNotification";
import {
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

  // Active role tab: 'farmer' or 'officer'
  const [selectedRole, setSelectedRole] = useState<"farmer" | "officer">("farmer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage(
        locale === "hi"
          ? "कृपया ईमेल/मोबाइल और पासवर्ड दोनों दर्ज करें।"
          : "Please enter both identifier and password."
      );
      return;
    }

    try {
      setLoading(true);

      let authenticatedUser = null;

      // 1. Try Supabase Auth if online
      try {
        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier,
          password: password,
        });

        if (!authError && data?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          authenticatedUser = {
            id: data.user.id,
            email: data.user.email || cleanIdentifier,
            full_name: profile?.full_name || (selectedRole === "officer" ? "अधिकारी" : "किसान"),
            role: (profile?.role as "farmer" | "officer") || selectedRole,
            village: profile?.village || "मलिहाबाद",
            district: profile?.district || "Lucknow",
            state: profile?.state || "Uttar Pradesh",
            created_at: data.user.created_at || new Date().toISOString(),
          };
        }
      } catch (dbErr) {
        // Fallback to local verified registry
      }

      // 2. Strict verification against registered registry
      if (!authenticatedUser) {
        authenticatedUser = verifyCredentials(cleanIdentifier, password, selectedRole);
      }

      // If credentials do NOT match, reject firmly and DO NOT log in!
      if (!authenticatedUser) {
        setErrorMessage(
          locale === "hi"
            ? "अमान्य क्रेडेंशियल्स! ईमेल या पासवर्ड सही नहीं है। यदि आपने पंजीकरण नहीं किया है, तो कृपया नीचे 'नया खाता बनाएं' पर क्लिक करें।"
            : "Invalid credentials! The email or password entered does not match our records. Please register first."
        );
        return;
      }

      // Success feedback
      setSuccessMessage(
        locale === "hi"
          ? `नमस्ते ${authenticatedUser.full_name}, पोर्टल में आपका स्वागत है...`
          : `Welcome ${authenticatedUser.full_name}, logging you in...`
      );

      // Safely persist session
      saveUserSession(authenticatedUser);

      // Transition to dashboard
      setTimeout(() => {
        if (authenticatedUser?.role === "officer") {
          router.push("/officer");
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(
        locale === "hi"
          ? "लॉगिन प्रक्रिया में त्रुटि आई। कृपया पुनः प्रयास करें।"
          : "An error occurred during sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-12 space-y-4 sm:space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl overflow-hidden transition-all">
        {/* Top Government Saffron/Green Tricolor Accent Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Official Emblem & Portal Title */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-md mx-auto text-xl sm:text-2xl font-black">
              🌾
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                {locale === "hi"
                  ? "उत्तर प्रदेश शासन • पंचायती राज व कृषि विभाग"
                  : "Govt of Uttar Pradesh • Panchayati Raj & Agriculture"}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Gram<span className="text-emerald-700">Setu</span> {locale === "hi" ? "लॉगिन" : "Login"}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {locale === "hi"
                  ? "ग्रामसेतु • सुरक्षित एकीकृत ग्राम सेवा पोर्टल"
                  : "GramSetu • Integrated Village Governance Portal"}
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("farmer");
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[42px] sm:min-h-[44px] ${
                selectedRole === "farmer"
                  ? "bg-white text-emerald-800 shadow-md scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">{locale === "hi" ? "किसान (Farmer)" : "Farmer Portal"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole("officer");
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[42px] sm:min-h-[44px] ${
                selectedRole === "officer"
                  ? "bg-white text-amber-900 shadow-md scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="whitespace-nowrap">{locale === "hi" ? "अधिकारी (Officer)" : "Officer Command"}</span>
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <AlertNotification
              type="error"
              title={locale === "hi" ? "लॉगिन त्रुटि" : "Authentication Error"}
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}

          {/* Success Alert */}
          {successMessage && (
            <AlertNotification
              type="success"
              title={locale === "hi" ? "सत्यापन सफल" : "Verification Successful"}
              message={successMessage}
            />
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {selectedRole === "officer"
                  ? locale === "hi"
                    ? "अधिकारी ईमेल / सेवा आईडी"
                    : "Official Email / Officer ID"
                  : locale === "hi"
                  ? "पंजीकृत मोबाइल नंबर / ईमेल"
                  : "Registered Mobile or Email"}
              </label>
              <div className="relative">
                {selectedRole === "officer" ? (
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === "officer"
                      ? locale === "hi"
                        ? "उदा. officer@up.gov.in"
                        : "e.g. officer@up.gov.in"
                      : locale === "hi"
                      ? "उदा. 9876543210 या ईमेल"
                      : "e.g. 9876543210 or email"
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Password input with show/hide */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {t("auth.password")}
                </label>
                <button
                  type="button"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  onClick={() =>
                    alert(
                      locale === "hi"
                        ? "पासवर्ड रीसेट लिंक आपके पंजीकृत नंबर/ईमेल पर भेजा जाएगा।"
                        : "Password reset link will be sent to registered credentials."
                    )
                  }
                >
                  {t("auth.forgot_password")}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>{t("auth.remember_me")}</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-4 rounded-2xl font-black text-sm sm:text-base text-white shadow-lg transition-all min-h-[54px] flex items-center justify-center gap-2 active:scale-95 shrink-0 whitespace-nowrap overflow-visible ${
                selectedRole === "officer"
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-900/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin shrink-0" />
                  <span className="whitespace-nowrap">{locale === "hi" ? "सत्यापन जारी है..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <span className="whitespace-nowrap">{t("auth.signin_btn")}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600 font-medium">
              {locale === "hi" ? "नया पंजीकरण करना चाहते हैं? " : "New to the platform? "}
              <Link href="/signup" className="text-emerald-700 font-black hover:underline ml-1">
                {locale === "hi" ? "नया खाता बनाएं →" : "Register here →"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
