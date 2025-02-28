// src/context/ToastContext.tsx
import React, { createContext, useContext, useState } from "react";

interface ToastContextProps {
  showToast: (
    title: string,
    description: string,
    options?: ToastOptions
  ) => void;
  toasts: ToastData[];
  closeToast: (id: number) => void;
}

interface ToastOptions {
  icon?: JSX.Element;
  primaryActionLabel?: string;
  primaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryAction?: () => void;
  leadId?: string;
  callSid?: string;
  fromNumber?: string;
  toastType?: 'call' | 'lead' | 'warm-transfer' | 'info';
  autoDeclineAfterMs?: number;
  targetUsername?: string;
}

export interface ToastData {
  id: number;
  title: string;
  description: string;
  toastType: 'call' | 'lead' | 'warm-transfer' | 'info';
  options?: ToastOptions;
  visible: boolean;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    title: string,
    description: string,
    options?: ToastOptions
  ) => {
    const toastType = options?.toastType || 'info';
    
    if (window.electron) {
      // Prepare the toast data for electron
      const toastData = {
        title,
        description,
        toastType,
        callSid: options?.callSid,
        fromNumber: options?.fromNumber,
        primaryActionLabel: options?.primaryActionLabel,
        secondaryActionLabel: options?.secondaryActionLabel,
        autoDeclineAfterMs: options?.autoDeclineAfterMs || 60000, // Default 1 minute timeout
        leadId: options?.leadId,
        targetUsername: options?.targetUsername,
      };

      // Send to electron main process
      window.electron.ipcRenderer.send("show-toast", toastData);

      // Set up electron IPC listeners for actions if they're provided
      if (options?.primaryAction || options?.secondaryAction) {
        const cleanup = () => {
          window.electron?.ipcRenderer.removeAllListeners("toast-action-clicked");
        };

        window.electron.ipcRenderer.on("toast-action-clicked", (event, { action }) => {
          if (action === "primary" && options.primaryAction) {
            options.primaryAction();
          } else if (action === "secondary" && options.secondaryAction) {
            options.secondaryAction();
          }
          cleanup();
        });

        // Cleanup after timeout
        setTimeout(cleanup, toastData.autoDeclineAfterMs);
      }
    } else {
      // Web environment: Use React-based toasts
      const newToast: ToastData = {
        id: Date.now(),
        title,
        description,
        toastType,
        options,
        visible: true,
      };
      setToasts((prev) => [...prev, newToast]);
    }
  };

  const closeToast = (id: number) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );
  };

  return (
    <ToastContext.Provider value={{ showToast, toasts, closeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
