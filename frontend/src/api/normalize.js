const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const mediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

// "line\n\nline" → ["line", "line"]
export const splitParagraphs = (text) =>
  (text || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)

// --- project ----------------------------------------------------------
export function normalizeProject(p) {
  if (!p) return null
  const images = (p.images || []).map((im) => ({
    id: im.id,
    src: mediaUrl(im.image),
    caption: im.caption,
    sorting_order: im.sorting_order,
  }))
  const cover = mediaUrl(p.image) || images[0]?.src || ''
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    summary: p.summary,
    description: splitParagraphs(p.description),
    typology: p.project_type,
    storeys: p.storeys,
    status: p.status_display || p.status,
    statusKey: p.status,
    cover,
    images,
    sorting_order: p.sorting_order,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export function normalizeDrawing(d) {
  return {
    id: d.id,
    title: d.name,
    src: mediaUrl(d.image),
    medium: d.drawing_type_display,
    mediumKey: d.drawing_type,
    sorting_order: d.sorting_order,
  }
}

export function normalizePhotograph(p) {
  return {
    id: p.id,
    title: p.name,
    src: mediaUrl(p.image),
    tone: p.photography_type_display,
    toneKey: p.photography_type,
    sorting_order: p.sorting_order,
  }
}

export function normalizeUser(u) {
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    phoneNo: u.phone_no,
    userType: u.user_type,
    isActive: u.is_active,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  }
}