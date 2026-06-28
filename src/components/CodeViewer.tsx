"use client";

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackFileExplorer,
  SandpackCodeEditor, 
  SandpackPreview 
} from "@codesandbox/sandpack-react";
import { useMemo } from "react";

export default function CodeViewer({ files }: { files: Record<string, string> }) {
  const sandpackFiles = useMemo(() => {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      const path = key.startsWith('/') ? key : `/${key}`;
      formatted[path] = value;
    }
    
    if (!formatted["/public/index.html"]) {
      formatted["/public/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentic Studio Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
    }
    
    return formatted;
  }, [files]);

  return (
    <div className="absolute inset-0 flex flex-col h-full bg-[#151515]">
      <SandpackProvider 
        template="react-ts"
        theme="dark"
        files={sandpackFiles}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "framer-motion": "latest"
          }
        }}
      >
        <SandpackLayout style={{ height: "100%", width: "100%", border: "none", borderRadius: 0 }}>
           <SandpackFileExplorer autoHiddenFiles />
           <SandpackCodeEditor showTabs={true} showLineNumbers={true} wrapContent={true} />
           <SandpackPreview showNavigator={true} showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
