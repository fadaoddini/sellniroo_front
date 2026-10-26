// config/ctaWidgetSettings.js — تنظیمات ویجت تماس و درخواست

export const CTA_WIDGET_TYPES = new Set(['cta_contact'])

export const CTA_LAYOUTS = [
  { id: 'info_form', label: 'متن | فرم' },
  { id: 'form_info', label: 'فرم | متن' },
  { id: 'stack', label: 'ستونی' },
]

export const CTA_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const CTA_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const DEFAULT_CTA_WIDGET_SETTINGS = {
  show_on_mobile: true,
  section_full: true,
  layout: 'info_form',
  max_width: 1120,
  columns_gap: 40,
  show_eyebrow: true,
  show_channels: true,
  show_form: true,
  show_email_field: true,
  show_request_type: true,
  show_bg_grid: true,
  show_bg_orb: true,
  eyebrow_text: '',
  form_title: '',
  form_subtitle: '',
  bg_from: '#0b1220',
  bg_to: '#121c2e',
  bg_accent: 'rgba(59, 130, 246, 0.22)',
  text_color: '#e8eef8',
  muted_color: '#93a4bd',
  title_color: '#f4f8ff',
  accent_color: '#60a5fa',
  accent_deep: '#1d4ed8',
  card_from: '#162033',
  card_to: '#1a2740',
  card_border: 'rgba(148, 180, 220, 0.16)',
  input_bg: 'rgba(8, 14, 26, 0.55)',
  input_border: 'rgba(148, 180, 220, 0.18)',
  button_from: '#3b82f6',
  button_to: '#1d4ed8',
  button_text: '#ffffff',
  channel_bg: 'rgba(22, 32, 51, 0.85)',
  title_size: 28,
  desc_size: 15,
  form_radius: 20,
  input_radius: 12,
  button_radius: 12,
  channel_radius: 14,
  form_padding: 22,
  form_shadow: true,
  padding_top: 48,
  padding_right: 20,
  padding_bottom: 48,
  padding_left: 20,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
}

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

export function normalizeCtaWidgetSettings(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const s = { ...DEFAULT_CTA_WIDGET_SETTINGS, ...src }

  s.show_on_mobile =
    src.show_on_mobile === undefined ? true : !!src.show_on_mobile
  s.section_full =
    src.section_full === undefined ? true : !!src.section_full
  if (!CTA_LAYOUTS.some((l) => l.id === s.layout)) s.layout = 'info_form'

  ;[
    'show_eyebrow',
    'show_channels',
    'show_form',
    'show_email_field',
    'show_request_type',
    'show_bg_grid',
    'show_bg_orb',
    'form_shadow',
  ].forEach((k) => {
    if (src[k] === undefined) s[k] = DEFAULT_CTA_WIDGET_SETTINGS[k]
    else s[k] = !!src[k]
  })

  s.eyebrow_text = String(s.eyebrow_text ?? '').trim()
  s.form_title = String(s.form_title ?? '').trim()
  s.form_subtitle = String(s.form_subtitle ?? '').trim()

  ;[
    'bg_from',
    'bg_to',
    'bg_accent',
    'text_color',
    'muted_color',
    'title_color',
    'accent_color',
    'accent_deep',
    'card_from',
    'card_to',
    'card_border',
    'input_bg',
    'input_border',
    'button_from',
    'button_to',
    'button_text',
    'channel_bg',
  ].forEach((k) => {
    s[k] = colorStr(s[k]) || DEFAULT_CTA_WIDGET_SETTINGS[k]
  })

  s.max_width = Math.max(640, Math.min(1600, pxNum(s.max_width, 1120, 1600)))
  s.columns_gap = Math.min(80, pxNum(s.columns_gap, 40, 80))
  s.title_size = Math.max(16, Math.min(48, pxNum(s.title_size, 28, 48)))
  s.desc_size = Math.max(12, Math.min(24, pxNum(s.desc_size, 15, 24)))
  s.form_radius = Math.min(40, pxNum(s.form_radius, 20, 40))
  s.input_radius = Math.min(28, pxNum(s.input_radius, 12, 28))
  s.button_radius = Math.min(28, pxNum(s.button_radius, 12, 28))
  s.channel_radius = Math.min(28, pxNum(s.channel_radius, 14, 28))
  s.form_padding = Math.min(48, pxNum(s.form_padding, 22, 48))

  CTA_SPACE_FIELDS.concat(CTA_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_CTA_WIDGET_SETTINGS[key], max)
  })

  return s
}

export function ctaWidgetCssVars(settings) {
  const s = normalizeCtaWidgetSettings(settings || {})
  return {
    '--cta-pt': `${s.padding_top}px`,
    '--cta-pr': `${s.padding_right}px`,
    '--cta-pb': `${s.padding_bottom}px`,
    '--cta-pl': `${s.padding_left}px`,
    '--cta-mt': `${s.margin_top}px`,
    '--cta-mr': `${s.margin_right}px`,
    '--cta-mb': `${s.margin_bottom}px`,
    '--cta-ml': `${s.margin_left}px`,
    '--cta-max': `${s.max_width}px`,
    '--cta-gap': `${s.columns_gap}px`,
    '--cta-bg-from': s.bg_from,
    '--cta-bg-to': s.bg_to,
    '--cta-bg-accent': s.bg_accent,
    '--cta-text': s.text_color,
    '--cta-muted': s.muted_color,
    '--cta-title': s.title_color,
    '--cta-accent': s.accent_color,
    '--cta-accent-deep': s.accent_deep,
    '--cta-card-from': s.card_from,
    '--cta-card-to': s.card_to,
    '--cta-card-border': s.card_border,
    '--cta-input-bg': s.input_bg,
    '--cta-input-border': s.input_border,
    '--cta-btn-from': s.button_from,
    '--cta-btn-to': s.button_to,
    '--cta-btn-text': s.button_text,
    '--cta-channel-bg': s.channel_bg,
    '--cta-title-size': `${s.title_size}px`,
    '--cta-desc-size': `${s.desc_size}px`,
    '--cta-form-radius': `${s.form_radius}px`,
    '--cta-input-radius': `${s.input_radius}px`,
    '--cta-btn-radius': `${s.button_radius}px`,
    '--cta-channel-radius': `${s.channel_radius}px`,
    '--cta-form-pad': `${s.form_padding}px`,
    '--cta-form-shadow': s.form_shadow
      ? '0 20px 50px rgba(0, 0, 0, 0.35)'
      : 'none',
  }
}

export function isCtaWidgetType(type) {
  return CTA_WIDGET_TYPES.has(type)
}
