"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FolderOpen,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCode,
  Package,
  X,
  ArrowRight,
  HardDriveUpload,
  Shield,
  Folder,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

// ── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-xl border border-border bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:border-primary/30"
    >
      {dark
        ? <Sun size={15} className="text-yellow-400" />
        : <Moon size={15} className="text-muted-foreground" />
      }
    </button>
  );
}

interface SavedFile {
  id: number;
  name: string;
  size: number;
  savedAt: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  ".py":   <FileCode size={15} className="text-blue-400" />,
  ".js":   <FileCode size={15} className="text-yellow-400" />,
  ".ts":   <FileCode size={15} className="text-blue-500" />,
  ".jsx":  <FileCode size={15} className="text-cyan-400" />,
  ".tsx":  <FileCode size={15} className="text-cyan-500" />,
  ".java": <FileCode size={15} className="text-orange-400" />,
  ".go":   <FileCode size={15} className="text-cyan-400" />,
  ".php":  <FileCode size={15} className="text-purple-400" />,
  ".rs":   <FileCode size={15} className="text-orange-500" />,
  ".json": <FileText size={15} className="text-green-400" />,
  ".yaml": <FileText size={15} className="text-pink-400" />,
  ".yml":  <FileText size={15} className="text-pink-400" />,
  ".zip":  <Package  size={15} className="text-amber-400" />,
  ".tar":  <Package  size={15} className="text-amber-500" />,
};

function getExt(name: string) {
  return name.includes(".") ? "." + name.split(".").pop()!.toLowerCase() : "";
}
function getIcon(name: string) {
  return FILE_ICONS[getExt(name)] ?? <FileText size={15} className="text-slate-400" />;
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  files,
  dirName,
  onConfirm,
  onCancel,
}: {
  files: File[];
  dirName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const total = files.reduce((s, f) => s + f.size, 0);
  const preview = files.slice(0, 4);
  const extra  = files.length - preview.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative w-full max-w-[420px] rounded-3xl border border-white/10 bg-card shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in-up">

        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_24px_rgba(52,211,153,0.2)]">
            <HardDriveUpload size={24} className="text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Upload {files.length === 1 ? "file" : `${files.length} files`}?
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {files.length === 1
              ? "Confirm to save this file to your selected folder."
              : "Confirm to save all files to your selected folder."}
          </p>
        </div>

        {/* File preview */}
        <div className="mx-5 mb-4 rounded-2xl border border-border/60 bg-muted/30 overflow-hidden divide-y divide-border/40">
          {preview.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg border border-border/60 bg-muted flex items-center justify-center flex-shrink-0">
                {getIcon(f.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-foreground truncate leading-none">{f.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatBytes(f.size)}</p>
              </div>
            </div>
          ))}
          {extra > 0 && (
            <div className="px-4 py-2.5 text-xs text-muted-foreground text-center font-mono">
              + {extra} more {extra === 1 ? "file" : "files"}
            </div>
          )}
        </div>

        {/* Destination row */}
        <div className="mx-5 mb-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Folder size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Destination folder
            </p>
            <p className="text-sm font-mono font-medium text-foreground truncate mt-0.5">
              {dirName}
            </p>
          </div>
          {files.length > 1 && (
            <span className="text-xs font-mono text-primary flex-shrink-0 bg-primary/10 px-2 py-1 rounded-lg">
              {formatBytes(total)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-border bg-muted/50 hover:bg-muted text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 glow-green shadow-[0_4px_20px_rgba(52,211,153,0.25)]"
          >
            <Upload size={15} />
            Yes, Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Folder Confirm Modal ──────────────────────────────────────────────────────
function FolderConfirmModal({
  dirName,
  onConfirm,
  onCancel,
}: {
  dirName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />

      <div className="relative w-full max-w-[400px] rounded-3xl border border-white/10 bg-card shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in-up">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />

        <div className="px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_24px_rgba(52,211,153,0.2)]">
            <FolderOpen size={24} className="text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Confirm Upload Path
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Are you sure you want to upload files to this folder?
          </p>
        </div>

        <div className="mx-5 mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Folder size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Selected folder
            </p>
            <p className="text-sm font-mono font-semibold text-foreground truncate mt-0.5">
              {dirName}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-border bg-muted/50 hover:bg-muted text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 glow-green shadow-[0_4px_20px_rgba(52,211,153,0.25)]"
          >
            <CheckCircle2 size={15} />
            Yes, Use This Folder
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dirName,   setDirName]   = useState("");
  const [pendingHandle, setPendingHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [pendingDirName, setPendingDirName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const inputRef   = useRef<HTMLInputElement>(null);
  const counterRef = useRef(0);

  const pickFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      // Show confirmation modal before committing
      setPendingHandle(handle);
      setPendingDirName(handle.name);
      setError("");
    } catch (e: any) {
      if (e.name !== "AbortError") setError("Could not open folder: " + e.message);
    }
  };

  const confirmFolder = () => {
    if (!pendingHandle) return;
    setDirHandle(pendingHandle);
    setDirName(pendingDirName);
    setPendingHandle(null);
    setPendingDirName("");
  };

  const cancelFolder = () => {
    setPendingHandle(null);
    setPendingDirName("");
  };

  const doSave = useCallback(async (files: File[]) => {
    if (!dirHandle) return;
    setSaving(true);
    setError("");
    for (const file of files) {
      try {
        const safeName  = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
        const fh        = await dirHandle.getFileHandle(safeName, { create: true });
        const writable  = await (fh as any).createWritable();
        await writable.write(file);
        await writable.close();
        setSavedFiles((prev) => [{
          id: ++counterRef.current,
          name: safeName,
          size: file.size,
          savedAt: new Date().toLocaleTimeString(),
        }, ...prev]);
      } catch (e: any) {
        setError("Failed to save \"" + file.name + "\": " + e.message);
      }
    }
    setSaving(false);
  }, [dirHandle]);

  const queueFiles = (files: File[]) => {
    if (files.length > 0) setPendingFiles(files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    queueFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!dirHandle) return;
    queueFiles(Array.from(e.dataTransfer.files));
  }, [dirHandle]);

  const handleConfirm = async () => {
    const f = pendingFiles;
    setPendingFiles([]);
    await doSave(f);
  };

  // ── STEP 1: Pick folder ────────────────────────────────────────────────────
  if (!dirHandle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {pendingHandle && (
          <FolderConfirmModal
            dirName={pendingDirName}
            onConfirm={confirmFolder}
            onCancel={cancelFolder}
          />
        )}
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Toggle pinned top-right */}
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>

        <div className="relative w-full max-w-md space-y-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={18} className="text-primary" />
            <span className="font-display font-bold text-base text-foreground tracking-tight">VulnScan</span>
          </div>

          {/* Icon */}
          <div>
            <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.15)] mb-6">
              <FolderOpen size={42} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-3xl text-foreground leading-tight">
              Select Destination<br />Folder First
            </h1>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-sm mx-auto">
              Choose the folder on your computer where all uploaded files will be saved. You can upload any number of files afterwards.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={pickFolder}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 glow-green shadow-[0_8px_32px_rgba(52,211,153,0.3)]"
          >
            <FolderOpen size={20} />
            Browse &amp; Select Folder
            <ArrowRight size={18} />
          </button>

          {/* Steps hint */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">1</span>
              Select folder
            </span>
            <div className="w-8 h-px bg-border" />
            <span className="flex items-center gap-1.5 opacity-40">
              <span className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-[10px]">2</span>
              Upload files
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm justify-center bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 2: Upload zone ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Confirm modal */}
      {pendingFiles.length > 0 && (
        <ConfirmModal
          files={pendingFiles}
          dirName={dirName}
          onConfirm={handleConfirm}
          onCancel={() => setPendingFiles([])}
        />
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="font-display font-bold text-sm text-foreground">VulnScan</span>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Folder size={12} className="text-primary" />
            </div>
            <span className="text-sm font-mono text-foreground truncate">{dirName}</span>
          </div>

          <button
            onClick={pickFolder}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted border border-transparent hover:border-border flex-shrink-0"
          >
            <RefreshCw size={11} />
            Change
          </button>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

          {/* ── Left: Upload zone ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Upload Zone */}
            <div
              onClick={() => !saving && inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={cn(
                "relative flex-1 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden select-none",
                isDragging
                  ? "border-primary bg-primary/5 drop-zone-active scale-[1.005]"
                  : "border-border bg-muted/10 hover:border-primary/40 hover:bg-primary/[0.03]",
                saving && "cursor-not-allowed opacity-50 pointer-events-none"
              )}
            >
              {isDragging && (
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-line pointer-events-none z-10" />
              )}

              <div className="py-20 flex flex-col items-center gap-5 text-center px-6">
                <div className={cn(
                  "w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-300",
                  isDragging
                    ? "border-primary/60 bg-primary/15 scale-110 shadow-[0_0_40px_rgba(52,211,153,0.25)]"
                    : "border-border bg-muted"
                )}>
                  <Upload size={34} className={cn(
                    "transition-colors duration-300",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                <div>
                  <p className="font-display font-bold text-foreground text-2xl">
                    {saving ? "Saving files…" : isDragging ? "Release to upload" : "Drop files here"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1.5">
                    or{" "}
                    <span className="text-primary underline underline-offset-2">click to browse</span>
                    {" "}your computer
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-3 font-mono">
                    Saving to → <span className="text-primary/80">{dirName}</span>
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                  {[".py",".js",".ts",".java",".go",".json",".zip","…"].map((e) => (
                    <span key={e} className="px-2 py-0.5 rounded-md text-xs font-mono bg-muted border border-border text-muted-foreground">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <input ref={inputRef} type="file" accept="*" multiple className="hidden" onChange={onInputChange} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* ── Right: Uploaded files panel ───────────────────────────────── */}
          <div className="rounded-3xl border border-border bg-card/40 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={savedFiles.length > 0 ? "text-emerald-400" : "text-muted-foreground/40"} />
                <span className="text-sm font-semibold text-foreground">
                  Uploaded Files
                </span>
                {savedFiles.length > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {savedFiles.length}
                  </span>
                )}
              </div>
              {savedFiles.length > 0 && (
                <button
                  onClick={() => setSavedFiles([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted"
                >
                  <X size={11} /> Clear all
                </button>
              )}
            </div>

            {/* File list */}
            <div className="flex-1 overflow-y-auto">
              {savedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl border border-border bg-muted flex items-center justify-center">
                    <FileText size={22} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No files uploaded yet</p>
                  <p className="text-xs text-muted-foreground/60">Files you upload will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {savedFiles.map((f, idx) => (
                    <div
                      key={f.id}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30",
                        idx === 0 && "animate-fade-in-up"
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        {getIcon(f.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-medium text-foreground truncate leading-none">
                          {f.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(f.size)} · {f.savedAt}
                        </p>
                      </div>
                      <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
