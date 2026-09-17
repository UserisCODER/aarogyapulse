import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";

function newAbhaId() {
  const block = () => String(Math.floor(1000 + Math.random() * 9000));
  return `14-${block()}-${block()}-${block()}`;
}

// POST /api/abha/create  -> creates a health ID at the Aadhaar centre
export async function POST(request) {
  const body = await request.json();
  const { name, age, gender, phone, village, aadhaarLast4, centre } = body;

  if (!name || !aadhaarLast4 || String(aadhaarLast4).length !== 4) {
    return NextResponse.json(
      { error: "Name and the last 4 digits of Aadhaar are required." },
      { status: 400 }
    );
  }

  const result = await updateDb(async (db) => {
    const existing = db.patients.find((p) => p.aadhaarLast4 === aadhaarLast4);
    if (existing) return { patient: existing, alreadyLinked: true };

    const patient = {
      abhaId: newAbhaId(),
      aadhaarLast4: String(aadhaarLast4),
      name,
      age: Number(age) || null,
      gender: gender || "—",
      phone: phone || "—",
      village: village || "—",
      createdAt: new Date().toISOString(),
      createdBy: centre || "Aadhaar Seva Kendra",
    };
    db.patients.push(patient);
    return { patient, alreadyLinked: false };
  });

  return NextResponse.json(result);
}
