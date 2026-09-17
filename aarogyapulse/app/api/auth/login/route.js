import { NextResponse } from "next/server";
import { findUser } from "@/lib/auth";

export async function POST(request) {
  const { staffId, password, role } = await request.json();

  if (!staffId || !password || !role) {
    return NextResponse.json(
      { error: "Enter your staff ID, password and role." },
      { status: 400 }
    );
  }

  const user = findUser(staffId, password, role);
  if (!user) {
    return NextResponse.json(
      { error: "Those details don't match any account for this role." },
      { status: 401 }
    );
  }

  const { password: _pw, ...safe } = user;
  return NextResponse.json({ user: safe });
}
