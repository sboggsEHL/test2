import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AuthenticationError,
  Lead,
  PipelineLead,
  TokenExpiredError,
} from "../models";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../config/routes";
import { formatCurrency, formatDate, formatDistanceFromNow } from "../utils";

interface PipelineContextProps {
  leads: PipelineLead[];
  setLeads: React.Dispatch<React.SetStateAction<PipelineLead[]>>;
  addLead: (newLead: PipelineLead) => void;
  loadLeads: (username: string) => Promise<void>;
  loading: boolean;
  error: string | Error | null;
  exportToLOS: (leadData: PipelineLead, username: string) => Promise<void>;
  isExporting: boolean;
}

const PipelineContext = createContext<PipelineContextProps | undefined>(
  undefined
);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Error | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const addLead = useCallback((newLead: PipelineLead) => {
    setLeads((prevLeads) => [newLead, ...prevLeads]);
  }, []);

  const loadLeads = useCallback(
    async (username: string) => {
      if (loading) return; // Prevent multiple calls if already loading
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_PIPELINE}?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            throw new TokenExpiredError("Token expired");
          } else if (response.status === 403) {
            throw new AuthenticationError("Not authorized");
          }
          throw new Error("Failed to load leads - " + response.statusText);
        }

        const data = await response.json();

        const formattedLeads = data.map((lead: PipelineLead) => ({
          ...lead,
          created_at: formatDate(lead?.created_at || ""),
          updated_at: formatDistanceFromNow(lead.updated_at || ""),
          mortgage_balance: formatCurrency(
            lead.mortgage_balance?.toString() || ""
          ),
          desired_loan_amount: formatCurrency(
            lead.desired_loan_amount?.toString() || ""
          ),
          estimated_value: formatCurrency(
            lead.estimated_value?.toString() || ""
          ),
        }));
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
    },
    [loading]
  );

  const exportToLOS = useCallback(
    async (leadData: PipelineLead, username: string) => {
      if (isExporting) return;
      setIsExporting(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/encompass/export`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ leadData, userName: username }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new TokenExpiredError("Token expired");
          } else if (response.status === 403) {
            throw new AuthenticationError("Not authorized");
          }
          throw new Error("Failed to export to LOS - " + response.statusText);
        }

        const result = await response.json();
        // You could add some success handling here if needed
      } catch (error: any) {
        if (
          error instanceof AuthenticationError ||
          error instanceof TokenExpiredError
        ) {
          // navigate("/" + AppRoutes.Login);
        }
        setError(error.message || "Error exporting to LOS");
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  return (
    <PipelineContext.Provider
      value={{
        leads,
        setLeads,
        addLead,
        loadLeads,
        loading,
        error,
        exportToLOS,
        isExporting,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = (): PipelineContextProps => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error("usePipeline must be used within a PipelineProvider");
  }
  return context;
};
