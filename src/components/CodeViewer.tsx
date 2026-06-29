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
  // Sandpack expects absolute paths for files
  const sandpackFiles = useMemo(() => {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      const path = key.startsWith('/') ? key : `/${key}`;
      formatted[path] = value;
    }

    // Inject Tailwind CDN into the public/index.html for styling
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
    <div className="flex-1 flex flex-col h-full w-full relative">
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
            "sp-layout": "h-full w-full !border-0 !rounded-none",
            "sp-file-explorer": "bg-[#12141a]",
            "sp-editor": "border-r border-white/5 h-full",
            "sp-preview": "bg-white h-full",
          }
        }}
      >
        <SandpackLayout className="h-full w-full flex">
          <div className="w-48 shrink-0 relative">
            <div className="absolute inset-0 overflow-y-auto border-r border-white/5">
              <SandpackFileExplorer autoHiddenFiles />
            </div>
          </div>
          <div className="flex-1 relative min-w-0 h-full">
            <div className="absolute inset-0">
              <SandpackCodeEditor showTabs={true} showLineNumbers={true} wrapContent={true} style={{ height: "100%" }} />
            </div>
          </div>
          <div className="flex-1 relative min-w-0 h-full">
            <div className="absolute inset-0 border-l border-white/5">
              <SandpackPreview showNavigator={true} showOpenInCodeSandbox={false} style={{ height: "100%" }} />
            </div>
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
