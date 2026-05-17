const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/api/courses`)

  if (!response.ok) {
    throw new Error('Unable to fetch courses')
  }

  return response.json()
}