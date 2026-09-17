import { NextResponse } from "next/server";
import { updateDb, logAudit } from "@/lib/db";

// POST /api/prescriptions -> doctor writes a new Rx; it lands on the health ID
export async function POST(request) {
  const {
    abhaId, department, doctor, facility, diagnosis, medicines, notes, vitals, queueId,
  } = await request.json();

  if (!abhaId || !diagnosis) {
    return NextResponse.json(
      { error: "Add a diagnosis before saving the prescription." },
      { status: 400 }
    );
  }

  const record = await updateDb(async (db) => {
    const rec = {
      id: `rec-${Date.now()}`,
      abhaId,
      date: new Date().toISOString().slice(0, 10),
      department,
      facility,
      doctor,
      diagnosis,
      medicines: (medicines || []).filter((m) => m.name),
      notes: notes || "",
      vitals: vitals && vitals.bp ? vitals : null,
      source: "doctor-entry",
      savedAt: new Date().toISOString(),
    };
    db.records.push(rec);

    logAudit(db, {
      actor: doctor || "Doctor",
      action: "prescription-written",
      abhaId,
      detail: diagnosis,
    });

    if (queueId) {
      const item = db.queue.find((q) => q.id === queueId);
      if (item) item.status = "done";
    }
    return rec;
  });

  return NextResponse.json({ record });
}
