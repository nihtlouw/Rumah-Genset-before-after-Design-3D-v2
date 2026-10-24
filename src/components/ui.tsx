import type { ReactNode } from "react";
import { ArrowUpRight, Check, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Mode } from "@/data";

export function ModeSwitch({
  mode,
  onChange,
  compact = false,
  labels = ["Before", "After"],
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  compact?: boolean;
  labels?: [string, string];
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur",
        compact ? "text-[11px]" : "text-xs"
      )}
    >
      {(["before", "after"] as Mode[]).map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-pressed={mode === item}
          className={cn(
            "relative flex items-center gap-2 rounded-full px-3.5 py-2 font-mono-tech uppercase tracking-[0.12em] transition-all duration-300",
            compact && "px-3 py-1.5",
            mode === item
              ? item === "after"
                ? "bg-lime text-ink shadow-[0_2px_14px_-4px_rgba(198,247,92,0.7)]"
                : "bg-paper text-paperink"
              : "text-mist hover:text-white"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              mode === item ? (item === "after" ? "bg-ink" : "bg-paperink") : "bg-mist-2"
            )}
          />
          {labels[index]}
        </button>
      ))}
    </div>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  description,
  action,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="font-mono-tech text-[11px] text-lime">{index}</span>
          <span className="h-px w-8 bg-lime/50" />
          <span className="label-xs text-mist">{kicker}</span>
        </div>
        <h2 className="font-display text-3xl font-medium leading-[1.08] tracking-[-0.03em] text-balance text-[#f2f5ee] sm:text-4xl md:text-[42px]">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function DataPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "lime" | "amber" | "steel" | "rust" | "paper";
  className?: string;
}) {
  const toneMap = {
    neutral: "border-white/10 bg-white/[0.04] text-mist",
    lime: "border-lime/25 bg-lime/[0.08] text-lime",
    amber: "border-amber/25 bg-amber/[0.08] text-amber",
    steel: "border-steel/25 bg-steel/[0.08] text-steel",
    rust: "border-rust/25 bg-rust/[0.08] text-rust",
    paper: "border-paperink/15 bg-paperink/[0.06] text-paperink",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-tech text-[10px] uppercase leading-none tracking-[0.08em]",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatBlock({
  label,
  value,
  unit,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative border-l border-white/10 pl-4">
      <span className={cn("label-xs block", accent ? "text-lime" : "text-mist-2")}>{label}</span>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] font-medium leading-none tracking-[-0.03em] text-[#f2f5ee] sm:text-[30px]">
          {value}
        </span>
        {unit ? <span className="font-mono-tech text-[11px] text-mist">{unit}</span> : null}
      </div>
      {note ? <p className="mt-1.5 text-[11px] leading-snug text-mist-2">{note}</p> : null}
    </div>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "cm",
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const clampValue = (next: number) => {
    if (Number.isNaN(next)) return;
    onChange(Math.min(max, Math.max(min, Math.round(next))));
  };
  return (
    <div className="border-b border-white/[0.06] py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[11px] font-medium leading-tight text-[#c5cfc8]">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => clampValue(Number(event.target.value))}
            className="w-16 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-right font-mono-tech text-[11px] text-white outline-none transition focus:border-lime/60 focus:ring-1 focus:ring-lime/20"
          />
          <span className="w-5 font-mono-tech text-[9px] uppercase text-mist-2">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-7 font-mono-tech text-[9px] text-mist-2">{min}</span>
        <input
          type="range"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => clampValue(Number(event.target.value))}
          className="h-1 flex-1"
        />
        <span className="w-7 text-right font-mono-tech text-[9px] text-mist-2">{max}</span>
      </div>
      {hint ? <p className="mt-1.5 text-[10px] leading-snug text-mist-2">{hint}</p> : null}
    </div>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 text-left last:border-b-0"
    >
      <span className="flex items-center gap-2">
        {icon ? <span className={cn("transition", checked ? "text-lime" : "text-mist-2")}>{icon}</span> : null}
        <span>
          <span className="block text-[11px] font-medium text-[#c5cfc8]">{label}</span>
          {description ? <span className="mt-0.5 block text-[10px] text-mist-2">{description}</span> : null}
        </span>
      </span>
      <span
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors",
          checked ? "border-lime/60 bg-lime/90" : "border-white/15 bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute h-2.5 w-2.5 rounded-full transition-all duration-300",
            checked ? "left-[15px] bg-ink" : "left-[3px] bg-mist"
          )}
        />
      </span>
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-2 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-mist transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function SolidButton({
  children,
  onClick,
  className,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 font-mono-tech text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-[#d6ff7f] active:scale-[0.98]",
        className
      )}
    >
      {children}
      {icon ?? <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
    </button>
  );
}

export function ResetButton({ onClick, label = "Reset" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.1em] text-mist transition hover:border-lime/40 hover:text-lime"
    >
      <RotateCcw size={10} />
      {label}
    </button>
  );
}

export function CheckLine({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          ok ? "border-lime/50 bg-lime/15 text-lime" : "border-amber/50 bg-amber/15 text-amber"
        )}
      >
        <Check size={10} strokeWidth={3} />
      </span>
      <span className="text-[11px] leading-snug text-[#b7c2bb]">{children}</span>
    </div>
  );
}
