export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
export const SESSION_TIMEOUT_MS = 5 * 60 * 1000
export const LOCKOUT_MS = 15 * 60 * 1000
export const MAX_LOGIN_ATTEMPTS = 3

export function cleanRut(rut: string) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

export function formatRut(raw: string) {
  const clean = cleanRut(raw)
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withDots}-${dv}`
}

export function isValidRut(rut: string) {
  const clean = cleanRut(rut)
  if (clean.length < 8) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0
  let factor = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const res = 11 - (sum % 11)
  const expected = res === 11 ? '0' : res === 10 ? 'K' : String(res)
  return dv === expected
}

export function isValidPhone(phone: string) {
  return /^\+56\s?9\s?\d{4}\s?\d{4}$/.test(phone.trim())
}

export function isValidEmail(email: string) {
  return /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email.trim())
}

const DANGEROUS_PATTERNS = [
  /<\s*\/?\s*script/i,
  /<[^>]+>/,
  /javascript:/i,
  /on\w+\s*=/i,
  /(\b(select|insert|update|delete|drop|union|alter)\b\s+.*\b(from|into|table|set|where)\b)/i,
  /('|")\s*(or|and)\s*('|"|\d)\s*=?/i,
  /;\s*--/,
]

export function hasInjection(value: string) {
  return DANGEROUS_PATTERNS.some((p) => p.test(value))
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function validateFile(name: string, sizeBytes: number) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(ext) || sizeBytes > MAX_FILE_BYTES) {
    return 'Formato o tamaño no permitido'
  }
  return null
}

export function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function nowIso() {
  return new Date().toISOString()
}
