import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";

// POST /api/records -> saves a digitised slip onto the patient's timeline
export async function POST(request) {
  const body = await request.json();
  const { abhaId, draft, savedBy } = body;

  if (!abhaId || !draft) {
    return NextResponse.json(
      { error: "Pick a patient and run the scan first." },
      { status: 400 }
    );
  }

  const record = await updateDb(async (db) => {
    const patient = db.patients.find((p) => p.abhaId === abhaId);
    if (!patient) throw new Error("No such health ID");

    const rec = {
      id: `rec-${Date.now()}`,
      abhaId,
      date: draft.date,
      department: draft.department,
      facility: draft.facility,
      doctor: draft.doctor,
      diagnosis: draft.diagnosis,
      medicines: draft.medicines || [],
      notes: draft.notes || "",
      allergy: draft.allergy || null,
      source: "paper-ocr",
      savedBy: savedBy || "Records counter",
      savedAt: new Date().toISOString(),
    };
    db.records.push(rec);
    return rec;
  });

  return NextResponse.json({ record });
}
