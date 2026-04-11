/**
 * api.js — Nyaya AI Frontend API Service Layer
 * Connects directly to the Engine Server on localhost:8000
 */

const API_BASE = "http://localhost:8000/api";

// ─── Cases ───────────────────────────────────────────────────────
export async function listCases() {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) return { cases: [] };
    return res.json();
  } catch {
    return { cases: [] };
  }
}

// ─── Chat / Stream (main generation pipeline) ───────────────────
export async function streamChat(prompt, caseId, { onInit, onToken, onStatus, onMetadata, onDone, onError }) {
  try {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, case_id: caseId }),
    });

    if (!res.ok) { onError?.(`Server error: ${res.status}`); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "init") onInit?.(payload.case_id);
            if (payload.type === "token") onToken?.(payload.content);
            if (payload.type === "status") onStatus?.(payload.content);
            if (payload.type === "metadata") onMetadata?.(payload.content);
            if (payload.type === "done") onDone?.();
            if (payload.type === "error") onError?.(payload.content);
          } catch (e) { /* malformed json chunk, skip */ }
        }
      }
    }
  } catch (err) {
    onError?.(err.message);
  }
}

// ─── Upload (OCR) ────────────────────────────────────────────────
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// ─── Route (classify prompt) ─────────────────────────────────────
export async function routePrompt(prompt) {
  try {
    const res = await fetch(`${API_BASE}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Analyze (flaw detection) ────────────────────────────────────
export async function analyzeFlaws(text, context = "") {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── PDF URL helper ──────────────────────────────────────────────
export function getPDFDownloadURL(filename) {
  return `${API_BASE}/documents/${filename}`;
}
