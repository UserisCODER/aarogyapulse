# HANDOFF.md — context for any AI assistant working on this project

Paste this whole file into a new chat with Gemini, ChatGPT, Cursor, Antigravity or
Claude Code before asking for changes. It is written so a model that has never
seen the project can make correct edits from a cold start.

If the tool can read your repo directly (Cursor, Claude Code, Antigravity), just
say: *"Read HANDOFF.md first, then do X."*

---

## 1. What this project is

**AarogyaPulse** — a universal portable health record system for India, built by
Team Er Hustlers for HackWave 3.0. It was formerly called MediLink; if you see
that name anywhere, it is stale and should be changed.

The idea: India already has Aadhaar and ABHA rails, but a patient's medical
history does not travel with them. Rather than asking citizens to download an
app, health IDs are created *at the Aadhaar centre they were already visiting*,
paper prescriptions are digitised *at the hospital records counter*, and the
history appears *on the doctor's screen before the patient sits down*.

Three staff touchpoints, one patient dashboard, one admin panel.

## 2. Stack, exactly

- Next.js 14, **App Router**, **JavaScript (not TypeScript)**
- Tailwind CSS 3.4 — utility classes plus a few component classes in `app/globals.css`
- Framer Motion 11 for transitions
- Tesseract.js 7 for real OCR, run server-side
- Storage: **a JSON file at `data/db.json`**, read and written by `lib/db.js`.
  There is no Postgres yet. Uploaded files sit in `data/uploads/`.
- Auth: hand-rolled. Staff accounts are hardcoded in `lib/auth.js`. Patient
  passwords are hashed with Node's built-in `scrypt` (`lib/hash.js`). Sessions
  are just a JSON blob in `localStorage` — there are no cookies or JWTs.
- Google sign-in uses Google Identity Services loaded in the browser; the token
  is verified server-side against `https://oauth2.googleapis.com/tokeninfo`.

**Do not** introduce Prisma, NextAuth, TypeScript, a component library, or a
state manager unless explicitly asked. The person maintaining this is a
first-year student and every added dependency is a thing that can break on stage.

## 3. File map

```
app/
  page.js                     landing page
  layout.js                   Inter font + globals
  globals.css                 Tailwind + .card .btn-primary .btn-ghost .input .label .chip
  login/page.js               staff login (aadhaar | records | doctor | admin)
  aadhaar-center/page.js      touchpoint 1 — create/link a health ID
  records-counter/page.js     touchpoint 2 — lookup, OCR scan, check-in to a department
  doctor/page.js              touchpoint 3 — department queue, consent request, prescription
  patient/login/page.js       patient sign in / sign up / Google
  patient/page.js             patient dashboard (overview, visits, documents, access, help)
  admin/page.js               admin panel (stats, health IDs, audit, consents, tickets)
  api/
    auth/login                staff login
    patient/signup            claim a health ID with email + password
    patient/login             patient email + password
    patient/google            verifies a Google credential, links or signs in
    patient/me                everything the patient dashboard renders
    abha/create               issue a health ID
    patients/search           lookup by Aadhaar last 4 / health ID / name
    patients/[abhaId]         patient + records; ?doctorId= enforces consent
    ocr                       multipart image -> Tesseract -> NLP; or JSON rawText
    records                   save a digitised slip
    checkin                   route a patient to one department's queue
    queue                     department-filtered waiting list
    prescriptions             doctor's Rx written back to the health ID
    consent                   request / grant / deny / revoke, 60-minute window
    documents                 upload and list; documents/[id] streams the file
    support                   patient support tickets
    admin/overview            all admin numbers in one response
components/
  AppShell.js                 header + role guard for staff screens
  Timeline.js                 chronological record list
  PatientHeader.js            name, health ID, allergy banner
  SuccessSeal.js              animated tick
  StatCard.js  VitalsChart.js  DocumentList.js
lib/
  db.js                       JSON store, seed data, logAudit(), publicPatient()
  auth.js                     staff accounts, DEPARTMENTS, ROLE_HOME
  hash.js                     scrypt hash/verify
  ocr.js                      parseSlip() regex NLP + imageToText() Tesseract
  session.js                  localStorage session helpers
```

## 4. Data shapes in db.json

```js
patients: [{ abhaId, aadhaarLast4, name, age, gender, phone, village,
             email, passwordHash, googleSub, createdAt, createdBy }]
records:  [{ id, abhaId, date, department, facility, doctor, diagnosis,
             medicines: [{ name, dose, frequency, duration }],
             notes, allergy, vitals: { bp, pulse, weight },
             source: "paper-ocr" | "doctor-entry" }]
queue:    [{ id, abhaId, name, department, complaint, status: "waiting"|"done", checkedInAt }]
consents: [{ id, abhaId, doctorId, doctorName, department, scope, reason,
             status: "pending"|"granted"|"denied"|"revoked", requestedAt, decidedAt, expiresAt }]
documents:[{ id, abhaId, label, fileName, storedAs, mimeType, size, uploadedBy, uploadedAt }]
tickets:  [{ id, abhaId, name, topic, message, status: "open"|"closed", createdAt }]
audit:    [{ id, actor, action, abhaId, detail, at }]
```

## 5. Rules that must not be broken

1. **Department routing.** A doctor only ever sees patients checked in to their
   own department. Enforced in `app/api/queue/route.js` by filtering on
   `department`. Do not add an "all departments" view.
2. **Consent before access.** A doctor cannot read a record without a granted,
   unexpired consent. Enforced server-side in `app/api/patients/[abhaId]/route.js`
   when `?doctorId=` is present — not in the UI. Window is 60 minutes, set in
   `app/api/consent/route.js`.
3. **OCR output is never auto-saved.** `/api/ocr` returns a draft only. A human
   presses Save, which calls `/api/records`. Keep that separation.
4. **All demo data is synthetic.** No real Aadhaar numbers — only the last four
   digits are stored, and they are made up. Do not add real Aadhaar validation.
5. **No secrets in client code.** Anything in `NEXT_PUBLIC_*` is public by design.
6. **Every write goes through `readDb`/`updateDb`** in `lib/db.js`, so the store
   can be swapped for Postgres by rewriting one file.

## 6. Known gaps (safe things to ask an AI to build next)

- Postgres instead of the JSON file — see section 8.
- Staff sessions are `localStorage` only; anyone who knows a URL can open a staff
  screen. Real cookies/JWT would be the fix.
- No rate limiting, no CSRF protection, no password reset.
- Tesseract handles printed slips well and handwriting poorly. A vision model
  behind `imageToText()` in `lib/ocr.js` would be the upgrade.
- `parseSlip()` is regex-based; it misses unusual formats. Swap it for a medical
  NER model or an LLM call behind the same function signature.
- Offline sync exists only for the doctor's prescription form (`localStorage`
  queue in `app/doctor/page.js`). Nothing else queues offline.

## 7. How to ask another AI for a change

Give it: this file, the exact file path you want changed, and the rule from
section 5 that applies. A prompt that works:

> I'm working on AarogyaPulse (context below). It's Next.js 14 App Router in
> JavaScript, Tailwind, JSON-file storage via lib/db.js. Add a "download my full
> record as PDF" button to the patient dashboard at app/patient/page.js. Keep the
> existing style classes (.card, .btn-primary). Don't add TypeScript or a new
> database. Show me the complete updated file, not a diff.
>
> [paste HANDOFF.md]

Always ask for the **complete updated file** rather than a diff — diffs are where
beginners lose track of what goes where. And after any change: `npm run build`.
If it builds, the change is structurally sound.

## 8. Migrating to Postgres (when you're ready)

The deck and the MVP checklist both say PostgreSQL. Only `lib/db.js` needs to
change, because every route already calls `readDb` / `updateDb` / `logAudit`.

1. Make a free database at neon.tech, copy the connection string.
2. `npm install pg`, put `DATABASE_URL=...` in `.env.local`.
3. Create tables mirroring section 4, then rewrite `lib/db.js` to query them and
   return the same shapes. Keep the function names identical.
4. File uploads need object storage too (Vercel Blob or Supabase Storage),
   because the serverless filesystem is not writable.

Until that is done, **run the demo with `npm run dev` on a laptop**. On Vercel
the JSON file resets between requests and the demo will look broken.
