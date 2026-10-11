import { NextRequest, NextResponse } from "next/server";

interface CachedWeather {
  timestamp: number;
  data: {
    temp: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    condition_en: string;
    condition_hi: string;
  };
}

let cachedWeather: CachedWeather | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

function getWeatherCondition(code: number): { condition_en: string; condition_hi: string } {
  if (code === 0) {
    return { condition_en: "Clear Sky", condition_hi: "साफ मौसम" };
  }
  if (code === 1 || code === 2) {
    return { condition_en: "Mainly Clear", condition_hi: "हल्के बादल" };
  }
  if (code === 3) {
    return { condition_en: "Partly Cloudy", condition_hi: "आंशिक बादल" };
  }
  if (code === 45 || code === 48) {
    return { condition_en: "Foggy / Mist", condition_hi: "कोहरा" };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) {
    return { condition_en: "Light Rain", condition_hi: "हल्की बारिश" };
  }
  if ([66, 67, 82].includes(code)) {
    return { condition_en: "Heavy Rain", condition_hi: "तेज बारिश" };
  }
  if ([95, 96, 99].includes(code)) {
    return { condition_en: "Thunderstorm", condition_hi: "आंधी-तूफान" };
  }
  return { condition_en: "Pleasant Weather", condition_hi: "सुखद मौसम" };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "26.8467";
    const lng = searchParams.get("lng") || "80.9462";

    const now = Date.now();
    if (cachedWeather && now - cachedWeather.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedWeather.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const current = json.current;

      if (current) {
        const weatherInfo = getWeatherCondition(current.weather_code ?? 0);
        const result = {
          temp: Math.round(current.temperature_2m ?? 29),
          humidity: Math.round(current.relative_humidity_2m ?? 62),
          windSpeed: Math.round(current.wind_speed_10m ?? 6),
          weatherCode: current.weather_code ?? 0,
          condition_en: weatherInfo.condition_en,
          condition_hi: weatherInfo.condition_hi,
        };

        cachedWeather = {
          timestamp: now,
          data: result,
        };

        return NextResponse.json(result, {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            "X-Cache": "MISS",
          },
        });
      }
    }
  } catch (e) {
    // Quiet fallback to realistic seasonal values
  }

  // Graceful offline fallback
  const fallback = {
    temp: 29,
    humidity: 62,
    windSpeed: 6,
    weatherCode: 0,
    condition_en: "Clear Sky",
    condition_hi: "साफ मौसम",
  };

  return NextResponse.json(fallback);
}
