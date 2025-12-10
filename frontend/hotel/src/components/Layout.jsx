// frontend/src/components/Layout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function Layout({ user, onLogout }) {
  const role = user?.role || "staff";

  // header lo kanipinche trial / paid text
  const getPlanBadgeText = () => {
    if (!user) return "";

    if (user.planType === "paid") {
      return "Paid plan";
    }

    if (!user.trialEndsAt) {
      return "Trial active";
    }

    const end = new Date(user.trialEndsAt);
    const endDate = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

    const now = new Date();
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = endDate.getTime() - todayDate.getTime();
    const daysLeft = Math.ceil(diffMs / oneDayMs);

    if (daysLeft < 0) return "Trial expired";
    if (daysLeft === 0) return "Trial: ends today";
    return `Trial: ${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
  };

  const badgeText = getPlanBadgeText();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <span className="logo-dot" />
          </div>
          <div className="sidebar-title">
            <div className="title-main">Hotel Panel</div>
            <div className="title-sub">Demo Hotel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/rooms" className="nav-link">
            Rooms
          </NavLink>
          <NavLink to="/bookings" className="nav-link">
            Bookings
          </NavLink>

          {role === "admin" && (
            <NavLink to="/logs" className="nav-link">
              System Logs
            </NavLink>
          )}

          {/* ⭐ ONLY SUPERADMIN – extra menu */}
          {role === "superadmin" && (
            <NavLink to="/superadmin" className="nav-link">
              Super Admin
            </NavLink>
          )}

          <NavLink to="/profile" className="nav-link">
            Profile
          </NavLink>
          <NavLink to="/settings" className="nav-link">
            Settings
          </NavLink>
        </nav>


        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="main-area">
        <header className="app-header">
          <div>
            <div className="welcome-text">
              Welcome back, {user?.name || "User"}
            </div>
            <div className="muted small">
              <span className="role-pill">{role.toUpperCase()}</span>
            </div>
          </div>

          {badgeText && (
            <div className="plan-badge">
              {badgeText}
            </div>
          )}
        </header>

        <section className="app-content">
          <Outlet context={{ user }} />
        </section>
      </main>
    </div>
  );
}

