"use client";

import { CheckCircle2, Circle, Code2, ListTodo, CheckCircle } from "lucide-react";
import { Column } from "./DashboardClient";

export default function KanbanBoard({ columns }: { columns: Column[] }) {
  const getIconForColumn = (title: string) => {
    if (title === "Requirements") return <ListTodo className="w-4 h-4 text-purple-400" />;
    if (title === "Architecture") return <Code2 className="w-4 h-4 text-orange-400" />;
    return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="flex-1 bg-[#0f1115] border-l border-white/5 p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-gray-300">Live Workflow</h2>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10 uppercase tracking-wider font-semibold">Sprint 1</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 h-full min-h-0">
        {columns.map((col, idx) => (
          <div key={idx} className="bg-[#12141a] border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
              {getIconForColumn(col.title)}
              <h3 className="text-xs font-medium text-gray-300">{col.title}</h3>
              <span className="ml-auto text-[10px] text-gray-500 bg-black/50 px-1.5 py-0.5 rounded">{col.tasks.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {col.tasks.map(task => (
                <div key={task.id} className="bg-black/40 border border-white/5 p-3 rounded-lg transition-colors group cursor-default">
                  <div className="flex items-start gap-2">
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : task.status === "in-progress" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs ${task.status === "done" ? "text-gray-500 line-through" : "text-gray-300"} leading-tight`}>
                      {task.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
