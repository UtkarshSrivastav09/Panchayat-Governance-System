import fallbackData from "@/data/mandi-fallback.json";

export interface MandiRecord {
  market: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_date: string;
  district: string;
  state: string;
  distance_km?: number;
}

export interface MandiResponse {
  source: "gov_api" | "mock" | "gov_api_fallback" | "sample";
  cached_at?: string;
  records: MandiRecord[];
  message?: string;
}

export async function getMandiPrices(
  state: string = "UP",
  district: string = "Lucknow",
  crop: string = "Wheat"
): Promise<MandiResponse> {
  // Check ENV toggle: USE_LIVE_MANDI_API can be "true" or "false"
  // Default to true if DATA_GOV_API_KEY is present or USE_LIVE_MANDI_API === "true"
  const envLiveFlag = process.env.USE_LIVE_MANDI_API;
  const isLiveRequested =
    envLiveFlag === "true" ||
    (envLiveFlag !== "false" && !!process.env.DATA_GOV_API_KEY && process.env.DATA_GOV_API_KEY.trim() !== "");

  const apiKey = process.env.DATA_GOV_API_KEY;
  const resourceId = process.env.MANDI_RESOURCE_ID || "9ef84268-d588-465a-a308-a864a43d0070";

  // If live mode is requested and an API key is available
  if (isLiveRequested && apiKey && apiKey.trim() !== "") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(
        apiKey.trim()
      )}&format=json&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(
        district
      )}&filters[commodity]=${encodeURIComponent(crop)}&limit=25`;

      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 3600 }, // 1 hour cache
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.records && Array.isArray(json.records) && json.records.length > 0) {
          const records: MandiRecord[] = json.records.map((r: any) => ({
            market: r.market || r.Market || "Mandi",
            commodity: r.commodity || r.Commodity || crop,
            variety: r.variety || r.Variety || "Standard",
            min_price: Number(r.min_price || r.Min_Price || 0),
            max_price: Number(r.max_price || r.Max_Price || 0),
            modal_price: Number(r.modal_price || r.Modal_Price || 0),
            arrival_date: r.arrival_date || r.Arrival_Date || new Date().toLocaleDateString("en-IN"),
            district: r.district || r.District || district,
            state: r.state || r.State || state,
          }));

          return {
            source: "gov_api",
            records,
            message: "सत्यापित लाइव सरकारी डेटा (Live data from Agmarknet API)",
          };
        }
      }
    } catch (e: any) {
      console.warn("Live Government Mandi API fetch error (falling back to cached data):", e?.message || e);
    }
  }

  // Filter fallback records by crop commodity
  const normalizedCrop = crop.toLowerCase();
  const filtered = fallbackData.records.filter((rec: any) => {
    const comm = rec.commodity.toLowerCase();
    if (normalizedCrop.includes("wheat") || normalizedCrop.includes("gehu")) {
      return comm.includes("wheat");
    }
    if (normalizedCrop.includes("rice") || normalizedCrop.includes("paddy") || normalizedCrop.includes("dhan")) {
      return comm.includes("paddy") || comm.includes("rice");
    }
    if (normalizedCrop.includes("potato") || normalizedCrop.includes("aloo")) {
      return comm.includes("potato");
    }
    if (normalizedCrop.includes("mustard") || normalizedCrop.includes("sarson")) {
      return comm.includes("mustard");
    }
    if (normalizedCrop.includes("sugarcane") || normalizedCrop.includes("ganna")) {
      return comm.includes("sugarcane");
    }
    if (normalizedCrop.includes("tomato") || normalizedCrop.includes("tamatar")) {
      return comm.includes("tomato");
    }
    if (normalizedCrop.includes("mango") || normalizedCrop.includes("aam")) {
      return comm.includes("mango");
    }
    return comm.includes(normalizedCrop);
  });

  const finalRecords: MandiRecord[] =
    filtered.length > 0 ? (filtered as MandiRecord[]) : (fallbackData.records.slice(0, 5) as MandiRecord[]);

  // If live mode was requested by env but failed or no key was given, label as fallback
  const sourceMode: MandiResponse["source"] = isLiveRequested
    ? apiKey
      ? "gov_api_fallback"
      : "sample"
    : "mock";

  return {
    source: sourceMode,
    cached_at: new Date().toISOString(),
    records: finalRecords,
    message:
      sourceMode === "mock"
        ? "मॉक मोड (Mock Mode via USE_LIVE_MANDI_API=false)"
        : sourceMode === "gov_api_fallback"
        ? "लाइव सरकारी सर्वर अनुपलब्ध होने के कारण बैकअप डेटा दिखाया गया है"
        : "नमूना डेटा (Sample data)",
  };
}
