import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { api } from './api';
import './styles.css';
import { Community } from './pages';

/* ---------------- helpers ---------------- */
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const t = localStorage.getItem('token');
      if (!t) { setLoading(false); return; }
      try { const r = await api.me(); setUser(r.user); } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);
  return { user, setUser, loading };
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const pwOk = (v) => String(v || '').length >= 8;

/* ---------------- layout ---------------- */
function Header({ user, onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // close dropdown on route change
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const logout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

  return (
    <header className="header">
      <button className="icon-btn burger" onClick={onToggleSidebar} aria-label="menu">☰</button>

      <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="brand brand-link">
        <img src="/uet-logo.png" alt="UET SE logo" className="logo-img"
             onError={(e) => { e.currentTarget.style.display='none'; }}/>
        <div className="logo-dot" />
        <div className="brand-text">
          <h1>UET Software Engineering</h1>
          <span className="badge">Software</span>
        </div>
      </Link>

      {/* desktop nav */}
      {user && (
        <nav className="topnav">
          <Link className={loc.pathname.startsWith('/dashboard') ? 'active' : ''} to="/dashboard">Dashboard</Link>
          <Link className={loc.pathname.startsWith('/community') ? 'active' : ''} to="/community">Community</Link>
          {user.role === 'admin' && (
            <Link className={loc.pathname.startsWith('/admin') ? 'active' : ''} to="/admin">Admin</Link>
          )}
          <Link className={loc.pathname.startsWith('/scan') ? 'active' : ''} to="/scan">Scan</Link>
        </nav>
      )}

      {/* profile */}
      {user ? (
        <div className="profile" ref={dropdownRef}>
          <button className="profile-btn" onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}>
            <div className="avatar">{(user.name || 'U')[0].toUpperCase()}</div>
            <span className="profile-name">{user.name}</span>
            <span className="chev">▾</span>
          </button>
          {open && (
            <div className="profile-menu" role="menu">
              <div className="profile-info">
                <div className="avatar lg">{(user.name || 'U')[0].toUpperCase()}</div>
                <div>
                  <div className="bold">{user.name}</div>
                  <div className="muted">{user.email}</div>
                  <div className="muted">Role: {user.role}</div>
                  {user.batchId ? <div className="muted">Batch: {String(user.batchId).slice(0, 6)}</div> : null}
                </div>
              </div>
              <div className="menu-row"><button className="menu-btn" onClick={() => nav('/dashboard')}>Dashboard</button></div>
              {user.role === 'admin' && <div className="menu-row"><button className="menu-btn" onClick={() => nav('/admin')}>Admin</button></div>}
              <div className="menu-row"><button className="menu-btn" onClick={() => nav('/scan')}>Scan QR</button></div>
              <div className="menu-row"><button className="menu-btn danger" onClick={logout}>Logout</button></div>
            </div>
          )}
        </div>
      ) : <div />}
    </header>
  );
}

function Sidebar({ open, onClose, user }) {
  const loc = useLocation();
  return (
    <>
      <nav className={`sidebar ${open ? 'open' : ''}`} aria-label="mobile">
        <div className="sidebar-header">
          <img src="/uet-logo.png" alt="" className="logo-img sm" onError={(e)=>{e.currentTarget.style.display='none';}}/>
          <div className="logo-dot" />
          <div className="title">UET SE</div>
          <button className="icon-btn close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <ul className="side-list">
          <li className={loc.pathname.startsWith('/dashboard') ? 'active' : ''}><Link to="/dashboard" onClick={onClose}>🏠 Dashboard</Link></li>
          <li className={loc.pathname.startsWith('/community') ? 'active' : ''}><Link to="/community" onClick={onClose}>💬 Community</Link></li>
          {user?.role === 'admin' && <li className={loc.pathname.startsWith('/admin') ? 'active' : ''}><Link to="/admin" onClick={onClose}>🛠️ Admin</Link></li>}
          <li className={loc.pathname.startsWith('/scan') ? 'active' : ''}><Link to="/scan" onClick={onClose}>📷 Scan</Link></li>
        </ul>
        <div className="side-foot muted">© UET SE</div>
      </nav>
      {open && <div className="backdrop" onClick={onClose} aria-hidden="true"/>}
    </>
  );
}

/* ---------------- pages ---------------- */
function Login({ setUser }) {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batchNumber, setBatchNumber] = useState("2024");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const r = await api.login(email, password);
        localStorage.setItem("token", r.token);
        setUser(r.user);
        nav(r.user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const r = await api.register({ name, email, password, regNo, batchNumber });
        localStorage.setItem("token", r.token);
        setUser(r.user);
        nav("/dashboard");
      }
    } catch (err) {
      setError(String(err.message || err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ===== Added: logo+title on login/register (kept everything else) ===== */}
        <div className="auth-brand" style={{textAlign:'center', marginBottom:10}}>
          <img
            src="/uet-logo.png"
            alt="UET SE"
            style={{width:64, height:64, objectFit:'contain', display:'block', margin:'0 auto 6px'}}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h2 style={{fontSize:18, margin:0}}>UET Software Engineering</h2>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <input type="text" placeholder="Reg No" value={regNo} onChange={e => setRegNo(e.target.value)} />
              <select value={batchNumber} onChange={e => setBatchNumber(e.target.value)}>
                {Array.from({ length: 8 }, (_, i) => 2024 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="btn-primary">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}


function Admin({ user }) {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState('');
  const [dateYMD, setDateYMD] = useState(new Date().toISOString().slice(0, 10));
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [schedule, setSchedule] = useState({ mon: [], tue: [], wed: [], thu: [], fri: [] });
  const [users, setUsers] = useState([]);
  const [userEdits, setUserEdits] = useState({});
  const getEdit = (u) => userEdits[u.id] ?? { nm: u.name || '', reg: u.reg_no || '', bt: u.batch_id || '' };

  useEffect(() => {
    api.batches().then(r => {
      setBatches(r.batches);
      if (r.batches[0]) setSelected(r.batches[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        const r = await api.getSchedule(selected);
        setSchedule(r.schedule || { mon: [], tue: [], wed: [], thu: [], fri: [] });
      } catch { /* ignore */ }
    })();
  }, [selected]);

  useEffect(() => {
    if (!selected || !dateYMD) { setSlotsForDate([]); return; }
    api.slotsOnDate(selected, dateYMD).then(r => setSlotsForDate(r.classes || []));
    setSlotId('');
  }, [selected, dateYMD]);

  useEffect(() => { if (user?.role === 'admin') api.listUsers().then(r => setUsers(r.users)); }, [user]);

  const addClass = (day) =>
    setSchedule(s => ({ ...s, [day]: [...(s[day] || []), { id: crypto.randomUUID?.() || String(Math.random()), subject: '', start: '09:00', end: '10:00', location: 'Room A' }] }));

  const onChange = (day, i, key, val) =>
    setSchedule(s => { const t = [...(s[day] || [])]; t[i] = { ...(t[i] || {}), [key]: val }; return { ...s, [day]: t }; });

  const saveSchedule = async () => {
    if (!selected) { alert('Pick a batch first'); return; }
    await api.setSchedule(selected, schedule);
    alert('Schedule saved');
  };

  const quickFillUET2024 = () => {
    setSchedule({
      mon: [
        { id: 'm1', subject: 'OS (Lab)',  start: '08:30', end: '10:30', location: 'Lab 2' },
        { id: 'm2', subject: 'ISE (Lab)', start: '10:30', end: '12:00', location: 'Lab 2' },
        { id: 'm3', subject: 'CVT (CR1)', start: '12:00', end: '13:00', location: 'CR 1' },
        { id: 'm4', subject: 'CVT Continue', start: '13:30', end: '15:00', location: 'CR 1' },
      ],
      tue: [
        { id: 't1', subject: 'DSA (Lab)', start: '08:30', end: '10:30', location: 'Lab 2' },
        { id: 't2', subject: 'ISE (Lab)', start: '10:30', end: '12:00', location: 'Lab 2' },
        { id: 't3', subject: 'OS-L (Lab)', start: '12:00', end: '13:30', location: 'Lab 2' },
        { id: 't4', subject: 'OS-L Continue', start: '13:30', end: '15:00', location: 'Lab 2' },
      ],
      wed: [
        { id: 'w1', subject: 'DSA (Lab)', start: '08:30', end: '10:30', location: 'Lab 2' },
        { id: 'w2', subject: 'OS (Lab)',  start: '10:30', end: '12:00', location: 'Lab 2' },
        { id: 'w3', subject: 'PS (CR1)',  start: '12:00', end: '13:30', location: 'CR 1' },
        { id: 'w4', subject: 'PS Continue', start: '13:30', end: '15:00', location: 'CR 1' },
      ],
      thu: [
        { id: 'h1', subject: 'Quranic Translation', start: '08:00', end: '11:00', location: 'Block A' },
        { id: 'h2', subject: 'DSA-L (Lab)',        start: '12:00', end: '13:30', location: 'Lab 2' },
        { id: 'h3', subject: 'DSA-L Continue',     start: '13:30', end: '15:00', location: 'Lab 2' },
      ],
      fri: []
    });
  };

  const [drag, setDrag] = useState(null);
  const onDragStart = (day, idx) => setDrag({ day, idx });
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (day, idx) => {
    if (!drag || drag.day !== day) return;
    setSchedule(s => {
      const list = [...(s[day] || [])];
      const [moved] = list.splice(drag.idx, 1);
      list.splice(idx, 0, moved);
      return { ...s, [day]: list };
    });
    setDrag(null);
  };

  const assign = async (id, regNo, batchId, nm) => {
    const r = await api.updateUser(id, { regNo, batchId, name: nm });
    setUsers(u => u.map(x => x.id === id ? r.user : x));
  };

  const generateQR = async () => {
    if (!selected || !slotId || !dateYMD) return alert('Pick batch, date & slot');
    const r = await api.generateQR(selected, dateYMD, slotId);
    setQrDataUrl(r.qrDataUrl);
  };

  return (
    <div className="container">
      {/* kept original brand but hidden to avoid second header */}
      <div className="brand" style={{display:'none'}}>
        <img src="/uet-logo.png" alt="" className="logo-img" onError={(e)=>{e.currentTarget.style.display='none';}}/>
        <div className="logo-dot" /><h1>UET Software Engineering</h1><span className="badge">Admin</span>
      </div>

      <div className="card row">
        <div className="col">
          <h3>Pick Batch</h3>
          <select className="select" value={selected} onChange={e => setSelected(e.target.value)}>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.number})</option>)}
          </select>
          <div className="muted">Sat/Sun day off</div>
        </div>

        <div className="col">
          <h3>Generate QR</h3>
          <div>Date</div>
          <input className="input" type="date" value={dateYMD} onChange={e => setDateYMD(e.target.value)} />
          <div style={{marginTop:6}}>Pick slot for that date</div>
          <select className="select" value={slotId} onChange={e => setSlotId(e.target.value)}>
            <option value="">— choose —</option>
            {slotsForDate.map(c => (
              <option key={c.id} value={c.id}>{c.subject} {c.start_t}-{c.end_t} @ {c.location}</option>
            ))}
          </select>
          <button className="btn primary" onClick={generateQR} disabled={!slotId}>Generate</button>
          <div className="qr" style={{marginTop:10}}>
            {qrDataUrl ? <img alt="qr" src={qrDataUrl} /> : <span className="muted">No QR yet</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="nav" style={{justifyContent:'space-between', alignItems:'center'}}>
          <h3>Schedule Editor (Mon–Fri)</h3>
          <div className="row" style={{gap:8}}>
            <button className="btn" onClick={quickFillUET2024}>Quick-fill UET 2024</button>
            <button className="btn primary" onClick={saveSchedule} disabled={!selected}>Save schedule</button>
          </div>
        </div>

        {['mon','tue','wed','thu','fri'].map(d => (
          <div className="card" key={d}>
            <div className="nav">
              <b style={{ textTransform:'uppercase' }}>{d}</b>
              <button className="btn" onClick={() => addClass(d)} style={{ marginLeft: 8 }}>+ add</button>
            </div>
            {(schedule[d] || []).map((c, i) => (
              <div
                className="row slot-row"
                key={c.id || i}
                draggable
                onDragStart={() => onDragStart(d, i)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(d, i)}
                title="Drag to reorder"
              >
                <input className="col input" placeholder="Subject" value={c.subject} onChange={e => onChange(d, i, 'subject', e.target.value)} />
                <input className="col input" placeholder="Start (HH:MM)" value={c.start || c.start_t || ''} onChange={e => onChange(d, i, 'start', e.target.value)} />
                <input className="col input" placeholder="End (HH:MM)" value={c.end || c.end_t || ''} onChange={e => onChange(d, i, 'end', e.target.value)} />
                <input className="col input" placeholder="Location" value={c.location || ''} onChange={e => onChange(d, i, 'location', e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Users</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Reg No</th><th>Batch</th><th>Save</th></tr></thead>
            <tbody>
              {users.map(u => {
                const e = getEdit(u);
                return (
                  <tr key={u.id}>
                    <td><input className="input" value={e.nm} onChange={ev => setUserEdits(prev => ({ ...prev, [u.id]: { ...getEdit(u), nm: ev.target.value } }))} /></td>
                    <td className="muted">{u.email}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td><input className="input" value={e.reg} onChange={ev => setUserEdits(prev => ({ ...prev, [u.id]: { ...getEdit(u), reg: ev.target.value } }))} /></td>
                    <td>
                      <select className="select" value={e.bt} onChange={ev => setUserEdits(prev => ({ ...prev, [u.id]: { ...getEdit(u), bt: ev.target.value } }))}>
                        <option value="">—</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.number})</option>)}
                      </select>
                    </td>
                    <td><button className="btn primary" onClick={() => assign(u.id, e.reg, e.bt, e.nm)}>Save</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [classes, setClasses] = useState([]);
  useEffect(() => { if (user?.batchId) api.todaySchedule(user.batchId).then(r => setClasses(r.classes)); }, [user]);
  return (
    <div className="container">
      {/* kept original brand but hidden to avoid second header */}
      <div className="brand" style={{display:'none'}}><img src="/uet-logo.png" alt="" className="logo-img" onError={(e)=>{e.currentTarget.style.display='none';}}/><div className="logo-dot" /><h1>UET Software Engineering</h1><span className="badge">Student</span></div>
      <div className="card">
        <h3>Today’s Classes</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Subject</th><th>Time</th><th>Location</th></tr></thead>
            <tbody>
              {classes.length === 0
                ? <tr><td colSpan="3" className="muted">No classes today (Sat/Sun off)</td></tr>
                : classes.map(c => <tr key={c.id}><td>{c.subject}</td><td>{c.start_t}–{c.end_t}</td><td>{c.location}</td></tr>)
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Scan() {
  const [params] = useSearchParams();
  const preToken = params.get('token') || '';
  const [token, setToken] = useState(preToken);
  const [msg, setMsg] = useState('');
  const [scanning, setScanning] = useState(false);

  // Added for native BarcodeDetector fallback
  const videoRef = useRef(null);
  const stopStreamRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (stopStreamRef.current) {
        try { stopStreamRef.current(); } catch {}
      }
    };
  }, []);

  const markToken = async (text) => {
    let t = text;
    try { const url = new URL(text); t = url.searchParams.get('token') || text; } catch {}
    setToken(t);
    await api.mark(t);
    setMsg('Marked present ✓');
  };

  const startWithHtml5Qrcode = async () => {
    const Html5Qrcode = window.Html5Qrcode;
    if (!Html5Qrcode) return false;
    const elId = 'reader';
    let div = document.getElementById(elId);
    if (!div) { div = document.createElement('div'); div.id = elId; document.querySelector('.card')?.appendChild(div); }
    const qr = new Html5Qrcode(elId);
    setScanning(true);
    try {
      await qr.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, async (text) => {
        try {
          await markToken(text);
        } catch (e) { setMsg('Error: ' + e.message); }
        await qr.stop(); setScanning(false);
      });
      return true;
    } catch (e) { setMsg('Camera error: ' + e.message); setScanning(false); return false; }
  };

  const startWithBarcodeDetector = async () => {
    if (!('BarcodeDetector' in window)) return false;

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(
      window.location.origin
    );
    if (!isLocalhost && !window.isSecureContext) {
      setMsg("Camera needs HTTPS (or run on localhost).");
      return true; // handled
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return true; }
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      stopStreamRef.current = () => stream.getTracks().forEach(t => t.stop());

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      let live = true;

      const tick = async () => {
        if (!live) return;
        try {
          const codes = await detector.detect(video);
          if (codes && codes[0]?.rawValue) {
            live = false;
            stopStreamRef.current?.();
            setScanning(false);
            await markToken(codes[0].rawValue);
            return;
          }
        } catch {}
        requestAnimationFrame(tick);
      };
      tick();
      return true;
    } catch (e) {
      setMsg('Camera error: ' + (e?.message || e));
      setScanning(false);
      return true;
    }
  };

  const startScan = async () => {
    setMsg('');
    // Try html5-qrcode first
    if (await startWithHtml5Qrcode()) return;
    // Then native BarcodeDetector
    if (await startWithBarcodeDetector()) return;
    // Otherwise notify
    setMsg('Camera library not available. Use the token field below.');
  };

  const submit = async () => {
    try { await markToken(token); }
    catch (e) { setMsg('Error: ' + e.message); }
  };

  return (
    <div className="container">
      {/* kept original brand but hidden to avoid second header */}
      <div className="brand" style={{display:'none'}}><img src="/uet-logo.png" alt="" className="logo-img" onError={(e)=>{e.currentTarget.style.display='none';}}/><div className="logo-dot" /><h1>UET Software Engineering</h1><span className="badge">Scan</span></div>
      <div className="card">
        <div className="row">
          <div className="col"><button className="btn primary" disabled={scanning} onClick={startScan}>Open Camera</button></div>
          <div className="col">
            <input className="input" placeholder="Paste token (fallback)" value={token} onChange={e => setToken(e.target.value)} />
            <button className="btn" onClick={submit}>Mark Present</button>
          </div>
        </div>
        {msg && <div className="card">{msg}</div>}
        <div id="reader" style={{ width: '100%', marginTop: 12 }} />
        {/* video for BarcodeDetector fallback */}
        <video ref={videoRef} playsInline muted style={{ width:'100%', marginTop:12, display: scanning ? 'block' : 'none' }} />
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */
function Shell() {
  const { user, setUser, loading } = useAuth();
  const [sideOpen, setSideOpen] = useState(false);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;

  // If no user, only show auth routes (no header/sidebar)
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Logged-in: show full app shell
  return (
    <>
      <Header user={user} onToggleSidebar={() => setSideOpen(true)} />
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} user={user} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route path="/admin" element={user.role === 'admin' ? <Admin user={user} /> : <Navigate to="/" />} />
          <Route path="/community" element={<Community user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </main>
    </>
  );
}


export default function App() {
  return <BrowserRouter><Shell /></BrowserRouter>;
}
