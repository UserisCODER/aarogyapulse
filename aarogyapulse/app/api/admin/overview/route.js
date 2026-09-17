import { NextResponse } from "next/server";
import { readDb, publicPatient } from "@/lib/db";

// GET /api/admin/overview -> everything the admin panel renders
export async function GET() {
  const db = await readDb();

  const byDepartment = {};
  for (const r of db.records) {
    byDepartment[r.department] = (byDepartment[r.department] || 0) + 1;
  }

  const stats = {
    patients: db.patients.length,
    withAccounts: db.patients.filter((p) => p.passwordHash || p.googleSub).length,
    records: db.records.length,
    digitised: db.records.filter((r) => r.source === "paper-ocr").length,
    documents: db.documents.length,
    waiting: db.queue.filter((q) => q.status === "waiting").length,
    consentsPending: db.consents.filter((c) => c.status === "pending").length,
    openTickets: db.tickets.filter((t) => t.status === "open").length,
  };

  return NextResponse.json({
    stats,
    byDepartment,
    patients: db.patients.map(publicPatient).slice(-25).reverse(),
    audit: [...db.audit].reverse().slice(0, 40),
    tickets: [...db.tickets].reverse().slice(0, 20),
    consents: [...db.consents].reverse().slice(0, 20),
  });
}

// The admin panel must always read live data, never a build-time snapshot.
export const dynamic = "force-dynamic";
