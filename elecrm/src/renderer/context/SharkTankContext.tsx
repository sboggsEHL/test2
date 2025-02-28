import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  SharkTankLead,
  AuthenticationError,
  TokenExpiredError,
} from "../models";
import { fetchSharkTankData } from "../services/SharkTankService";
import { useNavigate } from "react-router-dom";
import WebSocketClient from "../helpers/WebSocketClient"; // Updated import
import { FormatDateTime } from "../utils/FormatDateTime";
import { formatCurrency } from "../utils";

interface SharkTankContextProps {
  leads: SharkTankLead[];
  setLeads: React.Dispatch<React.SetStateAction<SharkTankLead[]>>;
  addLead: (newLead: SharkTankLead) => void;
  removeLead: (leadId: number) => void;
  loadLeads: () => Promise<void>;
  loading: boolean;
  error: string | Error | null;
}

export const formatSharkTankLead = (lead: SharkTankLead): SharkTankLead => {
  const formattedDate = FormatDateTime(lead.created_at);

  return {
    ...lead,
    created_at: `${formattedDate.date} ${formattedDate.time}`,
    mortgage_balance: formatCurrency(lead.mortgage_balance),
  };
};

const SharkTankContext = createContext<SharkTankContextProps | undefined>(
  undefined
);

export const SharkTankProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<SharkTankLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Error | null>(null);
  const [socket, setSocket] = useState<WebSocketClient | null>(null);

  const addLead = useCallback((newLead: SharkTankLead) => {
    setLeads((prevLeads) => [newLead, ...prevLeads]);
  }, []);

  const removeLead = useCallback((leadId: number) => {
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
  }, []);

  const loadLeads = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSharkTankData();
      const formattedLeads = data.map(formatSharkTankLead);
      setLeads(formattedLeads);
    } catch (error: any) {
      if (
        error instanceof AuthenticationError ||
        error instanceof TokenExpiredError
      ) {
        // navigate("/" + AppRoutes.Login);
      }
      setError(error.message || "Error loading leads");
    } finally {
      setLoading(false);
    }
  }, [loading, navigate]);

  // WebSocket setup
  useEffect(() => {
    const socketInstance = new WebSocketClient(
      import.meta.env.VITE_WEBSOCKET_BASE_URL,
      "/sharktank" // Specify the SharkTank namespace
    );
    socketInstance.connect();

    socketInstance.on("new-lead", (data: SharkTankLead) => {
      const newLead = formatSharkTankLead(data);
      addLead(newLead);
    });

    socketInstance.on("remove-lead", (data: SharkTankLead) => {
      removeLead(data.id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [addLead, removeLead]);

  return (
    <SharkTankContext.Provider
      value={{
        leads,
        setLeads,
        addLead,
        removeLead,
        loadLeads,
        loading,
        error,
      }}
    >
      {children}
    </SharkTankContext.Provider>
  );
};

export const useSharkTank = (): SharkTankContextProps => {
  const context = useContext(SharkTankContext);
  if (context === undefined) {
    throw new Error("useSharkTank must be used within a SharkTankProvider");
  }
  return context;
};
