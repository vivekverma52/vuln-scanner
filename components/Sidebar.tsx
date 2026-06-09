"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play, Plus, FileText, Users, Clock, Shield,
  Monitor, Bell, User, CreditCard, Mail,
  HelpCircle, LogOut, ChevronRight, FolderOpen, Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeNav?: string;
  onNewScan?: () => void;
  dirName?: string;
  onPickFolder?: () => void;
}

const TOP_NAV = [
  { id: "reports",  Icon: FileText,  label: "Reports" },
  { id: "teamwork", Icon: Users,     label: "Teamwork" },
  { id: "history",  Icon: Clock,     label: "History" },
  { id: "ti",       Icon: Shield,    label: "TI", arrow: true },
];

const BOTTOM_NAV = [
  { id: "notifications", Icon: Bell,        label: "Notifications" },
  { id: "profile",       Icon: User,        label: "Profile" },
  { id: "pricing",       Icon: CreditCard,  label: "Pricing" },
  { id: "contacts",      Icon: Mail,        label: "Contacts" },
  { id: "faq",           Icon: HelpCircle,  label: "FAQ" },
];

export default function Sidebar({ activeNav = "reports", onNewScan, dirName, onPickFolder }: SidebarProps) {
  const router  = useRouter();
  const [active, setActive] = useState(activeNav);

  const logout = () => {
    localStorage.removeItem("vs_auth");
    router.push("/login");
  };

  return (
    <aside
      className="w-[210px] flex-shrink-0 flex flex-col h-screen overflow-hidden"
      style={{ background: "#0B2035", borderRight: "1px solid #1A3050" }}
    >
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#1565C0" }}
        >
          <Play size={12} className="text-white fill-white ml-0.5" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-none tracking-tight truncate">
            VulnScan
          </p>
          <p
            className="text-[8px] uppercase tracking-[0.18em] leading-none mt-0.5 truncate"
            style={{ color: "#3A6A8A" }}
          >
            Vulnerability Scanner
          </p>
        </div>
      </div>

      {/* New Analysis CTA */}
      <div className="px-3 mb-2 flex-shrink-0">
        <button
          onClick={onNewScan}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#1565C0" }}
        >
          <Plus size={16} />
          New analysis
        </button>
      </div>

      {/* Separator */}
      <div className="mx-3 mb-2 flex-shrink-0" style={{ height: "1px", background: "#1A3050" }} />

      {/* Top navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 min-h-0">
        {TOP_NAV.map(({ id, Icon, label, arrow }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left",
              active === id
                ? "text-white"
                : "hover:text-white hover:bg-white/5"
            )}
            style={active === id ? { background: "#142B40", color: "#fff" } : { color: "#7A9CB8" }}
          >
            <Icon size={15} className="flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {arrow && <ChevronRight size={12} className="opacity-40 flex-shrink-0" />}
          </button>
        ))}

        {/* Divider */}
        <div className="mx-1 my-2" style={{ height: "1px", background: "#1A3050" }} />

        {/* Environment item */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 hover:bg-white/5"
          style={{ color: "#7A9CB8" }}
        >
          <Monitor size={15} className="flex-shrink-0" />
          <span className="flex-1 truncate">Windows 10 64 bit</span>
        </div>

        {/* Divider */}
        <div className="mx-1 my-2" style={{ height: "1px", background: "#1A3050" }} />

        {/* ── Save Destination Folder ── */}
        <p className="px-3 text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#3A5A7A" }}>
          Save destination
        </p>

        {dirName ? (
          /* Folder selected */
          <button
            onClick={onPickFolder}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150 hover:brightness-110"
            style={{ background: "#1E4D8C" }}
          >
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
              <Folder size={13} className="text-white" />
            </div>
            <span className="flex-1 text-white text-xs font-medium truncate">{dirName}</span>
            <ChevronRight size={12} className="opacity-50 flex-shrink-0 text-white" />
          </button>
        ) : (
          /* No folder yet */
          <button
            onClick={onPickFolder}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left border-2 border-dashed transition-all duration-150"
            style={{ borderColor: "#1A3050", color: "#7A9CB8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(21,101,192,0.5)";
              e.currentTarget.style.color = "#42A5F5";
              e.currentTarget.style.background = "rgba(21,101,192,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1A3050";
              e.currentTarget.style.color = "#7A9CB8";
              e.currentTarget.style.background = "";
            }}
          >
            <FolderOpen size={14} className="flex-shrink-0" />
            <span className="text-xs">Pick a folder…</span>
          </button>
        )}
      </nav>

      {/* Separator */}
      <div className="mx-3 mb-1 flex-shrink-0" style={{ height: "1px", background: "#1A3050" }} />

      {/* Bottom navigation */}
      <div className="px-2 pb-3 space-y-0.5 flex-shrink-0">
        {BOTTOM_NAV.map(({ id, Icon, label }) => (
          <button
            key={id}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-white/5"
            style={{ color: "#7A9CB8" }}
          >
            <Icon size={14} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-red-500/10"
          style={{ color: "#7A9CB8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7A9CB8")}
        >
          <LogOut size={14} className="flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
