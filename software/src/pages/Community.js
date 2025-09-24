import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "../api";

dayjs.extend(relativeTime);

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
          <b>{p.type === "announcement" ? "📌 Announcement" : "Anonymous"}</b>
          <span className="muted"> · {when}{exp}</span>
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

export default function Community({ user }) {
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
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={asAnnouncement}
                onChange={(e) => setAsAnnouncement(e.target.checked)}
              />
              Make this an announcement (won’t expire)
            </label>
          )}
          <button className="btn primary" onClick={submit} style={{ marginLeft: "auto" }}>
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
