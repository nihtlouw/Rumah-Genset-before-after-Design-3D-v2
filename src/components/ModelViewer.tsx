import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  Compass,
  Eye,
  EyeOff,
  Info,
  Layers3,
  RotateCw,
  Ruler,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { HouseScene } from "@/three/HouseScene";
import type { HouseConfig } from "@/data";
import type { SelectionInfo } from "@/types";
import { cn } from "@/utils/cn";

type PovKey = "iso" | "depan" | "belakang" | "kiri" | "kanan" | "atas";

const POVS: { key: PovKey; label: string; short: string }[] = [
  { key: "iso", label: "Isometrik", short: "ISO" },
  { key: "depan", label: "Depan", short: "DEPAN" },
  { key: "belakang", label: "Belakang", short: "BELAKANG" },
  { key: "kiri", label: "Kiri", short: "KIRI" },
  { key: "kanan", label: "Kanan", short: "KANAN" },
  { key: "atas", label: "Atas", short: "ATAS" },
];

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

function CameraRig({
  config,
  pov,
  nonce,
  needleRef,
}: {
  config: HouseConfig;
  pov: PovKey;
  nonce: number;
  needleRef: RefObject<HTMLDivElement | null>;
}) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as unknown as OrbitLike | null;
  const animating = useRef(true);

  const target = useMemo(
    () => new THREE.Vector3(0, Math.min(1.7, (config.wallH / 100) * 0.36), 0),
    [config.wallH]
  );

  const position = useMemo(() => {
    const span = Math.max(config.buildW, config.buildD) / 100;
    const aspect = size.width / Math.max(size.height, 1);
    const distance = (span * 1.18 + 3.6) * (aspect < 1.05 ? 1.38 : 1);
    const height = Math.max(config.wallH + config.roofRise, 380) / 100;
    const map: Record<PovKey, THREE.Vector3> = {
      iso: new THREE.Vector3(distance * 0.72, height * 1.5, distance * 0.92),
      depan: new THREE.Vector3(0, height * 0.64, distance * 1.16),
      belakang: new THREE.Vector3(0, height * 0.64, -distance * 1.16),
      kiri: new THREE.Vector3(-distance * 1.16, height * 0.62, 0),
      kanan: new THREE.Vector3(distance * 1.16, height * 0.62, 0),
      atas: new THREE.Vector3(0.02, distance * 1.45, 0.8),
    };
    return map[pov];
  }, [config.buildW, config.buildD, config.wallH, config.roofRise, pov, size.width, size.height]);

  useEffect(() => {
    animating.current = true;
  }, [position, nonce]);

  useFrame((_, delta) => {
    if (needleRef.current) {
      const azimuth = Math.atan2(camera.position.x, camera.position.z);
      needleRef.current.style.transform = `rotate(${azimuth}rad)`;
    }
    if (!animating.current) return;
    const factor = 1 - Math.pow(0.002, Math.min(delta, 0.08));
    camera.position.lerp(position, factor);
    if (controls) {
      controls.target.lerp(target, factor);
      controls.update();
    }
    if (camera.position.distanceTo(position) < 0.025) {
      animating.current = false;
    }
  });

  return null;
}

function CompassSync({ needleRef }: { needleRef: RefObject<HTMLDivElement | null> }) {
  useFrame(({ camera }) => {
    if (needleRef.current) {
      const azimuth = Math.atan2(camera.position.x, camera.position.z);
      needleRef.current.style.transform = `rotate(${azimuth}rad)`;
    }
  });
  return null;
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={["#d9f0f4", "#1a2220", 0.85]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 12, 8]}
        intensity={2.2}
        color="#fff4dd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-9, 6, -7]} intensity={0.8} color="#9ed9e4" />
      <directionalLight position={[0, 4, 10]} intensity={0.4} color="#e8f0db" />
    </>
  );
}

export default function ModelViewer({
  config,
  selection,
  onSelect,
  heightClass = "h-[430px] sm:h-[500px] lg:h-[570px]",
}: {
  config: HouseConfig;
  selection: SelectionInfo | null;
  onSelect: (selection: SelectionInfo | null) => void;
  heightClass?: string;
}) {
  const [pov, setPov] = useState<PovKey>("iso");
  const [nonce, setNonce] = useState(0);
  const [showRoof, setShowRoof] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [ready, setReady] = useState(false);
  const needleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPov("iso");
    setNonce((value) => value + 1);
  }, [config.mode]);

  const goTo = (key: PovKey) => {
    setPov(key);
    setNonce((value) => value + 1);
  };

  const toggles = [
    {
      key: "roof",
      label: showRoof ? "Atap tertutup" : "Atap dibuka",
      active: showRoof,
      icon: showRoof ? <Layers3 size={12} /> : <EyeOff size={12} />,
      onClick: () => setShowRoof((value) => !value),
    },
    {
      key: "dims",
      label: "Ukuran 3D",
      active: showDims,
      icon: <Ruler size={12} />,
      onClick: () => setShowDims((value) => !value),
    },
    {
      key: "labels",
      label: "Label",
      active: showLabels,
      icon: <Tag size={12} />,
      onClick: () => setShowLabels((value) => !value),
    },
  ];

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1214]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-lime/25 bg-lime/10 text-lime">
            <Sparkles size={12} />
          </span>
          <div>
            <p className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-mist-2">Interactive model</p>
            <p className="text-[12px] font-medium text-[#dfe7de]">
              {config.mode === "before" ? "Eksisting / Before" : "Usulan / After"} · skala 1:1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist sm:inline-flex">
            <Eye size={10} /> drag orbit · scroll zoom
          </span>
          <button
            type="button"
            onClick={() => goTo("iso")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist transition hover:border-lime/40 hover:text-lime"
          >
            <Compass size={10} /> reset view
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-white/[0.07] px-3 py-2.5">
        <span className="mr-1.5 hidden shrink-0 font-mono-tech text-[9px] uppercase tracking-[0.14em] text-mist-2 sm:inline">
          POV
        </span>
        {POVS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.key)}
            aria-pressed={pov === item.key}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] transition",
              pov === item.key
                ? "border-lime/60 bg-lime/[0.13] text-lime"
                : "border-transparent text-mist-2 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <span className="mr-1.5 opacity-50">{String(POVS.indexOf(item) + 1).padStart(2, "0")}</span>
            {item.short}
          </button>
        ))}
        <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setAutoRotate((value) => !value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.08em] transition",
              autoRotate
                ? "border-steel/50 bg-steel/10 text-steel"
                : "border-white/10 text-mist-2 hover:text-white"
            )}
          >
            <RotateCw size={10} className={autoRotate ? "animate-spin" : ""} /> auto
          </button>
        </div>
      </div>

      <div className={cn("relative w-full bg-[radial-gradient(ellipse_at_55%_20%,#1c2c2c_0%,#0d1618_48%,#090f11_100%)]", heightClass)}>
        <Canvas
          shadows
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [9, 7, 10], fov: 38, near: 0.1, far: 90 }}
          onCreated={() => setReady(true)}
          onPointerMissed={() => onSelect(null)}
        >
          <Lighting />
          <CameraRig config={config} pov={pov} nonce={nonce} needleRef={needleRef} />
          <CompassSync needleRef={needleRef} />
          <HouseScene
            config={config}
            showRoof={showRoof}
            showDims={showDims}
            showLabels={showLabels}
            selectedId={selection?.id}
            onSelect={onSelect}
          />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={3.2}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2.04}
            minPolarAngle={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={0.65}
            target={[0, Math.min(1.7, (config.wallH / 100) * 0.36), 0]}
          />
        </Canvas>

        {!ready ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c1416]">
            <div className="flex items-center gap-2.5 font-mono-tech text-[10px] uppercase tracking-[0.14em] text-mist">
              <span className="h-3 w-3 animate-spin rounded-full border border-lime/30 border-t-lime" />
              Menyiapkan model 3D
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-white/10 bg-black/45 px-2 py-1 font-mono-tech text-[9px] uppercase tracking-[0.1em] text-mist backdrop-blur">
            {config.mode === "before" ? "Existing" : "Proposed"} · 3D
          </span>
          <span className="rounded-md border border-lime/20 bg-lime/[0.08] px-2 py-1 font-mono-tech text-[9px] uppercase tracking-[0.1em] text-lime backdrop-blur">
            POV {pov}
          </span>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-center gap-1">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur">
            <div ref={needleRef} className="absolute inset-0 transition-transform duration-100">
              <svg viewBox="0 0 44 44" className="h-full w-full">
                <path d="M22 6 L26 22 L22 19 L18 22 Z" fill="#c6f75c" />
                <path d="M22 38 L18 22 L22 25 L26 22 Z" fill="#93a3a3" opacity="0.55" />
              </svg>
            </div>
            <span className="absolute -top-1 text-[7px] font-mono-tech text-mist-2">N</span>
          </div>
          <span className="font-mono-tech text-[8px] uppercase tracking-[0.1em] text-mist-2">orientasi</span>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 sm:flex">
          <span className="rounded-md border border-white/10 bg-black/45 px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2 backdrop-blur">
            Render skematik · bukan gambar kerja
          </span>
        </div>

        {selection ? (
          <div className="absolute bottom-3 right-3 z-20 w-[248px] max-w-[calc(100%-24px)] rounded-xl border border-lime/20 bg-[#0b1415]/95 p-3 shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-mono-tech text-[8px] uppercase tracking-[0.14em] text-lime">Elemen terpilih</p>
                <p className="mt-1 text-[12px] font-medium leading-tight text-[#eaf0e5]">{selection.label}</p>
                <p className="mt-0.5 font-mono-tech text-[9px] text-mist-2">{selection.meta}</p>
              </div>
              <button
                type="button"
                aria-label="Tutup detail"
                onClick={() => onSelect(null)}
                className="rounded-full p-1 text-mist-2 transition hover:bg-white/10 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
            {selection.dims ? (
              <div className="space-y-1 border-t border-white/[0.08] pt-2">
                {selection.dims.slice(0, 3).map((dim) => (
                  <div key={dim.label} className="flex items-baseline justify-between gap-2">
                    <span className="text-[9px] text-mist-2">{dim.label}</span>
                    <span className="font-mono-tech text-[9px] text-[#dce6d8]">{dim.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-md border border-white/10 bg-black/35 px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.08em] text-mist-2 backdrop-blur sm:flex">
            <Info size={9} /> klik elemen untuk ukuran
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] px-3 py-2.5">
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            aria-pressed={toggle.active}
            onClick={toggle.onClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono-tech text-[9px] uppercase tracking-[0.07em] transition",
              toggle.active
                ? "border-lime/30 bg-lime/[0.08] text-lime"
                : "border-white/10 bg-white/[0.02] text-mist-2 hover:text-white"
            )}
          >
            {toggle.icon}
            {toggle.label}
          </button>
        ))}
        <span className="ml-auto hidden font-mono-tech text-[9px] uppercase tracking-[0.08em] text-mist-2 md:inline">
          {config.gensets.length} zona genset · eave {config.wallH} cm · ridge +{config.roofRise}
        </span>
      </div>
    </div>
  );
}
