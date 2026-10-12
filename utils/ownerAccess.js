// utils/ownerAccess.js — دسترسی اختصاصی طراح/برنامه‌نویس پلتفرم

export const OWNER_PHONES = ['09135004344', '09152913121']

export const OWNER_PROFILE = {
  name: 'محمد سعید فداالدینی',
  role: 'طراح و برنامه‌نویس پلتفرم',
  site: 'saeedev.com',
  siteUrl: 'https://saeedev.com',
}

/** نرمال‌سازی شماره موبایل ایران به فرم 09xxxxxxxxx */
export function normalizeIranMobile(raw) {
  let s = String(raw || '').replace(/\D/g, '')
  if (s.startsWith('98') && s.length >= 12) s = `0${s.slice(2)}`
  if (s.startsWith('9') && s.length === 10) s = `0${s}`
  return s
}

export function isPlatformOwner(userOrMobile) {
  const mobile =
    typeof userOrMobile === 'string' || typeof userOrMobile === 'number'
      ? userOrMobile
      : userOrMobile?.mobile
  const normalized = normalizeIranMobile(mobile)
  if (!normalized || normalized.length !== 11) return false
  return OWNER_PHONES.includes(normalized)
}
