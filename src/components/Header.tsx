import { useState } from "react";
import { Box, Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV = [
  { href: "#ringkasan", label: "Ringkasan" },
  { href: "#denah", label: "Denah 2D" },
  { href: "#model", label: "Model 3D" },
  { href: "#banding", label: "Before–After" },
  { href: "#data", label: "Data & Ukuran" },
];

export function LogoMark() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-lime/25 bg-lime/10">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-lime" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 11.2 12 4l9 7.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10v9.5h13V10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m12.6 12.4-2.5 4h3.4l-1.8 3.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_8px_rgba(198,247,92,0.9)]" />
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/[0.07] bg-[#070c0d]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#ringkasan" className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <span className="min-w-0">
            <span className="block truncate font-display text-[13px] font-semibold leading-none tracking-[0.08em] text-[#f0f4ec]">
              RUMAH GENSET
            </span>
            <span className="mt-1 flex items-center gap-1.5 font-mono-tech text-[8px] uppercase leading-none tracking-[0.2em] text-mist-2">
              design studio <span className="h-0.5 w-0.5 rounded-full bg-lime" /> gedung g
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 font-mono-tech text-[10px] uppercase tracking-[0.08em] text-mist transition hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 font-mono-tech text-[8px] uppercase tracking-[0.1em] text-mist-2 xl:inline-flex">
            <span className="h-1 w-1 animate-pulse rounded-full bg-lime" />
            sketsa survey · rev 1.2
          </span>
          <a
            href="#model"
            className="hidden items-center gap-1.5 rounded-full bg-lime px-3.5 py-2 font-mono-tech text-[9px] font-semibold uppercase tracking-[0.08em] text-ink transition hover:bg-[#d7ff86] sm:inline-flex"
          >
            <Box size={12} />
            Buka model 3D
          </a>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-mist transition hover:border-lime/40 hover:text-lime lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.06] bg-[#0a1012] transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="mx-auto flex max-w-[1440px] flex-col px-4 py-3 sm:px-6">
          {NAV.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-white/[0.06] py-3 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-mist last:border-b-0 hover:text-lime"
            >
              <span>{item.label}</span>
              <span className="text-mist-2">0{index + 1}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
