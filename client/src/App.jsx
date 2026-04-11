import Landing from "./pages/Landing";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Library from "./pages/Library";
import SignupPage from "./pages/SignUp";
import AuthPage from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import DraftingWorkspace from "./pages/DraftingWorkspace";

function DashboardRouter() {
  const userStr = localStorage.getItem("nyaya_user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (user?.role === "student") {
    return <StudentDashboard />;
  } else if (user?.role === "lawyer" || user?.role === "professional") {
    return <Library />;
  } else {
    // If no role/not logged in, redirect to login
    return <Navigate to="/auth" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage/>} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Forward old explicit links to the unified dashboard */}
        <Route path="/library" element={<Navigate to="/dashboard" />} />
        <Route path="/student-dashboard" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/draft" element={<DraftingWorkspace />} />
      </Routes>
    </Router>
  );
}

export default App;