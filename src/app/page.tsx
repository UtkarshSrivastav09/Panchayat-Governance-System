"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/lib/auth-storage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getUserSession();
    if (session && session.role) {
      if (session.role === "officer") {
        router.replace("/officer");
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-black mb-4 animate-bounce">
        🌾
      </div>
      <h2 className="text-xl font-black text-slate-800">
        ग्रामसेतु (GramSetu)
      </h2>
      <p className="text-sm text-slate-500 mt-1 animate-pulse">
        पोर्टल लोड हो रहा है, कृपया प्रतीक्षा करें...
      </p>
    </div>
  );
}
