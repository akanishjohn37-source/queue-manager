// frontend/src/api.js
const API_BASE = "http://127.0.0.1:8000/api";

async function request(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("token");
  if (token && opts.auth !== false) headers.set("Authorization", `Token ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("user_id");
      // Optional: Redirect to login or just let the UI update
      // window.location.href = "/login"; 
    }
    const err = new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function loginUser(username, password) {
  const data = await request("/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    auth: false,
  });
  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    if (data.user_id) localStorage.setItem("user_id", data.user_id);
    if (data.is_staff !== undefined) localStorage.setItem("is_staff", data.is_staff);
  }
  return data;
}

export async function registerUser(username, password, password2) {
  const data = await request("/register/", {
    method: "POST",
    body: JSON.stringify({ username, password, password2 }),
    auth: false,
  });
  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    if (data.user_id) localStorage.setItem("user_id", data.user_id);
    if (data.is_staff !== undefined) localStorage.setItem("is_staff", data.is_staff);
  }
  return data;
}

export async function fetchProviders() {
  return request("/providers/");
}

export async function fetchServices(providerId = null) {
  const query = providerId ? `?provider=${providerId}` : "";
  return request(`/services/${query}`);
}

export async function fetchTokensByService(serviceId) {
  // backend expects query param ?service=ID
  return request(`/tokens-by-service/?service=${serviceId}`);
}

export async function updateTokenStatus(id, status) {
  return request(`/tokens/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export const createToken = async (serviceId, visitorName, appointmentTime) => {
  const data = { service: serviceId, visitor_name: visitorName };
  if (appointmentTime) data.appointment_time = appointmentTime;
  return apiPost("/tokens/", data);
};

export async function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
