import { ApiError } from './errors.js'

export { ApiError }

export const USE_MOCK = false

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// --- JWT token storage ---
const TOKEN_KEY = 'lot_access'
const REFRESH_KEY = 'lot_refresh'

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t) } catch {} },
  getRefresh: () => { try { return localStorage.getItem(REFRESH_KEY) } catch { return null } },
  setRefresh: (t) => { try { localStorage.setItem(REFRESH_KEY, t) } catch {} },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY) } catch {} },
}

async function request(method, path, body, isForm = false) {
  const headers = {}
  const token = tokenStore.get()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let reqBody
  if (body && isForm) {
    reqBody = body // FormData — no content-type header (browser sets it with boundary)
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    reqBody = JSON.stringify(body)
  }

  let res = await fetch(`${BASE}${path}`, { method, headers, body: reqBody })

  // Try to refresh once on 401
  if (res.status === 401 && tokenStore.getRefresh()) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStore.get()}`
      res = await fetch(`${BASE}${path}`, { method, headers, body: reqBody })
    }
  }

  let data = {}
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data.detail || data.non_field_errors?.[0] || data.error || 'Request failed'
    throw new ApiError(msg, res.status, data)
  }
  return data
}

async function tryRefresh() {
  const refresh = tokenStore.getRefresh()
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) { tokenStore.clear(); return false }
    const data = await res.json()
    tokenStore.set(data.access)
    return true
  } catch {
    tokenStore.clear()
    return false
  }
}

// --- Transform Django shapes to what the frontend expects ---
const resolveImg = (url) => url ? (url.startsWith('http') ? url : `${BASE}${url}`) : ''

const toProject = (p) => ({
  id: p.id,
  slug: p.slug,
  title: p.name,
  typology: p.project_type,
  storeys: p.storeys,
  status: p.status_display || p.status,
  summary: p.summary,
  description: p.description ? p.description.split('\n\n') : [],
  coverImage: resolveImg(p.image),
  galleryImages: (p.images || []).map((img) => ({
    id: img.id,
    url: resolveImg(img.image),
    caption: img.caption || '',
  })),
  images: [
    p.image ? resolveImg(p.image) : null,
    ...(p.images || []).map((img) => resolveImg(img.image)),
  ].filter(Boolean),
  sortOrder: p.sorting_order,
  inCompetition: p.in_competition,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
})

const toDrawing = (d) => ({
  id: d.id,
  title: d.name,
  medium: d.drawing_type_display || d.drawing_type,
  src: d.image ? (d.image.startsWith('http') ? d.image : `${BASE}${d.image}`) : '',
  sortOrder: d.sorting_order,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
})

const toPhoto = (p) => ({
  id: p.id,
  title: p.name,
  tone: p.photography_type_display || p.photography_type,
  src: p.image ? (p.image.startsWith('http') ? p.image : `${BASE}${p.image}`) : '',
  sortOrder: p.sorting_order,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
})

const toInteriorDesign = (d) => ({
  id: d.id,
  title: d.name,
  description: d.description || '',
  designType: d.design_type,
  designTypeName: d.design_type_name || '',
  src: resolveImg(d.image),
  sortOrder: d.sorting_order,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
})

const toCompetition = (c) => ({
  id: c.id,
  title: c.name,
  description: c.description || '',
  projectId: c.project,
  projectDetail: c.project_detail || null,
  projectName: c.project_detail?.name || '',
  projectImage: c.project_detail?.image ? resolveImg(c.project_detail.image) : '',
  src: resolveImg(c.image),
  awards: (c.awards || []).map((a) => ({
    id: a.id,
    prize: a.prize,
    project: a.project,
  })),
  sortOrder: c.sorting_order,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
})

const toProfessional = (p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  title: p.name,
  designation: p.designation || '',
  photo: resolveImg(p.photo),
  tagline: p.tagline || '',
  bio: p.bio || '',
  bioParagraphs: p.bio ? p.bio.split('\n\n').filter(Boolean) : [],
  qualifications: p.qualifications || '',
  specialization: p.specialization || '',
  experience: p.experience || '',
  location: p.location || '',
  email: p.email || '',
  phoneNo: p.phone_no || '',
  linkedin: p.linkedin || '',
  website: p.website || '',
  isActive: p.is_active,
  expertise: (p.expertise || []).map((e) => ({ id: e.id, label: e.label })),
  sortOrder: p.sorting_order,
})

const toContactMessage = (m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone_no || '',
  subject: m.subject || '',
  message: m.message,
  isRead: m.is_read,
  createdAt: m.created_at,
})

const toContact = (c) => ({
  email: c.email || '',
  phone: c.phone_no || '',
  location: c.address || '',
  mapLocation: c.map_location || '',
  linkedin: '',
  intro: '',
})

const toUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  name: u.name || u.first_name || u.username,
  phoneNo: u.phone_no || '',
  userType: (u.is_staff || u.is_superuser || u.user_type === 'admin') ? 'admin' : (u.user_type || 'editor'),
  createdAt: u.created_at || u.date_joined,
  updatedAt: u.updated_at || u.date_joined,
})

// --- Drawing type reverse map (display → slug) ---
const DRAWING_TYPE_MAP = {
  'Watercolour': 'watercolour',
  'Ink & wash': 'ink_wash',
  'Pen studies': 'pen_studies',
  'Concept': 'concept',
}
const PHOTO_TYPE_MAP = {
  'Colour': 'colour',
  'Monochrome': 'monochrome',
}
const PROJECT_STATUS_MAP = {
  'Concept': 'concept',
  'Design proposal': 'design_proposal',
  'Under construction': 'under_construction',
  'Built': 'completed',
}

function buildProfessionalForm(b) {
  const form = new FormData()
  form.append('name', b.name || '')
  form.append('designation', b.designation || '')
  form.append('tagline', b.tagline || '')
  form.append('bio', b.bio || '')
  form.append('qualifications', b.qualifications || '')
  form.append('specialization', b.specialization || '')
  form.append('experience', b.experience || '')
  form.append('location', b.location || '')
  form.append('email', b.email || '')
  form.append('phone_no', b.phoneNo || '')
  form.append('linkedin', b.linkedin || '')
  form.append('website', b.website || '')
  form.append('is_active', b.isActive === false ? 'false' : 'true')
  form.append('sorting_order', b.sortOrder || 0)
  if (b.photoFile instanceof File) form.append('photo', b.photoFile)
  return form
}

// Expertise bullets are a separate table; diff the submitted list against what the server has.
async function syncExpertise(professionalId, labels, existing) {
  const wanted = labels.map((l) => String(l).trim()).filter(Boolean)
  const keep = new Set()
  for (const row of existing) {
    if (wanted.includes(row.label)) keep.add(row.label)
    else await request('DELETE', `/api/professionals/${professionalId}/expertise/${row.id}/`)
  }
  let order = 0
  for (const label of wanted) {
    order += 1
    if (keep.has(label)) continue
    await request('POST', `/api/professionals/${professionalId}/expertise/`, { label, sorting_order: order })
  }
}

export const api = {
  // --- Auth ---
  status: async () => {
    // Django has no "needsSetup" endpoint; always return false (users exist via Django admin)
    return { needsSetup: false }
  },
  setup: async () => { throw new ApiError('Setup not supported — create users via Django admin', 403) },

  login: async ({ login, password }) => {
    const data = await request('POST', '/api/auth/token/', { username: login, password })
    tokenStore.set(data.access)
    tokenStore.setRefresh(data.refresh)
    // Fetch current user info
    const me = await request('GET', '/api/auth/me/')
    return { user: toUser(me) }
  },

  logout: () => {
    tokenStore.clear()
    return Promise.resolve({ ok: true })
  },

  me: async () => {
    const me = await request('GET', '/api/auth/me/')
    return { user: toUser(me) }
  },

  changePassword: (b) => request('POST', '/api/auth/change-password/', b),

  // --- Users ---
  listUsers: async () => {
    const data = await request('GET', '/api/users/')
    return { users: (Array.isArray(data) ? data : data.results || []).map(toUser) }
  },
  createUser: async (b) => {
    const data = await request('POST', '/api/users/', {
      username: b.username, email: b.email, password: b.password,
      name: b.name, phone_no: b.phoneNo, user_type: b.userType,
    })
    return { user: toUser(data) }
  },
  updateUser: async (id, b) => {
    const data = await request('PUT', `/api/users/${id}/`, {
      username: b.username, email: b.email,
      name: b.name, phone_no: b.phoneNo, user_type: b.userType,
      ...(b.password ? { password: b.password } : {}),
    })
    return { user: toUser(data) }
  },
  deleteUser: (id) => request('DELETE', `/api/users/${id}/`),

  // --- Projects ---
  listProjects: async () => {
    const data = await request('GET', '/api/projects/')
    return { projects: (Array.isArray(data) ? data : data.results || []).map(toProject) }
  },
  createProject: async (b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('project_type', b.typology || '')
    form.append('storeys', b.storeys || '')
    form.append('status', PROJECT_STATUS_MAP[b.status] || 'concept')
    form.append('summary', b.summary || '')
    form.append('description', b.description || '')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.coverFile instanceof File) form.append('image', b.coverFile)
    const data = await request('POST', '/api/projects/', form, true)
    // Upload gallery images
    if (b.galleryFiles?.length) {
      for (const file of b.galleryFiles) {
        const imgForm = new FormData()
        imgForm.append('image', file)
        imgForm.append('sorting_order', 0)
        await request('POST', `/api/projects/${data.id}/images/`, imgForm, true)
      }
      // Re-fetch to get images
      const updated = await request('GET', `/api/projects/${data.id}/`)
      return { project: toProject(updated) }
    }
    return { project: toProject(data) }
  },
  updateProject: async (id, b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('project_type', b.typology || '')
    form.append('storeys', b.storeys || '')
    form.append('status', PROJECT_STATUS_MAP[b.status] || 'concept')
    form.append('summary', b.summary || '')
    form.append('description', b.description || '')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.coverFile instanceof File) form.append('image', b.coverFile)
    const method = b.coverFile instanceof File ? 'PUT' : 'PATCH'
    const data = await request(method, `/api/projects/${id}/`, form, true)
    // Upload new gallery images
    if (b.galleryFiles?.length) {
      for (const file of b.galleryFiles) {
        const imgForm = new FormData()
        imgForm.append('image', file)
        imgForm.append('sorting_order', 0)
        await request('POST', `/api/projects/${id}/images/`, imgForm, true)
      }
    }
    // Delete removed gallery images
    if (b.deleteImageIds?.length) {
      for (const imgId of b.deleteImageIds) {
        await request('DELETE', `/api/projects/${id}/images/${imgId}/`)
      }
    }
    // Re-fetch to get updated images
    const updated = await request('GET', `/api/projects/${id}/`)
    return { project: toProject(updated) }
  },
  deleteProject: (id) => request('DELETE', `/api/projects/${id}/`),

  // --- Drawings ---
  listDrawings: async () => {
    const data = await request('GET', '/api/drawings/')
    return { drawings: (Array.isArray(data) ? data : data.results || []).map(toDrawing) }
  },
  createDrawing: async (b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('drawing_type', DRAWING_TYPE_MAP[b.medium] || b.medium || 'concept')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const data = await request('POST', '/api/drawings/', form, true)
    return { drawing: toDrawing(data) }
  },
  updateDrawing: async (id, b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('drawing_type', DRAWING_TYPE_MAP[b.medium] || b.medium || 'concept')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const method = b.imageFile instanceof File ? 'PUT' : 'PATCH'
    const data = await request(method, `/api/drawings/${id}/`, form, true)
    return { drawing: toDrawing(data) }
  },
  deleteDrawing: (id) => request('DELETE', `/api/drawings/${id}/`),

  // --- Photography ---
  listPhotography: async () => {
    const data = await request('GET', '/api/photography/')
    return { photographs: (Array.isArray(data) ? data : data.results || []).map(toPhoto) }
  },
  createPhoto: async (b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('photography_type', PHOTO_TYPE_MAP[b.tone] || b.tone || 'colour')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const data = await request('POST', '/api/photography/', form, true)
    return { photograph: toPhoto(data) }
  },
  updatePhoto: async (id, b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('photography_type', PHOTO_TYPE_MAP[b.tone] || b.tone || 'colour')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const method = b.imageFile instanceof File ? 'PUT' : 'PATCH'
    const data = await request(method, `/api/photography/${id}/`, form, true)
    return { photograph: toPhoto(data) }
  },
  deletePhoto: (id) => request('DELETE', `/api/photography/${id}/`),

  // --- Interior Designs ---
  listInteriorDesignTypes: async () => {
    const data = await request('GET', '/api/interior-design-types/')
    const list = Array.isArray(data) ? data : data.results || []
    return { types: list }
  },
  createInteriorDesignType: async (b) => {
    const data = await request('POST', '/api/interior-design-types/', { name: b.name, status: b.status !== false })
    return { type: data }
  },
  updateInteriorDesignType: async (id, b) => {
    const data = await request('PUT', `/api/interior-design-types/${id}/`, { name: b.name, status: b.status !== false })
    return { type: data }
  },
  deleteInteriorDesignType: (id) => request('DELETE', `/api/interior-design-types/${id}/`),

  listInteriorDesigns: async () => {
    const data = await request('GET', '/api/interior-designs/')
    const list = Array.isArray(data) ? data : data.results || []
    return { interiorDesigns: list.map(toInteriorDesign) }
  },
  createInteriorDesign: async (b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('description', b.description || '')
    form.append('design_type', b.designType || '')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const data = await request('POST', '/api/interior-designs/', form, true)
    return { interiorDesign: toInteriorDesign(data) }
  },
  updateInteriorDesign: async (id, b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('description', b.description || '')
    form.append('design_type', b.designType || '')
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const method = b.imageFile instanceof File ? 'PUT' : 'PATCH'
    const data = await request(method, `/api/interior-designs/${id}/`, form, true)
    return { interiorDesign: toInteriorDesign(data) }
  },
  deleteInteriorDesign: (id) => request('DELETE', `/api/interior-designs/${id}/`),

  // --- Competitions ---
  listCompetitions: async () => {
    const data = await request('GET', '/api/competitions/')
    const list = Array.isArray(data) ? data : data.results || []
    return { competitions: list.map(toCompetition) }
  },
  createCompetition: async (b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('description', b.description || '')
    if (b.projectId) form.append('project', b.projectId)
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const data = await request('POST', '/api/competitions/', form, true)
    return { competition: toCompetition(data) }
  },
  updateCompetition: async (id, b) => {
    const form = new FormData()
    form.append('name', b.title || '')
    form.append('description', b.description || '')
    if (b.projectId) form.append('project', b.projectId)
    form.append('sorting_order', b.sortOrder || 0)
    if (b.imageFile instanceof File) form.append('image', b.imageFile)
    const method = b.imageFile instanceof File ? 'PUT' : 'PATCH'
    const data = await request(method, `/api/competitions/${id}/`, form, true)
    return { competition: toCompetition(data) }
  },
  deleteCompetition: (id) => request('DELETE', `/api/competitions/${id}/`),

  // --- Professionals ---
  listProfessionals: async () => {
    const data = await request('GET', '/api/professionals/')
    const list = Array.isArray(data) ? data : data.results || []
    return { professionals: list.map(toProfessional) }
  },
  createProfessional: async (b) => {
    const form = buildProfessionalForm(b)
    const data = await request('POST', '/api/professionals/', form, true)
    await syncExpertise(data.id, b.expertise || [], [])
    const fresh = await request('GET', `/api/professionals/${data.id}/`)
    return { professional: toProfessional(fresh) }
  },
  updateProfessional: async (id, b) => {
    const form = buildProfessionalForm(b)
    const method = b.photoFile instanceof File ? 'PUT' : 'PATCH'
    await request(method, `/api/professionals/${id}/`, form, true)
    await syncExpertise(id, b.expertise || [], b.existingExpertise || [])
    const fresh = await request('GET', `/api/professionals/${id}/`)
    return { professional: toProfessional(fresh) }
  },
  deleteProfessional: (id) => request('DELETE', `/api/professionals/${id}/`),

  // --- Contact messages (from the public form) ---
  listContactMessages: async () => {
    const data = await request('GET', '/api/contact-messages/')
    const list = Array.isArray(data) ? data : data.results || []
    return { messages: list.map(toContactMessage) }
  },
  markContactMessageRead: async (id, isRead) => {
    const data = await request('PATCH', `/api/contact-messages/${id}/`, { is_read: isRead })
    return { message: toContactMessage(data) }
  },
  deleteContactMessage: (id) => request('DELETE', `/api/contact-messages/${id}/`),

  // --- Contact ---
  getContact: async () => {
    const data = await request('GET', '/api/contacts/')
    const list = Array.isArray(data) ? data : data.results || []
    return { contact: list.length ? toContact(list[0]) : { email: '', phone: '', location: '', mapLocation: '', linkedin: '', intro: '' } }
  },
  updateContact: async (b) => {
    const data = await request('GET', '/api/contacts/')
    const list = Array.isArray(data) ? data : data.results || []
    const payload = { address: b.location, email: b.email, phone_no: b.phone, map_location: b.mapLocation || '' }
    if (list.length) {
      await request('PUT', `/api/contacts/${list[0].id}/`, payload)
    } else {
      await request('POST', '/api/contacts/', payload)
    }
    return { ok: true }
  },
}
