export default function Topbar({ userName = 'Demo User', role = 'admin' }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Welcome back, {userName}</h2>
        <span className="role-pill">{role.toUpperCase()}</span>
      </div>
      <div className="topbar-right">
        {/* later: date, trial status, etc */}
        <span className="trial-tag">Trial: 5 days left</span>
      </div>
    </header>
  );
}
