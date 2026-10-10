import { NextRequest, NextResponse } from "next/server";
import { getMandiPrices } from "@/lib/mandi";
import { MandiQuerySchema } from "@/lib/validators";

// In-memory cache for mandi rates (TTL: 60 seconds)
const mandiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || "UP";
    const district = searchParams.get("district") || "Lucknow";
    const crop = searchParams.get("crop") || "Wheat";

    const validated = MandiQuerySchema.parse({ state, district, crop });
    const cacheKey = `${validated.state}_${validated.district}_${validated.crop}`;

    const now = Date.now();
    const cached = mandiCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const data = await getMandiPrices(
      validated.state,
      validated.district,
      validated.crop
    );

    mandiCache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mandi API error:", error);
    return NextResponse.json(
      { error: "मंडी डेटा लोड करने में असमर्थ", details: error?.message },
      { status: 500 }
    );
  }
}
