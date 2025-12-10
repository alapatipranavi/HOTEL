// frontend/src/pages/SuperAdmin.jsx
import { useEffect, useState } from "react";
import { apiSuperadminGetHotels, apiSuperadminUpdateHotelPlan } from "../api";

export default function SuperAdmin() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingHotel, setUpdatingHotel] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiSuperadminGetHotels();
      if (Array.isArray(data)) {
        setHotels(data);
      } else {
        setError(data.message || "Failed to load hotels");
      }
    } catch (err) {
      setError("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkPaid = async (hotelName) => {
    if (!window.confirm(`Mark "${hotelName}" as PAID plan?`)) return;
    try {
      setUpdatingHotel(hotelName);
      const res = await apiSuperadminUpdateHotelPlan(hotelName, "paid");
      alert(res.message || "Plan updated");
      await load();
    } catch (err) {
      alert("Failed to update plan");
    } finally {
      setUpdatingHotel("");
    }
  };

  const handleResetTrial = async (hotelName) => {
    const daysStr = window.prompt(
      `New trial days for "${hotelName}"?`,
      "10"
    );
    if (!daysStr) return;
    const days = Number(daysStr) || 10;

    try {
      setUpdatingHotel(hotelName);
      const res = await apiSuperadminUpdateHotelPlan(hotelName, "trial", days);
      alert(res.message || "Trial reset");
      await load();
    } catch (err) {
      alert("Failed to reset trial");
    } finally {
      setUpdatingHotel("");
    }
  };

  return (
    <div className="page-content">
      <h2>Super Admin – Hotels</h2>
      <p className="muted">
        You can see all hotels using this system and control their plans.
        Only <b>your</b> account (superadmin) can access this.
      </p>

      {error && (
        <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted small" style={{ marginTop: "0.75rem" }}>
          Loading hotels...
        </p>
      ) : (
        <div className="card" style={{ marginTop: "0.75rem" }}>
          {hotels.length === 0 ? (
            <p className="muted small">No hotels found yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Plan</th>
                    <th>Trial Ends</th>
                    <th>Users</th>
                    <th>Admins</th>
                    <th>Staff</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((h) => (
                    <tr key={h.hotelName}>
                      <td>{h.hotelName}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            h.planType === "paid" ? "occupied" : "available"
                          }`}
                        >
                          {h.planType === "paid" ? "PAID" : "TRIAL"}
                        </span>
                      </td>
                      <td>
                        {h.planType === "paid" || !h.trialEndsAt
                          ? "—"
                          : new Date(h.trialEndsAt).toLocaleDateString()}
                      </td>
                      <td>{h.usersCount}</td>
                      <td>{h.adminsCount}</td>
                      <td>{h.staffCount}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            className="primary-btn"
                            style={{
                              padding: "0.25rem 0.6rem",
                              fontSize: "0.75rem",
                            }}
                            disabled={updatingHotel === h.hotelName}
                            onClick={() => handleMarkPaid(h.hotelName)}
                          >
                            {updatingHotel === h.hotelName
                              ? "Updating..."
                              : "Mark Paid"}
                          </button>

                          <button
                            type="button"
                            className="primary-btn"
                            style={{
                              padding: "0.25rem 0.6rem",
                              fontSize: "0.75rem",
                              background: "#e5e7eb",
                              color: "#111827",
                            }}
                            disabled={updatingHotel === h.hotelName}
                            onClick={() => handleResetTrial(h.hotelName)}
                          >
                            Reset Trial
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
