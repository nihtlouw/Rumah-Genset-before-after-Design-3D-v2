import { Camera, Check, Download, Info, Printer, TriangleAlert } from "lucide-react";
import { DataPill, SectionHead } from "@/components/ui";
import {
  areaOf,
  assumptions,
  engineeringChecks,
  fmt,
  gensetClearance,
  surveyNotes,
  type HouseConfig,
} from "@/data";
import { cn } from "@/utils/cn";

const toneStyles = {
  steel: { dot: "bg-steel", text: "text-steel", border: "border-steel/25", bg: "bg-steel/[0.05]" },
  amber: { dot: "bg-amber", text: "text-amber", border: "border-amber/25", bg: "bg-amber/[0.05]" },
  lime: { dot: "bg-lime", text: "text-lime", border: "border-lime/25", bg: "bg-lime/[0.05]" },
  rust: { dot: "bg-rust", text: "text-rust", border: "border-rust/25", bg: "bg-rust/[0.05]" },
};

export default function DataSection({
  before,
  after,
  onExport,
  onPrint,
}: {
  before: HouseConfig;
  after: HouseConfig;
  onExport: () => void;
  onPrint: () => void;
}) {
  const newUnit = after.gensets.find((unit) => unit.kind === "new");
  const existingAfter = after.gensets.find((unit) => unit.kind === "existing");
  const beforeUnit = before.gensets[0];
  const clearance = gensetClearance(after);
  const checks = engineeringChecks(after);

  const rows: { label: string; before: string; after: string; note?: string }[] = [
    { label: "Dimensi tapak", before: `${fmt(before.siteW)} × ${fmt(before.siteD)} cm`, after: `${fmt(after.siteW)} × ${fmt(after.siteD)} cm`, note: "site" },
    { label: "Footprint bangunan", before: `${fmt(before.buildW)} × ${fmt(before.buildD)} cm`, after: `${fmt(after.buildW)} × ${fmt(after.buildD)} cm`, note: "struktur" },
    { label: "Luas efektif", before: `${fmt(areaOf(before.buildW, before.buildD), 2)} m²`, after: `${fmt(areaOf(after.buildW, after.buildD), 2)} m²`, note: "area" },
    { label: "Tinggi eave", before: `${fmt(before.wallH)} cm`, after: `${fmt(after.wallH)} cm`, note: "elevasi" },
    { label: "Tinggi ridge", before: `${fmt(before.wallH + before.roofRise)} cm`, after: `${fmt(after.wallH + after.roofRise)} cm`, note: "atap" },
    {
      label: "Unit genset existing",
      before: beforeUnit ? `${beforeUnit.w} × ${beforeUnit.d} cm` : "—",
      after: existingAfter ? `${existingAfter.w} × ${existingAfter.d} cm` : "—",
      note: existingAfter?.code ?? "unit",
    },
    {
      label: "Pondasi existing",
      before: beforeUnit ? `${beforeUnit.foundationW} × ${beforeUnit.foundationD} cm` : "—",
      after: existingAfter ? `${existingAfter.foundationW} × ${existingAfter.foundationD} cm` : "—",
      note: "acuan elevasi",
    },
    {
      label: "Pondasi genset baru",
      before: "Belum ada",
      after: newUnit ? `${newUnit.foundationW} × ${newUnit.foundationD} × ${newUnit.foundationH} cm` : "Belum ada",
      note: "beton",
    },
    {
      label: "Jarak servis",
      before: "—",
      after: clearance !== null ? `${fmt(clearance)} cm` : "—",
      note: "clearance",
    },
    { label: "Akses pintu", before: `${before.doorW} × ${before.doorH} cm`, after: `${after.doorW} × ${after.doorH} cm`, note: "akses" },
    { label: "Kolom baja", before: "6 titik · 20×20", after: `${after.enclosed ? 8 : 6} titik · 20×20`, note: "struktur" },
    { label: "Pagar", before: `kiri · ${before.offsetX} cm`, after: "belakang · 600 cm", note: "site" },
    { label: "Selubung", before: "Kanopi terbuka", after: after.enclosed ? `Tembok 150 + louver` : "Kanopi terbuka", note: "arsitektur" },
  ];

  return (
    <section id="data" className="section-anchor border-t border-white/[0.07] py-14 sm:py-16 lg:py-20">
      <SectionHead
        index="04"
        kicker="Data, ukuran, catatan lapangan"
        title={
          <>
            Angka yang bisa dipakai
            <span className="block text-mist">untuk gambar kerja.</span>
          </>
        }
        description="Rangkuman dimensi, hasil pemeriksaan ruang servis, serta catatan survei empat sisi. Nilai before–after mengikuti perubahan pada masing-masing skenario; pemeriksaan kelayakan dihitung dari skenario after."
        action={
          <>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-2 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist transition hover:border-lime/40 hover:text-lime"
            >
              <Download size={11} /> JSON
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-2 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist transition hover:border-lime/40 hover:text-lime"
            >
              <Printer size={11} /> Cetak
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-paperink/15 bg-paper text-paperink shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-paperink/15 px-4 py-4 sm:px-5">
            <div>
              <p className="font-mono-tech text-[9px] uppercase tracking-[0.14em] text-paperink/45">
                Schedule of dimensions · A-03
              </p>
              <h3 className="mt-1 font-display text-[18px] font-medium tracking-[-0.02em]">
                Lembar ukuran rumah genset
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-paperink/20 px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-paperink/60">
                satuan cm
              </span>
              <DataPill tone="paper">skala 1:50</DataPill>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-paperink/15 bg-paperink/[0.035]">
                  <th className="w-8 px-4 py-2 font-mono-tech text-[8px] font-medium uppercase tracking-[0.1em] text-paperink/40">#</th>
                  <th className="px-2 py-2 font-mono-tech text-[8px] font-medium uppercase tracking-[0.1em] text-paperink/50">
                    Parameter
                  </th>
                  <th className="px-2 py-2 font-mono-tech text-[8px] font-medium uppercase tracking-[0.1em] text-paperink/40">
                    Before / eksisting
                  </th>
                  <th className="px-3 py-2 font-mono-tech text-[8px] font-medium uppercase tracking-[0.1em] text-paperink/80">
                    After / usulan
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.label} className="border-b border-paperink/[0.09] last:border-b-0 hover:bg-paperink/[0.035]">
                    <td className="px-4 py-2.5 align-top font-mono-tech text-[8px] text-paperink/35">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <span className="block text-[11px] font-medium leading-tight">{row.label}</span>
                      {row.note ? (
                        <span className="mt-0.5 block font-mono-tech text-[7px] uppercase tracking-[0.08em] text-paperink/35">
                          {row.note}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5 align-top font-mono-tech text-[9px] text-paperink/45">{row.before}</td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="inline-flex items-center gap-1.5 font-mono-tech text-[9px] font-medium text-paperink">
                        <span className="h-1 w-1 rounded-full bg-[#6d941f]" />
                        {row.after}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-paperink/15 px-4 py-3 sm:px-5">
            <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-paperink/40">
              verifikasi dimensi sebelum pelaksanaan
            </span>
            <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-paperink/40">
              rev 1.2 · 2026
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d1517] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-tech text-[9px] uppercase tracking-[0.12em] text-mist-2">Engineering check</p>
                <h3 className="mt-1 text-[13px] font-medium text-[#e5ece0]">Kelayakan ruang servis</h3>
              </div>
              <span className="rounded-full border border-lime/25 bg-lime/[0.08] px-2 py-1 font-mono-tech text-[9px] text-lime">
                {checks.filter((check) => check.status === "ok").length}/{checks.length} ok
              </span>
            </div>
            <div className="mt-3">
              {checks.map((check) => (
                <div key={check.label} className="border-t border-white/[0.06] py-2.5 first:border-t-0">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        check.status === "ok"
                          ? "border-lime/40 bg-lime/10 text-lime"
                          : "border-amber/40 bg-amber/10 text-amber"
                      )}
                    >
                      {check.status === "ok" ? <Check size={9} strokeWidth={3} /> : <TriangleAlert size={9} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10.5px] leading-tight text-[#c9d3c6]">{check.label}</span>
                        <span className="shrink-0 font-mono-tech text-[10px] text-[#e6eee1]">{check.value}</span>
                      </div>
                      <p className="mt-0.5 text-[9px] leading-snug text-mist-2">{check.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1517] p-4">
            <div className="flex items-center gap-2">
              <Info size={12} className="text-steel" />
              <h3 className="text-[12px] font-medium text-[#e5ece0]">Asumsi & catatan koordinasi</h3>
            </div>
            <div className="mt-2.5 space-y-2.5">
              {assumptions.map((assumption, index) => (
                <div key={assumption} className="flex gap-2.5">
                  <span className="mt-0.5 font-mono-tech text-[8px] text-mist-2">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-[10px] leading-relaxed text-mist">{assumption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Camera size={12} className="text-lime" />
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.12em] text-lime">Field notes</span>
            </div>
            <h3 className="mt-1 font-display text-[21px] font-medium tracking-[-0.02em] text-[#eef3e9]">
              Empat sisi yang jadi dasar konsep
            </h3>
          </div>
          <p className="max-w-sm text-[10px] leading-relaxed text-mist-2">
            Rekonstruksi kondisi lapangan dari dokumentasi survei: kanopi baja, panel genset hijau, drum B3,
            banner akses, dan tumpukan material.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {surveyNotes.map((note, index) => {
            const style = toneStyles[note.tone];
            return (
              <article
                key={note.code}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-[#0d1517] p-4 transition hover:-translate-y-0.5",
                  style.border
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1.5 font-mono-tech text-[9px] uppercase tracking-[0.1em]", style.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                    {note.side}
                  </span>
                  <span className="font-mono-tech text-[8px] text-mist-2">{note.code}</span>
                </div>
                <div className="relative mt-6 flex h-14 items-end gap-1 opacity-70">
                  {Array.from({ length: 9 }).map((_, bar) => (
                    <span
                      key={bar}
                      className={cn("flex-1 rounded-[1px]", style.bg)}
                      style={{ height: `${20 + ((bar * index * 13) % 36)}%` }}
                    />
                  ))}
                  <span className={cn("absolute inset-x-0 bottom-0 border-t border-dashed", style.border)} />
                </div>
                <h4 className="mt-4 text-[12px] font-medium leading-tight text-[#e2eadd]">{note.title}</h4>
                <p className="mt-1.5 text-[10px] leading-relaxed text-mist">{note.detail}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-white/10 px-1.5 py-0.5 font-mono-tech text-[7.5px] uppercase tracking-[0.05em] text-mist-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
