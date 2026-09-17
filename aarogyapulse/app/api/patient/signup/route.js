import { NextResponse } from "next/server";
import { updateDb, publicPatient } from "@/lib/db";
import { hashPassword } from "@/lib/hash";

// POST /api/patient/signup
// A citizen claims the health ID that was created for them at the Aadhaar centre.
export async function POST(request) {
  const { abhaId, email, password, name } = await request.json();

  if (!abhaId || !email || !password) {
    return NextResponse.json(
      { error: "Health ID, email and password are all required." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Use a password of at least 6 characters." },
      { status: 400 }
    );
  }

  const result = await updateDb(async (db) => {
    const patient = db.patients.find((p) => p.abhaId === abhaId.trim());
    if (!patient) return { error: "No health ID matches that number." };
    if (patient.passwordHash || patient.googleSub) {
      return { error: "This health ID already has an account. Sign in instead." };
    }
    if (db.patients.some((p) => p.email === email && p.abhaId !== abhaId)) {
      return { error: "That email is already in use." };
    }

    patient.email = email.trim().toLowerCase();
    patient.passwordHash = hashPassword(password);
    if (name) patient.name = name;
    return { patient: publicPatient(patient) };
  });

  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
