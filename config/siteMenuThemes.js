/**
 * تم‌های ویجت منو (site_menu) — تم ۱ مدرسه، تم ۲ کاریابی، تم ۳ ربو + سفارشی
 */
import {
  DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS,
  SITE_TOP_NAV_SHARED_ROOT_KEYS,
  normalizeSiteTopNavSettings,
} from '@/config/siteTopNavWidgetSettings'
import BUILTIN_PRESETS from './siteMenuThemes.presets.json'

export const SITE_MENU_BUILTIN_THEMES = (BUILTIN_PRESETS || []).map((t) => ({
  ...t,
  builtIn: true,
}))

export function cloneMenuThemeSettings(settings) {
  try {
    return JSON.parse(JSON.stringify(settings || {}))
  } catch {
    return settings && typeof settings === 'object' ? { ...settings } : {}
  }
}

/** اعمال تم ظاهر منو — لینک‌ها / CTA / آیتم موبایل حفظ می‌شود */
export function applySiteMenuTheme(currentSettings, theme) {
  const cur =
    currentSettings && typeof currentSettings === 'object'
      ? currentSettings
      : {}
  const themeSettings = cloneMenuThemeSettings(theme?.settings || {})
  const preserved = {}
  SITE_TOP_NAV_SHARED_ROOT_KEYS.forEach((k) => {
    if (cur[k] !== undefined) preserved[k] = cur[k]
  })

  return {
    ...DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS,
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

export function snapshotSiteMenuAsTheme(settings, { id, name } = {}) {
  const raw = settings && typeof settings === 'object' ? settings : {}
  let desktop =
    raw.desktop && typeof raw.desktop === 'object' ? { ...raw.desktop } : {}
  let mobile =
    raw.mobile && typeof raw.mobile === 'object' ? { ...raw.mobile } : {}

  if (!Object.keys(desktop).length || !Object.keys(mobile).length) {
    const d = normalizeSiteTopNavSettings(raw, { viewport: 'desktop' })
    const m = normalizeSiteTopNavSettings(raw, { viewport: 'mobile' })
    const pick = (src) => {
      const out = { ...src }
      SITE_TOP_NAV_SHARED_ROOT_KEYS.forEach((k) => {
        delete out[k]
      })
      delete out.desktop
      delete out.mobile
      delete out.theme_id
      return out
    }
    if (!Object.keys(desktop).length) desktop = pick(d)
    if (!Object.keys(mobile).length) mobile = pick(m)
  }

  return {
    id: id || `menu_custom_${Date.now().toString(36)}`,
    name: String(name || 'تم منو').trim() || 'تم منو',
    builtIn: false,
    swatch: [
      desktop.color_bg || '#333333',
      desktop.color_accent || desktop.color_hover || '#888888',
      desktop.color_text || '#ffffff',
    ],
    settings: { desktop, mobile },
    created_at: new Date().toISOString(),
  }
}

export function normalizeCustomSiteMenuThemes(raw) {
  const list = Array.isArray(raw)
    ? raw
    : raw?.site_menu && Array.isArray(raw.site_menu)
      ? raw.site_menu
      : []
  return list
    .map((t, i) => {
      if (!t || typeof t !== 'object') return null
      const id = String(t.id || `menu_custom_${i}`).trim()
      const name = String(t.name || 'تم منو').trim() || 'تم منو'
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
        settings: cloneMenuThemeSettings(settings),
        created_at: t.created_at || null,
      }
    })
    .filter(Boolean)
}

export function listSiteMenuThemes(customList = []) {
  return [
    ...SITE_MENU_BUILTIN_THEMES,
    ...normalizeCustomSiteMenuThemes(customList),
  ]
}
