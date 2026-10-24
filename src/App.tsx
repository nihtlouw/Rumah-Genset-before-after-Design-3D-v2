import { useState } from "react";
import {
  ArrowUp,
  Box,
  Camera,
  Check,
  ChevronRight,
  Download,
  DoorOpen,
  Info,
  Layers,
  Maximize2,
  MousePointerClick,
  Printer,
  Ruler,
  ShieldCheck,
  Wind,
  X,
  Zap,
} from "lucide-react";
import Header, { LogoMark } from "@/components/Header";
import Hero from "@/components/Hero";
import FloorPlan from "@/components/FloorPlan";
import ModelViewer from "@/components/ModelViewer";
import EditorPanel from "@/components/EditorPanel";
import CompareSection from "@/components/CompareSection";
import DataSection from "@/components/DataSection";
import { CheckLine, DataPill, GhostButton, ModeSwitch, SectionHead } from "@/components/ui";
import {
  cloneConfig,
  engineeringChecks,
  fmt,
  roofConcepts,
  type GensetUnit,
  type HouseConfig,
  type Mode,
} from "@/data";
import type { SelectionInfo } from "@/types";
import { cn } from "@/utils/cn";

function PlanZoningRow({
  index,
  icon,
  title,
  value,
  note,
  tone = "neutral",
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
  tone?: "neutral" | "lime" | "amber" | "steel";
}) {
  const iconTone = {
    neutral: "border-white/10 bg-white/[0.03] text-mist",
    lime: "border-lime/25 bg-lime/[0.07] text-lime",
    amber: "border-amber/25 bg-amber/[0.07] text-amber",
    steel: "border-steel/25 bg-steel/[0.07] text-steel",
  }[tone];
  return (
    <div className="flex gap-3 border-b border-white/[0.06] py-3 last:border-b-0">
      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", iconTone)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-tech text-[8px] text-mist-2">{index}</span>
            <p className="text-[11px] font-medium leading-tight text-[#dbe4d7]">{title}</p>
          </div>
          <span className="shrink-0 font-mono-tech text-[9px] text-[#c9d6c2]">{value}</span>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-mist-2">{note}</p>
      </div>
    </div>
  );
}

function RoofGlyph({ code, active }: { code: string; active: boolean }) {
  const stroke = active ? "#25322b" : "#728077";
  return (
    <svg viewBox="0 0 150 74" className="h-[70px] w-full" fill="none" stroke={stroke} strokeWidth="1.2">
      <line x1="8" y1="62" x2="142" y2="62" strokeDasharray="3 3" opacity="0.4" />
      {code === "A" ? (
        <>
          <path d="M24 60 L24 39 L108 39 L108 60" />
          <path d="M16 39 L66 16 L116 39" />
          <line x1="66" y1="16" x2="66" y2="39" strokeDasharray="2 2" />
          <rect x="76" y="48" width="18" height="12" />
          <line x1="32" y1="39" x2="32" y2="60" strokeWidth="2.4" />
          <line x1="100" y1="39" x2="100" y2="60" strokeWidth="2.4" />
        </>
      ) : null}
      {code === "B" ? (
        <>
          <path d="M31 60 L31 35 L105 35 L105 60" />
          <path d="M24 35 L64 15 L108 35" />
          <path d="M31 32 L12 32 L12 60 L31 60" />
          <line x1="12" y1="33" x2="31" y2="33" strokeWidth="2.4" />
          <rect x="64" y="47" width="18" height="13" />
          <line x1="31" y1="35" x2="31" y2="60" strokeWidth="2.4" />
        </>
      ) : null}
      {code === "C" ? (
        <>
          <path d="M29 60 L29 33 L108 33 L108 60" fill={active ? "rgba(198,247,92,0.16)" : "none"} />
          <path d="M22 33 L68 13 L114 33" fill={active ? "rgba(37,50,43,0.08)" : "none"} />
          <rect x="41" y="45" width="16" height="15" />
          {[0, 1, 2].map((line) => (
            <line key={line} x1="60" y1={39 + line * 3.5} x2="100" y2={39 + line * 3.5} opacity="0.7" />
          ))}
          {[0, 1, 2].map((line) => (
            <line key={`l-${line}`} x1="34" y1={39 + line * 3.5} x2="38" y2={39 + line * 3.5} opacity="0.7" />
          ))}
          <line x1="29" y1="33" x2="29" y2="60" strokeWidth="2.4" />
          <line x1="108" y1="33" x2="108" y2="60" strokeWidth="2.4" />
        </>
      ) : null}
    </svg>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode>("after");
  const [configs, setConfigs] = useState<Record<Mode, HouseConfig>>({
    before: cloneConfig("before"),
    after: cloneConfig("after"),
  });
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const config = configs[mode];

  const changeMode = (next: Mode) => {
    setMode(next);
    setSelection(null);
  };

  const normalize = (next: HouseConfig): HouseConfig => {
    const siteW = Math.max(next.siteW, next.buildW + next.offsetX);
    const buildW = Math.min(next.buildW, siteW - next.offsetX);
    const buildD = Math.min(next.buildD, next.siteD);
    const doorW = Math.min(next.doorW, buildW);
    const gensets = next.gensets.map((unit) => ({
      ...unit,
      x: Math.min(Math.max(unit.x, unit.foundationW / 2), siteW - unit.foundationW / 2),
      z: Math.min(Math.max(unit.z, unit.foundationD / 2), next.siteD - unit.foundationD / 2),
    }));
    return {
      ...next,
      siteW,
      buildW,
      buildD,
      doorW,
      doorX: Math.min(Math.max(next.doorX, 0), Math.max(buildW - doorW, 0)),
      gensets,
    };
  };

  const updateConfig = (patch: Partial<HouseConfig>) => {
    setConfigs((current) => ({
      ...current,
      [mode]: normalize({ ...current[mode], ...patch }),
    }));
  };

  const updateGenset = (id: string, patch: Partial<GensetUnit>) => {
    setConfigs((current) => ({
      ...current,
      [mode]: normalize({
        ...current[mode],
        gensets: current[mode].gensets.map((unit) => (unit.id === id ? { ...unit, ...patch } : unit)),
      }),
    }));
  };

  const resetConfig = () => {
    setConfigs((current) => ({ ...current, [mode]: cloneConfig(mode) }));
    setSelection(null);
  };

  const handleExport = () => {
    const payload = {
      project: "Rumah Genset — Gedung G",
      unit: "cm",
      exportedAt: new Date().toISOString(),
      configs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rumah-genset-gedung-g.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const handlePrint = () => window.print();
  const activeChecks = engineeringChecks(config);
  const planSelection = selection && selection.id !== "none" ? selection : null;

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-ink text-[#edf2ea]">
      <div className="relative z-[1]">
        <Header />
        <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <Hero configs={configs} />

          {/* ——— 01 / DENAH 2D ——— */}
          <section id="denah" className="section-anchor border-t border-white/[0.07] py-14 sm:py-16 lg:py-20">
            <SectionHead
              index="01"
              kicker="Konsep 2D · dasar sebelum 3D"
              title={
                <>
                  Denah lengkap,
                  <span className="block text-mist">ukuran yang bisa dibaca.</span>
                </>
              }
              description="Denah digambar lebih dulu dari sketsa survei: batas tapak, pagar, kolom, genset, pondasi, pintu, dan jalur utilitas. Klik elemen untuk melihat ukurannya, atau ganti lapisan gambar."
              action={
                <>
                  <ModeSwitch mode={mode} onChange={changeMode} />
                  <GhostButton onClick={handlePrint} icon={<Printer size={11} />}>
                    Cetak
                  </GhostButton>
                </>
              }
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.58fr)_minmax(310px,.58fr)]">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1517] shadow-[0_30px_80px_-50px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/[0.04] text-mist">
                      <Ruler size={11} />
                    </span>
                    <div>
                      <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">
                        Gambar denah · {mode === "before" ? "A-01" : "A-02"}
                      </p>
                      <p className="text-[11px] font-medium text-[#dfe7db]">
                        {mode === "before" ? "Eksisting — kanopi terbuka" : "Usulan — rumah genset terkurung"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DataPill tone="steel">{fmt(config.buildW)} × {fmt(config.buildD)} cm</DataPill>
                    <DataPill tone={config.enclosed ? "lime" : "amber"}>
                      {config.enclosed ? "enclosed" : "open canopy"}
                    </DataPill>
                  </div>
                </div>
                <div className="bg-paper text-paperink">
                  <FloorPlan
                    config={config}
                    selectedId={planSelection?.id}
                    onSelect={setSelection}
                  />
                </div>
                <div className="flex items-start gap-2.5 border-t border-white/[0.08] bg-[#0b1315] px-4 py-3">
                  <Info size={12} className="mt-0.5 shrink-0 text-amber" />
                  <p className="text-[9.5px] leading-relaxed text-mist-2">
                    <span className="font-mono-tech text-[8px] uppercase tracking-[0.08em] text-amber">Catatan dimensi · </span>
                    Sketsa survei mencatat 570 cm pada sisi bawah dan 150 + 450 cm pada sisi atas. Model
                    memakai 600 cm sebagai dimensi koordinasi; nilai 570 cm tetap dicatat sebagai referensi
                    eksisting.
                  </p>
                  <a
                    href="#data"
                    className="ml-auto hidden shrink-0 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-lime hover:underline sm:inline"
                  >
                    detail
                  </a>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#0d1517] p-4">
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                    <div>
                      <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">Zonasi & alur</p>
                      <p className="mt-0.5 text-[12px] font-medium text-[#e4ebe0]">Konsep ruang</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist">
                      {mode}
                    </span>
                  </div>
                  <PlanZoningRow
                    index="01"
                    icon={<Zap size={12} />}
                    title="Zona genset existing"
                    value={`${config.gensets[0]?.foundationW ?? 0} × ${config.gensets[0]?.foundationD ?? 0}`}
                    note={
                      mode === "before"
                        ? "Genset 120 × 470 cm berada di tengah kanopi, exhaust langsung ke atas."
                        : "Unit existing dipertahankan dan dirapikan pada pondasi 450 × 120 cm."
                    }
                    tone="lime"
                  />
                  <PlanZoningRow
                    index="02"
                    icon={<Box size={12} />}
                    title="Zona genset baru"
                    value={mode === "after" ? "500 × 150" : "rencana"}
                    note={
                      mode === "after"
                        ? "Pondasi beton 30 cm terpisah, memberi akses servis dari dua sisi."
                        : "Pada usulan, genset baru ditempatkan sejajar dengan unit existing."
                    }
                    tone="amber"
                  />
                  <PlanZoningRow
                    index="03"
                    icon={<DoorOpen size={12} />}
                    title="Akses & sirkulasi"
                    value={`${config.doorW} × ${config.doorH}`}
                    note={`Pintu digeser ${config.doorX} cm dari tepi kiri. Lebar akses minimum 90 cm.`}
                    tone="steel"
                  />
                  <PlanZoningRow
                    index="04"
                    icon={<Wind size={12} />}
                    title="Ventilasi & utilitas"
                    value={config.enclosed ? "louver" : "terbuka"}
                    note={
                      config.enclosed
                        ? "Louver silang pada tiga sisi, exhaust diarahkan melewati atap."
                        : "Area terbuka dengan exhaust existing; tarp biru menjadi penutup sementara."
                    }
                  />
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    planSelection ? "border-lime/25 bg-lime/[0.04]" : "border-white/10 bg-[#0d1517]"
                  )}
                >
                  {planSelection ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-lime">Detail elemen</p>
                          <h3 className="mt-1 text-[13px] font-medium text-[#edf4e8]">{planSelection.label}</h3>
                          <p className="mt-0.5 font-mono-tech text-[9px] text-mist-2">{planSelection.meta}</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Hapus pilihan"
                          onClick={() => setSelection(null)}
                          className="rounded-full p-1 text-mist-2 hover:bg-white/10 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      {planSelection.dims ? (
                        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
                          {planSelection.dims.slice(0, 4).map((dim) => (
                            <div key={dim.label} className="bg-[#0d1517] p-2.5">
                              <span className="block font-mono-tech text-[7.5px] uppercase tracking-[0.08em] text-mist-2">
                                {dim.label}
                              </span>
                              <span className="mt-1 block font-mono-tech text-[9.5px] text-[#dfe8da]">{dim.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-[10px] leading-relaxed text-mist">{planSelection.detail}</p>
                    </>
                  ) : (
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-mist">
                        <MousePointerClick size={14} />
                      </span>
                      <h3 className="mt-3 text-[12px] font-medium text-[#dfe7da]">Pilih elemen pada denah</h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-mist">
                        Klik genset, pondasi, kolom, atap, atau pintu untuk melihat detail dan ukurannya di sini.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0d1517] p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">Cek cepat</p>
                    <ShieldCheck size={12} className="text-mist-2" />
                  </div>
                  {activeChecks.slice(0, 3).map((check) => (
                    <CheckLine key={check.label} ok={check.status === "ok"}>
                      <span className="flex items-baseline justify-between gap-2">
                        <span>{check.label}</span>
                        <span className="font-mono-tech text-[9px] text-[#dce7d7]">{check.value}</span>
                      </span>
                    </CheckLine>
                  ))}
                  <a
                    href="#data"
                    className="mt-2 inline-flex items-center gap-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-lime hover:underline"
                  >
                    Lihat semua pemeriksaan <ChevronRight size={9} />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">Alternatif atap</p>
                  <h3 className="mt-1 text-[13px] font-medium text-[#e6ede2]">Konsep dari sketsa lapangan</h3>
                </div>
                <p className="max-w-sm text-[10px] leading-relaxed text-mist-2">
                  Tiga arah pengembangan: mempertahankan kanopi, menambah canopy samping, atau menutup penuh
                  dengan louver. Konsep C dipakai pada skenario after.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {roofConcepts.map((concept) => {
                  const selected = concept.code === "C" ? config.enclosed : concept.code === "A" ? !config.enclosed : false;
                  return (
                    <div
                      key={concept.code}
                      className={cn(
                        "relative overflow-hidden rounded-xl border p-3.5 transition",
                        selected
                          ? "border-lime/30 bg-lime/[0.045]"
                          : "border-white/10 bg-[#0d1517] hover:border-white/20"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono-tech text-[9px]", selected ? "text-lime" : "text-mist-2")}>
                            {concept.code}
                          </span>
                          <span className="h-px w-5 bg-white/15" />
                          <span className="text-[11px] font-medium text-[#dfe7da]">{concept.title}</span>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 font-mono-tech text-[7px] uppercase tracking-[0.06em]",
                            selected
                              ? "border-lime/30 bg-lime/10 text-lime"
                              : concept.status === "existing"
                                ? "border-white/10 text-mist-2"
                                : "border-white/10 text-mist-2"
                          )}
                        >
                          {selected ? "aktif" : concept.status}
                        </span>
                      </div>
                      <div className="mt-2 rounded-md border border-white/[0.06] bg-black/20 px-2 py-1">
                        <RoofGlyph code={concept.code} active={selected} />
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-mist">{concept.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ——— 02 / MODEL 3D ——— */}
          <section id="model" className="section-anchor relative border-t border-white/[0.07] py-14 sm:py-16 lg:py-20">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] tech-grid opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <SectionHead
              index="02"
              kicker="Model 3D · interaktif & terukur"
              title={
                <>
                  Lihat semua sisi.
                  <span className="block text-mist">Ubah, lalu ukur lagi.</span>
                </>
              }
              description="Model tiga dimensi mengikuti denah dan angka yang sama. Pilih POV untuk melihat fasad depan, belakang, kiri, kanan, atas, atau isometrik. Setiap elemen dapat diklik untuk detail ukurannya."
              action={
                <>
                  <ModeSwitch mode={mode} onChange={changeMode} />
                  <GhostButton onClick={handleExport} icon={<Download size={11} />}>
                    Ekspor JSON
                  </GhostButton>
                </>
              }
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex min-w-0 flex-col gap-4">
                <ModelViewer config={config} selection={selection} onSelect={setSelection} />
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      icon: <Maximize2 size={13} />,
                      title: "POV semua sisi",
                      note: "6 posisi kamera teranimasi: ISO, depan, belakang, kiri, kanan, dan atas.",
                    },
                    {
                      icon: <Ruler size={13} />,
                      title: "Ukuran nyata",
                      note: "Anotasi dalam sentimeter mengikuti tinggi eave, ridge, pondasi, pintu, dan clearance.",
                    },
                    {
                      icon: <Layers size={13} />,
                      title: "Before / after",
                      note: "Dua konfigurasi terpisah. Setiap perubahan tersimpan pada skenarionya.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-[#0d1517] p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-steel">
                          {item.icon}
                        </span>
                        <p className="text-[11px] font-medium text-[#dfe7da]">{item.title}</p>
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-mist-2">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
                <EditorPanel
                  config={config}
                  onChange={updateConfig}
                  onChangeGenset={updateGenset}
                  onReset={resetConfig}
                />
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.08] bg-[#0d1517] px-3 py-2.5">
                  <Info size={11} className="mt-0.5 shrink-0 text-mist-2" />
                  <p className="text-[9.5px] leading-relaxed text-mist-2">
                    Denah 2D dan model 3D memakai sumber angka yang sama. Perubahan lebar, kedalaman, atau
                    posisi genset langsung memperbarui keduanya.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-white/[0.08] bg-[#0b1214] px-4 py-3">
              <span className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">Legenda material</span>
              {[
                { color: "#3c7691", label: "Baja eksisting" },
                { color: "#31545a", label: "Struktur usulan" },
                { color: "#c6c4b3", label: "Dinding / selubung" },
                { color: "#4b7440", label: "Genset existing" },
                { color: "#47534c", label: "Genset baru" },
                { color: "#c6f75c", label: "Pondasi baru" },
              ].map((legend) => (
                <span key={legend.label} className="inline-flex items-center gap-1.5 text-[9px] text-mist">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: legend.color }} />
                  {legend.label}
                </span>
              ))}
              <span className="ml-auto hidden items-center gap-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2 md:inline-flex">
                <Check size={9} className="text-lime" /> sinkron dengan denah 2D
              </span>
            </div>
          </section>

          <CompareSection
            before={configs.before}
            after={configs.after}
            onGoModel={() => document.getElementById("model")?.scrollIntoView({ behavior: "smooth" })}
            onGoMode={(next) => {
              changeMode(next);
              document.getElementById("model")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <DataSection
            before={configs.before}
            after={configs.after}
            onExport={handleExport}
            onPrint={handlePrint}
          />

          <section className="no-print pb-16">
            <div className="relative overflow-hidden rounded-2xl border border-lime/25 bg-lime px-5 py-6 text-ink sm:px-8 sm:py-7">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-ink/10" />
              <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full border border-ink/10" />
              <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-ink/55">Langkah berikutnya</p>
                  <h2 className="mt-2 max-w-xl font-display text-[25px] font-medium leading-tight tracking-[-0.03em] sm:text-[30px]">
                    Sudah lihat semua sisinya? Sekarang sesuaikan ukurannya.
                  </h2>
                  <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-ink/65">
                    Buka editor, ubah panjang genset atau lebar pintu, lalu bandingkan kembali skenario before
                    dan after. Data dapat diekspor sebagai JSON untuk koordinasi.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("model")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-[#eef5e9] transition hover:bg-[#152220]"
                  >
                    <Ruler size={11} /> Edit ukuran
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-4 py-2.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-ink transition hover:bg-ink/10"
                  >
                    <Download size={11} /> Unduh data
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/[0.08] bg-[#080e0f]">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
            <div className="grid gap-8 md:grid-cols-[1.4fr_.8fr_.8fr]">
              <div>
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <div>
                    <p className="font-display text-[13px] font-semibold tracking-[0.08em] text-[#eef4e7]">RUMAH GENSET</p>
                    <p className="mt-0.5 font-mono-tech text-[8px] uppercase tracking-[0.18em] text-mist-2">
                      design studio · gedung g
                    </p>
                  </div>
                </div>
                <p className="mt-4 max-w-sm text-[11px] leading-relaxed text-mist">
                  Konsep desain berbasis survei lapangan: denah 2D terukur, model 3D interaktif, skenario
                  before–after, dan lembar data yang bisa diedit.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <DataPill tone="lime">2 skenario</DataPill>
                  <DataPill tone="steel">6 POV</DataPill>
                  <DataPill>ukuran cm</DataPill>
                </div>
              </div>
              <div>
                <p className="font-mono-tech text-[8px] uppercase tracking-[0.14em] text-mist-2">Navigasi</p>
                <div className="mt-3 grid grid-cols-2 gap-y-2">
                  {[
                    { href: "#ringkasan", label: "Ringkasan" },
                    { href: "#denah", label: "Denah 2D" },
                    { href: "#model", label: "Model 3D" },
                    { href: "#banding", label: "Before–After" },
                    { href: "#data", label: "Data & ukuran" },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-[10px] text-mist transition hover:text-lime"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono-tech text-[8px] uppercase tracking-[0.14em] text-mist-2">Sumber data</p>
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-1.5 text-[10px] text-mist">
                    <Camera size={10} className="text-mist-2" /> 4 foto sisi lapangan
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] text-mist">
                    <Layers size={10} className="text-mist-2" /> 2 sketsa denah before / after
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] text-mist">
                    <Info size={10} className="text-mist-2" /> verifikasi dimensi di lapangan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2 transition hover:border-lime/40 hover:text-lime"
                >
                  <ArrowUp size={10} /> kembali ke atas
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
              <p className="font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2">
                © 2026 Rumah Genset Studio · konsep v1.2
              </p>
              <p className="font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2">
                gambar skematik — bukan pengganti gambar kerja / perhitungan struktur
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
