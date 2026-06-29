"use client";

import { Download, Bot, Settings, Activity, Trash2 } from "lucide-react";
import { downloadProjectAsZip } from "@/lib/zip";

export default function Header({ files, onClearSession }: { files: Record<string, string>, onClearSession: () => void }) {
  const handleDownload = () => {
    downloadProjectAsZip(files, "agentic-generated-code");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass-panel z-10 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Agentic Studio
          </h1>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Society Online
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>System Log</span>
        </button>
        <button 
          onClick={onClearSession}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium text-red-400"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Session</span>
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all text-sm font-medium shadow-lg shadow-blue-500/25"
        >
          <Download className="w-4 h-4" />
          <span>Export .zip</span>
        </button>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
