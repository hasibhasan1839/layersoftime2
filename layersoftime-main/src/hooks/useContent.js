import { useEffect, useState } from 'react'
import { tokenStore } from '../admin/api.js'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchJson(path) {
  const headers = {}
  const token = tokenStore.get()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

const cache = {}

function useFetch(path, transform) {
  const [data, setData] = useState(() => cache[path] ?? null)
  const [loading, setLoading] = useState(!cache[path])

  useEffect(() => {
    if (cache[path]) {
      setData(cache[path])
      setLoading(false)
      return
    }
    let cancelled = false
    fetchJson(path)
      .then((raw) => {
        const list = Array.isArray(raw) ? raw : raw.results || []
        const transformed = list.map(transform)
        cache[path] = transformed
        if (!cancelled) {
          setData(transformed)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [path])

  return { data, loading }
}

const toProject = (p) => ({
  id: p.id,
  slug: p.slug,
  title: p.name,
  typology: p.project_type,
  storeys: p.storeys,
  status: p.status_display || p.status,
  summary: p.summary,
  description: p.description ? p.description.split('\n\n') : [],
  images: [
    p.image ? (p.image.startsWith('http') ? p.image : `${BASE}${p.image}`) : null,
    ...(p.images || []).map((img) =>
      img.image ? (img.image.startsWith('http') ? img.image : `${BASE}${img.image}`) : null
    ),
  ].filter(Boolean),
})

const toDrawing = (d) => ({
  id: d.id,
  title: d.name,
  medium: d.drawing_type_display || d.drawing_type,
  src: d.image ? (d.image.startsWith('http') ? d.image : `${BASE}${d.image}`) : '',
})

const toPhoto = (p) => ({
  id: p.id,
  title: p.name,
  tone: p.photography_type_display || p.photography_type,
  src: p.image ? (p.image.startsWith('http') ? p.image : `${BASE}${p.image}`) : '',
})

export function useProjects() {
  const { data, loading } = useFetch('/api/projects/', toProject)
  return { projects: data || [], loading }
}

export function useProject(slug) {
  const { projects, loading } = useProjects()
  const project = projects.find((p) => p.slug === slug) || null
  return { project, projects, loading }
}

export function useDrawings() {
  const { data, loading } = useFetch('/api/drawings/', toDrawing)
  return { drawings: data || [], loading }
}

export function usePhotographs() {
  const { data, loading } = useFetch('/api/photography/', toPhoto)
  return { photographs: data || [], loading }
}

const toInteriorDesign = (d) => ({
  id: d.id,
  title: d.name,
  description: d.description || '',
  designType: d.design_type,
  designTypeName: d.design_type_name || '',
  src: d.image ? (d.image.startsWith('http') ? d.image : `${BASE}${d.image}`) : '',
})

const toCompetition = (c) => ({
  id: c.id,
  title: c.name,
  description: c.description || '',
  projectDetail: c.project_detail || null,
  projectImage: c.project_detail?.image
    ? (c.project_detail.image.startsWith('http') ? c.project_detail.image : `${BASE}${c.project_detail.image}`)
    : '',
  src: c.image ? (c.image.startsWith('http') ? c.image : `${BASE}${c.image}`) : '',
  awards: (c.awards || []).map((a) => ({
    id: a.id,
    prize: a.prize,
    project: a.project ? {
      ...a.project,
      image: a.project.image ? (a.project.image.startsWith('http') ? a.project.image : `${BASE}${a.project.image}`) : '',
    } : null,
  })),
})

const toProfessional = (p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  designation: p.designation || '',
  photo: p.photo ? (p.photo.startsWith('http') ? p.photo : `${BASE}${p.photo}`) : '',
  tagline: p.tagline || '',
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
  expertise: (p.expertise || []).map((e) => e.label),
})

export function useInteriorDesigns() {
  const { data, loading } = useFetch('/api/interior-designs/', toInteriorDesign)
  return { interiorDesigns: data || [], loading }
}

export function useInteriorDesignTypes() {
  const { data, loading } = useFetch('/api/interior-design-types/', (t) => t)
  return { types: data || [], loading }
}

export function useCompetitions() {
  const { data, loading } = useFetch('/api/competitions/', toCompetition)
  return { competitions: data || [], loading }
}

export function useTeam() {
  const { data, loading } = useFetch('/api/professionals/', toProfessional)
  return { team: (data || []).filter((p) => p.isActive !== false), loading }
}

// Public form submit — deliberately unauthenticated (the endpoint allows anonymous POST).
export async function sendContactMessage({ name, email, phone, subject, message }) {
  const res = await fetch(`${BASE}/api/contact-messages/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone_no: phone || '',
      subject: subject || '',
      message,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fieldErrors = {}
    for (const [key, value] of Object.entries(data)) {
      const uiKey = key === 'phone_no' ? 'phone' : key
      fieldErrors[uiKey] = Array.isArray(value) ? value[0] : String(value)
    }
    const err = new Error(data.detail || 'Your message could not be sent. Please try again.')
    err.fields = fieldErrors
    throw err
  }
  return data
}

export function useContact() {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson('/api/contacts/')
      .then((raw) => {
        const list = Array.isArray(raw) ? raw : raw.results || []
        if (list.length) {
          setContact({
            email: list[0].email || '',
            phone: list[0].phone_no || '',
            location: list[0].address || '',
            mapLocation: list[0].map_location || '',
            linkedin: '',
            intro: '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { contact, loading }
}
