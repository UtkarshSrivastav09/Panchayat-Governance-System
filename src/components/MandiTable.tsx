"use client";

import { MandiRecord } from "@/lib/mandi";
import { useI18n } from "@/lib/i18n";
import { Award, MapPin, Calendar, TrendingUp } from "lucide-react";

interface MandiTableProps {
  records: MandiRecord[];
  onSelectMandi?: (mandi: MandiRecord) => void;
  selectedMandi?: MandiRecord | null;
}

export default function MandiTable({
  records,
  onSelectMandi,
  selectedMandi,
}: MandiTableProps) {
  const { t, locale } = useI18n();

  if (!records || records.length === 0) {
    return (
      <div className="bg-white/80 rounded-3xl p-8 text-center border border-emerald-100 text-slate-500">
        <p>{locale === "hi" ? "इस फसल के लिए कोई मंडी भाव उपलब्ध नहीं है।" : "No mandi records found for this crop."}</p>
      </div>
    );
  }

  // Sort by modal price descending so highest rate appears first
  const sorted = [...records].sort((a, b) => b.modal_price - a.modal_price);
  const highestPrice = sorted[0]?.modal_price || 0;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50/70 border-b border-emerald-100 text-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <th className="py-4 px-4 sm:px-6">{t("mandi.market")}</th>
              <th className="py-4 px-3 sm:px-4">{t("mandi.variety")}</th>
              <th className="py-4 px-3 sm:px-4 text-right">{t("mandi.min_price")}</th>
              <th className="py-4 px-3 sm:px-4 text-right">{t("mandi.modal_price")}</th>
              <th className="py-4 px-3 sm:px-4 text-right">{t("mandi.max_price")}</th>
              <th className="py-4 px-4 sm:px-6 text-center">{locale === "hi" ? "चुनें" : "Select"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sorted.map((item, idx) => {
              const isBest = item.modal_price === highestPrice;
              const isSelected = selectedMandi?.market === item.market;

              return (
                <tr
                  key={idx}
                  onClick={() => onSelectMandi && onSelectMandi(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-amber-50/80 font-medium"
                      : isBest
                      ? "bg-emerald-50/30 hover:bg-emerald-50/60"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 text-base">
                        {item.market}
                      </div>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm shrink-0">
                          <Award className="w-3 h-3" />
                          {t("mandi.best_price")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.district}
                        {item.distance_km && ` (~${item.distance_km} किमी)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.arrival_date}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3 sm:px-4 text-slate-700 font-medium">
                    {item.variety || "सामान्य"}
                  </td>

                  <td className="py-4 px-3 sm:px-4 text-right text-slate-600">
                    ₹{item.min_price}
                  </td>

                  <td className="py-4 px-3 sm:px-4 text-right">
                    <span className="text-base sm:text-lg font-black text-emerald-700">
                      ₹{item.modal_price}
                    </span>
                    <span className="text-xs text-slate-500 block">/क्विंटल</span>
                  </td>

                  <td className="py-4 px-3 sm:px-4 text-right text-slate-600">
                    ₹{item.max_price}
                  </td>

                  <td className="py-4 px-4 sm:px-6 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMandi && onSelectMandi(item);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                        isSelected
                          ? "bg-amber-600 text-white shadow"
                          : "bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {isSelected ? "✓ चुना गया" : "कैलकुलेट करें"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
