import { NextResponse } from "next/server";
import { readDb, updateDb, logAudit } from "@/lib/db";

const WINDOW_MINUTES = 60;

function isLive(c) {
  return (
    c.status === "granted" &&
    c.expiresAt &&
    new Date(c.expiresAt) > new Date()
  );
}

// GET /api/consent?abhaId=...   -> what the patient sees
// GET /api/consent?doctorId=... -> what the doctor sees
export async function GET(request) {
  const abhaId = request.nextUrl.searchParams.get("abhaId");
  const doctorId = request.nextUrl.searchParams.get("doctorId");
  const db = await readDb();

  let consents = db.consents;
  if (abhaId) consents = consents.filter((c) => c.abhaId === abhaId);
  if (doctorId) consents = consents.filter((c) => c.doctorId === doctorId);

  consents = consents
    .map((c) => ({ ...c, live: isLive(c) }))
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  return NextResponse.json({ consents });
}

// POST /api/consent  -> a doctor asks to see a patient's history
export async function POST(request) {
  const { abhaId, doctorId, doctorName, department, scope, reason } =
    await request.json();

  if (!abhaId || !doctorId) {
    return NextResponse.json(
      { error: "A health ID and a doctor are required." },
      { status: 400 }
    );
  }

  const consent = await updateDb(async (db) => {
    const open = db.consents.find(
      (c) => c.abhaId === abhaId && c.doctorId === doctorId && isLive(c)
    );
    if (open) return open;

    const item = {
      id: `c-${Date.now()}`,
      abhaId,
      doctorId,
      doctorName,
      department,
      scope: scope || department || "Full history",
      reason: reason || "Consultation",
      status: "pending",
      requestedAt: new Date().toISOString(),
      decidedAt: null,
      expiresAt: null,
    };
    db.consents.push(item);
    logAudit(db, {
      actor: doctorName,
      action: "consent-requested",
      abhaId,
      detail: item.scope,
    });
    return item;
  });

  return NextResponse.json({ consent: { ...consent, live: isLive(consent) } });
}

// PATCH /api/consent  { id, decision: "granted" | "denied" | "revoked" }
export async function PATCH(request) {
  const { id, decision } = await request.json();

  const consent = await updateDb(async (db) => {
    const c = db.consents.find((x) => x.id === id);
    if (!c) throw new Error("Consent request not found");

    c.status = decision;
    c.decidedAt = new Date().toISOString();
    c.expiresAt =
      decision === "granted"
        ? new Date(Date.now() + WINDOW_MINUTES * 60 * 1000).toISOString()
        : null;

    logAudit(db, {
      actor: "Patient",
      action: `consent-${decision}`,
      abhaId: c.abhaId,
      detail: `${c.doctorName} (${c.department})`,
    });
    return c;
  });

  return NextResponse.json({ consent: { ...consent, live: isLive(consent) } });
}
