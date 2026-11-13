import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const TOKEN_KEY = 'lot.auth'

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields || {}
  }
}

// ---- token storage ------------------------------------------------------
export const tokens = {
  load() {
    try {
      const raw = localStorage.getItem(TOKEN_KEY)
      return raw ? JSON.parse(raw) : null // { access, refresh, user }
    } catch {
      return null
    }
  },
  save(v) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(v))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

// ---- axios instance -----------------------------------------------------
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  // NOTE: do not set Content-Type globally — axios will pick the right one
  // (JSON vs multipart/form-data) per request.
})

api.interceptors.request.use((config) => {
  const t = tokens.load()
  if (t?.access) config.headers.Authorization = `Bearer ${t.access}`
  return config
})

// ---- silent refresh + queue --------------------------------------------
let refreshing = null
const waiters = []

function onRefreshed(newAccess) {
  waiters.splice(0).forEach((cb) => cb(newAccess))
}

async function refreshAccessToken() {
  if (refreshing) return refreshing
  const t = tokens.load()
  if (!t?.refresh) throw new ApiError('Not logged in', 401)

  refreshing = axios
    .post(`${API_BASE}/api/auth/refresh/`, { refresh: t.refresh })
    .then(({ data }) => {
      const merged = {
        access: data.access,
        refresh: data.refresh || t.refresh, // ROTATE_REFRESH_TOKENS returns new refresh
        user: t.user,
      }
      tokens.save(merged)
      onRefreshed(merged.access)
      return merged.access
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error
    const status = response?.status
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh')

    // If already tried once, give up
    if (status !== 401 || isAuthEndpoint || config?.__retried) {
      throw wrapError(error)
    }

    config.__retried = true

    try {
      // Concurrency: if a refresh is in flight, wait for it
      if (refreshing) {
        await new Promise((resolve) => waiters.push(resolve))
      } else {
        await refreshAccessToken()
      }
      return api(config)
    } catch {
      tokens.clear()
      // Signal AuthContext
      window.dispatchEvent(new Event('lot:logout'))
      throw wrapError(error)
    }
  },
)

function wrapError(error) {
  const data = error.response?.data || {}
  const status = error.response?.status
  const message =
    (typeof data === 'string' && data) ||
    data.detail ||
    data.error ||
    error.message ||
    'Request failed'
  const fields = {}
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [k, v] of Object.entries(data)) {
      if (k === 'detail' || k === 'error') continue
      fields[k] = Array.isArray(v) ? v[0] : String(v)
    }
  }
  return new ApiError(message, status, fields)
}

// ---- ADDED FOR createListResource.js ------------------------------------
// এই ফাংশনগুলো createListResource.js ফাইলে get() কল করার জন্য দরকার
export const get = (url, config) => api.get(url, config).then((r) => r.data)
export const post = (url, data, config) => api.post(url, data, config)
export const patch = (url, data, config) => api.patch(url, data, config)
export const del = (url, config) => api.delete(url, config)

export default api