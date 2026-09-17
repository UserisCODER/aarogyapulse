import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";

// GET /api/support?abhaId=...  (omit abhaId for the admin view)
export async function GET(request) {
  const abhaId = request.nextUrl.searchParams.get("abhaId");
  const db = await readDb();
  const tickets = db.tickets
    .filter((t) => (abhaId ? t.abhaId === abhaId : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ tickets });
}

// POST /api/support  { abhaId, name, topic, message }
export async function POST(request) {
  const { abhaId, name, topic, message } = await request.json();
  if (!message || message.trim().length < 5) {
    return NextResponse.json(
      { error: "Tell us a little more about the problem." },
      { status: 400 }
    );
  }

  const ticket = await updateDb(async (db) => {
    const t = {
      id: `t-${Date.now()}`,
      abhaId: abhaId || null,
      name: name || "Anonymous",
      topic: topic || "General",
      message: message.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    db.tickets.push(t);
    return t;
  });

  return NextResponse.json({ ticket });
}

// PATCH /api/support  { id, status }
export async function PATCH(request) {
  const { id, status } = await request.json();
  const ticket = await updateDb(async (db) => {
    const t = db.tickets.find((x) => x.id === id);
    if (!t) throw new Error("Ticket not found");
    t.status = status || "closed";
    return t;
  });
  return NextResponse.json({ ticket });
}
