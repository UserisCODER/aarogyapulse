import { NextResponse } from "next/server";
import { parseSlip, cannedSlip } from "@/lib/ocr";

// POST /api/ocr  { rawText?, sampleIndex? } -> structured record draft
export async function POST(request) {
  const { rawText, sampleIndex } = await request.json();
  const text =
    rawText && rawText.trim().length > 10
      ? rawText
      : cannedSlip(Number(sampleIndex) || 0);

  const parsed = parseSlip(text);
  return NextResponse.json({ draft: parsed });
}
