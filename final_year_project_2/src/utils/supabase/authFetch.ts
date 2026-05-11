// src/utils/supabase/authFetch.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function authFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/functions/v1/make-server-0fad513c${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    return response
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

export function getStoredSession() {
  const stored = localStorage.getItem('user-session')
  return stored ? JSON.parse(stored) : null
}

export function clearSession() {
  localStorage.removeItem('user-session')
  localStorage.removeItem('stress-management-chat-history')
  localStorage.removeItem('student-name')
}