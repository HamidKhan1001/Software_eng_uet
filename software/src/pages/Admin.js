import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin({ user }) {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState("");
  const [dateYMD, setDateYMD] = useState(new Date().toISOString().slice(0, 10));
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [schedule, setSchedule] = useState({ mon: [], tue: [], wed: [], thu: [], fri: [] });
  const [users, setUsers] = useState([]);
  const [userEdits, setUserEdits] = useState({});
  const [drag, setDrag] = useState(null);

  // NEW: attendance state
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const getEdit = (u) =>
    userEdits[u.id] ?? { nm: u.name || "", reg: u.reg_no || "", bt: u.batch_id || "" };

  /* ---------------- Loaders ---------------- */
  useEffect(() => {
    api.batches().then((r) => {
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
      } catch {}
    })();
  }, [selected]);

  useEffect(() => {
    if (!selected || !dateYMD) {
      setSlotsForDate([]);
      return;
    }
    api.slotsOnDate(selected, dateYMD).then((r) => setSlotsForDate(r.classes || []));
    setSlotId("");
  }, [selected, dateYMD]);

  useEffect(() => {
    if (user?.role === "admin") api.listUsers().then((r) => setUsers(r.users));
  }, [user]);

  /* ---------------- Schedule Editor ---------------- */
  const addClass = (day) =>
    setSchedule((s) => ({
      ...s,
      [day]: [
        ...(s[day] || []),
        {
          id: crypto.randomUUID?.() || String(Math.random()),
          subject: "",
          start: "09:00",
          end: "10:00",
          location: "Room A",
        },
      ],
    }));

  const onChange = (day, i, key, val) =>
    setSchedule((s) => {
      const t = [...(s[day] || [])];
      t[i] = { ...(t[i] || {}), [key]: val };
      return { ...s, [day]: t };
    });

  const saveSchedule = async () => {
    if (!selected) {
      alert("Pick a batch first");
      return;
    }
    await api.setSchedule(selected, schedule);
    alert("Schedule saved");
  };

  const quickFillUET2024 = () => {
    setSchedule({
      mon: [
        { id: "m1", subject: "OS (Lab)", start: "08:30", end: "10:30", location: "Lab 2" },
        { id: "m2", subject: "ISE (Lab)", start: "10:30", end: "12:00", location: "Lab 2" },
        { id: "m3", subject: "CVT (CR1)", start: "12:00", end: "13:00", location: "CR 1" },
        { id: "m4", subject: "CVT Continue", start: "13:30", end: "15:00", location: "CR 1" },
      ],
      tue: [
        { id: "t1", subject: "DSA (Lab)", start: "08:30", end: "10:30", location: "Lab 2" },
        { id: "t2", subject: "ISE (Lab)", start: "10:30", end: "12:00", location: "Lab 2" },
        { id: "t3", subject: "OS-L (Lab)", start: "12:00", end: "13:30", location: "Lab 2" },
        { id: "t4", subject: "OS-L Continue", start: "13:30", end: "15:00", location: "Lab 2" },
      ],
      wed: [
        { id: "w1", subject: "DSA (Lab)", start: "08:30", end: "10:30", location: "Lab 2" },
        { id: "w2", subject: "OS (Lab)", start: "10:30", end: "12:00", location: "Lab 2" },
        { id: "w3", subject: "PS (CR1)", start: "12:00", end: "13:30", location: "CR 1" },
        { id: "w4", subject: "PS Continue", start: "13:30", end: "15:00", location: "CR 1" },
      ],
      thu: [
        { id: "h1", subject: "Quranic Translation", start: "08:00", end: "11:00", location: "Block A" },
        { id: "h2", subject: "DSA-L (Lab)", start: "12:00", end: "13:30", location: "Lab 2" },
        { id: "h3", subject: "DSA-L Continue", start: "13:30", end: "15:00", location: "Lab 2" },
      ],
      fri: [],
    });
  };

  /* ---------------- Drag & Drop ---------------- */
  const onDragStart = (day, idx) => setDrag({ day, idx });
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (day, idx) => {
    if (!drag || drag.day !== day) return;
    setSchedule((s) => {
      const list = [...(s[day] || [])];
      const [moved] = list.splice(drag.idx, 1);
      list.splice(idx, 0, moved);
      return { ...s, [day]: list };
    });
    setDrag(null);
  };

  /* ---------------- Users ---------------- */
  const assign = async (id, regNo, batchId, nm) => {
    const r = await api.updateUser(id, { regNo, batchId, name: nm });
    setUsers((u) => u.map((x) => (x.id === id ? r.user : x)));
  };

  /* ---------------- QR Generator ---------------- */
  const generateQR = async () => {
    if (!selected || !slotId || !dateYMD) return alert("Pick batch, date & slot");
    const r = await api.generateQR(selected, dateYMD, slotId);
    setQrDataUrl(r.qrDataUrl);
  };

  /* ---------------- Attendance Loader ---------------- */
  const loadAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const r = await api.allAttendance();
      setAttendance(r.records || []);
    } catch (err) {
      alert("Failed to load attendance: " + err.message);
    }
    setLoadingAttendance(false);
  };

  const grouped = attendance.reduce((acc, rec) => {
    acc[rec.date_ymd] = acc[rec.date_ymd] || [];
    acc[rec.date_ymd].push(rec);
    return acc;
  }, {});

  /* ---------------- Render ---------------- */
  return (
    <div className="container">
      {/* === YOUR FULL EXISTING UI === */}

      <div className="card row">
        <div className="col">
          <h3>Pick Batch</h3>
          <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.number})
              </option>
            ))}
          </select>
          <div className="muted">Sat/Sun day off</div>
        </div>

        <div className="col">
          <h3>Generate QR</h3>
          <div>Date</div>
          <input
            className="input"
            type="date"
            value={dateYMD}
            onChange={(e) => setDateYMD(e.target.value)}
          />
          <div style={{ marginTop: 6 }}>Pick slot for that date</div>
          <select className="select" value={slotId} onChange={(e) => setSlotId(e.target.value)}>
            <option value="">— choose —</option>
            {slotsForDate.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} {c.start_t}-{c.end_t} @ {c.location}
              </option>
            ))}
          </select>
          <button className="btn primary" onClick={generateQR} disabled={!slotId}>
            Generate
          </button>
          <div className="qr" style={{ marginTop: 10 }}>
            {qrDataUrl ? <img alt="qr" src={qrDataUrl} /> : <span className="muted">No QR yet</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="nav" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h3>Schedule Editor (Mon–Fri)</h3>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={quickFillUET2024}>
              Quick-fill UET 2024
            </button>
            <button className="btn primary" onClick={saveSchedule} disabled={!selected}>
              Save schedule
            </button>
          </div>
        </div>

        {["mon", "tue", "wed", "thu", "fri"].map((d) => (
          <div className="card" key={d}>
            <div className="nav">
              <b style={{ textTransform: "uppercase" }}>{d}</b>
              <button className="btn" onClick={() => addClass(d)} style={{ marginLeft: 8 }}>
                + add
              </button>
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
                <input
                  className="col input"
                  placeholder="Subject"
                  value={c.subject}
                  onChange={(e) => onChange(d, i, "subject", e.target.value)}
                />
                <input
                  className="col input"
                  placeholder="Start (HH:MM)"
                  value={c.start || c.start_t || ""}
                  onChange={(e) => onChange(d, i, "start", e.target.value)}
                />
                <input
                  className="col input"
                  placeholder="End (HH:MM)"
                  value={c.end || c.end_t || ""}
                  onChange={(e) => onChange(d, i, "end", e.target.value)}
                />
                <input
                  className="col input"
                  placeholder="Location"
                  value={c.location || ""}
                  onChange={(e) => onChange(d, i, "location", e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Users</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Reg No</th>
                <th>Batch</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const e = getEdit(u);
                return (
                  <tr key={u.id}>
                    <td>
                      <input
                        className="input"
                        value={e.nm}
                        onChange={(ev) =>
                          setUserEdits((prev) => ({
                            ...prev,
                            [u.id]: { ...getEdit(u), nm: ev.target.value },
                          }))
                        }
                      />
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <span className="badge">{u.role}</span>
                    </td>
                    <td>
                      <input
                        className="input"
                        value={e.reg}
                        onChange={(ev) =>
                          setUserEdits((prev) => ({
                            ...prev,
                            [u.id]: { ...getEdit(u), reg: ev.target.value },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="select"
                        value={e.bt}
                        onChange={(ev) =>
                          setUserEdits((prev) => ({
                            ...prev,
                            [u.id]: { ...getEdit(u), bt: ev.target.value },
                          }))
                        }
                      >
                        <option value="">—</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.number})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn primary"
                        onClick={() => assign(u.id, e.reg, e.bt, e.nm)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* === NEW ATTENDANCE SECTION APPENDED === */}
      <div className="card">
        <h3>Attendance Records</h3>
        <div style={{ marginBottom: 10 }}>
          <button className="btn primary" onClick={loadAttendance}>
            {loadingAttendance ? "Loading…" : "Load All Attendance"}
          </button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => api.allExport()}>
            📤 Export All (Excel)
          </button>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="muted">No attendance loaded yet.</div>
        ) : (
          Object.entries(grouped).map(([date, recs]) => (
            <div key={date} className="card" style={{ marginBottom: 12 }}>
              <h4>{date}</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Batch</th>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Slot</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.ts).toLocaleString()}</td>
                      <td>{r.batch_id}</td>
                      <td>{r.reg_no}</td>
                      <td>{r.name}</td>
                      <td>{r.subject}</td>
                      <td>
                        {r.start_t}–{r.end_t}
                      </td>
                      <td>{r.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
