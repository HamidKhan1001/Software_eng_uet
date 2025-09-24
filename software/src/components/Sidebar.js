import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, onClose, user }) {
  const loc = useLocation();

  return (
    <>
      <nav className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <img
            src="/uet-logo.png"
            alt=""
            className="logo-img sm"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="logo-dot" />
          <div className="title">UET SE</div>
          <button className="icon-btn close" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>
        <ul className="side-list">
          <li className={loc.pathname.startsWith("/dashboard") ? "active" : ""}>
            <Link to="/dashboard" onClick={onClose}> Dashboard</Link>
          </li>
          <li className={loc.pathname.startsWith("/community") ? "active" : ""}>
            <Link to="/community" onClick={onClose}>Community</Link>
          </li>
          {user?.role === "admin" && (
            <li className={loc.pathname.startsWith("/admin") ? "active" : ""}>
              <Link to="/admin" onClick={onClose}>Admin</Link>
            </li>
          )}
          <li className={loc.pathname.startsWith("/scan") ? "active" : ""}>
            <Link to="/scan" onClick={onClose}>Scan</Link>
          </li>
        </ul>
        <div className="side-foot muted">© UET SE</div>
      </nav>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}
