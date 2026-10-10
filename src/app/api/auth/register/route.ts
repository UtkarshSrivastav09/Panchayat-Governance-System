import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      role = "farmer",
      village,
      district,
      state = "Uttar Pradesh",
      phone,
      department,
      designation,
      lat,
      lng,
    } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "नाम, ईमेल और पासवर्ड आवश्यक हैं।" },
        { status: 400 }
      );
    }

    let supabaseUserId: string | null = null;
    let storedInSupabase = false;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasRealSupabase = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));

    if (hasRealSupabase) {
      try {
        const admin = createAdminClient();
        
        // Attempt to register or fetch user in Supabase Auth
        const { data: userData, error: userError } = await admin.auth.admin.createUser({
          email: email.trim(),
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName.trim(),
            role,
            village: village?.trim(),
            district: district?.trim(),
            phone: phone?.trim(),
            department: department?.trim(),
            designation: designation?.trim(),
          },
        });

        if (!userData || userError) {
          console.warn("Supabase auth note:", userError?.message);
        } else if (userData?.user?.id) {
          supabaseUserId = userData.user.id;
          storedInSupabase = true;
        }

        const effectiveId = supabaseUserId || `usr-${Date.now()}`;

        // Insert or update profiles table
        const { error: profileError } = await admin.from("profiles").upsert(
          {
            id: effectiveId,
            full_name: fullName.trim(),
            role: role,
            village: village?.trim() || (role === "officer" ? "मुख्यालय" : "मलिहाबाद"),
            district: district?.trim() || "Lucknow",
            state: state || "Uttar Pradesh",
            language: "hi",
          },
          { onConflict: "id" }
        );

        if (!profileError) {
          storedInSupabase = true;
        }
      } catch (dbErr: any) {
        console.warn("Supabase registration note:", dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      storedInSupabase,
      user: {
        id: supabaseUserId || `usr-${Date.now()}`,
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        village: village?.trim(),
        district: district?.trim(),
        state,
        phone: phone?.trim(),
        department: department?.trim(),
        designation: designation?.trim(),
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "पंजीकरण में त्रुटि आई।", details: err?.message },
      { status: 500 }
    );
  }
}
