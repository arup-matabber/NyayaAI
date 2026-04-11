import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Icons ───────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const FileIcon = ({ type }) => {
  if (type.startsWith("image/")) return "️";
  if (type.startsWith("video/")) return "";
  return "";
};

/* ─── Upload Panel ────────────────────────────────────────────── */
function UploadPanel({ isOpen, onClose, selectedFiles, onFilesChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    /* Delay to avoid immediate close from the "+" click */
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, onClose]);

  const handleFiles = useCallback(
    (files) => {
      const arr = Array.from(files);
      onFilesChange((prev) => [...prev, ...arr]);
    },
    [onFilesChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    onFilesChange((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div
      ref={panelRef}
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{
        maxHeight: isOpen ? 420 : 0,
        opacity: isOpen ? 1 : 0,
        marginTop: isOpen ? 12 : 0,
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "0.5px solid rgba(14,15,16,0.10)",
          boxShadow: "0 4px 24px rgba(14,15,16,0.08), 0 1px 3px rgba(14,15,16,0.04)",
        }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: "rgba(245,242,235,0.6)", borderColor: "rgba(14,15,16,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                color: "#9a9ba0",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Upload Documents
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
            style={{ color: "#9a9ba0", background: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(14,15,16,0.06)";
              e.currentTarget.style.color = "#0e0f10";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#9a9ba0";
            }}
          >
            
          </button>
        </div>

        {/* Drop zone */}
        <div
          className="m-4 sm:m-5 p-6 sm:p-8 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all duration-200"
          style={{
            border: `1.5px dashed ${isDragging ? "#1a5c60" : "rgba(14,15,16,0.15)"}`,
            background: isDragging ? "rgba(216,236,236,0.25)" : "transparent",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi"
            className="hidden"
            onChange={(e) => {
              if (e.target.files.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200"
            style={{
              background: isDragging ? "#1a5c60" : "#d8ecec",
              color: isDragging ? "#fff" : "#1a5c60",
              transform: isDragging ? "scale(1.1)" : "scale(1)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <h3
            className="mb-1.5"
            style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 400, color: "#0e0f10" }}
          >
            {isDragging ? "Drop files here" : "Drop your files here"}
          </h3>
          <p className="mb-3 text-[13px]" style={{ color: "#9a9ba0" }}>
            Or click to browse your files
          </p>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: "#9a9ba0",
              letterSpacing: "0.06em",
            }}
          >
            PDF · DOCX · Images · Videos · up to 50 MB
          </span>
        </div>

        {/* Selected files */}
        {selectedFiles.length > 0 && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2">
            {selectedFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150"
                style={{ background: "rgba(245,242,235,0.5)", border: "0.5px solid rgba(14,15,16,0.08)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">
                    <FileIcon type={file.type} />
                  </span>
                  <div className="min-w-0">
                    <p
                      className="truncate text-[13px] font-medium"
                      style={{ color: "#0e0f10", fontFamily: "'DM Sans',sans-serif", maxWidth: 220 }}
                    >
                      {file.name}
                    </p>
                    <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0" }}>
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors duration-150"
                  style={{ color: "#9a9ba0", fontSize: 12 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#e53e3e"; e.currentTarget.style.background = "rgba(229,62,62,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#9a9ba0"; e.currentTarget.style.background = "transparent"; }}
                >
                  
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-2 border-t" style={{ borderColor: "rgba(14,15,16,0.08)" }}>
          {[
            { icon: "", label: "Encrypted & Private" },
            { icon: "", label: "AI-Powered Analysis" },
          ].map(({ icon, label }, i) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 text-[11px] font-medium ${i === 0 ? "border-r" : ""}`}
              style={{
                fontFamily: "'DM Sans',sans-serif",
                color: "#4a4b4f",
                borderColor: "rgba(14,15,16,0.08)",
              }}
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Input Bar ──────────────────────────────────────────── */
export default function ChatInputBar({
  isUploadOpen,
  onToggleUpload,
  selectedFiles,
  onFilesChange,
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!query.trim() && selectedFiles.length === 0) return;
    navigate("/draft", {
       state: { initialPrompt: query, initialFiles: selectedFiles }
    });
    setQuery("");
    if (onFilesChange) onFilesChange([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 w-full animate-[fadeIn_1.4s_ease]">
      {/* Input container */}
      <div
        className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 transition-shadow duration-300 focus-within:shadow-lg"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "0.5px solid rgba(14,15,16,0.12)",
          boxShadow: "0 2px 16px rgba(14,15,16,0.06), 0 1px 3px rgba(14,15,16,0.04)",
        }}
      >
        {/* Plus button */}
        <button
          onClick={onToggleUpload}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
          style={{
            background: isUploadOpen ? "#1a5c60" : "rgba(14,15,16,0.04)",
            color: isUploadOpen ? "#fff" : "#9a9ba0",
            transform: isUploadOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
          onMouseEnter={(e) => {
            if (!isUploadOpen) {
              e.currentTarget.style.background = "rgba(14,15,16,0.08)";
              e.currentTarget.style.color = "#0e0f10";
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploadOpen) {
              e.currentTarget.style.background = "rgba(14,15,16,0.04)";
              e.currentTarget.style.color = "#9a9ba0";
            }
          }}
        >
          <PlusIcon />
        </button>

        {/* File count badge */}
        {selectedFiles.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{
              background: "#d8ecec",
              fontFamily: "'DM Mono',monospace",
              fontSize: 11,
              color: "#1a5c60",
              fontWeight: 500,
            }}
          >
             {selectedFiles.length}
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or upload files..."
          className="flex-1 bg-transparent outline-none text-[14px] sm:text-[15px] min-w-0"
          style={{
            fontFamily: "'DM Sans',sans-serif",
            color: "#0e0f10",
            caretColor: "#1a5c60",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
          style={{
            background: query.trim() || selectedFiles.length > 0 ? "#0e0f10" : "rgba(14,15,16,0.04)",
            color: query.trim() || selectedFiles.length > 0 ? "#fff" : "#9a9ba0",
          }}
          onMouseEnter={(e) => {
            if (query.trim() || selectedFiles.length > 0) {
              e.currentTarget.style.background = "#1a5c60";
            }
          }}
          onMouseLeave={(e) => {
            if (query.trim() || selectedFiles.length > 0) {
              e.currentTarget.style.background = "#0e0f10";
            }
          }}
        >
          <SendIcon />
        </button>
      </div>

      {/* Upload panel (expandable) */}
      <UploadPanel
        isOpen={isUploadOpen}
        onClose={onToggleUpload}
        selectedFiles={selectedFiles}
        onFilesChange={onFilesChange}
      />
    </div>
  );
}
