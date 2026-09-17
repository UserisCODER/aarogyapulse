import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readDb, updateDb, logAudit, UPLOAD_DIR } from "@/lib/db";

// GET /api/documents?abhaId=...
export async function GET(request) {
  const abhaId = request.nextUrl.searchParams.get("abhaId");
  const db = await readDb();
  const documents = db.documents
    .filter((d) => (abhaId ? d.abhaId === abhaId : true))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return NextResponse.json({ documents });
}

// POST /api/documents  (multipart form: file, abhaId, label, uploadedBy)
export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");
  const abhaId = form.get("abhaId");
  const label = form.get("label") || "Document";
  const uploadedBy = form.get("uploadedBy") || "Patient";

  if (!file || typeof file === "string" || !abhaId) {
    return NextResponse.json(
      { error: "Choose a file and a health ID." },
      { status: 400 }
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Keep files under 8 MB." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = `doc-${Date.now()}`;
  const ext = path.extname(file.name || "") || ".bin";
  const stored = `${id}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, stored), bytes);

  const doc = await updateDb(async (db) => {
    const d = {
      id,
      abhaId,
      label,
      fileName: file.name,
      storedAs: stored,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
    db.documents.push(d);
    logAudit(db, {
      actor: uploadedBy,
      action: "document-uploaded",
      abhaId,
      detail: file.name,
    });
    return d;
  });

  return NextResponse.json({ document: doc });
}
