import { safeJson } from '../utils/safeJson'
import { getApiBaseUrl } from '../utils/apiBase'

const API_BASE_URL = getApiBaseUrl()

export async function fetchCourses() {
  const url = `${API_BASE_URL}/courses`
  console.log('fetchCourses -> URL:', url)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch courses')
  }

  return safeJson(response)
}