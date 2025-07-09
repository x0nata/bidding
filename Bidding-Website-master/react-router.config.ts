import type { Config } from "@react-router/dev/config";

export default {
  // Server-side rendering
  ssr: false,
  
  // Build directory
  buildDirectory: "build",
  
  // Public directory
  publicPath: "/",
  
  // Asset build directory
  assetsBuildDirectory: "build/static",
  
  // Server build directory (not used for SPA)
  serverBuildDirectory: "build/server",
  
  // Routes file
  routes: "./src/routes.ts",
  
  // App directory
  appDirectory: "src",
  
  // Entry point for client
  entryClientFile: "entry.client.tsx",
  
  // Entry point for server (not used for SPA)
  entryServerFile: "entry.server.tsx",
  
  // Future flags for React Router v7
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
} satisfies Config;
