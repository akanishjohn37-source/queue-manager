// frontend/src/api/index.js

const BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchServices() {
  const res = await fetch(`${BASE_URL}/services/`);
  return res.json();
}

export async function fetchTokensByService(serviceId) {
  const res = await fetch(`${BASE_URL}/tokens/by-service/?service=${serviceId}`);
  return res.json();
}

export async function createToken(serviceId, visitor_name) {
  const res = await fetch(`${BASE_URL}/tokens/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: serviceId,
      visitor_name: visitor_name,
    }),
  });
  return res.json();
}

export async function updateTokenStatus(id, status) {
  const res = await fetch(`${BASE_URL}/tokens/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
