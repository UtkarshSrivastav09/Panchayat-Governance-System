"use client";

import { useState } from "react";
import { MandiRecord } from "@/lib/mandi";
import { useI18n } from "@/lib/i18n";
import { Calculator, Coins, TrendingUp, HelpCircle } from "lucide-react";

interface RevenueCalculatorProps {
  records: MandiRecord[];
  selectedMandi: MandiRecord | null;
}

export default function RevenueCalculator({
  records,
  selectedMandi,
}: RevenueCalculatorProps) {
  const { t, locale } = useI18n();
  const [quantity, setQuantity] = useState<number>(25); // default 25 quintals

  const activeMandi = selectedMandi || records[0];

  if (!activeMandi) return null;

  // Find lowest price among loaded mandis to calculate advantage
  const lowestPrice = Math.min(...records.map((r) => r.modal_price));
  const activePrice = activeMandi.modal_price;

  const estimatedRevenue = Math.round(quantity * activePrice);
  const lowestRevenue = Math.round(quantity * lowestPrice);
  const extraAdvantage = Math.max(0, estimatedRevenue - lowestRevenue);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200/80 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {t("mandi.calculator_title")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {locale === "hi"
              ? `चुनी गई मंडी: ${activeMandi.market} (भाव: ₹${activePrice}/क्विंटल)`
              : `Selected Mandi: ${activeMandi.market} (Rate: ₹${activePrice}/qtl)`}
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <label
          htmlFor="harvest-quantity"
          className="block font-bold text-slate-800 text-sm sm:text-base"
        >
          {t("mandi.quantity_label")}
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              id="harvest-quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-2xl border border-amber-300 bg-white px-4 py-3.5 text-lg font-bold text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[48px]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              क्विंटल
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {[10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuantity(preset)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  quantity === preset
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Results Box */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Estimated Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>{t("mandi.estimated_revenue")}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
            ₹{estimatedRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {quantity} क्विंटल × ₹{activePrice} / क्विंटल
          </p>
        </div>

        {/* Advantage vs lowest mandi */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>{t("mandi.profit_difference")}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">
            +₹{extraAdvantage.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {extraAdvantage > 0
              ? locale === "hi"
                ? `न्यूनतम भाव वाली मंडी (₹${lowestPrice}) की तुलना में अतिरिक्त बचत`
                : `Extra gain vs lowest available mandi (₹${lowestPrice})`
              : locale === "hi"
              ? "यह सबसे कम भाव वाली मंडी है"
              : "Currently at baseline mandi price"}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-600 text-xs">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {t("mandi.disclaimer")}
        </p>
      </div>
    </div>
  );
}
