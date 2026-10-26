// services/corporateAppearance.js — ظاهر سیستم شرکتی
import Config from '@/config/config'
import { getFullImageUrl } from '@/utils/imageUrl'

export const MOBILE_STYLES = [
  {
    key: 'classic',
    name_fa: 'کلاسیک',
    name_en: 'Classic',
    desc_fa: 'آیکون و متن ساده در یک ردیف',
    desc_en: 'Simple icon and label row',
  },
  {
    key: 'center_circle',
    name_fa: 'دایره وسط',
    name_en: 'Center circle',
    desc_fa: 'آیتم میانی به‌صورت دایره برجسته',
    desc_en: 'Middle item as elevated circle',
  },
  {
    key: 'rounded_square',
    name_fa: 'مربع گرد',
    name_en: 'Rounded square',
    desc_fa: 'آیکون‌ها داخل کادر با گوشه گرد',
    desc_en: 'Icons inside rounded square tiles',
  },
  {
    key: 'glow_dock',
    name_fa: 'داک درخشان',
    name_en: 'Glow dock',
    desc_fa: 'نوار شناور با افکت نور روی آیتم فعال',
    desc_en: 'Floating bar with glow on active item',
  },
]

export const DEFAULT_CORPORATE_APPEARANCE = {
  logo_display: '/images/logo.png',
  logo_url: '/images/logo.png',
  header_bg: '#000000',
  header_text: '#c8c8c8',
  header_icon: '#ffffff',
  header_icon_hover: '#ffffff',
  header_hover: '#ffffff',
  mobile_bg: '#000000',
  mobile_text: '#8c8c8c',
  mobile_icon: '#8c8c8c',
  mobile_active: '#ffffff',
  mobile_style: 'classic',
  mobile_center_item_id: null,
}

const resolveAsset = (src) => {
  if (!src || typeof src !== 'string') return null
  if (
    src.startsWith('/images/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src
  }
  return getFullImageUrl(src)
}

export const normalizeCorporateAppearance = (raw = {}) => {
  const data = { ...DEFAULT_CORPORATE_APPEARANCE, ...raw }
  data.logo_display =
    resolveAsset(raw.logo_display || raw.logo_url || raw.logo) ||
    DEFAULT_CORPORATE_APPEARANCE.logo_display
  const valid = new Set(MOBILE_STYLES.map((s) => s.key))
  if (!valid.has(data.mobile_style)) {
    data.mobile_style = DEFAULT_CORPORATE_APPEARANCE.mobile_style
  }
  if (
    data.mobile_center_item_id === '' ||
    data.mobile_center_item_id === undefined
  ) {
    data.mobile_center_item_id = null
  } else if (data.mobile_center_item_id != null) {
    const n = Number(data.mobile_center_item_id)
    data.mobile_center_item_id = Number.isFinite(n) && n > 0 ? n : null
  }
  if (!data.header_icon_hover) {
    data.header_icon_hover =
      raw.header_icon_hover || data.header_hover || data.header_icon || '#ffffff'
  }
  return data
}

export function corporateHeaderStyle(appearance) {
  const a = normalizeCorporateAppearance(appearance)
  return {
    '--corp-header-bg': a.header_bg,
    '--corp-header-text': a.header_text,
    '--corp-header-icon': a.header_icon,
    '--corp-header-icon-hover': a.header_icon_hover || a.header_hover,
    '--corp-header-hover': a.header_hover,
  }
}

export function corporateMobileStyle(appearance) {
  const a = normalizeCorporateAppearance(appearance)
  return {
    '--corp-mobile-bg': a.mobile_bg,
    '--corp-mobile-text': a.mobile_text,
    '--corp-mobile-icon': a.mobile_icon,
    '--corp-mobile-active': a.mobile_active,
  }
}

let cache = null
let cacheAt = 0
let inflight = null
const TTL_MS = 30_000

export const clearCorporateAppearanceCache = () => {
  cache = null
  cacheAt = 0
  inflight = null
}

/** ذخیره سریع رنگ‌ها / ظاهر (بدون فایل لوگو) */
export async function saveCorporateAppearanceQuick(patch, authHeaders = {}) {
  const keys = [
    'logo_url',
    'header_bg', 'header_text', 'header_icon', 'header_icon_hover', 'header_hover',
    'mobile_bg', 'mobile_text', 'mobile_icon', 'mobile_active', 'mobile_style',
    'mobile_center_item_id',
  ]
  const body = {}
  keys.forEach((k) => {
    if (patch[k] === undefined) return
    if (k === 'mobile_center_item_id') {
      body[k] = patch[k] === '' || patch[k] == null ? null : patch[k]
      return
    }
    if (patch[k] !== null) body[k] = patch[k]
  })
  const url = Config.endpoints.news.corporateAppearance.update()
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authHeaders || {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `ذخیره ظاهر ناموفق (${res.status})`
    try {
      const j = await res.json()
      msg = j?.message || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  const data = normalizeCorporateAppearance(json?.data || json)
  cache = data
  cacheAt = Date.now()
  return data
}

export async function fetchCorporateAppearance({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) return cache
  if (!force && inflight) return inflight

  inflight = (async () => {
    try {
      const url = Config.endpoints.news.corporateAppearance.get()
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`corporate-appearance ${res.status}`)
      const json = await res.json()
      const data = normalizeCorporateAppearance(json?.data || json)
      cache = data
      cacheAt = Date.now()
      return data
    } catch (err) {
      console.error('fetchCorporateAppearance:', err)
      return cache || DEFAULT_CORPORATE_APPEARANCE
    } finally {
      inflight = null
    }
  })()

  return inflight
}
