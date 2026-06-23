"use client";

import { type MonitoringBucket, type MonitoringRange } from "@/lib/api";

// Oddiy, o'zi-yetarli SVG ustunli diagramma — tashqi kutubxonasiz.
// Backend faqat ma'lumotli buketlarni qaytaradi (siyrak), shuning uchun
// faqat kelgan buketlarni chizamiz va bo'shliqlarga e'tibor bermaymiz.

function tickLabel(iso: string, range: MonitoringRange): string {
  const d = new Date(iso);
  if (range === "hourly") {
    return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "monthly") {
    return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "short" });
  }
  return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
}

export default function UsageChart({
  buckets,
  range,
  loading,
}: {
  buckets: MonitoringBucket[];
  range: MonitoringRange;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        Yuklanmoqda…
      </div>
    );
  }

  if (!buckets || buckets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        Ma&apos;lumot yo&apos;q
      </div>
    );
  }

  const max = Math.max(...buckets.map((b) => b.count), 1);
  const n = buckets.length;

  const W = Math.max(n * 48, 320);
  const H = 240;
  const padBottom = 36;
  const padTop = 20;
  const chartH = H - padBottom - padTop;
  const slot = W / n;
  const barW = Math.min(slot * 0.6, 40);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-64 w-full min-w-full"
        role="img"
        aria-label="Foydalanish diagrammasi"
      >
        {/* asosiy chiziq */}
        <line
          x1={0}
          y1={H - padBottom}
          x2={W}
          y2={H - padBottom}
          stroke="#D9C7A4"
          strokeWidth={1}
        />
        {buckets.map((b, i) => {
          const h = (b.count / max) * chartH;
          const x = i * slot + (slot - barW) / 2;
          const y = H - padBottom - h;
          return (
            <g key={b.ts}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 1)}
                rx={3}
                fill="#B08D57"
              />
              {/* qiymat belgisi */}
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fill="#6B6356"
                fontSize={11}
              >
                {b.count}
              </text>
              {/* x-o'qi belgisi */}
              <text
                x={x + barW / 2}
                y={H - padBottom + 16}
                textAnchor="middle"
                fill="#6B6356"
                fontSize={10}
              >
                {tickLabel(b.ts, range)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
