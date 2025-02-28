import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import App from "./App";
import "./styles/Index.css";
import "./styles/common.css";
import { ToastProvider } from "./context/ToastContext";
import { LeadProvider } from "./context/LeadContext";
import { PipelineProvider } from "./context/PipelineContext";
import { SignalWireProvider } from "./context/SignalWireContext";
import { SharkTankProvider } from "./context/SharkTankContext";
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);

  // Function to check if we're in the softphone window
  const isSoftphoneWindow = () => {
    return (
      window.location.pathname === "/softphone" ||
      window.location.hash === "#/softphone"
    );
  };

  // Function to check if we're in electron
  const isElectronApp = () => {
    return !!window.electron;
  };

  // Only wrap in SignalWireProvider if:
  // 1. We're in the web version (not electron) OR
  // 2. We're in electron AND this is the softphone window
  const shouldUseSignalWire =
    !isElectronApp() || (isElectronApp() && isSoftphoneWindow());

  const AppWithProviders = () => (
    <React.StrictMode>
      <Router>
        <UserProvider>
          <ToastProvider>
            <AdminProvider>
              <SharkTankProvider>
                <PipelineProvider>
                  <LeadProvider>
                    {shouldUseSignalWire ? (
                      <SignalWireProvider>
                        <App />
                      </SignalWireProvider>
                    ) : (
                      <App />
                    )}
                  </LeadProvider>
                </PipelineProvider>
              </SharkTankProvider>
            </AdminProvider>
          </ToastProvider>
        </UserProvider>
      </Router>
    </React.StrictMode>
  );

  root.render(<AppWithProviders />);
} else {
  console.error("Root element not found");
}
