import React, { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/announcements.css";

export default function Announcements({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const result = await api.getAnnouncements();
      setAnnouncements(result.announcements || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    if (user?.role !== "admin") {
      setError("Only admins can post announcements");
      return;
    }

    try {
      const result = await api.createAnnouncement({
        title: "New Announcement",
        content: newAnnouncement,
      });
      const announcement = {
        id: result.announcement.id,
        title: result.announcement.title,
        content: result.announcement.content,
        author_id: result.announcement.author_id,
        author_name: result.announcement.author_name || user.name,
        created_at: result.announcement.created_at,
      };
      setAnnouncements([announcement, ...announcements]);
      setNewAnnouncement("");
    } catch (err) {
      setError(err.message || "Failed to post announcement");
    }
  };

  return (
    <div className="announcements-page">
      <h1>Announcements</h1>

      {user?.role === "admin" && (
        <form className="announcement-form" onSubmit={handlePostAnnouncement}>
          <textarea
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Post a new announcement..."
            rows="4"
            className="form-input"
            required
          />
          <button type="submit" className="btn btn-primary">
            Post Announcement
          </button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p className="no-data">No announcements yet</p>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <span className="date">
                  {new Date(announcement.created_at).toLocaleDateString()} at{" "}
                  {new Date(announcement.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="announcement-content">{announcement.content}</p>
              <div className="announcement-author">By {announcement.author_name || "Admin"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
