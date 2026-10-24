import type { HouseConfig } from "@/data";

export interface SelectionInfo {
  id: string;
  label: string;
  meta: string;
  detail: string;
  tone?: "lime" | "steel" | "amber" | "rust" | "paper";
  dims?: { label: string; value: string }[];
}

export interface ColumnPoint {
  x: number;
  z: number;
  id: string;
}

export function getColumns(config: HouseConfig): ColumnPoint[] {
  const { offsetX, offsetZ, buildW, buildD } = config;
  const points: ColumnPoint[] = [
    { x: offsetX, z: offsetZ, id: "c1" },
    { x: offsetX + buildW, z: offsetZ, id: "c2" },
    { x: offsetX, z: offsetZ + buildD, id: "c3" },
    { x: offsetX + buildW, z: offsetZ + buildD, id: "c4" },
    { x: offsetX, z: offsetZ + buildD / 2, id: "c5" },
    { x: offsetX + buildW, z: offsetZ + buildD / 2, id: "c6" },
  ];
  if (config.enclosed) {
    points.push(
      { x: offsetX + buildW / 2, z: offsetZ, id: "c7" },
      { x: offsetX + buildW / 2, z: offsetZ + buildD, id: "c8" }
    );
  }
  return points;
}

export function getGensetSelection(
  config: HouseConfig,
  id: string
): SelectionInfo | undefined {
  const unit = config.gensets.find((item) => item.id === id);
  if (!unit) return undefined;
  return {
    id: unit.id,
    label: unit.label,
    meta: `${unit.code} · ${unit.kind === "new" ? "Unit baru" : "Unit existing"}`,
    tone: unit.kind === "new" ? "amber" : "lime",
    detail:
      unit.kind === "new"
        ? "Genset baru ditempatkan pada pondasi beton 30 cm, terpisah dari unit existing dengan jarak servis ± 125 cm."
        : "Genset existing dipertahankan. Footprint dan posisi menjadi acuan zonasi, exhaust, serta jalur kabel.",
    dims: [
      { label: "Unit (P×L×T)", value: `${unit.w} × ${unit.d} × ${unit.h} cm` },
      { label: "Pondasi (P×L)", value: `${unit.foundationW} × ${unit.foundationD} cm` },
      { label: "Tebal pondasi", value: `${unit.foundationH} cm` },
    ],
  };
}

export const siteToWorld = (config: HouseConfig, x: number, z: number): [number, number, number] => [
  (x - config.siteW / 2) / 100,
  0,
  (z - config.siteD / 2) / 100,
];
