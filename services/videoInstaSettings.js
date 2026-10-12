import axios from 'axios'
import Config from '@/config/config'

export const DEFAULT_VIDEO_INSTA_SETTINGS = {
  show_desktop_section: true,
  show_mobile_rail: true,
  show_title: true,
  show_subtitle: true,
  show_views: true,
  show_add_button: true,
  title_fa: 'آرشیو ویدیوها',
  title_en: 'Video Archive',
  subtitle_fa: 'مجموعه‌ای از ویدیوهای منتخب و پروژه‌های ما',
  subtitle_en: 'A collection of our selected videos and projects',
  accent_color: '#be123c',
  accent_secondary: '#f97316',
  section_bg_from: '#1a1a2e',
  section_bg_to: '#0a0a1a',
  title_color: '',
  ring_color_1: '#f09433',
  ring_color_2: '#dc2743',
  ring_color_3: '#bc1888',
  rail_bg: '#0a0a0c',
}

let cache = null
let cacheAt = 0
const TTL = 30_000

export function clearVideoInstaSettingsCache() {
  cache = null
  cacheAt = 0
}

export function normalizeVideoInstaSettings(raw = {}) {
  return {
    ...DEFAULT_VIDEO_INSTA_SETTINGS,
    ...raw,
    show_desktop_section: raw.show_desktop_section !== false,
    show_mobile_rail: raw.show_mobile_rail !== false,
    show_title: raw.show_title !== false,
    show_subtitle: raw.show_subtitle !== false,
    show_views: raw.show_views !== false,
    show_add_button: raw.show_add_button !== false,
  }
}

export async function fetchVideoInstaSettings({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL) return cache
  try {
    const res = await axios.get(Config.endpoints.videoArchive.settings())
    const data = normalizeVideoInstaSettings(res.data?.data || res.data || {})
    cache = data
    cacheAt = now
    return data
  } catch {
    return normalizeVideoInstaSettings(cache || DEFAULT_VIDEO_INSTA_SETTINGS)
  }
}

export async function updateVideoInstaSettings(payload, headers = {}) {
  const res = await axios.patch(
    Config.endpoints.videoArchive.settings(),
    payload,
    { headers }
  )
  const data = normalizeVideoInstaSettings(res.data?.data || res.data || {})
  cache = data
  cacheAt = Date.now()
  return data
}

export function buildVideoInstaCssVars(settings) {
  const s = normalizeVideoInstaSettings(settings)
  return {
    '--va-accent': s.accent_color || DEFAULT_VIDEO_INSTA_SETTINGS.accent_color,
    '--va-accent-2': s.accent_secondary || DEFAULT_VIDEO_INSTA_SETTINGS.accent_secondary,
    '--va-bg-from': s.section_bg_from || DEFAULT_VIDEO_INSTA_SETTINGS.section_bg_from,
    '--va-bg-to': s.section_bg_to || DEFAULT_VIDEO_INSTA_SETTINGS.section_bg_to,
    '--va-title-solid': s.title_color || '',
    '--va-ring-1': s.ring_color_1 || DEFAULT_VIDEO_INSTA_SETTINGS.ring_color_1,
    '--va-ring-2': s.ring_color_2 || DEFAULT_VIDEO_INSTA_SETTINGS.ring_color_2,
    '--va-ring-3': s.ring_color_3 || DEFAULT_VIDEO_INSTA_SETTINGS.ring_color_3,
    '--va-rail-bg': s.rail_bg || DEFAULT_VIDEO_INSTA_SETTINGS.rail_bg,
  }
}
