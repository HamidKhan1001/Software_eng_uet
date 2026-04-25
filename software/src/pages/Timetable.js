import React, { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/timetable.css";

export default function Timetable({ user }) {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("1");

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const result = await api.getTimetable(user?.batchId);
      setTimetables(Object.entries(result.timetable || {}).map(([day, courses], idx) => ({
        id: idx,
        semester: "1",
        day,
        courses: (courses || []).map(c => ({
          name: c.course || "Unknown Course",
          code: c.course?.split('-')[0] || "UNKNOWN",
          schedule: [{
            day: c.day,
            time: `${c.start_time}-${c.end_time}`,
            room: c.location,
          }]
        }))
      })));
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load timetables");
    } finally {
      setLoading(false);
    }
  };

  const currentTimetable = timetables.find((t) => t.semester === selectedSemester);

  return (
    <div className="timetable-page">
      <h1>Class Timetable</h1>

      <div className="semester-selector">
        <label htmlFor="semester">Select Semester:</label>
        <select
          id="semester"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="form-select"
        >
          {timetables.map((t) => (
            <option key={t.id} value={t.semester}>
              Semester {t.semester}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading timetables...</p>
      ) : currentTimetable ? (
        <div className="timetable-content">
          {currentTimetable.courses.map((course, idx) => (
            <div key={idx} className="course-section">
              <div className="course-header">
                <h3>{course.name}</h3>
                <span className="course-code">{course.code}</span>
              </div>
              <div className="schedule-grid">
                {course.schedule.map((session, sidx) => (
                  <div key={sidx} className="schedule-item">
                    <div className="day">{session.day}</div>
                    <div className="time">{session.time}</div>
                    <div className="room">📍 {session.room}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No timetable available for this semester</p>
      )}

      {user?.role === "admin" && (
        <div className="admin-note">
          <p>💡 Admin: You can edit timetables from the Admin Panel</p>
        </div>
      )}
    </div>
  );
}
