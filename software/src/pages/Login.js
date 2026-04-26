// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/login.css";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
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
      console.log('Signup attempt:', { name, email: signupEmail, regNo, batchNumber });
      const r = await api.register({
        name,
        email: signupEmail,
        password: signupPassword,
        regNo,
        batchNumber,
      });
      console.log('Signup response:', r);
      console.log('User object:', r.user);
      console.log('Token:', r.token ? 'received' : 'MISSING');
      if (!r.token || !r.user) {
        throw new Error('Invalid response: missing token or user');
      }
      localStorage.setItem("token", r.token);
      setUser(r.user);
      console.log('Navigating to:', r.user.role === "admin" ? "/admin" : "/dashboard");
      navigate(r.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error('Signup error:', err);
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
      setResetEmail("");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="login-container">
      {/* Mobile Header with Hamburger Menu */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-logo">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="mobile-title">UET</div>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
          </button>
        </div>

        {/* Mobile Sidebar Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu animate-slide-down">
            <div className="mobile-menu-item">
              <i className="fas fa-graduation-cap"></i>
              <span>UET Peshawar</span>
            </div>
            <div className="mobile-menu-item">
              <i className="fas fa-code"></i>
              <span>Software Engineering</span>
            </div>
            <div className="mobile-menu-item">
              <i className="fas fa-star"></i>
              <span>Excellence in Code</span>
            </div>
            <div className="mobile-menu-item">
              <i className="fas fa-lightbulb"></i>
              <span>Innovation & Learning</span>
            </div>
            <div className="mobile-menu-divider"></div>
            <button
              className="mobile-menu-btn"
              onClick={() => {
                setTab("login");
                setMobileMenuOpen(false);
              }}
            >
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => {
                setTab("signup");
                setMobileMenuOpen(false);
              }}
            >
              <i className="fas fa-user-plus"></i> Sign Up
            </button>
          </div>
        )}
      </div>
      <div className="code-bg">
        <div className="code-char">const UET = true;</div>
        <div className="code-char">function learn() { }</div>
        <div className="code-char">class Student { }</div>
        <div className="code-char">async init()</div>
        <div className="code-char">import UET</div>
        <div className="code-char">export excellence</div>
        <div className="code-char">await success();</div>
        <div className="code-char">SoftwareEng ++</div>
        <div className="code-char">Peshawar</div>
        <div className="code-char">Innovation</div>
        <div className="code-char">git commit -m</div>
        <div className="code-char">npm run dev</div>
        <div className="code-char">const future</div>
        <div className="code-char">while(true) {}</div>
        <div className="code-char">Array.map()</div>
        <div className="code-char">Object.create()</div>
      </div>

      <div className="login-wrapper">
        {/* Left Side - Hero Section */}
        <div className="login-hero">
          <div className="hero-content">
            <div className="logo-section">
              <img
                src="/uet-logo.png"
                alt="UET"
                className="logo"
                onError={(e) => {
                  e.currentTarget.innerHTML = '<i class="fas fa-graduation-cap"></i>';
                }}
              />
            </div>
            <h1 className="hero-title">UET Software Engineering</h1>
            <p className="hero-subtitle">Excellence in Code & Innovation</p>
            
            <div className="features-list">
              <div className="feature">
                <i className="fas fa-book"></i>
                <span>Learn & Grow</span>
              </div>
              <div className="feature">
                <i className="fas fa-users"></i>
                <span>Collaborate</span>
              </div>
              <div className="feature">
                <i className="fas fa-code"></i>
                <span>Code Together</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`tab-btn ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
              <button
                className={`tab-btn ${tab === "signup" ? "active" : ""}`}
                onClick={() => setTab("signup")}
              >
                <i className="fas fa-user-plus"></i> Sign Up
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="alert-content">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
            {msg && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                <div className="alert-content">
                  {msg}
                </div>
              </div>
            )}

            {/* Login Form */}
            {tab === "login" && (
              <div className="form-container">
                <h2><i className="fas fa-lock"></i> Welcome Back</h2>
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-key"></i> Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
                    ) : (
                      <><i className="fas fa-arrow-right"></i> Login</>
                    )}
                  </button>
                </form>
                <div className="forgot-password">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setTab("reset")}
                  >
                    <i className="fas fa-question-circle"></i> Forgot password?
                  </button>
                </div>
              </div>
            )}

            {/* Signup Form */}
            {tab === "signup" && (
              <div className="form-container">
                <h2><i className="fas fa-rocket"></i> Join Us</h2>
                <form onSubmit={handleSignup} className="auth-form">
                  <div className="form-group">
                    <label><i className="fas fa-user"></i> Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><i className="fas fa-id-card"></i> Reg Number</label>
                      <input
                        type="text"
                        placeholder="SE-001"
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label><i className="fas fa-calendar"></i> Batch</label>
                      <input
                        type="number"
                        placeholder="2024"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-lock"></i> Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <div className="password-requirement">
                      <span className={signupPassword.length >= 8 ? 'valid' : 'invalid'}>
                        Minimum 8 characters required
                      </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
                    ) : (
                      <><i className="fas fa-check"></i> Sign Up</>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Reset Form */}
            {tab === "reset" && (
              <div className="form-container">
                <h2><i className="fas fa-redo"></i> Reset Password</h2>
                <form onSubmit={handleReset} className="auth-form">
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                    ) : (
                      <><i className="fas fa-paper-plane"></i> Send Reset Link</>
                    )}
                  </button>
                </form>
                <div className="back-to-login">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setTab("login")}
                  >
                    <i className="fas fa-arrow-left"></i> Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
