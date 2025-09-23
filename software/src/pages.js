// src/pages.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "./api";

dayjs.extend(relativeTime);

/* ============= Login ============= */
export function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.login(email, password);
      localStorage.setItem("token", r.token);
      setUser(r.user);
      navigate(r.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </div>
  );
}

/* ============= Community ============= */
function PostItem({ p, isAdmin, onDelete }) {
  const when = dayjs(p.createdAt).fromNow();
  const exp =
    p.type === "anon" && p.expiresAt
      ? ` · disappears ${dayjs(p.expiresAt).fromNow()}`
      : "";
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <b>
            {p.type === "announcement" ? "📌 Announcement" : "Anonymous"}
          </b>
          <span className="muted">
            {" "}
            · {when}
            {exp}
          </span>
          {isAdmin && p.author?.name && (
            <span className="badge" style={{ marginLeft: 6 }}>
              {p.author.name}
            </span>
          )}
        </div>
        {isAdmin && (
          <button className="btn danger" onClick={() => onDelete(p.id)}>
            Delete
          </button>
        )}
      </div>
      <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{p.body}</div>
    </div>
  );
}

export function Community({ user }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [asAnnouncement, setAsAnnouncement] = useState(false);
  const isAdmin = user?.role === "admin";

  const load = async () => {
    const r = await api.communityList();
    setPosts(r.posts || []);
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    const type = isAdmin && asAnnouncement ? "announcement" : "anon";
    const r = await api.communityCreate({ body, type });
    setText("");
    setAsAnnouncement(false);
    setPosts((prev) => [r.post, ...prev]);
  };

  const remove = async (id) => {
    await api.communityDelete(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="container">
      <div className="brand">
        <div className="logo-dot" />
        <h1>UET Software Engineering</h1>
        <span className="badge">Community</span>
      </div>

      <div className="card">
        <h3>
          {isAdmin ? "Share (announcement or anonymous)" : "Post anonymously"}
        </h3>
        <textarea
          className="input"
          rows={4}
          placeholder="Share your thoughts…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="row" style={{ alignItems: "center" }}>
          {isAdmin && (
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={asAnnouncement}
                onChange={(e) => setAsAnnouncement(e.target.checked)}
              />
              Make this an announcement (won’t expire)
            </label>
          )}
          <button
            className="btn primary"
            onClick={submit}
            style={{ marginLeft: "auto" }}
          >
            Post
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        {posts.length === 0 ? (
          <div className="card muted">No posts yet.</div>
        ) : (
          posts.map((p) => (
            <PostItem key={p.id} p={p} isAdmin={isAdmin} onDelete={remove} />
          ))
        )}
      </div>
    </div>
  );
}

/* ============= Dashboard (student) ============= */
export function Dashboard({ user }) {
  const [classes, setClasses] = useState([]);
  useEffect(() => {
    if (user?.batchId)
      api.todaySchedule(user.batchId).then((r) => setClasses(r.classes));
  }, [user]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome {user.name}</p>
      <h3>Today’s Classes</h3>
      <ul>
        {classes.map((c) => (
          <li key={c.id}>
            {c.subject} {c.start_t}–{c.end_t} @ {c.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============= Admin ============= */
export function Admin() {
  const [batches, setBatches] = useState([]);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");

  const [dateYMD, setDateYMD] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [slotId, setSlotId] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    api.batches().then((r) => {
      setBatches(r.batches);
      if (r.batches[0]) setSelectedBatch(r.batches[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch && dateYMD) {
      api.slotsOnDate(selectedBatch, dateYMD).then((r) => setSlots(r.classes));
    }
  }, [selectedBatch, dateYMD]);

  const addBatch = async () => {
    const r = await api.createBatch(number, name);
    setBatches([...batches, r.batch]);
  };

  const generateQR = async () => {
    if (!selectedBatch || !dateYMD || !slotId) {
      alert("Pick batch, date and slot first");
      return;
    }
    const r = await api.generateQR(selectedBatch, dateYMD, slotId);
    setQrUrl(r.qrDataUrl);
  };

  return (
    <div>
      <h2>Admin</h2>

      <h3>Batches</h3>
      <select
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
      >
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.number})
          </option>
        ))}
      </select>

      <h3>Create Batch</h3>
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Year e.g. 2024"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Batch name"
      />
      <button onClick={addBatch}>Add</button>

      <h3>Generate QR</h3>
      <input
        type="date"
        value={dateYMD}
        onChange={(e) => setDateYMD(e.target.value)}
      />
      <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
        <option value="">-- pick slot --</option>
        {slots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.subject} {s.start_t}-{s.end_t}
          </option>
        ))}
      </select>
      <button onClick={generateQR}>Generate</button>
      {qrUrl && <img src={qrUrl} alt="QR" />}
    </div>
  );
}

/* ============= Scan ============= */
export function Scan() {
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [scanner, setScanner] = useState(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanner && scanner.clear) {
        try {
          scanner.clear();
        } catch {}
      }
    };
  }, [scanner]);

  const startCamera = async () => {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(
      window.location.origin
    );
    if (!isLocalhost && !window.isSecureContext) {
      setStatus("Camera needs HTTPS (or run on localhost).");
      return;
    }

    try {
      if (window.Html5QrcodeScanner) {
        // scanner widget with UI
        const s = new window.Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
        s.render(
          async (decodedText) => {
            try {
              await api.mark(decodedText);
              setStatus("✅ Marked present!");
              if (s.clear) s.clear();
            } catch (e) {
              setStatus("❌ " + (e?.message || "Failed to mark"));
            }
          },
          () => {}
        );
        setScanner(s);
      } else if (window.Html5Qrcode) {
        // low-level scanner
        const s = new window.Html5Qrcode("reader");
        await s.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            try {
              await api.mark(decodedText);
              setStatus("✅ Marked present!");
              await s.stop();
            } catch (e) {
              setStatus("❌ " + (e?.message || "Failed to mark"));
            }
          }
        );
        setScanner(s);
      } else {
        setStatus(
          "Camera lib not found. Make sure html5-qrcode script is loaded."
        );
      }
    } catch (e) {
      setStatus("Could not start camera: " + (e?.message || e));
    }
  };

  const submitFallback = async () => {
    try {
      await api.mark(token.trim());
      setStatus("✅ Marked present (manual token)!");
    } catch (e) {
      setStatus("❌ " + (e?.message || "Failed to mark"));
    }
  };

  return (
    <div className="container">
      <div className="brand">
        <div className="logo-dot" />
        <h1>UET Software Engineering</h1>
        <span className="badge">Scan</span>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <button className="btn primary" onClick={startCamera}>
            Open Camera
          </button>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Paste token (fallback)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="btn" onClick={submitFallback}>
            Mark Present
          </button>
        </div>

        <div id="reader" style={{ width: "100%", marginTop: 12 }} />
        <div className="muted" style={{ marginTop: 8 }}>
          {status || " "}
        </div>
      </div>
    </div>
  );
}
