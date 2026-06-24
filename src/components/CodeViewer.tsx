"use client";

import { FileCode2, Copy, FileText, Terminal, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function CodeViewer({ files }: { files: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (files && Object.keys(files).length > 0 && !files[activeTab]) {
      setActiveTab(Object.keys(files)[0]);
    }
  }, [files, activeTab]);

  const handleCopy = () => {
    if (!activeTab || !files[activeTab]) return;
    navigator.clipboard.writeText(files[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative">
      <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-[#12141a] overflow-x-auto no-scrollbar">
        {Object.keys(files).map(filename => (
          <button
            key={filename}
            onClick={() => setActiveTab(filename)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === filename 
                ? "bg-white/10 text-white" 
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            }`}
          >
            {filename.endsWith(".tsx") || filename.endsWith(".ts") || filename.endsWith(".js") ? (
              <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
            ) : filename.endsWith(".css") ? (
              <FileText className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-gray-400" />
            )}
            {filename}
          </button>
        ))}
      </div>
      
      <div className="flex-1 p-4 overflow-auto font-mono text-sm relative group">
        <button 
          onClick={handleCopy}
          className="absolute right-4 top-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        
        <pre className="text-gray-300 leading-relaxed">
          <code>
            {activeTab && files[activeTab] && files[activeTab].split('\n').map((line, i) => (
              <div key={i} className="flex">
                <span className="w-8 shrink-0 text-gray-600 select-none">{i + 1}</span>
                <span className={`${
                  line.includes("import") || line.includes("export") ? "text-purple-400" :
                  line.includes("function") || line.includes("return") ? "text-blue-400" :
                  line.includes("<") || line.includes("/>") ? "text-emerald-400" :
                  ""
                }`}>
                  {line}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
