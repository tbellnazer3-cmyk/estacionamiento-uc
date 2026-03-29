// api.js — Cliente HTTP para el backend EstacionaUC
// Se conectará a /backend una vez implementado el Prompt 3.

const API_BASE_URL = 'http://localhost:3000/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error en la solicitud.');
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email, password, tucNumber) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, tuc_number: tucNumber }),
  });
}

// ─── TUC ─────────────────────────────────────────────────────────────────────

export async function getTucBalance(tucNumber) {
  return apiFetch(`/tuc/${tucNumber}`);
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export async function initPayment(tucNumber, amount, type) {
  return apiFetch('/payment/init', {
    method: 'POST',
    body: JSON.stringify({ tuc_number: tucNumber, amount, type }),
  });
}

// ─── Usuario ─────────────────────────────────────────────────────────────────

export async function getDashboard() {
  return apiFetch('/user/dashboard');
}

export async function getHistory(page = 1) {
  return apiFetch(`/user/history?page=${page}`);
}
