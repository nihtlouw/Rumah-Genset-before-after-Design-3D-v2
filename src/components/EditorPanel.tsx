import { useEffect, useState } from "react";
import { ArrowLeftRight, Move3d, PencilRuler, Ruler, TriangleAlert } from "lucide-react";
import { fmt, gensetClearance, type GensetUnit, type HouseConfig } from "@/data";
import { NumberField, ResetButton, ToggleRow } from "@/components/ui";
import { cn } from "@/utils/cn";

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4">
      <span className="font-mono-tech text-[9px] text-lime/70">{index}</span>
      <span className="h-px flex-1 bg-white/10" />
      <span className="font-mono-tech text-[9px] uppercase tracking-[0.12em] text-mist-2">{title}</span>
    </div>
  );
}

export default function EditorPanel({
  config,
  onChange,
  onChangeGenset,
  onReset,
}: {
  config: HouseConfig;
  onChange: (patch: Partial<HouseConfig>) => void;
  onChangeGenset: (id: string, patch: Partial<GensetUnit>) => void;
  onReset: () => void;
}) {
  const [activeUnit, setActiveUnit] = useState(config.gensets[0]?.id ?? "");
  const clearance = gensetClearance(config);
  const unit = config.gensets.find((item) => item.id === activeUnit) ?? config.gensets[0];

  useEffect(() => {
    if (!config.gensets.some((item) => item.id === activeUnit)) {
      setActiveUnit(config.gensets[0]?.id ?? "");
    }
  }, [config.gensets, activeUnit]);

  const patchUnit = (patch: Partial<GensetUnit>) => {
    if (!unit) return;
    onChangeGenset(unit.id, patch);
  };

  return (
    <div className="no-scrollbar max-h-[72vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1618]/90 xl:max-h-[calc(100vh-6.5rem)]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0e1618]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-lime/25 bg-lime/10 text-lime">
            <PencilRuler size={13} />
          </span>
          <div>
            <p className="text-[12px] font-medium text-[#e5ece1]">Edit ukuran</p>
            <p className="font-mono-tech text-[8px] uppercase tracking-[0.12em] text-mist-2">
              live · denah + model 3D
            </p>
          </div>
        </div>
        <ResetButton onClick={onReset} label="Default" />
      </div>

      <div className="px-4 pb-4">
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-black/25 px-3 py-2">
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist-2">
            {config.mode === "before" ? "Skenario eksisting" : "Skenario usulan"}
          </span>
          <span className="font-mono-tech text-[9px] text-lime">
            {fmt((config.buildW * config.buildD) / 10000, 2)} m²
          </span>
        </div>

        <SectionLabel index="01" title="Tapak & ruang" />
        <div className="mt-1">
          <NumberField
            label="Lebar tapak"
            value={config.siteW}
            min={config.buildW + config.offsetX}
            max={900}
            step={10}
            onChange={(value) =>
              onChange({
                siteW: value,
                buildW: Math.min(config.buildW, value - config.offsetX),
              })
            }
            hint="Batas lahan kerja yang disurvei."
          />
          <NumberField
            label="Kedalaman tapak"
            value={config.siteD}
            min={config.buildD}
            max={1000}
            step={10}
            onChange={(value) =>
              onChange({
                siteD: value,
                buildD: Math.min(config.buildD, value),
              })
            }
          />
          <NumberField
            label="Lebar bangunan"
            value={config.buildW}
            min={300}
            max={config.siteW - config.offsetX}
            step={10}
            onChange={(value) =>
              onChange({
                buildW: value,
                doorX: Math.min(config.doorX, Math.max(value - config.doorW, 0)),
              })
            }
            hint={`Lahan ${config.siteW} cm · offset kiri ${config.offsetX} cm`}
          />
          <NumberField
            label="Kedalaman bangunan"
            value={config.buildD}
            min={400}
            max={config.siteD}
            step={10}
            onChange={(value) => onChange({ buildD: value })}
          />
          <NumberField
            label="Tinggi kolom / eave"
            value={config.wallH}
            min={240}
            max={450}
            step={5}
            onChange={(value) => onChange({ wallH: value })}
          />
          <NumberField
            label="Rise atap"
            value={config.roofRise}
            min={50}
            max={220}
            step={5}
            onChange={(value) => onChange({ roofRise: value })}
            hint={`Tinggi ridge ≈ ${fmt(config.wallH + config.roofRise)} cm dari lantai`}
          />
          <NumberField
            label="Overstek atap"
            value={config.roofOverhang}
            min={0}
            max={120}
            step={5}
            onChange={(value) => onChange({ roofOverhang: value })}
          />
          <ToggleRow
            label="Selubung rumah genset"
            description="Tembok bawah + louver + pintu"
            checked={config.enclosed}
            onChange={(value) => onChange({ enclosed: value })}
          />
        </div>

        <SectionLabel index="02" title="Akses & pintu" />
        <div className="mt-1">
          <NumberField
            label="Lebar pintu"
            value={config.doorW}
            min={80}
            max={220}
            step={5}
            onChange={(value) =>
              onChange({
                doorW: value,
                doorX: Math.min(config.doorX, Math.max(config.buildW - value, 0)),
              })
            }
            hint={config.doorW < 90 ? "Di bawah rekomendasi 90 cm." : "Memenuhi lebar akses minimum."}
          />
          <NumberField
            label="Tinggi pintu"
            value={config.doorH}
            min={180}
            max={260}
            step={5}
            onChange={(value) => onChange({ doorH: value })}
          />
          <NumberField
            label="Geser pintu (dari kiri)"
            value={config.doorX}
            min={0}
            max={Math.max(config.buildW - config.doorW, 0)}
            step={5}
            onChange={(value) => onChange({ doorX: value })}
          />
        </div>

        <SectionLabel index="03" title="Genset & pondasi" />
        {config.gensets.length > 1 ? (
          <div className="mt-2 flex rounded-lg border border-white/10 bg-black/25 p-1">
            {config.gensets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveUnit(item.id)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.06em] transition",
                  unit?.id === item.id ? "bg-lime text-ink" : "text-mist-2 hover:text-white"
                )}
              >
                {item.kind === "new" ? "Baru" : "Existing"} · {item.code}
              </button>
            ))}
          </div>
        ) : null}
        {unit ? (
          <div className="mt-1">
            <NumberField
              label="Panjang unit genset"
              value={unit.w}
              min={100}
              max={config.buildW - 40}
              step={10}
              onChange={(value) =>
                patchUnit({
                  w: value,
                  foundationW: Math.max(unit.foundationW, value),
                })
              }
            />
            <NumberField
              label="Kedalaman unit genset"
              value={unit.d}
              min={80}
              max={config.buildD - 40}
              step={10}
              onChange={(value) =>
                patchUnit({
                  d: value,
                  foundationD: Math.max(unit.foundationD, value),
                })
              }
            />
            <NumberField
              label="Tinggi unit genset"
              value={unit.h}
              min={100}
              max={260}
              step={5}
              onChange={(value) => patchUnit({ h: value })}
            />
            <NumberField
              label="Panjang pondasi"
              value={unit.foundationW}
              min={unit.w}
              max={config.buildW}
              step={10}
              onChange={(value) => patchUnit({ foundationW: value })}
              hint="Minimal sama dengan panjang unit."
            />
            <NumberField
              label="Kedalaman pondasi"
              value={unit.foundationD}
              min={unit.d}
              max={config.buildD}
              step={10}
              onChange={(value) => patchUnit({ foundationD: value })}
            />
            <NumberField
              label="Tebal pondasi"
              value={unit.foundationH}
              min={10}
              max={50}
              step={5}
              onChange={(value) => patchUnit({ foundationH: value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Posisi X"
                value={unit.x}
                min={Math.round(unit.foundationW / 2)}
                max={Math.round(config.siteW - unit.foundationW / 2)}
                step={5}
                onChange={(value) => patchUnit({ x: value })}
              />
              <NumberField
                label="Posisi Z"
                value={unit.z}
                min={Math.round(unit.foundationD / 2)}
                max={Math.round(config.siteD - unit.foundationD / 2)}
                step={5}
                onChange={(value) => patchUnit({ z: value })}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2.5">
          <ArrowLeftRight size={12} className="mt-0.5 shrink-0 text-mist-2" />
          <div className="min-w-0">
            <p className="font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist-2">Jarak bersih genset</p>
            <p className={cn("mt-1 font-mono-tech text-[11px]", clearance !== null && clearance < 100 ? "text-amber" : "text-lime")}>
              {clearance === null ? "Satu zona — belum ada jarak antar-unit" : `${fmt(clearance)} cm`}
              {clearance !== null ? (
                <span className="ml-1.5 font-sans text-[10px] normal-case text-mist-2">
                  {clearance >= 100 ? "· memenuhi 100 cm" : "· tambah ruang servis"}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {clearance !== null && clearance < 100 ? (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber/20 bg-amber/[0.07] px-3 py-2">
            <TriangleAlert size={12} className="mt-0.5 shrink-0 text-amber" />
            <p className="text-[10px] leading-snug text-amber/90">
              Jarak pondasi di bawah 100 cm. Geser salah satu zona genset untuk membuka ruang servis.
            </p>
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.07] bg-black/25 px-2.5 py-2">
            <span className="flex items-center gap-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2">
              <Ruler size={9} /> ridge
            </span>
            <p className="mt-1 font-mono-tech text-[11px] text-[#dfe7dd]">{fmt(config.wallH + config.roofRise)} cm</p>
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-black/25 px-2.5 py-2">
            <span className="flex items-center gap-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2">
              <Move3d size={9} /> kolom
            </span>
            <p className="mt-1 font-mono-tech text-[11px] text-[#dfe7dd]">{config.enclosed ? 8 : 6} titik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
