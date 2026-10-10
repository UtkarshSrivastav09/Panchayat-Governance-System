import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OutbreakReviewSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clusterKey = decodeURIComponent(id);
    const body = await request.json();

    const validated = OutbreakReviewSchema.parse({
      cluster_key: clusterKey,
      status: body.status,
      note: body.note || "",
    });

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("outbreak_reviews")
      .upsert(
        {
          cluster_key: validated.cluster_key,
          status: validated.status,
          note: validated.note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cluster_key" }
      )
      .select()
      .single();

    if (error) {
      console.warn("DB Upsert warning (returning state):", error);
    }

    return NextResponse.json({
      success: true,
      review: data || validated,
    });
  } catch (error: any) {
    console.error("Error updating outbreak review:", error);
    return NextResponse.json(
      { error: "Failed to update review", details: error?.message },
      { status: 500 }
    );
  }
}
