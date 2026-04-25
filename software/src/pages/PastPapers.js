import React, { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/past-papers.css";

export default function PastPapers({ user }) {
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("papers"); // 'papers' or 'notes'

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const $papers = await api.getPastPapers();
      const $notes = await api.getNotes();
      setPapers($papers.papers || []);
      setNotes($notes.notes || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="past-papers-page">
      <h1>Past Papers & Notes</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === "papers" ? "active" : ""}`}
          onClick={() => setTab("papers")}
        >
          Past Papers
        </button>
        <button
          className={`tab-btn ${tab === "notes" ? "active" : ""}`}
          onClick={() => setTab("notes")}
        >
          Course Notes
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading resources...</p>
      ) : (
        <>
          {tab === "papers" && (
            <div className="resources-list">
              {papers.length === 0 ? (
                <p className="no-data">No past papers available yet</p>
              ) : (
                papers.map((paper) => (
                  <div key={paper.id} className="resource-card">
                    <div className="resource-info">
                      <h3>{paper.title}</h3>
                      <div className="resource-meta">
                        <span className="course">{paper.course}</span>
                        <span className="semester">{paper.semester}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "notes" && (
            <div className="resources-list">
              {notes.length === 0 ? (
                <p className="no-data">No course notes available yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="resource-card">
                    <div className="resource-info">
                      <h3>{note.title}</h3>
                      <div className="resource-meta">
                        <span className="course">{note.course}</span>
                        <span className="uploader">Uploaded by {note.uploaded_by_name}</span>
                        <span className="date">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
