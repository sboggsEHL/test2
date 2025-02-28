import { AuthenticationError, SharkTankLead, TokenExpiredError } from "../models";

// src/renderer/services/sharkTankService.ts
const fetchSharkTankData = async (): Promise<SharkTankLead[]> => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new AuthenticationError("Authentication token not found");
  }

  const response = await fetch(import.meta.env.VITE_API_SHARKTANK, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new TokenExpiredError("Token expired");
    }
    throw new Error("Failed to fetch Shark Tank data");
  }

  return await response.json();
};

export { fetchSharkTankData };
