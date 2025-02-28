import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserStatusTypes } from "../models/status";
import { userService } from "../services/UserService";

// Define USER_CONFIG with a default value for INACTIVITY_TIMEOUT
const USER_CONFIG = {
  INACTIVITY_TIMEOUT: 900000, // 15 minutes in milliseconds
  MANUAL_STATUS_THRESHOLD: 300000, // 5 minutes - minimum time before auto-switching from manual status
  ACTIVITY_DEBOUNCE: 5000, // 5 seconds between activity updates
};

interface UserContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  username: string;
  userApprovedStates: string[];
  loading: boolean;
  errorMessage: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUsername: (username: string) => void;
  updateStatus: (newStatus: UserStatusTypes) => Promise<void>;
  status: UserStatusTypes;
  setStatus: (UserStatusTypes: UserStatusTypes) => void;
  resetPassword: (username: string) => Promise<void>;
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined
);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userApprovedStates, setUserApprovedStates] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [status, setStatus] = useState<UserStatusTypes>(
    UserStatusTypes.OFFLINE
  );
  const [signalwireStatus, setSignalwireStatus] = useState({
    inConference: false,
    activeCall: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const lastStatusUpdate = useRef<number>(0);
  const statusUpdateTimeout = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController | null>(null);
  const lastManualStatusChange = useRef<number>(0);
  const lastActivityUpdate = useRef<number>(0);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUsername = sessionStorage.getItem("username");
    const storedAuth = sessionStorage.getItem("isAuthenticated");

    if (token && storedAuth === "true") {
      setUsername(storedUsername || "");
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && username) {
      updateStatus(UserStatusTypes.AVAILABLE);
    }
  }, [isAuthenticated, username]);

  const login = useCallback(
    async (username: string, password: string) => {
      const apiLoginUrl = import.meta.env.VITE_API_BASE_URL;

      if (!apiLoginUrl) {
        console.error("VITE_API_LOGIN is not set");
        setErrorMessage("API login URL is not set");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`${apiLoginUrl}/api/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const responseData = await response.json();
          sessionStorage.setItem("token", responseData.token);
          sessionStorage.setItem("username", username);
          sessionStorage.setItem("isAuthenticated", "true");

          setUsername(username);
          console.log("Logged in as", username);
          setIsAuthenticated(true);

          // Update shared state - CHANGE THIS PART
          if (window.electronAPI) {
            // Send to main process using the correct channel
            window.electronAPI.updateSharedState({
              isAuthenticated: true,
              username,
              initialized: true,
            });

            // Also register as a softphone window if we're in the softphone window
            if (window.location.hash.includes("softphone")) {
              window.electron.ipcRenderer.send("register-softphone", {});
            }
          }

          const userApprovedStatesResponse = await fetch(
            `${apiLoginUrl}/api/user/license/${username}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${responseData.token}` },
            }
          );

          const userApprovedStatesData =
            await userApprovedStatesResponse.json();

          setUserApprovedStates(
            userApprovedStatesData.map(
              (license: { state: any }) => license.state
            )
          );

          // Get the previous location from router state
          const from = location.state?.from || "/home";

          // Navigate based on environment
          if (window.location.hash.includes("softphone")) {
            // Stay on the softphone interface
            navigate("/softphone", { replace: true });
          } else {
            // Navigate to the previous page or home
            navigate(from, { replace: true });
          }
        } else {
          setErrorMessage("Invalid credentials. Please try again.");
        }
      } catch (error) {
        console.error("Error during login request:", error);
        setErrorMessage("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [navigate, location]
  );

  const logout = useCallback(() => {
    updateStatus(UserStatusTypes.OFFLINE).then(() => {
      setLoading(true);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      setLoading(false);
      navigate("/login");
    });
  }, [navigate]);

  const updateStatus = useCallback(
    async (newStatus: UserStatusTypes, isManual: boolean = true) => {
      const apiLoginUrl = import.meta.env.VITE_API_BASE_URL;
      if (!username) {
        console.error("username is not set");
        return;
      }

      if (isManual) {
        lastManualStatusChange.current = Date.now();
      }

      // Abort any pending status update
      if (abortController.current) {
        abortController.current.abort();
      }

      // Create new abort controller for this request
      abortController.current = new AbortController();

      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        await fetch(`${apiLoginUrl}/api/user-status/update-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: username,
            status: newStatus,
          }),
          signal: abortController.current.signal,
        });
        setStatus(newStatus);
      } catch (error: any) {
        if (error.name === "AbortError") {
          // Ignore aborted requests
          return;
        }
        console.error("Error updating status:", error);
      }
    },
    [username]
  );

  const resetPassword = useCallback(async (username: string) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await userService.resetPassword(username);
    } catch (error: any) {
      console.error("Error during password reset:", error);
      setErrorMessage(
        error.message ||
          "An error occurred during password reset. Please try again later."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const updateSignalwireStatus = useCallback(
    (conf: boolean, call: boolean) => {
      setSignalwireStatus({ inConference: conf, activeCall: call });
      // If on call/conference, set status to busy
      if (conf || call) {
        updateStatus(UserStatusTypes.BUSY);
      } else {
        // Return to available if not manually set to away/dnd
        if (status === UserStatusTypes.BUSY) {
          updateStatus(UserStatusTypes.AVAILABLE);
        }
      }
    },
    [status]
  );

  // Memoize the activity handler to prevent recreation on each render
  const handleActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);

    // Check if we should process this activity update
    if (now - lastActivityUpdate.current < USER_CONFIG.ACTIVITY_DEBOUNCE) {
      return;
    }
    lastActivityUpdate.current = now;

    // Only auto switch to Available if:
    // 1. Current status is AWAY
    // 2. It wasn't manually set recently
    if (
      status === UserStatusTypes.AWAY &&
      now - lastManualStatusChange.current > USER_CONFIG.MANUAL_STATUS_THRESHOLD
    ) {
      updateStatus(UserStatusTypes.AVAILABLE, false);
    }
  }, [status, updateStatus]);

  // Separate the inactivity check into its own memoized function
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    if (
      now - lastActivity >= USER_CONFIG.INACTIVITY_TIMEOUT &&
      status !== UserStatusTypes.AWAY &&
      status !== UserStatusTypes.OFFLINE
    ) {
      updateStatus(UserStatusTypes.AWAY);
    }
  }, [lastActivity, status, updateStatus]);

  // Activity monitoring effect
  useEffect(() => {
    const events = ["mousedown", "keydown", "mousemove", "wheel"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [handleActivity]); // Only depend on the memoized handler

  // Inactivity check effect
  useEffect(() => {
    const interval = setInterval(checkInactivity, 60000);

    return () => clearInterval(interval);
  }, [checkInactivity]); // Only depend on the memoized check function

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        username,
        userApprovedStates,
        loading,
        errorMessage,
        login,
        logout,
        setUsername,
        updateStatus,
        status,
        setStatus,
        resetPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
