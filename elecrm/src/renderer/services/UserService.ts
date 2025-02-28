import axios from "axios";
import { User, CreateUserDTO } from "../models/user";
import { AuthenticationError, TokenExpiredError } from "../models";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new AuthenticationError("No authentication token found");
  }
  return { Authorization: `Bearer ${token}` };
};

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new TokenExpiredError("Token expired");
      }
      throw error;
    }
  },

  createUser: async (userData: CreateUserDTO): Promise<User> => {
    try {
      const response = await axios.post(API_URL, userData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new TokenExpiredError("Token expired");
      }
      throw error;
    }
  },

  updateUser: async (
    username: string,
    userData: Partial<User>
  ): Promise<User> => {
    try {
      const response = await axios.put(`${API_URL}/${username}`, userData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new TokenExpiredError("Token expired");
      }
      throw error;
    }
  },

  resetPassword: async (username: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/slackreset`, {
        username,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new TokenExpiredError("Token expired");
      }
      throw error;
    }
  },
};
