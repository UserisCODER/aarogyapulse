import { NextResponse } from "next/server";
import { updateDb, publicPatient } from "@/lib/db";

/**
 * POST /api/patient/google  { credential }
 *
 * `credential` is the JWT that Google Identity Services hands to the browser.
 * We verify it with Google's tokeninfo endpoint rather than trusting it, then
 * either sign the person in or attach Google to their health ID.
 */
export async function POST(request) {
  const { credential, abhaId } = await request.json();
  if (!credential) {
    return NextResponse.json({ error: "No Google credential received." }, { status: 400 });
  }

  let profile;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    profile = await res.json();
    if (!res.ok || !profile.sub) throw new Error("bad token");
  } catch {
    return NextResponse.json(
      { error: "Google could not verify that sign-in." },
      { status: 401 }
    );
  }

  if (
    process.env.GOOGLE_CLIENT_ID &&
    profile.aud !== process.env.GOOGLE_CLIENT_ID
  ) {
    return NextResponse.json({ error: "This token was issued for another app." }, { status: 401 });
  }

  const result = await updateDb(async (db) => {
    let patient = db.patients.find((p) => p.googleSub === profile.sub);

    if (!patient && profile.email) {
      patient = db.patients.find(
        (p) => p.email && p.email.toLowerCase() === profile.email.toLowerCase()
      );
    }

    // First time through, the person tells us which health ID is theirs.
    if (!patient && abhaId) {
      patient = db.patients.find((p) => p.abhaId === abhaId.trim());
    }

    if (!patient) {
      return {
        error:
          "We could not match your Google account to a health ID. Enter your health ID once to link it.",
        needsAbhaId: true,
      };
    }

    patient.googleSub = profile.sub;
    if (!patient.email) patient.email = profile.email || null;
    return { patient: publicPatient(patient) };
  });

  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
