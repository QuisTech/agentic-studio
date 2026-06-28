"use client";

import { MessageSquare, User, BrainCircuit, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "./DashboardClient";
import { useState } from "react";

export default function AgentChat({
  messages,
  isProcessing,
  typingAgent,
  onSendMessage
}: {
  messages: Message[];
  isProcessing: boolean;
  typingAgent: string | null;
  onSendMessage: (prompt: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#12141a] border-r border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="p-4 border-b border-white/5 glass-panel z-10 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-sm">Negotiation Protocol</h2>
        {isProcessing && <Loader2 className="w-4 h-4 text-blue-400 animate-spin ml-auto" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10 scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.role === "user" ? (
                <>
                  <span className="text-xs text-gray-400 font-medium">{msg.sender}</span>
                  <User className="w-3 h-3 text-gray-400" />
                </>
              ) : (
                <>
                  <BrainCircuit className={`w-3 h-3 ${msg.role === "pm" ? "text-purple-400" : msg.role === "architect" ? "text-orange-400" : "text-emerald-400"}`} />
                  <span className={`text-xs font-medium ${msg.role === "pm" ? "text-purple-400" : msg.role === "architect" ? "text-orange-400" : "text-emerald-400"}`}>
                    {msg.sender}
                  </span>
                </>
              )}
            </div>
            <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-blue-600/20 border border-blue-500/20 text-blue-50 rounded-tr-sm" 
                : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {typingAgent && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 px-2">
            <BrainCircuit className="w-3 h-3 animate-pulse" />
            <span>{typingAgent} is thinking...</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-white/5 glass-panel z-10">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
            placeholder={isProcessing ? "Agents are negotiating..." : "Request an application build..."}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 top-2 px-3 py-1 bg-blue-600 rounded-lg text-xs font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
