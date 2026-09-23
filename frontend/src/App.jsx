import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

// Layout Wrapper
const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-neutral-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading message="Verifying institutional session..." fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Workspace Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/churn" element={<ChurnAnalytics />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Admin Protected Route */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
