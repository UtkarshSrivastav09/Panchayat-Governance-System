"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import { getUserSession, clearUserSession, UserProfile } from "@/lib/auth-storage";
import {
  Stethoscope,
  Map,
  BadgePercent,
  FileText,
  Shield,
  Compass,
  Home,
  LogOut,
  User,
  Award,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = getUserSession();
    setCurrentUser(session);
  }, [pathname]);

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const navLinks = [
    { href: "/dashboard", label: locale === "hi" ? "होम" : "Home", icon: Home },
    { href: "/schemes", label: locale === "hi" ? "योजनाएं" : "Govt Schemes", icon: Award },
    { href: "/crop-doctor", label: locale === "hi" ? "फसल डॉक्टर" : "Crop Doctor", icon: Stethoscope },
    { href: "/outbreaks", label: locale === "hi" ? "अलर्ट रडार" : "Outbreak Alerts", icon: Map },
    { href: "/mandi", label: locale === "hi" ? "मंडी भाव" : "Mandi Rates", icon: BadgePercent },
    { href: "/my-reports", label: locale === "hi" ? "मेरी रिपोर्टें" : "My Reports", icon: FileText },
    { href: "/roadmap", label: locale === "hi" ? "रोडमैप" : "Roadmap", icon: Compass },
  ];

  // First letter of user's name for avatar
  const userInitial = currentUser?.full_name ? currentUser.full_name.trim()[0].toUpperCase() : "U";

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs transition-all">
        <div className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-4 lg:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
          
          {/* Left: Brand Identity (Official Name: Smart Panchayat: Gram Sahayak) */}
          <Link
            href={currentUser ? (currentUser.role === "officer" ? "/officer" : "/dashboard") : "/login"}
            className="flex items-center gap-2 group shrink-0 min-w-fit"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md group-hover:scale-105 transition-all shrink-0">
              🌾
            </div>
            <div className="shrink-0 flex flex-col justify-center">
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight leading-none block whitespace-nowrap">
                Smart Panchayat:
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-emerald-700 tracking-tight leading-tight block whitespace-nowrap mt-0.5">
                Gram Sahayak
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Pills (All Primary Services Visible on Desktop >= 1280px) */}
          {!isAuthPage && currentUser && (
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner shrink-0">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-white text-emerald-900 shadow-sm border border-emerald-100/90 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Actions, Language Toggle & User Session Card */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <LanguageToggle />

            {/* Officer Link (Only if officer logged in) */}
            {!isAuthPage && currentUser?.role === "officer" && (
              <Link
                href="/officer"
                prefetch={true}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-xs transition-all shrink-0"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span className="whitespace-nowrap">{locale === "hi" ? "अधिकारी पोर्टल" : "Officer Command"}</span>
              </Link>
            )}

            {/* User Session Profile Chip or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1 sm:p-1.5 shadow-xs shrink-0">
                {/* User Avatar & Name */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-1 py-0.5 shrink-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0 ${
                      currentUser.role === "officer"
                        ? "bg-gradient-to-tr from-amber-600 to-orange-500"
                        : "bg-gradient-to-tr from-emerald-600 to-teal-500"
                    }`}
                  >
                    {userInitial}
                  </div>
                  
                  {/* Full Name & Role - Always rendered cleanly */}
                  <div className="flex flex-col text-left shrink-0">
                    <span className="font-extrabold text-xs text-slate-900 leading-tight whitespace-nowrap">
                      {currentUser.full_name}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider block whitespace-nowrap ${
                        currentUser.role === "officer"
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {currentUser.role === "officer"
                        ? locale === "hi" ? "🛡️ अधिकारी" : "🛡️ Officer"
                        : locale === "hi" ? "🌾 किसान" : "🌾 Farmer"}
                    </span>
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="h-5 w-px bg-slate-200 block shrink-0" />

                {/* Distinct Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100/80 active:scale-95 transition-all shrink-0"
                  title={locale === "hi" ? "लॉग आउट करें" : "Log Out"}
                  aria-label="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline font-bold text-[11px] whitespace-nowrap">
                    {locale === "hi" ? "लॉग आउट" : "Log Out"}
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={true}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap min-w-fit"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {locale === "hi" ? "लॉगिन करें" : "Sign In"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Bottom Fixed Navigation Dock (Screens < 1280px) */}
      {!isAuthPage && currentUser && (
        <nav
          aria-label="Mobile Navigation"
          className="xl:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-xl border border-emerald-200/80 shadow-2xl rounded-2xl py-1 px-1.5 flex items-center justify-around"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[46px] transition-all ${
                  isActive
                    ? "text-emerald-800 font-black scale-105"
                    : "text-slate-500 font-semibold hover:text-emerald-700"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? "bg-emerald-100 text-emerald-800" : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight text-center truncate max-w-[56px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
