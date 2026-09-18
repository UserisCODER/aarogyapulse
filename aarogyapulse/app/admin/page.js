"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";

export default function AdminPage() {
  return (
    <AppShell
      role="admin"
      title="Control room"
      subtitle="Every health ID, every access to a record, and every support request in one place."
    >
      {() => <Panel />}
    </AppShell>
  );
}

const TABS = [
  ["overview", "Overview"],
  ["patients", "Health IDs"],
  ["audit", "Access log"],
  ["consents", "Consents"],
  ["tickets", "Support"],
];

function Panel() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`);
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);

  async function closeTicket(id) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support`  , {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "closed" }),
    });
    load();
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
              tab === key ? "text-gov-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
            {tab === key && (
              <motion.span
                layoutId="admin-tab"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-gov-500"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Health IDs issued"
                  value={data.stats.patients}
                  hint={`${data.stats.withAccounts} have claimed an account`}
                />
                <StatCard
                  label="Records on file"
                  value={data.stats.records}
                  hint={`${data.stats.digitised} came off paper`}
                />
                <StatCard label="Documents stored" value={data.stats.documents} />
                <StatCard
                  label="Patients waiting"
                  value={data.stats.waiting}
                  hint="Across all departments"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="card p-5">
                  <h3 className="font-bold tracking-tight">Records by department</h3>
                  <ul className="mt-4 space-y-3">
                    {Object.entries(data.byDepartment).map(([dept, count]) => {
                      const max = Math.max(...Object.values(data.byDepartment), 1);
                      return (
                        <li key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{dept}</span>
                            <span className="text-slate-500">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / max) * 100}%` }}
                              transition={{ duration: 0.4 }}
                              className="h-full bg-gov-500"
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="card p-5">
                  <h3 className="font-bold tracking-tight">Needs attention</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Consent requests waiting on a patient</span>
                      <span className="font-semibold">{data.stats.consentsPending}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Open support tickets</span>
                      <span className="font-semibold">{data.stats.openTickets}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === "patients" && (
            <Table
              head={["Name", "Health ID", "Aadhaar", "Account", "Created at"]}
              rows={data.patients.map((p) => [
                p.name,
                p.abhaId,
                `····${p.aadhaarLast4}`,
                p.hasAccount ? "Claimed" : "Not claimed",
                p.createdBy,
              ])}
              empty="No health IDs yet."
            />
          )}

          {tab === "audit" && (
            <Table
              head={["When", "Who", "Did what", "Health ID"]}
              rows={data.audit.map((a) => [
                new Date(a.at).toLocaleString("en-IN"),
                a.actor,
                a.action.replace(/-/g, " "),
                a.abhaId || "—",
              ])}
              empty="Nothing logged yet."
            />
          )}

          {tab === "consents" && (
            <Table
              head={["Doctor", "Department", "Health ID", "Status", "Asked at"]}
              rows={data.consents.map((c) => [
                c.doctorName,
                c.department,
                c.abhaId,
                c.status,
                new Date(c.requestedAt).toLocaleString("en-IN"),
              ])}
              empty="No access requests yet."
            />
          )}

          {tab === "tickets" && (
            <div className="space-y-3">
              {data.tickets.length === 0 && (
                <p className="text-sm text-slate-600">No support requests.</p>
              )}
              {data.tickets.map((t) => (
                <div key={t.id} className="card p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {t.topic} · {t.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {t.abhaId || "no health ID"}
                      </p>
                    </div>
                    <span
                      className={`chip ${
                        t.status === "open"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">{t.message}</p>
                  {t.status === "open" && (
                    <button
                      onClick={() => closeTicket(t.id)}
                      className="btn-ghost !py-1.5 !px-3 mt-3"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Table({ head, rows, empty }) {
  if (!rows.length) return <p className="text-sm text-slate-600">{empty}</p>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {head.map((h) => (
              <th
                key={h}
                className="text-left font-semibold text-slate-500 px-4 py-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
