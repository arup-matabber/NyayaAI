import { useState } from "react";
import HeroSection from "../components/HeroSection";
import ChatInputBar from "../components/ChatInputBar";
import Navbar from "../components/Navbar";

/* ─── Icons ──────────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const WifiOffIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const GavelIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/>
    <path d="m16 16 6-6"/>
    <path d="m8 8 6-6"/>
    <path d="m9 7 8 8"/>
    <path d="m21 11-8-8"/>
  </svg>
);
const BrainIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
/* ─── Marquee ─────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Legal Drafting", "Flaw Detection", "IPC → BNS Mapping",
  "OCR Parsing", "Bail Applications", "Case Research",
  "Supreme Court Precedents", "Hindi OCR", "AES-256 Encryption",
  "Offline-First", "4 GB VRAM",
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden whitespace-nowrap py-3"
         style={{ background: "rgba(255,255,255,0.5)", borderBottom: "0.5px solid rgba(14,15,16,0.08)" }}>
      <div className="inline-flex animate-[marquee_35s_linear_infinite]">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8"
                style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9ba0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {item}
            <span className="w-1 h-1 rounded-full bg-current opacity-40 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── How It Works ────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Upload Your Document",
      desc: "Drop any legal PDF — FIRs, petitions, court orders, rental agreements. Our layout-aware OCR handles even scanned Hindi district court documents.",
      color: "#1a5c60",
    },
    {
      num: "02",
      title: "AI Analyzes Locally",
      desc: "Nyaya's dual-model system picks the right model for the task — a fast 2B model for simple queries or a 7B legal-domain model for complex drafting. Everything runs on your GPU.",
      color: "#b08a3e",
    },
    {
      num: "03",
      title: "Get Actionable Results",
      desc: "Receive court-ready drafts, flaw diagnostics with exact BNS section references, or research answers grounded in real Supreme Court headnotes — never hallucinated.",
      color: "#1a5c60",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 sm:py-18">
      <div className="text-center mb-14 sm:mb-18">
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          How It Works
        </p>
        <h2 className="leading-[1.1] max-w-lg mx-auto" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 300, letterSpacing: "-1.5px", color: "#0e0f10" }}>
          From document to{" "}
          <em style={{ fontStyle: "italic", color: "#1a5c60" }}>intelligence</em>
          <br />in three steps.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
        {steps.map(({ num, title, desc, color }) => (
          <div key={num}
               className="rounded-2xl p-8 sm:p-10 flex flex-col gap-5 group transition-all duration-300"
               style={{
                 background: "#fff",
                 border: "0.5px solid rgba(14,15,16,0.10)",
               }}
               onMouseEnter={e => {
                 e.currentTarget.style.boxShadow = "0 8px 32px rgba(14,15,16,0.08)";
                 e.currentTarget.style.transform = "translateY(-2px)";
               }}
               onMouseLeave={e => {
                 e.currentTarget.style.boxShadow = "none";
                 e.currentTarget.style.transform = "translateY(0)";
               }}
          >
            <span style={{
              fontFamily: "'Fraunces',serif",
              fontSize: 48,
              fontWeight: 300,
              color: color,
              opacity: 0.2,
              lineHeight: 1,
            }}>
              {num}
            </span>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 400, color: "#0e0f10", letterSpacing: "-0.5px" }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: "#4a4b4f", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Bento Grid ──────────────────────────────────────────────── */
const BENTO_SMALL = [
  { icon: <LockIcon />, title: "AES-256 Encryption",  body: "All stored drafts encrypted at rest. Mandatory session wipe after every request clears all temporary data from memory.", accent: false },
  { icon: <BookIcon />, title: "Supreme Court Precedents",  body: "Real headnotes injected into every prompt before generation — the LLM is a linguistic synthesizer, not a fact source.", accent: false },
  { icon: <GavelIcon/>, title: "IPC → BNS Auto-Mapping", body: "81 hardcoded section mappings covering all major offences. Outdated IPC references are auto-corrected to BNS 2023.", accent: true  },
];

function BentoGrid() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16 sm:py-20">
      <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
        Core Capabilities
      </p>
      <h2 className="mb-10 sm:mb-14 leading-[1.1]" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 300, letterSpacing: "-1.5px", color: "#0e0f10", maxWidth: 560 }}>
        Built for Indian courts,<br />
        <em style={{ fontStyle: "italic", color: "#1a5c60" }}>not Silicon Valley demos.</em>
      </h2>

      {/* Grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,1fr)" }}>

        {/* Main — Fully offline */}
        <div className="rounded-xl overflow-hidden col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-7 xl:col-span-7 row-span-1 sm:row-span-1 md:row-span-1 lg:row-span-2 xl:row-span-2" style={{ background: "#0e0f10", border: "0.5px solid rgba(14,15,16,0.12)" }}>
          {/* Decorative top area with pattern */}
          <div className="relative overflow-hidden" style={{ height: 240, background: "linear-gradient(135deg, #0e0f10 0%, #1a2a2b 50%, #0e0f10 100%)" }}>
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(26,92,96,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(26,92,96,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            {/* Floating elements */}
            <div className="absolute top-8 left-8 px-3 py-1.5 rounded-lg" style={{ background: "rgba(26,92,96,0.2)", border: "0.5px solid rgba(26,92,96,0.3)" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#2d8080" }}>$ nyaya --offline</span>
            </div>
            <div className="absolute top-8 right-8 px-3 py-1.5 rounded-lg" style={{ background: "rgba(176,138,62,0.15)", border: "0.5px solid rgba(176,138,62,0.25)" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#b08a3e" }}>VRAM: 3.8/4.0 GB</span>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}> Zero external API calls ·  No telemetry ·  No remote dependencies</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500, color: "#b08a3e", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Zero-Knowledge Architecture
            </p>
            <h3 className="mb-3 leading-[1.2]" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,2.5vw,28px)", fontWeight: 300, color: "#fff", letterSpacing: "-0.5px" }}>
              Runs entirely on your laptop.<br className="hidden sm:block" />No cloud. No compromise.
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              FIR details, client identities, case strategies — the most sensitive data in Indian legal practice never leaves your machine. Not even for a millisecond.
            </p>
          </div>
        </div>

        {/* Hallucination control */}
        <div className="rounded-xl p-6 sm:p-8 md:p-8 lg:p-8 xl:p-10 flex flex-col gap-5 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-5 xl:col-span-5" style={{ background: "#1a5c60", border: "0.5px solid rgba(14,15,16,0.12)" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
            <BrainIcon />
          </div>
          <div>
            <h3 className="mb-2.5" style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 300, color: "#fff", letterSpacing: "-0.5px" }}>Hallucination Control</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              The LLM never retrieves facts from its own weights. Real Supreme Court headnotes are injected into every prompt — the model drafts arguments, but the retrieval system controls the facts.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
               Cites real case law, never fabricated precedents
            </span>
          </div>
        </div>

        {/* Small cards */}
        {BENTO_SMALL.map(({ icon, title, body, accent }) => (
          <div key={title} className="rounded-xl p-5 sm:p-7 md:p-7 lg:p-7 xl:p-8 flex flex-col gap-4 col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 transition-all duration-200"
               style={{
                 background: accent ? "#f0e8d0" : "#fff",
                 border: `0.5px solid ${accent ? "rgba(176,138,62,0.2)" : "rgba(14,15,16,0.12)"}`,
               }}
               onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
               onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border"
                 style={{
                   background: accent ? "rgba(176,138,62,0.12)" : "#f5f2eb",
                   borderColor: accent ? "rgba(176,138,62,0.2)" : "rgba(14,15,16,0.12)",
                   color: accent ? "#b08a3e" : "#1a5c60",
                 }}>
              {icon}
            </div>
            <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 400, color: "#0e0f10", letterSpacing: "-0.3px" }}>{title}</h4>
            <p style={{ fontSize: 13, color: "#4a4b4f", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Model Architecture Section ─────────────────────────────── */
function ModelSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-16 sm:pb-24">
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.10)" }}>
        <div className="p-8 sm:p-12 pb-0 sm:pb-0 text-center">
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            Dual-Model Architecture
          </p>
          <h2 className="mb-4 leading-[1.15]" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 300, color: "#0e0f10", letterSpacing: "-1px" }}>
            The right model for every{" "}
            <em style={{ fontStyle: "italic", color: "#1a5c60" }}>task.</em>
          </h2>
          <p className="max-w-xl mx-auto mb-10" style={{ fontSize: 14, color: "#4a4b4f", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
            Nyaya automatically routes queries through a complexity scoring system — weighing constitutional matters, jurisdictional issues, and multi-party petitions to pick the optimal model.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 border-t" style={{ borderColor: "rgba(14,15,16,0.08)" }}>
          {/* BitNet */}
          <div className="p-8 sm:p-10 md:border-r flex flex-col gap-4" style={{ borderColor: "rgba(14,15,16,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#d8ecec", color: "#1a5c60" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 400, color: "#0e0f10" }}>BitNet-b1.58-2B</h3>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#1a5c60", letterSpacing: "0.05em" }}>FAST QUERIES</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#4a4b4f", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              Ultra-compressed 2B parameter model using 1.58-bit ternary quantization. Fits in just 1.2 GB VRAM for quick lookups and low-complexity drafts.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {["1.2 GB VRAM", "2B Params", "1.58-bit", "~2s response"].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-md text-[11px]"
                      style={{ background: "#d8ecec", color: "#1a5c60", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Saul-7B */}
          <div className="p-8 sm:p-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#f0e8d0", color: "#b08a3e" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 400, color: "#0e0f10" }}>Saul-7B-Instruct</h3>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#b08a3e", letterSpacing: "0.05em" }}>COMPLEX DRAFTING</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#4a4b4f", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              7B parameter model fine-tuned specifically on legal text. Handles full document drafting, flaw detection, and complex multi-party legal research.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {["3.8 GB VRAM", "7B Params", "Legal-tuned", "~8s response"].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-md text-[11px]"
                      style={{ background: "#f0e8d0", color: "#b08a3e", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Canvas Preview ──────────────────────────────────────────── */
function CanvasMock() {
  return (
    <div className="rounded-xl overflow-hidden h-full flex flex-col" style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.12)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "#f5f2eb", borderColor: "rgba(14,15,16,0.12)" }}>
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
        </div>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          BAIL_APPLICATION_HC.PDF
        </span>
      </div>
      <div className="flex-1 p-5 relative">
        <div className="flex flex-col gap-1.5">
          {[88, 100, 72].map(w => (
            <div key={w} className="h-2 rounded-sm" style={{ width: `${w}%`, background: "#ede9e0" }} />
          ))}
          <div className="h-2 rounded-sm relative" style={{ width: "100%", background: "rgba(26,92,96,0.12)", borderLeft: "2px solid #1a5c60" }}>
            <span className="absolute -top-2 right-0 text-white px-1.5 py-0.5 rounded-sm"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, background: "#1a5c60" }}>IPC §302</span>
          </div>
          <div className="h-2 rounded-sm relative" style={{ width: "85%", background: "rgba(176,138,62,0.12)", borderLeft: "2px solid #b08a3e" }}>
            <span className="absolute -top-2 right-0 text-white px-1.5 py-0.5 rounded-sm"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, background: "#b08a3e" }}>→ BNS §103</span>
          </div>
          {[60, 95, 50].map(w => (
            <div key={w} className="h-2 rounded-sm" style={{ width: `${w}%`, background: "#ede9e0" }} />
          ))}
        </div>

        {/* AI Drawer */}
        <div className="absolute top-1/4 right-0 border-l rounded-l-lg p-4 shadow-lg"
             style={{ width: "62%", background: "#fff", border: "0.5px solid rgba(14,15,16,0.12)", borderRight: "none" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-1.5 py-0.5 rounded-sm"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 500, background: "#d8ecec", color: "#1a5c60", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Flaw Detected
            </span>
            <span className="px-1.5 py-0.5 rounded-sm"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 500, background: "#f0e8d0", color: "#b08a3e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Auto-Fixed
            </span>
          </div>
          <p className="italic" style={{ fontSize: 11, color: "#4a4b4f", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
            "Reference to IPC §302 (Murder) is outdated since 01 July 2024. Auto-mapped to BNS §103(1). Document updated."
          </p>
        </div>
      </div>
    </div>
  );
}

function CanvasSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 mb-16 sm:mb-24 lg:mb-24 xl:mb-32">
      <div className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 min-h-[480px]" style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.10)" }}>
        {/* Copy */}
        <div className="p-8 sm:p-14 flex flex-col justify-center md:border-r" style={{ borderColor: "rgba(14,15,16,0.08)" }}>
          <p className="mb-4" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Document Intelligence
          </p>
          <h2 className="mb-4 leading-[1.15]" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,3vw,34px)", fontWeight: 300, color: "#0e0f10", letterSpacing: "-1px" }}>
            Upload any legal document.
            <br />Get <em style={{ fontStyle: "italic", color: "#1a5c60" }}>actionable</em> diagnostics.
          </h2>
          <p className="mb-8 text-[14px] leading-relaxed" style={{ color: "#4a4b4f", fontFamily: "'DM Sans',sans-serif" }}>
            Drop a petition, FIR, court order, or rental agreement. Nyaya identifies missing clauses, outdated IPC references, and jurisdictional inconsistencies — then tells you exactly what to fix.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Auto-detect outdated IPC → BNS section references",
              "Missing clause identification in contracts",
              "Hindi OCR for district court scans",
              "Court-ready A4 PDF output in Indian format",
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-[13px]" style={{ color: "#4a4b4f", fontFamily: "'DM Sans',sans-serif" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#d8ecec", color: "#1a5c60" }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Preview */}
        <div className="p-4 sm:p-6" style={{ background: "#f5f2eb" }}>
          <CanvasMock />
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Strip ─────────────────────────────────────────────── */
function TrustStrip() {
  const items = [
    { icon: <WifiOffIcon />, title: "100% Offline", desc: "No internet needed, ever" },
    { icon: <ShieldIcon />, title: "AES-256 Encrypted", desc: "Session-wiped after each request" },
    { icon: <LockIcon />, title: "Zero-Knowledge", desc: "No telemetry, no tracking" },
    { icon: <BrainIcon />, title: "No Hallucination", desc: "RAG-grounded legal facts only" },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-16 sm:pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(({ icon, title, desc }) => (
          <div key={title} className="rounded-xl p-5 sm:p-6 text-center flex flex-col items-center gap-3 transition-all duration-200"
               style={{
                 background: "rgba(255,255,255,0.5)",
                 border: "0.5px solid rgba(14,15,16,0.08)",
                 backdropFilter: "blur(8px)",
               }}
               onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}
               onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.5)"}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#d8ecec", color: "#1a5c60" }}>
              {icon}
            </div>
            <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#0e0f10" }}>{title}</h4>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.04em" }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA Bar ─────────────────────────────────────────────────── */
function CTABar() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-16 sm:pb-20">
      <div className="rounded-2xl px-8 sm:px-14 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 sm:gap-16 items-center relative overflow-hidden"
           style={{ background: "#0e0f10" }}>
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle, #1a5c60 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative">
          <h2 className="mb-4 leading-[1.2]" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 300, color: "#fff", letterSpacing: "-1px" }}>
            Your clients' data deserves better
            <br className="hidden sm:block" />than a{" "}
            <em style={{ fontStyle: "italic", color: "#c9a45a" }}>foreign cloud server.</em>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 520, lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
            Indian legal professionals handle the most sensitive data imaginable — FIR details, client identities, case strategies. Keep it where it belongs: on your machine.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4 relative">
          <button className="whitespace-nowrap px-8 py-4 rounded-xl text-[14px] font-medium text-white transition-all duration-200 cursor-pointer flex items-center gap-2"
                  style={{ fontFamily: "'DM Sans',sans-serif", background: "#b08a3e" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#c9a45a"}
                  onMouseLeave={e => e.currentTarget.style.background = "#b08a3e"}>
            Start analyzing documents
            <ArrowRightIcon />
          </button>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>
            runs locally · 4 GB VRAM · no account needed
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: "0.5px solid rgba(14,15,16,0.12)", background: "#ede9e0" }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md border border-[#0e0f10]"
                   style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, color: "#0e0f10" }}>
                न
              </div>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 600, color: "#0e0f10" }}>Nyaya AI</span>
            </div>
            <p className="max-w-sm" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4a4b4f", lineHeight: 1.6 }}>
              Indian Legal Intelligence Platform. Fully offline, zero-knowledge, privacy-first.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {["Privacy", "Terms", "Disclaimer", "GitHub", "Contact"].map(link => (
              <a key={link} href="#" className="no-underline transition-colors duration-200"
                 style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.08em", textTransform: "uppercase" }}
                 onMouseEnter={e => e.target.style.color = "#0e0f10"}
                 onMouseLeave={e => e.target.style.color = "#9a9ba0"}>
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "rgba(14,15,16,0.12)" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.06em" }}>
            © {new Date().getFullYear()} Nyaya AI. All rights reserved.
          </span>
          <span className="text-center" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a9ba0", fontStyle: "italic" }}>
            Not a substitute for qualified legal advice. All documents must be reviewed by a licensed advocate.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ─────────────────────────────────────────────────────── */
export default function NyayaAI() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toggleUpload = () => setIsUploadOpen((prev) => !prev);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f5f2eb", color: "#0e0f10", minHeight: "100vh" }}>
      <Navbar activePage="Home" />
      <div style={{ height: 72 }} /> {/* Spacer for fixed navbar */}
      <Marquee />
      <main>
        <div className="lg:min-h-[calc(100vh-112px)] flex flex-col justify-center">
          <HeroSection />
          <ChatInputBar
            isUploadOpen={isUploadOpen}
            onToggleUpload={toggleUpload}
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
          />
        </div>
        <TrustStrip />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", borderTop: "0.5px solid rgba(14,15,16,0.08)" }} />
        <HowItWorks />
        <BentoGrid />
        <ModelSection />
        <CanvasSection />
        <CTABar />
      </main>
      <Footer />
    </div>
  );
}