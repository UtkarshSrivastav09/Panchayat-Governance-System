"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { getCurrentLocation } from "@/lib/geo";
import { saveUserSession, registerAccountLocally, UserProfile } from "@/lib/auth-storage";
import AlertNotification from "@/components/ui/AlertNotification";
import {
  User,
  Shield,
  Lock,
  Mail,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Phone,
  Briefcase,
  RefreshCw,
} from "lucide-react";

export default function SignupPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

  // Role selection: 'farmer' or 'officer'
  const [role, setRole] = useState<"farmer" | "officer">("farmer");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("मलिहाबाद (Malihabad)");
  const [district, setDistrict] = useState("Lucknow");

  // Officer specific fields
  const [department, setDepartment] = useState("कृषि रक्षा एवं कल्याण विभाग");
  const [designation, setDesignation] = useState("कृषि रक्षा अधिकारी (ADO Agri)");

  // Password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage(
        locale === "hi"
          ? "दोनों पासवर्ड समान नहीं हैं। कृपया सही पासवर्ड दर्ज करें।"
          : "Passwords do not match. Please verify."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        locale === "hi"
          ? "पासवर्ड कम से कम 6 अक्षरों का होना अनिवार्य है।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      setLoading(true);

      const loc = await getCurrentLocation();

      let registeredId = "usr-" + Date.now();

      // 1. Store in Supabase via secure server API and direct client
      try {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            fullName: fullName.trim(),
            role,
            village: role === "farmer" ? village.trim() : undefined,
            district: district.trim(),
            phone: phone.trim(),
            department: role === "officer" ? department.trim() : undefined,
            designation: role === "officer" ? designation.trim() : undefined,
            lat: loc.lat,
            lng: loc.lng,
          }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData?.user?.id) {
            registeredId = regData.user.id;
          }
        }
      } catch (srvErr) {
        console.warn("Server Supabase register note:", srvErr);
      }

      // Also attempt direct client Supabase Auth
      try {
        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              village: role === "farmer" ? village.trim() : undefined,
              district: district.trim(),
              role,
              department: role === "officer" ? department.trim() : undefined,
              designation: role === "officer" ? designation.trim() : undefined,
              phone: phone.trim(),
              lat: loc.lat,
              lng: loc.lng,
            },
          },
        });

        if (data?.user?.id) {
          registeredId = data.user.id;

          // Also insert row into public.profiles
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            role,
            village: role === "farmer" ? village.trim() : "मुख्यालय",
            district: district.trim(),
            state: "Uttar Pradesh",
            language: locale,
          });
        }
      } catch (authErr) {
        console.warn("Supabase network note:", authErr);
      }

      // 2. Safely register and persist account profile
      const userProfile: UserProfile = {
        id: registeredId,
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        village: role === "farmer" ? village.trim() : undefined,
        district: district.trim(),
        state: "Uttar Pradesh",
        phone: phone.trim(),
        department: role === "officer" ? department.trim() : undefined,
        designation: role === "officer" ? designation.trim() : undefined,
        created_at: new Date().toISOString(),
        password: password,
      };

      // Register into accounts registry so user can log in with this exact password!
      registerAccountLocally(userProfile);

      // Save active session
      saveUserSession(userProfile);

      // Success alert
      setSuccessMessage(
        locale === "hi"
          ? `खाता सफलतापूर्वक पंजीकृत हुआ! नमस्ते ${fullName}, पोर्टल पर ले जाया जा रहा है...`
          : `Account registered successfully! Welcome ${fullName}, redirecting...`
      );

      // Route strictly after creation
      setTimeout(() => {
        if (role === "officer") {
          router.push("/officer");
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMessage(
        err?.message ||
          (locale === "hi"
            ? "पंजीकरण में त्रुटि आई। कृपया विवरण जांचें।"
            : "Registration failed. Please check details.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-12 space-y-4 sm:space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl overflow-hidden transition-all">
        {/* Tricolor accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center mx-auto text-xl sm:text-2xl font-black shadow-md">
              🌱
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                {locale === "hi"
                  ? "उत्तर प्रदेश शासन • नवीन उपयोगकर्ता पंजीकरण"
                  : "Govt of Uttar Pradesh • New User Registration"}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {t("nav.signup")}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {locale === "hi"
                  ? "कृपया अपनी सही जानकारी दर्ज करें ताकि संबंधित सरकारी सेवाएं मिल सकें"
                  : "Please provide accurate information for verified village governance"}
              </p>
            </div>
          </div>

          {/* Role Choice Cards */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {locale === "hi" ? "खाता प्रकार चुनें (Select Role):" : "Select Account Role:"}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Farmer Option Card */}
              <div
                onClick={() => setRole("farmer")}
                className={`cursor-pointer p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 select-none ${
                  role === "farmer"
                    ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 opacity-70"
                }`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base sm:text-lg">
                  🌾
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {t("auth.farmer_role")}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {locale === "hi" ? "फसल जांच, मंडी भाव" : "Crop health & mandi"}
                  </p>
                </div>
              </div>

              {/* Officer Option Card */}
              <div
                onClick={() => setRole("officer")}
                className={`cursor-pointer p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 select-none ${
                  role === "officer"
                    ? "border-amber-600 bg-amber-50/70 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 opacity-70"
                }`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base sm:text-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {t("auth.officer_role")}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {locale === "hi" ? "सत्यापन, डैशबोर्ड" : "Official alerts"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <AlertNotification
              type="error"
              title={locale === "hi" ? "पंजीकरण त्रुटि" : "Registration Error"}
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          )}

          {/* Success Alert */}
          {successMessage && (
            <AlertNotification
              type="success"
              title={locale === "hi" ? "पंजीकरण सफल" : "Registration Successful"}
              message={successMessage}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {t("auth.full_name")}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    role === "officer"
                      ? locale === "hi" ? "उदा. डॉ. आर. के. वर्मा" : "e.g. Dr. R. K. Verma"
                      : locale === "hi" ? "उदा. किसान का नाम" : "e.g. Farmer Name"
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {locale === "hi" ? "ईमेल पता" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === "officer" ? "officer@up.gov.in" : "farmer@up.gov.in"}
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {locale === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific fields */}
            {role === "farmer" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("auth.village")}
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="मलिहाबाद"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("auth.district")}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm"
                  >
                    <option value="Lucknow">📍 लखनऊ (Lucknow)</option>
                    <option value="Barabanki">📍 बाराबंकी (Barabanki)</option>
                    <option value="Sitapur">📍 सीतापुर (Sitapur)</option>
                    <option value="Unnao">📍 उन्नाव (Unnao)</option>
                    <option value="Hardoi">📍 हरदोई (Hardoi)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "सरकारी विभाग" : "Government Department"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="कृषि रक्षा विभाग"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "अधिकारी पदनाम" : "Officer Designation"}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="एडीओ कृषि / ग्राम पंचायत अधिकारी"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Passwords */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {locale === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px] shadow-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base text-white shadow-lg transition-all min-h-[50px] flex items-center justify-center gap-2 active:scale-95 ${
                role === "officer"
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-900/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>पंजीकरण सुरक्षित किया जा रहा है...</span>
                </>
              ) : (
                <>
                  <span>{t("auth.signup_btn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600 font-medium">
              {locale === "hi" ? "पहले से पंजीकृत हैं? " : "Already registered? "}
              <Link href="/login" className="text-emerald-700 font-black hover:underline ml-1">
                {locale === "hi" ? "यहाँ लॉगिन करें →" : "Sign in here →"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
