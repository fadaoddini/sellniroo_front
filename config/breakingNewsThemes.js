/**
 * تم‌های ویجت خبر فوری — تم ۱ مدرسه، تم ۲ کاریابی، تم ۳ ربو + تم‌های سفارشی سایت
 */
import {
  DEFAULT_NAV_WIDGET_SETTINGS,
  NAV_SHARED_ROOT_KEYS,
  normalizeNavWidgetSettings,
} from '@/config/navWidgetSettings'
import BUILTIN_PRESETS from './breakingNewsThemes.presets.json'

export const BREAKING_NEWS_BUILTIN_THEMES = (BUILTIN_PRESETS || []).map((t) => ({
  ...t,
  builtIn: true,
}))

export function cloneThemeSettings(settings) {
  try {
    return JSON.parse(JSON.stringify(settings || {}))
  } catch {
    return settings && typeof settings === 'object' ? { ...settings } : {}
  }
}

/** تنظیمات ظاهری تم را روی ویجت اعمال می‌کند؛ منو/لوگو/نمایش دستگاه حفظ می‌شود */
export function applyBreakingNewsTheme(currentSettings, theme) {
  const cur =
    currentSettings && typeof currentSettings === 'object'
      ? currentSettings
      : {}
  const themeSettings = cloneThemeSettings(theme?.settings || {})
  const preserved = {}
  NAV_SHARED_ROOT_KEYS.forEach((k) => {
    if (cur[k] !== undefined) preserved[k] = cur[k]
  })
  if (cur.menu_slug !== undefined) preserved.menu_slug = cur.menu_slug

  return {
    ...DEFAULT_NAV_WIDGET_SETTINGS,
    ...themeSettings,
    ...preserved,
    theme_id: theme?.id || '',
    __replace_viewports: true,
    desktop: {
      ...(themeSettings.desktop && typeof themeSettings.desktop === 'object'
        ? themeSettings.desktop
        : {}),
    },
    mobile: {
      ...(themeSettings.mobile && typeof themeSettings.mobile === 'object'
        ? themeSettings.mobile
        : {}),
    },
  }
}

/** اسنپ‌شات ظاهر فعلی برای ذخیره به‌عنوان تم سفارشی */
export function snapshotBreakingNewsAsTheme(settings, { id, name } = {}) {
  const raw = settings && typeof settings === 'object' ? settings : {}
  const desktop =
    raw.desktop && typeof raw.desktop === 'object' ? { ...raw.desktop } : {}
  const mobile =
    raw.mobile && typeof raw.mobile === 'object' ? { ...raw.mobile } : {}
  // اگر هنوز فقط ریشه تخت بود، از نرمال‌سازی برای هر دو ویوپورت بگیر
  if (!Object.keys(desktop).length || !Object.keys(mobile).length) {
    const d = normalizeNavWidgetSettings(raw, { viewport: 'desktop' })
    const m = normalizeNavWidgetSettings(raw, { viewport: 'mobile' })
    const pick = (src) => {
      const out = { ...src }
      NAV_SHARED_ROOT_KEYS.forEach((k) => {
        delete out[k]
      })
      delete out.desktop
      delete out.mobile
      delete out.theme_id
      return out
    }
    return {
      id: id || `custom_${Date.now().toString(36)}`,
      name: String(name || 'تم سفارشی').trim() || 'تم سفارشی',
      builtIn: false,
      swatch: [
        d.color_bg || '#333333',
        d.color_accent || d.color_link || '#888888',
        d.color_text || '#ffffff',
      ],
      settings: {
        desktop: Object.keys(desktop).length ? desktop : pick(d),
        mobile: Object.keys(mobile).length ? mobile : pick(m),
      },
      created_at: new Date().toISOString(),
    }
  }
  return {
    id: id || `custom_${Date.now().toString(36)}`,
    name: String(name || 'تم سفارشی').trim() || 'تم سفارشی',
    builtIn: false,
    swatch: [
      desktop.color_bg || '#333333',
      desktop.color_accent || desktop.color_link || '#888888',
      desktop.color_text || '#ffffff',
    ],
    settings: { desktop, mobile },
    created_at: new Date().toISOString(),
  }
}

export function normalizeCustomBreakingNewsThemes(raw) {
  const list = Array.isArray(raw)
    ? raw
    : raw?.breaking_news && Array.isArray(raw.breaking_news)
      ? raw.breaking_news
      : []
  return list
    .map((t, i) => {
      if (!t || typeof t !== 'object') return null
      const id = String(t.id || `custom_${i}`).trim()
      const name = String(t.name || 'تم سفارشی').trim() || 'تم سفارشی'
      const settings =
        t.settings && typeof t.settings === 'object' ? t.settings : {}
      const swatch = Array.isArray(t.swatch)
        ? t.swatch.map((c) => String(c || '')).slice(0, 3)
        : []
      return {
        id,
        name,
        builtIn: false,
        swatch,
        settings: cloneThemeSettings(settings),
        created_at: t.created_at || null,
      }
    })
    .filter(Boolean)
}

export function listBreakingNewsThemes(customList = []) {
  const customs = normalizeCustomBreakingNewsThemes(customList)
  return [...BREAKING_NEWS_BUILTIN_THEMES, ...customs]
}

export function findBreakingNewsTheme(themeId, customList = []) {
  const id = String(themeId || '')
  if (!id) return null
  return listBreakingNewsThemes(customList).find((t) => t.id === id) || null
}
