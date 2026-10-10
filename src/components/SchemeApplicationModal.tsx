"use client";

import { useState } from "react";
import { GovtScheme } from "@/data/schemes";
import { UserProfile } from "@/lib/auth-storage";
import { useI18n } from "@/lib/i18n";
import {
  X,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Send,
  RefreshCw,
  Phone,
  User,
  MapPin,
  LandPlot,
  Award,
} from "lucide-react";

interface SchemeApplicationModalProps {
  scheme: GovtScheme | null;
  currentUser: UserProfile | null;
  onClose: () => void;
}

export default function SchemeApplicationModal({
  scheme,
  currentUser,
  onClose,
}: SchemeApplicationModalProps) {
  const { locale } = useI18n();

  if (!scheme) return null;

  const [fullName, setFullName] = useState(currentUser?.full_name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "9876543210");
  const [village, setVillage] = useState(currentUser?.village || (locale === "hi" ? "मलिहाबाद" : "Malihabad"));
  const [district, setDistrict] = useState(currentUser?.district || "Lucknow");
  const [aadhaar, setAadhaar] = useState("");
  const [landArea, setLandArea] = useState(locale === "hi" ? "2.5 एकड़" : "2.5 Acres");
  const [khataNumber, setKhataNumber] = useState("142/08");
  const [submitting, setSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const generatedToken = `UP-GS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Save application safely in local storage
      try {
        const existing = JSON.parse(localStorage.getItem("panchayat_scheme_applications") || "[]");
        const newRecord = {
          id: generatedToken,
          scheme_id: scheme.id,
          scheme_name: locale === "hi" ? scheme.name_hi : scheme.name_en,
          applicant_name: fullName,
          phone,
          village,
          district,
          aadhaar: aadhaar ? `XXXX-XXXX-${aadhaar.slice(-4)}` : "XXXX-XXXX-1234",
          land_area: landArea,
          khata_number: khataNumber,
          submitted_at: new Date().toISOString(),
          status: "Under Verification (Gram Panchayat)",
        };
        localStorage.setItem("panchayat_scheme_applications", JSON.stringify([newRecord, ...existing]));
      } catch (err) {
        console.warn("Storage save error:", err);
      }

      setSubmittedToken(generatedToken);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                {locale === "hi" ? "ग्रामसेतु फास्ट फॉर्म" : "GramSetu Fast Form"}
              </span>
              <span className="text-xs text-emerald-200 font-bold">
                {locale === "hi" ? scheme.subsidy_highlight_hi : scheme.subsidy_highlight_en}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              {locale === "hi" ? scheme.name_hi : scheme.name_en}
            </h3>
            <p className="text-xs text-emerald-100">
              {locale === "hi" ? scheme.department_hi : scheme.department_en}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {submittedToken ? (
            /* Success Receipt */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  {locale === "hi" ? "ग्राम पंचायत में आवेदन दर्ज हुआ" : "Registered with Gram Panchayat"}
                </span>
                <h4 className="text-xl font-black text-slate-900 pt-1">
                  {locale === "hi" ? `बधाई हो, ${fullName}!` : `Congratulations, ${fullName}!`}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {locale === "hi"
                    ? "आपका आवेदन ग्रामसेतु पोर्टल में सुरक्षित दर्ज कर लिया गया है। ग्राम पंचायत कृषि अधिकारी सत्यापन हेतु इसे अग्रसारित करेंगे।"
                    : "Your pre-application has been registered on the GramSetu portal for local verification."}
                </p>
              </div>

              {/* Receipt Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-medium">
                    {locale === "hi" ? "आवेदन संदर्भ टोकन:" : "Application Token ID:"}
                  </span>
                  <span className="font-mono font-black text-sm text-emerald-800 tracking-wide">
                    {submittedToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{locale === "hi" ? "योजना:" : "Scheme:"}</span>
                  <span className="font-bold text-slate-900">
                    {locale === "hi" ? scheme.name_hi : scheme.name_en}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{locale === "hi" ? "लाभार्थी:" : "Beneficiary:"}</span>
                  <span className="font-bold text-slate-900">{fullName} ({village})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{locale === "hi" ? "अनुमानित लाभ:" : "Estimated Benefit:"}</span>
                  <span className="font-black text-emerald-700">
                    {locale === "hi" ? scheme.benefit_hi : scheme.benefit_en}
                  </span>
                </div>
              </div>

              {/* Important Official Central Portal Note */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1 text-xs">
                <span className="font-extrabold text-amber-950 block">
                  {locale === "hi" ? "📌 मुख्य सरकारी पोर्टल ई-केवाईसी (e-KYC) सूचना:" : "📌 Official National Portal e-KYC Notice:"}
                </span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  {locale === "hi"
                    ? "केंद्रीय नियमों के अनुसार पीएम-किसान के अंतिम प्रत्यक्ष लाभ (DBT) हेतु भारत सरकार के मुख्य पोर्टल पर आधार ई-केवाईसी अनिवार्य है। नीचे दिए गए बटन से सीधे मुख्य पोर्टल पर जाएं।"
                    : "As per Ministry guidelines, biometric/OTP e-KYC on the Central Government portal (pmkisan.gov.in) is mandatory for direct fund release. Click below to open the official central portal."}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  <span>
                    {locale === "hi" ? "मुख्य पोर्टल (pmkisan.gov.in) खोलें" : "Open Central Portal (pmkisan.gov.in)"}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                >
                  {locale === "hi" ? "समाप्त करें" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold leading-tight">
                    {locale === "hi" ? scheme.benefit_hi : scheme.benefit_en}
                  </span>
                </div>
                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 hover:underline shrink-0"
                >
                  <span>{locale === "hi" ? "ऑफिशियल साइट" : "Official Site"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Farmer Name & Phone */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "किसान / आवेदक का नाम *" : "Applicant Full Name *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "मोबाइल नंबर (OTP लिंक) *" : "Mobile Number (Aadhaar linked) *"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Village & District */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "ग्राम पंचायत *" : "Gram Panchayat / Village *"}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "जिला *" : "District *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Aadhaar & Land area */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "आधार नंबर (12 अंक) *" : "Aadhaar Number (12 digits) *"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="XXXX-XXXX-XXXX"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "hi" ? "जमीन का रकबा (एकड़ / बीघा) *" : "Land Area (Acres / Bigha) *"}
                  </label>
                  <div className="relative">
                    <LandPlot className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Khata number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {locale === "hi" ? "खतौनी खाता / गाटा संख्या (वैकल्पिक)" : "Land Record / Khasra Plot No. (Optional)"}
                </label>
                <input
                  type="text"
                  value={khataNumber}
                  onChange={(e) => setKhataNumber(e.target.value)}
                  placeholder={locale === "hi" ? "उदा. 142/08" : "e.g. 142/08"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {locale === "hi" ? "रद्द करें" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{locale === "hi" ? "आवेदन दर्ज हो रहा है..." : "Submitting Application..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {locale === "hi" ? "आवेदन सबमिट करें" : "Submit Application"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
