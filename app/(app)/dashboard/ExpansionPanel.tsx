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
    <div className="rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(29,29,29,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
      >
        <h3 className="font-semibold text-primary">{title}</h3>
        <div className="flex items-center gap-3">
          {leading}
          <svg
            className={`h-5 w-5 text-muted transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`}
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
      {/* grid-template-rows trick: animates height without JS measurement */}
      <div
        className="grid transition-[grid-template-rows] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
