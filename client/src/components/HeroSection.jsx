import { useEffect, useState } from "react";

/* ─── Animated Counter ───────────────────────────────────────── */
function AnimatedStat({ target, label }) {
  const [value, setValue] = useState(0);

  const match = target.match(/^(\d+)(k\+|%)?$/);
  const canAnimate = !!match;
  const numericTarget = canAnimate
    ? parseInt(match[1], 10) * (match[2] === "k+" ? 1000 : 1)
    : 0;
  const suffix = canAnimate ? (match[2] || "") : "";

  useEffect(() => {
    if (!canAnimate || !numericTarget) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(numericTarget / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        start = numericTarget;
        clearInterval(timer);
      }
      setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [numericTarget, canAnimate]);

  let display = target;
  if (canAnimate) {
    if (suffix === "k+") {
      display = `${(value / 1000).toFixed(0)}k+`;
    } else if (suffix === "%") {
      display = `${value}%`;
    } else {
      display = `${value}`;
    }
  }

  return (
    <div className="text-center">
      <span
        className="block"
        style={{
          fontFamily: "'Fraunces',serif",
          fontSize: 32,
          fontWeight: 600,
          color: "#0e0f10",
          letterSpacing: "-1px",
        }}
      >
        {display}
      </span>
      <span
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          color: "#9a9ba0",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Workflow Pill Icons ────────────────────────────────────── */
const DraftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ScanIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
    <line x1="16" y1="5" x2="22" y2="5"/>
    <line x1="19" y1="2" x2="19" y2="8"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FlawIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ─── Hero Section ───────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-[70px] pb-10 flex flex-col items-center text-center">
      {/* Eyebrow */}
      <div
        className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border animate-[fadeIn_0.6s_ease]"
        style={{ background: "#f0e8d0", borderColor: "rgba(176,138,62,0.3)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#b08a3e" }} />
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            fontWeight: 500,
            color: "#b08a3e",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Fully Offline · Zero-Knowledge · Privacy-First
        </span>
      </div>

      {/* Heading */}
      <h1
        className="mb-6 leading-[1.05] animate-[fadeIn_0.8s_ease]"
        style={{
          fontFamily: "'Fraunces',serif",
          fontSize: "clamp(34px,5.5vw,68px)",
          fontWeight: 300,
          letterSpacing: "-2px",
          color: "#0e0f10",
        }}
      >
        Indian Legal Intelligence
        <br />
        that never <em style={{ fontStyle: "italic", color: "#1a5c60" }}>leaves</em> your machine.
      </h1>

      {/* Subtitle */}
      <p
        className="mb-8 text-[15px] sm:text-[16px] leading-relaxed max-w-2xl animate-[fadeIn_1s_ease]"
        style={{ color: "#4a4b4f", fontFamily: "'DM Sans',sans-serif" }}
      >
        Nyaya AI drafts court-ready petitions, detects document flaws, auto-maps IPC → BNS 2023 sections,
        and answers legal research queries — all running on a standard laptop with 4 GB VRAM. No internet. No subscriptions.
        No data ever leaves the machine.
      </p>

      {/* Workflow pills */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-6 animate-[fadeIn_1.1s_ease]">
        {[
          { icon: <DraftIcon />, label: "Legal Drafting" },
          { icon: <FlawIcon />, label: "Flaw Detection" },
          { icon: <ScanIcon />, label: "PDF / OCR Parsing" },
          { icon: <SearchIcon />, label: "Legal Research" },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-default"
            style={{
              fontFamily: "'DM Sans',sans-serif",
              background: "rgba(255,255,255,0.6)",
              border: "0.5px solid rgba(14,15,16,0.10)",
              color: "#4a4b4f",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#d8ecec";
              e.currentTarget.style.color = "#1a5c60";
              e.currentTarget.style.borderColor = "rgba(26,92,96,0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.6)";
              e.currentTarget.style.color = "#4a4b4f";
              e.currentTarget.style.borderColor = "rgba(14,15,16,0.10)";
            }}
          >
            <span style={{ color: "#1a5c60" }}>{icon}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="text-md flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 lg:gap-14 xl:gap-16 animate-[fadeIn_1.3s_ease]">
        {[
          { num: "81", label: "IPC→BNS Mappings" },
          { num: "4", label: "GB VRAM Required" },
          { num: "<12s", label: "Avg. analysis time" },
        ].map(({ num, label }) => (
          <AnimatedStat key={label} target={num} label={label} />
        ))}
      </div>
    </section>
  );
}
