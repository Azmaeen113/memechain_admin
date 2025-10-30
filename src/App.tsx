import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PresaleManagement from "./pages/PresaleManagement";
import TokenomicsManagement from "./pages/TokenomicsManagement";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import "./index.css";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/presale-management" element={
          <ProtectedRoute>
            <PresaleManagement />
          </ProtectedRoute>
        } />
        <Route path="/tokenomics" element={
          <ProtectedRoute>
            <TokenomicsManagement />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
