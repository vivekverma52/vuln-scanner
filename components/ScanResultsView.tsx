"use client";

import { useState, useEffect, useRef } from "react";
import {
  RefreshCw, Download, Share2, Info, Shield,
  Activity, ChevronDown, X,
} from "lucide-react";
import { ScanResult, Severity } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { cn } from "@/lib/utils";

interface ScanResultsViewProps {
  result: ScanResult;
  onNewScan?: () => void;
}

type RightTab   = "Results" | "Get sample" | "Restart";
type BottomTab  = "Vulnerabilities" | "Behaviors" | "Network Threats" | "Files Modified";
type SevFilter  = "all" | Severity;

const BOTTOM_TABS: BottomTab[] = ["Vulnerabilities", "Behaviors", "Network Threats", "Files Modified"];

const SEV_COLORS: Record<Severity, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#34d399",
  info:     "#00bcd4",
};

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function fakeMd5(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return (hex.repeat(5) + "0".repeat(32)).slice(0, 32).toUpperCase();
}

export default function ScanResultsView({ result, onNewScan }: ScanResultsViewProps) {
  const [rightTab,   setRightTab]   = useState<RightTab>("Results");
  const [bottomTab,  setBottomTab]  = useState<BottomTab>("Vulnerabilities");
  const [sevFilter,  setSevFilter]  = useState<SevFilter>("all");
  const [elapsed,    setElapsed]    = useState(0);
  const [filterText, setFilterText] = useState("");
  const [onlyImportant, setOnlyImportant] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const md5 = fakeMd5(result.fileName);

  const visibleVulns = result.vulnerabilities.filter((v) => {
    if (sevFilter !== "all" && v.severity !== sevFilter) return false;
    if (onlyImportant && v.severity !== "critical" && v.severity !== "high") return false;
    if (filterText && !v.title.toLowerCase().includes(filterText.toLowerCase()) && !v.id.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const cpuPct = Math.min(95, 20 + result.summary.critical * 12 + result.summary.high * 6);
  const ramPct = Math.min(92, 18 + result.summary.total * 3);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#071B2D" }}>

      {/* ── Top status bar ── */}
      <div
        className="flex items-center gap-4 px-5 py-2 flex-shrink-0 text-xs"
        style={{ background: "#0B2035", borderBottom: "1px solid #1A3050" }}
      >
        <span
          className="font-semibold"
          style={{ color: result.summary.critical > 0 ? "#ef4444" : result.summary.high > 0 ? "#f97316" : "#34d399" }}
        >
          {result.summary.critical > 0
            ? `${result.summary.critical} critical threat${result.summary.critical > 1 ? "s" : ""} detected`
            : result.summary.total > 0
            ? `${result.summary.total} issue${result.summary.total > 1 ? "s" : ""} detected`
            : "No threats detected"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onNewScan}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors"
            style={{ color: "#7A9CB8", border: "1px solid #1A3050" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#142840"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#7A9CB8"; e.currentTarget.style.background = ""; }}
          >
            <RefreshCw size={12} /> New analysis
          </button>
          <button
            className="p-1.5 rounded transition-colors"
            style={{ color: "#7A9CB8" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#142840"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#7A9CB8"; e.currentTarget.style.background = ""; }}
          >
            <Download size={14} />
          </button>
          <button
            className="p-1.5 rounded transition-colors"
            style={{ color: "#7A9CB8" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#142840"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#7A9CB8"; e.currentTarget.style.background = ""; }}
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ══ Left: code/analysis view ══ */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: "1px solid #1A3050" }}>

          {/* Titlebar */}
          <div
            className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
            style={{ background: "#0B2035", borderBottom: "1px solid #1A3050" }}
          >
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#eab308" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
            </div>
            <span className="font-mono text-xs truncate" style={{ color: "#7A9CB8" }}>
              {result.fileName}
            </span>
            <div className="ml-auto flex items-center gap-3 text-xs" style={{ color: "#7A9CB8" }}>
              <span className="flex items-center gap-1">
                <Activity size={11} style={{ color: "#34d399" }} />
                {fmtTime(elapsed + 66)}
              </span>
            </div>
          </div>

          {/* Code viewer */}
          <div className="flex-1 overflow-auto font-mono text-xs p-2">
            {result.vulnerabilities.length > 0 ? (
              <table className="w-full border-separate" style={{ borderSpacing: "0 1px" }}>
                <tbody>
                  {result.vulnerabilities.map((vuln, i) => (
                    <tr
                      key={vuln.id}
                      className="group cursor-pointer transition-colors"
                      style={{
                        background: vuln.severity === "critical"
                          ? "rgba(239,68,68,0.06)"
                          : vuln.severity === "high"
                          ? "rgba(249,115,22,0.04)"
                          : "transparent",
                        borderLeft: vuln.severity === "critical" || vuln.severity === "high"
                          ? `2px solid ${SEV_COLORS[vuln.severity]}`
                          : "2px solid transparent",
                      }}
                    >
                      {/* Line number */}
                      <td
                        className="pl-3 pr-3 py-1.5 text-right select-none w-10"
                        style={{ color: "#3A5A7A" }}
                      >
                        {vuln.line}
                      </td>

                      {/* Dot */}
                      <td className="pr-2 py-1.5 w-4">
                        <span style={{ color: SEV_COLORS[vuln.severity] }}>●</span>
                      </td>

                      {/* Code / snippet */}
                      <td className="py-1.5 pr-2 max-w-0 w-full">
                        <p className="truncate" style={{ color: "#A8C8E0" }}>
                          {vuln.snippet ?? `# ${vuln.title}`}
                        </p>
                        <p
                          className="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: SEV_COLORS[vuln.severity] }}
                        >
                          [{vuln.cwe}] {vuln.title}
                        </p>
                      </td>

                      {/* Badge */}
                      <td className="py-1.5 pr-3 w-24">
                        <SeverityBadge severity={vuln.severity} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "#3A5A7A" }}>
                <Shield size={36} className="opacity-30" />
                <p className="text-sm">No vulnerabilities found</p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div
            className="flex items-center justify-center py-2 flex-shrink-0 font-mono text-[10px] tracking-widest uppercase"
            style={{ borderTop: "1px solid #1A3050", color: "#3A5A7A" }}
          >
            <span className="animate-pulse">← MOVE YOUR MOUSE TO VIEW DETAILS →</span>
          </div>
        </div>

        {/* ══ Right: file info + vuln list ══ */}
        <div className="w-[340px] flex-shrink-0 flex flex-col overflow-hidden">

          {/* File info */}
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #1A3050" }}>
            <div className="flex items-start gap-3">
              {/* Windows icon */}
              <div
                className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(21,101,192,0.15)", border: "1px solid rgba(21,101,192,0.3)" }}
              >
                <svg width="20" height="20" viewBox="0 0 88 88">
                  <rect x="0"  y="0"  width="40" height="40" fill="#00ADEF"/>
                  <rect x="48" y="0"  width="40" height="40" fill="#00ADEF"/>
                  <rect x="0"  y="48" width="40" height="40" fill="#00ADEF"/>
                  <rect x="48" y="48" width="40" height="40" fill="#00ADEF"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium truncate" style={{ color: "#00BCD4" }}>
                  {result.fileName}
                </p>
                <p className="text-[10px] font-mono mt-1 truncate" style={{ color: "#7A9CB8" }}>
                  MD5: {md5}
                </p>
                <p className="text-[10px] font-mono" style={{ color: "#7A9CB8" }}>
                  Start: {new Date(result.scannedAt).toLocaleString()}
                </p>
                <p className="text-[10px] font-mono" style={{ color: "#7A9CB8" }}>
                  Total time: {fmtTime(elapsed + 66)} s
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button className="p-1 transition-colors" style={{ color: "#7A9CB8" }}>
                  <Info size={14} />
                </button>
                <button className="p-1 transition-colors" style={{ color: "#7A9CB8" }}>
                  <Share2 size={14} />
                </button>
                <button className="p-1 transition-colors" style={{ color: "#7A9CB8" }}>
                  <Download size={14} />
                </button>
              </div>
            </div>
            <button className="mt-2 text-[10px] transition-colors" style={{ color: "#1E88E5" }}>
              + Add tags
            </button>
          </div>

          {/* Right tabs */}
          <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid #1A3050" }}>
            {(["Results", "Get sample", "Restart"] as RightTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={cn(
                  "relative flex-1 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap px-2",
                  rightTab === t ? "text-white" : "hover:text-white"
                )}
                style={{ color: rightTab === t ? "#fff" : "#7A9CB8" }}
              >
                {t}
                {t === "Results" && result.summary.total > 0 && (
                  <span
                    className="ml-1 text-[9px] px-1 rounded"
                    style={{ background: "rgba(0,137,123,0.2)", color: "#00BCD4" }}
                  >
                    new
                  </span>
                )}
                {rightTab === t && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5" style={{ background: "#00BCD4" }} />
                )}
              </button>
            ))}
          </div>

          {/* CPU / RAM bars */}
          <div
            className="px-3 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid #1A3050" }}
          >
            <div className="flex items-center gap-2 text-[10px]" style={{ color: "#7A9CB8" }}>
              <span className="w-7">CPU</span>
              <div className="flex-1 h-2 rounded overflow-hidden" style={{ background: "#071B2D" }}>
                <div
                  className="h-full rounded transition-all duration-1000"
                  style={{
                    width: `${cpuPct}%`,
                    background: "linear-gradient(90deg, #1565C0, #42A5F5)",
                  }}
                />
              </div>
              <span className="w-7 text-right">RAM</span>
              <div className="flex-1 h-2 rounded overflow-hidden" style={{ background: "#071B2D" }}>
                <div
                  className="h-full rounded transition-all duration-1000"
                  style={{
                    width: `${ramPct}%`,
                    background: "linear-gradient(90deg, #00695C, #00BCD4)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Processes / Vulns header */}
          <div
            className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid #1A3050" }}
          >
            <span className="text-white text-xs font-semibold">Vulnerabilities</span>
            <span
              className="text-[10px] px-1.5 rounded font-mono"
              style={{ background: "rgba(30,136,229,0.2)", color: "#42A5F5" }}
            >
              {result.summary.total}
            </span>
            <div className="flex-1" />
            <input
              type="text"
              placeholder="Filter by ID or name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="text-[10px] rounded px-2 py-1 outline-none transition w-32"
              style={{
                background: "#071B2D",
                border: "1px solid #1A3050",
                color: "#fff",
              }}
            />
          </div>

          {/* Only important toggle */}
          <div
            className="flex items-center justify-end gap-2 px-3 py-1 flex-shrink-0"
            style={{ borderBottom: "1px solid #1A3050" }}
          >
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px]" style={{ color: "#7A9CB8" }}>
              <input
                type="checkbox"
                checked={onlyImportant}
                onChange={(e) => setOnlyImportant(e.target.checked)}
                className="w-3 h-3"
                style={{ accentColor: "#00BCD4" }}
              />
              Only important
            </label>
          </div>

          {/* Vuln list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {visibleVulns.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs" style={{ color: "#3A5A7A" }}>
                No matching vulnerabilities
              </div>
            ) : (
              visibleVulns.map((vuln) => (
                <div
                  key={vuln.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid rgba(26,48,80,0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0E2337")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: `${SEV_COLORS[vuln.severity]}20` }}
                  >
                    <Shield size={11} style={{ color: SEV_COLORS[vuln.severity] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono truncate" style={{ color: "#A8C8E0" }}>
                      {vuln.id} — {vuln.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "#3A5A7A" }}>
                      {vuln.file}:{vuln.line}
                    </p>
                  </div>
                  <SeverityBadge severity={vuln.severity} size="xs" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══ Bottom tabs ══ */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{ height: "190px", borderTop: "1px solid #1A3050" }}
      >
        {/* Tab header */}
        <div
          className="flex items-center overflow-x-auto flex-shrink-0"
          style={{ borderBottom: "1px solid #1A3050", background: "#0B2035" }}
        >
          {BOTTOM_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setBottomTab(t)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2 text-xs font-semibold flex-shrink-0 transition-colors whitespace-nowrap",
                bottomTab === t ? "text-white" : "hover:text-white"
              )}
              style={{ color: bottomTab === t ? "#fff" : "#7A9CB8" }}
            >
              {t}
              {t === "Vulnerabilities" && (
                <span
                  className="text-[9px] px-1.5 rounded-full"
                  style={{ background: "#1E4D8C", color: "#42A5F5" }}
                >
                  {result.summary.total}
                </span>
              )}
              {bottomTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#00BCD4" }} />
              )}
            </button>
          ))}
          <div className="ml-auto px-2 flex-shrink-0">
            <button className="p-1" style={{ color: "#3A5A7A" }}>
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Table */}
        {bottomTab === "Vulnerabilities" ? (
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Column headers */}
            <div
              className="flex items-center px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sticky top-0"
              style={{ background: "#071B2D", color: "#3A5A7A", borderBottom: "1px solid #1A3050" }}
            >
              <span className="w-16">Timestamp</span>
              <span className="w-8" />
              <span className="w-20">Severity</span>
              <span className="flex-1">Title</span>
              <span className="w-36">File</span>
              <span className="w-12">Line</span>
              <span className="w-24">CWE</span>
              <span className="w-20">Content</span>
            </div>

            {result.vulnerabilities.map((vuln, i) => (
              <div
                key={vuln.id}
                className="flex items-center px-3 py-2 text-xs cursor-pointer transition-colors"
                style={{ borderBottom: "1px solid rgba(26,48,80,0.3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0E2337")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <span className="w-16 font-mono text-[10px]" style={{ color: "#3A5A7A" }}>
                  BEFORE
                </span>
                <span className="w-8 font-mono text-[10px]" style={{ color: "#7A9CB8" }}>
                  {vuln.id.split("-")[1]}
                </span>
                <span className="w-20">
                  <SeverityBadge severity={vuln.severity} size="xs" />
                </span>
                <span className="flex-1 font-mono text-[11px] truncate pr-2" style={{ color: "#A8C8E0" }}>
                  {vuln.title}
                </span>
                <span className="w-36 font-mono text-[11px] truncate" style={{ color: "#7A9CB8" }}>
                  {vuln.file}
                </span>
                <span className="w-12 font-mono text-[11px]" style={{ color: "#7A9CB8" }}>
                  {vuln.line}
                </span>
                <span className="w-24 font-mono text-[11px]" style={{ color: "#7A9CB8" }}>
                  {vuln.cwe}
                </span>
                <span
                  className="w-20 font-mono text-[11px] text-right pr-1"
                  style={{ color: "#34d399" }}
                >
                  {vuln.snippet ? `${vuln.snippet.length * 2}b` : "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex-1 flex items-center justify-center text-xs"
            style={{ color: "#3A5A7A" }}
          >
            No {bottomTab.toLowerCase()} data available
          </div>
        )}
      </div>
    </div>
  );
}
