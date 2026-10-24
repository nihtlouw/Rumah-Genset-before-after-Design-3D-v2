import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Layers,
  Minus,
  Plus,
  Ruler,
  Scan,
  Zap,
} from "lucide-react";
import type { HouseConfig } from "@/data";
import { fmt, gensetClearance } from "@/data";
import { getColumns, getGensetSelection, type SelectionInfo } from "@/types";
import { cn } from "@/utils/cn";

const VIEW_W = 1000;
const VIEW_H = 760;
const INK = "#26312b";
const MUTED = "#778074";
const DIM = "#8b9385";
const PAPER = "#ecece2";
const ACCENT = "#5d7d1c";
const AMBER = "#a8612b";
const STEEL = "#2f6f80";
const GREEN = "#4f7444";

interface PlanProps {
  config: HouseConfig;
  selectedId?: string;
  onSelect: (selection: SelectionInfo | null) => void;
  compact?: boolean;
}

type LayerKey = "dimensi" | "struktur" | "genset" | "utilitas";

const layerMeta: { key: LayerKey; label: string; icon: ReactNode }[] = [
  { key: "dimensi", label: "Ukuran", icon: <Ruler size={11} /> },
  { key: "struktur", label: "Struktur", icon: <Layers size={11} /> },
  { key: "genset", label: "Genset", icon: <Zap size={11} /> },
  { key: "utilitas", label: "Utilitas", icon: <ArrowUpRight size={11} /> },
];

function DimLabel({
  x,
  y,
  label,
  color = INK,
  vertical = false,
}: {
  x: number;
  y: number;
  label: string;
  color?: string;
  vertical?: boolean;
}) {
  const w = label.length * 5.6 + 12;
  return (
    <g transform={`translate(${x} ${y})${vertical ? " rotate(-90)" : ""}`}>
      <rect x={-w / 2} y={-8} width={w} height={16} rx={2.5} fill={PAPER} stroke={color} strokeOpacity={0.22} />
      <text
        textAnchor="middle"
        y={3.6}
        fill={color}
        fontSize={9.5}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={500}
        letterSpacing={0.3}
      >
        {label}
      </text>
    </g>
  );
}

function HDim({
  x1,
  x2,
  y,
  label,
  color = DIM,
  ext = true,
  extFrom,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  color?: string;
  ext?: boolean;
  extFrom?: number;
}) {
  return (
    <g>
      {ext && extFrom !== undefined ? (
        <>
          <line x1={x1} y1={extFrom} x2={x1} y2={y + 4} stroke={color} strokeWidth={0.6} strokeDasharray="2 2" />
          <line x1={x2} y1={extFrom} x2={x2} y2={y + 4} stroke={color} strokeWidth={0.6} strokeDasharray="2 2" />
        </>
      ) : null}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={0.8} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <DimLabel x={(x1 + x2) / 2} y={y} label={label} color={color === DIM ? INK : color} />
    </g>
  );
}

function VDim({
  y1,
  y2,
  x,
  label,
  color = DIM,
  ext = true,
  extFrom,
}: {
  y1: number;
  y2: number;
  x: number;
  label: string;
  color?: string;
  ext?: boolean;
  extFrom?: number;
}) {
  return (
    <g>
      {ext && extFrom !== undefined ? (
        <>
          <line x1={extFrom} y1={y1} x2={x - 4} y2={y1} stroke={color} strokeWidth={0.6} strokeDasharray="2 2" />
          <line x1={extFrom} y1={y2} x2={x - 4} y2={y2} stroke={color} strokeWidth={0.6} strokeDasharray="2 2" />
        </>
      ) : null}
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={0.8} />
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} stroke={color} strokeWidth={0.8} />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} stroke={color} strokeWidth={0.8} />
      <DimLabel x={x} y={(y1 + y2) / 2} label={label} color={color === DIM ? INK : color} vertical />
    </g>
  );
}

export default function FloorPlan({ config, selectedId, onSelect, compact = false }: PlanProps) {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    dimensi: true,
    struktur: true,
    genset: true,
    utilitas: true,
  });
  const [zoom, setZoom] = useState(1);

  const scale = Math.min((VIEW_W - 250) / config.siteW, (VIEW_H - 185) / config.siteD);
  const planW = config.siteW * scale;
  const planH = config.siteD * scale;
  const ox = (VIEW_W - planW) / 2;
  const oy = 86;
  const X = (value: number) => ox + value * scale;
  const Y = (value: number) => oy + value * scale;
  const S = (value: number) => value * scale;

  const buildX = X(config.offsetX);
  const buildY = Y(config.offsetZ);
  const buildW = S(config.buildW);
  const buildD = S(config.buildD);
  const columns = getColumns(config);
  const clearance = gensetClearance(config);
  const over = S(config.roofOverhang);
  const dims = layers.dimensi;
  const structure = layers.struktur;
  const showGenset = layers.genset;
  const utilities = layers.utilitas;

  const select = (selection: SelectionInfo) => (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(selection);
  };

  const toggleLayer = (key: LayerKey) =>
    setLayers((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="w-full">
      {!compact ? (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-paperink/10 px-4 py-3 sm:px-5">
          <span className="mr-1 hidden font-mono-tech text-[9px] uppercase tracking-[0.14em] text-paperink/45 sm:inline">
            Lapisan
          </span>
          {layerMeta.map((layer) => (
            <button
              key={layer.key}
              type="button"
              onClick={() => toggleLayer(layer.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] transition",
                layers[layer.key]
                  ? "border-paperink/20 bg-paperink text-paper"
                  : "border-paperink/15 bg-transparent text-paperink/45 hover:border-paperink/30"
              )}
            >
              {layer.icon}
              {layer.label}
            </button>
          ))}
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="font-mono-tech text-[9px] uppercase tracking-[0.1em] text-paperink/45">
              Skala tampilan
            </span>
            <div className="flex items-center gap-1 rounded-full border border-paperink/15 px-1">
              <button
                type="button"
                aria-label="Perkecil denah"
                onClick={() => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))))}
                className="rounded-full p-1.5 text-paperink/60 transition hover:bg-paperink/10 hover:text-paperink"
              >
                <Minus size={11} />
              </button>
              <span className="w-9 text-center font-mono-tech text-[9px] text-paperink/70">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Perbesar denah"
                onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.15).toFixed(2))))}
                className="rounded-full p-1.5 text-paperink/60 transition hover:bg-paperink/10 hover:text-paperink"
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                aria-label="Reset zoom"
                onClick={() => setZoom(1)}
                className="rounded-full p-1.5 text-paperink/60 transition hover:bg-paperink/10 hover:text-paperink"
              >
                <Scan size={11} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden">
        {!compact ? (
          <div className="pointer-events-none absolute left-4 top-3 z-10 sm:left-6 sm:top-4">
            <p className="label-xs text-paperink/40">Drawing / {config.mode === "before" ? "A-01" : "A-02"}</p>
            <p className="mt-1 font-display text-[13px] font-medium tracking-tight text-paperink">
              Denah {config.mode === "before" ? "eksisting" : "usulan"} · skala 1:50
            </p>
          </div>
        ) : null}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`Denah rumah genset ${config.mode}`}
          className="block h-auto w-full"
          onClick={() => onSelect(null)}
        >
          <defs>
            <pattern id="plan-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#26312b" opacity="0.16" />
            </pattern>
            <pattern id="plan-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1" opacity="0.5" />
            </pattern>
            <pattern id="plan-fence" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.1" opacity="0.42" />
            </pattern>
            <pattern id="plan-louver" width="5" height="5" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2.5" x2="5" y2="2.5" stroke={INK} strokeWidth="0.8" opacity="0.45" />
            </pattern>
            <marker id="plan-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill={STEEL} />
            </marker>
          </defs>

          <g transform={`translate(${(1 - zoom) * (VIEW_W / 2)} ${(1 - zoom) * (VIEW_H / 2)}) scale(${zoom})`}>
            <rect x="14" y="14" width={VIEW_W - 28} height={VIEW_H - 28} fill="none" stroke={INK} strokeOpacity="0.14" />
            <text x="26" y={VIEW_H - 24} fill={INK} opacity="0.4" fontSize="9" fontFamily="JetBrains Mono, monospace">
              RUMAH GENSET / GEDUNG G · SURVEY → KONSEP 2D
            </text>

            {/* site */}
            <rect x={X(0)} y={Y(0)} width={planW} height={planH} fill="url(#plan-dots)" stroke={INK} strokeWidth="1.1" />
            <rect x={X(0)} y={Y(0)} width={planW} height={planH} fill="#ffffff" opacity="0.22" />

            {/* fence / pagar */}
            {config.fenceEdge === "left" ? (
              <g onClick={select({
                id: "fence",
                label: "Pagar eksisting",
                meta: "Batas site · sisi kiri",
                tone: "paper",
                detail: "Pagar existing berada 150 cm dari dinding bangunan. Pada skenario after, pagar dipindahkan ke batas belakang agar area servis lebih lega.",
                dims: [
                  { label: "Lebar strip", value: `${fmt(config.offsetX)} cm` },
                  { label: "Tinggi pagar", value: `${fmt(config.fenceHeight)} cm` },
                ],
              })} className="cursor-pointer">
                <rect x={X(0)} y={Y(0)} width={S(config.offsetX)} height={planH} fill="url(#plan-fence)" stroke={INK} strokeWidth="1" />
                <line x1={X(config.offsetX)} y1={Y(0)} x2={X(config.offsetX)} y2={Y(config.siteD)} stroke={INK} strokeWidth="1.5" />
                <text
                  x={X(config.offsetX / 2)}
                  y={Y(config.siteD / 2)}
                  textAnchor="middle"
                  transform={`rotate(-90 ${X(config.offsetX / 2)} ${Y(config.siteD / 2)})`}
                  fill={INK}
                  opacity="0.62"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="1.6"
                >
                  PAGAR / {config.offsetX} CM
                </text>
              </g>
            ) : null}
            {config.fenceEdge === "back" ? (
              <g onClick={select({
                id: "fence-back",
                label: "Pagar dipindah",
                meta: "Batas site · sisi belakang",
                tone: "paper",
                detail: "Pagar 600 cm dipindahkan ke batas belakang. Area bekas pagar lama dipakai untuk perluasan bangunan dan manuver servis.",
                dims: [{ label: "Panjang pagar", value: `${fmt(config.siteW)} cm` }],
              })} className="cursor-pointer">
                <rect x={X(0)} y={Y(0) - 9} width={planW} height="9" fill="url(#plan-fence)" stroke={INK} strokeWidth="0.9" />
                <text x={X(0) + 8} y={Y(0) - 15} fill={INK} opacity="0.7" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                  PAGAR DIPINDAH ± {fmt(config.siteW)} CM
                </text>
              </g>
            ) : null}

            {/* roof overhang */}
            {structure ? (
              <g
                className="cursor-pointer"
                onClick={select({
                  id: "roof",
                  label: "Atap pelana",
                  meta: `Struktur atap · rise ${fmt(config.roofRise)} cm`,
                  tone: "steel",
                  detail: "Atap pelana dengan rangka baja dan penutup metal bergelombang. Overstek menjaga dinding dan pintu dari tampias hujan.",
                  dims: [
                    { label: "Bentang", value: `${fmt(config.buildW)} cm` },
                    { label: "Kemiringan (rise)", value: `${fmt(config.roofRise)} cm` },
                    { label: "Overstek", value: `${fmt(config.roofOverhang)} cm` },
                  ],
                })}
              >
                <rect
                  x={X(config.offsetX) - over}
                  y={Y(config.offsetZ) - over}
                  width={buildW + over * 2}
                  height={buildD + over * 2}
                  fill="none"
                  stroke={STEEL}
                  strokeWidth="1"
                  strokeDasharray="6 4"
                  opacity={selectedId === "roof" ? 1 : 0.7}
                />
                <line
                  x1={X(config.offsetX + config.buildW / 2)}
                  y1={Y(config.offsetZ) - over}
                  x2={X(config.offsetX + config.buildW / 2)}
                  y2={Y(config.offsetZ + config.buildD) + over}
                  stroke={STEEL}
                  strokeWidth="0.8"
                  strokeDasharray="10 3 2 3"
                  opacity="0.6"
                />
                <text
                  x={X(config.offsetX + config.buildW / 2) + 5}
                  y={Y(config.offsetZ) - over - 5}
                  fill={STEEL}
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.6"
                >
                  GARIS ATAP · OVERSTEK {config.roofOverhang}
                </text>
              </g>
            ) : null}

            {/* slab / footprint */}
            <rect x={buildX} y={buildY} width={buildW} height={buildD} fill="#f7f7ef" fillOpacity="0.42" stroke={INK} strokeWidth="2.2" />

            {/* interior grid */}
            <g opacity="0.14">
              <line x1={buildX} y1={buildY + buildD / 2} x2={buildX + buildW} y2={buildY + buildD / 2} stroke={INK} strokeDasharray="8 3 2 3" />
              <line x1={buildX + buildW / 2} y1={buildY} x2={buildX + buildW / 2} y2={buildY + buildD} stroke={INK} strokeDasharray="8 3 2 3" />
            </g>

            {/* walls / louver - after */}
            {config.enclosed ? (
              <g>
                <rect x={buildX} y={buildY} width={buildW} height="7" fill={INK} fillOpacity="0.8" />
                <rect x={buildX} y={buildY} width="7" height={buildD} fill={INK} fillOpacity="0.8" />
                <rect x={buildX + buildW - 7} y={buildY} width="7" height={buildD} fill={INK} fillOpacity="0.8" />
                <rect x={buildX} y={buildY} width={S(150)} height="12" fill="url(#plan-louver)" stroke={INK} strokeWidth="0.7" />
                <rect x={buildX + buildW - S(150)} y={buildY} width={S(150)} height="12" fill="url(#plan-louver)" stroke={INK} strokeWidth="0.7" />
                <text x={buildX + S(155)} y={buildY + 21} fill={INK} opacity="0.6" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                  LOUVER VENTILASI
                </text>
              </g>
            ) : null}

            {/* columns */}
            {structure
              ? columns.map((column) => (
                  <g
                    key={column.id}
                    className="cursor-pointer"
                    onClick={select({
                      id: "columns",
                      label: "Kolom baja",
                      meta: `${columns.length} titik kolom · ${fmt(20)} × ${fmt(20)} cm`,
                      tone: "steel",
                      detail: "Kolom baja existing dipertahankan dan diperkuat. Pondasi tapak dicek ulang sebelum penambahan beban atap dan selubung.",
                      dims: [
                        { label: "Dimensi kolom", value: "20 × 20 cm" },
                        { label: "Tinggi eave", value: `${fmt(config.wallH)} cm` },
                        { label: "Jumlah", value: `${columns.length} titik` },
                      ],
                    })}
                  >
                    <rect
                      x={X(column.x) - Math.max(7, S(10))}
                      y={Y(column.z) - Math.max(7, S(10))}
                      width={Math.max(14, S(20))}
                      height={Math.max(14, S(20))}
                      fill={selectedId === "columns" ? ACCENT : "url(#plan-hatch)"}
                      stroke={INK}
                      strokeWidth="1.1"
                    />
                  </g>
                ))
              : null}

            {/* structural beams (before open canopy) */}
            {!config.enclosed && structure ? (
              <g stroke={STEEL} strokeWidth="0.8" opacity="0.5">
                <polyline
                  points={`${X(config.offsetX)},${Y(config.offsetZ + config.buildD / 2)} ${X(config.offsetX + config.buildW)},${Y(config.offsetZ + config.buildD / 2)}`}
                  fill="none"
                  strokeDasharray="3 4"
                />
                <polyline points={`${buildX + 8},${buildY + 8} ${buildX + buildW / 2},${buildY + buildD / 2} ${buildX + buildW - 8},${buildY + 8}`} fill="none" strokeDasharray="3 4" />
                <polyline points={`${buildX + 8},${buildY + buildD - 8} ${buildX + buildW / 2},${buildY + buildD / 2} ${buildX + buildW - 8},${buildY + buildD - 8}`} fill="none" strokeDasharray="3 4" />
              </g>
            ) : null}

            {/* gensets */}
            {showGenset
              ? config.gensets.map((unit) => {
                  const foundationX = X(unit.x - unit.foundationW / 2);
                  const foundationY = Y(unit.z - unit.foundationD / 2);
                  const foundationW = S(unit.foundationW);
                  const foundationD = S(unit.foundationD);
                  const unitX = X(unit.x - unit.w / 2);
                  const unitY = Y(unit.z - unit.d / 2);
                  const unitW = S(unit.w);
                  const unitD = S(unit.d);
                  const isNew = unit.kind === "new";
                  const isSelected = selectedId === unit.id;
                  return (
                    <g key={unit.id} className="cursor-pointer" onClick={select(getGensetSelection(config, unit.id)!)}>
                      <rect
                        x={foundationX}
                        y={foundationY}
                        width={foundationW}
                        height={foundationD}
                        fill={isNew ? "#d9b47a" : "#c6c9b7"}
                        fillOpacity="0.35"
                        stroke={isNew ? AMBER : MUTED}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={isSelected ? "none" : "4 3"}
                      />
                      <rect
                        x={unitX}
                        y={unitY}
                        width={unitW}
                        height={unitD}
                        fill={unit.color === "green" ? GREEN : "#46504a"}
                        stroke={isSelected ? "#0c1512" : INK}
                        strokeWidth={isSelected ? 2.2 : 1}
                        rx="1.5"
                      />
                      <g opacity="0.5" stroke="#e9efdf" strokeWidth="0.7">
                        {Array.from({ length: Math.max(3, Math.round(unitW / 18)) }).map((_, index) => (
                          <line
                            key={index}
                            x1={unitX + 5 + index * Math.max(6, (unitW - 10) / Math.max(3, Math.round(unitW / 18)))}
                            y1={unitY + 4}
                            x2={unitX + 5 + index * Math.max(6, (unitW - 10) / Math.max(3, Math.round(unitW / 18)))}
                            y2={unitY + unitD - 4}
                          />
                        ))}
                      </g>
                      <rect
                        x={unitX + unitW - Math.min(unitW * 0.32, 16) - 3}
                        y={unitY + 4}
                        width={Math.min(unitW * 0.32, 16)}
                        height={Math.max(8, Math.min(unitD * 0.28, 18))}
                        fill="#e6ecdf"
                        opacity="0.85"
                      />
                      <circle cx={unitX + 8} cy={unitY + unitD - 8} r="2.8" fill="#f0a05a" stroke={INK} strokeWidth="0.6" />
                      <text
                        x={unitX + unitW / 2}
                        y={unitY + unitD / 2 + 2}
                        textAnchor="middle"
                        transform={
                          unitD > unitW * 1.7
                            ? `rotate(-90 ${unitX + unitW / 2} ${unitY + unitD / 2})`
                            : undefined
                        }
                        fill="#f2f5e9"
                        fontSize="8"
                        fontFamily="JetBrains Mono, monospace"
                        letterSpacing="0.4"
                      >
                        {unit.code} · {unit.w}×{unit.d}
                      </text>
                      <text
                        x={unitX + unitW / 2}
                        y={unitY - 5}
                        textAnchor="middle"
                        fill={isNew ? AMBER : INK}
                        fontSize="8"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                      >
                        {isNew ? "GENSET BARU" : "EXISTING"}
                      </text>
                    </g>
                  );
                })
              : null}

            {/* door + swing */}
            <g
              className="cursor-pointer"
              onClick={select({
                id: "door",
                label: "Pintu akses",
                meta: `Daun tunggal · ${config.doorW} × ${config.doorH} cm`,
                tone: "amber",
                detail: config.mode === "after"
                  ? "Pintu akses ditempatkan di fasad depan agar jalur perawatan tidak memotong zona genset."
                  : "Bukaan akses eksisting menjadi acuan posisi pintu baru. Lebar 120 cm memungkinkan peralatan kecil masuk.",
                dims: [
                  { label: "Lebar", value: `${fmt(config.doorW)} cm` },
                  { label: "Tinggi", value: `${fmt(config.doorH)} cm` },
                  { label: "Posisi dari kiri", value: `${fmt(config.doorX)} cm` },
                ],
              })}
            >
              <rect x={X(config.offsetX + config.doorX)} y={Y(config.offsetZ + config.buildD) - 5} width={S(config.doorW)} height="10" fill={PAPER} stroke="none" />
              <line x1={X(config.offsetX + config.doorX)} y1={Y(config.offsetZ + config.buildD)} x2={X(config.offsetX + config.doorX)} y2={Y(config.offsetZ + config.buildD) - 4} stroke={AMBER} strokeWidth="3" />
              <line x1={X(config.offsetX + config.doorX + config.doorW)} y1={Y(config.offsetZ + config.buildD)} x2={X(config.offsetX + config.doorX + config.doorW)} y2={Y(config.offsetZ + config.buildD) - 4} stroke={AMBER} strokeWidth="3" />
              <line x1={X(config.offsetX + config.doorX)} y1={Y(config.offsetZ + config.buildD)} x2={X(config.offsetX + config.doorX + config.doorW)} y2={Y(config.offsetZ + config.buildD)} stroke={AMBER} strokeWidth="2" />
              <path
                d={`M ${X(config.offsetX + config.doorX)} ${Y(config.offsetZ + config.buildD)} A ${S(config.doorW)} ${S(config.doorW)} 0 0 0 ${X(config.offsetX + config.doorX + config.doorW)} ${Y(config.offsetZ + config.buildD) - S(config.doorW)}`}
                fill="none"
                stroke={AMBER}
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text
                x={X(config.offsetX + config.doorX + config.doorW / 2)}
                y={Y(config.offsetZ + config.buildD) + 14}
                textAnchor="middle"
                fill={AMBER}
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                PINTU {config.doorW}
              </text>
            </g>

            {/* utilities */}
            {utilities ? (
              <g pointerEvents="none">
                {config.gensets.map((unit) => (
                  <g key={`util-${unit.id}`}>
                    <line
                      x1={X(unit.x)}
                      y1={Y(unit.z)}
                      x2={X(unit.x)}
                      y2={Y(config.offsetZ) + 14}
                      stroke={STEEL}
                      strokeWidth="1"
                      strokeDasharray="5 4"
                      markerEnd="url(#plan-arrow)"
                      opacity="0.8"
                    />
                    <circle cx={X(unit.x)} cy={Y(unit.z)} r="3" fill={STEEL} />
                  </g>
                ))}
                <text x={X(config.gensets[0]?.x ?? config.offsetX + 50) + 7} y={Y(config.offsetZ) + 28} fill={STEEL} fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                  JALUR EXHAUST → ATAS
                </text>
                {config.mode === "after" ? (
                  <g>
                    <polyline
                      points={`${buildX + 16},${buildY + buildD / 2} ${buildX + 16},${buildY + buildD - 30} ${buildX + buildW - 16},${buildY + buildD - 30}`}
                      fill="none"
                      stroke={AMBER}
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />
                    <text x={buildX + 20} y={buildY + buildD - 35} fill={AMBER} fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                      CABLE TRAY
                    </text>
                    <g stroke={STEEL} strokeWidth="0.9" opacity="0.8">
                      <line x1={buildX + 4} y1={buildY + S(90)} x2={buildX + 22} y2={buildY + S(90)} markerEnd="url(#plan-arrow)" />
                      <line x1={buildX + 4} y1={buildY + S(260)} x2={buildX + 22} y2={buildY + S(260)} markerEnd="url(#plan-arrow)" />
                      <line x1={buildX + buildW - 4} y1={buildY + S(120)} x2={buildX + buildW - 22} y2={buildY + S(120)} markerEnd="url(#plan-arrow)" />
                      <line x1={buildX + buildW - 4} y1={buildY + S(290)} x2={buildX + buildW - 22} y2={buildY + S(290)} markerEnd="url(#plan-arrow)" />
                    </g>
                    <text x={buildX + 24} y={buildY + S(86)} fill={STEEL} fontSize="7" fontFamily="JetBrains Mono, monospace">
                      INLET
                    </text>
                  </g>
                ) : null}
              </g>
            ) : null}

            {/* dimension annotations */}
            {dims ? (
              <g pointerEvents="none">
                <VDim y1={Y(0)} y2={Y(config.siteD)} x={X(0) - 46} label={`${fmt(config.siteD)} cm`} extFrom={X(0)} />
                <VDim
                  y1={Y(config.offsetZ)}
                  y2={Y(config.offsetZ + config.buildD)}
                  x={X(config.siteW) + 42}
                  label={`${fmt(config.buildD)} cm`}
                  extFrom={X(config.siteW)}
                />
                <HDim x1={X(0)} x2={X(config.siteW)} y={Y(0) - 44} label={`${fmt(config.siteW)} cm`} extFrom={Y(0)} />
                <HDim
                  x1={X(config.offsetX)}
                  x2={X(config.offsetX + config.buildW)}
                  y={Y(config.siteD) + 44}
                  label={`${fmt(config.buildW)} cm`}
                  extFrom={Y(config.siteD)}
                />

                {config.mode === "before" ? (
                  <>
                    <HDim x1={X(0)} x2={X(config.offsetX)} y={Y(0) - 18} label="150" extFrom={Y(0) - 30} ext={false} />
                    <HDim x1={X(config.offsetX)} x2={X(config.offsetX + config.buildW)} y={Y(0) - 18} label="450" extFrom={Y(0) - 30} ext={false} />
                    <text x={X(config.siteW) - 130} y={Y(config.siteD) + 74} fill={MUTED} fontSize="8" fontFamily="JetBrains Mono, monospace">
                      REF. LAPANGAN: 570 CM
                    </text>
                  </>
                ) : (
                  <>
                    <text x={X(config.siteW) - 8} y={Y(0) - 16} textAnchor="end" fill={MUTED} fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                      REKOMENDASI KOORDINASI 600 CM
                    </text>
                    <text x={buildX + 8} y={buildY + buildD + 20} fill={MUTED} fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                      FONDASI EXISTING {config.gensets[0]?.foundationW ?? 450} × {config.gensets[0]?.foundationD ?? 120} CM
                    </text>
                  </>
                )}

                {config.gensets.map((unit) => (
                  <g key={`dim-${unit.id}`}>
                    <HDim
                      x1={X(unit.x - unit.foundationW / 2)}
                      x2={X(unit.x + unit.foundationW / 2)}
                      y={Y(unit.z - unit.foundationD / 2) - 15}
                      label={`${fmt(unit.foundationW)}`}
                      color={unit.kind === "new" ? AMBER : DIM}
                    />
                    <VDim
                      y1={Y(unit.z - unit.foundationD / 2)}
                      y2={Y(unit.z + unit.foundationD / 2)}
                      x={X(unit.x + unit.foundationW / 2) + 16}
                      label={`${fmt(unit.foundationD)}`}
                      color={unit.kind === "new" ? AMBER : DIM}
                    />
                  </g>
                ))}

                {clearance !== null ? (() => {
                  const sorted = [...config.gensets].sort((a, b) => a.z - b.z);
                  const gapStart = sorted[0].z + sorted[0].foundationD / 2;
                  const gapEnd = sorted[1].z - sorted[1].foundationD / 2;
                  return (
                    <VDim
                      y1={Y(gapStart)}
                      y2={Y(gapEnd)}
                      x={X(config.offsetX + config.buildW) - 24}
                      label={`${fmt(clearance)} clear`}
                      color={AMBER}
                      ext={false}
                    />
                  );
                })() : null}
              </g>
            ) : null}

            {/* north + scale bar */}
            <g transform={`translate(${VIEW_W - 88} ${VIEW_H - 104})`} pointerEvents="none">
              <circle r="19" fill="none" stroke={INK} strokeOpacity="0.25" />
              <path d="M0 -15 L5 7 L0 3 L-5 7 Z" fill={INK} />
              <text y="-24" textAnchor="middle" fill={INK} fontSize="9" fontFamily="JetBrains Mono, monospace">
                N
              </text>
            </g>
            <g transform={`translate(${VIEW_W - 216} ${VIEW_H - 48})`} pointerEvents="none">
              <line x1="0" y1="0" x2="46" y2="0" stroke={INK} strokeWidth="2" />
              <line x1="46" y1="0" x2="92" y2="0" stroke={INK} strokeWidth="1" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke={INK} />
              <line x1="46" y1="-4" x2="46" y2="4" stroke={INK} />
              <line x1="92" y1="-4" x2="92" y2="4" stroke={INK} />
              <text x="0" y="-8" fill={INK} opacity="0.6" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                0
              </text>
              <text x="92" y="-8" textAnchor="end" fill={INK} opacity="0.6" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
                2 M
              </text>
            </g>
          </g>
        </svg>
      </div>

      {!compact ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paperink/10 px-4 py-3 sm:px-5">
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.14em] text-paperink/40">Legenda</span>
          {[
            { color: GREEN, label: "Genset existing" },
            { color: AMBER, label: "Pondasi / unit baru" },
            { color: STEEL, label: "Struktur & utilitas" },
            { color: INK, label: "Kolom 20×20" },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-[9px] text-paperink/55">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-paperink/40">
            {layers.dimensi ? <Eye size={11} /> : <EyeOff size={11} />}
            klik elemen untuk detail
          </span>
        </div>
      ) : null}
    </div>
  );
}
