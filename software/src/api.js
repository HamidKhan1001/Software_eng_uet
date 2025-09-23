// src/api.js
// IMPORTANT: REACT_APP_API_URL should be backend ROOT, e.g.
// https://your-service.onrender.com   (no trailing slash, no /api)

const API_ROOT =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, "")) ||
  "http://localhost:4000";

// Build URL and ensure exactly one '/api' prefix
function buildUrl(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const withApi = clean.startsWith("/api/") ? clean : `/api${clean}`;
  return `${API_ROOT}${withApi}`;
}

function token() {
  return localStorage.getItem("token") || "";
}

async function request(path, method = "GET", body) {
  const url = buildUrl(path);
  const headers = { "Content-Type": "application/json" };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(`Network error: ${err.message || err}`);
  }

  // Try to parse JSON if present
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg = isJson ? data?.error || JSON.stringify(data) : `${res.status} ${String(data).slice(0, 160)}`;
    if (res.status === 401) localStorage.removeItem("token");
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // --- Auth ---
  register: ({ name, email, password, regNo, batchNumber }) =>
    request("/auth/register", "POST", { name, email, password, regNo, batchNumber }),
  login: (email, password) => request("/auth/login", "POST", { email, password }),
  me: () => request("/auth/me"),

  // --- Batches ---
  batches: () => request("/batches"),
  createBatch: (number, name) => request("/batches", "POST", { number, name }),

  // --- Community ---
  communityList: () => request("/community"),
  communityCreate: ({ body, type }) => request("/community", "POST", { body, type }), // 'anon' | 'announcement'
  communityDelete: (id) => request(`/community/${encodeURIComponent(id)}`, "DELETE"),

  // --- Users (admin) ---
  listUsers: () => request("/users"),
  updateUser: (id, body) => request(`/users/${encodeURIComponent(id)}`, "PUT", body),

  // --- Schedule (weekly editor) ---
  getSchedule: (batchId) => request(`/batches/${encodeURIComponent(batchId)}/schedule`),
  setSchedule: (batchId, schedule) => request(`/batches/${encodeURIComponent(batchId)}/schedule`, "PUT", { schedule }),

  // --- Schedule (views) ---
  todaySchedule: (batchId) => request(`/schedule/today?batchId=${encodeURIComponent(batchId || "")}`),
  slotsOnDate: (batchId, ymd) =>
    request(`/schedule/on-date?batchId=${encodeURIComponent(batchId)}&date=${encodeURIComponent(ymd)}`),

  // --- QR / Attendance ---
  generateQR: (batchId, dateYMD, slotId) =>
    request(`/sessions/${encodeURIComponent(batchId)}/generate`, "POST", { dateYMD, slotId }),
  mark: (sessionToken) => request("/attendance/mark", "POST", { token: sessionToken }),

  // --- Export (opens a file) ---
  exportExcel: (dateYMD, batchId) => {
    const url = buildUrl(
      `/attendance/export?dateYMD=${encodeURIComponent(dateYMD)}&batchId=${encodeURIComponent(batchId)}`
    );
    window.open(url, "_blank");
  },

  // --- Health ---
  health: () => request("/health"),
};

export default api;
