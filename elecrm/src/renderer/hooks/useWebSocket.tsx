import { useContext, useEffect } from "react";
import WebSocketClient from "../helpers/WebSocketClient";
import { useToast } from "../context/ToastContext";
import { NotificationLead } from "../models/websocket";
import { useLead } from "../context/LeadContext";
import { useNavigate } from "react-router-dom";
import { useSignalWire } from "../context/SignalWireContext";
import { useUser } from "../context/UserContext";
import { UserStatus, UserStatusTypes } from '../models/status'; // Adjust the path as necessary
import { AppRoutes } from "../config/routes";
// Use the ipcRenderer exposed via preload script
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, data: any) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

export const useWebSocket = () => {
  const { isAuthenticated, username, setStatus } = useUser();
  const { showToast } = useToast();
  const { assignLeadById } = useLead();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create WebSocket client instances for both namespaces
    const sharkTankSocket = new WebSocketClient(
      import.meta.env.VITE_WEBSOCKET_BASE_URL,
      "/sharktank"
    );

    const userStatusSocket = new WebSocketClient(
      import.meta.env.VITE_WEBSOCKET_BASE_URL,
      "/userstatus"
    );

    // Connect to both namespaces
    sharkTankSocket.connect();
    userStatusSocket.connect();

    sharkTankSocket.on("new_lead", (data: NotificationLead) => {
      console.log("🚀 [WebSocket] New lead received:", data);
    
      // Check if data has the expected structure
      if (!data || !data.first_name || !data.last_name || !data.lead_id) {
        console.error("❌ [WebSocket] Incomplete lead data:", data);
        return;
      }
    
      // Trigger a desktop notification if in Electron
      if (window.electron) {
        console.log("🖥️ [Notification] Sending desktop notification via Electron.");
        window.electron.ipcRenderer.send("show-notification", {
          title: "New Lead Received!",
          description: `Name: ${data.first_name} ${data.last_name}`,
          leadId: data.lead_id,
          primaryActionLabel: "Assign lead",
        });
      } else {
        // Trigger a web toast if not in Electron
        console.log("🌐 [Notification] Triggering web toast notification.");
        try {
          showToast(
            "New Lead Received!",
            `Name: ${data.first_name} ${data.last_name}`,
            {
              primaryActionLabel: "Assign lead",
              primaryAction: () => {
                console.log("🔄 [Action] Assigning lead:", data.lead_id);
                assignLeadById(data.lead_id);
                navigate(`${AppRoutes.Pipeline}?selectedLead=${data.lead_id}`);
              },
              leadId: data.lead_id,
            }
          );
          console.log("✅ [Notification] Toast shown successfully.");
        } catch (error) {
          console.error("❌ [Notification] Error showing toast:", error);
        }
      }
    });
    

    sharkTankSocket.on("remove-lead", (data: any) => {
      console.log("Lead removed:", data);
      if (!window.electron) {
        // Optionally handle the removed lead
        // showToast("Lead Removed", `Lead ID: ${data.lead_id} was removed`);
      }
    });

    // Handle Electron-specific events for assigning leads
    if (window.electron) {
      window.electron.ipcRenderer.on("assign-lead", (leadId: string) => {
        if (leadId) {
          console.log("Assigning lead from desktop notification:", leadId);
          assignLeadById(leadId);
          navigate(`${AppRoutes.Pipeline}?selectedLead=${leadId}`);
        }
      });
    }

    /** === USER STATUS NAMESPACE HANDLERS === */
    userStatusSocket.on("user_status_updated", (data: { user_id: string, masterStatus: string }) => {
      if (data.user_id === username) {
        setStatus(data.masterStatus as UserStatusTypes);
      }
    });

    function emitStatusUpdate(
      elecrmClient: boolean,
      signalwireConf: boolean,
      activeCall: boolean,
      userStatusInput: string | null
    ) {
      const status: UserStatus = {
        user_id: username,
        elecrm_client: elecrmClient,
        signalwire_conf: signalwireConf,
        active_call: activeCall,
        user_status_input: userStatusInput,
      };
      userStatusSocket.emit("update_user_status", status);
    }

    // Window focus/blur handlers
    window.onfocus = () => emitStatusUpdate(true, false, false, null);
    window.onblur = () => emitStatusUpdate(false, false, false, null);

    // Set initial online status
    emitStatusUpdate(true, false, false, 'available');

    // Cleanup: Disconnect the WebSocket connections on unmount
    return () => {
      // Set offline status before disconnecting
      emitStatusUpdate(false, false, false, 'offline');
      sharkTankSocket.disconnect();
      userStatusSocket.disconnect();

      // Clean up Electron event listeners
      if (window.electron) {
        window.electron.ipcRenderer.removeAllListeners("assign-lead");
      }
    };
  }, [isAuthenticated, username, setStatus]);
};

export default useWebSocket;