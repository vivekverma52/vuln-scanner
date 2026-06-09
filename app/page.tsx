"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2, Globe, Database, Cpu, ExternalLink } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import NewScanModal from "@/components/NewScanModal";
import ScanResultsView from "@/components/ScanResultsView";
import { ScanResult } from "@/lib/types";

// ── Tiny sub-components ────────────────────────────────────────────────────────

function AnalysisCard({
  icon,
  title,
  desc,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative text-left rounded-xl flex flex-col items-center gap-4 p-6 transition-all duration-200"
      style={{
        background: "rgba(14,35,55,0.7)",
        border: "1px solid #1A3050",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#122B42";
        e.currentTarget.style.borderColor = "#2A4878";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(14,35,55,0.7)";
        e.currentTarget.style.borderColor = "#1A3050";
      }}
    >
      {badge && (
        <div className="absolute top-3 right-3">{badge}</div>
      )}
      <div className="flex flex-col items-center gap-3 py-4 w-full">
        {icon}
        <p className="text-white font-bold text-base text-center leading-snug">{title}</p>
        <p className="text-sm text-center leading-relaxed" style={{ color: "#5A8AAB" }}>
          {desc}
        </p>
      </div>
      <span
        className="text-xs font-medium transition-colors group-hover:underline"
        style={{ color: "#1E88E5" }}
      >
        Learn more →
      </span>
    </button>
  );
}

function SmallCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 cursor-pointer transition-all duration-200"
      style={{ background: "rgba(14,35,55,0.7)", border: "1px solid #1A3050" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#122B42";
        e.currentTarget.style.borderColor = "#2A4878";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(14,35,55,0.7)";
        e.currentTarget.style.borderColor = "#1A3050";
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "#142840" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white text-sm font-semibold truncate">{title}</p>
          <ExternalLink size={13} style={{ color: "#3A5A7A", flexShrink: 0 }} />
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#5A8AAB" }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [ready,       setReady]       = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [scanResult,  setScanResult]  = useState<ScanResult | null>(null);

  // Auth guard
  useEffect(() => {
    if (localStorage.getItem("vs_auth") !== "1") {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  // ── Results view ──
  if (scanResult) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "#071B2D" }}>
        <Sidebar onNewScan={() => { setScanResult(null); setShowModal(true); }} />
        <ScanResultsView result={scanResult} onNewScan={() => { setScanResult(null); setShowModal(true); }} />
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#071B2D" }}>
      <Sidebar onNewScan={() => setShowModal(true)} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative">
        {/* World map decorative background */}
        <div className="absolute inset-0 world-map-bg pointer-events-none" />

        <div className="relative z-10 p-8 max-w-[960px]">

          {/* Hero header */}
          <h1 className="text-white font-bold text-2xl mb-2">Start your analysis</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#5A8AAB" }}>
            Interact with cyber threats inside Windows, Linux, macOS,<br className="hidden md:block" />
            and Android VMs to trigger full attack execution.
          </p>

          {/* Section label */}
          <p className="text-white text-sm font-semibold mb-4">
            Deep interactive investigation in full environment
          </p>

          {/* 3 primary analysis cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <AnalysisCard
              icon={<Upload size={38} style={{ color: "#6AB4FF" }} />}
              title="Submit File / Email"
              desc="Detonate an object to observe its malicious activity"
              onClick={() => setShowModal(true)}
            />
            <AnalysisCard
              icon={<Link2 size={38} style={{ color: "#6AB4FF" }} />}
              title="Submit URL"
              desc="Investigate malicious and phishing activity and inspect downloaded files"
              onClick={() => setShowModal(true)}
            />
            <AnalysisCard
              icon={<Globe size={38} style={{ color: "#6AB4FF" }} />}
              title="Check Suspicious Links"
              desc="Open any URL to verify its content fast and easily"
              badge={
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#FBBF24" }}
                >
                  beta
                </span>
              }
              onClick={() => setShowModal(true)}
            />
          </div>

          {/* Power your SOC */}
          <p className="text-white text-sm font-semibold mb-4">
            Power your SOC with VulnScan solutions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmallCard
              icon={<Database size={17} style={{ color: "#6AB4FF" }} />}
              title="TI Feeds"
              desc="Prevent attacks with actionable IOC"
            />
            <SmallCard
              icon={<Cpu size={17} style={{ color: "#6AB4FF" }} />}
              title="TI Lookup"
              desc="Enrich investigations and respond"
            />
          </div>
        </div>
      </div>

      {/* New scan modal */}
      {showModal && (
        <NewScanModal
          onClose={() => setShowModal(false)}
          onComplete={(result) => {
            setShowModal(false);
            setScanResult(result);
          }}
        />
      )}
    </div>
  );
}
