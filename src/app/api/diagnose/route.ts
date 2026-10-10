import { NextRequest, NextResponse } from "next/server";
import { diagnoseCrop } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DiagnoseRequestSchema } from "@/lib/validators";

// Simple in-memory rate limiter per user/ip (max 10 requests per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 3600 * 1000 });
    return true;
  }

  if (entry.count >= 20) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const note = (formData.get("user_note") as string) || "";
    const latStr = formData.get("lat") as string | null;
    const lngStr = formData.get("lng") as string | null;
    const village = (formData.get("village") as string) || "Lucknow";

    if (!file) {
      return NextResponse.json(
        { error: "कृपया फसल की फोटो अपलोड करें (Image required)" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "केवल JPG, PNG या WebP फोटो मान्य है (Invalid format)" },
        { status: 400 }
      );
    }

    // Limit 4 MB
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "फोटो का आकार 4MB से कम होना चाहिए (File too large)" },
        { status: 400 }
      );
    }

    // Rate limit check
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "प्रति घंटे अनुरोध सीमा समाप्त हुई। कृपया थोड़ी देर बाद पुनः प्रयास करें।" },
        { status: 429 }
      );
    }

    const lat = latStr ? parseFloat(latStr) : 26.8467;
    const lng = lngStr ? parseFloat(lngStr) : 80.9462;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Gemini vision
    const diagnosis = await diagnoseCrop(buffer, file.type, note);

    // Save report in Supabase or fallback
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || "00000000-0000-0000-0000-000000000001";
    const imagePath = `crop-images/${userId}/${Date.now()}.jpg`;

    try {
      const adminSupabase = createAdminClient();
      // Try uploading to crop-images bucket if available
      await adminSupabase.storage
        .from("crop-images")
        .upload(`${userId}/${Date.now()}.jpg`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      // Insert record into crop_reports with PostGIS geometry
      await adminSupabase.from("crop_reports").insert({
        user_id: userId,
        image_path: imagePath,
        user_note: note,
        crop_key: diagnosis.crop_key,
        disease_key: diagnosis.disease_key,
        is_healthy: diagnosis.is_healthy,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        diagnosis: diagnosis,
        village: village,
        geom: `POINT(${lng} ${lat})`,
      });
    } catch (dbErr) {
      console.warn("Storage/DB insert warning (proceeding with diagnosis):", dbErr);
    }

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    return NextResponse.json(
      {
        error: "फसल की जांच के दौरान तकनीकी समस्या आई। कृपया पुनः प्रयास करें।",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
