// src/api/index.js — All admin API calls
const BASE = '/api'

// ── Generic request wrapper ──────────────────────────────────
export const request = async (path, opts = {}, token = null) => {
  const headers = { ...opts.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json'

  const res  = await fetch(`${BASE}${path}`, { ...opts, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Request failed')
  return data
}

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
}

// ── Repairs ──────────────────────────────────────────────────
export const repairAPI = {
  getStats:  (token) => request('/repairs/admin/stats', {}, token),

  getAll: (token, params = {}) => {
    const q = new URLSearchParams()
    if (params.page)        q.set('page',   params.page)
    if (params.limit)       q.set('limit',  params.limit)
    if (params.status)      q.set('status', params.status)
    if (params.search)      q.set('search', params.search)
    return request(`/repairs/admin/all?${q}`, {}, token)
  },

  getOne: (id, token) => request(`/repairs/admin/${id}`, {}, token),

  updateStatus: (id, status, adminNotes, token) =>
    request(`/repairs/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }, token),

  delete: (id, token) =>
    request(`/repairs/admin/${id}`, { method: 'DELETE' }, token),
}

// ── Products ──────────────────────────────────────────────────
export const productAPI = {
  getAll: (token) => request('/products', {}, token),

  create: (formData, token) =>
    request('/products', { method: 'POST', body: formData }, token),

  update: (id, formData, token) =>
    request(`/products/${id}`, { method: 'PUT', body: formData }, token),

  toggleAvailability: (id, token) =>
    request(`/products/${id}/availability`, { method: 'PATCH' }, token),

  delete: (id, token) =>
    request(`/products/${id}`, { method: 'DELETE' }, token),
}