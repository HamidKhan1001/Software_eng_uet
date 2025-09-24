import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Community from "./pages/Community";
import Scan from "./pages/Scan";
import "./styles.css";

export default function App() {
  const { user, setUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="card">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} />}
          />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route
            path="/admin"
            element={user.role === "admin" ? <Admin user={user} /> : <Navigate to="/" />}
          />
          <Route path="/community" element={<Community user={user} />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
