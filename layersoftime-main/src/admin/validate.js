// Client-side validation (V). The server validates again — never trust the browser alone.

export function passwordError(p) {
  if (p.length < 8) return 'Password must be at least 8 characters'
  if (p.length > 128) return 'Password is too long'
  if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return 'Password needs at least one letter and one number'
  return ''
}

export function validateUser(v, { passwordRequired }) {
  const e = {}
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(v.username.trim())) e.username = 'Username must be 3–30 characters: letters, numbers, . _ -'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address'
  if (v.name.trim().length < 2 || v.name.trim().length > 80) e.name = 'Name must be 2–80 characters'
  if (v.phoneNo.trim() && !/^\+?[0-9\s-]{7,20}$/.test(v.phoneNo.trim())) e.phoneNo = 'Enter a valid phone number'
  if (passwordRequired || v.password) {
    const pe = passwordError(v.password)
    if (pe) e.password = pe
  }
  return e
}
