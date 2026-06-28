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

  const { prompt } = await req.json();

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
            { role: "system", content: "You are an expert Product Manager. Briefly break down the user's request into technical requirements (max 3 sentences)." },
            { role: "user", content: prompt }
          ],
        });
        
        sendEvent({ type: "message", role: "pm", sender: "Product Manager", content: pmCompletion.choices[0].message.content });
        sendEvent({ type: "kanban", column: "Requirements", taskId: 1, status: "done" });
        sendEvent({ type: "kanban", column: "Architecture", taskId: 3, status: "in-progress" });

        // --- 2. System Architect Phase ---
        sendEvent({ type: "typing", agent: "System Architect" });
        
        const architectCompletion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are a System Architect. Based on the PM's requirements, suggest a modern React component architecture (max 3 sentences)." },
            { role: "user", content: prompt },
            { role: "assistant", content: pmCompletion.choices[0].message.content || "" }
          ],
        });

        sendEvent({ type: "message", role: "architect", sender: "System Architect", content: architectCompletion.choices[0].message.content });
        sendEvent({ type: "kanban", column: "Architecture", taskId: 3, status: "done" });
        sendEvent({ type: "kanban", column: "Implementation", taskId: 5, status: "in-progress" });

        // --- 3. Lead Developer Phase ---
        sendEvent({ type: "typing", agent: "Lead Developer" });
        
        const devCompletion = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "You are a Lead Developer. Write the React code for the requested app based on the architect's design. The app runs in CodeSandbox (Sandpack). The main entry point must be /App.tsx. You can create other files like /components/Button.tsx. Use Tailwind CSS classes for styling (Tailwind is preconfigured). Output ONLY a valid JSON object containing absolute filenames as keys and the file contents as values. DO NOT output any markdown, explanations, or code blocks. Just the raw JSON object. Example: {\"/App.tsx\": \"import React from 'react'; export default function App() { return <div>Hello</div>; }\"}" },
            { role: "user", content: prompt },
            { role: "assistant", content: architectCompletion.choices[0].message.content || "" }
          ],
        });

        const devResponse = devCompletion.choices[0].message.content || "{}";
        let codeFiles = {};
        
        try {
          // Attempt to parse the JSON. 
          // If the model wrapped it in markdown code blocks, strip them out.
          const cleanedJson = devResponse.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
          codeFiles = JSON.parse(cleanedJson);
        } catch {
          console.error("Failed to parse Developer output as JSON:", devResponse);
        }

        sendEvent({ type: "message", role: "developer", sender: "Lead Developer", content: "I've generated the files. Check the File Explorer and the Live Preview on the right!" });
        
        if (Object.keys(codeFiles).length > 0) {
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
