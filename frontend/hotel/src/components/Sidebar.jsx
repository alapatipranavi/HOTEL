import { NavLink } from 'react-router-dom';

export default function Sidebar({ role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">🏨</span>
        <div>
          <h1>Hotel Panel</h1>
          <p className="hotel-name">Demo Hotel</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/rooms">Rooms</NavLink>
        <NavLink to="/bookings">Bookings</NavLink>
        {role === 'admin' && <NavLink to="/logs">System Logs</NavLink>}
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/settings">Settings</NavLink>

        {/* Logout as button */}
        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
