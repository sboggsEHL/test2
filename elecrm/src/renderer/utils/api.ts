// src/utils/api.ts

import axios from "axios";

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: "http://localhost:3001/api", // Adjust the baseURL as needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to dial a number via the test-dial endpoint
export const testDialNumberAPI = async (from: string, to: string, url: string) => {
  try {
    const response = await apiClient.post("/signalwire/test-dial", {
      from,
      to,
      url,
    });
    return response.data;
  } catch (error: any) {
    // Handle errors appropriately
    throw error.response?.data || new Error("API request failed");
  }
};
