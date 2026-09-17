import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

// GET /api/patients/14-9090-1212-3434 -> patient + full record timeline
export async function GET(_request, { params }) {
  const db = await readDb();
  const abhaId = decodeURIComponent(params.abhaId);

  const patient = db.patients.find((p) => p.abhaId === abhaId);
  if (!patient) {
    return NextResponse.json({ error: "No health ID found." }, { status: 404 });
  }

  const records = db.records
    .filter((r) => r.abhaId === abhaId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return NextResponse.json({ patient, records });
}
