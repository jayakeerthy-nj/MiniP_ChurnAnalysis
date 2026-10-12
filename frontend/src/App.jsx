import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModelProvider } from "./context/ModelContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Loading } from "./components/ui/Loading";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Segments } from "./pages/Segments";
import { Risk } from "./pages/Risk";
import { ChurnAnalytics } from "./pages/ChurnAnalytics";
import { Recommendations } from "./pages/Recommendations";
import { Simulator } from "./pages/Simulator";
import { Reports } from "./pages/Reports";
import { Admin } from "./pages/Admin";

// Layout Wrapper with sliding taskbar state
const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-neutral-100 font-sans">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Protected Route Guard with strict Role-Based Access Control
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading message="Verifying institutional session..." fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is restricted from this specific route, navigate to default dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout />;
};

export const App = () => {
  return (
    <AuthProvider>
      <ModelProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Login Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* General Operational Features: Accessible by ALL roles (ADMIN, ANALYST, MANAGER) */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ANALYST", "MANAGER"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Deep Analytics & ML Modeling: Accessible by ADMIN and ANALYST only */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ANALYST"]} />}>
              <Route path="/segments" element={<Segments />} />
              <Route path="/risk" element={<Risk />} />
              <Route path="/churn" element={<ChurnAnalytics />} />
              <Route path="/simulator" element={<Simulator />} />
            </Route>

            {/* Administrative Governance & Model Telemetry: Accessible by ADMIN only */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Catch-all redirect to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ModelProvider>
    </AuthProvider>
  );
};

export default App;
