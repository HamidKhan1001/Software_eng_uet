// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  // Form states
  const [tab, setTab] = useState("login"); // "login" | "signup" | "reset"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Reset
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const r = await api.login(email, password);
      localStorage.setItem("token", r.token);
      setUser(r.user);
      navigate(r.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const r = await api.register({
        name,
        email: signupEmail,
        password: signupPassword,
        regNo,
        batchNumber,
      });
      localStorage.setItem("token", r.token);
      setUser(r.user);
      navigate(r.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      await api.requestReset(resetEmail);
      setMsg("📩 If this email exists, a reset link has been sent.");
      setTab("login");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <img
            src="/uet-logo.png"
            alt="UET SE"
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
              margin: "0 auto 6px",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h2 style={{ fontSize: 18, margin: 0 }}>UET Software Engineering</h2>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={tab === "signup" ? "active" : ""}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" && (
          <>
            <h3>Login</h3>
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "⏳ Logging in..." : "Login"}
              </button>
            </form>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                className="btn-link"
                onClick={() => setTab("reset")}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {tab === "signup" && (
          <>
            <h3>Sign Up</h3>
            <form onSubmit={handleSignup} className="auth-form">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Registration Number"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Batch Year (e.g. 2024)"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "⏳ Creating account..." : "Sign Up"}
              </button>
            </form>
          </>
        )}

        {tab === "reset" && (
          <>
            <h3>Reset Password</h3>
            <form onSubmit={handleReset} className="auth-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "⏳ Sending link..." : "Send Reset Link"}
              </button>
            </form>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                className="btn-link"
                onClick={() => setTab("login")}
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

        {msg && <p style={{ color: "green", marginTop: 10 }}>{msg}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
