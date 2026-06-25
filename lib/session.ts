const KEY = "rp_session_user_id"

export function saveSession(userId: string) {
  try {
    localStorage.setItem(KEY, userId)
  } catch {}
}

export function loadSession(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
