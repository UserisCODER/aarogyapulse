import { NextResponse } from "next/server";
import { readDb, publicPatient } from "@/lib/db";

// GET /api/patient/me?abhaId=...  -> everything the patient dashboard shows
export async function GET(request) {
  const abhaId = request.nextUrl.searchParams.get("abhaId");
  const db = await readDb();

  const patient = db.patients.find((p) => p.abhaId === abhaId);
  if (!patient) {
    return NextResponse.json({ error: "No health ID found." }, { status: 404 });
  }

  const records = db.records
    .filter((r) => r.abhaId === abhaId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const documents = db.documents
    .filter((d) => d.abhaId === abhaId)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const consents = db.consents
    .filter((c) => c.abhaId === abhaId)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const tickets = db.tickets.filter((t) => t.abhaId === abhaId);

  const accessLog = db.audit
    .filter((a) => a.abhaId === abhaId)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 20);

  // Numbers for the stats strip at the top of the dashboard.
  const medicines = records.flatMap((r) => r.medicines || []);
  const stats = {
    visits: records.length,
    documents: documents.length,
    activeMedicines: (records[0]?.medicines || []).length,
    departments: [...new Set(records.map((r) => r.department))].length,
    lastVisit: records[0]?.date || null,
    uniqueMedicines: [...new Set(medicines.map((m) => m.name))].length,
  };

  // Vitals over time, oldest first, for the chart.
  const vitalsSeries = records
    .filter((r) => r.vitals?.bp)
    .map((r) => {
      const [systolic, diastolic] = String(r.vitals.bp).split("/").map(Number);
      return {
        date: r.date,
        systolic,
        diastolic,
        pulse: Number(r.vitals.pulse) || null,
        weight: Number(r.vitals.weight) || null,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return NextResponse.json({
    patient: publicPatient(patient),
    records,
    documents,
    consents,
    tickets,
    accessLog,
    stats,
    vitalsSeries,
  });
}
