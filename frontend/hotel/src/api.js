// frontend/src/api.js
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

/* ---------- AUTH ---------- */

export async function apiRegister(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiLogin(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetMe() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function apiUpdateProfile(profile) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function apiChangePassword(payload) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/** old mark-paid endpoint – ok to keep, or you can delete if unused */
export async function apiMarkPaid() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/settings/mark-paid`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

/* ---------- ROOMS ---------- */

export async function apiGetRooms() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/rooms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function apiCreateRoom(room) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(room),
  });
  return res.json();
}

export async function apiUpdateRoomStatus(id, status) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/rooms/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/* ---------- BOOKINGS ---------- */

export async function apiGetBookings() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function apiCreateBooking(booking) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(booking),
  });
  return res.json();
}

export async function apiUpdatePayment(id, isPaid) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/bookings/${id}/payment`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isPaid }),
  });
  return res.json();
}

export async function apiCheckoutBooking(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/bookings/${id}/checkout`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

/* ---------- LOGS ---------- */

export async function apiGetLogs() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

/* ---------- DASHBOARD ---------- */

export async function apiGetDashboardSummary() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

/** NEW: upgrade plan for entire hotel (admin only) */
export async function apiUpgradePlan() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/dashboard/upgrade-plan`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
