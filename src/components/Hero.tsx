import { ArrowDownRight, Camera, Ruler, SlidersHorizontal, Box, MapPin } from "lucide-react";
import HeroAxon from "@/components/HeroAxon";
import type { HouseConfig } from "@/data";
import { fmt, gensetClearance } from "@/data";

const steps = [
  { number: "01", icon: Camera, title: "Survey lapangan", note: "4 sisi terdokumentasi", state: "done" },
  { number: "02", icon: Ruler, title: "Denah 2D", note: "Footprint & zonasi", state: "done" },
  { number: "03", icon: Box, title: "Model 3D", note: "POV · ukuran · edit", state: "active" },
  { number: "04", icon: SlidersHorizontal, title: "Revisi live", note: "Before / after", state: "live" },
];

export default function Hero({ configs }: { configs: Record<"before" | "after", HouseConfig> }) {
  const after = configs.after;
  const clearance = gensetClearance(after);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="ringkasan" className="section-anchor relative pb-14 pt-8 sm:pt-12 lg:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] tech-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="grid items-center gap-9 lg:grid-cols-[1.02fr_.98fr] lg:gap-12">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.06] px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.12em] text-lime">
              <span className="h-1 w-1 rounded-full bg-lime" />
              survey → konsep 2D → model 3D
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono-tech text-[9px] uppercase tracking-[0.1em] text-mist-2">
              <MapPin size={10} /> Gedung G · Jakarta
            </span>
          </div>

          <h1 className="max-w-[670px] font-display text-[40px] font-medium leading-[0.98] tracking-[-0.045em] text-[#f4f7f0] sm:text-[54px] lg:text-[62px]">
            Dari sketsa lapangan,
            <span className="block text-mist">jadi rumah genset</span>
            <span className="block text-lime">yang terukur.</span>
          </h1>

          <p className="mt-5 max-w-[510px] text-[13.5px] leading-relaxed text-mist sm:text-sm">
            Konsep penataan ulang kanopi genset eksisting menjadi rumah genset dua zona. Semua dimensi
            berasal dari sketsa survei, dapat dibaca sebagai denah 2D, lalu diuji dalam model 3D yang bisa
            diputar dari semua sisi.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollTo("model")}
              className="group inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 font-mono-tech text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-[#d9ff8d] active:scale-[0.99]"
            >
              Buka model 3D
              <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("denah")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#d6dfd3] transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <Ruler size={13} />
              Lihat denah 2D
            </button>
            <span className="ml-1 hidden font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist-2 sm:inline">
              06 pov · 2 skenario
            </span>
          </div>

          <div className="mt-8 grid max-w-[540px] grid-cols-2 gap-x-4 gap-y-5 border-t border-white/[0.09] pt-5 sm:grid-cols-4 sm:gap-0">
            <div className="border-white/10 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
              <span className="label-xs text-mist-2">Footprint after</span>
              <p className="mt-1.5 font-display text-[21px] leading-none tracking-[-0.03em] text-[#eef3e9]">
                {fmt(after.buildW)} <span className="text-mist-2">×</span> {fmt(after.buildD)}
              </p>
              <span className="mt-1 block font-mono-tech text-[9px] text-mist-2">cm</span>
            </div>
            <div className="border-white/10 sm:border-l sm:pl-4">
              <span className="label-xs text-mist-2">Zona genset</span>
              <p className="mt-1.5 font-display text-[21px] leading-none tracking-[-0.03em] text-[#eef3e9]">
                02 <span className="text-[13px] text-mist-2">unit</span>
              </p>
              <span className="mt-1 block font-mono-tech text-[9px] text-mist-2">existing + baru</span>
            </div>
            <div className="border-white/10 sm:border-l sm:pl-4">
              <span className="label-xs text-mist-2">Jarak servis</span>
              <p className="mt-1.5 font-display text-[21px] leading-none tracking-[-0.03em] text-[#eef3e9]">
                {clearance !== null ? fmt(clearance) : "—"} <span className="text-[13px] text-mist-2">cm</span>
              </p>
              <span className="mt-1 block font-mono-tech text-[9px] text-mist-2">min. 100 cm</span>
            </div>
            <div className="border-white/10 sm:border-l sm:pl-4">
              <span className="label-xs text-mist-2">Pondasi baru</span>
              <p className="mt-1.5 font-display text-[21px] leading-none tracking-[-0.03em] text-[#eef3e9]">
                {fmt(after.gensets.find((unit) => unit.kind === "new")?.foundationW ?? 500)}
                <span className="text-[13px] text-mist-2">
                  ×{fmt(after.gensets.find((unit) => unit.kind === "new")?.foundationD ?? 150)}
                </span>
              </p>
              <span className="mt-1 block font-mono-tech text-[9px] text-mist-2">t = 30 cm</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <HeroAxon />
          <div className="no-print absolute -bottom-4 left-4 hidden items-center gap-2 rounded-full border border-white/10 bg-[#0c1415]/95 px-3 py-2 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist shadow-xl backdrop-blur sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            denah 2D → model 3D · live edit
          </div>
        </div>
      </div>

      <div className="no-print mt-12 grid overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1113]/60 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <span
                className={
                  step.state === "active"
                    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lime/30 bg-lime/10 text-lime"
                    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-mist-2"
                }
              >
                <Icon size={13} />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tech text-[9px] text-mist-2">{step.number}</span>
                  <span className="truncate text-[11px] font-medium text-[#dbe4d8]">{step.title}</span>
                </div>
                <p className="mt-0.5 truncate font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2">
                  {step.note}
                </p>
              </div>
              <span
                className={
                  step.state === "live"
                    ? "ml-auto h-1.5 w-1.5 rounded-full bg-lime"
                    : "ml-auto h-1.5 w-1.5 rounded-full bg-white/15"
                }
              />
            </div>
          );
        })}
      </div>
      <span className="mt-3 block text-right font-mono-tech text-[8px] uppercase tracking-[0.1em] text-mist-2">
        index {String(1).padStart(2, "0")} — ringkasan konsep
      </span>
    </section>
  );
}
