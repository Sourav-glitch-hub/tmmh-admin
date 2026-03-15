// src/api/index.js — All admin API calls with retry for cold start
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

// ── Generic request with retry (handles Render cold start) ───
export const request = async (path, opts = {}, token = null, retries = 2) => {
  const headers = { ...opts.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json'

  try {
    const res  = await fetch(`${BASE}${path}`, { ...opts, headers })
    const text = await res.text()

    // Empty response — server waking up, retry
    if (!text && retries > 0) {
      await new Promise(r => setTimeout(r, 3000))
      return request(path, opts, token, retries - 1)
    }

    const data = JSON.parse(text)
    if (!res.ok) throw new Error(data?.message || 'Request failed')
    return data

  } catch (err) {
    // JSON parse failed — server still waking up
    if (err instanceof SyntaxError && retries > 0) {
      await new Promise(r => setTimeout(r, 3000))
      return request(path, opts, token, retries - 1)
    }
    throw err
  }
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
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.status) q.set('status', params.status)
    if (params.search) q.set('search', params.search)
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

// ── Products ─────────────────────────────────────────────────
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
