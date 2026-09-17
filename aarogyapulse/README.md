# AarogyaPulse

Universal portable health records for India — built on the Aadhaar and ABHA rails,
with enrolment moved to the counter the citizen was already standing at.

Team Er Hustlers · HackWave 3.0

---

## Run it locally

You need Node.js 18.17 or newer (`node -v` to check).

```bash
cd aarogyapulse
npm install
npm run dev
```

Open http://localhost:3000

The database is a plain JSON file. It is created automatically at `data/db.json`
on the first API call, with two sample patients and three past records.
Delete that file any time to start clean.

## Demo accounts

Password for all of them: `demo123`

| Staff ID | Role | Department |
|---|---|---|
| `ASK1001` | Aadhaar centre staff | — |
| `REC2001` | Records counter staff | — |
| `DOC3001` | Doctor | Cardiology |
| `DOC3002` | Doctor | Orthopaedics |
| `DOC3003` | Doctor | General Medicine |

## The demo path (use this on stage)

Open two browser windows side by side — one records counter, one doctor.

1. **Aadhaar centre** (`ASK1001`) — create a health ID for a new name.
   Four verification steps run, then the ID appears with an animated tick.
2. **Records counter** (`REC2001`) — look up `8821` (Sunita Devi) or the ID you
   just made. Open **Scan a paper slip**, press **Read the slip**, and the
   extracted diagnosis, medicines and date appear. Save it to the timeline.
3. **Records counter → Send to a doctor** — pick Cardiology, add a complaint, send.
4. **Doctor's cabin** (`DOC3001`, Cardiology) — the patient appears in the waiting
   list within a few seconds, with a summary and full timeline already open.
   Sign in as `DOC3002` (Orthopaedics) instead and the same patient is *not* there.
   That is the routing rule, demonstrated live.
5. Write a prescription in the cabin and save. Go back to the records counter,
   look the patient up again — the new entry is on their timeline.

## How the folders map to the pitch

```
app/
  page.js                    Landing page
  login/page.js              Multi-role sign-in
  aadhaar-center/page.js     Touchpoint 1
  records-counter/page.js    Touchpoint 2 (lookup, OCR, check-in)
  doctor/page.js             Touchpoint 3 (department queue, Rx)
  api/
    auth/login               Checks staff ID + password + role
    abha/create              Issues a health ID
    patients/search          Lookup by Aadhaar last 4 / ID / name
    patients/[abhaId]        Patient + full record timeline
    ocr                      Slip text -> structured record
    records                  Saves a digitised slip
    checkin                  Routes a patient to one department
    queue                    Department-filtered waiting list
    prescriptions            Doctor's Rx -> back onto the health ID
components/
  AppShell.js                Header, role guard, sign out
  Timeline.js                Chronological record list
  PatientHeader.js           Name, ID, allergies, conditions
  SuccessSeal.js             Animated confirmation tick
lib/
  db.js                      JSON file store + seed data
  auth.js                    Demo accounts and departments
  ocr.js                     The extraction pipeline
  session.js                 localStorage session helpers
data/db.json                 Created on first run
```

## What is real and what is simulated

Be straight about this if judges ask — it reads as confidence, not weakness.

**Real:** the role-based routing, the department filter on the queue, the record
timeline, the write-back of a prescription onto the health ID, and the text
extraction in `lib/ocr.js` (paste any slip text and it genuinely parses the date,
department, diagnosis and dosage lines with regex).

**Simulated:** Aadhaar biometric capture, the ABHA gateway call, and image-to-text.
Uploading a photo runs the pipeline over a sample slip instead of calling a vision
model. Swapping in Tesseract or a vision API means changing one function.

## Deploying to Vercel

The JSON file store does not survive on Vercel's serverless filesystem — writes
are lost between requests. For the live link, either:

- demo from `npm run dev` on your laptop and screen-share, or
- move `lib/db.js` onto a hosted Postgres (Neon or Supabase, both free) before
  deploying. Only that one file needs to change; every API route already goes
  through `readDb` / `updateDb`.
