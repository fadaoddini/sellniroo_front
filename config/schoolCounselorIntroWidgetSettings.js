/**
 * ویجت ریسایکلر معرفی مشاور — همان طراحی قاب قرمز / کارت سفید / QR بیرون‌زده
 */
import {
  isCssTransparent,
  normalizeCssColor,
  resolveCssColor,
} from '@/config/schoolTeacherIntroWidgetSettings'

export const SCHOOL_COUNSELOR_INTRO_WIDGET_TYPE = 'school_counselor_intro'

export const SCHOOL_COUNSELOR_INTRO_SIDE_OPTIONS = [
  { id: 'right', label: 'سمت راست' },
  { id: 'left', label: 'سمت چپ' },
]

export const SCHOOL_COUNSELOR_INTRO_ARROWS_SIDE = [
  { id: 'end', label: 'بالا چپ (انتهای ردیف)' },
  { id: 'start', label: 'بالا راست (شروع ردیف)' },
]

export const DEMO_SCHOOL_COUNSELORS = [
  {
    id: 'demo_c1',
    name: 'مریم نوری',
    specialty: 'مشاوره تحصیلی و هدایت شغلی',
    bio: 'همراهی دانش‌آموزان در انتخاب مسیر تحصیل و کاهش استرس آزمون.',
    slug: 'maryam-nouri',
    avatar: '',
  },
  {
    id: 'demo_c2',
    name: 'رضا شریفی',
    specialty: 'مشاوره روان‌شناختی نوجوان',
    bio: 'تمرکز بر مهارت‌های زندگی، اعتمادبه‌نفس و روابط خانوادگی.',
    slug: 'reza-sharifi',
    avatar: '',
  },
  {
    id: 'demo_c3',
    name: 'الهام کریمی',
    specialty: 'آزمون هوش و استعداد',
    bio: 'اجرای آزمون‌های IQ / EQ و تفسیر نتایج برای خانواده.',
    slug: 'elham-karimi',
    avatar: '',
  },
  {
    id: 'demo_c4',
    name: 'پویا احمدی',
    specialty: 'مشاوره والدین',
    bio: 'جلسات گروهی و فردی برای همراهی والدین با فرزندان نوجوان.',
    slug: 'pouya-ahmadi',
    avatar: '',
  },
]

export const DEFAULT_SCHOOL_COUNSELOR_INTRO_SETTINGS = {
  title: 'معرفی مشاور',
  subtitle: 'با مشاوران مدرسه آشنا شوید',
  show_title: true,
  show_subtitle: false,
  show_more_link: false,
  more_label: 'همه مشاوران',
  more_href: '/counselors',
  limit: 8,
  use_demo_data: true,
  items: [],
  show_qr: true,
  show_specialty: true,
  show_bio: true,
  show_arrows: true,
  arrows_side: 'end',
  show_scrollbar: false,
  card_width: 168,
  gap: 10,
  section_full: true,
  show_on_mobile: true,
  show_on_desktop: true,
  color_frame: '#8e0413',
  frame_opacity: 100,
  color_frame_body: '#8e0413',
  frame_body_opacity: 100,
  color_frame_text: '#f8f0f0',
  color_frame_muted: 'rgba(248, 240, 240, 0.72)',
  color_card: '#ffffff',
  card_opacity: 100,
  color_text: '#111827',
  color_muted: '#6b7280',
  color_accent: '#c9a227',
  color_arrow_bg: 'rgba(255,255,255,0.14)',
  color_arrow_text: '#ffffff',
  card_radius: 14,
  frame_radius: 22,
  frame_body_radius_tl: 18,
  frame_body_radius_tr: 10,
  frame_body_radius_br: 20,
  frame_body_radius_bl: 12,
  padding_y: 24,
  qr_size: 56,
  show_side_image: true,
  side_image: '',
  side_image_alt: 'معرفی مشاوران',
  side_image_title: '',
  side_image_caption: '',
  side_image_side: 'right',
  side_image_width: 200,
  side_image_radius: 14,
}

function str(v, fallback = '') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function num(v, fallback, min = 0, max = 9999) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  if (raw && Object.prototype.hasOwnProperty.call(raw, key)) return !!raw[key]
  return d[key] !== false
}

export function normalizeCounselorIntroItem(raw, index = 0) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const slug = str(s.slug || s.public_slug, '')
  const path = str(
    s.href || s.public_path || (slug ? `/counselors/${slug}` : ''),
    '',
  )
  return {
    id: str(s.id, `c_${index + 1}`),
    name: str(s.name || s.display_name, `مشاور ${index + 1}`),
    specialty: str(s.specialty || s.subject, ''),
    bio: str(s.bio, ''),
    slug,
    href: path,
    avatar: str(s.avatar || s.avatar_url || s.photo, ''),
  }
}

export function mapApiCounselorToIntroItem(t, index = 0) {
  if (!t || typeof t !== 'object') return null
  if (t.is_profile_public === false) return null
  const slug = str(t.public_slug, '')
  if (!slug && !t.public_path) return null
  return normalizeCounselorIntroItem(
    {
      id: t.id,
      name: t.display_name,
      specialty: t.specialty,
      bio: t.bio,
      slug,
      href: t.public_path || `/counselors/${slug}`,
      avatar: t.avatar_url,
    },
    index,
  )
}

export function normalizeSchoolCounselorIntroSettings(raw = {}) {
  const d = DEFAULT_SCHOOL_COUNSELOR_INTRO_SETTINGS
  const s = raw && typeof raw === 'object' ? raw : {}
  const itemsRaw = Array.isArray(s.items) ? s.items : []
  const sideImage = str(s.side_image, d.side_image)
  const side =
    s.side_image_side === 'left' || s.side_image_side === 'right'
      ? s.side_image_side
      : d.side_image_side
  const arrowsSide =
    s.arrows_side === 'start' || s.arrows_side === 'end'
      ? s.arrows_side
      : d.arrows_side

  const cardWidth = (() => {
    const w = num(s.card_width, d.card_width, 140, 320)
    return w === 240 || w === 220 ? 168 : w
  })()
  const qrSize = (() => {
    const q = num(s.qr_size, d.qr_size, 48, 140)
    return q === 88 || q === 72 ? 56 : q
  })()

  return {
    ...d,
    ...s,
    title: str(s.title, d.title),
    subtitle: str(s.subtitle, d.subtitle),
    show_title: bool(s, 'show_title', d),
    show_subtitle: bool(s, 'show_subtitle', d),
    show_more_link: bool(s, 'show_more_link', d),
    more_label: str(s.more_label, d.more_label),
    more_href: str(s.more_href, d.more_href),
    limit: num(s.limit, d.limit, 1, 24),
    use_demo_data: bool(s, 'use_demo_data', d),
    items: itemsRaw.map(normalizeCounselorIntroItem).filter((x) => x.name),
    show_qr: bool(s, 'show_qr', d),
    show_specialty: bool(s, 'show_specialty', d),
    show_bio: bool(s, 'show_bio', d),
    show_arrows: bool(s, 'show_arrows', d),
    arrows_side: arrowsSide,
    show_scrollbar: bool(s, 'show_scrollbar', d),
    card_width: cardWidth,
    gap: num(s.gap, d.gap, 4, 40),
    section_full: bool(s, 'section_full', d),
    show_on_mobile: bool(s, 'show_on_mobile', d),
    show_on_desktop: bool(s, 'show_on_desktop', d),
    color_frame: normalizeCssColor(s.color_frame, d.color_frame),
    frame_opacity: num(s.frame_opacity, d.frame_opacity, 0, 100),
    color_frame_body: normalizeCssColor(
      Object.prototype.hasOwnProperty.call(s, 'color_frame_body')
        ? s.color_frame_body
        : d.color_frame_body,
      d.color_frame_body,
    ),
    frame_body_opacity: Object.prototype.hasOwnProperty.call(
      s,
      'frame_body_opacity',
    )
      ? num(s.frame_body_opacity, d.frame_body_opacity, 0, 100)
      : d.frame_body_opacity,
    color_frame_text: normalizeCssColor(s.color_frame_text, d.color_frame_text),
    color_frame_muted: normalizeCssColor(
      s.color_frame_muted,
      d.color_frame_muted,
    ),
    color_card: normalizeCssColor(s.color_card, d.color_card),
    card_opacity: num(s.card_opacity, d.card_opacity, 0, 100),
    color_text: (() => {
      const t = str(s.color_text, d.color_text).toLowerCase()
      if (['#004733', '#003528', '#2b6a4d', '#1a1414', '#f3f4f6', '#ffffff'].includes(t)) {
        return d.color_text
      }
      return normalizeCssColor(s.color_text, d.color_text)
    })(),
    color_muted: (() => {
      const t = str(s.color_muted, d.color_muted).toLowerCase()
      if (['#568d66', '#6b5a5a', '#a5c1ae'].includes(t)) return d.color_muted
      return normalizeCssColor(s.color_muted, d.color_muted)
    })(),
    color_accent: normalizeCssColor(s.color_accent, d.color_accent),
    color_arrow_bg: normalizeCssColor(s.color_arrow_bg, d.color_arrow_bg),
    color_arrow_text: normalizeCssColor(s.color_arrow_text, d.color_arrow_text),
    card_radius: num(s.card_radius, d.card_radius, 0, 40),
    frame_radius: num(s.frame_radius, d.frame_radius, 0, 40),
    frame_body_radius_tl: num(s.frame_body_radius_tl, d.frame_body_radius_tl, 0, 80),
    frame_body_radius_tr: num(s.frame_body_radius_tr, d.frame_body_radius_tr, 0, 80),
    frame_body_radius_br: num(s.frame_body_radius_br, d.frame_body_radius_br, 0, 80),
    frame_body_radius_bl: num(s.frame_body_radius_bl, d.frame_body_radius_bl, 0, 80),
    padding_y: num(s.padding_y, d.padding_y, 0, 80),
    qr_size: qrSize,
    show_side_image: sideImage
      ? bool(s, 'show_side_image', { show_side_image: true })
      : bool(s, 'show_side_image', d),
    side_image: sideImage,
    side_image_alt: str(s.side_image_alt, d.side_image_alt),
    side_image_title:
      s.side_image_title === undefined || s.side_image_title === null
        ? d.side_image_title
        : String(s.side_image_title),
    side_image_caption:
      s.side_image_caption === undefined || s.side_image_caption === null
        ? ''
        : String(s.side_image_caption),
    side_image_side: side,
    side_image_width: num(s.side_image_width, d.side_image_width, 120, 420),
    side_image_radius: num(s.side_image_radius, d.side_image_radius, 0, 40),
  }
}

export function resolveCounselorIntroList(settings, apiCounselors = null) {
  const s = normalizeSchoolCounselorIntroSettings(settings)
  if (s.items.length) return s.items.slice(0, s.limit)
  if (Array.isArray(apiCounselors) && apiCounselors.length) {
    return apiCounselors
      .map(mapApiCounselorToIntroItem)
      .filter(Boolean)
      .slice(0, s.limit)
  }
  if (!s.use_demo_data) return []
  return DEMO_SCHOOL_COUNSELORS.slice(0, s.limit).map(normalizeCounselorIntroItem)
}

export function schoolCounselorIntroCssVars(settings) {
  const s = normalizeSchoolCounselorIntroSettings(settings)
  const frameBg = resolveCssColor(s.color_frame, s.frame_opacity)
  const frameBodyBg = resolveCssColor(s.color_frame_body, s.frame_body_opacity)
  const cardBg = resolveCssColor(s.color_card, s.card_opacity)
  return {
    '--sti-frame': frameBg,
    '--sti-frame-body': frameBodyBg,
    '--sti-frame-text': s.color_frame_text,
    '--sti-frame-muted': s.color_frame_muted,
    '--sti-card': cardBg,
    '--sti-text': s.color_text,
    '--sti-muted': s.color_muted,
    '--sti-accent': s.color_accent,
    '--sti-arrow-bg': s.color_arrow_bg,
    '--sti-arrow-text': s.color_arrow_text,
    '--sti-card-w': `${s.card_width}px`,
    '--sti-gap': `${s.gap}px`,
    '--sti-radius': `${s.card_radius}px`,
    '--sti-frame-radius': `${s.frame_radius}px`,
    '--sti-body-r-tl': `${s.frame_body_radius_tl}px`,
    '--sti-body-r-tr': `${s.frame_body_radius_tr}px`,
    '--sti-body-r-br': `${s.frame_body_radius_br}px`,
    '--sti-body-r-bl': `${s.frame_body_radius_bl}px`,
    '--sti-pad-y': `${s.padding_y}px`,
    '--sti-qr': `${s.qr_size}px`,
    '--sti-side-w': `${s.side_image_width}px`,
    '--sti-side-radius': `${s.side_image_radius}px`,
    '--sti-frame-plain': isCssTransparent(frameBg) ? '1' : '0',
  }
}

export function isCounselorIntroFramePlain(settings) {
  const s = normalizeSchoolCounselorIntroSettings(settings)
  if (Number(s.frame_opacity) < 100) return true
  return isCssTransparent(resolveCssColor(s.color_frame, s.frame_opacity))
}

export function createDefaultSchoolCounselorIntroSettings() {
  return { ...DEFAULT_SCHOOL_COUNSELOR_INTRO_SETTINGS }
}

export function isSchoolCounselorIntroWidgetType(type) {
  return String(type || '') === SCHOOL_COUNSELOR_INTRO_WIDGET_TYPE
}
