import api, { ApiError } from './client'

export { ApiError }

const list = (url, params) => api.get(url, { params }).then((r) => r.data)
const one = (url) => api.get(url).then((r) => r.data)

// ---- auth ---------------------------------------------------------------
export const auth = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }).then((r) => r.data),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }).then((r) => r.data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }).then((r) => r.data),
  me: () => one('/auth/me/'),
  updateMe: (patch) => api.patch('/auth/me/', patch).then((r) => r.data),
  passwordChange: (old_password, new_password) =>
    api.post('/auth/password-change/', { old_password, new_password }).then((r) => r.data),
}

// ---- stats --------------------------------------------------------------
export const stats = {
  public: () => one('/stats/'),
  dashboard: () => one('/dashboard/stats/'),
}

// ---- users (admin) ------------------------------------------------------
export const users = {
  list: (params) => list('/users/', params),
  retrieve: (id) => one(`/users/${id}/`),
  create: (body) => api.post('/users/', body).then((r) => r.data),
  update: (id, body) => api.patch(`/users/${id}/`, body).then((r) => r.data),
  destroy: (id) => api.delete(`/users/${id}/`),
}

// ---- generic helper for multipart create/update ------------------------
function formData(obj, fileFields = {}) {
  // fileFields: { fieldName: File|File[] }
  const fd = new FormData()
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    fd.append(k, v)
  }
  for (const [k, v] of Object.entries(fileFields)) {
    if (Array.isArray(v)) v.forEach((f) => fd.append(k, f))
    else if (v) fd.append(k, v)
  }
  return fd
}

// ---- projects -----------------------------------------------------------
export const projects = {
  list: (params) => list('/projects/', params),
  retrieve: (slugOrId) => one(`/projects/${slugOrId}/`),
  create: (data, files = {}) =>
    api
      .post('/projects/', files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  update: (id, data, files = {}) =>
    api
      .patch(`/projects/${id}/`, files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  destroy: (id) => api.delete(`/projects/${id}/`),
}

export const projectImages = {
  list: (params) => list('/project-images/', params),
  create: (projectId, file, caption = '', sorting_order = 0) => {
    const fd = new FormData()
    fd.append('project', projectId)
    fd.append('image', file)
    if (caption) fd.append('caption', caption)
    fd.append('sorting_order', sorting_order)
    return api
      .post('/project-images/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  destroy: (id) => api.delete(`/project-images/${id}/`),
  update: (id, data) => api.patch(`/project-images/${id}/`, data).then((r) => r.data),
}

// ---- drawings / photography --------------------------------------------
export const drawings = {
  list: (params) => list('/drawings/', params),
  retrieve: (id) => one(`/drawings/${id}/`),
  create: (data, files = {}) =>
    api
      .post('/drawings/', files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  update: (id, data, files = {}) =>
    api
      .patch(`/drawings/${id}/`, files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  destroy: (id) => api.delete(`/drawings/${id}/`),
}

export const photography = {
  list: (params) => list('/photography/', params),
  retrieve: (id) => one(`/photography/${id}/`),
  create: (data, files = {}) =>
    api
      .post('/photography/', files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  update: (id, data, files = {}) =>
    api
      .patch(`/photography/${id}/`, files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  destroy: (id) => api.delete(`/photography/${id}/`),
}

// ---- interior designs ---------------------------------------------------
export const interiorDesigns = {
  list: (params) => list('/interior-designs/', params),
  retrieve: (id) => one(`/interior-designs/${id}/`),
  create: (data, files = {}) =>
    api
      .post('/interior-designs/', files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  update: (id, data, files = {}) =>
    api
      .patch(`/interior-designs/${id}/`, files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  destroy: (id) => api.delete(`/interior-designs/${id}/`),
}

export const interiorDesignTypes = {
  list: (params) => list('/interior-design-types/', params),
  retrieve: (id) => one(`/interior-design-types/${id}/`),
  create: (body) => api.post('/interior-design-types/', body).then((r) => r.data),
  update: (id, body) => api.patch(`/interior-design-types/${id}/`, body).then((r) => r.data),
  destroy: (id) => api.delete(`/interior-design-types/${id}/`),
}

// ---- competitions -------------------------------------------------------
export const competitions = {
  list: (params) => list('/competitions/', params),
  retrieve: (id) => one(`/competitions/${id}/`),
  create: (data, files = {}) =>
    api
      .post('/competitions/', files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  update: (id, data, files = {}) =>
    api
      .patch(`/competitions/${id}/`, files.image ? formData(data, files) : data, files.image
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined)
      .then((r) => r.data),
  destroy: (id) => api.delete(`/competitions/${id}/`),
}

// ---- contacts -----------------------------------------------------------
export const contacts = {
  list: (params) => list('/contacts/', params),
  first: () => list('/contacts/').then((rows) => rows[0] || null),
  create: (body) => api.post('/contacts/', body).then((r) => r.data),
  update: (id, body) => api.patch(`/contacts/${id}/`, body).then((r) => r.data),
  destroy: (id) => api.delete(`/contacts/${id}/`),
}