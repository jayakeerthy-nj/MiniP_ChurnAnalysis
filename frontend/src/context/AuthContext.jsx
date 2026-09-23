import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../services/api";

export const DEMO_PROFILES = {
  "Chief Risk Officer": {
    email: "admin@bank.com",
    pass: "Admin@123",
    role: "ADMIN",
    title: "Chief Risk Officer & Platform Admin",
    name: "Arjun Kapoor",
    branch: "Executive Office"
  },
  "Risk Analyst": {
    email: "analyst@bank.com",
    pass: "Analyst@123",
    role: "ANALYST",
    title: "Senior Risk & Churn Analyst",
    name: "Priya Sharma",
    branch: "HQ Intelligence Unit"
  },
  "Branch Manager": {
    email: "manager@bank.com",
    pass: "Manager@123",
    role: "MANAGER",
    title: "Regional Branch Manager",
    name: "Vikram Mehta",
    branch: "Mumbai Central - Tier 1"
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("aegis_access_token") : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = useCallback(async () => {
    const storedToken = localStorage.getItem("aegis_access_token");
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
        setToken(storedToken);
      } else {
        throw new Error("Invalid user response");
      }
    } catch {
      // If token expired/invalid, clear
      localStorage.removeItem("aegis_access_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const loginWithCredentials = async (email, password) => {
    setError(null);
    const trimmedEmail = email.toLowerCase().trim();
    try {
      const res = await authApi.login({ email: trimmedEmail, password });
      const { accessToken, user: userData } = res.data;
      if (accessToken) {
        localStorage.setItem("aegis_access_token", accessToken);
        setToken(accessToken);
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      // Offline / Demo fallback matching credentials
      const matched = Object.values(DEMO_PROFILES).find(
        (p) => p.email.toLowerCase() === trimmedEmail && p.pass === password
      );
      if (matched) {
        const mockToken = `demo_jwt_${Date.now()}`;
        localStorage.setItem("aegis_access_token", mockToken);
        setToken(mockToken);
        setUser({
          userId: `USR-${matched.role}`,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          title: matched.title,
          branch: matched.branch
        });
        return true;
      }

      const errMsg = err.response?.data?.error || "Invalid email or password";
      setError(errMsg);
      return false;
    }
  };

  const loginDemoProfile = async (profileKey) => {
    const profile = DEMO_PROFILES[profileKey];
    if (!profile) return false;
    return loginWithCredentials(profile.email, profile.pass);
  };

  const switchRole = async (targetRole) => {
    const profile = Object.values(DEMO_PROFILES).find((p) => p.role === targetRole);
    if (profile) {
      await loginWithCredentials(profile.email, profile.pass);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("aegis_access_token");
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    loginWithCredentials,
    loginDemoProfile,
    switchRole,
    logout,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
