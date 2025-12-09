// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { apiGetDashboardSummary } from "../api";

export default function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGetDashboardSummary();
        if (data && !data.message) {
          setSummary(data);
        } else {
          setError(data.message || "Failed to load dashboard");
        }
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="muted small">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p className="muted small" style={{ color: "#b91c1c" }}>
        {error}
      </p>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">
            Live overview for {user?.hotelName || "your hotel"}.
          </p>
        </div>
      </div>

      {/* TOP SUMMARY CARDS (3 side-by-side, CSS: .dashboard-grid + .summary-card) */}
      <div className="dashboard-grid">
        <div className="summary-card available">
          <span className="label">Available Rooms</span>
          <span className="value">{summary.availableRooms}</span>
          <span className="sub-text">
            Total rooms: {summary.totalRooms}
          </span>
        </div>

        <div className="summary-card occupied">
          <span className="label">Occupied Rooms</span>
          <span className="value">{summary.occupiedRooms}</span>
          <span className="sub-text">
            Under maintenance: {summary.maintenanceRooms}
          </span>
        </div>

        <div className="summary-card maintenance">
          <span className="label">Active Bookings</span>
          <span className="value">{summary.activeBookings}</span>
          <span className="sub-text">
            Today check-in: {summary.todayCheckins} · checkout:{" "}
            {summary.todayCheckouts}
          </span>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="card">
        <h3>Recent Bookings</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!summary.recentBookings ||
                summary.recentBookings.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No recent bookings.
                  </td>
                </tr>
              )}

              {summary.recentBookings &&
                summary.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div>{b.guestName}</div>
                      <div className="muted small">{b.guestPhone}</div>
                    </td>
                    <td>{b.room?.roomNumber}</td>
                    <td>
                      {new Date(b.checkInDate).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(b.checkOutDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.isPaid ? "paid" : "pending"
                        }`}
                      >
                        {b.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === "active"
                            ? "status-in"
                            : "status-out"
                        }`}
                      >
                        {b.status === "active"
                          ? "Active"
                          : "Checked out"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
