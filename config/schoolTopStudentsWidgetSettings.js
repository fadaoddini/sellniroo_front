/**
 * ویجت ریسایکلر نفرات برتر — قاب قرمز / کارت سفید (هم‌سبک معرفی معلم)
 */
import {
  DEMO_CLASS_LEADERS,
  DEMO_SCHOOL_CLASSES,
  normalizeClassLeaderItem,
} from '@/config/schoolClassLeadersWidgetSettings'
import {
  isCssTransparent,
  normalizeCssColor,
  resolveCssColor,
} from '@/config/schoolTeacherIntroWidgetSettings'

export const SCHOOL_TOP_STUDENTS_WIDGET_TYPE = 'school_top_students'

export const SCHOOL_TOP_STUDENTS_SIDE_OPTIONS = [
  { id: 'right', label: 'سمت راست' },
  { id: 'left', label: 'سمت چپ' },
]

export const SCHOOL_TOP_STUDENTS_ARROWS_SIDE = [
  { id: 'end', label: 'بالا چپ (انتهای ردیف)' },
  { id: 'start', label: 'بالا راست (شروع ردیف)' },
]

export const SCHOOL_TOP_STUDENTS_RANK_FA = {
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'طلایی',
  platinum: 'پلاتینیوم',
  diamond: 'الماس',
}

/** دمو: یک کارت برای هر کلاس با لیست نفرات برتر */
export const DEMO_SCHOOL_TOP_CLASS_CARDS = DEMO_SCHOOL_CLASSES.map((cls) => ({
  id: cls.id,
  label: cls.label,
  students: (DEMO_CLASS_LEADERS[cls.label] || []).map((row, i) =>
    normalizeClassLeaderItem(row, i),
  ),
}))

export const DEFAULT_SCHOOL_TOP_STUDENTS_SETTINGS = {
  title: 'نفرات برتر مدرسه',
  subtitle: 'برترین‌های هر کلاس',
  show_title: true,
  show_subtitle: false,
  show_more_link: false,
  more_label: 'مشاهده همه',
  more_href: '/login?next=/profile',
  limit: 12,
  per_class_limit: 5,
  use_demo_data: true,
  items: [],
  classes: [],
  show_arrows: true,
  arrows_side: 'end',
  show_scrollbar: false,
  card_width: 178,
  gap: 10,
  section_full: true,
  show_on_mobile: true,
  show_on_desktop: true,
  show_rank: true,
  show_score: true,
  show_points: true,
  show_badge: false,
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
  color_gold: '#c9a227',
  color_silver: '#c0c7d1',
  color_bronze: '#c88a4a',
  color_plain: '#ffffff',
  card_radius: 14,
  frame_radius: 22,
  frame_body_radius_tl: 18,
  frame_body_radius_tr: 10,
  frame_body_radius_br: 20,
  frame_body_radius_bl: 12,
  padding_y: 24,
  badge_size: 44,
  show_side_image: true,
  side_image: '',
  side_image_alt: 'نفرات برتر',
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

/** آیتم نفر داخل لیست کلاس */
export function normalizeSchoolTopStudentItem(raw, index = 0) {
  const s = raw && typeof raw === 'object' ? raw : {}
  return {
    id: str(s.id, `st_${index + 1}`),
    name: str(s.name || s.display_name, `دانش‌آموز ${index + 1}`),
    grade: str(s.grade || s.class_name || s.class, ''),
    score: str(s.score || s.avg || s.gpa, ''),
    score_label: str(s.score_label || s.gpa_label, 'معدل'),
    points: num(s.points ?? s.activity_points, 0, 0, 999999),
    rank: str(s.rank || s.rank_tier, ''),
    badge: str(s.badge || s.title, ''),
    photo: str(s.photo || s.avatar || s.image, ''),
    href: str(s.href || s.link, ''),
  }
}

export function normalizeSchoolTopClassCard(raw, index = 0) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const label = str(
    s.label || s.class_label || s.name || s.grade,
    `کلاس ${index + 1}`,
  )
  const studentsRaw = Array.isArray(s.students)
    ? s.students
    : Array.isArray(s.items)
      ? s.items
      : []
  return {
    id: str(s.id || s.class_id, `class_${index + 1}`),
    label,
    students: studentsRaw
      .map(normalizeSchoolTopStudentItem)
      .filter((x) => x.name),
  }
}

/** مهاجرت لیست تخت قدیمی → کارت‌های گروهی بر اساس grade */
function migrateFlatItemsToClasses(items) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return []
  const map = new Map()
  list.forEach((raw, i) => {
    const person = normalizeSchoolTopStudentItem(raw, i)
    const key = person.grade || 'سایر'
    if (!map.has(key)) {
      map.set(key, {
        id: `migrated_${map.size + 1}`,
        label: key,
        students: [],
      })
    }
    map.get(key).students.push(person)
  })
  return Array.from(map.values())
}

export function normalizeSchoolTopStudentsSettings(raw = {}) {
  const d = DEFAULT_SCHOOL_TOP_STUDENTS_SETTINGS
  const s = raw && typeof raw === 'object' ? raw : {}
  const itemsRaw = Array.isArray(s.items) ? s.items : []
  let classesRaw = Array.isArray(s.classes) ? s.classes : []
  if (!classesRaw.length && itemsRaw.length) {
    classesRaw = migrateFlatItemsToClasses(itemsRaw)
  }
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
    const w = num(s.card_width, d.card_width, 140, 360)
    return w === 220 || w === 240 ? 178 : w
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
    per_class_limit: num(s.per_class_limit, d.per_class_limit, 1, 10),
    use_demo_data: bool(s, 'use_demo_data', d),
    items: itemsRaw.map(normalizeSchoolTopStudentItem).filter((x) => x.name),
    classes: classesRaw.map(normalizeSchoolTopClassCard).filter((c) => c.label),
    show_arrows: bool(s, 'show_arrows', d),
    arrows_side: arrowsSide,
    show_scrollbar: bool(s, 'show_scrollbar', d),
    card_width: cardWidth,
    gap: num(s.gap, d.gap, 4, 40),
    section_full: bool(s, 'section_full', d),
    show_on_mobile: bool(s, 'show_on_mobile', d),
    show_on_desktop: bool(s, 'show_on_desktop', d),
    show_rank: bool(s, 'show_rank', d),
    show_score: bool(s, 'show_score', d),
    show_points: bool(s, 'show_points', d),
    show_badge: bool(s, 'show_badge', d),
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
    color_gold: str(s.color_gold, d.color_gold),
    color_silver: str(s.color_silver, d.color_silver),
    color_bronze: str(s.color_bronze, d.color_bronze),
    color_plain: str(s.color_plain, d.color_plain),
    card_radius: num(s.card_radius, d.card_radius, 0, 40),
    frame_radius: num(s.frame_radius, d.frame_radius, 0, 40),
    frame_body_radius_tl: num(s.frame_body_radius_tl, d.frame_body_radius_tl, 0, 80),
    frame_body_radius_tr: num(s.frame_body_radius_tr, d.frame_body_radius_tr, 0, 80),
    frame_body_radius_br: num(s.frame_body_radius_br, d.frame_body_radius_br, 0, 80),
    frame_body_radius_bl: num(s.frame_body_radius_bl, d.frame_body_radius_bl, 0, 80),
    padding_y: num(s.padding_y, d.padding_y, 0, 80),
    badge_size: num(s.badge_size, d.badge_size, 32, 72),
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

export function resolveSchoolTopClassCards(settings) {
  const s = normalizeSchoolTopStudentsSettings(settings)
  const custom = s.classes || []
  const source =
    custom.length > 0
      ? custom
      : s.use_demo_data
        ? DEMO_SCHOOL_TOP_CLASS_CARDS
        : []
  return source.slice(0, s.limit).map((card, i) => {
    const normalized = normalizeSchoolTopClassCard(card, i)
    return {
      ...normalized,
      students: normalized.students.slice(0, s.per_class_limit),
    }
  })
}

/** سازگاری با کد قدیمی که لیست تخت می‌خواست */
export function resolveSchoolTopStudentsList(settings) {
  return resolveSchoolTopClassCards(settings).flatMap((c) =>
    c.students.map((st) => ({ ...st, grade: st.grade || c.label })),
  )
}

export function topStudentPlaceTone(place) {
  if (place === 1) return 'gold'
  if (place === 2) return 'silver'
  if (place === 3) return 'bronze'
  return 'plain'
}

export function schoolTopStudentsCssVars(settings) {
  const s = normalizeSchoolTopStudentsSettings(settings)
  const frameBg = resolveCssColor(s.color_frame, s.frame_opacity)
  const frameBodyBg = resolveCssColor(s.color_frame_body, s.frame_body_opacity)
  const cardBg = resolveCssColor(s.color_card, s.card_opacity)
  const framePlain = isCssTransparent(frameBg)
  return {
    /* هم‌سبک قاب معرفی معلم */
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
    '--sti-qr': `${s.badge_size}px`,
    '--sti-side-w': `${s.side_image_width}px`,
    '--sti-side-radius': `${s.side_image_radius}px`,
    '--sti-frame-plain': framePlain ? '1' : '0',
    /* رنگ ردیف‌های طلا/نقره/برنز */
    '--sts-text': s.color_text,
    '--sts-muted': s.color_muted,
    '--sts-gold': s.color_gold,
    '--sts-silver': s.color_silver,
    '--sts-bronze': s.color_bronze,
    '--sts-plain': s.color_plain,
  }
}

export function isTopStudentsFramePlain(settings) {
  const s = normalizeSchoolTopStudentsSettings(settings)
  if (Number(s.frame_opacity) < 100) return true
  return isCssTransparent(resolveCssColor(s.color_frame, s.frame_opacity))
}

export function createDefaultSchoolTopStudentsSettings() {
  return { ...DEFAULT_SCHOOL_TOP_STUDENTS_SETTINGS }
}

export function isSchoolTopStudentsWidgetType(type) {
  return String(type || '') === SCHOOL_TOP_STUDENTS_WIDGET_TYPE
}
