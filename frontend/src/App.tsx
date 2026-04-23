import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/ui/Toast";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientDetail from "./pages/PatientDetail";
import Reports from "./pages/Reports";
import UploadReport from "./pages/UploadReport";
import Settings from "./pages/Settings";

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Toast />
      <Sidebar className="shrink-0" />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <main className="flex-1 overflow-y-auto pb-8 pt-14 lg:pt-0 scroll-smooth hover:scrollbar-thin scrollbar-thumb-slate-200">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/upload" element={<UploadReport />} />
            <Route path="/reports/upload/:reportId" element={<UploadReport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
