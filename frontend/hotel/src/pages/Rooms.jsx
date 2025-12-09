// frontend/src/pages/Rooms.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGetRooms, apiCreateRoom, apiUpdateRoomStatus } from "../api";
import { useOutletContext } from "react-router-dom";

export default function Rooms() {
  const { user } = useOutletContext();
  const role = user?.role || "staff";

  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    roomNumber: "",
    roomType: "single",
    costPerNight: "",
    amenities: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGetRooms();
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          setError(data.message || "Failed to load rooms");
        }
      } catch (err) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    if (role !== "admin") {
      alert("Only admins can add rooms.");
      return;
    }

    if (!form.roomNumber || !form.costPerNight) {
      alert("Room number & cost are required");
      return;
    }

    const payload = {
      roomNumber: form.roomNumber,
      roomType: form.roomType,
      costPerNight: Number(form.costPerNight),
      amenities: form.amenities
        ? form.amenities.split(",").map((a) => a.trim())
        : [],
    };

    try {
      setError("");
      const data = await apiCreateRoom(payload);
      console.log("CREATE ROOM RESPONSE:", data);

      if (data._id) {
        setRooms((prev) => [...prev, data]);
        setForm({
          roomNumber: "",
          roomType: "single",
          costPerNight: "",
          amenities: "",
        });
      } else {
        alert(data.error || data.message || "Failed to create room");
      }
    } catch (err) {
      alert("Failed to create room (network)");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await apiUpdateRoomStatus(id, newStatus);
      if (updated._id) {
        setRooms((prev) =>
          prev.map((room) => (room._id === id ? updated : room))
        );
      } else {
        alert(updated.message || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredRooms = useMemo(() => {
    if (filterStatus === "all") return rooms;
    return rooms.filter((r) => r.status === filterStatus);
  }, [rooms, filterStatus]);

  const summary = useMemo(() => {
    return {
      available: rooms.filter((r) => r.status === "available").length,
      occupied: rooms.filter((r) => r.status === "occupied").length,
      maintenance: rooms.filter((r) => r.status === "under_maintenance").length,
    };
  }, [rooms]);

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h2>Rooms</h2>
          <p className="muted">
            Manage room inventory and live status. Data is stored in MongoDB.
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">All rooms</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="under_maintenance">Under maintenance</option>
        </select>
      </div>

      {error && (
        <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
          {error}
        </p>
      )}

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card available">
          <span className="label">Available</span>
          <span className="value">{summary.available}</span>
        </div>
        <div className="summary-card occupied">
          <span className="label">Occupied</span>
          <span className="value">{summary.occupied}</span>
        </div>
        <div className="summary-card maintenance">
          <span className="label">Under maintenance</span>
          <span className="value">{summary.maintenance}</span>
        </div>
      </div>

      <div className="rooms-layout">
        {/* Add room form – ADMIN ONLY */}
        {role === "admin" ? (
          <div className="card add-room-card">
            <h3>Add New Room</h3>
            <form onSubmit={handleAddRoom} className="room-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Room Number *</label>
                  <input
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g., 305"
                  />
                </div>
                <div className="form-group">
                  <label>Room Type</label>
                  <select
                    name="roomType"
                    value={form.roomType}
                    onChange={handleChange}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cost per night (₹) *</label>
                  <input
                    name="costPerNight"
                    type="number"
                    value={form.costPerNight}
                    onChange={handleChange}
                    placeholder="e.g., 2500"
                  />
                </div>
                <div className="form-group">
                  <label>Amenities (comma separated)</label>
                  <input
                    name="amenities"
                    value={form.amenities}
                    onChange={handleChange}
                    placeholder="AC, TV, WiFi"
                  />
                </div>
              </div>

              <button type="submit" className="primary-btn">
                + Add Room
              </button>
            </form>
          </div>
        ) : (
          <div className="card add-room-card">
            <h3>Rooms</h3>
            <p className="muted small">
              You are logged in as <b>staff</b>. You can update room status but
              cannot create new rooms.
            </p>
          </div>
        )}

        {/* Rooms table */}
        <div className="card rooms-table-card">
          <h3>All Rooms</h3>

          {loading ? (
            <p className="muted small">Loading rooms...</p>
          ) : (
            <div className="table-wrapper">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Cost / night (₹)</th>
                    <th>Amenities</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No rooms found.
                      </td>
                    </tr>
                  )}

                  {filteredRooms.map((room, index) => (
                    <tr key={room._id}>
                      <td>{index + 1}</td>
                      <td>{room.roomNumber}</td>
                      <td className="room-type-cell">{room.roomType}</td>
                      <td>{room.costPerNight}</td>
                      <td>
                        {room.amenities && room.amenities.length > 0 ? (
                          <div className="tags">
                            {room.amenities.map((a, i) => (
                              <span key={i} className="tag">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${room.status}`}>
                          {room.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <select
                          value={room.status}
                          onChange={(e) =>
                            handleStatusChange(room._id, e.target.value)
                          }
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="under_maintenance">
                            Under maintenance
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="muted small">
            * Admin can create rooms. Staff can only update status.
          </p>
        </div>
      </div>
    </div>
  );
}
