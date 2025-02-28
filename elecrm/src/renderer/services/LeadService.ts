import { AuthenticationError, TokenExpiredError } from "../models";

// src/renderer/services/leadService.ts
const assignLead = async (leadId: any) => {
  const token = sessionStorage.getItem('token');
  const username = sessionStorage.getItem('username');
  if (!token) {
    throw new AuthenticationError("Authentication token not found");
  }

  const response = await fetch(import.meta.env.VITE_API_ASSIGNLEAD, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ leadId, username }), // Adjust the body as needed
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new TokenExpiredError("Token expired");
    }
    throw new Error("Failed to assign lead - " + response.statusText);
  }

  return await response.json();
};

export { assignLead };
