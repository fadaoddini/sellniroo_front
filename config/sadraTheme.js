// قالب صدرا — پالت و تشخیص شل

export const SADRA_PALETTE = {
  forest: '#1E3B2F',
  sage: '#7F8C6A',
  sand: '#C8B48A',
  cream: '#F5F0E6',
  white: '#FFFFFF',
  black: '#0A0A0A',
}

export function isSadraAppShell(settings, siteName = '') {
  const name = String(settings?.site_name || siteName || '')
  const nameEn = String(settings?.site_name_en || '')
  return (
    name.includes('صدرا') ||
    /sadra/i.test(nameEn) ||
    /sadra/i.test(name)
  )
}

export const SADRA_APP_BG = SADRA_PALETTE.cream

/** توکن‌های CSS برای پروفایل روشن / ویجت‌ها */
export const SADRA_CSS_VARS = {
  '--profile-ink': SADRA_PALETTE.forest,
  '--profile-muted': SADRA_PALETTE.sage,
  '--profile-accent': SADRA_PALETTE.sand,
  '--profile-accent-deep': SADRA_PALETTE.forest,
  '--profile-cream': SADRA_PALETTE.cream,
  '--profile-surface': SADRA_PALETTE.white,
  '--profile-black': SADRA_PALETTE.black,
  '--profile-line': 'color-mix(in srgb, #7F8C6A 26%, transparent)',
  '--forest': SADRA_PALETTE.forest,
  '--sage': SADRA_PALETTE.sage,
  '--sand': SADRA_PALETTE.sand,
  '--cream': SADRA_PALETTE.cream,
}

/** سازگاری عقب‌رو با ویترین فروشگاه صدرا */
export const SADRA_SHOP_GOLD = {
  accent_color: SADRA_PALETTE.sand,
  more_link_color: SADRA_PALETTE.forest,
  lid_color: SADRA_PALETTE.sage,
  discount_bg: SADRA_PALETTE.forest,
  discount_text: SADRA_PALETTE.cream,
  btn_bg: SADRA_PALETTE.forest,
  btn_text: SADRA_PALETTE.cream,
  btn_border: SADRA_PALETTE.sand,
  like_color: SADRA_PALETTE.forest,
  hover_fill: SADRA_PALETTE.cream,
  cta_style: 'solid',
  card_style: 'soft',
}
