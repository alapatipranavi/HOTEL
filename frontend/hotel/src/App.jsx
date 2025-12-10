// frontend/src/App.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SuperAdmin from "./pages/SuperAdmin";


// localStorage nundi user safe ga tesukodaniki
function getInitialUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("user");
    const token = window.localStorage.getItem("token");
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse user from storage:", e);
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("token");
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getInitialUser);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    window.localStorage.setItem("token", data.token);
    window.localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.clear();
  };

  return (
    <>
      <Routes>
        {/* user lekapotey – anni routes Auth ki */}
        {!user && (
          <Route
            path="*"
            element={<Auth onAuthSuccess={handleAuthSuccess} />}
          />
        )}

        {/* user unte – Layout + inner routes */}
        {user && (
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
          </Route>
        )}
      </Routes>
    </>
  );
}
