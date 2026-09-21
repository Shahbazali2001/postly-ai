import React, { createContext, useContext, useState, useEffect } from "react";
import { api, type User } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("postly_token");
      const storedUser = localStorage.getItem("postly_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading stored auth state:", e);
      localStorage.removeItem("postly_token");
      localStorage.removeItem("postly_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    const userData: User = {
      _id: data._id,
      name: data.name,
      email: data.email,
      token: data.token,
    };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem("postly_token", data.token);
    localStorage.setItem("postly_user", JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.auth.register({ name, email, password });
    const userData: User = {
      _id: data._id,
      name: data.name,
      email: data.email,
      token: data.token,
    };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem("postly_token", data.token);
    localStorage.setItem("postly_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("postly_token");
    localStorage.removeItem("postly_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
