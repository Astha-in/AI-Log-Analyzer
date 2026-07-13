import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"
import DashboardLayout from "./layout/DashboardLayout"

import Dashboard from "./pages/Dashboard"
import UploadLogs from "./pages/UploadLogs"
import ParsedLogs from "./pages/ParsedLogs"
import AIAnalysis from "./pages/AIAnalysis"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/upload"
            element={<UploadLogs />}
          />

          <Route
            path="/parsed-logs"
            element={<ParsedLogs />}
          />

          <Route
            path="/ai-analysis"
            element={<AIAnalysis />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* UNKNOWN ROUTES */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App