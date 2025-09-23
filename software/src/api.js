// src/api.js
const API_BASE =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, '')) ||
  'http://localhost:4000';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function request(path, method = 'GET', body) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
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

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const isJson = ct.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();


  if (!res.ok) {
    const msg = isJson
      ? data?.error || JSON.stringify(data)
      : `${res.status} ${String(data).slice(0, 140)}`;
    // optional: auto-logout on 401
    if (res.status === 401) localStorage.removeItem('token');
    throw new Error(msg);
  }

  return data;
}

export const api = {
  // Auth
  register: ({ name, email, password, regNo, batchNumber }) =>
    request('/api/auth/register', 'POST', { name, email, password, regNo, batchNumber }),
  login: (email, password) => request('/api/auth/login', 'POST', { email, password }),
  me: () => request('/api/auth/me', 'GET'),
markAttendance: async (token) => {
  return request("attendance/mark", "POST", { token });
},

  // Batches
  batches: () => request('/api/batches', 'GET'),
  createBatch: (number, name) => request('/api/batches', 'POST', { number, name }),

  // Community
communityList: () => request('/api/community', 'GET'),
communityCreate: ({ body, type }) => request('/api/community', 'POST', { body, type }), // type: 'anon' | 'announcement'
communityDelete: (id) => request(`/api/community/${encodeURIComponent(id)}`, 'DELETE'),


  // Users (admin)
  listUsers: () => request('/api/users', 'GET'),
  updateUser: (id, body) => request(`/api/users/${encodeURIComponent(id)}`, 'PUT', body),

  // Schedule (weekly editor)
  getSchedule: (batchId) => request(`/api/batches/${encodeURIComponent(batchId)}/schedule`, 'GET'),
  setSchedule: (batchId, schedule) =>
    request(`/api/batches/${encodeURIComponent(batchId)}/schedule`, 'PUT', { schedule }),

  // Schedule (views)
  todaySchedule: (batchId) =>
    request(`/api/schedule/today?batchId=${encodeURIComponent(batchId || '')}`, 'GET'),
  slotsOnDate: (batchId, ymd) =>
    request(
      `/api/schedule/on-date?batchId=${encodeURIComponent(batchId)}&date=${encodeURIComponent(
        ymd
      )}`,
      'GET'
    ),

  // QR / Attendance
  generateQR: (batchId, dateYMD, slotId) =>
    request(`/api/sessions/${encodeURIComponent(batchId)}/generate`, 'POST', { dateYMD, slotId }),
  mark: (sessionToken) => request('/api/attendance/mark', 'POST', { token: sessionToken }),

  // Export
  exportExcel: (dateYMD, batchId) =>
    window.open(
      `${API_BASE}/api/attendance/export?dateYMD=${encodeURIComponent(
        dateYMD
      )}&batchId=${encodeURIComponent(batchId)}`,
      '_blank'
    ),

  // Health (optional)
  health: () => request('/api/health', 'GET'),
};

export default api;
