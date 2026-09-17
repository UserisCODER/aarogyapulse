"use client";

function prettySize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents = [] }) {
  if (!documents.length) {
    return (
      <p className="text-sm text-slate-600">
        No documents yet. Upload a scan, a lab report or a discharge summary and it
        stays attached to this health ID.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
      {documents.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{d.label}</p>
            <p className="text-xs text-slate-500 truncate">
              {d.fileName} · {prettySize(d.size)} · added by {d.uploadedBy}
            </p>
          </div>
          <a
            href={`/api/documents/${d.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !py-1.5 !px-3 shrink-0"
          >
            Open
          </a>
        </li>
      ))}
    </ul>
  );
}
