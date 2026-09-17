import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { readDb, UPLOAD_DIR } from "@/lib/db";

// GET /api/documents/doc-123 -> streams the stored file back to the browser
export async function GET(_request, { params }) {
  const db = await readDb();
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const bytes = await fs.readFile(path.join(UPLOAD_DIR, doc.storedAs));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${doc.fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
}
