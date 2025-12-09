// frontend/src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiGetMe, apiUpgradePlan } from "../api";

export default function Settings() {
  const { user } = useOutletContext();

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

  const isAdmin = me.role === "admin";
  const isPaid = me.planType === "paid";

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

    // Debug log (keep if you like)
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

  const handleUpgrade = async () => {
    if (!window.confirm("Upgrade this hotel to PAID plan for all users?")) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const res = await apiUpgradePlan();

      if (res && res.success) {
        setMe((prev) => ({
          ...prev,
          planType: "paid",
          trialEndsAt: null,
        }));
        setSuccess(
          "Plan upgraded to PAID for this hotel (admin + all staff)."
        );
      } else {
        setError(res?.message || "Upgrade failed");
      }
    } catch (err) {
      setError("Upgrade failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="muted small">Loading settings...</p>;
  }

  // Non-admin view
  if (!isAdmin) {
    return (
      <div className="settings-page">
        <h2>Settings</h2>
        <p className="muted">
          Billing and plan settings are managed by the hotel admin.
        </p>
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <p className="muted small">
            Current plan: <b>{isPaid ? "Paid" : "Trial"}</b>
          </p>
          {!isPaid && <p className="muted small">{getTrialInfo()}</p>}

          <p className="muted small">
            Debug – raw trialEndsAt: {String(me.trialEndsAt)}
          </p>
        </div>
      </div>
    );
  }

  // Admin view
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
          Status: <b>{isPaid ? "PAID PLAN" : "TRIAL PLAN"}</b>
        </p>

        {!isPaid && <p className="muted small">{getTrialInfo()}</p>}

        {isPaid && (
          <p className="muted small">
            This hotel is on a paid plan. Trial is not active.
          </p>
        )}

        {/* Upgrade button – only when admin & trial */}
        {isAdmin && !isPaid && (
          <button
            type="button"
            className="primary-btn"
            onClick={handleUpgrade}
            disabled={updating}
            style={{ marginTop: "0.75rem" }}
          >
            {updating ? "Upgrading..." : "Upgrade Now"}
          </button>
        )}

        <p className="muted small" style={{ marginTop: "0.75rem" }}>
          Debug – raw trialEndsAt: {String(me.trialEndsAt)}
        </p>
      </div>
    </div>
  );
}
