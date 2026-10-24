import { useMemo } from "react";
import * as THREE from "three";
import { Edges, Grid, Html, Line } from "@react-three/drei";
import type { HouseConfig } from "@/data";
import { fmt, gensetClearance } from "@/data";
import type { SelectionInfo } from "@/types";

const ACCENT = "#c6f75c";
const STEEL_BEFORE = "#3c7691";
const STEEL_AFTER = "#31545a";

let roofTexture: THREE.CanvasTexture | null = null;
let concreteTexture: THREE.CanvasTexture | null = null;

function getRoofTexture() {
  if (roofTexture) return roofTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#9aa4a1";
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 8) {
      ctx.fillStyle = "rgba(35,46,46,0.35)";
      ctx.fillRect(0, y, 64, 1.4);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(0, y + 2, 64, 1);
    }
  }
  roofTexture = new THREE.CanvasTexture(canvas);
  roofTexture.wrapS = THREE.RepeatWrapping;
  roofTexture.wrapT = THREE.RepeatWrapping;
  roofTexture.repeat.set(1, 9);
  roofTexture.colorSpace = THREE.SRGBColorSpace;
  return roofTexture;
}

function getConcreteTexture() {
  if (concreteTexture) return concreteTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#8a8c7d";
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i += 1) {
      const shade = Math.random() > 0.5 ? "255,255,255" : "20,25,20";
      ctx.fillStyle = `rgba(${shade},${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
    }
  }
  concreteTexture = new THREE.CanvasTexture(canvas);
  concreteTexture.wrapS = THREE.RepeatWrapping;
  concreteTexture.wrapT = THREE.RepeatWrapping;
  concreteTexture.repeat.set(6, 7);
  concreteTexture.colorSpace = THREE.SRGBColorSpace;
  return concreteTexture;
}

type Vec3 = [number, number, number];

function Beam({
  a,
  b,
  thickness = 0.06,
  color = STEEL_AFTER,
}: {
  a: Vec3;
  b: Vec3;
  thickness?: number;
  color?: string;
}) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow receiveShadow>
      <boxGeometry args={[thickness, length, thickness]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.45} />
    </mesh>
  );
}

function Measure({
  a,
  b,
  label,
  color = ACCENT,
  labelOffset = 0,
}: {
  a: Vec3;
  b: Vec3;
  label: string;
  color?: string;
  labelOffset?: number;
}) {
  const mid: Vec3 = [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2 + labelOffset,
    (a[2] + b[2]) / 2,
  ];
  return (
    <group>
      <Line points={[a, b]} color={color} lineWidth={1} dashed dashSize={0.11} gapSize={0.07} transparent opacity={0.85} />
      <Html center position={mid} distanceFactor={10} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: "#eef7da",
            background: "rgba(9,16,17,0.88)",
            border: `1px solid ${color}66`,
            borderRadius: 4,
            padding: "4px 6px",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function SceneLabel({
  position,
  title,
  subtitle,
  tone = "#c6f75c",
}: {
  position: Vec3;
  title: string;
  subtitle?: string;
  tone?: string;
}) {
  return (
    <Html center position={position} distanceFactor={11} zIndexRange={[3, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
          background: "rgba(10,17,18,0.9)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 999,
          padding: "4px 8px",
          color: "#e7efe2",
          fontSize: 9,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: 99, background: tone }} />
        {title}
        {subtitle ? <span style={{ color: "rgba(231,239,226,0.5)" }}>{subtitle}</span> : null}
      </div>
    </Html>
  );
}

function DimensionTicks({ a, b, color = ACCENT }: { a: Vec3; b: Vec3; color?: string }) {
  const parallel = Math.abs(a[0] - b[0]) < 0.01;
  const size = 0.1;
  const tick = (point: Vec3): Vec3[] =>
    parallel
      ? [
          [point[0] - size, point[1], point[2]],
          [point[0] + size, point[1], point[2]],
        ]
      : [
          [point[0], point[1], point[2] - size],
          [point[0], point[1], point[2] + size],
        ];
  return (
    <group>
      <Line points={tick(a)} color={color} lineWidth={1} transparent opacity={0.7} />
      <Line points={tick(b)} color={color} lineWidth={1} transparent opacity={0.7} />
    </group>
  );
}

function Roof({
  config,
  steel,
  cx,
  cz,
  slabTop,
  showRoof,
  selectedId,
  onSelect,
}: {
  config: HouseConfig;
  steel: string;
  cx: number;
  cz: number;
  slabTop: number;
  showRoof: boolean;
  selectedId?: string;
  onSelect: (selection: SelectionInfo | null) => void;
}) {
  const texture = useMemo(() => getRoofTexture(), []);
  const span = config.buildW / 100;
  const depth = config.buildD / 100;
  const over = config.roofOverhang / 100;
  const rise = config.roofRise / 100;
  const half = span / 2 + over;
  const slope = Math.hypot(half, rise);
  const angle = Math.atan2(rise, half);
  const eave = slabTop + config.wallH / 100;
  const ridge = eave + rise;
  const roofDepth = depth + over * 2;
  const isSelected = selectedId === "roof";

  return (
    <group>
      {showRoof ? (
        <group
          onClick={(event) => {
            event.stopPropagation();
            onSelect({
              id: "roof",
              label: "Atap pelana baru",
              meta: `Rangka baja · penutup metal`,
              tone: "steel",
              detail:
                "Atap pelana dengan kemiringan terukur dan overstek 50 cm. Jalur exhaust dinaikkan melewati atap agar gas buang tidak berputar di area servis.",
              dims: [
                { label: "Bentang total", value: `${config.buildW + config.roofOverhang * 2} cm` },
                { label: "Rise atap", value: `${fmt(config.roofRise)} cm` },
                { label: "Panjang bidang", value: `${Math.round(slope * 100)} cm` },
              ],
            });
          }}
        >
          {[-1, 1].map((sign) => (
            <mesh
              key={sign}
              position={[cx + (sign * half) / 2, (eave + ridge) / 2 + 0.03, cz]}
              rotation={[0, 0, -sign * angle]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[slope, 0.06, roofDepth]} />
              <meshStandardMaterial
                map={texture}
                color={isSelected ? "#b6d9a0" : "#8f9995"}
                metalness={0.5}
                roughness={0.5}
              />
              {isSelected ? <Edges color={ACCENT} threshold={25} /> : null}
            </mesh>
          ))}
          <mesh position={[cx, ridge + 0.03, cz]} castShadow>
            <boxGeometry args={[0.24, 0.1, roofDepth + 0.04]} />
            <meshStandardMaterial color="#55625f" metalness={0.6} roughness={0.4} />
          </mesh>
          {[-1, 1].map((sign) => (
            <mesh key={`fascia-${sign}`} position={[cx + sign * half, eave, cz]} castShadow>
              <boxGeometry args={[0.07, 0.16, roofDepth]} />
              <meshStandardMaterial color="#495451" metalness={0.5} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* trusses are always visible, so hiding the roof still reads as a structure */}
      <group>
        {[0.15, 0.38, 0.62, 0.85].map((ratio) => {
          const z = cz - depth / 2 + depth * ratio;
          return (
            <group key={`truss-${ratio}`}>
              <Beam a={[cx - span / 2, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.07} />
              <Beam a={[cx + span / 2, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.07} />
              <Beam a={[cx - span / 2, eave, z]} b={[cx + span / 2, eave, z]} color={steel} thickness={0.07} />
              <Beam a={[cx, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.055} />
            </group>
          );
        })}
        <Beam a={[cx, ridge, cz - depth / 2]} b={[cx, ridge, cz + depth / 2]} color={steel} thickness={0.08} />
        <Beam a={[cx - span / 2, eave, cz - depth / 2]} b={[cx - span / 2, eave, cz + depth / 2]} color={steel} thickness={0.09} />
        <Beam a={[cx + span / 2, eave, cz - depth / 2]} b={[cx + span / 2, eave, cz + depth / 2]} color={steel} thickness={0.09} />
      </group>
    </group>
  );
}

function Genset({
  unit,
  steel,
  selectedId,
  onSelect,
  showLabels,
  slabTop,
  wx,
  wz,
  ridge,
}: {
  unit: HouseConfig["gensets"][number];
  steel: string;
  selectedId?: string;
  onSelect: (selection: SelectionInfo | null) => void;
  showLabels: boolean;
  slabTop: number;
  wx: (x: number) => number;
  wz: (z: number) => number;
  ridge: number;
}) {
  const fw = unit.foundationW / 100;
  const fd = unit.foundationD / 100;
  const fh = unit.foundationH / 100;
  const w = unit.w / 100;
  const d = unit.d / 100;
  const h = unit.h / 100;
  const isNew = unit.kind === "new";
  const selected = selectedId === unit.id || selectedId === `foundation-${unit.id}`;
  const x = wx(unit.x);
  const z = wz(unit.z);
  const bodyColor = isNew ? "#47534c" : "#4b7440";
  const info: SelectionInfo = {
    id: unit.id,
    label: unit.label,
    meta: `${unit.code} · ${isNew ? "unit baru" : "unit existing"}`,
    tone: isNew ? "amber" : "lime",
    detail: isNew
      ? "Genset baru berdiri di atas pondasi beton terpisah setebal 30 cm. Posisi memungkinkan inspeksi dari dua sisi dan jalur exhaust langsung ke atas."
      : "Genset existing dipertahankan sebagai acuan. Selubung dan exhaust dirapikan, sementara posisi pondasi tetap menjadi referensi koordinat.",
    dims: [
      { label: "Unit (P×L×T)", value: `${unit.w} × ${unit.d} × ${unit.h} cm` },
      { label: "Pondasi (P×L×t)", value: `${unit.foundationW} × ${unit.foundationD} × ${unit.foundationH} cm` },
    ],
  };
  const bind = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(info);
    },
    onPointerOver: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };

  const longAlongX = w > d;

  return (
    <group position={[x, slabTop, z]}>
      <group {...bind}>
        <mesh position={[0, fh / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial color={isNew ? "#9c9b89" : "#8c8d7d"} roughness={0.9} />
          <Edges color={isNew ? ACCENT : "#5c6559"} threshold={20} />
        </mesh>
        <mesh position={[0, fh + h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={bodyColor} roughness={0.58} metalness={0.22} />
          <Edges color={selected ? ACCENT : "#1c2921"} threshold={25} />
        </mesh>
        <mesh position={[0, fh + h + 0.015, 0]} castShadow>
          <boxGeometry args={[w + 0.03, 0.04, d + 0.03]} />
          <meshStandardMaterial color={isNew ? "#2f3b36" : "#365331"} roughness={0.6} metalness={0.3} />
        </mesh>
        {Array.from({ length: 5 }).map((_, index) => {
          const y = fh + h * 0.28 + index * 0.055;
          return (
            <mesh
              key={`vent-${index}`}
              position={longAlongX ? [0, y, d / 2 + 0.006] : [w / 2 + 0.006, y, 0]}
              rotation={longAlongX ? [0, 0, 0] : [0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[(longAlongX ? w : d) * 0.24, 0.02, 0.014]} />
              <meshStandardMaterial color="#152420" roughness={0.8} />
            </mesh>
          );
        })}
        <mesh position={longAlongX ? [w / 2 - 0.2, fh + h * 0.62, d / 2 + 0.012] : [w / 2 + 0.012, fh + h * 0.55, d / 2 - 0.2]}>
          <boxGeometry args={[0.26, 0.2, 0.02]} />
          <meshStandardMaterial color="#dce4cf" roughness={0.6} />
        </mesh>
        <mesh position={longAlongX ? [w / 2 - 0.27, fh + h * 0.62, d / 2 + 0.025] : [w / 2 + 0.025, fh + h * 0.55, d / 2 - 0.27]}>
          <boxGeometry args={[0.035, 0.035, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.6} />
        </mesh>
        {(() => {
          const base = fh + h + 0.04;
          const top = Math.max(ridge - slabTop + 0.28, base + 0.7);
          const pipeHeight = top - base;
          return (
            <group>
              <mesh position={[w * 0.28, base + pipeHeight / 2, -d * 0.22]} castShadow>
                <cylinderGeometry args={[0.075, 0.075, pipeHeight, 12]} />
                <meshStandardMaterial color="#6f7c77" metalness={0.75} roughness={0.35} />
              </mesh>
              <mesh position={[w * 0.28, top + 0.04, -d * 0.22]}>
                <cylinderGeometry args={[0.14, 0.1, 0.1, 12]} />
                <meshStandardMaterial color="#45524e" metalness={0.7} roughness={0.4} />
              </mesh>
            </group>
          );
        })()}
        <mesh position={[-w * 0.3, fh + h * 0.22, d / 2 + 0.014]}>
          <boxGeometry args={[0.12, 0.16, 0.012]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.8} />
        </mesh>
      </group>
      {showLabels ? (
        <SceneLabel
          position={[0, fh + h + 0.48, d / 2 + 0.1]}
          title={isNew ? "Genset baru" : "Existing"}
          subtitle={unit.code}
          tone={isNew ? ACCENT : "#7ec8d8"}
        />
      ) : null}
      {selected ? (
        <mesh position={[0, slabTop + fh + h / 2, d / 2 + 0.09]}>
          <boxGeometry args={[w + 0.02, h + 0.02, 0.01]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.12} />
        </mesh>
      ) : null}
      <mesh position={[0, fh / 2, 0]} visible={false}>
        <boxGeometry args={[fw, fh, fd]} />
        <meshStandardMaterial color={steel} />
      </mesh>
    </group>
  );
}

function Drum({
  position,
  color,
  showLabels,
}: {
  position: Vec3;
  color: string;
  showLabels?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.88, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.2} />
      </mesh>
      {[0.22, 0.66].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.283, 0.012, 6, 20]} />
          <meshStandardMaterial color="#1c2422" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.885, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {showLabels ? (
        <Html center position={[0, 1.2, 0]} distanceFactor={10} zIndexRange={[3, 0]} style={{ pointerEvents: "none" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "#e4ece1",
              background: "rgba(9,16,17,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "2px 5px",
              borderRadius: 3,
              whiteSpace: "nowrap",
            }}
          >
            DRUM B3
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function MaterialsBench({ position, steel }: { position: Vec3; steel: string }) {
  return (
    <group position={position}>
      {[0, 0.06, 0.12, 0.18].map((y, index) => (
        <mesh key={y} position={[index * 0.02 - 0.03, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.045, 0.7]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#a67a4d" : "#b58a5b"} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0.35, 0.3, 0]} castShadow>
        <boxGeometry args={[0.65, 0.28, 0.55]} />
        <meshStandardMaterial color="#c4bba3" roughness={0.9} />
      </mesh>
      <mesh position={[-0.65, 0.1, 0.1]} castShadow>
        <boxGeometry args={[0.6, 0.2, 0.5]} />
        <meshStandardMaterial color="#aeb3a2" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.03, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.02, 0.82]} />
        <meshStandardMaterial color={steel} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Fence({
  config,
  wx,
  wz,
}: {
  config: HouseConfig;
  wx: (x: number) => number;
  wz: (z: number) => number;
}) {
  if (config.fenceEdge === "none") return null;
  const height = config.fenceHeight / 100;
  const isLeft = config.fenceEdge === "left";
  const length = (isLeft ? config.siteD : config.siteW) / 100;
  const postCount = Math.max(3, Math.round(length / 1.5));
  return (
    <group>
      <mesh
        position={
          isLeft
            ? [wx(0) + 0.025, height / 2, 0]
            : [0, height / 2, wz(0) - 0.025]
        }
        castShadow
        receiveShadow
      >
        <boxGeometry args={isLeft ? [0.05, height, length] : [length, height, 0.05]} />
        <meshStandardMaterial color="#6d7f76" metalness={0.45} roughness={0.6} />
        <Edges color="#3c4a44" threshold={30} />
      </mesh>
      {Array.from({ length: postCount + 1 }).map((_, index) => {
        const ratio = index / postCount;
        return (
          <mesh
            key={index}
            position={
              isLeft
                ? [wx(0) + 0.03, height / 2, wz(config.siteD) - length * ratio]
                : [wx(0) + (config.siteW / 100) * ratio, height / 2, wz(0) - 0.03]
            }
            castShadow
          >
            <boxGeometry args={[0.08, height + 0.1, 0.08]} />
            <meshStandardMaterial color="#485751" metalness={0.4} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export interface HouseSceneProps {
  config: HouseConfig;
  showRoof: boolean;
  showDims: boolean;
  showLabels: boolean;
  selectedId?: string;
  onSelect: (selection: SelectionInfo | null) => void;
  flat?: boolean;
}

export function HouseScene({
  config,
  showRoof,
  showDims,
  showLabels,
  selectedId,
  onSelect,
  flat = false,
}: HouseSceneProps) {
  const siteW = config.siteW / 100;
  const siteD = config.siteD / 100;
  const buildW = config.buildW / 100;
  const buildD = config.buildD / 100;
  const wx = (x: number) => (x - config.siteW / 2) / 100;
  const wz = (z: number) => (z - config.siteD / 2) / 100;
  const cx = wx(config.offsetX + config.buildW / 2);
  const cz = wz(config.offsetZ + config.buildD / 2);
  const slabTop = flat ? 0.04 : 0.12;
  const steel = config.enclosed ? STEEL_AFTER : STEEL_BEFORE;
  const eave = slabTop + config.wallH / 100;
  const ridge = eave + config.roofRise / 100;
  const wallThickness = 0.1;
  const frontWallH = Math.min(config.wallH / 100 - 0.25, 2.65);
  const back = wz(config.offsetZ);
  const front = wz(config.offsetZ + config.buildD);
  const left = wx(config.offsetX);
  const right = wx(config.offsetX + config.buildW);
  const doorWidth = config.doorW / 100;
  const doorHeight = config.doorH / 100;
  const doorLeft = wx(config.offsetX + config.doorX);
  const doorCenter = doorLeft + doorWidth / 2;
  const lowerWall = Math.min(1.5, config.wallH / 100 - 0.4);
  const concrete = useMemo(() => getConcreteTexture(), []);
  const clearance = gensetClearance(config);
  const columns = useColumns(config);

  const site: SelectionInfo = {
    id: "site",
    label: "Lahan & slab",
    meta: `${fmt(config.siteW)} × ${fmt(config.siteD)} cm`,
    tone: "paper",
    detail: "Bidang kerja beton dengan batas lahan terukur. Elevasi slab dibuat cukup untuk menahan limpasan oli dan memudahkan drainase.",
    dims: [
      { label: "Luas lahan", value: `${fmt((config.siteW * config.siteD) / 10000, 2)} m²` },
      { label: "Luas bangunan", value: `${fmt((config.buildW * config.buildD) / 10000, 2)} m²` },
    ],
  };

  const bindSite = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(site);
    },
  };

  const wallInfo: SelectionInfo = {
    id: "walls",
    label: "Selubung & louver",
    meta: `Tembok ${Math.round(lowerWall * 100)} cm + louver`,
    tone: "lime",
    detail:
      "Selubung bawah berupa beton ringan sebagai dinding penahan, di atasnya louver baja untuk ventilasi silang. Bidang masuk udara dibuat rendah dan keluar lebih tinggi.",
    dims: [
      { label: "Tinggi tembok bawah", value: `${Math.round(lowerWall * 100)} cm` },
      { label: "Tinggi eave", value: `${config.wallH} cm` },
      { label: "Modul louver", value: "± 60 cm" },
    ],
  };

  const doorInfo: SelectionInfo = {
    id: "door",
    label: "Pintu akses servis",
    meta: `${config.doorW} × ${config.doorH} cm`,
    tone: "amber",
    detail: "Pintu tunggal dengan ambang rata. Posisi di sisi depan memudahkan bongkar-pasang komponen tanpa memindahkan unit genset.",
    dims: [
      { label: "Lebar", value: `${config.doorW} cm` },
      { label: "Tinggi", value: `${config.doorH} cm` },
      { label: "Jarak dari tepi kiri", value: `${config.doorX} cm` },
    ],
  };

  const columnInfo: SelectionInfo = {
    id: "columns",
    label: "Rangka kolom baja",
    meta: "Profil 20 × 20 cm",
    tone: "steel",
    detail: "Kolom baja persegi 20 × 20 cm dengan base plate. Jarak antar kolom mengikuti modul atap dan tetap membuka area manuver.",
    dims: [
      { label: "Dimensi kolom", value: "20 × 20 cm" },
      { label: "Tinggi eave", value: `${config.wallH} cm` },
    ],
  };

  const bindWalls = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(wallInfo);
    },
  };
  const bindDoor = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(doorInfo);
    },
  };
  const bindColumns = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(columnInfo);
    },
  };

  return (
    <group>
      <Grid
        position={[0, flat ? -0.012 : -0.04, 0]}
        args={[44, 44]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#233133"
        sectionSize={2.5}
        sectionThickness={0.9}
        sectionColor="#394b4b"
        fadeDistance={30}
        fadeStrength={1.4}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, flat ? -0.02 : -0.05, 0]} receiveShadow>
        <circleGeometry args={[26, 48]} />
        <meshStandardMaterial color="#0c1314" roughness={0.95} />
      </mesh>

      {/* site + slab */}
      <group {...bindSite}>
        <mesh position={[0, flat ? 0 : -0.06, 0]} receiveShadow>
          <boxGeometry args={[siteW, flat ? 0.04 : 0.12, siteD]} />
          <meshStandardMaterial map={concrete} color="#a3a596" roughness={0.92} />
          <Edges color="#68705f" threshold={25} />
        </mesh>
        <mesh position={[cx, slabTop - 0.055, cz]} receiveShadow>
          <boxGeometry args={[buildW, 0.11, buildD]} />
          <meshStandardMaterial color="#b9baab" roughness={0.88} />
        </mesh>
      </group>

      <Fence config={config} wx={wx} wz={wz} />

      {/* floor markings */}
      {config.enclosed ? (
        <group>
          <mesh position={[cx, slabTop + 0.002, front - 0.35]} receiveShadow>
            <boxGeometry args={[buildW - 0.4, 0.006, 0.05]} />
            <meshStandardMaterial color={ACCENT} roughness={0.7} />
          </mesh>
          <mesh position={[left + 0.35, slabTop + 0.002, cz]}>
            <boxGeometry args={[0.05, 0.006, buildD - 0.7]} />
            <meshStandardMaterial color="#69745f" roughness={0.7} />
          </mesh>
        </group>
      ) : null}

      {/* columns */}
      {columns.map((column) => (
        <group key={column.id} position={[column.x, slabTop, column.z]} {...bindColumns}>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[0.34, 0.04, 0.34]} />
            <meshStandardMaterial color="#54605b" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, (config.wallH / 100) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, config.wallH / 100, 0.16]} />
            <meshStandardMaterial color={steel} metalness={0.55} roughness={0.4} />
            <Edges color={selectedId === "columns" ? ACCENT : "#1c3033"} threshold={30} />
          </mesh>
        </group>
      ))}

      {/* perimeter beams */}
      <Beam a={[left, eave, back]} b={[left, eave, front]} color={steel} thickness={0.14} />
      <Beam a={[right, eave, back]} b={[right, eave, front]} color={steel} thickness={0.14} />
      <Beam a={[left, eave, back]} b={[right, eave, back]} color={steel} thickness={0.14} />
      <Beam a={[left, eave, front]} b={[right, eave, front]} color={steel} thickness={0.14} />

      <Roof
        config={config}
        steel={steel}
        cx={cx}
        cz={cz}
        slabTop={slabTop}
        showRoof={showRoof}
        selectedId={selectedId}
        onSelect={onSelect}
      />

      {/* walls & louvers for the enclosed proposal */}
      {config.enclosed ? (
        <group {...bindWalls}>
          {/* lower solid walls: back + sides */}
          <mesh position={[cx, slabTop + lowerWall / 2, back + wallThickness / 2]} castShadow receiveShadow>
            <boxGeometry args={[buildW, lowerWall, wallThickness]} />
            <meshStandardMaterial color="#b6b5a5" roughness={0.85} />
          </mesh>
          <mesh position={[left + wallThickness / 2, slabTop + lowerWall / 2, cz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, lowerWall, buildD]} />
            <meshStandardMaterial color="#b6b5a5" roughness={0.85} />
          </mesh>
          <mesh position={[right - wallThickness / 2, slabTop + lowerWall / 2, cz]} castShadow receiveShadow>
            <boxGeometry args={[wallThickness, lowerWall, buildD]} />
            <meshStandardMaterial color="#b6b5a5" roughness={0.85} />
          </mesh>

          {/* side and rear louvers */}
          {([
            { pos: [left + 0.06, slabTop + lowerWall + 0.55, cz] as Vec3, rotation: Math.PI / 2, width: buildD - 0.2 },
            { pos: [right - 0.06, slabTop + lowerWall + 0.55, cz] as Vec3, rotation: Math.PI / 2, width: buildD - 0.2 },
            { pos: [cx, slabTop + lowerWall + 0.55, back + 0.06] as Vec3, rotation: 0, width: buildW - 0.2 },
          ]).map((panel, index) => (
            <group key={`louver-${index}`} position={panel.pos} rotation={[0, panel.rotation, 0]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[panel.width, 1.05, 0.04]} />
                <meshStandardMaterial color="#435450" roughness={0.75} />
              </mesh>
              {Array.from({ length: 7 }).map((_, slat) => (
                <mesh key={slat} position={[0, -0.45 + slat * 0.15, 0.035]} rotation={[0.38, 0, 0]}>
                  <boxGeometry args={[panel.width - 0.04, 0.055, 0.1]} />
                  <meshStandardMaterial color="#73817a" metalness={0.35} roughness={0.6} />
                </mesh>
              ))}
              {[-1, 1].map((edge) => (
                <mesh key={edge} position={[(edge * panel.width) / 2, 0, 0]}>
                  <boxGeometry args={[0.05, 1.12, 0.08]} />
                  <meshStandardMaterial color="#2b3b38" roughness={0.6} metalness={0.3} />
                </mesh>
              ))}
            </group>
          ))}

          {/* front panel around the door */}
          <mesh position={[(left + doorLeft) / 2, slabTop + frontWallH / 2, front - wallThickness / 2]} castShadow receiveShadow>
            <boxGeometry args={[Math.max(doorLeft - left, 0.02), frontWallH, wallThickness]} />
            <meshStandardMaterial color="#c6c4b3" roughness={0.82} />
          </mesh>
          <mesh
            position={[(doorLeft + doorWidth + right) / 2, slabTop + frontWallH / 2, front - wallThickness / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[Math.max(right - (doorLeft + doorWidth), 0.02), frontWallH, wallThickness]} />
            <meshStandardMaterial color="#c6c4b3" roughness={0.82} />
          </mesh>
          <mesh position={[doorCenter, slabTop + doorHeight + (frontWallH - doorHeight) / 2, front - wallThickness / 2]} castShadow>
            <boxGeometry args={[doorWidth, Math.max(frontWallH - doorHeight, 0.05), wallThickness]} />
            <meshStandardMaterial color="#c6c4b3" roughness={0.82} />
          </mesh>
          <mesh position={[doorCenter, slabTop + frontWallH - 0.05, front - 0.02]}>
            <boxGeometry args={[doorWidth + 0.16, 0.1, 0.08]} />
            <meshStandardMaterial color={steel} metalness={0.5} roughness={0.45} />
          </mesh>
        </group>
      ) : null}

      {/* steel gable truss / infill */}
      {config.enclosed ? (
        <group>
          {[back + 0.04, front - 0.04].map((z, index) => {
            const shape = new THREE.Shape();
            shape.moveTo(-buildW / 2, 0);
            shape.lineTo(buildW / 2, 0);
            shape.lineTo(0, config.roofRise / 100);
            shape.closePath();
            return (
              <group key={`gable-${index}`} position={[cx, eave, z]} rotation={[0, index === 0 ? 0 : Math.PI, 0]}>
                <mesh castShadow receiveShadow>
                  <shapeGeometry args={[shape]} />
                  <meshStandardMaterial color="#c6c4b3" roughness={0.85} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, config.roofRise / 200, 0.035]}>
                  <boxGeometry args={[0.9, 0.16, 0.02]} />
                  <meshStandardMaterial color="#40514c" roughness={0.7} />
                </mesh>
              </group>
            );
          })}
        </group>
      ) : (
        <group>
          {[back + 0.04, front - 0.04].map((z, index) => (
            <group key={`open-gable-${index}`}>
              <Beam a={[left, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.08} />
              <Beam a={[right, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.08} />
              <Beam a={[left, eave, z]} b={[right, eave, z]} color={steel} thickness={0.08} />
              <Beam a={[cx, eave, z]} b={[cx, ridge, z]} color={steel} thickness={0.06} />
              <Beam a={[cx - (right - left) / 4, eave + (ridge - eave) / 2, z]} b={[cx + (right - left) / 4, eave + (ridge - eave) / 2, z]} color={steel} thickness={0.05} />
            </group>
          ))}
        </group>
      )}

      {/* door */}
      <group {...bindDoor}>
        <mesh position={[doorCenter, slabTop + doorHeight / 2, front - 0.01]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, 0.06]} />
          <meshStandardMaterial color={selectedId === "door" ? "#7b8a62" : "#3d4b46"} roughness={0.6} metalness={0.25} />
        </mesh>
        <mesh position={[doorCenter, slabTop + doorHeight + 0.045, front - 0.005]}>
          <boxGeometry args={[doorWidth + 0.12, 0.07, 0.1]} />
          <meshStandardMaterial color="#303f3a" metalness={0.45} roughness={0.5} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[doorCenter + (side * (doorWidth + 0.06)) / 2, slabTop + doorHeight / 2, front - 0.005]}>
            <boxGeometry args={[0.06, doorHeight + 0.06, 0.1]} />
            <meshStandardMaterial color="#303f3a" metalness={0.45} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[doorCenter - doorWidth / 2 + 0.14, slabTop + 1.05, front + 0.03]}>
          <boxGeometry args={[0.03, 0.24, 0.04]} />
          <meshStandardMaterial color={ACCENT} metalness={0.5} roughness={0.3} />
        </mesh>
        {showLabels ? (
          <SceneLabel
            position={[doorCenter, slabTop + doorHeight + 0.32, front + 0.2]}
            title={`Akses ${config.doorW}×${config.doorH}`}
            tone="#f2a65a"
          />
        ) : null}
      </group>

      {/* tarp + temporary props for existing condition */}
      {!config.enclosed ? (
        <group>
          <mesh position={[left - 0.35, 1.25, cz - 0.5]} rotation={[0, 0.06, 0.02]} castShadow>
            <planeGeometry args={[buildD * 0.72, 2.2]} />
            <meshStandardMaterial color="#245d80" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <Beam a={[left - 0.35, 0, back + 0.6]} b={[left - 0.35, 2.4, back + 0.6]} color="#37625f" thickness={0.05} />
          <Beam a={[left - 0.35, 0, front - 0.8]} b={[left - 0.35, 2.4, front - 0.8]} color="#37625f" thickness={0.05} />
        </group>
      ) : null}

      {/* gensets */}
      {config.gensets.map((unit) => (
        <Genset
          key={unit.id}
          unit={unit}
          steel={steel}
          selectedId={selectedId}
          onSelect={onSelect}
          showLabels={showLabels}
          slabTop={slabTop}
          wx={wx}
          wz={wz}
          ridge={ridge}
        />
      ))}

      {/* support equipment */}
      {config.gensets.length > 1 ? (
        <group>
          <Drum position={[wx(config.offsetX + 70), slabTop, wz(90)]} color="#a8493e" showLabels={showLabels} />
          <Drum position={[wx(config.offsetX + 140), slabTop, wz(90)]} color="#3c7f8b" showLabels={false} />
          <Drum position={[wx(config.offsetX + 210), slabTop, wz(90)]} color="#b7b7a5" showLabels={false} />
          <MaterialsBench position={[wx(config.offsetX + config.buildW - 180), slabTop, wz(80)]} steel={steel} />
          <mesh position={[wx(config.offsetX + config.buildW - 55), slabTop + 0.42, wz(config.offsetZ + config.buildD - 45)]} castShadow>
            <cylinderGeometry args={[0.13, 0.15, 0.84, 14]} />
            <meshStandardMaterial color="#b83f33" roughness={0.5} />
          </mesh>
        </group>
      ) : (
        <group>
          <Drum position={[wx(config.offsetX + 440), slabTop, wz(130)]} color="#a8493e" showLabels={showLabels} />
          <Drum position={[wx(config.offsetX + 440), slabTop, wz(215)]} color="#3c7f8b" showLabels={false} />
          <MaterialsBench position={[wx(config.offsetX + 90), slabTop, wz(110)]} steel={steel} />
        </group>
      )}

      {/* roof drainage + cable tray */}
      <group>
        <mesh position={[right - 0.18, slabTop + config.wallH / 100 - 0.45, cz]} castShadow>
          <boxGeometry args={[0.1, 0.1, buildD * 0.7]} />
          <meshStandardMaterial color="#88948d" metalness={0.65} roughness={0.35} />
        </mesh>
        {Array.from({ length: 4 }).map((_, index) => (
          <mesh key={`tray-${index}`} position={[left + 0.25 + index * 0.32, slabTop + 0.08, front - 0.28]}>
            <boxGeometry args={[0.16, 0.02, 0.5]} />
            <meshStandardMaterial color="#586b60" metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {showDims ? (
        <group>
          <Measure
            a={[wx(0), 0.04, wz(config.siteD) + 0.55]}
            b={[wx(config.siteW), 0.04, wz(config.siteD) + 0.55]}
            label={`${fmt(config.siteW)} cm`}
          />
          <DimensionTicks a={[wx(0), 0.04, wz(config.siteD) + 0.55]} b={[wx(config.siteW), 0.04, wz(config.siteD) + 0.55]} />
          <Measure
            a={[wx(0) - 0.55, 0.04, wz(0)]}
            b={[wx(0) - 0.55, 0.04, wz(config.siteD)]}
            label={`${fmt(config.siteD)} cm`}
          />
          <DimensionTicks a={[wx(0) - 0.55, 0.04, wz(0)]} b={[wx(0) - 0.55, 0.04, wz(config.siteD)]} />
          <Measure
            a={[right + 0.35, slabTop, front + 0.35]}
            b={[right + 0.35, eave, front + 0.35]}
            label={`eave ${config.wallH}`}
            labelOffset={0}
          />
          <Measure
            a={[cx, eave, front + 0.35]}
            b={[cx, ridge, front + 0.35]}
            label={`+${config.roofRise} atap`}
            color="#7ec8d8"
          />
          <Measure
            a={[doorLeft, slabTop + doorHeight, front + 0.55]}
            b={[doorLeft + doorWidth, slabTop + doorHeight, front + 0.55]}
            label={`pintu ${config.doorW}`}
            color="#f2a65a"
          />
          {config.gensets.map((unit) => (
            <group key={`measure-${unit.id}`}>
              <Measure
                a={[wx(unit.x - unit.foundationW / 2), slabTop + 0.02, wz(unit.z + unit.foundationD / 2) + 0.25]}
                b={[wx(unit.x + unit.foundationW / 2), slabTop + 0.02, wz(unit.z + unit.foundationD / 2) + 0.25]}
                label={`${unit.code} · pondasi ${unit.foundationW}×${unit.foundationD}×${unit.foundationH}`}
                color={unit.kind === "new" ? "#f2a65a" : "#7ec8d8"}
                labelOffset={0.06}
              />
            </group>
          ))}
          {clearance !== null && config.gensets.length > 1 ? (() => {
            const sorted = [...config.gensets].sort((a, b) => a.z - b.z);
            const gapStart = sorted[0].z + sorted[0].foundationD / 2;
            const gapEnd = sorted[1].z - sorted[1].foundationD / 2;
            return (
              <Measure
                a={[right + 0.35, 0.3, wz(gapStart)]}
                b={[right + 0.35, 0.3, wz(gapEnd)]}
                label={`clear ${fmt(clearance)}`}
                color="#f2a65a"
              />
            );
          })() : null}
          <Measure
            a={[left - 0.25, slabTop, back - 0.25]}
            b={[left + 0.2, slabTop, back - 0.25]}
            label="kolom 20×20"
            color="#7ec8d8"
          />
        </group>
      ) : null}

      {showLabels && config.enclosed ? (
        <SceneLabel
          position={[cx, ridge + 0.55, cz]}
          title="Rumah genset"
          subtitle="after · enclosed"
          tone={ACCENT}
        />
      ) : null}
    </group>
  );
}

function useColumns(config: HouseConfig) {
  return useMemo(() => {
    const { offsetX, offsetZ, buildW, buildD } = config;
    const wx = (x: number) => (x - config.siteW / 2) / 100;
    const wz = (z: number) => (z - config.siteD / 2) / 100;
    const points = [
      { id: "c1", x: offsetX, z: offsetZ },
      { id: "c2", x: offsetX + buildW, z: offsetZ },
      { id: "c3", x: offsetX, z: offsetZ + buildD },
      { id: "c4", x: offsetX + buildW, z: offsetZ + buildD },
      { id: "c5", x: offsetX, z: offsetZ + buildD / 2 },
      { id: "c6", x: offsetX + buildW, z: offsetZ + buildD / 2 },
    ];
    if (config.enclosed) {
      points.push(
        { id: "c7", x: offsetX + buildW / 2, z: offsetZ },
        { id: "c8", x: offsetX + buildW / 2, z: offsetZ + buildD }
      );
    }
    return points.map((point) => ({ id: point.id, x: wx(point.x), z: wz(point.z) }));
  }, [config]);
}
