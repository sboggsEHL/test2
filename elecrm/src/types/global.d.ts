// src/types/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      getEnv: (key: string) => Promise<string>;
      sendLoginSuccess: () => void;
      openSoftphoneWindow: () => void;
      updateSharedState: (newState: any) => void;
      onSharedState: (callback: (state: any) => void) => void;
      getSharedState: () => Promise<SharedStateResponse>;
      isElectron: boolean;
      isAuthenticated: boolean;
      dialPhoneNumber: (phoneNumber: string, leadData?: any) => void;
      onDialPhoneNumber: (callback: (data: { phoneNumber: string, leadData: any }) => void) => void;
    };
  }
}

interface SharedState {
  isAuthenticated: boolean;
  username: string | null;
  initialized: boolean;
  theme?: string; // Add theme to shared state interface
  signalWire?: {
    callState?: any;
    currentMicrophone?: string | null;
    currentOutputDevice?: string | null;
    token?: string;
  };
}

interface SharedStateResponse {
  success: boolean;
  data?: SharedState;
  error?: string;
}
