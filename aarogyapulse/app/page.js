import Link from "next/link";

const TOUCHPOINTS = [
  {
    step: "1",
    place: "Aadhaar centre",
    line: "Staff create and link a health ID during a visit the citizen was already making. About 60 seconds, no app, no forms.",
  },
  {
    step: "2",
    place: "Hospital records counter",
    line: "Look the patient up, scan their old paper slips, and the OCR pipeline turns them into a dated timeline.",
  },
  {
    step: "3",
    place: "Doctor's cabin",
    line: "The history is on screen before the patient sits down — routed only to the department they checked in for.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-md bg-gov-500 grid place-items-center text-white text-sm font-bold">
              A
            </span>
            <span className="font-bold tracking-tight">AarogyaPulse</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/patient/login" className="btn-ghost !py-2">
              Patient sign in
            </Link>
            <Link href="/login" className="btn-primary !py-2">
              Staff sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-12">
        <p className="text-sm font-semibold text-gov-600">
          Universal portable health records
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
          One health record for every Indian, created where they already are.
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl">
          India digitised identity and payments, but a patient&apos;s medical
          history still doesn&apos;t travel with them. AarogyaPulse rides the
          same Aadhaar and ABHA rails and fixes the part that broke: enrolment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/patient/login" className="btn-primary">
            See my health record
          </Link>
          <Link href="/login" className="btn-ghost">
            Staff sign in
          </Link>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {TOUCHPOINTS.map((t) => (
            <div key={t.step} className="card p-6">
              <span className="chip bg-gov-50 text-gov-700">Step {t.step}</span>
              <h2 className="mt-3 text-lg font-bold tracking-tight">{t.place}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.line}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-6">
          <h2 className="font-bold tracking-tight">Demo accounts</h2>
          <p className="text-sm text-slate-600 mt-1">
            Password for every account is <span className="font-mono">demo123</span>.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">ASK1001</span> — Aadhaar centre staff
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">REC2001</span> — Records counter staff
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">DOC3001</span> — Doctor, Cardiology
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">DOC3002</span> — Doctor, Orthopaedics
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">ADM9001</span> — Administrator
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-mono font-semibold">ramesh@example.com</span> — patient account
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-slate-500">
          AarogyaPulse · Team Er Hustlers · HackWave 3.0
        </div>
      </footer>
    </div>
  );
}
