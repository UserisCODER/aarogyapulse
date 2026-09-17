// Simulated OCR + NLP pipeline.
//
// A real build would send the uploaded image to Tesseract / a vision model and
// then run a medical NER model over the raw text. For the hackathon demo we do
// two things that are honest and still show the idea:
//
//   1. If the staff pastes the text of the slip, we actually parse it with
//      regex-based extraction (this is real, working NLP-lite).
//   2. If only an image is uploaded, we fall back to a canned "recognised"
//      slip so the timeline demo always works offline.

const CANNED = [
  {
    rawText: `SADAR HOSPITAL, SARAIKELA
Dept: General Medicine        Date: 12/07/2023
Dr. M. Hansda
Dx: Type 2 Diabetes Mellitus
Rx: Metformin 500mg  1-0-1  x 90 days
    Glimepiride 1mg   1-0-0  x 90 days
Adv: Fasting sugar every 3 months.`,
  },
  {
    rawText: `MGM MEDICAL COLLEGE, JAMSHEDPUR
Dept: Cardiology        Date: 05/09/2024
Dr. A. Bose
Dx: Ischaemic heart disease - stable angina
Rx: Metoprolol 25mg  1-0-1  x 30 days
    Isosorbide 10mg   1-0-1  x 30 days
Adv: ECG on review. Avoid heavy lifting.`,
  },
  {
    rawText: `TATA MAIN HOSPITAL
Dept: Orthopaedics        Date: 22/01/2025
Dr. P. Kumar
Dx: Lumbar spondylosis
Rx: Calcium + Vit D3 500mg  1-0-0  x 60 days
Adv: Physiotherapy 10 sessions. Allergy: Diclofenac.`,
  },
];

const DEPARTMENTS = [
  "Cardiology",
  "Orthopaedics",
  "General Medicine",
  "Paediatrics",
];

function toIsoDate(text) {
  // Accepts 12/07/2023 or 12-07-2023 and returns 2023-07-12.
  const m = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function extractDepartment(text) {
  const found = DEPARTMENTS.find((d) =>
    text.toLowerCase().includes(d.toLowerCase())
  );
  if (found) return found;
  const m = text.match(/dept[:\s]+([a-z ]+)/i);
  return m ? m[1].trim() : "General Medicine";
}

function extractMedicines(text) {
  // Matches lines like: Metformin 500mg 1-0-1 x 90 days
  const meds = [];
  const re =
    /([A-Z][A-Za-z+ .]{2,30}?)\s+(\d+\s?(?:mg|ml|g|mcg))\s+(\d-\d-\d)(?:\s*x\s*(\d+\s*days))?/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    meds.push({
      name: m[1].trim(),
      dose: m[2].replace(/\s+/g, ""),
      frequency: m[3],
      duration: m[4] ? m[4].replace(/\s+/g, " ") : "—",
    });
  }
  return meds;
}

function firstMatch(text, patterns, fallback) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return fallback;
}

export function parseSlip(rawText) {
  const date = toIsoDate(rawText);
  const department = extractDepartment(rawText);
  const medicines = extractMedicines(rawText);
  const diagnosis = firstMatch(
    rawText,
    [/(?:dx|diagnosis)[:\s]+(.+)/i],
    "Not recorded on slip"
  );
  const doctor = firstMatch(rawText, [/(Dr\.?\s*[A-Z][A-Za-z. ]{2,30})/], "—");
  const facility = rawText.split("\n")[0]?.trim() || "Unknown facility";
  const notes = firstMatch(rawText, [/(?:adv|advice)[:\s]+(.+)/i], "");
  const allergy = firstMatch(rawText, [/allerg(?:y|ies)[:\s]+([^.\n]+)/i], "");

  // Confidence goes down when the extractor could not find structure.
  let confidence = 0.62;
  if (medicines.length) confidence += 0.2;
  if (diagnosis !== "Not recorded on slip") confidence += 0.1;
  if (doctor !== "—") confidence += 0.05;

  return {
    date,
    department,
    facility,
    doctor,
    diagnosis,
    medicines,
    notes: allergy ? `${notes} Allergy: ${allergy}.`.trim() : notes,
    allergy: allergy || null,
    confidence: Math.min(confidence, 0.98),
    rawText,
  };
}

export function cannedSlip(index = 0) {
  return CANNED[index % CANNED.length].rawText;
}

export const CANNED_COUNT = CANNED.length;

/**
 * Real OCR. Runs Tesseract over an uploaded image buffer and returns raw text.
 *
 * Tesseract downloads its English language data the first time it runs, so the
 * machine needs internet on the first scan (after that it is cached in
 * node_modules/.cache). If anything fails we fall back to a sample slip and
 * flag it, so a demo never dead-ends on a flaky network.
 */
export async function imageToText(buffer) {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(buffer);
    await worker.terminate();

    const text = (data.text || "").trim();
    if (text.length < 15) {
      return { text: cannedSlip(0), engine: "fallback", reason: "too-little-text" };
    }
    return { text, engine: "tesseract" };
  } catch (err) {
    return {
      text: cannedSlip(0),
      engine: "fallback",
      reason: err?.message || "ocr-unavailable",
    };
  }
}
