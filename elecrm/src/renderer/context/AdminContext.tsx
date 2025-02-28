import React, { createContext, useContext, useState, useCallback } from "react";
import { User, CreateUserDTO } from "../models/user";
import { userService } from "../services/UserService";

interface AdminContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  loadUsers: () => Promise<void>;
  createUser: (userData: CreateUserDTO) => Promise<void>;
  updateUser: (username: string, userData: Partial<User>) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Admin context loading users");
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (userData: CreateUserDTO) => {
      setLoading(true);
      setError(null);
      try {
        await userService.createUser(userData);
        await loadUsers();
      } catch (err: any) {
        setError(err.message || "Failed to create user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  const updateUser = useCallback(
    async (username: string, userData: Partial<User>) => {
      setLoading(true);
      setError(null);
      try {
        await userService.updateUser(username, userData);
        await loadUsers();
      } catch (err: any) {
        setError(err.message || "Failed to update user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  return (
    <AdminContext.Provider
      value={{
        users,
        loading,
        error,
        selectedUser,
        loadUsers,
        createUser,
        updateUser,
        setSelectedUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
