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
    <div className="absolute inset-0 overflow-hidden">
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
        options={{
          classes: {
            "sp-layout": "h-full w-full !border-0 !rounded-none flex overflow-hidden",
            "sp-file-explorer": "bg-[#12141a] w-48 shrink-0 overflow-y-auto border-r border-white/5",
            "sp-editor": "flex-1 min-w-0 h-full border-r border-white/5",
            "sp-preview": "bg-white flex-1 min-w-0 h-full",
          }
        }}
      >
        <SandpackLayout className="h-full w-full">
           <SandpackFileExplorer autoHiddenFiles />
           <SandpackCodeEditor showTabs={true} showLineNumbers={true} wrapContent={true} style={{ height: "100%" }} />
           <SandpackPreview showNavigator={true} showOpenInCodeSandbox={false} style={{ height: "100%" }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
