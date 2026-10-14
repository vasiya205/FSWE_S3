const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function fetchTutors(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, value)
  })
  const response = await fetch(`${API_BASE}/api/tutors/search?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Unable to load tutors')
  }
  return response.json()
}

export async function fetchTutorById(id) {
  const response = await fetch(`${API_BASE}/api/tutors/${id}`)
  if (!response.ok) {
    throw new Error('Unable to load tutor detail')
  }
  return response.json()
}

export async function fetchProtectedJson(url, token, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    throw error
  }
  return response.json().catch(() => null)
}
