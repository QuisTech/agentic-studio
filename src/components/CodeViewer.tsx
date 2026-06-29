"use client";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackFileExplorer,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { useMemo, useEffect } from "react";

function SandpackForceUpdater({ newFiles }: { newFiles: Record<string, string> }) {
  const { sandpack } = useSandpack();
  
  useEffect(() => {
    for (const [path, content] of Object.entries(newFiles)) {
      if (sandpack.files[path]?.code !== content) {
        sandpack.updateFile(path, content);
      }
    }
  }, [newFiles, sandpack]);

  return null;
}

export default function CodeViewer({ files }: { files: Record<string, string> }) {
  // Sandpack expects absolute paths for files
  const sandpackFiles = useMemo(() => {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      const path = key.startsWith('/') ? key : `/${key}`;
      formatted[path] = value;
    }

    return formatted;
  }, [files]);

  // Dynamically extract dependencies from all files so the preview never crashes
  const sandpackDependencies = useMemo(() => {
    const deps: Record<string, string> = {
      "lucide-react": "latest",
      "framer-motion": "latest",
      "@tanstack/react-query": "latest",
      "recharts": "latest",
      "clsx": "latest",
      "tailwind-merge": "latest",
      "zod": "latest",
      "axios": "latest"
    };
    
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    
    for (const fileContent of Object.values(files)) {
      let match;
      while ((match = importRegex.exec(fileContent)) !== null) {
        const pkgName = match[1];
        // Ignore relative imports and standard React/DOM
        if (!pkgName.startsWith('.') && !pkgName.startsWith('/') && pkgName !== 'react' && pkgName !== 'react-dom') {
            // Get base package name (e.g., @tanstack/react-query from @tanstack/react-query/core)
            const parts = pkgName.split('/');
            const basePkg = pkgName.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
            if (basePkg && !deps[basePkg]) {
              deps[basePkg] = "latest";
            }
        }
      }
    }
    return deps;
  }, [files]);

  return (
    <div className="flex-1 flex flex-col h-full w-full relative">
      <SandpackProvider
        template="react-ts"
        theme="dark"
        files={sandpackFiles}
        customSetup={{
          dependencies: sandpackDependencies
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          classes: {
            "sp-layout": "h-full w-full !border-0 !rounded-none",
            "sp-file-explorer": "bg-[#12141a]",
            "sp-editor": "border-r border-white/5 h-full",
            "sp-preview": "bg-white h-full",
          }
        }}
      >
        <SandpackForceUpdater newFiles={sandpackFiles} />
        <SandpackLayout className="h-full w-full flex">
          <div className="w-48 shrink-0 overflow-y-auto border-r border-white/5">
            <SandpackFileExplorer autoHiddenFiles />
          </div>
          <div className="flex-1 relative min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
            <SandpackCodeEditor showTabs={true} showLineNumbers={true} wrapContent={true} style={{ height: "100%" }} />
          </div>
          <div className="flex-1 relative min-w-0 min-h-0 border-l border-white/5 h-full overflow-hidden flex flex-col">
            <SandpackPreview showNavigator={true} showOpenInCodeSandbox={false} style={{ height: "100%" }} />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
