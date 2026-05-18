import React, { useEffect, useState } from "react";
import api from "./apiClient";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      }
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (
      !formData.guest_name ||
      !formData.room_id ||
      !formData.check_in_date ||
      !formData.check_out_date
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const response = await api.post("/bookings", {
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        room_id: parseInt(formData.room_id),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
      });

      const data = await response.json();

      if (response.ok) {
        setBookings([data, ...bookings]);
        setShowForm(false);
        setFormData({
          guest_name: "",
          guest_email: "",
          room_id: "",
          check_in_date: "",
          check_out_date: "",
        });
      }
    } catch (err) {
      setError("Failed to create booking");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏠 Room Bookings</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Booking"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Create Booking</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Guest Name *</label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={(e) =>
                  setFormData({ ...formData, guest_name: e.target.value })
                }
                placeholder="Guest name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.guest_email}
                onChange={(e) =>
                  setFormData({ ...formData, guest_email: e.target.value })
                }
                placeholder="guest@example.com"
              />
            </div>

            <div className="form-group">
              <label>Room *</label>
              <select
                value={formData.room_id}
                onChange={(e) =>
                  setFormData({ ...formData, room_id: e.target.value })
                }
              >
                <option value="">Select Room</option>
                <option value="1">101 - Single</option>
                <option value="2">102 - Double</option>
                <option value="3">201 - Suite</option>
              </select>
            </div>

            <div className="form-group">
              <label>Check-in Date *</label>
              <input
                type="date"
                value={formData.check_in_date}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_date: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Check-out Date *</label>
              <input
                type="date"
                value={formData.check_out_date}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_date: e.target.value })
                }
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleCreateBooking}>
            Create Booking
          </button>
        </div>
      )}

      {loading ? (
        <div className="loader">Loading bookings...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.guest_name}</td>
                  <td>Room {booking.room_id}</td>
                  <td>
                    {new Date(booking.check_in_date).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(booking.check_out_date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
