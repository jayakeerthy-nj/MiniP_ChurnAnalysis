import { create } from "zustand";
import axios from "axios";

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "MANAGER";
  title?: string;
  branch?: string;
}

export const DEMO_PROFILES: Record<string, { user: User; pass: string }> = {
  "Risk Analyst": {
    user: {
      userId: "USR-002",
      name: "Priya Sharma",
      email: "analyst@bank.com",
      role: "ANALYST",
      title: "Senior Risk & Churn Analyst",
      branch: "HQ Intelligence Unit"
    },
    pass: "Analyst@123"
  },
  "Branch Manager": {
    user: {
      userId: "USR-003",
      name: "Vikram Mehta",
      email: "manager@bank.com",
      role: "MANAGER",
      title: "Regional Branch Manager",
      branch: "Mumbai Central - Tier 1"
    },
    pass: "Manager@123"
  },
  "Chief Risk Officer": {
    user: {
      userId: "USR-001",
      name: "Arjun Kapoor",
      email: "admin@bank.com",
      role: "ADMIN",
      title: "Chief Risk Officer & Platform Admin",
      branch: "Executive Office"
    },
    pass: "Admin@123"
  },
  "Compliance Officer": {
    user: {
      userId: "USR-004",
      name: "Ananya Deshmukh",
      email: "compliance@bank.com",
      role: "ADMIN",
      title: "Governance & Audit Lead",
      branch: "Regulatory Compliance Group"
    },
    pass: "Admin@123"
  },
  "Demo Guest": {
    user: {
      userId: "USR-005",
      name: "Executive Guest",
      email: "guest@bank.com",
      role: "ANALYST",
      title: "Platform Evaluator",
      branch: "Global Sandbox"
    },
    pass: "Analyst@123"
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  activeTab: string;
  selectedCustomerId: string | null;
  setUser: (user: User | null, token?: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedCustomerId: (id: string | null) => void;
  logout: () => void;
  switchRole: (role: "ADMIN" | "ANALYST" | "MANAGER") => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<boolean>;
  loginDemoProfile: (profileKey: string) => Promise<boolean>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  activeTab: "dashboard",
  selectedCustomerId: null,

  setUser: (user, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("aegis_access_token", token);
    }
    set({ user, token: token || null });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedCustomerId: (id) => set({ selectedCustomerId: id, activeTab: "customer-detail" }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aegis_access_token");
    }
    set({ user: null, token: null });
  },

  loginWithCredentials: async (email: string, pass: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    try {
      const res = await axios.post("/api/auth/login", { email: trimmedEmail, password: pass });
      const { accessToken, user } = res.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_access_token", accessToken);
      }
      set({ user, token: accessToken });
      return true;
    } catch (err) {
      // Offline fallback: check against demo profiles with correct password
      const matched = Object.values(DEMO_PROFILES).find(
        (p) => p.user.email.toLowerCase() === trimmedEmail && p.pass === pass
      );
      if (matched) {
        const mockToken = `demo_jwt_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("aegis_access_token", mockToken);
        }
        set({ user: matched.user, token: mockToken });
        return true;
      }
      return false;
    }
  },

  loginDemoProfile: async (profileKey: string) => {
    const profile = DEMO_PROFILES[profileKey];
    if (!profile) return false;

    try {
      const res = await axios.post("/api/auth/login", {
        email: profile.user.email,
        password: profile.pass
      });
      const { accessToken, user } = res.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_access_token", accessToken);
      }
      set({ user: { ...user, title: profile.user.title }, token: accessToken });
      return true;
    } catch (e) {
      // Backend offline: use demo profile data as fallback
      const mockToken = `demo_jwt_${profile.user.userId}_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_access_token", mockToken);
      }
      set({ user: profile.user, token: mockToken });
      return true;
    }
  },

  switchRole: async (role) => {
    const creds: Record<string, { email: string; pass: string; name: string }> = {
      ADMIN: { email: "admin@bank.com", pass: "Admin@123", name: "Arjun Kapoor" },
      ANALYST: { email: "analyst@bank.com", pass: "Analyst@123", name: "Priya Sharma" },
      MANAGER: { email: "manager@bank.com", pass: "Manager@123", name: "Vikram Mehta" }
    };
    const target = creds[role];
    try {
      const res = await axios.post("/api/auth/login", { email: target.email, password: target.pass });
      const { accessToken, user } = res.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_access_token", accessToken);
      }
      set({ user, token: accessToken });
    } catch (err) {
      const mockToken = `demo_jwt_${role}_${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_access_token", mockToken);
      }
      set({
        user: {
          userId: role === "ADMIN" ? "USR-001" : role === "ANALYST" ? "USR-002" : "USR-003",
          name: target.name,
          email: target.email,
          role
        },
        token: mockToken
      });
    }
  },

  initAuth: async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("aegis_access_token");
      if (token) {
        // Verify token is still valid with backend
        try {
          const res = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.user) {
            set({ user: res.data.user, token });
          }
        } catch {
          // Token invalid or expired: clear and redirect to login
          localStorage.removeItem("aegis_access_token");
          set({ user: null, token: null });
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      } else {
        // No token: redirect to login if not already there
        if (!window.location.pathname.includes("/login") && window.location.pathname.includes("/workspace")) {
          window.location.href = "/login";
        }
      }
    }
  }
}));
