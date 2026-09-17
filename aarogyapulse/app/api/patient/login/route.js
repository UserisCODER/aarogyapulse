import { NextResponse } from "next/server";
import { readDb, publicPatient } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";

// POST /api/patient/login  { email, password }
export async function POST(request) {
  const { email, password } = await request.json();
  const db = await readDb();

  const patient = db.patients.find(
    (p) => p.email && p.email.toLowerCase() === String(email).trim().toLowerCase()
  );

  if (!patient || !verifyPassword(password, patient.passwordHash)) {
    return NextResponse.json(
      { error: "Those details don't match an account." },
      { status: 401 }
    );
  }

  return NextResponse.json({ patient: publicPatient(patient) });
}
