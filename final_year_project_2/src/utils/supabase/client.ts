// src/utils/supabase/client.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

/* =========================
   AUTH FETCH (Edge Function)
========================= */

export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${SUPABASE_URL}/functions/v1/${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

/* =========================
   SESSION HELPERS
========================= */

export function getStoredSession() {
  const stored = localStorage.getItem('user-session')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('user-session')
  localStorage.removeItem('student-name')
}