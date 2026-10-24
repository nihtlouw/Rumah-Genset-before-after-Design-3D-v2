export type Mode = "before" | "after";

export type GensetColor = "green" | "graphite";

export interface GensetUnit {
  id: string;
  label: string;
  code: string;
  kind: "existing" | "new";
  /** center X in cm, measured from site's left edge */
  x: number;
  /** center Z in cm, measured from site's back edge */
  z: number;
  w: number;
  d: number;
  h: number;
  foundationW: number;
  foundationD: number;
  foundationH: number;
  color: GensetColor;
}

export interface HouseConfig {
  mode: Mode;
  title: string;
  siteW: number;
  siteD: number;
  buildW: number;
  buildD: number;
  offsetX: number;
  offsetZ: number;
  wallH: number;
  roofRise: number;
  roofOverhang: number;
  enclosed: boolean;
  doorW: number;
  doorH: number;
  doorX: number;
  fenceEdge: "left" | "back" | "none";
  fenceHeight: number;
  gensets: GensetUnit[];
}

const beforeGenset: GensetUnit = {
  id: "gs-before",
  label: "Genset existing",
  code: "GX-01",
  kind: "existing",
  x: 405,
  z: 355,
  w: 120,
  d: 470,
  h: 190,
  foundationW: 140,
  foundationD: 490,
  foundationH: 20,
  color: "green",
};

const afterExisting: GensetUnit = {
  id: "gs-existing",
  label: "Genset existing",
  code: "GX-01",
  kind: "existing",
  x: 300,
  z: 590,
  w: 420,
  d: 100,
  h: 175,
  foundationW: 450,
  foundationD: 120,
  foundationH: 20,
  color: "green",
};

const afterNew: GensetUnit = {
  id: "gs-new",
  label: "Genset baru",
  code: "GN-02",
  kind: "new",
  x: 300,
  z: 330,
  w: 470,
  d: 120,
  h: 195,
  foundationW: 500,
  foundationD: 150,
  foundationH: 30,
  color: "graphite",
};

export const defaultConfigs: Record<Mode, HouseConfig> = {
  before: {
    mode: "before",
    title: "Eksisting / Before",
    siteW: 600,
    siteD: 710,
    buildW: 450,
    buildD: 710,
    offsetX: 150,
    offsetZ: 0,
    wallH: 300,
    roofRise: 110,
    roofOverhang: 40,
    enclosed: false,
    doorW: 120,
    doorH: 220,
    doorX: 260,
    fenceEdge: "left",
    fenceHeight: 200,
    gensets: [{ ...beforeGenset }],
  },
  after: {
    mode: "after",
    title: "Usulan / After",
    siteW: 600,
    siteD: 720,
    buildW: 600,
    buildD: 720,
    offsetX: 0,
    offsetZ: 0,
    wallH: 330,
    roofRise: 120,
    roofOverhang: 50,
    enclosed: true,
    doorW: 120,
    doorH: 220,
    doorX: 110,
    fenceEdge: "back",
    fenceHeight: 210,
    gensets: [{ ...afterExisting }, { ...afterNew }],
  },
};

export const cloneConfig = (mode: Mode): HouseConfig => {
  const source = defaultConfigs[mode];
  return {
    ...source,
    gensets: source.gensets.map((unit) => ({ ...unit })),
  };
};

export const cmToM = (value: number) => value / 100;

export const fmt = (value: number, digits = 0) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

export const areaOf = (w: number, d: number) => (w * d) / 10000;

export const perimeterOf = (w: number, d: number) => (2 * (w + d)) / 100;

export function gensetClearance(config: HouseConfig): number | null {
  if (config.gensets.length < 2) return null;
  const sorted = [...config.gensets].sort((a, b) => a.z - b.z);
  const [rear, front] = sorted;
  return Math.round(front.z - front.foundationD / 2 - (rear.z + rear.foundationD / 2));
}

export interface CheckResult {
  label: string;
  value: string;
  status: "ok" | "warn";
  note: string;
}

export function engineeringChecks(config: HouseConfig): CheckResult[] {
  const clearance = gensetClearance(config);
  const maxFoundation = Math.max(...config.gensets.map((g) => g.foundationW), 0);
  const sideAccess = Math.round((config.buildW - maxFoundation) / 2);
  const doorOk = config.doorW >= 90 && config.doorH >= 200;
  const area = areaOf(config.buildW, config.buildD);

  const checks: CheckResult[] = [
    {
      label: "Jarak servis antar-genset",
      value: clearance === null ? "Satu zona" : `${fmt(clearance)} cm`,
      status: clearance === null || clearance >= 100 ? "ok" : "warn",
      note: clearance === null ? "Belum ada dua zona mesin pada tahap ini." : "Minimum praktis 100 cm untuk inspeksi dan sirkulasi udara.",
    },
    {
      label: "Sisa akses samping",
      value: `${fmt(Math.max(sideAccess, 0))} cm`,
      status: sideAccess >= 50 ? "ok" : "warn",
      note: "Diukur dari tepi pondasi terlebar ke dinding.",
    },
    {
      label: "Dimensi pintu akses",
      value: `${fmt(config.doorW)} × ${fmt(config.doorH)} cm`,
      status: doorOk ? "ok" : "warn",
      note: "Rekomendasi minimum 90 × 200 cm agar peralatan dapat lewat.",
    },
    {
      label: "Luas ruang efektif",
      value: `${fmt(area, 2)} m²`,
      status: area >= 20 ? "ok" : "warn",
      note: "Akumulasi footprint bangunan, belum dipotong dinding.",
    },
  ];
  return checks;
}

export interface SurveyNote {
  side: string;
  code: string;
  title: string;
  detail: string;
  tags: string[];
  tone: "steel" | "amber" | "lime" | "rust";
}

export const surveyNotes: SurveyNote[] = [
  {
    side: "Sisi kiri",
    code: "L-01",
    title: "Area terbuka & material",
    detail:
      "Kanopi existing dengan terpal biru, tumpukan material, dan akses kerja. Batas pagar terukur 150 cm dari bangunan.",
    tags: ["Pagar 150 cm", "Terpal", "Material"],
    tone: "steel",
  },
  {
    side: "Sisi belakang",
    code: "B-02",
    title: "Struktur baja & genset hijau",
    detail:
      "Rangka kanopi baja biru, atap metal bergelombang, dua panel genset hijau, dan exhaust vertikal menembus area atap.",
    tags: ["Kolom baja", "Genset hijau", "Exhaust"],
    tone: "lime",
  },
  {
    side: "Sisi depan",
    code: "F-03",
    title: "Akses utama & banner",
    detail:
      "Fasad sementara tertutup banner institusi. Akses masuk berada di tengah, menyisakan koridor material di sisi depan.",
    tags: ["Pintu akses", "Banner", "Koridor"],
    tone: "amber",
  },
  {
    side: "Sisi kanan",
    code: "R-04",
    title: "Panel, drum & utilitas",
    detail:
      "Genset hijau, panel kontrol, drum B3 merah–biru, serta jalur exhaust berada di sisi ini. Perlu zona penyimpanan terpisah.",
    tags: ["Drum B3", "Panel", "Exhaust"],
    tone: "rust",
  },
];

export interface ChangeItem {
  label: string;
  before: string;
  after: string;
  tag: string;
}

export const changes: ChangeItem[] = [
  { label: "Footprint bangunan", before: "450 × 710 cm", after: "600 × 720 cm", tag: "Ekspansi" },
  { label: "Zona genset", before: "1 genset existing", after: "2 zona mesin terpisah", tag: "Kapasitas" },
  { label: "Pondasi genset baru", before: "Belum ada", after: "500 × 150 × 30 cm", tag: "Struktur" },
  { label: "Jarak antar-zona", before: "—", after: "≈ 125 cm", tag: "Servis" },
  { label: "Pagar", before: "Sisi kiri, 150 cm", after: "Dipindah ke batas belakang", tag: "Site" },
  { label: "Selubung", before: "Kanopi terbuka", after: "Tembok 150 cm + louver", tag: "Ventilasi" },
  { label: "Akses utama", before: "Gate 120 cm", after: "Pintu 120 × 220 cm", tag: "Akses" },
];

export interface RoofConcept {
  code: string;
  title: string;
  description: string;
  status: "existing" | "alternatif" | "terpilih";
}

export const roofConcepts: RoofConcept[] = [
  {
    code: "A",
    title: "Kanopi terbuka",
    description: "Kolom baja + atap pelana. Sirkulasi maksimal, namun panas dan hujan masuk langsung.",
    status: "existing",
  },
  {
    code: "B",
    title: "Canopy samping",
    description: "Penambahan atap miring pada satu sisi untuk area kerja dan penempatan drum.",
    status: "alternatif",
  },
  {
    code: "C",
    title: "Rumah genset tertutup",
    description: "Selubung triplek / metal + louver, bukaan servis, dan exhaust terarah ke atas.",
    status: "terpilih",
  },
];

export const assumptions = [
  "Gambar kerja memakai satuan sentimeter; model 3D menggunakan skala nyata 1 unit = 1 meter.",
  "Sketsa survei mencatat 570 cm pada sisi bawah dan 150 + 450 cm pada sisi atas. Konsep memakai 600 cm sebagai dimensi koordinasi, dengan 570 cm tetap menjadi referensi eksisting.",
  "Pagar sisi kiri 150 cm dipindahkan ke batas belakang pada skenario after.",
  "Sketsa after mencantumkan beberapa angka ruang kerja (120–250 cm). Konsep menetapkan pondasi genset baru 500 × 150 cm dan jarak bersih ± 125 cm agar memenuhi minimum servis 100 cm.",
  "Pondasi genset baru memakai pelat beton 30 cm di atas tanah, dengan penulangan dan daya dukung tanah yang harus diverifikasi oleh perencana struktur.",
];
