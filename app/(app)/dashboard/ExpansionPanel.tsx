"use client";

import { useState, type ReactNode } from "react";

export default function ExpansionPanel({
  title,
  leading,
  children,
  defaultOpen = false,
}: {
  title: string;
  leading?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
      >
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-3">
          {leading}
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
