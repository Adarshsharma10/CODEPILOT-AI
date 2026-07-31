import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/chat" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/chat" replace /> : <Register />}
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;