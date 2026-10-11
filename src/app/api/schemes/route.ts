import { NextRequest, NextResponse } from "next/server";

export interface SchemeApplicationRecord {
  id: string;
  scheme_id: string;
  scheme_name: string;
  applicant_name: string;
  phone: string;
  village: string;
  district: string;
  aadhaar: string;
  land_area: string;
  khata_number: string;
  submitted_at: string;
  status: string;
  verified_by?: string;
  verified_at?: string;
  officer_notes?: string;
}

// In-memory persistent state across requests for instantaneous fast syncing
let schemeApplicationsStore: SchemeApplicationRecord[] = [
  {
    id: "UP-GS-2026-894120",
    scheme_id: "pm-kisan",
    scheme_name: "PM Kisan Samman Nidhi (PM-KISAN)",
    applicant_name: "रामेश्वर सिंह (Rameshwar Singh)",
    phone: "9876543210",
    village: "मलिहाबाद (Malihabad)",
    district: "Lucknow",
    aadhaar: "XXXX-XXXX-4819",
    land_area: "2.5 एकड़ (2.5 Acres)",
    khata_number: "142/08",
    submitted_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "Under Verification (Gram Panchayat)",
  },
  {
    id: "UP-GS-2026-341902",
    scheme_id: "up-kisan-credit-card",
    scheme_name: "Kisan Credit Card (KCC) Subsidized Farm Loan",
    applicant_name: "सुरेश यादव (Suresh Yadav)",
    phone: "9812345678",
    village: "बख्शी का तालाब (Bakshi Ka Talab)",
    district: "Lucknow",
    aadhaar: "XXXX-XXXX-9102",
    land_area: "3.2 एकड़ (3.2 Acres)",
    khata_number: "88/14",
    submitted_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "Under Verification (Gram Panchayat)",
  },
  {
    id: "UP-GS-2026-552190",
    scheme_id: "up-kusum-solar-pump",
    scheme_name: "PM-KUSUM Solar Irrigation Pump Scheme",
    applicant_name: "जगदीश प्रसाद (Jagdish Prasad)",
    phone: "9845123980",
    village: "मोहनलालगंज (Mohanlalganj)",
    district: "Lucknow",
    aadhaar: "XXXX-XXXX-6631",
    land_area: "4.0 एकड़ (4.0 Acres)",
    khata_number: "201/05",
    submitted_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: "Verified & Forwarded to State Solar Nodal Desk",
    verified_by: "कृषि रक्षा अधिकारी (HQ Lucknow)",
    verified_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// GET: Fetch all scheme applications for Officer desk or Farmer history
export async function GET() {
  return NextResponse.json({
    applications: schemeApplicationsStore,
    total: schemeApplicationsStore.length,
    pending: schemeApplicationsStore.filter((a) => a.status.includes("Under Verification")).length,
  });
}

// POST: Farmer submits a new scheme application (PM-KISAN, KCC, PMFBY, Solar Pump)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const generatedId = `UP-GS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord: SchemeApplicationRecord = {
      id: body.id || generatedId,
      scheme_id: body.scheme_id || "pm-kisan",
      scheme_name: body.scheme_name || "PM-KISAN",
      applicant_name: body.applicant_name || "Kisan",
      phone: body.phone || "9876543210",
      village: body.village || "Malihabad",
      district: body.district || "Lucknow",
      aadhaar: body.aadhaar ? (body.aadhaar.includes("XXXX") ? body.aadhaar : `XXXX-XXXX-${body.aadhaar.slice(-4)}`) : "XXXX-XXXX-1234",
      land_area: body.land_area || "2.5 Acres",
      khata_number: body.khata_number || "142/08",
      submitted_at: new Date().toISOString(),
      status: "Under Verification (Gram Panchayat)",
      officer_notes: "",
    };

    // Prepend to list so newest application is at the top
    schemeApplicationsStore = [newRecord, ...schemeApplicationsStore];

    return NextResponse.json({
      success: true,
      application: newRecord,
      message: "Application submitted to Gram Panchayat Officer desk successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to submit application" }, { status: 500 });
  }
}

// PATCH: Officer verifies & forwards, or requests correction / rejects
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, officer_name, officer_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const index = schemeApplicationsStore.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const app = schemeApplicationsStore[index];
    const now = new Date().toISOString();

    if (action === "approve_and_forward") {
      app.status = "Verified & Forwarded to Central/State Portal";
      app.verified_by = officer_name || "कृषि रक्षा अधिकारी (HQ Lucknow)";
      app.verified_at = now;
      app.officer_notes = officer_notes || "खतौनी व पात्रता सत्यापन पूर्ण। मुख्य पोर्टल को अग्रसारित।";
    } else if (action === "reject") {
      app.status = "Correction Required (Rejected by Officer)";
      app.verified_by = officer_name || "कृषि रक्षा अधिकारी (HQ Lucknow)";
      app.verified_at = now;
      app.officer_notes = officer_notes || "भूलेख विवरण (खतौनी) में त्रुटि - पुनः संशोधन अपेक्षित।";
    }

    schemeApplicationsStore[index] = app;

    return NextResponse.json({
      success: true,
      application: app,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 500 });
  }
}
