import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CreateProblemPage from "./pages/CreateProblemPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import DashboardPage from "./pages/DashboardPage";

function AppContent() {
  const { token } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);

  const onNavigate = (p, id = null) => {
    setSelectedId(id);
    setPage(p);
  };

  if (token) {
    switch (page) {
      case "create":
        return <CreateProblemPage onNavigate={onNavigate} />;
      case "problem":
        return <ProblemDetailPage problemId={selectedId} onNavigate={onNavigate} />;
      case "dashboard":
        return <DashboardPage onNavigate={onNavigate} />;
      default:
        return <HomePage onNavigate={onNavigate} />;
    }
  }

  switch (page) {
    case "register":
      return <RegisterPage onNavigate={onNavigate} />;
    default:
      return <LoginPage onNavigate={onNavigate} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
