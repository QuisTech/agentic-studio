"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AgentChat from "@/components/AgentChat";
import KanbanBoard from "@/components/KanbanBoard";
import CodeViewer from "@/components/CodeViewer";

export type Message = { id: number; role: string; content: string; sender: string };
export type Task = { id: number; title: string; status: "todo" | "in-progress" | "done" };
export type Column = { title: string; tasks: Task[] };

const DEFAULT_MESSAGES: Message[] = [
  { id: 1, role: "user", content: "I need a sleek pricing page.", sender: "User" },
  { id: 2, role: "architect", content: "Let's build a React component with Tailwind CSS.", sender: "System Architect" },
  { id: 3, role: "developer", content: "I'll generate App.tsx. Check the IDE and Preview!", sender: "Lead Developer" },
];

const DEFAULT_COLUMNS: Column[] = [
  {
    title: "Requirements",
    tasks: [
      { id: 1, title: "Clarify user intent", status: "done" },
      { id: 2, title: "Define tech stack", status: "done" },
    ]
  },
  {
    title: "Architecture",
    tasks: [
      { id: 3, title: "Design DB schema", status: "done" },
      { id: 4, title: "Component layout plan", status: "done" },
    ]
  },
  {
    title: "Implementation",
    tasks: [
      { id: 5, title: "Setup React app", status: "in-progress" },
      { id: 6, title: "Build UI components", status: "todo" },
    ]
  }
];

const DEFAULT_FILES: Record<string, string> = {
  "/App.tsx": `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">\n      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-700">\n        <h1 className="text-3xl font-bold text-white mb-2">Agentic Studio</h1>\n        <p className="text-gray-400 mb-6">Ask the agents to build something amazing.</p>\n        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full">\n          Get Started\n        </button>\n      </div>\n    </div>\n  );\n}`,
  "/styles.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n}`
};

export default function DashboardClient() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTypingAgent, setCurrentTypingAgent] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedMessages = localStorage.getItem("agentic_messages");
    const savedColumns = localStorage.getItem("agentic_columns");
    const savedFiles = localStorage.getItem("agentic_files");
    
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedColumns) setColumns(JSON.parse(savedColumns));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    
    setIsHydrated(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("agentic_messages", JSON.stringify(messages));
      localStorage.setItem("agentic_columns", JSON.stringify(columns));
      localStorage.setItem("agentic_files", JSON.stringify(files));
    }
  }, [messages, columns, files, isHydrated]);

  const handleClearSession = () => {
    if (confirm("Are you sure you want to clear your entire session? This cannot be undone.")) {
      localStorage.removeItem("agentic_messages");
      localStorage.removeItem("agentic_columns");
      localStorage.removeItem("agentic_files");
      setMessages(DEFAULT_MESSAGES);
      setColumns(DEFAULT_COLUMNS);
      setFiles(DEFAULT_FILES);
    }
  };

  const startWorkflow = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    const newMessages = [...messages, { id: Date.now(), role: "user", content: prompt, sender: "User" }];
    setMessages(newMessages);
    
    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history: newMessages })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            
            if (data.type === "message") {
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                role: data.role,
                sender: data.sender,
                content: data.content
              }]);
            } else if (data.type === "typing") {
              setCurrentTypingAgent(data.agent);
            } else if (data.type === "kanban") {
              setColumns(prev => {
                const newCols = [...prev];
                const colIndex = newCols.findIndex(c => c.title === data.column);
                if (colIndex > -1) {
                  const taskIndex = newCols[colIndex].tasks.findIndex(t => t.id === data.taskId);
                  if (taskIndex > -1) {
                    newCols[colIndex].tasks[taskIndex].status = data.status;
                  }
                }
                return newCols;
              });
            } else if (data.type === "code") {
              setFiles(prev => ({ ...prev, ...data.files }));
            }
          } catch {
            console.error("Failed to parse chunk", line);
          }
        }
      }
    } catch (error) {
      console.error("Workflow failed", error);
    } finally {
      setIsProcessing(false);
      setCurrentTypingAgent(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
      <Header files={files} onClearSession={handleClearSession} />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="w-[400px] shrink-0 flex flex-col h-full border-r border-white/5">
          <AgentChat 
            messages={messages} 
            isProcessing={isProcessing} 
            typingAgent={currentTypingAgent}
            onSendMessage={startWorkflow} 
          />
        </div>
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative flex">
            <CodeViewer files={files} />
          </div>
          <div className="h-[250px] shrink-0 border-t border-white/5">
            <KanbanBoard columns={columns} />
          </div>
        </div>
      </main>
    </div>
  );
}
