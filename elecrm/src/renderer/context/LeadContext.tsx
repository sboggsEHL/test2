import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AuthenticationError,
  Lead,
  PipelineLead,
  TokenExpiredError,
} from "../models";
import { assignLead } from "../services/LeadService";
import { useNavigate } from "react-router-dom";
import { usePipeline } from "./PipelineContext";
import { AppRoutes } from "../config/routes";

interface LeadContextProps {
  currentSelectedLead: Lead | null;
  setCurrentSelectedLead: React.Dispatch<React.SetStateAction<Lead | null>>;
  assignLeadById: (leadId: string) => Promise<void>;
  createNewLead: (lead: PipelineLead) => Promise<void>;
  updateExistingLead: (
    leadId: number,
    lead: Partial<PipelineLead>
  ) => Promise<void>;
  deleteExistingLead: (leadId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LeadContext = createContext<LeadContextProps | undefined>(undefined);

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const { loadLeads } = usePipeline();
  const [currentSelectedLead, setCurrentSelectedLead] = useState<Lead | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignLeadById = useCallback(async (leadId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await assignLead(leadId);
      const username = sessionStorage.getItem("username");
      await loadLeads(username || "");
      console.log(`Lead with ID ${leadId} assigned successfully.`);
    } catch (error) {
      if (
        error instanceof AuthenticationError ||
        error instanceof TokenExpiredError
      ) {
        navigate("/" + AppRoutes.Login);
      }
      console.error("Error assigning lead:", error);
      setError("Failed to assign lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewLead = useCallback(async (lead: Omit<PipelineLead, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      // await createLead(lead);
      console.log(`Lead created successfully.`);
    } catch (error) {
      if (
        error instanceof AuthenticationError ||
        error instanceof TokenExpiredError
      ) {
        navigate("/" + AppRoutes.Login);
      }
      console.error("Error creating lead:", error);
      setError("Failed to create lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExistingLead = useCallback(
    async (leadId: number, lead: Partial<PipelineLead>) => {
      setIsLoading(true);
      setError(null);
      try {
        // await updateLead(leadId, lead);
        console.log(`Lead with ID ${leadId} updated successfully.`);
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof TokenExpiredError
        ) {
          navigate("/" + AppRoutes.Login);
        }
        console.error("Error updating lead:", error);
        setError("Failed to update lead. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteExistingLead = useCallback(async (leadId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // await deleteLead(leadId);
      console.log(`Lead with ID ${leadId} deleted successfully.`);
    } catch (error) {
      if (
        error instanceof AuthenticationError ||
        error instanceof TokenExpiredError
      ) {
        navigate("/" + AppRoutes.Login);
      }
      console.error("Error deleting lead:", error);
      setError("Failed to delete lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LeadContext.Provider
      value={{
        currentSelectedLead,
        setCurrentSelectedLead,
        assignLeadById,
        createNewLead,
        updateExistingLead,
        deleteExistingLead,
        isLoading,
        error,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = (): LeadContextProps => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
};
