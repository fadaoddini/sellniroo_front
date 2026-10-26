// config/postJobButtonWidgetSettings.js — دکمه ثبت آگهی (دسکتاپ / موبایل جدا)

export const POST_JOB_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const POST_JOB_SHAPES = [
  { id: 'pill', label: 'کپسولی' },
  { id: 'rounded', label: 'گرد' },
  { id: 'square', label: 'مربعی' },
]

export const POST_JOB_SIZES = [
  { id: 'sm', label: 'کوچک' },
  { id: 'md', label: 'متوسط' },
  { id: 'lg', label: 'بزرگ' },
]

export const POST_JOB_POSITIONS = [
  { id: 'inline', label: 'در جریان صفحه' },
  { id: 'fixed_br', label: 'ثابت پایین راست' },
  { id: 'fixed_bl', label: 'ثابت پایین چپ' },
  { id: 'fixed_bc', label: 'ثابت پایین وسط' },
]

export const POST_JOB_COLOR_FIELDS = [
  { key: 'color_bg', label: 'پس‌زمینه' },
  { key: 'color_text', label: 'متن' },
  { key: 'color_border', label: 'بردر' },
  { key: 'color_hover_bg', label: 'هاور — پس‌زمینه' },
  { key: 'color_shadow', label: 'سایه' },
]

export const POST_JOB_VIEWPORT_KEYS = [
  'visible',
  'size',
  'shape',
  'position',
  'show_icon',
  'full_width',
  'border_width',
  'radius',
  'font_size',
  'padding_x',
  'padding_y',
  'shadow',
  'offset_x',
  'offset_y',
  'z_index',
  ...POST_JOB_COLOR_FIELDS.map((f) => f.key),
]

export const POST_JOB_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'label',
  'label_en',
  'href',
  'icon',
  'open_new_tab',
])

export const DEFAULT_POST_JOB_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  label: 'ثبت آگهی',
  label_en: 'Post a job',
  href: '/post-job',
  icon: 'PlusCircle',
  open_new_tab: false,

  visible: true,
  size: 'md',
  shape: 'pill',
  position: 'inline',
  show_icon: true,
  full_width: false,
  border_width: 0,
  radius: 999,
  font_size: 14,
  padding_x: 18,
  padding_y: 10,
  shadow: true,
  offset_x: 16,
  offset_y: 16,
  z_index: 1100,

  color_bg: '#fbc300',
  color_text: '#14181f',
  color_border: 'transparent',
  color_hover_bg: '#fb9700',
  color_shadow: 'rgba(251, 195, 0, 0.35)',
}

export const DEFAULT_POST_JOB_MOBILE = {
  ...DEFAULT_POST_JOB_SETTINGS,
  size: 'md',
  position: 'fixed_bc',
  full_width: false,
  padding_x: 22,
  padding_y: 12,
  offset_y: 80,
  font_size: 14,
}

export const POST_JOB_WIDGET_TYPES = new Set([
  'post_job_button',
  'post_job_cta',
])

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

function pickViewportSlice(obj = {}) {
  const out = {}
  POST_JOB_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function mergePostJobViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coercePostJobSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_POST_JOB_SETTINGS, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop
  s.label = String((rawRoot.label ?? s.label) || '').trim() || 'ثبت آگهی'
  s.label_en = String((rawRoot.label_en ?? s.label_en) || '').trim()
  s.href = String((rawRoot.href ?? s.href) || '/post-job').trim() || '/post-job'
  s.icon = String((rawRoot.icon ?? s.icon) || 'PlusCircle').trim() || 'PlusCircle'
  s.open_new_tab =
    rawRoot.open_new_tab === undefined ? false : !!rawRoot.open_new_tab

  ;['visible', 'show_icon', 'full_width', 'shadow'].forEach((k) => {
    if (merged[k] === undefined) s[k] = DEFAULT_POST_JOB_SETTINGS[k]
    else s[k] = !!merged[k]
  })

  if (!POST_JOB_SIZES.some((x) => x.id === s.size)) s.size = 'md'
  if (!POST_JOB_SHAPES.some((x) => x.id === s.shape)) s.shape = 'pill'
  if (!POST_JOB_POSITIONS.some((x) => x.id === s.position)) s.position = 'inline'

  s.border_width = Math.min(4, pxNum(s.border_width, 0, 4))
  s.radius = Math.min(999, pxNum(s.radius, 999, 999))
  s.font_size = Math.min(
    22,
    Math.max(11, pxNum(s.font_size, 14, 22))
  )
  s.padding_x = Math.min(48, pxNum(s.padding_x, 18, 48))
  s.padding_y = Math.min(28, pxNum(s.padding_y, 10, 28))
  s.offset_x = Math.min(80, pxNum(s.offset_x, 16, 80))
  s.offset_y = Math.min(160, pxNum(s.offset_y, 16, 160))
  s.z_index = Math.min(9999, Math.max(1, pxNum(s.z_index, 1100, 9999)))

  POST_JOB_COLOR_FIELDS.forEach(({ key }) => {
    s[key] = colorStr(s[key]) || DEFAULT_POST_JOB_SETTINGS[key]
  })

  return s
}

export function normalizePostJobButtonSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  return coercePostJobSettings(mergePostJobViewportRaw(root, viewport), root)
}

export function getPostJobVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotPostJobViewportSettings(raw = {}, viewport = 'desktop') {
  return pickViewportSlice(normalizePostJobButtonSettings(raw, { viewport }))
}

export function buildPostJobViewportPatch(raw, device, key, value) {
  if (POST_JOB_SHARED_ROOT_KEYS.has(key)) return { [key]: value }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotPostJobViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function postJobButtonCssVars(settings, opts = {}) {
  const s = normalizePostJobButtonSettings(settings || {}, opts)
  const sizeScale = s.size === 'sm' ? 0.88 : s.size === 'lg' ? 1.12 : 1
  const shapeRadius =
    s.shape === 'pill' ? 999 : s.shape === 'square' ? Math.min(8, s.radius) : s.radius
  return {
    '--pjb-fs': `${Math.round(s.font_size * sizeScale)}px`,
    '--pjb-px': `${Math.round(s.padding_x * sizeScale)}px`,
    '--pjb-py': `${Math.round(s.padding_y * sizeScale)}px`,
    '--pjb-radius': `${shapeRadius}px`,
    '--pjb-bw': `${s.border_width}px`,
    '--pjb-bg': s.color_bg,
    '--pjb-text': s.color_text,
    '--pjb-border': s.color_border,
    '--pjb-hover': s.color_hover_bg,
    '--pjb-ox': `${s.offset_x}px`,
    '--pjb-oy': `${s.offset_y}px`,
    '--pjb-z': String(s.z_index),
    '--pjb-shadow': s.shadow
      ? `0 10px 28px ${s.color_shadow}`
      : 'none',
  }
}

export function isPostJobButtonWidgetType(type) {
  return POST_JOB_WIDGET_TYPES.has(type)
}

export function createDefaultPostJobButtonSettings() {
  const desktop = pickViewportSlice(DEFAULT_POST_JOB_SETTINGS)
  return {
    show_on_mobile: true,
    show_on_desktop: true,
    label: 'ثبت آگهی',
    label_en: 'Post a job',
    href: '/post-job',
    icon: 'PlusCircle',
    open_new_tab: false,
    ...desktop,
    desktop: { ...desktop },
    mobile: { ...pickViewportSlice(DEFAULT_POST_JOB_MOBILE) },
  }
}
