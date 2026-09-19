import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { DEPARTMENTS } from "@/lib/auth";

// Try these in order if one is overloaded or unavailable
const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

function buildPrompt(symptoms) {
  return `You are a careful clinical triage assistant for Indian primary care (OPD).
The user describes symptoms in everyday language (English or Hinglish).

Return ONLY valid JSON with this exact shape (no markdown, no extra text):
{
  "possibleConditions": ["string", "string", "string"],
  "department": "one of: Cardiology | Orthopaedics | General Medicine | Paediatrics",
  "urgency": "routine" | "soon" | "urgent",
  "recommendation": "one short practical sentence for the patient",
  "disclaimer": "This is not a diagnosis. See a doctor for medical advice."
}

Rules:
- List 2–4 possible conditions, most likely first.
- department MUST be exactly one of: ${DEPARTMENTS.join(", ")}.
- Prefer General Medicine when unsure.
- Never invent drug doses or claim certainty.
- Life-threatening symptoms (chest pain + breathlessness, stroke signs, severe bleeding) → urgency "urgent".

Patient symptoms:
${symptoms}`;
}

/** Simple offline triage so the demo never dead-ends */
function localFallback(symptoms) {
  const s = symptoms.toLowerCase();

  if (
    s.includes("chest pain") ||
    s.includes("chest pain") ||
    (s.includes("breath") && s.includes("pain")) ||
    s.includes("heart")
  ) {
    return {
      possibleConditions: [
        "Possible cardiac cause — needs urgent evaluation",
        "Anxiety / non-cardiac chest pain",
        "Acid reflux (less likely if severe)",
      ],
      department: "Cardiology",
      urgency: "urgent",
      recommendation:
        "Seek emergency care now if pain is severe, radiates to arm/jaw, or comes with breathlessness or sweating.",
      disclaimer:
        "Offline triage fallback — not a diagnosis. See a doctor immediately for chest symptoms.",
      source: "local-fallback",
    };
  }

  if (
    s.includes("fracture") ||
    s.includes("sprain") ||
    s.includes("knee") ||
    s.includes("joint") ||
    s.includes("bone") ||
    s.includes("cannot walk") ||
    s.includes("can't walk")
  ) {
    return {
      possibleConditions: [
        "Soft-tissue injury / sprain",
        "Possible fracture (needs X-ray if severe)",
        "Musculoskeletal strain",
      ],
      department: "Orthopaedics",
      urgency: "soon",
      recommendation:
        "Rest, ice, and elevate. See Orthopaedics if swelling, deformity, or inability to bear weight.",
      disclaimer:
        "Offline triage fallback — not a diagnosis. See a doctor for medical advice.",
      source: "local-fallback",
    };
  }

  if (
    s.includes("child") ||
    s.includes("baby") ||
    s.includes("infant") ||
    s.includes("paed") ||
    s.includes("pediatr")
  ) {
    return {
      possibleConditions: [
        "Common childhood viral illness",
        "Fever needing paediatric review",
        "Dehydration risk if poor intake",
      ],
      department: "Paediatrics",
      urgency: "soon",
      recommendation:
        "See a paediatrician, especially if the child is under 5, lethargic, or not feeding well.",
      disclaimer:
        "Offline triage fallback — not a diagnosis. See a doctor for medical advice.",
      source: "local-fallback",
    };
  }

  if (
    s.includes("fever") ||
    s.includes("cough") ||
    s.includes("cold") ||
    s.includes("body ache") ||
    s.includes("headache") ||
    s.includes("vomit") ||
    s.includes("diarr")
  ) {
    return {
      possibleConditions: [
        "Viral fever / flu-like illness",
        "Common cold or upper respiratory infection",
        "Consider malaria / dengue screening if fever persists in endemic areas",
      ],
      department: "General Medicine",
      urgency: "soon",
      recommendation:
        "Hydrate, rest, and monitor temperature. Consult OPD if fever lasts more than 48 hours or worsens.",
      disclaimer:
        "Offline triage fallback — not a diagnosis. See a doctor for medical advice.",
      source: "local-fallback",
    };
  }

  return {
    possibleConditions: [
      "Non-specific symptoms — needs clinical review",
      "General fatigue / mild illness",
      "Seasonal or lifestyle-related causes possible",
    ],
    department: "General Medicine",
    urgency: "routine",
    recommendation:
      "Book an OPD appointment with General Medicine if symptoms continue or worry you.",
    disclaimer:
      "Offline triage fallback — not a diagnosis. See a doctor for medical advice.",
    source: "local-fallback",
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await request.json();
    const symptoms = String(body.symptoms || "").trim();

    if (!symptoms || symptoms.length < 5) {
      return NextResponse.json(
        { error: "Please describe your symptoms in a few words." },
        { status: 400 }
      );
    }

    if (symptoms.length > 2000) {
      return NextResponse.json(
        { error: "Symptom text is too long (max 2000 characters)." },
        { status: 400 }
      );
    }

    // No key → go straight to local fallback (demo still works)
    if (!apiKey) {
      const fallback = localFallback(symptoms);
      return NextResponse.json(fallback);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(symptoms);
    let lastError = null;

    for (const model of MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          });

          const raw = (response.text || "").trim();
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : null;
          }

          if (!parsed || !Array.isArray(parsed.possibleConditions)) {
            throw new Error("Invalid JSON from model");
          }

          if (!DEPARTMENTS.includes(parsed.department)) {
            parsed.department = "General Medicine";
          }

          return NextResponse.json({
            possibleConditions: parsed.possibleConditions.slice(0, 4),
            department: parsed.department,
            urgency: parsed.urgency || "routine",
            recommendation:
              parsed.recommendation ||
              "Please consult a doctor if symptoms persist or worsen.",
            disclaimer:
              parsed.disclaimer ||
              "This is not a diagnosis. See a doctor for medical advice.",
            source: model,
          });
        } catch (err) {
          lastError = err;
          const msg = String(err?.message || err || "");
          const isBusy =
            msg.includes("high demand") ||
            msg.includes("UNAVAILABLE") ||
            msg.includes("503") ||
            msg.includes("429") ||
            msg.includes("RESOURCE_EXHAUSTED");

          console.error(`Gemini ${model} attempt ${attempt}:`, msg);

          if (isBusy && attempt < 2) {
            await sleep(1200 * attempt); // brief backoff
            continue;
          }
          // try next model
          break;
        }
      }
    }

    // All models failed → offline fallback so the demo never dies
    console.error("All Gemini models failed, using local fallback:", lastError);
    const fallback = localFallback(symptoms);
    return NextResponse.json(fallback);
  } catch (err) {
    console.error("symptoms API error:", err);
    // Last resort: still try local fallback from body if we can
    try {
      const body = await request.clone().json().catch(() => ({}));
      const symptoms = String(body.symptoms || "").trim();
      if (symptoms.length >= 5) {
        return NextResponse.json(localFallback(symptoms));
      }
    } catch {
      /* ignore */
    }
    const message =
      err?.message || "Symptom analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}