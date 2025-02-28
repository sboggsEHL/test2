import React, { useState, useEffect } from "react";
import { Route, Navigate, Routes, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { LookupTool } from "./pages/LookupTool";
import { SharkTank } from "./pages/SharkTank";
import Layout from "./components/Layout";
import { useWebSocket } from "./hooks/useWebSocket";
import { Pipeline } from "./pages";
import Softphone from "./components/SoftPhone";
import { isElectron } from "./utils";
import ToastContainer from "./components/ToastContainer";
import { useUser } from "./context/UserContext";
import { AdminPortal } from "./pages/Admin";
import { AppRoutes } from './config/routes';

const App: React.FC = () => {
  useWebSocket();
  const [isSoftphoneVisible, setIsSoftphoneVisible] = useState(false);
  const { isAuthenticated, setIsAuthenticated, username, setUsername } =
    useUser();
  const location = useLocation();
  const [isLoadingSharedState, setIsLoadingSharedState] = useState(true);
  const [sharedStateError, setSharedStateError] = useState<string | null>(null);
  const isSoftphoneWindow =
    window.location.pathname === "/softphone" ||
    window.location.hash === "#/softphone";

  useEffect(() => {
    const loadInitialState = async () => {
      if (window.electronAPI && isSoftphoneWindow) {
        try {
          console.log("Fetching initial state...");
          const response = await window.electronAPI.getSharedState();
          console.log("Got response:", response);

          if (response.success && response.data) {
            if (response.data.isAuthenticated) {
              setIsAuthenticated(true);
              setIsSoftphoneVisible(true);
              // Set username from shared state
              if (response.data.username) {
                setUsername(response.data.username);
                sessionStorage.setItem("username", response.data.username);
              }
            }
            // Apply theme from shared state
            if (response.data.theme) {
              document.documentElement.setAttribute(
                "data-theme",
                response.data.theme
              );
              localStorage.setItem("theme", response.data.theme);
            }
          } else {
            // Wait and retry once if initialization failed
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const retryResponse = await window.electronAPI.getSharedState();
            if (retryResponse.success && retryResponse.data) {
              if (retryResponse.data.isAuthenticated) {
                setIsAuthenticated(true);
                setIsSoftphoneVisible(true);
              }
            } else {
              setSharedStateError(
                response.error || "Failed to load shared state"
              );
            }
          }
        } catch (error: any) {
          console.error("Error loading shared state:", error);
          setSharedStateError(error.message || "Unknown error occurred");
        } finally {
          setIsLoadingSharedState(false);
        }
      } else {
        setIsLoadingSharedState(false);
      }
    };

    loadInitialState();
  }, [isSoftphoneWindow, setIsAuthenticated, setUsername]);

  const toggleSoftphone = () => {
    if (isElectron()) {
      window.electronAPI.openSoftphoneWindow();
    } else {
      setIsSoftphoneVisible((prev) => !prev);
    }
  };

  // Show loading state for softphone window
  if (isSoftphoneWindow && isLoadingSharedState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading softphone...</div>
        </div>
      </div>
    );
  }

  // Show error state for softphone window
  if (isSoftphoneWindow && sharedStateError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-4">
          <div className="text-red-500 mb-4">Error: {sharedStateError}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only render routes after shared state is loaded for softphone window
  if (isSoftphoneWindow && !isLoadingSharedState) {
    return (
      <>
        <Softphone isVisible={true} />
      </>
    );
  }

  // Regular app routing
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path={AppRoutes.Default}
          element={
            <Navigate to={isAuthenticated ? AppRoutes.Home : AppRoutes.Login} />
          }
        />
        <Route path={AppRoutes.Login} element={<Login />} />

        {isAuthenticated ? (
          <Route element={<Layout onToggleSoftphone={toggleSoftphone} />}>
            <Route path={AppRoutes.Home} element={<Home />} />
            <Route path={AppRoutes.Pipeline} element={<Pipeline />} />
            <Route path={AppRoutes.LookupTool} element={<LookupTool />} />
            <Route path={AppRoutes.SharkTank} element={<SharkTank />} />
            <Route path={`${AppRoutes.Admin}/*`} element={<AdminPortal />} />
            <Route path="*" element={<Navigate to={AppRoutes.Home} />} />
          </Route>
        ) : (
          <Route
            path="*"
            element={
              <Navigate
                to={AppRoutes.Login}
                replace={true}
                state={{
                  from:
                    location.pathname !== AppRoutes.Login
                      ? location.pathname
                      : AppRoutes.Home,
                }}
              />
            }
          />
        )}
      </Routes>
      {!isElectron() && (
        <Softphone
          isVisible={isSoftphoneVisible}
          onClose={() => setIsSoftphoneVisible(false)}
        />
      )}
    </>
  );
};

export default App;
