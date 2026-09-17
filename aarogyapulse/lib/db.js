import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Runs once, the first time an API route touches the database.
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
      createdAt: "2026-02-11T09:12:00.000Z",
      createdBy: "Aadhaar Seva Kendra — Jamshedpur",
    },
    {
      abhaId: "14-9090-1212-3434",
      aadhaarLast4: "5510",
      name: "Ramesh Mahto",
      age: 62,
      gender: "M",
      phone: "97xxxxxx04",
      village: "Adityapur, Jharkhand",
      createdAt: "2026-01-04T11:40:00.000Z",
      createdBy: "Aadhaar Seva Kendra — Adityapur",
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
        { name: "Aspirin", dose: "75mg", frequency: "0-1-0", duration: "30 days" },
      ],
      notes: "BP 162/98. Reduce salt. Review in one month.",
      source: "paper-ocr",
    },
    {
      id: "rec-1002",
      abhaId: "14-9090-1212-3434",
      date: "2025-03-02",
      department: "Cardiology",
      facility: "Tata Main Hospital",
      doctor: "Dr. S. Nair",
      diagnosis: "Hypertension — follow-up, mild dyslipidemia",
      medicines: [
        { name: "Telmisartan", dose: "40mg", frequency: "1-0-0", duration: "90 days" },
        { name: "Atorvastatin", dose: "10mg", frequency: "0-0-1", duration: "90 days" },
      ],
      notes: "BP 138/86. LDL 148. Continue therapy, walk 30 min daily.",
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
        { name: "Calcium + Vit D3", dose: "500mg", frequency: "1-0-0", duration: "60 days" },
      ],
      notes: "Allergy noted: Diclofenac — avoid NSAIDs of this class.",
      source: "paper-ocr",
    },
  ],
  // Patients waiting outside a doctor's cabin, per department.
  queue: [],
};

async function ensure() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(SEED, null, 2));
  }
}

export async function readDb() {
  await ensure();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}

// Small helper so routes can read, change and save in one step.
export async function updateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}
