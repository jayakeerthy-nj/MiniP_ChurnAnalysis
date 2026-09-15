import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 25000,
  headers: {
    "Content-Type": "application/json"
  }
});

let isRefreshing = false;

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("aegis_access_token");
    
    // Auto-authenticate if no token is stored yet
    if (!token && !isRefreshing && !config.url?.includes("/auth/login")) {
      isRefreshing = true;
      try {
        const res = await axios.post("/api/auth/login", {
          email: "admin@bank.com",
          password: "Admin@123"
        });
        token = res.data.accessToken;
        if (token) {
          localStorage.setItem("aegis_access_token", token);
        }
      } catch (err) {
        console.warn("Initial authentication fallback:", err);
      } finally {
        isRefreshing = false;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      originalRequest._retry = true;
      try {
        const res = await axios.post("/api/auth/login", {
          email: "admin@bank.com",
          password: "Admin@123"
        });
        const token = res.data.accessToken;
        if (token) {
          localStorage.setItem("aegis_access_token", token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (loginErr) {
        return Promise.reject(loginErr);
      }
    }
    return Promise.reject(error);
  }
);