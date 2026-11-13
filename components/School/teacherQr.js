/**
 * Build absolute public profile URL and QR image for a teacher.
 */

export function teacherPublicAbsoluteUrl(publicPathOrSlug) {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  if (!publicPathOrSlug) return ''
  if (String(publicPathOrSlug).startsWith('http')) return String(publicPathOrSlug)
  if (String(publicPathOrSlug).startsWith('/')) return `${origin}${publicPathOrSlug}`
  return `${origin}/school/teachers/${publicPathOrSlug}`
}

export function teacherQrImageUrl(absoluteUrl, size = 220) {
  if (!absoluteUrl) return ''
  const s = Math.min(Math.max(Number(size) || 220, 80), 500)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&margin=8&data=${encodeURIComponent(absoluteUrl)}`
}

export function downloadTeacherQr(absoluteUrl, filename = 'teacher-qr.png') {
  const src = teacherQrImageUrl(absoluteUrl, 400)
  if (!src || typeof document === 'undefined') return
  const a = document.createElement('a')
  a.href = src
  a.download = filename
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
