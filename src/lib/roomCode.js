export function generateRoomCode() {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export const normalizeCode = (s = '') => s.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 8)
export const isValidCode = (s = '') => /^[0-9A-F]{8}$/.test(s)
