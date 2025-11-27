// frontend/src/api.js

const BASE_URL = "http://127.0.0.1:8000/api";

// Helpers
async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// GET /api/services/
export function fetchServices() {
  return apiGet("/services/");
}

// GET /api/tokens/by_service/?service=ID
export function fetchTokensByService(serviceId) {
  return apiGet(`/tokens/by_service/?service=${serviceId}`);
}

// POST /api/tokens/  with { service, username }
export function createToken(serviceId, username) {
  return apiPost("/tokens/", { service: serviceId, username });
}

// PATCH /api/tokens/:id/  with { status }
export function updateTokenStatus(tokenId, status) {
  return apiPatch(`/tokens/${tokenId}/`, { status });
}
