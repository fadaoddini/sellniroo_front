// config/ctaWidgetSettings.js — تنظیمات ویجت تماس و درخواست

import { SHOP_FONTS, shopFontCss } from '@/config/shopWidgetSettings'

export { SHOP_FONTS as CTA_FONTS, shopFontCss as ctaFontCss }

export const CTA_WIDGET_TYPES = new Set(['cta_contact'])

/** ۴ اسکلتون چیدمان — افقی / عمودی */
export const CTA_LAYOUTS = [
  {
    id: 'info_form',
    label: 'افقی: متن | فرم',
    desc: 'متن و کانال‌ها سمت راست، فرم سمت چپ',
    skeleton: 'info_form',
  },
  {
    id: 'form_info',
    label: 'افقی: فرم | متن',
    desc: 'فرم اول، متن و کانال‌ها بعد',
    skeleton: 'form_info',
  },
  {
    id: 'stack',
    label: 'عمودی ستونی',
    desc: 'متن بالا، فرم پایین — تمام‌عرض',
    skeleton: 'stack',
  },
  {
    id: 'centered',
    label: 'عمودی وسط‌چین',
    desc: 'متن و فرم وسط‌چین و فشرده',
    skeleton: 'centered',
  },
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

/**
 * پالت سایت:
 * پس‌زمینه تیره #2A1A0E · فرم روشن #FEF3E2 · اکسنت #F4AE52 / #D4621A
 */
export const CTA_THEME_FALLBACK_COLORS = {
  bg_from: '#2A1A0E',
  bg_to: '#2A1A0E',
  bg_accent: '#D4621A',
  text_color: '#FEF3E2',
  muted_color: '#F4AE52',
  title_color: '#FEF3E2',
  accent_color: '#F4AE52',
  accent_deep: '#D4621A',
  card_from: '#FEF3E2',
  card_to: '#FEF3E2',
  card_border: 'transparent',
  input_bg: 'color-mix(in srgb, #2A1A0E 6%, #FEF3E2)',
  input_border: 'transparent',
  button_from: '#F4AE52',
  button_to: '#D4621A',
  button_text: '#2A1A0E',
  channel_bg: 'color-mix(in srgb, #FEF3E2 10%, transparent)',
}

export const DEFAULT_CTA_WIDGET_SETTINGS = {
  show_on_mobile: true,
  section_full: true,
  layout: 'info_form',
  max_width: 960,
  columns_gap: 28,
  show_eyebrow: true,
  show_channels: true,
  show_form: true,
  show_email_field: true,
  show_request_type: true,
  show_bg_grid: false,
  show_bg_orb: true,
  use_site_theme: true,
  eyebrow_text: '',
  form_title: '',
  form_subtitle: '',
  ...CTA_THEME_FALLBACK_COLORS,
  title_size: 22,
  desc_size: 13,
  title_font: 'edameh',
  body_font: 'iran',
  form_font: 'iran',
  form_radius: 16,
  input_radius: 10,
  button_radius: 10,
  channel_radius: 12,
  form_padding: 16,
  form_shadow: true,
  padding_top: 36,
  padding_right: 16,
  padding_bottom: 36,
  padding_left: 16,
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
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s) || /^color-mix\(/i.test(s)) return s
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

  const fontIds = new Set(SHOP_FONTS.map((f) => f.id))
  if (!fontIds.has(s.title_font)) s.title_font = DEFAULT_CTA_WIDGET_SETTINGS.title_font
  if (!fontIds.has(s.body_font)) s.body_font = DEFAULT_CTA_WIDGET_SETTINGS.body_font
  if (!fontIds.has(s.form_font)) s.form_font = DEFAULT_CTA_WIDGET_SETTINGS.form_font

  ;[
    'show_eyebrow',
    'show_channels',
    'show_form',
    'show_email_field',
    'show_request_type',
    'show_bg_grid',
    'show_bg_orb',
    'form_shadow',
    'use_site_theme',
  ].forEach((k) => {
    if (src[k] === undefined) s[k] = DEFAULT_CTA_WIDGET_SETTINGS[k]
    else s[k] = !!src[k]
  })

  if (src.use_site_theme === undefined) {
    s.use_site_theme = true
  }

  s.eyebrow_text = String(s.eyebrow_text ?? '').trim()
  s.form_title = String(s.form_title ?? '').trim()
  s.form_subtitle = String(s.form_subtitle ?? '').trim()

  Object.keys(CTA_THEME_FALLBACK_COLORS).forEach((k) => {
    s[k] = colorStr(s[k]) || CTA_THEME_FALLBACK_COLORS[k]
  })

  s.max_width = Math.max(560, Math.min(1600, pxNum(s.max_width, 960, 1600)))
  s.columns_gap = Math.min(80, pxNum(s.columns_gap, 28, 80))
  s.title_size = Math.max(16, Math.min(48, pxNum(s.title_size, 22, 48)))
  s.desc_size = Math.max(12, Math.min(24, pxNum(s.desc_size, 13, 24)))
  s.form_radius = Math.min(40, pxNum(s.form_radius, 16, 40))
  s.input_radius = Math.min(28, pxNum(s.input_radius, 10, 28))
  s.button_radius = Math.min(28, pxNum(s.button_radius, 10, 28))
  s.channel_radius = Math.min(28, pxNum(s.channel_radius, 12, 28))
  s.form_padding = Math.min(48, pxNum(s.form_padding, 16, 48))

  CTA_SPACE_FIELDS.concat(CTA_MARGIN_FIELDS).forEach(({ key }) => {
    const max = key.startsWith('padding') ? 200 : 120
    s[key] = pxNum(s[key], DEFAULT_CTA_WIDGET_SETTINGS[key], max)
  })

  return s
}

/** تم سایت: بک‌گراند تیره + فرم روشن */
export function ctaSiteThemeCssVars() {
  const c = CTA_THEME_FALLBACK_COLORS
  return {
    '--cta-bg-from': c.bg_from,
    '--cta-bg-to': c.bg_to,
    '--cta-bg-accent': c.bg_accent,
    '--cta-text': c.text_color,
    '--cta-muted': c.muted_color,
    '--cta-title': c.title_color,
    '--cta-accent': c.accent_color,
    '--cta-accent-deep': c.accent_deep,
    '--cta-card-from': c.card_from,
    '--cta-card-to': c.card_to,
    '--cta-card-border': c.card_border,
    '--cta-input-bg': c.input_bg,
    '--cta-input-border': c.input_border,
    '--cta-btn-from': c.button_from,
    '--cta-btn-to': c.button_to,
    '--cta-btn-text': c.button_text,
    '--cta-channel-bg': c.channel_bg,
    '--cta-form-shadow': '0 12px 32px color-mix(in srgb, #2A1A0E 45%, transparent)',
  }
}

export function ctaWidgetCssVars(settings) {
  const s = normalizeCtaWidgetSettings(settings || {})
  const base = {
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
    '--cta-title-size': `${s.title_size}px`,
    '--cta-desc-size': `${s.desc_size}px`,
    '--cta-form-radius': `${s.form_radius}px`,
    '--cta-input-radius': `${s.input_radius}px`,
    '--cta-btn-radius': `${s.button_radius}px`,
    '--cta-channel-radius': `${s.channel_radius}px`,
    '--cta-form-pad': `${s.form_padding}px`,
    '--cta-title-ff': shopFontCss(s.title_font),
    '--cta-body-ff': shopFontCss(s.body_font),
    '--cta-form-ff': shopFontCss(s.form_font),
  }

  if (s.use_site_theme) {
    return {
      ...base,
      ...ctaSiteThemeCssVars(),
      ...(s.form_shadow ? {} : { '--cta-form-shadow': 'none' }),
    }
  }

  return {
    ...base,
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
    '--cta-form-shadow': s.form_shadow
      ? '0 12px 32px color-mix(in srgb, #2A1A0E 45%, transparent)'
      : 'none',
  }
}

export function isCtaWidgetType(type) {
  return CTA_WIDGET_TYPES.has(type)
}
