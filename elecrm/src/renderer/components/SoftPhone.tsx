import React, { useState, useEffect } from "react";
import { Phone, Video, MessageSquare, Users, Clock, X } from "lucide-react";
import { useSignalWire } from "../context/SignalWireContext";
import { Dialer } from "./Dialer";
import { isElectron } from "../utils";
import { useUser } from "../context/UserContext";
import Login from '../pages/Login';

interface SoftphoneProps {
  isVisible: boolean;
  onClose?: () => void;
}

const Softphone: React.FC<SoftphoneProps> = ({ isVisible, onClose }) => {
  const {
    callState,
    isLoading,
    errorMessage,

    // Device states
    currentMicrophone,
    currentOutputDevice,
    currentRingDevice,
    availableMicrophones,
    availableSpeakers,

    // Device switchers
    applyMicrophone,
    applySpeaker,
    applyRingDevice,

    // Other functions
    dialNumber,
    endCall,
    connectToConferenceRoom,
    requestPermissions,
    mute,
    unmute,
    holdCall,
    resumeCall,
    disconnectFromConference,
    listCalls,
    listConferences,
    updateCall,
    deleteParticipant,
  } = useSignalWire();

  const { login, loading, errorMessage: loginError, setIsAuthenticated } = useUser();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const [activeTab, setActiveTab] = useState<string>("calls");

  useEffect(() => {
    const init = async () => {
      if (window.electron?.ipcRenderer) {
        // First try to get initial state
        try {
          const response = await window.electronAPI.getSharedState();
          console.log("[Softphone] Initial state:", response);
          if (response.success) {
          }
        } catch (err) {
          console.error("[Softphone] Error getting initial state:", err);
        }

        // Then listen for updates
        window.electron.ipcRenderer.on("shared-state", (newState: any) => {
          console.log("[Softphone] State update received:", newState);
        });
      }
    };

    init();
  }, []);

  const handleSoftphoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.username, loginForm.password);
    } catch (err) {
      console.error("[Softphone] Login error:", err);
    }
  };

  const containerClass = isElectron()
    ? "h-screen w-full flex flex-col bg-slate-800 text-text"
    : "fixed top-0 bottom-0 right-0 w-1/2 max-w-md bg-slate-800 text-text flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out z-[100]";

  const handleClose = () => {
    if (isElectron()) {
      window.close();
    } else if (onClose) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "calls":
        return <Dialer />;
      case "video":
        return <VideoChat />;
      case "chat":
        return <ChatInterface />;
      case "contacts":
        return <ContactList />;
      case "history":
        return <CallHistory />;
      default:
        return <Dialer />;
    }
  };

  if (!useUser().isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-800">
        <Login />
      </div>
    );
  }

  if (isElectron()) {
    return (
      <div className={containerClass}>
        <div className="flex justify-between items-center p-4 bg-sidebarBg text-titleText">
          <h2 className="text-lg font-semibold">Communications</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
        <nav className="bg-sidebarBg">
          {/* Tab navigation */}
          <ul className="flex">
            <TabButton
              icon={<Phone />}
              label="Calls"
              isActive={activeTab === "calls"}
              onClick={() => setActiveTab("calls")}
            />
            <TabButton
              icon={<Video />}
              label="Video"
              isActive={activeTab === "video"}
              onClick={() => setActiveTab("video")}
            />
            <TabButton
              icon={<MessageSquare />}
              label="Chat"
              isActive={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
            />
            <TabButton
              icon={<Users />}
              label="Contacts"
              isActive={activeTab === "contacts"}
              onClick={() => setActiveTab("contacts")}
            />
            <TabButton
              icon={<Clock />}
              label="History"
              isActive={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="flex justify-between items-center p-4 bg-sidebarBg text-titleText">
        <h2 className="text-lg font-semibold">Communications</h2>

        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-titleButtonHoverBg"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main body/tab content */}
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

      {/* Tab navigation */}
      <nav className="bg-sidebarBg">
        <ul className="flex">
          <TabButton
            icon={<Phone />}
            label="Calls"
            isActive={activeTab === "calls"}
            onClick={() => setActiveTab("calls")}
          />
          <TabButton
            icon={<Video />}
            label="Video"
            isActive={activeTab === "video"}
            onClick={() => setActiveTab("video")}
          />
          <TabButton
            icon={<MessageSquare />}
            label="Chat"
            isActive={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />
          <TabButton
            icon={<Users />}
            label="Contacts"
            isActive={activeTab === "contacts"}
            onClick={() => setActiveTab("contacts")}
          />
          <TabButton
            icon={<Clock />}
            label="History"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </ul>
      </nav>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => (
  <li className="w-full">
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center p-2 rounded-none ${
        isActive ? "bg-slate-500 text-text" : "text-text hover:bg-sky-800"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  </li>
);

const VideoChat: React.FC = () => (
  <div className="text-center">
    <div className="bg-chartBg h-48 mb-4 flex items-center justify-center rounded">
      Video chat area
    </div>
    <button className="bg-accent1 text-primaryText px-4 py-2 rounded hover:bg-accent2">
      Start Video Call
    </button>
  </div>
);

const ChatInterface: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto mb-4 p-4 bg-altContentBg rounded">
      Chat messages will appear here
    </div>
    <div className="flex">
      <input
        type="text"
        className="flex-1 p-2 bg-altContentBg text-primaryText rounded-l"
        placeholder="Type a message..."
      />
      <button className="bg-accent1 text-primaryText px-4 py-2 rounded-r hover:bg-accent2">
        Send
      </button>
    </div>
  </div>
);

const ContactList: React.FC = () => (
  <div>
    <input
      type="text"
      className="w-full p-2 mb-4 bg-altContentBg text-primaryText rounded"
      placeholder="Search contacts..."
    />
    <ul>
      {["John Doe", "Jane Smith", "Alice Johnson"].map((contact) => (
        <li
          key={contact}
          className="mb-2 p-2 bg-altContentBg rounded hover:bg-sidebarButtonHoverBg"
        >
          {contact}
        </li>
      ))}
    </ul>
  </div>
);

const CallHistory: React.FC = () => (
  <div>
    <h2 className="text-xl mb-4">Recent Calls</h2>
    <ul>
      {["Alice (Missed)", "Bob (Outgoing)", "Charlie (Incoming)"].map(
        (call) => (
          <li key={call} className="mb-2 p-2 bg-altContentBg rounded">
            {call}
          </li>
        )
      )}
    </ul>
  </div>
);

export default Softphone;
