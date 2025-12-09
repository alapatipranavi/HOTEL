import { useState } from "react";
import { apiLogin, apiRegister } from "../api";

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    hotelName: "",
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data =
        mode === "login"
          ? await apiLogin({ email: form.email, password: form.password })
          : await apiRegister(form);

      if (!data?.token) {
        setError(data?.message || "Failed");
        return;
      }

      onAuthSuccess(data);
    } catch (err) {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        {error && (
          <p className="muted" style={{ color: "#dc2626", marginBottom: "8px" }}>
            {error}
          </p>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>

          {mode === "register" && (
            <>
              <input
                type="text"
                name="hotelName"
                placeholder="Hotel name"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                onChange={handleChange}
                required
              />
              <select name="role" onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {loading ? (mode === "login" ? "Logging in..." : "Creating...") :
              mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

      </div>
    </div>
  );
}
