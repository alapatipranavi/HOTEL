// frontend/src/pages/Logs.jsx
import { useEffect, useState } from "react";
import { apiGetLogs } from "../api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetLogs({ date, search });
      if (data && !data.message) {
        setLogs(data);
      } else {
        setError(data.message || "Failed to load logs");
      }
    } catch (err) {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // first load

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div>
      <div className="logs-header">
        <div>
          <h2>System Logs</h2>
          <p className="muted">
            Only admins can see logs. All room, booking and staff actions appear
            here.
          </p>
        </div>

        <form className="logs-filters" onSubmit={handleFilterSubmit}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search (user / action / room / guest...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            Apply
          </button>
        </form>
      </div>

      {error && (
        <p className="muted" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
      {loading && <p className="muted small">Loading logs...</p>}

      {!loading && logs.length === 0 && !error && (
        <p className="muted small">No logs found for selected filters.</p>
      )}

      <div>
        {logs.map((log) => (
          <div key={log._id} className="log-item">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500 }}>{log.action}</span>
              <span className="muted small">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="muted small">
              By: {log.userName} ({log.userRole})
            </div>
            {log.details && (
              <div className="muted small">Details: {log.details}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
