/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_WEBSOCKET_SHARKTANK: string
  VITE_API_SHARKTANK: string
  VITE_API_PIPELINE: string
  VITE_API_ASSIGNLEAD: string
  VITE_API_LOGIN: string
  VITE_API_LEADCOUNT: string
  VITE_SIGNALWIRE_PROJECT_KEY: string
  VITE_SIGNALWIRE_TOKEN: string
  VITE_SIGNALWIRE_SPACE: string
  VITE_API_BASE_URL: string
  // Add other environment variables as needed
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  