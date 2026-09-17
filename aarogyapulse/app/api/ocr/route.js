import { NextResponse } from "next/server";
import { parseSlip, cannedSlip, imageToText } from "@/lib/ocr";

/**
 * POST /api/ocr
 *
 * Two ways in:
 *   - multipart form with `file`  -> real Tesseract OCR on the image
 *   - JSON { rawText } or { sampleIndex } -> straight to the NLP step
 *
 * Nothing here is saved. The draft goes back to the staff member, who checks
 * it against the paper before /api/records writes it down.
 */
export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image received." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Keep images under 8 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, engine, reason } = await imageToText(buffer);
    const draft = parseSlip(text);

    return NextResponse.json({
      draft,
      engine,
      reason: reason || null,
      fileName: file.name,
    });
  }

  const { rawText, sampleIndex } = await request.json();
  const text =
    rawText && rawText.trim().length > 10
      ? rawText
      : cannedSlip(Number(sampleIndex) || 0);

  return NextResponse.json({ draft: parseSlip(text), engine: "typed" });
}
