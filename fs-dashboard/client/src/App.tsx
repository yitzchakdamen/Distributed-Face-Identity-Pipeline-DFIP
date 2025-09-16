import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ApplicationLayout from "./components/application-layout/ApplicationLayout";
import NotFoundPage from "./components/application-layout/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import CamerasPage from "./pages/CamerasPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ApplicationLayout>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/cameras" element={
              <ProtectedRoute>
                <CamerasPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ApplicationLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
