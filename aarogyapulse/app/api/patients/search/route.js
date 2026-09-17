import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

// GET /api/patients/search?q=8821  -> match on ABHA ID, Aadhaar last 4, or name
export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const db = await readDb();

  if (!q) return NextResponse.json({ patients: [] });

  const patients = db.patients.filter(
    (p) =>
      p.abhaId.toLowerCase().includes(q) ||
      p.aadhaarLast4.includes(q) ||
      p.name.toLowerCase().includes(q)
  );

  return NextResponse.json({ patients });
}
