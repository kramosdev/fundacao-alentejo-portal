import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import UserManagement from "./pages/UserManagement";
import Incidents from "./pages/Incidents";
import QuickActionsHub from "./pages/QuickActionsHub";
import Reports from "./pages/Reports";
import StrategicDashboard from "./pages/StrategicDashboard";
import AllActivity from "./pages/AllActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/quick-actions" element={<QuickActionsHub />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/strategic-dashboard" element={<StrategicDashboard />} />
          <Route path="/all-activity" element={<AllActivity />} />
          <Route path="/audit-logs" element={<Reports />} />
          <Route path="/system-reports" element={<Reports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
