import { NextResponse } from "next/server";
import {
  INITIAL_VILLAGE_PROJECTS,
  VillageWorkProject,
  CitizenGrievance,
  STATE_DISTRICT_BLOCK_DATA,
  getPanchayatSignatories,
  getVillageProjectsForLocation,
} from "@/data/village-works";

// In-memory store for runtime persistence across API requests
let inMemoryProjects: VillageWorkProject[] = [...INITIAL_VILLAGE_PROJECTS];
let inMemoryGrievances: CitizenGrievance[] = [
  {
    id: "UP-GR-2026-10492",
    project_id: "UP-LKO-MLH-2026-001",
    project_title: "वार्ड नं० 4 से मुख्य मंडी संपर्क मार्ग तक सीसी रोड व इंटरलॉकिंग निर्माण",
    citizen_name: "सुरेश वर्मा",
    citizen_phone: "9838123456",
    village: "Malihabad Khas",
    issue_type: "delay",
    description: "पिछले 10 दिनों से बारिश के बाद सीमेंट का काम रुका हुआ है, कृपया गति बढ़ाई जाए ताकि धान/गेहूं ढुलाई में दिक्कत न हो।",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "under_review",
    officer_remarks: "अवर अभियंता को स्थलीय निरीक्षण व कार्य पुनः चालू कराने हेतु निर्देशित किया गया है।",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || "Uttar Pradesh";
    const district = searchParams.get("district") || "Lucknow";
    const block = searchParams.get("block") || "Malihabad";
    const village = searchParams.get("village") || "Malihabad Khas";
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Always resolve the exact, verified signatories for the selected location
    const signatories = getPanchayatSignatories(state, district, block, village);

    // Check if village has pre-curated projects, otherwise generate authentic localized works
    const isCurated = INITIAL_VILLAGE_PROJECTS.some(
      (p) => p.village.toLowerCase() === village.toLowerCase()
    );

    let villageProjects: VillageWorkProject[];
    if (isCurated) {
      villageProjects = inMemoryProjects.filter(
        (p) => p.village.toLowerCase() === village.toLowerCase()
      );
    } else {
      villageProjects = getVillageProjectsForLocation(state, district, block, village);
      // Synchronize in-memory store so grievances can bind properly
      villageProjects.forEach((vp) => {
        const existingIdx = inMemoryProjects.findIndex((imp) => imp.id === vp.id);
        if (existingIdx >= 0) {
          inMemoryProjects[existingIdx] = vp;
        } else {
          inMemoryProjects.push(vp);
        }
      });
    }

    let filtered = [...villageProjects];

    if (category && category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Calculate Financial and Physical Progress Metrics
    const totalSanctioned = filtered.reduce((acc, curr) => acc + (curr.sanctioned_amount || 0), 0);
    const totalDisbursed = filtered.reduce((acc, curr) => acc + (curr.disbursed_amount || 0), 0);
    const totalUtilized = filtered.reduce((acc, curr) => acc + (curr.utilized_amount || 0), 0);
    const completedCount = filtered.filter((p) => p.status === "completed").length;
    const inProgressCount = filtered.filter((p) => p.status === "in_progress").length;
    const avgProgress = filtered.length > 0
      ? Math.round(filtered.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0) / filtered.length)
      : 0;

    return NextResponse.json({
      success: true,
      selected: { state, district, block, village },
      hierarchy: STATE_DISTRICT_BLOCK_DATA,
      signatories,
      projects: filtered,
      metrics: {
        total_projects: filtered.length,
        completed_projects: completedCount,
        in_progress_projects: inProgressCount,
        average_progress_percent: avgProgress,
        total_sanctioned_amount: totalSanctioned,
        total_disbursed_amount: totalDisbursed,
        total_utilized_amount: totalUtilized,
        unutilized_balance: totalDisbursed - totalUtilized,
      },
      grievances: inMemoryGrievances.filter(
        (g) => !village || g.village.toLowerCase() === village.toLowerCase()
      ),
    });
  } catch (error: any) {
    console.error("GET /api/village-development error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch village projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create_grievance") {
      const { project_id, project_title, citizen_name, citizen_phone, village, issue_type, description } = body;

      if (!project_id || !citizen_name || !citizen_phone || !description) {
        return NextResponse.json(
          { success: false, error: "Please fill all required grievance fields" },
          { status: 400 }
        );
      }

      const newGrievance: CitizenGrievance = {
        id: `UP-GR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        project_id,
        project_title: project_title || "ग्राम पंचायत निर्माण कार्य",
        citizen_name,
        citizen_phone,
        village: village || "Malihabad Khas",
        issue_type: issue_type || "quality",
        description,
        created_at: new Date().toISOString(),
        status: "submitted",
        officer_remarks: "शिकायत जिला पंचायत राज अधिकारी (DPRO) पोर्टल पर अग्रेसित कर दी गई है।",
      };

      inMemoryGrievances.unshift(newGrievance);

      return NextResponse.json({
        success: true,
        message: "Grievance lodged successfully",
        grievance: newGrievance,
      });
    }

    if (action === "update_project_status") {
      const { project_id, progress_percent, status, current_stage_hi, current_stage_en, next_milestone_hi, next_milestone_en } = body;

      const projectIndex = inMemoryProjects.findIndex((p) => p.id === project_id);
      if (projectIndex === -1) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
      }

      const p = inMemoryProjects[projectIndex];
      if (typeof progress_percent === "number") p.progress_percent = progress_percent;
      if (status) p.status = status;
      if (current_stage_hi) p.current_stage_hi = current_stage_hi;
      if (current_stage_en) p.current_stage_en = current_stage_en;
      if (next_milestone_hi) p.next_milestone_hi = next_milestone_hi;
      if (next_milestone_en) p.next_milestone_en = next_milestone_en;

      return NextResponse.json({
        success: true,
        message: "Project status updated by officer",
        project: p,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/village-development error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
