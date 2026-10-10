import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Smart Panchayat: Gram Sahayak (स्मार्ट पंचायत: ग्राम सहायक)",
  description:
    "A Hindi, voice-first AI crop doctor, outbreak alert system, and mandi sell helper for farmers in Uttar Pradesh.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="awesome-light-bg min-h-screen text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <I18nProvider>
          {/* Subtle Decorative Ambient Background Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="ambient-orb absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="ambient-orb absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="ambient-orb absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-green-200/25 blur-3xl" />
            <div className="absolute inset-0 agri-grid-pattern opacity-40" />
          </div>

          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-24 xl:pb-10">{children}</main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
