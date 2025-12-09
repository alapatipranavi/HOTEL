export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Hotel Management Login</h1>
        <p className="subtitle">Admin / Staff portal</p>

        <form className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button type="submit">Login</button>

          <p className="hint">
            * Later: separate registration for new hotel / staff
          </p>
        </form>
      </div>
    </div>
  );
}
