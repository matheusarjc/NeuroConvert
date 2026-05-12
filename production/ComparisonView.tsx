"use client";

import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────
export type Severity = "critical" | "warning" | "good";

export interface Dimension {
  name: string;
  score: number;
  severity: Severity;
  findings: Finding[];
}

export interface Finding {
  title: string;
  principle: string;
  impact: number;
  severity: Severity;
}

export interface ReportJSON {
  score: number;
  url: string;
  dimensions: Dimension[];
  quick_wins: Array<{ action: string; principle: string; impact: number }>;
}

export interface Comparison {
  previous: {
    score: number;
    report_json: ReportJSON;
    analyzed_at: string;
  };
  current: {
    score: number;
    analyzed_at: string;
  };
  delta: number;
  improved: boolean;
}

interface Props {
  report: ReportJSON;
  comparison: Comparison;
  onViewFull: () => void;
}

// ── Severity helpers ──────────────────────────────────────
const SEV_COLOR: Record<Severity, string> = {
  critical: "#EF4444",
  warning: "#F59E0B",
  good: "#22C55E",
};
const SEV_LABEL: Record<Severity, string> = {
  critical: "Crítico",
  warning: "Atenção",
  good: "Bom",
};

function scoreToSeverity(score: number): Severity {
  if (score >= 70) return "good";
  if (score >= 40) return "warning";
  return "critical";
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Score gauge (SVG) ─────────────────────────────────────
function ScoreGauge({
  score,
  color,
  label,
  date,
  size = 128,
  stroke = 10,
}: {
  score: number;
  color: string;
  label: string;
  date: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (animated / 100) * circ;
  const sev = scoreToSeverity(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
        {label}
      </span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
              filter: `drop-shadow(0 0 5px ${color}50)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-['Space_Grotesk'] text-4xl font-bold leading-none tracking-tight"
            style={{ color, letterSpacing: "-1.5px" }}
          >
            {score}
          </span>
          <span
            className="mt-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ color }}
          >
            {SEV_LABEL[sev]}
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] text-[#4B5563]">{date}</span>
    </div>
  );
}

// ── Dimension row ─────────────────────────────────────────
function DimRow({
  name,
  before,
  after,
}: {
  name: string;
  before: { score: number; severity: Severity };
  after: { score: number; severity: Severity };
}) {
  const delta = after.score - before.score;
  const changed = before.severity !== after.severity;
  const improved = after.score > before.score;

  return (
    <div
      className="grid items-center gap-3 border-b border-white/[0.05] px-4 py-[10px] transition-colors"
      style={{
        gridTemplateColumns: "1fr 96px 96px 52px",
        background: changed
          ? improved
            ? "rgba(34,197,94,0.03)"
            : "rgba(239,68,68,0.03)"
          : "transparent",
      }}
    >
      <span className="text-[12px] font-medium text-white">{name}</span>

      {/* Before */}
      <div className="flex items-center gap-1.5">
        <div
          className="h-[5px] w-[5px] shrink-0 rounded-full"
          style={{ background: SEV_COLOR[before.severity] }}
        />
        <span
          className="text-[11px]"
          style={{ color: SEV_COLOR[before.severity] }}
        >
          {SEV_LABEL[before.severity]}
        </span>
        <span className="font-mono text-[10px] text-[#4B5563]">
          {before.score}
        </span>
      </div>

      {/* After */}
      <div className="flex items-center gap-1.5">
        <div
          className="h-[5px] w-[5px] shrink-0 rounded-full"
          style={{ background: SEV_COLOR[after.severity] }}
        />
        <span
          className="text-[11px]"
          style={{ color: SEV_COLOR[after.severity] }}
        >
          {SEV_LABEL[after.severity]}
        </span>
        <span className="font-mono text-[10px] text-[#4B5563]">
          {after.score}
        </span>
      </div>

      {/* Delta */}
      <div className="flex items-center justify-end gap-1">
        {delta !== 0 && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke={delta > 0 ? "#22C55E" : "#EF4444"}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline
              points={delta > 0 ? "18,15 12,9 6,15" : "18,9 12,15 6,9"}
            />
          </svg>
        )}
        <span
          className="font-mono text-[11px] font-bold"
          style={{
            color:
              delta > 0 ? "#22C55E" : delta < 0 ? "#EF4444" : "#4B5563",
          }}
        >
          {delta > 0 ? `+${delta}` : delta === 0 ? "—" : delta}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export function ComparisonView({ report, comparison, onViewFull }: Props) {
  const { previous, current, delta, improved } = comparison;
  const days = daysBetween(previous.analyzed_at, current.analyzed_at);

  // Pair dimensions from previous and current report
  const prevDims = previous.report_json.dimensions ?? [];
  const currDims = report.dimensions ?? [];

  const pairedDims = currDims.map((curr) => {
    const prev = prevDims.find((d) => d.name === curr.name);
    return {
      name: curr.name,
      before: { score: prev?.score ?? 0, severity: prev?.severity ?? "critical" as Severity },
      after:  { score: curr.score,        severity: curr.severity },
    };
  });

  // Quick wins that graduated from critical → not critical
  const resolvedWins = pairedDims.filter(
    (d) => d.before.severity === "critical" && d.after.severity !== "critical"
  );

  const stillCritical = pairedDims.filter(
    (d) => d.after.severity === "critical"
  ).length;

  const beforeColor = "#6B7280";
  const afterColor =
    current.score >= 70 ? "#22C55E" : current.score >= 40 ? "#F59E0B" : "#EF4444";

  const card = "rounded-xl border border-white/[0.07] bg-[#141414]";

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {/* Header badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
          style={{
            background: improved ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            borderColor: improved ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)",
            color: improved ? "#22C55E" : "#EF4444",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {improved
              ? <polyline points="20,6 9,17 4,12"/>
              : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            }
          </svg>
          {improved ? "Evolução detectada" : "Regressão detectada"} — {days} dias desde última análise
        </div>
      </div>

      {/* Score gauges */}
      <div className={`${card} flex items-center justify-center gap-12 px-10 py-8`}>
        <ScoreGauge
          score={previous.score}
          color={beforeColor}
          label="Antes"
          date={formatDate(previous.analyzed_at)}
        />
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-['Space_Grotesk'] text-5xl font-bold leading-none"
            style={{ color: improved ? "#22C55E" : "#EF4444", letterSpacing: "-2px" }}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
          <span className="text-[11px] text-[#9CA3AF]">pontos</span>
          <span className="mt-2 text-center text-[11px] text-[#4B5563]">
            score evoluiu{" "}
            <span
              className="font-mono font-bold"
              style={{ color: improved ? "#22C55E" : "#EF4444" }}
            >
              {delta > 0 ? "+" : ""}
              {Math.round((delta / Math.max(previous.score, 1)) * 100)}%
            </span>
            <br />
            em {days} dias
          </span>
        </div>
        <ScoreGauge
          score={current.score}
          color={afterColor}
          label="Depois"
          date={formatDate(current.analyzed_at)}
        />
      </div>

      {/* Dimension table */}
      <div className={`${card} overflow-hidden`}>
        <div
          className="grid gap-3 border-b border-white/[0.07] px-4 py-[10px]"
          style={{ gridTemplateColumns: "1fr 96px 96px 52px" }}
        >
          {["Dimensão", "Antes", "Depois", "Δ"].map((h) => (
            <span
              key={h}
              className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#4B5563]"
            >
              {h}
            </span>
          ))}
        </div>
        {pairedDims.map((d) => (
          <DimRow key={d.name} name={d.name} before={d.before} after={d.after} />
        ))}
      </div>

      {/* Quick wins resolved */}
      {resolvedWins.length > 0 && (
        <div className={`${card} px-5 py-4`}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.6px] text-[#4B5563]">
            Quick wins implementados
          </p>
          <div className="flex flex-col gap-2">
            {resolvedWins.map((w) => {
              const win = report.quick_wins?.find((qw) =>
                qw.action?.toLowerCase().includes(w.name.toLowerCase())
              );
              return (
                <div key={w.name} className="flex items-center gap-2.5">
                  <div
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.25)",
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                      stroke="#22C55E" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <span className="font-mono text-[10px] text-[#1D9E75]">
                    {win?.principle ?? w.name}
                  </span>
                  {win?.action && (
                    <span className="text-[11px] text-[#9CA3AF]">
                      — {win.action}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className={`${card} flex items-center justify-between gap-4 px-5 py-4`}>
        {stillCritical > 0 ? (
          <>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-[13px] text-[#9CA3AF]">
                Ainda há{" "}
                <span className="font-mono font-bold text-[#EF4444]">
                  {stillCritical}
                </span>{" "}
                problema{stillCritical > 1 ? "s" : ""} crítico
                {stillCritical > 1 ? "s" : ""} sem correção
              </span>
            </div>
            <button
              onClick={onViewFull}
              className="shrink-0 rounded-[7px] bg-[#1D9E75] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#25C98F]"
            >
              Ver laudo completo →
            </button>
          </>
        ) : (
          <>
            <span className="text-[13px] text-[#9CA3AF]">
              Excelente evolução! Analise a página de um concorrente →
            </span>
            <button className="shrink-0 rounded-[7px] border border-[rgba(29,158,117,0.25)] bg-[rgba(29,158,117,0.1)] px-4 py-2 text-[13px] font-semibold text-[#1D9E75]">
              Nova análise
            </button>
          </>
        )}
      </div>

      {/* Monitoring badge */}
      <div
        className="flex items-center gap-3 rounded-[10px] border px-4 py-3"
        style={{
          background: "rgba(29,158,117,0.05)",
          borderColor: "rgba(29,158,117,0.15)",
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0 rounded-full border px-2 py-1"
          style={{ background: "rgba(29,158,117,0.08)", borderColor: "rgba(29,158,117,0.2)" }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1D9E75]" />
          <span className="text-[10px] font-semibold text-[#1D9E75]">
            Monitorando
          </span>
        </div>
        <span className="text-[12px] text-[#9CA3AF]">
          Próxima análise automática em{" "}
          <span className="font-mono font-semibold text-[#1D9E75]">30 dias</span>.
          Você receberá um email se o score mudar.
        </span>
      </div>
    </div>
  );
}
