import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from './api';
import './styles.css';
import { Community } from './pages'; 


/* -------------- helpers -------------- */
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

/* -------------- layout -------------- */
function Header({ user, onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

  return (
    <header className="header">
      <button className="icon-btn burger" onClick={onToggleSidebar} aria-label="menu">☰</button>
      <div className="brand">
        <div className="logo-dot" />
        <h1>UET Software Engineering</h1>
        <span className="badge">Software</span>
      </div>
      {user ? (
        <div className="profile">
          <button className="profile-btn" onClick={() => setOpen(v => !v)}>
            <div className="avatar">{(user.name || 'U')[0].toUpperCase()}</div>
            <span className="profile-name">{user.name}</span>
            <span className="chev">▾</span>
          </button>
          {open && (
            <div className="profile-menu" onMouseLeave={() => setOpen(false)}>
              <div className="profile-info">
                <div className="avatar lg">{(user.name || 'U')[0].toUpperCase()}</div>
                <div>
                  <div className="bold">{user.name}</div>
                  <div className="muted">{user.email}</div>
                  <div className="muted">Role: {user.role}</div>
                  {user.batchId ? <div className="muted">Batch: {user.batchId.slice(0,6)}</div> : null}
                </div>
              </div>
              <div className="menu-row">
                <button className="menu-btn" onClick={() => { setOpen(false); nav('/dashboard'); }}>Dashboard</button>
              </div>
              {user.role === 'admin' && (
                <div className="menu-row">
                  <button className="menu-btn" onClick={() => { setOpen(false); nav('/admin'); }}>Admin</button>
                </div>
              )}
              <div className="menu-row">
                <button className="menu-btn" onClick={() => { setOpen(false); nav('/scan'); }}>Scan QR</button>
              </div>
              <div className="menu-row">
                <button className="menu-btn danger" onClick={logout}>Logout</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div />
      )}
    </header>
  );
}

function Sidebar({ open, onClose, user }) {
  return (
    <>
      <nav className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-dot" />
          <div className="title">UET SE</div>
          <button className="icon-btn close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <ul className="side-list">
          <li><Link to="/dashboard" onClick={onClose}>🏠 Dashboard</Link></li>
          <li><Link to="/community" onClick={onClose}>💬 Community</Link></li>

          {user?.role === 'admin' && <li><Link to="/admin" onClick={onClose}>🛠️ Admin</Link></li>}
          <li><Link to="/scan" onClick={onClose}>📷 Scan</Link></li>
        </ul>
        <div className="side-foot muted">© UET SE</div>
      </nav>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}

/* -------------- pages -------------- */
function Login({ setUser }) {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const years = Array.from({ length: 8 }, (_, i) => String(2024 + i));
  const [batchNumber, setBatchNumber] = useState('2024');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        const r = await api.login(email, password);
        localStorage.setItem('token', r.token);
        setUser(r.user);
        if (r.user.role === 'admin') nav('/admin'); else nav('/dashboard');
      } else {
        const r = await api.register({ name, email, password, regNo, batchNumber });
        localStorage.setItem('token', r.token);
        setUser(r.user);
        nav('/dashboard');
      }
    } catch (err) {
      setError(String(err.message || err));
      alert(String(err.message || err));
    }
  };

  return (
    <div className="container narrow">
      <div className="brand mt">
        <div className="logo-dot" />
        <h1>UET Software Engineering</h1>
        <span className="badge">Software</span>
      </div>
      <div className="card">
        <div className="nav">
          <button className={`btn ${mode==='login'?'primary':''}`} onClick={() => setMode('login')}>Login</button>
          <button className={`btn ${mode==='register'?'primary':''}`} onClick={() => setMode('register')}>Register</button>
          <span className="muted">First account auto-Admin</span>
        </div>
        <form onSubmit={submit} className="row">
          {mode === 'register' && (
            <>
              <div className="col">
                <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="col">
                <input className="input" placeholder="Reg No" value={regNo} onChange={e => setRegNo(e.target.value)} />
              </div>
              <div className="col">
                <label className="muted">Batch (year)</label>
                <select className="select" value={batchNumber} onChange={e => setBatchNumber(e.target.value)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="col">
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="col">
            <input className="input" type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="col">
            <button className="btn primary" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          </div>
        </form>
        {error && <div className="muted" style={{marginTop:8}}>{error}</div>}
      </div>
    </div>
  );
}

function Admin({ user }) {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState('');
  const [dateYMD, setDateYMD] = useState(new Date().toISOString().slice(0, 10));
  const [slotsForDate, setSlotsForDate] = useState([]);   // classes shown in QR dropdown
  const [slotId, setSlotId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // weekly editor state
  const [schedule, setSchedule] = useState({ mon: [], tue: [], wed: [], thu: [], fri: [] });

  // users tab
  const [users, setUsers] = useState([]);
  const [userEdits, setUserEdits] = useState({});
  const getEdit = (u) => userEdits[u.id] ?? { nm: u.name || '', reg: u.reg_no || '', bt: u.batch_id || '' };

  useEffect(() => {
    api.batches().then(r => {
      setBatches(r.batches);
      if (r.batches[0]) setSelected(r.batches[0].id);
    });
  }, []);

  // load weekly schedule from DB when batch changes
  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        const r = await api.getSchedule(selected);
        setSchedule(r.schedule || { mon: [], tue: [], wed: [], thu: [], fri: [] });
      } catch { /* ignore */ }
    })();
  }, [selected]);

  // load slots for the picked date (weekday) whenever batch or date changes
  useEffect(() => {
    if (!selected || !dateYMD) { setSlotsForDate([]); return; }
    api.slotsOnDate(selected, dateYMD).then(r => setSlotsForDate(r.classes || []));
    setSlotId('');
  }, [selected, dateYMD]);

  // users
  useEffect(() => { if (user?.role === 'admin') api.listUsers().then(r => setUsers(r.users)); }, [user]);

  // editor helpers
  const addClass = (day) =>
    setSchedule(s => ({ ...s, [day]: [...(s[day] || []), { id: crypto.randomUUID?.() || String(Math.random()), subject: '', start: '09:00', end: '10:00', location: 'Room A' }] }));

  const onChange = (day, i, key, val) =>
    setSchedule(s => { const t = [...(s[day] || [])]; t[i] = { ...(t[i] || {}), [key]: val }; return { ...s, [day]: t }; });

  const saveSchedule = async () => {
    if (!selected) { alert('Pick a batch first'); return; }
    await api.setSchedule(selected, schedule);
    alert('Schedule saved');
  };

  // quick-fill from your UET image (Mon–Thu; Fri off)
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

  // drag-drop (same-day reorder)
  const [drag, setDrag] = useState(null); // { day, idx }
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
      <div className="brand">
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
                className="row"
                key={c.id || i}
                draggable
                onDragStart={() => onDragStart(d, i)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(d, i)}
                style={{ border:'1px dashed var(--border)', padding:'8px', borderRadius:8 }}
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
      <div className="brand"><div className="logo-dot" /><h1>UET Software Engineering</h1><span className="badge">Student</span></div>
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

  const startScan = async () => {
    setMsg('');
    const elId = 'reader';
    const Html5Qrcode = window.Html5Qrcode; // provided by CDN
    if (!Html5Qrcode) { setMsg('Camera lib not loaded'); return; }
    const div = document.getElementById(elId) || document.createElement('div');
    div.id = elId; document.getElementById('reader') || document.body.appendChild(div);
    const qr = new Html5Qrcode(elId);
    setScanning(true);
    try {
      await qr.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, async (text) => {
        try {
          const url = new URL(text);
          const t = url.searchParams.get('token') || text;
          setToken(t);
          await api.mark(t);
          setMsg('Marked present ✓');
        } catch (e) { setMsg('Error: ' + e.message); }
        await qr.stop(); setScanning(false);
      });
    } catch (e) { setMsg('Camera error: ' + e.message); setScanning(false); }
  };

  const submit = async () => {
    try { await api.mark(token); setMsg('Marked present ✓'); }
    catch (e) { setMsg('Error: ' + e.message); }
  };

  return (
    <div className="container">
      <div className="brand"><div className="logo-dot" /><h1>UET Software Engineering</h1><span className="badge">Scan</span></div>
      <div className="card">
        <div className="row">
          <div className="col"><button className="btn primary" disabled={scanning} onClick={startScan}>Open Camera</button></div>
          <div className="col">
            <input className="input" placeholder="Paste token (fallback)" value={token} onChange={e => setToken(e.target.value)} />
            <button className="btn" onClick={submit}>Mark Present</button>
          </div>
        </div>
        {msg && <div className="card">{msg}</div>}
      </div>
    </div>
  );
}

/* -------------- Shell -------------- */
function Shell() {
  const { user, setUser, loading } = useAuth();
  const [sideOpen, setSideOpen] = useState(false);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;

  return (
    <>
      <Header user={user} onToggleSidebar={() => setSideOpen(true)} />
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} user={user} />
      <main className="main">
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login setUser={setUser} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin user={user} /> : <Navigate to="/" />} />
          <Route path="/community" element={user ? <Community user={user} /> : <Navigate to="/" />} />

          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <BrowserRouter><Shell /></BrowserRouter>;
}
