// frontend/src/pages/Bookings.jsx
import { useEffect, useMemo, useState } from "react";
import {
  apiGetBookings,
  apiCreateBooking,
  apiUpdatePayment,
  apiCheckoutBooking,
  apiGetRooms,
} from "../api";

export default function Bookings() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    roomId: "",
    guestName: "",
    guestPhone: "",
    checkInDate: "",
    checkOutDate: "",
    idProofType: "Aadhar",
    idProofNumber: "",
    isPaid: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [roomsData, bookingsData] = await Promise.all([
          apiGetRooms(),
          apiGetBookings(),
        ]);

        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "available"),
    [rooms]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    const required = [
      "roomId",
      "guestName",
      "guestPhone",
      "checkInDate",
      "checkOutDate",
      "idProofType",
      "idProofNumber",
    ];

    if (required.some((f) => !form[f])) {
      alert("All fields are required");
      return;
    }

    try {
      const data = await apiCreateBooking(form);

      if (!data._id) {
        alert(data.message || "Failed to create booking");
        return;
      }

      setBookings((prev) => [data, ...prev]);

      setRooms((prev) =>
        prev.map((r) =>
          r._id === data.room._id ? { ...r, status: "occupied" } : r
        )
      );

      setForm({
        roomId: "",
        guestName: "",
        guestPhone: "",
        checkInDate: "",
        checkOutDate: "",
        idProofType: "Aadhar",
        idProofNumber: "",
        isPaid: false,
      });

    } catch {
      alert("Failed to book room");
    }
  };

  const handleTogglePaid = async (booking) => {
    try {
      const updated = await apiUpdatePayment(booking._id, !booking.isPaid);
      if (updated._id) {
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? updated : b))
        );
      }
    } catch {
      alert("Failed to update payment");
    }
  };

  const handleCheckout = async (booking) => {
    if (!window.confirm("Checkout this booking?")) return;

    try {
      const updated = await apiCheckoutBooking(booking._id);
      if (!updated._id) return alert("Checkout failed");

      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? updated : b))
      );

      setRooms((prev) =>
        prev.map((r) =>
          r._id === updated.room._id ? { ...r, status: "available" } : r
        )
      );
    } catch {
      alert("Checkout error");
    }
  };

  return (
    <div className="bookings-page">
      <h2>Bookings</h2>
      <p className="muted">
        Create and manage guest bookings. Check-in/check-out updates room status.
      </p>

      {/* New Booking Form */}
      <div className="new-booking-card">
        <h3>New Booking</h3>

        <form className="two-grid-form" onSubmit={handleCreateBooking}>
          <div className="form-group">
            <label>Room *</label>
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
            >
              <option value="">Select room</option>
              {availableRooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Guest Name *</label>
            <input
              name="guestName"
              value={form.guestName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              name="guestPhone"
              value={form.guestPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Check-in *</label>
            <input
              type="date"
              name="checkInDate"
              value={form.checkInDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Check-out *</label>
            <input
              type="date"
              name="checkOutDate"
              value={form.checkOutDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ID Proof *</label>
            <select
              name="idProofType"
              value={form.idProofType}
              onChange={handleChange}
            >
              <option>Aadhar</option>
              <option>Passport</option>
              <option>Voter ID</option>
            </select>
          </div>

          <div className="form-group">
            <label>ID Number *</label>
            <input
              name="idProofNumber"
              value={form.idProofNumber}
              onChange={handleChange}
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={handleChange}
              />{" "}
              Payment Received
            </label>
          </div>

          <button className="primary-btn create-booking-btn">
            Create Booking
          </button>
        </form>
      </div>

      {/* All Bookings Table */}
      <div className="bookings-table-card">
        <h3>All Bookings</h3>

        {!loading ? (
          <div className="table-wrapper">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, i) => (
                    <tr key={b._id}>
                      <td>{i + 1}</td>
                      <td>
                        <div>{b.guestName}</div>
                        <div className="muted small">{b.guestPhone}</div>
                      </td>
                      <td>{b.room?.roomNumber}</td>
                      <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className={`small-btn ${
                            b.isPaid ? "paid" : "unpaid"
                          }`}
                          onClick={() => handleTogglePaid(b)}
                        >
                          {b.isPaid ? "Paid" : "Mark Paid"}
                        </button>
                      </td>
                      <td>
                        <span className={`status-pill ${
                          b.status === "active" ? "occupied" : "available"
                        }`}>
                          {b.status === "active"
                            ? "Active"
                            : "Checked Out"}
                        </span>
                      </td>
                      <td>
                        {b.status === "active" ? (
                          <button
                            className="small-btn checkout-btn"
                            onClick={() => handleCheckout(b)}
                          >
                            Checkout
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small">Loading...</p>
        )}
      </div>
    </div>
  );
}
