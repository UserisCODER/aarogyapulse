import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";

// POST /api/checkin  { abhaId, department, complaint }
// Sends the patient to the queue of that department only.
export async function POST(request) {
  const { abhaId, department, complaint, sentBy } = await request.json();

  if (!abhaId || !department) {
    return NextResponse.json(
      { error: "A health ID and a department are required." },
      { status: 400 }
    );
  }

  const entry = await updateDb(async (db) => {
    const patient = db.patients.find((p) => p.abhaId === abhaId);
    if (!patient) throw new Error("No such health ID");

    const item = {
      id: `q-${Date.now()}`,
      abhaId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      department,
      complaint: complaint || "Not stated",
      status: "waiting",
      sentBy: sentBy || "Records counter",
      checkedInAt: new Date().toISOString(),
    };
    db.queue.push(item);
    return item;
  });

  return NextResponse.json({ entry });
}
