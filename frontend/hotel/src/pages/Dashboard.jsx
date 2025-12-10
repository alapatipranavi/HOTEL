// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  apiGetDashboardSummary,
  apiGetRecentBookings,
  apiSuperAdminListHotels, // make sure this exists in your api.js (optional)
} from "../api";

export default function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [hotels, setHotels] = useState([]); // only for superadmin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setError("");

        // 1) summary (everyone)
        const summaryData = await apiGetDashboardSummary();
        if (!mounted) return;
        if (summaryData && !summaryData.message) {
          setSummary(summaryData);
        } else {
          // backend might return {message: ...} on error
          throw new Error(summaryData.message || "Failed to load summary");
        }

        // 2) recent bookings (everyone)
        const recent = await apiGetRecentBookings();
        if (!mounted) return;
        if (Array.isArray(recent)) {
          setRecentBookings(recent);
        } else {
          // if API returns an object, try to handle gracefully
          setRecentBookings(Array.isArray(recent.data) ? recent.data : []);
        }

        // 3) hotels (only superadmin) — avoid calling for normal users to prevent 403
        if (user && user.role === "superadmin") {
          try {
            const hotelsData = await apiSuperAdminListHotels();
            if (!mounted) return;
            if (Array.isArray(hotelsData)) setHotels(hotelsData);
            else setHotels([]);
          } catch (e) {
            // don't break whole dashboard if hotels call fails — show debug only
            console.warn("Failed to load hotels (superadmin):", e);
          }
        }
      } catch (err) {
        console.error("DASHBOARD LOAD ERROR:", err);
        if (mounted) setError("Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

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

        {/* superadmin hotels preview (optional) */}
        {user?.role === "superadmin" && (
          <div style={{ textAlign: "right" }}>
            <small className="muted">Hotels managed: {hotels.length}</small>
          </div>
        )}
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="dashboard-grid">
        <div className="summary-card available">
          <span className="label">Available Rooms</span>
          <span className="value">{summary.availableRooms ?? 0}</span>
          <span className="sub-text">Total rooms: {summary.totalRooms ?? 0}</span>
        </div>

        <div className="summary-card occupied">
          <span className="label">Occupied Rooms</span>
          <span className="value">{summary.occupiedRooms ?? 0}</span>
          <span className="sub-text">
            Under maintenance: {summary.maintenanceRooms ?? 0}
          </span>
        </div>

        <div className="summary-card maintenance">
          <span className="label">Active Bookings</span>
          <span className="value">{summary.activeBookings ?? 0}</span>
          <span className="sub-text">
            Today check-in: {summary.todayCheckins ?? 0} · checkout:{" "}
            {summary.todayCheckouts ?? 0}
          </span>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Recent Bookings</h3>
        <div className="table-wrapper">
          <table className="rooms-table">
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
              {(!recentBookings || recentBookings.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No recent bookings.
                  </td>
                </tr>
              )}

              {recentBookings &&
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div>{b.guestName}</div>
                      <div className="muted small">{b.guestPhone}</div>
                    </td>
                    <td>{b.room?.roomNumber ?? "—"}</td>
                    <td>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : "—"}</td>
                    <td>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`status-pill ${b.isPaid ? "available" : ""}`}>
                        {b.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${b.status === "active" ? "occupied" : ""}`}>
                        {b.status === "active" ? "Active" : "Checked out"}
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
