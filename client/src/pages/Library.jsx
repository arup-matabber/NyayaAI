import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA — swap with real API responses later
───────────────────────────────────────────────────────────────── */
const MOCK_FOLDERS = [
  { id: "f1", label: "Criminal Matters" },
  { id: "f2", label: "Civil Litigation" },
  { id: "f3", label: "Corporate & Commercial" },
  { id: "f4", label: "Constitutional Petitions" },
];

const MOCK_CASES = [
  { id: "CR-0923-2024", name: "State of Maharashtra v. Arun Sharma",         status: "Active",    type: "Criminal (BNS §103)",    modified: "2h ago",        court: "Bombay HC" },
  { id: "WP-4412-2024", name: "Fundamental Rights — Aadhaar Linking PIL",    status: "Active",    type: "Constitutional",          modified: "4h ago",        court: "Supreme Court" },
  { id: "CS-1120-2023", name: "Reliance Industries v. Tata Power Ltd.",      status: "Active",    type: "Civil Suit",              modified: "Oct 20, 2024",  court: "Delhi HC" },
  { id: "BA-8822-2024", name: "Bail Application — Deepak Verma",             status: "Completed", type: "Criminal (IPC §420)",     modified: "Oct 18, 2024",  court: "Sessions Court" },
  { id: "WP-0552-2024", name: "Right to Privacy — WhatsApp Policy Challenge",status: "Active",    type: "Constitutional",          modified: "Oct 15, 2024",  court: "Supreme Court" },
  { id: "ARB-2291-2024",name: "Infosys Ltd. Arbitration — Service Agreement",status: "Completed", type: "Commercial Arbitration",   modified: "Oct 12, 2024",  court: "NCLT Mumbai" },
  { id: "MA-3341-2023", name: "Kumar v. Indian Railways (Negligence)",       status: "Completed", type: "Motor Accident Claim",     modified: "Oct 10, 2024",  court: "MACT Delhi" },
  { id: "IP-009-2024",  name: "Wipro Patent Infringement — AI Module",       status: "Archived",  type: "Intellectual Property",    modified: "Sep 30, 2024",  court: "Madras HC" },
  { id: "LA-1182-2023", name: "DDA v. Rajesh Patel — Land Acquisition",      status: "Archived",  type: "Land Revenue",            modified: "Sep 15, 2024",  court: "Delhi HC" },
  { id: "LD-4451-2024", name: "Sunita Devi — ESI Claim Dispute",             status: "Active",    type: "Labour & Employment",      modified: "Oct 5, 2024",   court: "Labour Court" },
  { id: "CO-3320-2024", name: "SEBI Compliance Review — BlueStar Finance",   status: "Active",    type: "Securities & SEBI",        modified: "Oct 1, 2024",   court: "SAT Mumbai" },
];

/* ─────────────────────────────────────────────────────────────────
   DATA HOOKS
───────────────────────────────────────────────────────────────── */
function useFolders() {
  return { folders: MOCK_FOLDERS, loading: false };
}

function useCases() {
  return { cases: MOCK_CASES, loading: false };
}

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const TABS = ["All", "Active", "Completed", "Archived"];

const STATUS_STYLE = {
  Active:    { bg: "#d8ecec", color: "#1a5c60" },
  Completed: { bg: "#f0e8d0", color: "#b08a3e" },
  Archived:  { bg: "#f1f0ee", color: "#9a9ba0" },
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function Highlight({ text, query }) {
  if (!query.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "#d8ecec", color: "#1a5c60", borderRadius: 2, padding: "0 2px", fontStyle: "normal" }}>
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const SearchIcon  = () => <Svg><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></Svg>;
const FolderIcon  = () => <Svg><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Svg>;
const PlusIcon    = () => <Svg><path d="M12 5v14M5 12h14"/></Svg>;
const XIcon       = () => <Svg size={13}><path d="M18 6 6 18M6 6l12 12"/></Svg>;
const ChevronUp   = () => <Svg size={11}><polyline points="18 15 12 9 6 15"/></Svg>;
const ChevronDown = () => <Svg size={11}><polyline points="6 9 12 15 18 9"/></Svg>;

const ScaleIcon   = () => <Svg size={20}><path d="M12 3v18"/><path d="M5 6l7-3 7 3"/><path d="m5 6-.9 5.4a2 2 0 0 0 2 2.4h0a2 2 0 0 0 2-2.4L7.2 6"/><path d="m19 6-.9 5.4a2 2 0 0 0 2 2.4h0a2 2 0 0 0 2-2.4L21.2 6"/><circle cx="5" cy="11.4" r="2"/><circle cx="19" cy="11.4" r="2"/></Svg>;

/* ─────────────────────────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────────────────────────── */

function FolderRow({ label, active, onClick, count }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
         onMouseEnter={() => setHov(true)}
         onMouseLeave={() => setHov(false)}
         className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150"
         style={{
           borderLeft: active ? "2.5px solid #1a5c60" : "2.5px solid transparent",
           background: active ? "#fff" : hov ? "rgba(14,15,16,0.03)" : "transparent",
           boxShadow: active ? "0 1px 4px rgba(14,15,16,0.06)" : "none",
         }}>
      <span style={{ color: active ? "#1a5c60" : "#9a9ba0" }}><FolderIcon /></span>
      <span className="flex-1" style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? "#0e0f10" : "#4a4b4f",
      }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0",
          background: "rgba(14,15,16,0.05)", padding: "2px 6px", borderRadius: 4,
        }}>{count}</span>
      )}
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Archived;
  return (
    <span className="inline-flex items-center gap-1.5" style={{
      background: s.bg, color: s.color,
      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
      padding: "3px 10px", borderRadius: 20,
      letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, opacity: 0.6 }} />
      {status}
    </span>
  );
}

function SortBtn({ label, field, active, asc, onSort, right }) {
  return (
    <button onClick={() => onSort(field)} className="cursor-pointer" style={{
      all: "unset", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 4,
      justifyContent: right ? "flex-end" : "flex-start",
      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
      color: active ? "#1a5c60" : "#9a9ba0",
      letterSpacing: "0.1em", textTransform: "uppercase",
      transition: "color 0.15s", userSelect: "none",
    }}>
      {label}
      {active ? (asc ? <ChevronUp /> : <ChevronDown />) : null}
    </button>
  );
}

function CaseRow({ c, query, last }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
         className="transition-colors duration-150 cursor-pointer"
         style={{
           display: "grid", gridTemplateColumns: "4fr 2fr 3fr 2fr",
           gap: 16, padding: "14px 20px",
           borderBottom: last ? "none" : "0.5px solid rgba(14,15,16,0.06)",
           background: hov ? "rgba(245,242,235,0.5)" : "#fff",
         }}>
      <div className="min-w-0">
        <div className="truncate" style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600,
          color: hov ? "#1a5c60" : "#0e0f10", transition: "color 0.12s",
        }}>
          <Highlight text={c.name} query={query} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.06em" }}>
            <Highlight text={c.id} query={query} />
          </span>
          {c.court && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d8d5ce", display: "inline-block" }} />
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#b08a3e", letterSpacing: "0.04em" }}>
                {c.court}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center"><Badge status={c.status} /></div>
      <div className="flex items-center" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#4a4b4f" }}>
        <Highlight text={c.type} query={query} />
      </div>
      <div className="flex items-center justify-end" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.04em" }}>
        {c.modified}
      </div>
    </div>
  );
}

/* Mobile case card (shown on small screens instead of the table row) */
function CaseCard({ c, query }) {
  return (
    <div className="rounded-xl p-4 transition-all duration-150"
         style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.08)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold" style={{ color: "#0e0f10", fontFamily: "'DM Sans',sans-serif" }}>
            <Highlight text={c.name} query={query} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>
              <Highlight text={c.id} query={query} />
            </span>
            {c.court && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d8d5ce", display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#b08a3e" }}>{c.court}</span>
              </>
            )}
          </div>
        </div>
        <Badge status={c.status} />
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px]" style={{ color: "#4a4b4f", fontFamily: "'DM Sans',sans-serif" }}>
          <Highlight text={c.type} query={query} />
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0" }}>{c.modified}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export default function LegalLibrary() {
  const { folders } = useFolders();
  const { cases }   = useCases();

  const [activeFolder, setActiveFolder] = useState(null);
  const [activeTab,    setActiveTab]    = useState("All");
  const [query,        setQuery]        = useState("");
  const [sortField,    setSortField]    = useState("modified");
  const [sortAsc,      setSortAsc]      = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userStr = localStorage.getItem("nyaya_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || "Advocate";

  function handleSort(field) {
    if (sortField === field) setSortAsc(p => !p);
    else { setSortField(field); setSortAsc(true); }
  }

  const displayed = useMemo(() => {
    let list = cases;
    if (activeTab !== "All") list = list.filter(c => c.status === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)   ||
        c.type.toLowerCase().includes(q) ||
        (c.court && c.court.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) =>
      sortAsc ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField])
    );
  }, [cases, activeTab, query, sortField, sortAsc]);

  const counts = useMemo(() => {
    const m = { All: cases.length };
    cases.forEach(c => { m[c.status] = (m[c.status] || 0) + 1; });
    return m;
  }, [cases]);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f5f2eb", minHeight: "100vh", color: "#0e0f10" }}>

      <Navbar activePage="Dashboard" />

      {/* ── MAIN ── */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-[96px] pb-20">

        {/* ── DASHBOARD OVERVIEW ── */}
        <div className="mb-14 sm:mb-20">
          <div className="mb-6">
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
              Overview
            </p>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 300, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 6 }}>
              {getGreeting()}, <em style={{ fontStyle: "italic", color: "#1a5c60" }}>{userName}.</em>
            </h1>
            <p className="text-[14px]" style={{ color: "#4a4b4f", maxWidth: 480 }}>
              At a glance litigation insights, predictive metrics, and active case repositories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { label: "Active Matters", val: "6", color: "#1a5c60", bg: "#d8ecec" },
              { label: "Drafts Pending", val: "3", color: "#b08a3e", bg: "#f0e8d0" },
              { label: "Flaws Detected", val: "14", color: "#e53e3e", bg: "rgba(229,62,62,0.12)" },
              { label: "Precedents Searched", val: "89", color: "#0e0f10", bg: "rgba(14,15,16,0.08)" }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl transition-all duration-200"
                   style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.08)" }}
                   onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                   onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 300, color: stat.color, marginBottom: 4 }}>
                  {stat.val}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CASE LIBRARY ── */}

        {/* Page headline + quick stats */}
        <div className="mb-8">
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
            Case Library
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 300, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 6 }}>
                Your case{" "}
                <em style={{ fontStyle: "italic", color: "#1a5c60" }}>repository.</em>
              </h1>
              <p className="text-[14px]" style={{ color: "#4a4b4f", maxWidth: 480 }}>
                All your legal documents, organized by jurisdiction and status. Locally stored, AES-256 encrypted, instantly searchable.
              </p>
            </div>
            {/* Quick stat pills */}
            <div className="flex gap-3 shrink-0">
              {[
                { label: "Active", value: counts.Active || 0, color: "#1a5c60", bg: "#d8ecec" },
                { label: "Total", value: cases.length, color: "#0e0f10", bg: "rgba(14,15,16,0.06)" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: s.bg }}>
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: s.color, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => {
            const on = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                      className="cursor-pointer inline-flex items-center gap-1.5 transition-all duration-150"
                      style={{
                all: "unset", cursor: "pointer",
                fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "8px 16px", borderRadius: 20,
                background: on ? "#0e0f10" : "rgba(255,255,255,0.6)",
                color: on ? "#fff" : "#4a4b4f",
                border: on ? "none" : "0.5px solid rgba(14,15,16,0.10)",
                backdropFilter: "blur(8px)",
              }}>
                {tab}
                {counts[tab] !== undefined && (
                  <span style={{
                    fontSize: 9, padding: "1px 6px", borderRadius: 10,
                    background: on ? "rgba(255,255,255,0.18)" : "rgba(14,15,16,0.06)",
                  }}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar toggle on mobile */}
        <button
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
          style={{
            all: "unset", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#4a4b4f",
            background: "rgba(255,255,255,0.6)", border: "0.5px solid rgba(14,15,16,0.10)",
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12,
          }}
          onClick={() => setSidebarOpen(p => !p)}
        >
          <FolderIcon />
          {sidebarOpen ? "Hide Folders" : "Show Folders"}
        </button>

        {/* Sidebar + Table grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] gap-5 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-8 items-start">

          {/* ── SIDEBAR ── */}
          <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-col gap-3 lg:sticky lg:top-[96px]">

              {/* Folders card */}
              <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.6)", border: "0.5px solid rgba(14,15,16,0.08)", backdropFilter: "blur(8px)" }}>
                <p className="px-3 pt-2 pb-3" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Folders
                </p>
                <FolderRow label="All Cases" active={activeFolder === null} onClick={() => setActiveFolder(null)} count={cases.length} />
                {folders.map(f => (
                  <FolderRow key={f.id} label={f.label} active={activeFolder === f.id} onClick={() => setActiveFolder(f.id)} />
                ))}
                <button
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-lg cursor-pointer transition-all duration-150"
                  style={{
                    all: "unset", cursor: "pointer", width: "100%", boxSizing: "border-box",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 11px", border: "1px dashed rgba(14,15,16,0.15)", borderRadius: 10,
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9a9ba0",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#1a5c60"; e.currentTarget.style.borderColor = "#1a5c60"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#9a9ba0"; e.currentTarget.style.borderColor = "rgba(14,15,16,0.15)"; }}>
                  <PlusIcon /> New Folder
                </button>
              </div>

              {/* AI promo card */}
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "#0e0f10" }}>
                {/* Decorative gradient */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
                     style={{ background: "radial-gradient(circle, #1a5c60 0%, transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(26,92,96,0.2)", color: "#2d8080" }}>
                    <ScaleIcon />
                  </div>
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 400, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>
                    IPC → BNS Auto-Mapper
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 16, lineHeight: 1.6 }}>
                    Scan documents for outdated IPC references and get instant BNS 2023 equivalents.
                  </p>
                  <button className="cursor-pointer transition-all duration-200" style={{
                    all: "unset", cursor: "pointer",
                    fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "#b08a3e", color: "#fff", padding: "8px 16px", borderRadius: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#c9a45a"}
                  onMouseLeave={e => e.currentTarget.style.background = "#b08a3e"}>
                    Scan Now →
                  </button>
                </div>
              </div>

              {/* Privacy badge */}
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(216,236,236,0.3)", border: "0.5px solid rgba(26,92,96,0.15)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#d8ecec", color: "#1a5c60" }}>
                  <Svg size={14}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: "#1a5c60" }}>Fully Offline</p>
                  <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>Encrypted · No cloud</p>
                </div>
              </div>
            </div>
          </aside>

          {/* ── TABLE ── */}
          <div className="flex flex-col">

            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-t-2xl"
                 style={{
                   background: "rgba(255,255,255,0.7)",
                   backdropFilter: "blur(12px)",
                   border: "0.5px solid rgba(14,15,16,0.08)",
                   borderBottom: "0.5px solid rgba(14,15,16,0.06)",
                 }}>
              <span className="shrink-0 flex" style={{ color: "#9a9ba0" }}><SearchIcon /></span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by case name, ID, court, or type…"
                className="flex-1 bg-transparent outline-none min-w-0 text-[13px]"
                style={{ border: "none", fontFamily: "'DM Sans',sans-serif", color: "#0e0f10" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="cursor-pointer flex items-center px-1.5 py-0.5 rounded"
                        style={{ all: "unset", cursor: "pointer", color: "#9a9ba0", display: "flex", alignItems: "center", padding: "2px 6px", borderRadius: 4, background: "rgba(14,15,16,0.05)" }}>
                  <XIcon />
                </button>
              )}
              <span className="shrink-0 whitespace-nowrap" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.08em" }}>
                {displayed.length} result{displayed.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Column headers — hidden on mobile */}
            <div className="hidden sm:grid" style={{
              gridTemplateColumns: "4fr 2fr 3fr 2fr",
              gap: 16, padding: "10px 20px",
              background: "rgba(245,242,235,0.6)",
              border: "0.5px solid rgba(14,15,16,0.08)", borderTop: "none",
            }}>
              <SortBtn label="Case Name" field="name"     active={sortField==="name"}     asc={sortAsc} onSort={handleSort} />
              <SortBtn label="Status"    field="status"   active={sortField==="status"}   asc={sortAsc} onSort={handleSort} />
              <SortBtn label="Type"      field="type"     active={sortField==="type"}     asc={sortAsc} onSort={handleSort} />
              <SortBtn label="Modified"  field="modified" active={sortField==="modified"} asc={sortAsc} onSort={handleSort} right />
            </div>

            {/* Desktop rows */}
            <div className="hidden sm:block rounded-b-2xl overflow-hidden"
                 style={{
                   background: "#fff",
                   border: "0.5px solid rgba(14,15,16,0.08)", borderTop: "none",
                   maxHeight: 560, overflowY: "auto",
                   scrollbarWidth: "thin",
                   scrollbarColor: "rgba(14,15,16,0.12) transparent",
                 }}>
              {displayed.length === 0 ? (
                <div className="py-16 text-center">
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, color: "#0e0f10", marginBottom: 6 }}>
                    No cases found
                  </p>
                  <p className="text-[13px]" style={{ color: "#9a9ba0" }}>
                    Try a different search term or adjust the filters.
                  </p>
                </div>
              ) : (
                displayed.map((c, i) => (
                  <CaseRow key={c.id} c={c} query={query} last={i === displayed.length - 1} />
                ))
              )}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden flex flex-col gap-2.5 mt-2">
              {displayed.length === 0 ? (
                <div className="py-12 text-center rounded-2xl" style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.08)" }}>
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 300, color: "#0e0f10", marginBottom: 4 }}>No cases found</p>
                  <p className="text-[13px]" style={{ color: "#9a9ba0" }}>Try a different search.</p>
                </div>
              ) : (
                displayed.map(c => <CaseCard key={c.id} c={c} query={query} />)
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER (matches Landing page) ── */}
      <footer style={{ borderTop: "0.5px solid rgba(14,15,16,0.12)", background: "#ede9e0" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
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
    </div>
  );
}