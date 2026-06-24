"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AgentChat from "@/components/AgentChat";
import KanbanBoard from "@/components/KanbanBoard";
import CodeViewer from "@/components/CodeViewer";

export type Message = { id: number; role: string; content: string; sender: string };
export type Task = { id: number; title: string; status: "todo" | "in-progress" | "done" };
export type Column = { title: string; tasks: Task[] };

export default function DashboardClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    {
      title: "Requirements",
      tasks: [
        { id: 1, title: "Clarify user intent", status: "todo" },
        { id: 2, title: "Define tech stack", status: "todo" },
      ]
    },
    {
      title: "Architecture",
      tasks: [
        { id: 3, title: "Design DB schema", status: "todo" },
        { id: 4, title: "API routes plan", status: "todo" },
      ]
    },
    {
      title: "Implementation",
      tasks: [
        { id: 5, title: "Setup Next.js app", status: "todo" },
        { id: 6, title: "Build UI components", status: "todo" },
      ]
    }
  ]);
  const [files, setFiles] = useState<Record<string, string>>({
    "README.md": "# Agentic Studio\nWaiting for requirements..."
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTypingAgent, setCurrentTypingAgent] = useState<string | null>(null);

  const startWorkflow = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setMessages([{ id: Date.now(), role: "user", content: prompt, sender: "User" }]);
    
    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
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
          } catch (e) {
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
      <Header files={files} />
      
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
          <div className="flex-1 overflow-hidden relative">
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
