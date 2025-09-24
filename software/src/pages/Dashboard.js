import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ user }) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user?.batchId) {
      api.todaySchedule(user.batchId).then((r) => setClasses(r.classes));
    }
  }, [user]);

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome {user.name}</p>
        <h3>Today’s Classes</h3>
        {classes.length === 0 ? (
          <p className="muted">No classes today.</p>
        ) : (
          <ul>
            {classes.map((c) => (
              <li key={c.id}>
                {c.subject} {c.start_t}–{c.end_t} @ {c.location}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
