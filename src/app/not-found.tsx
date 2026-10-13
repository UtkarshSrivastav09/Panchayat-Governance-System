import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-black mb-4">
        🌾
      </div>
      <h1 className="text-4xl font-black tracking-tight text-white mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-300 mb-4">
        पृष्ठ नहीं मिला / Page Not Found
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        यह पृष्ठ मौजूद नहीं है या हटा दिया गया है। कृपया मुख्य पृष्ठ पर वापस जाएं।
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg"
      >
        डैशबोर्ड पर जाएं / Go to Dashboard
      </Link>
    </div>
  );
}
