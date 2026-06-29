import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.QWEN_API_KEY || "empty",
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req: Request) {
  if (!process.env.QWEN_API_KEY) {
    return NextResponse.json({ error: "QWEN_API_KEY is not set" }, { status: 500 });
  }

  const { prompt, history } = await req.json();

  // Convert custom message format to OpenAI format
  const formattedHistory = (history || []).map((msg: any) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.role === "user" ? msg.content : `[${msg.sender}]: ${msg.content}`
  }));

  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // --- 1. Product Manager Phase ---
        sendEvent({ type: "typing", agent: "Product Manager" });
        sendEvent({ type: "kanban", column: "Requirements", taskId: 1, status: "in-progress" });
        
        const pmCompletion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are an expert Product Manager. Briefly break down the user's latest request into technical requirements (max 3 sentences)." },
            ...formattedHistory
          ],
        });
        
        const pmContent = pmCompletion.choices[0].message.content || "";
        sendEvent({ type: "message", role: "pm", sender: "Product Manager", content: pmContent });
        sendEvent({ type: "kanban", column: "Requirements", taskId: 1, status: "done" });
        sendEvent({ type: "kanban", column: "Architecture", taskId: 3, status: "in-progress" });

        // --- 2. System Architect Phase ---
        sendEvent({ type: "typing", agent: "System Architect" });
        
        const architectCompletion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are a System Architect. Based on the PM's requirements and the history, suggest a modern React component architecture (max 3 sentences)." },
            ...formattedHistory,
            { role: "assistant", content: `[Product Manager]: ${pmContent}` }
          ],
        });

        const architectContent = architectCompletion.choices[0].message.content || "";
        sendEvent({ type: "message", role: "architect", sender: "System Architect", content: architectContent });
        sendEvent({ type: "kanban", column: "Architecture", taskId: 3, status: "done" });
        sendEvent({ type: "kanban", column: "Implementation", taskId: 5, status: "in-progress" });

        // --- 3. Lead Developer Phase ---
        sendEvent({ type: "typing", agent: "Lead Developer" });
        
        const devCompletion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are a Lead Developer. Write the React code for the requested app based on the architect's design. The app runs in CodeSandbox (Sandpack). The main entry point must be /App.tsx. You can create other files like /components/Button.tsx. Use Tailwind CSS classes for styling. IMPORTANT: Do NOT output JSON. Output the files using the following strict markdown format:\n\n### /App.tsx\n```tsx\nimport React from 'react';\n// code here\n```\n\n### /styles.css\n```css\n/* css here */\n```" },
            ...formattedHistory,
            { role: "assistant", content: `[Product Manager]: ${pmContent}\n\n[System Architect]: ${architectContent}` }
          ],
        });

        const devResponse = devCompletion.choices[0].message.content || "";
        let codeFiles: Record<string, string> = {};
        
        try {
          const fileRegex = /###\s+([^\n]+)\n```[\w]*\n([\s\S]*?)\n```/g;
          let match;
          while ((match = fileRegex.exec(devResponse)) !== null) {
            const filename = match[1].trim();
            codeFiles[filename] = match[2];
          }
          
          // Fallback: if no files were found, check if it just dumped a single code block
          if (Object.keys(codeFiles).length === 0) {
            const singleBlock = devResponse.match(/```(?:tsx|jsx|js|ts)?\n([\s\S]*?)\n```/);
            if (singleBlock) {
              codeFiles["/App.tsx"] = singleBlock[1];
            }
          }
        } catch (e) {
          console.error("Failed to parse Developer output:", devResponse, e);
        }

        if (Object.keys(codeFiles).length === 0) {
          sendEvent({ type: "message", role: "system", sender: "System Error", content: "Failed to extract code files from the AI's response. The AI did not format the code correctly." });
        } else {
          sendEvent({ type: "message", role: "developer", sender: "Lead Developer", content: "I've generated the files. Check the File Explorer and the Live Preview on the right!" });
          sendEvent({ type: "code", files: codeFiles });
        }
        
        sendEvent({ type: "kanban", column: "Implementation", taskId: 5, status: "done" });
        
      } catch (error) {
        console.error(error);
        sendEvent({ type: "message", role: "system", sender: "System Error", content: "An error occurred during orchestration." });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    }
  });
}
