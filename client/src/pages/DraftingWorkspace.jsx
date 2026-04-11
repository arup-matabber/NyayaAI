import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { streamChat, listCases, uploadDocument, analyzeFlaws, routePrompt } from "../services/api";
import Navbar from "../components/Navbar";
import { Scale, AlertTriangle, FileText, Route as RouteIcon, Briefcase, Shield, Gavel } from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  bg: "#f5f2eb", white: "#fff", dark: "#0e0f10",
  teal: "#1a5c60", tealLight: "#d8ecec",
  gold: "#b08a3e", goldLight: "#f0e8d0",
  muted: "#9a9ba0", subtle: "#4a4b4f",
  border: "rgba(14,15,16,0.10)",
  fontSans: "'DM Sans',sans-serif",
  fontMono: "'DM Mono',monospace",
  fontSerif: "'Fraunces',serif",
};

const SEVERITY = {
  CRITICAL: { bg: "#fde8e8", color: "#c53030", border: "rgba(197,48,48,0.2)" },
  HIGH:     { bg: "#fefcbf", color: "#b7791f", border: "rgba(183,121,31,0.2)" },
  MEDIUM:   { bg: "#d8ecec", color: "#1a5c60", border: "rgba(26,92,96,0.2)" },
  LOW:      { bg: "#f5f2eb", color: "#4a4b4f", border: "rgba(14,15,16,0.1)" },
};

const STAGES = ["Routing", "Memory Sync", "Drafting", "Flaw Check", "PDF Export"];

/* ─── Micro-components ───────────────────────────────────────── */
function Chip({ children, color = T.teal, bg = T.tealLight }) {
  return (
    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold"
      style={{ background: bg, color, fontFamily: T.fontMono, letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function StatusBar({ stage, isActive }) {
  if (!isActive) return null;
  const idx = STAGES.indexOf(stage);
  const pct = ((idx + 1) / STAGES.length) * 100;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-3"
      style={{ background: "rgba(26,92,96,0.06)", border: `0.5px solid rgba(26,92,96,0.18)` }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: T.teal, animation: "pulse 1s infinite" }} />
      <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.teal, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {stage}
      </span>
      <div className="flex gap-1 ml-auto">
        {STAGES.map((s, i) => (
          <div key={s} className="h-1 w-8 rounded-full transition-all duration-500"
            style={{ background: i <= idx ? T.teal : "rgba(26,92,96,0.15)" }} />
        ))}
      </div>
    </div>
  );
}

function FlawBadge({ flaws }) {
  if (!flaws || flaws.length === 0) return null;
  const critical = flaws.filter(f => f.severity === "CRITICAL").length;
  const high = flaws.filter(f => f.severity === "HIGH").length;
  return (
    <div className="flex gap-1.5">
      {critical > 0 && <Chip color="#c53030" bg="rgba(197,48,48,0.1)">{critical} Critical</Chip>}
      {high > 0 && <Chip color="#b7791f" bg="rgba(183,121,31,0.1)">{high} High</Chip>}
      {!(critical || high) && <Chip color="#1a5c60" bg={T.tealLight}>{flaws.length} Flaws</Chip>}
    </div>
  );
}

function FlawCard({ flaw, i }) {
  const sev = SEVERITY[flaw.severity] || SEVERITY.LOW;
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
      style={{ background: sev.bg, border: `0.5px solid ${sev.border}`, animation: `fadeIn 0.2s ease ${i * 0.05}s both` }}>
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5"
        style={{ background: sev.border, color: sev.color, fontFamily: T.fontMono, letterSpacing: "0.06em" }}>
        {flaw.severity}
      </span>
      <div>
        <div className="text-[12px] font-semibold" style={{ color: sev.color, fontFamily: T.fontSans }}>{flaw.type}</div>
        <div className="text-[11px] mt-0.5" style={{ color: T.subtle, fontFamily: T.fontSans }}>{flaw.suggestion}</div>
      </div>
    </div>
  );
}

/* ─── Standalone Flaw Analyzer Tool ─────────────────────────── */
function FlawAnalyzerTool() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await analyzeFlaws(text.trim(), context.trim());
      setResult(r);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 300, color: T.dark, letterSpacing: "-0.3px" }}>
          Flaw Detector
        </h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.muted, marginTop: 4 }}>
          Paste any legal draft to detect procedural defects, missing sections, or incorrect statute citations.
        </p>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Paste your legal document draft here..."
        className="w-full p-4 rounded-xl text-[13px] outline-none resize-none"
        rows={10}
        style={{ background: T.white, border: `0.5px solid ${T.border}`, fontFamily: T.fontSans, color: T.dark, lineHeight: 1.7 }} />
      <div>
        <label className="text-[11px] uppercase tracking-wider mb-1 block" style={{ fontFamily: T.fontMono, color: T.muted }}>Case context (optional)</label>
        <input value={context} onChange={e => setContext(e.target.value)}
          placeholder="e.g. Bail application for theft in Delhi Sessions Court"
          className="w-full px-4 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: T.white, border: `0.5px solid ${T.border}`, fontFamily: T.fontSans, color: T.dark }} />
      </div>
      <button onClick={run} disabled={loading || !text.trim()}
        className="px-6 py-3 rounded-xl font-semibold text-[13px] transition-all cursor-pointer self-start"
        style={{ background: loading || !text.trim() ? "rgba(14,15,16,0.06)" : T.dark, color: loading || !text.trim() ? T.muted : "#fff", fontFamily: T.fontSans }}>
        {loading ? "Analyzing..." : "Analyze Flaws"}
      </button>
      {error && <p style={{ color: "#c53030", fontFamily: T.fontSans, fontSize: 13 }}>Error: {error}</p>}
      {result && (
        <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${T.border}` }}>
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: "rgba(245,242,235,0.6)", borderBottom: `0.5px solid ${T.border}` }}>
            <FlawBadge flaws={result.flaws || []} />
            <span className="ml-auto text-[11px]" style={{ fontFamily: T.fontMono, color: T.muted }}>
              {result.overall_risk ? `Risk: ${result.overall_risk}` : ""} {result.compliance_score !== undefined ? `• Score: ${result.compliance_score}%` : ""}
            </span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {result.flaws?.length > 0
              ? result.flaws.map((f, i) => <FlawCard key={i} flaw={f} i={i} />)
              : <div className="text-center py-8" style={{ color: T.muted, fontFamily: T.fontSans, fontSize: 13 }}> No procedural flaws detected.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── OCR / PDF Parsing Tool ─────────────────────────────────── */
function OcrTool() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const run = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await uploadDocument(file);
      setResult(r);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 300, color: T.dark, letterSpacing: "-0.3px" }}>
          PDF / OCR Parser
        </h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.muted, marginTop: 4 }}>
          Upload any court document PDF to extract text. Works with both native PDFs and scanned images.
        </p>
      </div>

      <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
        onChange={e => setFile(e.target.files[0])} />

      <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all"
        style={{ border: `1.5px dashed ${file ? T.teal : "rgba(14,15,16,0.2)"}`, padding: "3rem 2rem", background: file ? T.tealLight : "transparent" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: file ? "rgba(26,92,96,0.2)" : "rgba(14,15,16,0.05)" }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth={1.5} style={{ color: file ? T.teal : T.muted }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: file ? T.teal : T.muted, fontWeight: file ? 600 : 400 }}>
          {file ? file.name : "Drop a PDF here or click to browse"}
        </p>
        {file && <p style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB</p>}
      </div>

      <button onClick={run} disabled={loading || !file}
        className="px-6 py-3 rounded-xl font-semibold text-[13px] transition-all cursor-pointer self-start"
        style={{ background: loading || !file ? "rgba(14,15,16,0.06)" : T.teal, color: loading || !file ? T.muted : "#fff", fontFamily: T.fontSans }}>
        {loading ? "Extracting text..." : "Extract Text"}
      </button>

      {error && <p style={{ color: "#c53030", fontFamily: T.fontSans, fontSize: 13 }}>Error: {error}</p>}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Chip>{result.method === "ocr" ? "OCR Extraction" : "Native PDF"}</Chip>
            {result.confidence_score !== undefined && (
              <Chip color={T.gold} bg={T.goldLight}>Confidence: {(result.confidence_score * 100).toFixed(0)}%</Chip>
            )}
            {result.page_count && <Chip>{result.page_count} pages</Chip>}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${T.border}` }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(245,242,235,0.6)", borderBottom: `0.5px solid ${T.border}` }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Extracted Text</span>
              <button onClick={() => navigator.clipboard.writeText(result.parsed_text || "")}
                className="text-[10px] px-2 py-1 rounded cursor-pointer transition-colors"
                style={{ fontFamily: T.fontMono, color: T.muted }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(14,15,16,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                Copy
              </button>
            </div>
            <pre className="p-4 text-[12px] overflow-auto max-h-96 whitespace-pre-wrap"
              style={{ fontFamily: T.fontSans, color: T.dark, lineHeight: 1.7, scrollbarWidth: "thin" }}>
              {result.parsed_text || "No text extracted."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Route Inspector Tool ───────────────────────────────────── */
function RouteInspectorTool() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResult(null);
    try { setResult(await routePrompt(prompt.trim())); }
    catch { }
    finally { setLoading(false); }
  };

  const EXAMPLES = [
    "Draft a bail application for murder charge in Delhi High Court",
    "File a cheating complaint under IPC 420",
    "Civil suit for breach of contract worth 50 lakhs",
    "Anticipatory bail for NDPS case in sessions court",
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 300, color: T.dark, letterSpacing: "-0.3px" }}>
          Legal Route Inspector
        </h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.muted, marginTop: 4 }}>
          See how the engine classifies your prompt — task type, complexity, tier selection, and IPC→BNS statute corrections.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="Enter any legal query or drafting request..."
          className="w-full p-4 rounded-xl text-[13px] outline-none resize-none"
          rows={4}
          style={{ background: T.white, border: `0.5px solid ${T.border}`, fontFamily: T.fontSans, color: T.dark, lineHeight: 1.7 }} />
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setPrompt(ex)}
              className="text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-colors"
              style={{ background: "rgba(14,15,16,0.04)", color: T.subtle, fontFamily: T.fontSans }}
              onMouseEnter={e => { e.currentTarget.style.background=T.tealLight; e.currentTarget.style.color=T.teal; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(14,15,16,0.04)"; e.currentTarget.style.color=T.subtle; }}>
              {ex.length > 45 ? ex.slice(0,45)+"…" : ex}
            </button>
          ))}
        </div>
      </div>

      <button onClick={run} disabled={loading || !prompt.trim()}
        className="px-6 py-3 rounded-xl font-semibold text-[13px] transition-all cursor-pointer self-start"
        style={{ background: loading || !prompt.trim() ? "rgba(14,15,16,0.06)" : T.teal, color: loading || !prompt.trim() ? T.muted : "#fff", fontFamily: T.fontSans }}>
        {loading ? "Routing..." : "Inspect Route"}
      </button>

      {result && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Task Type", value: result.task_type, color: T.teal, bg: T.tealLight },
            { label: "Assigned Tier", value: result.assigned_tier, color: T.gold, bg: T.goldLight },
            { label: "Complexity Score", value: `${result.complexity_score || 0} / 20`, color: T.dark, bg: "rgba(14,15,16,0.04)" },
            { label: "Document Type", value: result.document_type || "N/A", color: T.subtle, bg: "rgba(14,15,16,0.04)" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="p-4 rounded-xl" style={{ background: bg, border: `0.5px solid ${T.border}` }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 600, color }}>{value}</div>
            </div>
          ))}
          {result.statute_corrections?.length > 0 && (
            <div className="col-span-2 p-4 rounded-xl" style={{ background: "rgba(197,48,48,0.05)", border: "0.5px solid rgba(197,48,48,0.15)" }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "#c53030", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                IPC → BNS Corrections ({result.statute_corrections.length})
              </div>
              <div className="flex flex-col gap-1.5">
                {result.statute_corrections.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]" style={{ fontFamily: T.fontSans, color: T.subtle }}>
                    <span className="line-through" style={{ color: "#c53030" }}>{c.old || c.ipc}</span>
                    <span style={{ color: T.muted }}>→</span>
                    <span style={{ color: T.teal, fontWeight: 600 }}>{c.new || c.bns}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Legal Drafter (Chat) ───────────────────────────────────── */
function LegalDrafter({ initialPrompt, initialFiles, onCaseChange }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [history, setHistory] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pipelineStage, setPipelineStage] = useState("");
  const [flaws, setFlaws] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showFlaws, setShowFlaws] = useState(true);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    listCases().then(r => { if (r.cases) setHistory(r.cases); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPrompt || initialFiles?.length) {
      handleInitialPayload(initialPrompt, initialFiles);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleInitialPayload = async (q, files) => {
    let full = q || "";
    if (files?.length) {
      for (const f of Array.from(files)) {
        setMessages(prev => [...prev, { role: "user", content: `Uploading: ${f.name}…` }]);
        if (f.type === "application/pdf") setPdfUrl(URL.createObjectURL(f));
        try {
          const r = await uploadDocument(f);
          const txt = r.parsed_text?.substring(0, 2000) || "No readable text.";
          full += `\n\n[Extracted from ${f.name}]:\n${txt}`;
          setMessages(prev => { const m=[...prev]; m[m.length-1].content=` ${f.name} processed (OCR: ${(r.confidence_score*100).toFixed(0)}%)`; return m; });
        } catch (e) {
          setMessages(prev => [...prev, { role: "assistant", content: `Failed to process ${f.name}: ${e.message}` }]);
        }
      }
    }
    if (full.trim()) submitQuery(full);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setMessages(prev => [...prev, { role: "user", content: `Uploading: ${file.name}…` }]);
    if (file.type === "application/pdf") setPdfUrl(URL.createObjectURL(file));
    try {
      const r = await uploadDocument(file);
      const txt = r.parsed_text?.substring(0, 2000) || "No readable text.";
      setPrompt(p => p + `\n\n[Extracted from ${file.name}]:\n${txt}`);
      setMessages(prev => { const m=[...prev]; m[m.length-1].content=` ${file.name} processed (${(r.confidence_score*100).toFixed(0)}% confidence)`; return m; });
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `OCR failed: ${e.message}` }]);
    }
    e.target.value = null;
  };

  const submitQuery = async (userPrompt) => {
    if (!userPrompt?.trim() || isGenerating) return;
    setPrompt(""); setFlaws([]); setRouteInfo(null); setShowFlaws(true); setPdfUrl(null);
    setMessages(prev => [...prev, { role: "user", content: userPrompt }]);
    setIsGenerating(true); setPipelineStage("Routing");
    setMessages(prev => [...prev, { role: "assistant", content: "", isStreaming: true }]);

    await streamChat(userPrompt, activeCaseId, {
      onInit: (cid) => { setActiveCaseId(cid); setPipelineStage("Drafting"); onCaseChange?.(); },
      onToken: (token) => {
        setMessages(prev => {
          const m = [...prev], last = m.length - 1;
          if (m[last].isStreaming) m[last] = { ...m[last], content: m[last].content + token };
          return m;
        });
      },
      onMetadata: (meta) => {
        setPipelineStage("PDF Export");
        if (meta.pdf_path) {
          const filename = meta.pdf_path.replace(/\\/g, "/").split("/").pop();
          setPdfUrl(`http://127.0.0.1:8000/api/documents/${filename}`);
        }
        if (meta.flaws?.length) setFlaws(meta.flaws);
        if (meta.route_info) setRouteInfo(meta.route_info);
      },
      onDone: () => {
        setIsGenerating(false); setPipelineStage("");
        setMessages(prev => { const m=[...prev]; const l=m.length-1; if(m[l].isStreaming) m[l].isStreaming=false; return m; });
        listCases().then(r => { if(r.cases) setHistory(r.cases); });
      },
      onError: (err) => {
        setIsGenerating(false); setPipelineStage("");
        setMessages(prev => [...prev, { role: "assistant", content: ` Error: ${err}` }]);
      },
    });
  };

  const STARTERS = [
    { icon: <Scale size={13} />, label: "Bail App: Theft", query: "Draft a bail application for theft in Delhi" },
    { icon: <Gavel size={13} />, label: "Complaint: BNS 318", query: "File a criminal complaint for cheating under BNS 318" },
    { icon: <Briefcase size={13} />, label: "Civil Suit: Breach", query: "Draft a civil suit for breach of contract of ₹50 lakhs" },
    { icon: <Shield size={13} />, label: "Anti. Bail: NDPS", query: "Anticipatory bail for NDPS case in High Court" },
    { icon: <FileText size={13} />, label: "Writ: Fundamental", query: "Draft a writ petition for violation of fundamental rights" },
    { icon: <AlertTriangle size={13} />, label: "Urgent Stay App", query: "Urgent stay application in sessions court" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[240px] flex flex-col p-4 shrink-0" style={{ background: T.white, borderRight: `0.5px solid ${T.border}` }}>
        <button onClick={() => { setActiveCaseId(null); setMessages([]); setPdfUrl(null); setFlaws([]); setRouteInfo(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer w-full text-[13px] mb-6"
          style={{ background: T.teal, color: "#fff", fontFamily: T.fontSans }}
          onMouseEnter={e => e.currentTarget.style.background="#13494d"}
          onMouseLeave={e => e.currentTarget.style.background=T.teal}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>
          New Session
        </button>

        <div className="text-[9px] font-semibold tracking-widest uppercase px-2 mb-2" style={{ fontFamily: T.fontMono, color: T.muted }}>Quick Prompts</div>
        <div className="flex flex-col gap-1 mb-6">
          {STARTERS.map(({ icon, label, query }) => (
            <button key={query} onClick={() => submitQuery(query)}
              className="w-full px-2.5 py-2 rounded-lg text-[11px] text-left flex items-center gap-2 transition-colors cursor-pointer"
              style={{ color: T.subtle, fontFamily: T.fontSans }}
              title={query}
              onMouseEnter={e => e.currentTarget.style.background=T.tealLight}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="text-[9px] font-semibold tracking-widest uppercase px-2 mb-2" style={{ fontFamily: T.fontMono, color: T.muted }}>Recent Matters</div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1" style={{ scrollbarWidth: "thin" }}>
          {history.map(item => (
            <button key={item.id}
              className="w-full pl-2.5 pr-2 py-2 rounded-lg text-[12px] transition-colors text-left truncate cursor-pointer shrink-0"
              style={{ background: activeCaseId===item.id ? "rgba(26,92,96,0.08)" : "transparent", color: activeCaseId===item.id ? T.teal : T.subtle, fontFamily: T.fontSans, fontWeight: activeCaseId===item.id ? 600 : 400 }}>
              {item.title || `Case #${item.id}`}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: T.white }}>
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-48 space-y-3" style={{ scrollbarWidth: "thin" }}>

          {/* Status & info chips */}
          {routeInfo && (
            <div className="flex flex-wrap gap-2 mb-2">
              <Chip>{routeInfo.task_type || "LEGAL_DRAFT"}</Chip>
              {routeInfo.document_type && <Chip color={T.gold} bg={T.goldLight}>{routeInfo.document_type}</Chip>}
              {routeInfo.complexity_score > 0 && <Chip color={T.subtle} bg="rgba(14,15,16,0.04)">Complexity {routeInfo.complexity_score}/20</Chip>}
              {routeInfo.statute_corrections?.length > 0 && <Chip color="#c53030" bg="rgba(197,48,48,0.08)">{routeInfo.statute_corrections.length} IPC→BNS</Chip>}
            </div>
          )}
          <StatusBar stage={pipelineStage} isActive={isGenerating} />

          {/* Flaw summary */}
          {!isGenerating && flaws.length > 0 && showFlaws && (
            <div className="rounded-xl overflow-hidden mb-2" style={{ border: `0.5px solid ${T.border}` }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(245,242,235,0.6)", borderBottom: `0.5px solid ${T.border}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    Procedural Review
                  </span>
                  <FlawBadge flaws={flaws} />
                </div>
                <button onClick={() => setShowFlaws(false)} className="text-[11px] cursor-pointer" style={{ color: T.muted }}></button>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {flaws.map((f, i) => <FlawCard key={i} flaw={f} i={i} />)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: T.tealLight, color: T.teal }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 300, color: T.dark, marginBottom: 8 }}>Legal Drafter</h3>
              <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.muted }}>Describe your case or click a quick prompt to begin.</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] px-5 py-4 text-[13px] leading-relaxed"
                style={{
                  fontFamily: T.fontSans, color: T.dark,
                  background: msg.role === "user" ? "rgba(245,242,235,0.8)" : T.white,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                  boxShadow: "0 2px 12px rgba(14,15,16,0.04)",
                }}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold" style={{ background: T.tealLight, color: T.teal, fontFamily: T.fontSerif }}>न</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Nyaya AI</span>
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", color: msg.role === "user" ? T.subtle : T.dark }}>
                  {msg.content}
                  {msg.isStreaming && <span className="inline-block w-[3px] h-[14px] ml-1 relative top-0.5" style={{ background: T.gold, animation: "blink 1s step-end infinite" }} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input bar */}
        <div className="absolute bottom-0 w-full pt-10 pb-6 px-6"
          style={{ background: "linear-gradient(to top, #fff 55%, rgba(255,255,255,0.7) 85%, transparent)" }}>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={e => { e.preventDefault(); submitQuery(prompt); }}
              className="flex flex-col p-2.5 rounded-2xl"
              style={{ background: T.bg, border: `0.5px solid ${T.border}`, boxShadow: "0 2px 20px rgba(14,15,16,0.06)" }}>
              <input type="file" accept="application/pdf,.txt" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} disabled={isGenerating}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitQuery(prompt); } }}
                placeholder="Describe your case facts or legal matter…"
                rows={3} className="bg-transparent px-3 py-2 outline-none text-[13px] resize-none"
                style={{ fontFamily: T.fontSans, color: T.dark }} />
              <div className="flex items-center gap-2 pt-2 px-1 border-t" style={{ borderColor: "rgba(14,15,16,0.06)" }}>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: T.muted }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(14,15,16,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={1.8}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <span className="text-[10px] ml-1" style={{ fontFamily: T.fontMono, color: T.muted }}>Attach PDF</span>
                <div className="flex-1" />
                <button type="submit" disabled={isGenerating || !prompt.trim()}
                  className="px-5 py-2 rounded-xl font-medium text-[12px] transition-all cursor-pointer"
                  style={{ background: prompt.trim() && !isGenerating ? T.dark : "rgba(14,15,16,0.05)", color: prompt.trim() && !isGenerating ? "#fff" : T.muted, fontFamily: T.fontSans }}>
                  {isGenerating ? "Generating…" : "Draft"}
                </button>
              </div>
            </form>
            <p className="text-center mt-2 text-[9px]" style={{ fontFamily: T.fontMono, color: T.muted, letterSpacing: "0.04em" }}>
              All processing is local — no data leaves your machine
            </p>
          </div>
        </div>
      </div>

      {/* PDF Panel */}
      {pdfUrl && (
        <div className="w-[46%] flex flex-col shrink-0" style={{ borderLeft: `0.5px solid ${T.border}`, background: T.bg, animation: "slideIn 0.3s ease" }}>
          <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ background: T.white, borderBottom: `0.5px solid ${T.border}` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.goldLight, color: T.gold }}>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <span style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 400, color: T.dark }}>Generated Document</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={pdfUrl} download className="px-3 py-1.5 rounded-lg text-[10px] font-semibold no-underline transition-colors cursor-pointer"
                style={{ background: T.gold, color: "#fff", fontFamily: T.fontMono, letterSpacing: "0.04em" }}>
                Download
              </a>
              <button onClick={() => setPdfUrl(null)} className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-colors"
                style={{ color: T.muted }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(14,15,16,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <iframe src={`${pdfUrl}#toolbar=1`}
              className="w-full h-full rounded-xl border-none"
              style={{ boxShadow: "0 4px 24px rgba(14,15,16,0.1)", border: `0.5px solid ${T.border}` }}
              title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Workspace (Tabbed) ────────────────────────────────── */
const TABS = [
  { id: "draft",   label: "Legal Drafter",    icon: <Scale size={14} /> },
  { id: "flaw",    label: "Flaw Analyzer",    icon: <AlertTriangle size={14} /> },
  { id: "ocr",     label: "PDF / OCR Parser", icon: <FileText size={14} /> },
  { id: "route",   label: "Route Inspector",  icon: <RouteIcon size={14} /> },
];

export default function DraftingWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("draft");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialFiles, setInitialFiles] = useState(null);
  const [caseCount, setCaseCount] = useState(0);

  useEffect(() => {
    const state = location.state;
    if (state?.initialPrompt || state?.initialFiles?.length) {
      setInitialPrompt(state.initialPrompt || "");
      setInitialFiles(state.initialFiles);
      setActiveTab("draft");
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: T.fontSans, background: T.bg, color: T.dark, height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar activePage="Drafting" />
      <div style={{ height: 72, flexShrink: 0 }} />

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-2 shrink-0" style={{ background: T.white, borderBottom: `0.5px solid ${T.border}` }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer"
            style={{
              fontFamily: T.fontSans,
              background: activeTab === tab.id ? T.tealLight : "transparent",
              color: activeTab === tab.id ? T.teal : T.muted,
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "draft" && (
          <LegalDrafter
            initialPrompt={initialPrompt}
            initialFiles={initialFiles}
            onCaseChange={() => setCaseCount(c => c + 1)}
          />
        )}
        {activeTab === "flaw" && (
          <div className="h-full max-w-3xl mx-auto">
            <FlawAnalyzerTool />
          </div>
        )}
        {activeTab === "ocr" && (
          <div className="h-full max-w-3xl mx-auto">
            <OcrTool />
          </div>
        )}
        {activeTab === "route" && (
          <div className="h-full max-w-3xl mx-auto">
            <RouteInspectorTool />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
