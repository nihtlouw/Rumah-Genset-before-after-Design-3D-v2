import { useState } from "react";
import { ArrowRight, ChevronsLeftRight, MoveRight, Plus } from "lucide-react";
import FloorPlan from "@/components/FloorPlan";
import { SectionHead, DataPill } from "@/components/ui";
import { changes, areaOf, fmt, gensetClearance, type HouseConfig } from "@/data";

export default function CompareSection({
  before,
  after,
  onGoModel,
  onGoMode,
}: {
  before: HouseConfig;
  after: HouseConfig;
  onGoModel: () => void;
  onGoMode: (mode: "before" | "after") => void;
}) {
  const [split, setSplit] = useState(52);
  const areaBefore = areaOf(before.buildW, before.buildD);
  const areaAfter = areaOf(after.buildW, after.buildD);
  const clearance = gensetClearance(after);

  return (
    <section id="banding" className="section-anchor border-t border-white/[0.07] py-14 sm:py-16 lg:py-20">
      <SectionHead
        index="03"
        kicker="Before / after · sinkron dengan model"
        title={
          <>
            Satu tapak, dua keadaan.
            <span className="block text-mist">Lihat apa yang berubah.</span>
          </>
        }
        description="Bandingkan denah eksisting dengan usulan. Geser pembatas untuk melihat perubahan footprint, zona genset, pintu, dan perpindahan pagar."
        action={
          <>
            <DataPill tone="lime">
              <span className="h-1 w-1 rounded-full bg-lime" /> live comparison
            </DataPill>
            <button
              type="button"
              onClick={onGoModel}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-2 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist transition hover:border-lime/40 hover:text-lime"
            >
              Lihat 3D <ArrowRight size={11} />
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-paperink/15 bg-paper shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paperink/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronsLeftRight size={13} className="text-paperink/50" />
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.1em] text-paperink/65">
                geser pembatas
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono-tech text-[9px] uppercase tracking-[0.08em]">
              <span className="rounded-full bg-paperink px-2 py-1 text-paper">Before</span>
              <MoveRight size={11} className="text-paperink/40" />
              <span className="rounded-full bg-[#c6e98a] px-2 py-1 text-paperink">After</span>
            </div>
          </div>

          <div className="relative select-none">
            <FloorPlan config={after} onSelect={() => undefined} compact selectedId="" />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
              <FloorPlan config={before} onSelect={() => undefined} compact selectedId="" />
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#25322a]"
              style={{ left: `${split}%` }}
            >
              <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#25322a] bg-lime text-ink shadow-lg">
                <ChevronsLeftRight size={14} />
              </span>
            </div>

            <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-paperink/15 bg-paper/90 px-2.5 py-1 font-mono-tech text-[9px] uppercase tracking-[0.1em] text-paperink/70 backdrop-blur">
              2024 · eksisting
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-paperink/15 bg-paper/90 px-2.5 py-1 font-mono-tech text-[9px] uppercase tracking-[0.1em] leading-none text-paperink/70 backdrop-blur">
              2026 · usulan
            </div>
          </div>

          <div className="border-t border-paperink/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.08em] text-paperink/50">before</span>
              <input
                type="range"
                min={8}
                max={92}
                value={split}
                onChange={(event) => setSplit(Number(event.target.value))}
                aria-label="Pembanding before after"
                className="h-1.5 flex-1 [&::-webkit-slider-thumb]:bg-[#25322a] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#25322a]"
              />
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.08em] text-paperink/50">after</span>
              <span className="w-10 text-right font-mono-tech text-[10px] text-paperink/70">{split}%</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {(after.enclosed ? ["Selubung + louver", "Pintu 120×220", "Pagar dipindah"] : ["Kanopi terbuka", "Genset existing", "Pagar kiri 150"]).map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-paperink/15 px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.06em] text-paperink/60"
                  >
                    {tag}
                  </span>
                )
              )}
              <span className="mx-1 hidden h-4 w-px bg-paperink/15 sm:block" />
              <button
                type="button"
                onClick={() => onGoMode("before")}
                className="inline-flex items-center gap-1 rounded-full border border-paperink/25 px-2.5 py-1 font-mono-tech text-[8px] uppercase tracking-[0.06em] text-paperink/75 transition hover:bg-paperink hover:text-paper"
              >
                POV before <ArrowRight size={8} />
              </button>
              <button
                type="button"
                onClick={() => onGoMode("after")}
                className="inline-flex items-center gap-1 rounded-full bg-paperink px-2.5 py-1 font-mono-tech text-[8px] uppercase tracking-[0.06em] text-paper transition hover:bg-[#33433a]"
              >
                POV after <ArrowRight size={8} />
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1517]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div>
              <p className="font-mono-tech text-[9px] uppercase tracking-[0.12em] text-mist-2">Change board</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#e6ede2]">Apa yang berubah</p>
            </div>
            <span className="rounded-full border border-lime/25 bg-lime/[0.08] px-2 py-1 font-mono-tech text-[9px] text-lime">
              +{fmt(areaAfter - areaBefore, 2)} m²
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
            {[
              { label: "Luas after", value: `${fmt(areaAfter, 2)} m²` },
              { label: "Zona mesin", value: `${after.gensets.length} unit` },
              { label: "Jarak servis", value: clearance !== null ? `${fmt(clearance)} cm` : "—" },
              { label: "Bukaan", value: after.enclosed ? "Louver + pintu" : "Open canopy" },
            ].map((item) => (
              <div key={item.label} className="bg-[#0d1517] px-4 py-3">
                <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-mist-2">{item.label}</span>
                <p className="mt-1 font-mono-tech text-[12px] text-[#dde7d8]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center justify-between py-2">
              <span className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">item</span>
              <div className="flex gap-8">
                <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-mist-2">before</span>
                <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-lime/80">after</span>
              </div>
            </div>
            {changes.slice(0, 7).map((row) => (
              <div key={row.label} className="border-t border-white/[0.06] py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] leading-tight text-[#c6d0c4]">{row.label}</span>
                  <span className="shrink-0 rounded-sm bg-white/[0.05] px-1.5 py-0.5 font-mono-tech text-[7px] uppercase tracking-[0.06em] text-mist-2">
                    {row.tag}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono-tech text-[9px] text-mist-2 line-through decoration-mist-2/40">{row.before}</span>
                  <MoveRight size={9} className="shrink-0 text-mist-2" />
                  <span className="font-mono-tech text-[9px] text-[#dce8d6]">{row.after}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onGoModel}
            className="m-3 mt-1 flex w-[calc(100%-24px)] items-center justify-between rounded-lg border border-lime/20 bg-lime/[0.06] px-3 py-2.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-lime transition hover:bg-lime/[0.1]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus size={11} /> edit ukuran setelah ini
            </span>
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </section>
  );
}
