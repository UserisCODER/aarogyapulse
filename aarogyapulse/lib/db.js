import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const SEED = {
  patients: [
    {
      abhaId: "14-2233-4455-6677",
      aadhaarLast4: "8821",
      name: "Sunita Devi",
      age: 47,
      gender: "F",
      phone: "98xxxxxx21",
      village: "Chandil, Jharkhand",
      email: null,
      passwordHash: null,
      googleSub: null,
      createdAt: "2026-02-11T09:12:00.000Z",
      createdBy: "Aadhaar Seva Kendra - Jamshedpur",
    },
    {
      abhaId: "14-9090-1212-3434",
      aadhaarLast4: "5510",
      name: "Ramesh Mahto",
      age: 62,
      gender: "M",
      phone: "97xxxxxx04",
      village: "Adityapur, Jharkhand",
      email: "ramesh@example.com",
      // Demo patient login: ramesh@example.com / demo123
      passwordHash:
        "scrypt$49b99b91ca501c70$d42bb99c43c4e621354067e3af931acacb7b6d8a6bc049c61d889f32e49851e9",
      googleSub: null,
      createdAt: "2026-01-04T11:40:00.000Z",
      createdBy: "Aadhaar Seva Kendra - Adityapur",
    },
  ],
  records: [
    {
      id: "rec-1001",
      abhaId: "14-9090-1212-3434",
      date: "2024-08-19",
      department: "Cardiology",
      facility: "MGM Medical College, Jamshedpur",
      doctor: "Dr. A. Bose",
      diagnosis: "Hypertension, stage 2",
      medicines: [
        { name: "Telmisartan", dose: "40mg", frequency: "1-0-0", duration: "30 days" },
        { name: "Aspirin", dose: "75mg", frequency: "0-1-0", duration: "30 days" }
      ],
      notes: "BP 162/98. Reduce salt. Review in one month.",
      vitals: { bp: "162/98", pulse: "88", weight: "71" },
      source: "paper-ocr",
    },
    {
      id: "rec-1002",
      abhaId: "14-9090-1212-3434",
      date: "2025-03-02",
      department: "Cardiology",
      facility: "Tata Main Hospital",
      doctor: "Dr. S. Nair",
      diagnosis: "Hypertension - follow-up, mild dyslipidemia",
      medicines: [
        { name: "Telmisartan", dose: "40mg", frequency: "1-0-0", duration: "90 days" },
        { name: "Atorvastatin", dose: "10mg", frequency: "0-0-1", duration: "90 days" }
      ],
      notes: "BP 138/86. LDL 148. Continue therapy, walk 30 min daily.",
      vitals: { bp: "138/86", pulse: "76", weight: "69" },
      source: "paper-ocr",
    },
    {
      id: "rec-1003",
      abhaId: "14-2233-4455-6677",
      date: "2025-11-14",
      department: "Orthopaedics",
      facility: "Sadar Hospital, Saraikela",
      doctor: "Dr. P. Kumar",
      diagnosis: "Osteoarthritis, right knee",
      medicines: [
        { name: "Calcium + Vit D3", dose: "500mg", frequency: "1-0-0", duration: "60 days" }
      ],
      notes: "Allergy noted: Diclofenac - avoid NSAIDs of this class.",
      allergy: "Diclofenac",
      vitals: { bp: "124/80", pulse: "72", weight: "58" },
      source: "paper-ocr",
    },
  ],
  queue: [],
  consents: [],
  documents: [],
  tickets: [],
  audit: [],
};

async function ensure() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(SEED, null, 2));
  }
}

export async function readDb() {
  await ensure();
  const db = JSON.parse(await fs.readFile(DB_PATH, "utf8"));
  for (const key of ["patients","records","queue","consents","documents","tickets","audit"]) {
    if (!db[key]) db[key] = [];
  }
  return db;
}

export async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}

export async function updateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

/** Every staff action that touches a patient record lands in the audit log. */
export function logAudit(db, { actor, action, abhaId, detail }) {
  db.audit.push({
    id: `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actor,
    action,
    abhaId: abhaId || null,
    detail: detail || "",
    at: new Date().toISOString(),
  });
}

/** Strips secrets before anything goes back to the browser. */
export function publicPatient(p) {
  if (!p) return null;
  const { passwordHash, googleSub, ...safe } = p;
  return { ...safe, hasAccount: Boolean(passwordHash || googleSub) };
}
