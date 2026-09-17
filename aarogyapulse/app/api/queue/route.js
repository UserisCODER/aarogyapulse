import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";

// GET /api/queue?department=Cardiology
// Department filter is the routing rule: a doctor only ever sees their own dept.
export async function GET(request) {
  const department = request.nextUrl.searchParams.get("department");
  const db = await readDb();

  const queue = db.queue
    .filter((q) => q.status === "waiting")
    .filter((q) => (department ? q.department === department : true))
    .sort((a, b) => new Date(a.checkedInAt) - new Date(b.checkedInAt));

  return NextResponse.json({ queue });
}

// PATCH /api/queue  { id, status }
export async function PATCH(request) {
  const { id, status } = await request.json();
  const updated = await updateDb(async (db) => {
    const item = db.queue.find((q) => q.id === id);
    if (!item) throw new Error("Queue entry not found");
    item.status = status || "done";
    return item;
  });
  return NextResponse.json({ entry: updated });
}
