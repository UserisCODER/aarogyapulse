export default function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm font-medium mt-0.5">{label}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
