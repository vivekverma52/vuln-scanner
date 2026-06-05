"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield, Search, FileSearch, Brain } from "lucide-react";
import { ScanStatus } from "@/lib/types";

interface ScanProgressProps {
  status: ScanStatus;
  fileName?: string;
  savedPath?: string;
}

const UPLOAD_STEPS = [
  { icon: FileSearch, label: "Reading file..." },
  { icon: Search, label: "Transferring to server..." },
  { icon: Shield, label: "Saving to disk..." },
];

const SCAN_STEPS = [
  { icon: FileSearch, label: "Parsing file structure..." },
  { icon: Search, label: "Running static analysis..." },
  { icon: Brain, label: "Running AI vulnerability detection..." },
  { icon: Shield, label: "Generating report..." },
];

export function ScanProgress({ status, fileName, savedPath }: ScanProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const isUploading = status === "uploading";
  const isScanning = status === "scanning";
  const active = isUploading || isScanning;
  const steps = isUploading ? UPLOAD_STEPS : SCAN_STEPS;

  useEffect(() => {
    if (!active) return;
    setProgress(0);
    setStepIdx(0);
    setLog([]);

    const totalDuration = isUploading ? 2500 : 6000;
    const stepDuration = totalDuration / steps.length;

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const target = isUploading ? 95 : 90;
        if (p >= target) return p;
        return p + 1;
      });
    }, totalDuration / 95);

    const stepIntervals = steps.map((step, i) =>
      setTimeout(() => {
        setStepIdx(i);
        setLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${step.label}`,
        ]);
      }, stepDuration * i)
    );

    return () => {
      clearInterval(progressInterval);
      stepIntervals.forEach(clearTimeout);
    };
  }, [status]);

  useEffect(() => {
    if (status === "uploaded") {
      setProgress(100);
    }
  }, [status]);

  if (!active) return null;

  const currentStep = steps[stepIdx];
  const Icon = currentStep?.icon ?? Loader2;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon size={16} className="text-primary animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium font-display text-foreground">
            {isUploading ? "Uploading File" : "Scanning for Vulnerabilities"}
          </p>
          {fileName && (
            <p className="text-xs font-mono text-muted-foreground truncate max-w-xs">
              {fileName}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <span className="text-sm font-mono font-bold text-primary tabular-nums">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full progress-glow rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex gap-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
              i < stepIdx
                ? "bg-primary"
                : i === stepIdx
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Terminal log */}
      <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-24 overflow-y-auto">
        {log.map((line, i) => (
          <div
            key={i}
            className={i === log.length - 1 ? "text-primary cursor-blink" : "text-muted-foreground"}
          >
            {line}
          </div>
        ))}
        {log.length === 0 && (
          <span className="text-muted-foreground cursor-blink">
            Initializing
          </span>
        )}
      </div>

      {savedPath && status === "scanning" && (
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <span className="text-primary">📁</span>
          <span className="truncate">{savedPath}</span>
        </div>
      )}
    </div>
  );
}
