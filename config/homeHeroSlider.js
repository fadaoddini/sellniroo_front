/** تنظیمات صفحه اصلی مدرسه — SiteSettings.home_hero_slider */

export const HOME_PAGE_FONTS = [
  { id: 'iran', label: 'ایران', css: 'var(--font-iran)' },
  { id: 'edameh', label: 'ادامه', css: 'var(--font-edameh), var(--font-iran)' },
  { id: 'ravi', label: 'راوی', css: 'var(--font-r), var(--font-iran)' },
  { id: 'bold', label: 'ضخیم', css: 'var(--font-b), var(--font-iran)' },
  { id: 'display', label: 'نمایشی', css: 'var(--font-x), var(--font-edameh), var(--font-iran)' },
]

export const DEFAULT_HOME_HERO_SLIDER = {
  brand: 'مدرسه',
  eyebrow: 'سامانه یکپارچه آموزش',
  headline: 'همه‌چیز مدرسه، در یک سامانه',
  subtitle:
    'از کارنامه و نمودار پیشرفت تا پنل مشاور، آزمون هوش، حضور و غیاب و تکالیف — برای مدیر، معلم، مشاور و دانش‌آموز.',
  cta_label: 'ورود به مدرسه',
  cta_href: '/login?next=/profile',
  show_cta: true,
  secondary_label: 'داشبورد دانش‌آموز',
  secondary_href: '/login?next=' + encodeURIComponent('/profile?tab=students'),
  show_secondary: true,
  report: {
    show: true,
    title: 'کارنامه ماهانه',
    rank: 'رتبه ۳ / ۲۸',
    gpa: '۱۷٫۸',
    gpa_label: 'معدل',
    subjects: [
      { name: 'ریاضی', score: '18.5', bar: 92 },
      { name: 'علوم', score: '17.25', bar: 86 },
      { name: 'فارسی', score: '19', bar: 95 },
      { name: 'انگلیسی', score: '16.5', bar: 82 },
    ],
  },
  chart: {
    show: true,
    title: 'روند شش‌ماهه',
    trend: 'رشد ۲۶٪ از مهر',
    months: [
      { label: 'مهر', v: 62 },
      { label: 'آبان', v: 70 },
      { label: 'آذر', v: 68 },
      { label: 'دی', v: 78 },
      { label: 'بهمن', v: 85 },
      { label: 'اسفند', v: 88 },
    ],
  },
  badge: {
    show: true,
    text: 'IQ · EQ',
  },
  marquee: {
    show: true,
    items: [
      'کارنامه ماهانه',
      'نمودار پیشرفت',
      'پنل مشاور',
      'آزمون IQ / EQ',
      'حضور و غیاب',
      'آزمون‌ساز',
      'رتبه کلاسی',
      'تکالیف تصویری',
    ],
  },
  sections: {
    hero: true,
    portals: true,
    report_band: true,
    counseling: true,
    tools: true,
    closing: true,
    mobile_dock: true,
  },
  portals: {
    kicker: 'چهار درگاه زنده',
    title: 'هر نقش،',
    title_em: ' صحنه خودش',
    lead: 'مدیر، مشاور، معلم و دانش‌آموز — ورود جدا، امکانات اختصاصی، یک هسته مشترک.',
    enter_label: 'ورود',
    items: [
      {
        id: 'admin',
        title: 'مدیر',
        desc: 'معلمان، مشاوران، کلاس‌ها و نمای کلی فعالیت‌ها',
        href: '/login?next=' + encodeURIComponent('/profile?tab=manage'),
        show: true,
      },
      {
        id: 'counselor',
        title: 'مشاور',
        desc: 'آزمون IQ و EQ، پرونده دانش‌آموز و نوبت مشاوره',
        href: '/login?next=' + encodeURIComponent('/profile?tab=counselor'),
        show: true,
      },
      {
        id: 'teacher',
        title: 'معلم',
        desc: 'دروس، نمره‌دهی، کارنامه، آزمون و بررسی تکالیف',
        href: '/login?next=' + encodeURIComponent('/profile?tab=teacher'),
        show: true,
      },
      {
        id: 'student',
        title: 'دانش‌آموز',
        desc: 'کارنامه، نمودار، تکالیف، آزمون و رتبه کلاسی',
        href: '/login?next=' + encodeURIComponent('/profile?tab=students'),
        show: true,
      },
    ],
  },
  report_band: {
    kicker: 'کارنامه هوشمند',
    title: 'نمره را ببین،',
    title_em: ' مسیر را بساز',
    lead: 'معدل، رتبه کلاسی و نمودار شش‌ماهه — همان چیزی که دانش‌آموز و والدین در پنل می‌بینند.',
    sheet_title: 'کارنامه آذر',
    sheet_meta: 'پایه نهم · نمونه زنده',
    rank_pill: 'رتبه ۳',
    chart_title: 'نمودار پیشرفت',
    chart_trend: 'رشد از مهر تا اسفند · تمرکز بعدی: ریاضی و انگلیسی',
    stats: [
      { value: '۱۷٫۸', label: 'معدل' },
      { value: '۳', label: 'رتبه کلاس' },
      { value: '۲۶٪', label: 'رشد ترم' },
    ],
  },
  counseling: {
    kicker: 'پنل مشاور',
    title: 'هوش و هیجان،',
    title_em: ' کنار هم',
    lead: 'آزمون IQ و EQ، پرونده دانش‌آموز و پیشنهاد مسیر رشد — صحنه اختصاصی مشاور مدرسه.',
    cta_label: 'ورود مشاور',
    cta_href: '/login?next=' + encodeURIComponent('/profile?tab=counselor'),
    secondary_label: 'آزمون دانش‌آموز',
    show_cta: true,
    show_secondary: true,
    tests: [
      { title: 'هوش کلی (IQ)', meta: '۴۵ دقیقه · چندگزینه‌ای' },
      { title: 'هوش هیجانی (EQ)', meta: '۳۰ دقیقه · خودارزیابی' },
      { title: 'سبک یادگیری', meta: '۲۰ دقیقه · توصیه‌محور' },
    ],
  },
  tools: {
    kicker: 'جریان کار معلم',
    title: 'از نمره',
    title_em: ' تا حضور',
    lead: 'چهار ستون اصلی داشبورد معلم — سریع، شفاف، آماده کلاس.',
    items: [
      { title: 'کارنامه ماهانه', desc: 'ثبت نمره و رتبه در کلاس' },
      { title: 'آزمون آنلاین', desc: 'طراحی، زمان‌بندی و تصحیح' },
      { title: 'تکالیف تصویری', desc: 'ارسال و بازخورد معلم' },
      { title: 'حضور و غیاب', desc: 'ثبت روزانه و گزارش ماه' },
    ],
  },
  closing: {
    kicker: 'الان شروع کن',
    title: 'مدرسه‌تان روشن است',
    lead: 'کارنامه، نمودار، مشاوره و کلاس — با یک ورود در دسترس.',
    show_cta: true,
    show_counselor: true,
    counselor_label: 'پنل مشاور',
  },
  theme: {
    forest: '#004733',
    emerald: '#2b6a4d',
    sea: '#568d66',
    teal: '#a5c1ae',
    smoke: '#f3f4f6',
    coral: '#df8080',
    crimson: '#8e0413',
    white: '#ffffff',
    ink: '#004733',
    font_body: 'ravi',
    font_title: 'display',
    font_brand: 'display',
    size_brand: 72,
    size_headline: 22,
    size_body: 15,
    size_kicker: 12,
    size_button: 14,
  },
  show_on_mobile: true,
  show_on_desktop: true,
}

function asBool(v, fallback = true) {
  if (v === undefined || v === null || v === '') return fallback
  if (v === false || v === 'false' || v === 0 || v === '0') return false
  return true
}

function str(v, fb) {
  const t = String(v ?? fb ?? '').trim()
  return t || fb
}

function hex(v, fb) {
  const t = String(v ?? '').trim()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(t)) return t
  if (t === 'transparent') return t
  return fb
}

function px(v, fb, min = 8, max = 120) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fb
  return Math.max(min, Math.min(max, Math.round(n)))
}

function normalizeSubjects(list, fallback) {
  const src = Array.isArray(list) && list.length ? list : fallback
  return src.map((row, i) => {
    const fb = fallback[i] || fallback[0] || { name: 'درس', score: '18', bar: 80 }
    return {
      name: str(row?.name, fb.name),
      score: str(row?.score, fb.score),
      bar: px(row?.bar, fb.bar, 0, 100),
    }
  })
}

function normalizeMonths(list, fallback) {
  const src = Array.isArray(list) && list.length ? list : fallback
  return src.map((row, i) => {
    const fb = fallback[i] || fallback[0] || { label: 'ماه', v: 50 }
    return {
      label: str(row?.label, fb.label),
      v: px(row?.v, fb.v, 0, 100),
    }
  })
}

function normalizeItems(list, fallback, mapRow) {
  const src = Array.isArray(list) && list.length ? list : fallback
  return src.map((row, i) => mapRow(row || {}, fallback[i] || fallback[0] || {}))
}

export function resolveHomePageFont(id) {
  const found = HOME_PAGE_FONTS.find((f) => f.id === id)
  return found?.css || HOME_PAGE_FONTS[0].css
}

export function homePageThemeStyle(theme = {}) {
  const t = { ...DEFAULT_HOME_HERO_SLIDER.theme, ...(theme || {}) }
  return {
    '--sc-forest': t.forest,
    '--sc-emerald': t.emerald,
    '--sc-sea': t.sea,
    '--sc-teal': t.teal,
    '--sc-smoke': t.smoke,
    '--sc-coral': t.coral,
    '--sc-crimson': t.crimson,
    '--sc-ink': t.ink || t.forest,
    '--sc-white': t.white,
    '--sc-hero-top': t.forest,
    '--sc-font-body': resolveHomePageFont(t.font_body),
    '--sc-font-title': resolveHomePageFont(t.font_title),
    '--sc-font-brand': resolveHomePageFont(t.font_brand),
    '--sc-size-brand': `${t.size_brand}px`,
    '--sc-size-headline': `${t.size_headline}px`,
    '--sc-size-body': `${t.size_body}px`,
    '--sc-size-kicker': `${t.size_kicker}px`,
    '--sc-size-button': `${t.size_button}px`,
  }
}

export function normalizeHomeHeroSlider(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const d = DEFAULT_HOME_HERO_SLIDER
  const report = s.report && typeof s.report === 'object' ? s.report : {}
  const chart = s.chart && typeof s.chart === 'object' ? s.chart : {}
  const badge = s.badge && typeof s.badge === 'object' ? s.badge : {}
  const marquee = s.marquee && typeof s.marquee === 'object' ? s.marquee : {}
  const sections = s.sections && typeof s.sections === 'object' ? s.sections : {}
  const portals = s.portals && typeof s.portals === 'object' ? s.portals : {}
  const reportBand =
    s.report_band && typeof s.report_band === 'object' ? s.report_band : {}
  const counseling =
    s.counseling && typeof s.counseling === 'object' ? s.counseling : {}
  const tools = s.tools && typeof s.tools === 'object' ? s.tools : {}
  const closing = s.closing && typeof s.closing === 'object' ? s.closing : {}
  const theme = s.theme && typeof s.theme === 'object' ? s.theme : {}

  return {
    brand: str(s.brand, d.brand),
    eyebrow: str(s.eyebrow, d.eyebrow),
    headline: str(s.headline, d.headline),
    subtitle: str(s.subtitle, d.subtitle),
    cta_label: str(s.cta_label, d.cta_label),
    cta_href: str(s.cta_href, d.cta_href),
    show_cta: asBool(s.show_cta, true),
    secondary_label: str(s.secondary_label, d.secondary_label),
    secondary_href: str(s.secondary_href, d.secondary_href),
    show_secondary: asBool(s.show_secondary, true),
    report: {
      show: asBool(report.show, true),
      title: str(report.title, d.report.title),
      rank: str(report.rank, d.report.rank),
      gpa: str(report.gpa, d.report.gpa),
      gpa_label: str(report.gpa_label, d.report.gpa_label),
      subjects: normalizeSubjects(report.subjects, d.report.subjects),
    },
    chart: {
      show: asBool(chart.show, true),
      title: str(chart.title, d.chart.title),
      trend: str(chart.trend, d.chart.trend),
      months: normalizeMonths(chart.months, d.chart.months),
    },
    badge: {
      show: asBool(badge.show, true),
      text: str(badge.text, d.badge.text),
    },
    marquee: {
      show: asBool(marquee.show, true),
      items: (Array.isArray(marquee.items) && marquee.items.length
        ? marquee.items
        : d.marquee.items
      )
        .map((x) => String(x || '').trim())
        .filter(Boolean),
    },
    sections: {
      hero: asBool(sections.hero, true),
      portals: asBool(sections.portals, true),
      report_band: asBool(sections.report_band, true),
      counseling: asBool(sections.counseling, true),
      tools: asBool(sections.tools, true),
      closing: asBool(sections.closing, true),
      mobile_dock: asBool(sections.mobile_dock, true),
    },
    portals: {
      kicker: str(portals.kicker, d.portals.kicker),
      title: str(portals.title, d.portals.title),
      title_em: str(portals.title_em, d.portals.title_em),
      lead: str(portals.lead, d.portals.lead),
      enter_label: str(portals.enter_label, d.portals.enter_label),
      items: normalizeItems(portals.items, d.portals.items, (row, fb) => ({
        id: str(row.id, fb.id),
        title: str(row.title, fb.title),
        desc: str(row.desc, fb.desc),
        href: str(row.href, fb.href),
        show: asBool(row.show, true),
      })),
    },
    report_band: {
      kicker: str(reportBand.kicker, d.report_band.kicker),
      title: str(reportBand.title, d.report_band.title),
      title_em: str(reportBand.title_em, d.report_band.title_em),
      lead: str(reportBand.lead, d.report_band.lead),
      sheet_title: str(reportBand.sheet_title, d.report_band.sheet_title),
      sheet_meta: str(reportBand.sheet_meta, d.report_band.sheet_meta),
      rank_pill: str(reportBand.rank_pill, d.report_band.rank_pill),
      chart_title: str(reportBand.chart_title, d.report_band.chart_title),
      chart_trend: str(reportBand.chart_trend, d.report_band.chart_trend),
      stats: normalizeItems(reportBand.stats, d.report_band.stats, (row, fb) => ({
        value: str(row.value, fb.value),
        label: str(row.label, fb.label),
      })),
    },
    counseling: {
      kicker: str(counseling.kicker, d.counseling.kicker),
      title: str(counseling.title, d.counseling.title),
      title_em: str(counseling.title_em, d.counseling.title_em),
      lead: str(counseling.lead, d.counseling.lead),
      cta_label: str(counseling.cta_label, d.counseling.cta_label),
      cta_href: str(counseling.cta_href, d.counseling.cta_href),
      secondary_label: str(
        counseling.secondary_label,
        d.counseling.secondary_label,
      ),
      show_cta: asBool(counseling.show_cta, true),
      show_secondary: asBool(counseling.show_secondary, true),
      tests: normalizeItems(counseling.tests, d.counseling.tests, (row, fb) => ({
        title: str(row.title, fb.title),
        meta: str(row.meta, fb.meta),
      })),
    },
    tools: {
      kicker: str(tools.kicker, d.tools.kicker),
      title: str(tools.title, d.tools.title),
      title_em: str(tools.title_em, d.tools.title_em),
      lead: str(tools.lead, d.tools.lead),
      items: normalizeItems(tools.items, d.tools.items, (row, fb) => ({
        title: str(row.title, fb.title),
        desc: str(row.desc, fb.desc),
      })),
    },
    closing: {
      kicker: str(closing.kicker, d.closing.kicker),
      title: str(closing.title, d.closing.title),
      lead: str(closing.lead, d.closing.lead),
      show_cta: asBool(closing.show_cta, true),
      show_counselor: asBool(closing.show_counselor, true),
      counselor_label: str(closing.counselor_label, d.closing.counselor_label),
    },
    theme: {
      forest: hex(theme.forest, d.theme.forest),
      emerald: hex(theme.emerald, d.theme.emerald),
      sea: hex(theme.sea, d.theme.sea),
      teal: hex(theme.teal, d.theme.teal),
      smoke: hex(theme.smoke, d.theme.smoke),
      coral: hex(theme.coral, d.theme.coral),
      crimson: hex(theme.crimson, d.theme.crimson),
      white: hex(theme.white, d.theme.white),
      ink: hex(theme.ink, d.theme.ink),
      font_body: HOME_PAGE_FONTS.some((f) => f.id === theme.font_body)
        ? theme.font_body
        : d.theme.font_body,
      font_title: HOME_PAGE_FONTS.some((f) => f.id === theme.font_title)
        ? theme.font_title
        : d.theme.font_title,
      font_brand: HOME_PAGE_FONTS.some((f) => f.id === theme.font_brand)
        ? theme.font_brand
        : d.theme.font_brand,
      size_brand: px(theme.size_brand, d.theme.size_brand, 28, 120),
      size_headline: px(theme.size_headline, d.theme.size_headline, 12, 48),
      size_body: px(theme.size_body, d.theme.size_body, 11, 24),
      size_kicker: px(theme.size_kicker, d.theme.size_kicker, 10, 20),
      size_button: px(theme.size_button, d.theme.size_button, 11, 22),
    },
    show_on_mobile: asBool(s.show_on_mobile, true),
    show_on_desktop: asBool(s.show_on_desktop, true),
  }
}
