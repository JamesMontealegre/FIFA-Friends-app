// Excludes I, O, 0, 1 to avoid visual ambiguity when sharing codes
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateInviteCode(length = 6): string {
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARS[array[i] % CHARS.length]
  }
  return code
}
