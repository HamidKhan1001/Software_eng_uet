import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header({ user, onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header className="header">
      <button className="icon-btn burger" onClick={onToggleSidebar} aria-label="menu">
        ☰
      </button>

      <Link
        to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/"}
        className="brand-link"
      >
        <img
          src="/uet-logo.png"
          alt="UET SE logo"
          className="logo-img"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="logo-dot" />
        <div className="brand-text">
          <h1>UET Software Engineering</h1>
          <span className="badge">Portal</span>
        </div>
      </Link>

      {user && (
        <nav className="topnav">
          <Link className={loc.pathname.startsWith("/dashboard") ? "active" : ""} to="/dashboard">
            Dashboard
          </Link>
          <Link className={loc.pathname.startsWith("/community") ? "active" : ""} to="/community">
            Community
          </Link>
          {user.role === "admin" && (
            <Link className={loc.pathname.startsWith("/admin") ? "active" : ""} to="/admin">
              Admin
            </Link>
          )}
          <Link className={loc.pathname.startsWith("/scan") ? "active" : ""} to="/scan">
            Scan
          </Link>
        </nav>
      )}

      {user && (
        <div className="profile" ref={dropdownRef}>
          <button className="profile-btn" onClick={() => setOpen((v) => !v)}>
            <div className="avatar">{(user.name || "U")[0].toUpperCase()}</div>
            <span className="profile-name">{user.name}</span>
            <span className="chev">▾</span>
          </button>
          {open && (
            <div className="profile-menu">
              <div className="profile-info">
                <div className="avatar lg">{(user.name || "U")[0].toUpperCase()}</div>
                <div>
                  <div className="bold">{user.name}</div>
                  <div className="muted">{user.email}</div>
                  <div className="muted">Role: {user.role}</div>
                  {user.batchId && (
                    <div className="muted">Batch: {String(user.batchId).slice(0, 6)}</div>
                  )}
                </div>
              </div>
              <div className="menu-row">
                <button className="menu-btn" onClick={() => nav("/dashboard")}>
                  Dashboard
                </button>
              </div>
              {user.role === "admin" && (
                <div className="menu-row">
                  <button className="menu-btn" onClick={() => nav("/admin")}>
                    Admin
                  </button>
                </div>
              )}
              <div className="menu-row">
                <button className="menu-btn" onClick={() => nav("/scan")}>
                  Scan QR
                </button>
              </div>
              <div className="menu-row">
                <button className="menu-btn danger" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
