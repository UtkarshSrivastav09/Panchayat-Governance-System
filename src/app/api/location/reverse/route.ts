import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Latitude and Longitude required" }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const lang = searchParams.get("lang") || "hi";

    // Call OpenStreetMap Nominatim with strict Government/Panchayat level hierarchy
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${lang === "en" ? "en,hi" : "hi,en"}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "GramSetu-SmartPanchayat/1.0 (panchayat-governance-gov-portal)",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Hierarchical village extraction:
      const village =
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.town ||
        addr.county ||
        (lang === "en" ? "Malihabad" : "मलिहाबाद");

      const block =
        addr.subdistrict ||
        addr.county ||
        addr.state_district ||
        village;

      const district =
        addr.state_district ||
        addr.city ||
        addr.district ||
        (lang === "en" ? "Lucknow" : "लखनऊ");

      const state =
        addr.state ||
        (lang === "en" ? "Uttar Pradesh" : "उत्तर प्रदेश");

      const pincode = addr.postcode || "";

      return NextResponse.json({
        success: true,
        village,
        block,
        district,
        state,
        pincode,
        display_name: data.display_name || `${village}, ${district}, ${state}`,
        lat,
        lng,
        source: "osm_nominatim_gov",
      });
    }
  } catch (err) {
    console.warn("Reverse geocode fetch failed, using geo-fallback:", err);
  }

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "hi";

  // Fallback for demo stability
  return NextResponse.json({
    success: true,
    village: lang === "en" ? "Malihabad" : "मलिहाबाद",
    block: lang === "en" ? "Malihabad" : "मलिहाबाद",
    district: lang === "en" ? "Lucknow" : "लखनऊ",
    state: lang === "en" ? "Uttar Pradesh" : "उत्तर प्रदेश",
    pincode: "226102",
    display_name: lang === "en" ? "Malihabad, Lucknow, Uttar Pradesh" : "मलिहाबाद, लखनऊ, उत्तर प्रदेश",
    lat: 26.9201,
    lng: 80.7123,
    source: "fallback",
  });
}
