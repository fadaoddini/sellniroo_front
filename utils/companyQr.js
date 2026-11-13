/**
 * QR اختصاصی شرکت — لینک عمومی /companies/[slug]
 * تصویر QR بدون وابستگی npm (سرویس عمومی QR).
 */

export function companyPublicPath(slug) {
  const s = String(slug || '').trim()
  if (!s) return ''
  return `/companies/${encodeURIComponent(s)}`
}

export function companyPublicUrl(slug, origin) {
  const path = companyPublicPath(slug)
  if (!path) return ''
  const base =
    String(origin || '').replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${path}`
}

export function companyQrImageUrl(url, size = 280) {
  const n = Math.max(120, Math.min(640, Number(size) || 280))
  return (
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=${n}x${n}&margin=14&ecc=M&data=${encodeURIComponent(url)}`
  )
}

export async function downloadCompanyQrPng(url, filename = 'company-qr.png') {
  const src = companyQrImageUrl(url, 480)
  const res = await fetch(src)
  if (!res.ok) throw new Error('دانلود QR ناموفق بود')
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
