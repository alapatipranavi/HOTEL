// frontend/src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { apiGetMe, apiMarkPaid } from "../api";

export default function Settings({ user }) {
  const [me, setMe] = useState({
    role: user?.role || "",
    planType: user?.planType || "trial",
    trialEndsAt: user?.trialEndsAt || null,
    hotelName: user?.hotelName || "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGetMe();
        if (data && !data.message) {
          setMe({
            role: data.role,
            planType: data.planType || "trial",
            trialEndsAt: data.trialEndsAt || null,
            hotelName: data.hotelName,
          });
        } else if (data.message) {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔍 DEBUG TRIAL INFO
  const getTrialInfo = () => {
    if (!me.trialEndsAt) {
      if (me.planType === "paid") return "You are on a paid plan.";
      return "Trial information not available.";
    }

    const end = new Date(me.trialEndsAt);
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const now = new Date();
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = endDate.getTime() - todayDate.getTime();
    const daysLeft = Math.ceil(diffMs / oneDayMs);

    // 🔴 DEBUG LOG
    console.log("TRIAL DEBUG =>", {
      rawTrialEndsAt: me.trialEndsAt,
      endDate: endDate.toISOString(),
      todayDate: todayDate.toISOString(),
      diffMs,
      daysLeft,
    });

    if (daysLeft < 0) {
      return `Trial expired on ${endDate.toLocaleDateString()}.`;
    } else if (daysLeft === 0) {
      return `Trial expires today (${endDate.toLocaleDateString()}).`;
    } else {
      return `Trial ends on ${endDate.toLocaleDateString()} (${daysLeft} day${
        daysLeft > 1 ? "s" : ""
      } left).`;
    }
  };

  const handleMarkPaid = async () => {
    if (!window.confirm("Mark this hotel as paid plan?")) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      const data = await apiMarkPaid();
      if (data.message) {
        setMe((prev) => ({
          ...prev,
          planType: "paid",
          trialEndsAt: null,
        }));
        setSuccess("Plan updated to PAID for this hotel.");
      } else {
        setError(data.message || "Failed to update plan");
      }
    } catch (err) {
      setError("Failed to update plan");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="muted small">Loading settings...</p>;
  }

  if (me.role !== "admin") {
    return (
      <div className="settings-page">
        <h2>Settings</h2>
        <p className="muted">
          Billing and plan settings are managed by the hotel admin.
        </p>
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <p className="muted small">
            Current plan:{" "}
            <b>{me.planType === "paid" ? "Paid" : "Trial"}</b>
          </p>
          {me.planType === "trial" && (
            <p className="muted small">{getTrialInfo()}</p>
          )}

          {/* DEBUG INFO FOR YOU */}
          <p className="muted small">
            Debug – raw trialEndsAt: {String(me.trialEndsAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h2>Settings & Billing</h2>
      <p className="muted">
        Manage SaaS plan for <b>{me.hotelName}</b>. Default plan is a 10-day
        free trial.
      </p>

      {error && (
        <p
          style={{
            color: "#b91c1c",
            fontSize: "0.8rem",
            marginBottom: "0.5rem",
          }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          style={{
            color: "#16a34a",
            fontSize: "0.8rem",
            marginBottom: "0.5rem",
          }}
        >
          {success}
        </p>
      )}

      <div className="card">
        <h3>Current Plan</h3>
        <p className="muted small">
          Status:{" "}
          <b>{me.planType === "paid" ? "PAID PLAN" : "TRIAL PLAN"}</b>
        </p>
        {me.planType === "trial" && (
          <p className="muted small">{getTrialInfo()}</p>
        )}

        {me.planType === "paid" && (
          <p className="muted small">
            This hotel is marked as paid. Trial is not active.
          </p>
        )}

        {me.planType === "trial" && (
          <button
            type="button"
            className="primary-btn"
            onClick={handleMarkPaid}
            disabled={updating}
            style={{ marginTop: "0.75rem" }}
          >
            {updating ? "Updating..." : "Mark as Paid Plan"}
          </button>
        )}

        {/* DEBUG INFO FOR YOU */}
        <p className="muted small" style={{ marginTop: "0.75rem" }}>
          Debug – raw trialEndsAt: {String(me.trialEndsAt)}
        </p>
      </div>
    </div>
  );
}
