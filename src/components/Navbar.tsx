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
  Shield,
  Compass,
  Home,
  LogOut,
  User,
  Award,
  Building2,
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

  // Core 6 Public & Farmer Services (concise labels for ideal desktop navbar fitting)
  const navLinks = [
    { href: "/dashboard", label: locale === "hi" ? "होम" : "Home", icon: Home },
    { href: "/schemes", label: locale === "hi" ? "योजनाएं" : "Schemes", icon: Award },
    { href: "/crop-doctor", label: locale === "hi" ? "फसल डॉक्टर" : "Crop Doctor", icon: Stethoscope },
    { href: "/outbreaks", label: locale === "hi" ? "अलर्ट रडार" : "Alerts", icon: Map },
    { href: "/village-development", label: locale === "hi" ? "ग्राम विकास" : "Village Works", icon: Building2 },
    { href: "/mandi", label: locale === "hi" ? "मंडी भाव" : "Mandi Rates", icon: BadgePercent },
  ];

  // First letter of user's name for avatar
  const userInitial = currentUser?.full_name ? currentUser.full_name.trim()[0].toUpperCase() : "U";

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs transition-all">
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left: Brand Identity (GramSetu) */}
          <Link
            href={currentUser ? (currentUser.role === "officer" ? "/officer" : "/dashboard") : "/dashboard"}
            className="flex items-center gap-1.5 group shrink-0 min-w-fit"
            title="GramSetu - Smart Panchayat Portal"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-all shrink-0">
              🌾
            </div>
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight whitespace-nowrap">
                  Gram<span className="text-emerald-600 font-black">Setu</span>
                </span>
                <span className="inline-flex items-center px-1 py-0.2 rounded-full text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <span className="hidden 2xl:inline text-[9px] font-bold text-emerald-800 tracking-wider uppercase leading-tight whitespace-nowrap mt-0.5">
                {locale === "hi" ? "स्मार्ट पंचायत • ग्राम सहायक" : "Smart Panchayat • Gram Sahayak"}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Pills (Ultra-compact so it fits on any screen size) */}
          {!isAuthPage && (
            <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-white text-emerald-900 shadow-xs border border-emerald-100/90 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Actions (Roadmap Symbol Button, Language Switcher, User Profile & Log Out) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
            {/* Dedicated Roadmap Symbol Button */}
            {!isAuthPage && (
              <Link
                href="/roadmap"
                prefetch={true}
                className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-black transition-all shadow-xs active:scale-95 group shrink-0 ${
                  pathname === "/roadmap"
                    ? "bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500/40"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
                title={locale === "hi" ? "रोडमैप (Roadmap) देखें" : "View Development Roadmap"}
              >
                <Compass className={`w-3.5 h-3.5 transition-transform group-hover:rotate-45 shrink-0 ${pathname === "/roadmap" ? "text-white" : "text-emerald-700"}`} />
                <span className="whitespace-nowrap font-extrabold">{locale === "hi" ? "रोडमैप" : "Roadmap"}</span>
              </Link>
            )}

            {/* Language Switcher */}
            <LanguageToggle />

            {/* Officer Link (Only if officer logged in) */}
            {!isAuthPage && currentUser?.role === "officer" && (
              <Link
                href="/officer"
                prefetch={true}
                className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-xs transition-all shrink-0"
              >
                <Shield className="w-3 h-3 text-amber-600" />
                <span className="whitespace-nowrap">{locale === "hi" ? "अधिकारी" : "Officer"}</span>
              </Link>
            )}

            {/* User Session Profile Chip or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-xs shrink-0">
                {/* User Avatar */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-xs shrink-0 ${
                    currentUser.role === "officer"
                      ? "bg-gradient-to-tr from-amber-600 to-orange-500"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-500"
                  }`}
                  title={`${currentUser.full_name} (${currentUser.role})`}
                >
                  {userInitial}
                </div>
                
                {/* Full Name & Role */}
                <div className="flex flex-col text-left shrink-0 max-w-[85px] sm:max-w-[110px] px-0.5">
                  <span className="font-extrabold text-[11px] text-slate-900 leading-tight truncate">
                    {currentUser.full_name}
                  </span>
                  <span
                    className={`text-[8.5px] font-black uppercase tracking-wider block whitespace-nowrap leading-none mt-0.5 ${
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

                {/* Subtle Divider */}
                <div className="h-3.5 sm:h-4 w-px bg-slate-200 shrink-0 mx-0.5" />

                {/* Distinct Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-0.5 p-1 rounded-md text-xs font-bold text-rose-700 hover:bg-rose-100/80 active:scale-95 transition-all shrink-0"
                  title={locale === "hi" ? "लॉग आउट करें" : "Log Out"}
                  aria-label="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span className="hidden xl:inline font-bold text-[10px] whitespace-nowrap">
                    {locale === "hi" ? "लॉग आउट" : "Log Out"}
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={true}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {locale === "hi" ? "लॉगिन" : "Sign In"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Bottom Fixed Navigation Dock (Screens < 1024px) */}
      {!isAuthPage && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-1.5 sm:bottom-3 left-1.5 sm:left-3 right-1.5 sm:right-3 z-40 bg-white/95 backdrop-blur-xl border border-emerald-200/80 shadow-2xl rounded-2xl py-1 px-1 flex items-center justify-around"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl min-h-[42px] min-w-[44px] transition-all shrink-0 ${
                  isActive
                    ? "text-emerald-800 font-black scale-105"
                    : "text-slate-500 font-semibold hover:text-emerald-700"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? "bg-emerald-100 text-emerald-800 shadow-xs" : ""
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 shrink-0" />
                </div>
                <span className="text-[9px] xs:text-[10px] mt-0.5 tracking-tight text-center font-bold truncate max-w-[50px] leading-tight">
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
