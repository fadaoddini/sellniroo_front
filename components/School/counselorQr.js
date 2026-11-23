/**
 * URL مطلق پروفایل عمومی مشاور و QR
 */
import { teacherQrImageUrl } from '@/components/School/teacherQr'

export function counselorPublicAbsoluteUrl(publicPathOrSlug) {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  if (!publicPathOrSlug) return ''
  if (String(publicPathOrSlug).startsWith('http')) return String(publicPathOrSlug)
  if (String(publicPathOrSlug).startsWith('/')) return `${origin}${publicPathOrSlug}`
  return `${origin}/counselors/${publicPathOrSlug}`
}

export function counselorQrImageUrl(absoluteUrl, size = 220) {
  return teacherQrImageUrl(absoluteUrl, size)
}
