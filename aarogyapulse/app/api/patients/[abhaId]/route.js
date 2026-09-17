import { NextResponse } from "next/server";
import { readDb, updateDb, logAudit } from "@/lib/db";

/**
 * GET /api/patients/14-9090-1212-3434
 *
 * Add ?doctorId=u-doc-cardio and the route refuses unless that doctor holds a
 * live, unexpired consent. This is the rule the pitch deck calls consent-based
 * access, enforced on the server rather than hidden in the UI.
 */
export async function GET(request, { params }) {
  const db = await readDb();
  const abhaId = decodeURIComponent(params.abhaId);
  const doctorId = request.nextUrl.searchParams.get("doctorId");
  const actor = request.nextUrl.searchParams.get("actor") || "Records counter";

  const patient = db.patients.find((p) => p.abhaId === abhaId);
  if (!patient) {
    return NextResponse.json({ error: "No health ID found." }, { status: 404 });
  }

  if (doctorId) {
    const consent = db.consents.find(
      (c) =>
        c.abhaId === abhaId &&
        c.doctorId === doctorId &&
        c.status === "granted" &&
        c.expiresAt &&
        new Date(c.expiresAt) > new Date()
    );
    if (!consent) {
      return NextResponse.json(
        { error: "The patient has not granted access.", needsConsent: true },
        { status: 403 }
      );
    }
  }

  const records = db.records
    .filter((r) => r.abhaId === abhaId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const documents = db.documents.filter((d) => d.abhaId === abhaId);

  await updateDb(async (fresh) => {
    logAudit(fresh, { actor, action: "record-viewed", abhaId, detail: "" });
  });

  return NextResponse.json({ patient, records, documents });
}
