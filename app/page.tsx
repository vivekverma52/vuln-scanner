"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload, Link2, Globe, CheckCircle2, AlertTriangle,
  FileText, FileCode, Package, X, HardDriveUpload,
  Folder, ExternalLink, Rss, Search,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import NewScanModal from "@/components/NewScanModal";
import ScanResultsView from "@/components/ScanResultsView";
import type { ScanResult } from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────────────────
const FILE_ICONS: Record<string, React.ReactNode> = {
  ".py":   <FileCode size={14} className="text-blue-400" />,
  ".js":   <FileCode size={14} className="text-yellow-400" />,
  ".ts":   <FileCode size={14} style={{ color: "#42A5F5" }} />,
  ".jsx":  <FileCode size={14} style={{ color: "#00BCD4" }} />,
  ".tsx":  <FileCode size={14} style={{ color: "#00BCD4" }} />,
  ".java": <FileCode size={14} className="text-orange-400" />,
  ".go":   <FileCode size={14} style={{ color: "#00BCD4" }} />,
  ".php":  <FileCode size={14} className="text-purple-400" />,
  ".rs":   <FileCode size={14} className="text-orange-500" />,
  ".json": <FileText size={14} className="text-green-400" />,
  ".yaml": <FileText size={14} className="text-pink-400" />,
  ".yml":  <FileText size={14} className="text-pink-400" />,
  ".zip":  <Package  size={14} className="text-amber-400" />,
  ".tar":  <Package  size={14} className="text-amber-500" />,
  ".pdf":  <FileText size={14} className="text-red-400" />,
  ".docx": <FileText size={14} className="text-blue-300" />,
  ".xlsx": <FileText size={14} className="text-green-300" />,
};
function getExt(n: string) { return n.includes(".") ? "." + n.split(".").pop()!.toLowerCase() : ""; }
function getIcon(n: string) { return FILE_ICONS[getExt(n)] ?? <FileText size={14} style={{ color: "#7A9CB8" }} />; }

interface SavedFile { id: number; name: string; size: number; savedAt: string; savedPath: string; }

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ files, dirName, onConfirm, onCancel }: {
  files: File[]; dirName: string; onConfirm: () => void; onCancel: () => void;
}) {
  const total   = files.reduce((s, f) => s + f.size, 0);
  const preview = files.slice(0, 4);
  const extra   = files.length - preview.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(4,14,26,0.8)" }} onClick={onCancel} />
      <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#0E2337", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,transparent,#1565C0,transparent)" }} />
        <div className="px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.25)" }}>
            <HardDriveUpload size={24} style={{ color: "#42A5F5" }} />
          </div>
          <h2 className="font-bold text-xl text-white">Upload {files.length === 1 ? "file" : `${files.length} files`}?</h2>
          <p className="text-sm mt-1.5" style={{ color: "#7A9CB8" }}>Files will be saved to your selected folder.</p>
        </div>
        <div className="mx-5 mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #1A3050" }}>
          {preview.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < preview.length - 1 ? "1px solid #1A3050" : undefined }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#142840", border: "1px solid #1A3050" }}>{getIcon(f.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-white truncate leading-none">{f.name}</p>
                <p className="text-xs mt-1" style={{ color: "#7A9CB8" }}>{formatBytes(f.size)}</p>
              </div>
            </div>
          ))}
          {extra > 0 && (
            <div className="px-4 py-2.5 text-xs font-mono text-center"
              style={{ color: "#7A9CB8", borderTop: "1px solid #1A3050" }}>+ {extra} more</div>
          )}
        </div>
        <div className="mx-5 mb-5 rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ border: "1px solid rgba(21,101,192,0.25)", background: "rgba(21,101,192,0.07)" }}>
          <Folder size={16} style={{ color: "#42A5F5" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider" style={{ color: "#7A9CB8" }}>Destination</p>
            <p className="text-sm font-mono font-medium text-white truncate">{dirName}</p>
          </div>
          {files.length > 1 && (
            <span className="text-xs font-mono px-2 py-1 rounded-lg"
              style={{ color: "#42A5F5", background: "rgba(21,101,192,0.1)" }}>{formatBytes(total)}</span>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-6">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ border: "1px solid #1A3050", background: "rgba(255,255,255,0.03)", color: "#7A9CB8" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-[2] py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
            style={{ background: "#1565C0", boxShadow: "0 4px 20px rgba(21,101,192,0.3)" }}>
            <Upload size={15} /> Yes, Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Uploaded Files Panel ──────────────────────────────────────────────────────
function UploadedFilesPanel({ files, uploadDir, onClear }: { files: SavedFile[]; uploadDir: string; onClear: () => void }) {
  if (files.length === 0) return null;
  const latest = files[0];
  const rest   = files.slice(1);
  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <HardDriveUpload size={15} style={{ color: "#42A5F5" }} />
          <span className="text-white font-semibold text-sm">Uploaded Files</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: "rgba(21,101,192,0.15)", color: "#42A5F5" }}>{files.length}</span>
        </div>
        <button onClick={onClear} className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: "#7A9CB8" }}>
          <X size={11} /> Clear all
        </button>
      </div>

      {/* Latest upload — highlighted */}
      <div className="rounded-2xl p-4 mb-3 flex items-center gap-4"
        style={{ background: "rgba(21,101,192,0.1)", border: "1px solid rgba(21,101,192,0.3)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.3)" }}>
          {getIcon(latest.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-mono font-semibold text-white truncate">{latest.name}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>LATEST</span>
          </div>
          <p className="text-xs" style={{ color: "#7A9CB8" }}>
            {formatBytes(latest.size)} · Saved at {latest.savedAt} · <span className="font-mono">{uploadDir || latest.savedPath}</span>
          </p>
        </div>
        <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
      </div>

      {/* All previous files */}
      {rest.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1A3050" }}>
          {rest.map((f, i) => (
            <div key={f.id} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < rest.length - 1 ? "1px solid #1A3050" : undefined, background: "#0E2337" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#142840", border: "1px solid #1A3050" }}>
                {getIcon(f.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-white truncate">{f.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#7A9CB8" }}>{formatBytes(f.size)} · {f.savedAt}</p>
              </div>
              <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── IndexedDB helpers — persist the chosen folder across sessions ─────────────
const DB_NAME = "vuln-scanner";
const STORE   = "handles";
const KEY     = "scanDir";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function saveHandle(h: FileSystemDirectoryHandle) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(h, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx  = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch { return null; }
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [savedFiles,   setSavedFiles]   = useState<SavedFile[]>([]);
  const [dirHandle,    setDirHandle]    = useState<FileSystemDirectoryHandle | null>(null);
  const [uploadDir,    setUploadDir]    = useState("C:\\scan");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showNewScan,  setShowNewScan]  = useState(false);
  const [scanResult,   setScanResult]   = useState<ScanResult | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const counterRef = useRef(0);

  // On mount: restore previously saved folder handle from IndexedDB
  useEffect(() => {
    loadHandle().then(async (h) => {
      if (!h) return;
      try {
        const perm = await (h as any).requestPermission({ mode: "readwrite" });
        if (perm === "granted") {
          setDirHandle(h);
          setUploadDir(h.name);
        }
      } catch { /* permission denied or API unavailable */ }
    });
  }, []);

  // Ask user to select their local C:\scan folder (one-time, then remembered)
  const pickFolder = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
      const h = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setDirHandle(h);
      setUploadDir(h.name);
      await saveHandle(h);   // persist so next visit needs no picker
      return h;
    } catch (e: any) {
      if (e.name !== "AbortError") setError("Could not open folder: " + e.message);
      return null;
    }
  };

  const saveFilesToFolder = useCallback(async (files: File[], handle: FileSystemDirectoryHandle) => {
    setSaving(true);
    setError("");
    for (const file of files) {
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
        const fh       = await handle.getFileHandle(safeName, { create: true });
        const writable = await (fh as any).createWritable();
        await writable.write(file);
        await writable.close();
        setSavedFiles((prev) => [{
          id: ++counterRef.current, name: safeName, size: file.size,
          savedAt: new Date().toLocaleTimeString(), savedPath: handle.name + "\\" + safeName,
        }, ...prev]);
      } catch (e: any) {
        setError(`Failed to save "${file.name}": ${e.message}`);
      }
    }
    setSaving(false);
  }, []);

  // "Submit File" clicked — pick folder once, then reuse forever
  const handleSubmitFile = async () => {
    let h = dirHandle;
    if (!h) {
      h = await pickFolder();
      if (!h) return;
    }
    inputRef.current?.click();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) setPendingFiles(files);
    e.target.value = "";
  };

  const onScanComplete = useCallback(async (result: ScanResult) => {
    setScanResult(result);
    setShowNewScan(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#071B2D" }}>

      {/* Sidebar */}
      <Sidebar
        onNewScan={() => setShowNewScan(true)}
        dirName={uploadDir || "Server storage"}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Modals */}
        {showNewScan && (
          <NewScanModal onClose={() => setShowNewScan(false)} onComplete={onScanComplete} />
        )}
        {pendingFiles.length > 0 && (
          <ConfirmModal
            files={pendingFiles}
            dirName={uploadDir || "Server storage"}
            onConfirm={async () => { const f = pendingFiles; setPendingFiles([]); if (dirHandle) await saveFilesToFolder(f, dirHandle); }}
            onCancel={() => setPendingFiles([])}
          />
        )}

        {scanResult ? (
          <ScanResultsView
            result={scanResult}
            onNewScan={() => { setScanResult(null); setShowNewScan(true); }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto relative">

            {/* World-map background */}
            <div className="absolute inset-0 world-map-bg pointer-events-none" />

            <div className="relative px-10 py-10 max-w-[1100px]">

              {/* ── Header ── */}
              <h1 className="text-white font-bold text-3xl leading-tight mb-1">Start your analysis</h1>
              <p className="text-sm mb-5" style={{ color: "#7A9CB8" }}>
                Interact with cyber threats inside Windows, Linux, macOS, and Android VMs to trigger full attack execution.
              </p>

              {/* ── Save location banner ── */}
              <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-xl w-fit"
                style={{ background: "rgba(21,101,192,0.08)", border: "1px solid rgba(21,101,192,0.25)" }}>
                <Folder size={15} style={{ color: "#42A5F5", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "#7A9CB8" }}>Files will be saved to</span>
                <span className="text-sm font-mono font-semibold" style={{ color: "#42A5F5" }}>{uploadDir || "Server storage"}</span>
              </div>

              {/* ── Deep analysis section ── */}
              <p className="text-white font-semibold text-sm mb-4">Deep interactive investigation in full environment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">

                {/* Submit File / Email */}
                <button
                  onClick={handleSubmitFile}
                  disabled={saving}
                  className="group relative rounded-2xl p-8 flex flex-col items-center gap-4 text-center transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "#0E2845", border: "1px solid #1A3A5C" }}
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.25)" }}>
                    <Upload size={30} style={{ color: "#6AB4FF" }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">Submit File / Email</p>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#7A9CB8" }}>
                      Save to <span className="font-mono" style={{ color: "#42A5F5" }}>{uploadDir || "Server storage"}</span>
                    </p>
                  </div>
                  {saving && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                      style={{ background: "rgba(14,40,69,0.8)" }}>
                      <p className="text-sm text-white">Saving…</p>
                    </div>
                  )}
                </button>

                {/* Submit URL */}
                <button
                  onClick={() => setShowNewScan(true)}
                  className="group rounded-2xl p-8 flex flex-col items-center gap-4 text-center transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: "#0E2845", border: "1px solid #1A3A5C" }}
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.25)" }}>
                    <Link2 size={30} style={{ color: "#6AB4FF" }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">Submit URL</p>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#7A9CB8" }}>
                      Investigate malicious and phishing activity and inspect downloaded files
                    </p>
                  </div>
                </button>

                {/* Check Suspicious Links — Safebrowsing */}
                <button
                  className="group rounded-2xl p-8 flex flex-col items-center gap-4 text-center transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: "#0D2540", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded font-bold"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#FBBF24" }}>beta</div>
                  <div className="relative w-full flex flex-col items-center gap-4">
                    <p className="self-start text-xs font-semibold" style={{ color: "#FBBF24" }}>Safebrowsing</p>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <Globe size={30} style={{ color: "#FBBF24" }} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">Check Suspicious Links</p>
                      <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#7A9CB8" }}>
                        Open any URL to verify its content fast and easily
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* ── SOC section ── */}
              <p className="text-white font-semibold text-sm mb-4">Power your SOC with VulnScan solutions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 hover:brightness-110"
                  style={{ background: "#0E2845", border: "1px solid #1A3A5C" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.2)" }}>
                      <Rss size={16} style={{ color: "#6AB4FF" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">TI Feeds</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A9CB8" }}>Prevent attacks with actionable IOC</p>
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: "#7A9CB8" }} />
                </button>

                <button className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 hover:brightness-110"
                  style={{ background: "#0E2845", border: "1px solid #1A3A5C" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.2)" }}>
                      <Search size={16} style={{ color: "#6AB4FF" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">TI Lookup</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A9CB8" }}>Enrich investigations and respond</p>
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: "#7A9CB8" }} />
                </button>
              </div>

              {error && (
                <div className="mt-6 flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <AlertTriangle size={14} className="flex-shrink-0" />{error}
                </div>
              )}

              <UploadedFilesPanel files={savedFiles} uploadDir={uploadDir} onClear={() => setSavedFiles([])} />
            </div>

            {/* Status bar */}
            <div className="fixed bottom-0 left-[210px] right-0 flex items-center justify-end px-6 py-2.5 text-xs"
              style={{ background: "rgba(7,27,45,0.9)", borderTop: "1px solid #1A3050", backdropFilter: "blur(6px)" }}>
              <span style={{ color: "#7A9CB8" }}>Your current status</span>
              <span className="mx-2 px-2 py-0.5 rounded text-white font-bold text-[11px]"
                style={{ background: "#1565C0" }}>Free</span>
              <span style={{ color: "#7A9CB8" }}>Access Period:</span>
              <span className="ml-1 text-white font-medium">unlimited</span>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input ref={inputRef} type="file" accept="*" multiple className="hidden" onChange={onInputChange} />
      </div>

    </div>
  );
}
