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

Staff sign-in is at `/login`:

| Staff ID | Role | Department |
|---|---|---|
| `ASK1001` | Aadhaar centre staff | — |
| `REC2001` | Records counter staff | — |
| `DOC3001` | Doctor | Cardiology |
| `DOC3002` | Doctor | Orthopaedics |
| `DOC3003` | Doctor | General Medicine |
| `ADM9001` | Administrator | — |

Patient sign-in is at `/patient/login`: `ramesh@example.com` / `demo123`.
A new patient claims their health ID with the number the Aadhaar centre issued
(try `14-2233-4455-6677`).

## Google sign-in

Optional. Without it everything still works — the button just hides itself.

1. Go to https://console.cloud.google.com/apis/credentials
2. Create credentials → OAuth client ID → Web application
3. Authorised JavaScript origins: `http://localhost:3000`
4. Copy `.env.example` to `.env.local` and paste the client ID into both
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`
5. Restart `npm run dev`

The browser gets a Google token, the server verifies it against Google's
tokeninfo endpoint, and it is linked to a health ID. The first time, the patient
types their health ID once so we know which record is theirs.

## OCR

Real, not faked. Upload a photo of a prescription at the records counter and
Tesseract reads it server-side, then `parseSlip()` in `lib/ocr.js` pulls out the
date, department, diagnosis and each medicine with its dose and frequency.

The first scan on a new machine downloads the English language data (a few MB),
so it needs internet once. If OCR fails for any reason the app falls back to a
sample slip and labels it clearly, so a demo never dead-ends. Typing the slip
text always works offline.

Nothing the scanner produces is saved until a human presses Save.

## The demo path (use this on stage)

Open three browser windows — records counter, doctor, patient. Use one incognito
window for the patient so the sessions don't collide.

1. **Aadhaar centre** (`ASK1001`) — create a health ID for a new name.
   Four verification steps run, then the ID appears with an animated tick.
2. **Records counter** (`REC2001`) — look up `5510` (Ramesh Mahto). Open
   **Scan a paper slip**, upload a photo of any prescription, press **Read the
   slip**. The extracted diagnosis, medicines and date appear with a confidence
   score, and the raw OCR text is there to expand. Save it to the timeline.
3. **Records counter → Send to a doctor** — pick Cardiology, add a complaint, send.
4. **Doctor's cabin** (`DOC3001`, Cardiology) — the patient appears in the waiting
   list within a few seconds. Click them: the doctor *asks for access* and the
   screen waits.
   Sign in as `DOC3002` (Orthopaedics) instead and the same patient is not in the
   list at all. That is the routing rule, demonstrated live.
5. **Patient** (`ramesh@example.com`) — a banner says a doctor is asking. Tap
   **Allow for 1 hour**. The doctor's screen opens the history by itself.
6. Write a prescription in the cabin and save. The patient's dashboard shows the
   new visit, the updated BP chart, and the access in their activity log.
7. **Patient → Who can see my record** — press **Revoke now**. The doctor loses
   access immediately; the server rejects the read, not just the UI.
8. **Admin** (`ADM9001`) — health IDs issued, records digitised, the full access
   log, consent history and open support tickets.

## How the folders map to the pitch

See `HANDOFF.md` for the full file map and data shapes. Short version:

- `app/aadhaar-center`, `app/records-counter`, `app/doctor` — the three touchpoints
- `app/patient` — the citizen's own dashboard, documents and consent controls
- `app/admin` — system stats, access log, consent history, support queue
- `app/api/*` — every server route
- `lib/db.js` — the whole data layer, so swapping in Postgres means editing one file

## What is real and what is simulated

Be straight about this if judges ask — it reads as confidence, not weakness.

**Real:** role-based routing, the department filter on the queue, consent
enforced on the server (revoke a consent and the doctor's next read is refused),
the audit log, document upload and retrieval, password hashing with scrypt,
Google token verification, the offline prescription queue, and the OCR — Tesseract
genuinely reads the uploaded image and `parseSlip()` genuinely extracts the fields.

**Simulated:** Aadhaar biometric capture and the ABHA gateway call. Both are
mocked with clearly labelled demo data.

**Not built yet:** Postgres (the store is a JSON file), real staff session
security, and handwriting-grade OCR. All three are listed in `HANDOFF.md` with
the plan for each.

## Deploying to Vercel

The JSON file store does not survive on Vercel's serverless filesystem — writes
are lost between requests. For the live link, either:

- demo from `npm run dev` on your laptop and screen-share, or
- move `lib/db.js` onto a hosted Postgres (Neon or Supabase, both free) before
  deploying. Only that one file needs to change; every API route already goes
  through `readDb` / `updateDb`.
