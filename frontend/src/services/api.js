import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aegis_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("aegis_access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout")
};

export const customerApi = {
  getCustomers: (params) => api.get("/customers", { params }),
  getCustomer360: (id) => api.get(`/customers/${id}`),
  getAiSummary: (id) => api.get(`/customers/${id}/ai-summary`)
};

export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getRisk: () => api.get("/analytics/risk"),
  getChurn: () => api.get("/analytics/churn"),
  getSegments: () => api.get("/analytics/segments"),
  getExecutiveBrief: () => api.get("/analytics/executive-brief")
};

export const recommendationApi = {
  getRecommendations: () => api.get("/recommendations")
};

export const simulatorApi = {
  simulate: (payload) => api.post("/simulator/simulate", payload)
};

export const reportApi = {
  getSummary: () => api.get("/reports/summary"),
  getCsvExportUrl: () => `${baseURL}/reports/export/csv`
};

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  createUser: (userData) => api.post("/admin/users", userData),
  getAuditLogs: () => api.get("/admin/audit"),
  getModelMonitoring: () => api.get("/admin/models"),
  uploadDataset: (formData) =>
    api.post("/admin/upload-dataset", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

export default api;
