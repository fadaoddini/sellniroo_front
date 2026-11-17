import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** بخش‌های قابل‌فعال‌سازی در /profile */
export const PROFILE_SECTION_DEFS = [
  {
    id: 'account',
    label: 'حساب کاربری',
    desc: 'نام، موبایل و ایمیل',
    moduleKey: null,
    defaultOn: true,
  },
  {
    id: 'rebo',
    label: 'سفارش بسته‌های ربو',
    desc: 'سبد و ثبت سفارش موتور ربو',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    defaultOn: true,
  },
  {
    id: 'gym_bodybuilding',
    label: 'باشگاه بدنسازی',
    desc: 'عضویت، بسته، سانس و میانبر داشبورد',
    moduleKey: SITE_MODULE_KEYS.GYM_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.GYM_BODYBUILDING,
    defaultOn: true,
  },
  {
    id: 'cloud',
    label: 'سرور ابری',
    desc: 'مدیریت اشتراک سرور ابری',
    moduleKey: SITE_MODULE_KEYS.CLOUD_SERVER,
    defaultOn: true,
  },
  {
    id: 'job',
    label: 'کاریابی',
    desc: 'آگهی، رزومه، شرکت و درخواست‌ها',
    moduleKey: SITE_MODULE_KEYS.JOB_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.JOB_BOARD,
    defaultOn: true,
  },
  {
    id: 'shop',
    label: 'فروشگاه',
    desc: 'سفارش‌ها و آدرس‌های خریدار',
    moduleKey: SITE_MODULE_KEYS.SHOP_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.SHOP,
    defaultOn: true,
  },
  {
    id: 'booking',
    label: 'نوبت‌دهی',
    desc: 'نوبت‌ها و رزرو',
    moduleKey: SITE_MODULE_KEYS.BOOKING_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.BOOKING,
    defaultOn: true,
  },
  {
    id: 'repairs',
    label: 'تعمیرات',
    desc: 'درخواست و پیگیری سرویس',
    moduleKey: SITE_MODULE_KEYS.REPAIRS_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.REPAIRS,
    defaultOn: true,
  },
  {
    id: 'school',
    label: 'مدرسه',
    desc: 'نقش‌ها و وضعیت کلاس',
    moduleKey: SITE_MODULE_KEYS.SCHOOL_PROFILE,
    fallbackModuleKey: SITE_MODULE_KEYS.SCHOOL,
    defaultOn: true,
  },
  {
    id: 'quiz',
    label: 'آزمون',
    desc: 'تاریخچه و شرکت در آزمون',
    moduleKey: SITE_MODULE_KEYS.QUIZ,
    defaultOn: true,
  },
  {
    id: 'softapps',
    label: 'نرم‌افزارهای من',
    desc: 'خریدها و دانلودهای نرم‌افزارهای کاربردی',
    moduleKey: SITE_MODULE_KEYS.SOFTAPPS,
    defaultOn: true,
  },
]

/** سیستم اصلی پروفایل */
export const PROFILE_PRIMARY_OPTIONS = [
  {
    id: 'auto',
    label: 'خودکار',
    desc: 'بر اساس ماژول‌های فعال و اولویت سیستم‌ها',
  },
  {
    id: 'composite',
    label: 'ترکیبی (چندبخشی)',
    desc: 'همه بخش‌های روشن را به‌صورت تب در یک پروفایل نشان بده',
  },
  { id: 'rebo', label: 'ربو', desc: 'پروفایل موتور قدرتمند ربو' },
  {
    id: 'sales',
    label: 'CRM فروش',
    desc: 'پروفایل جامع فروش و بازاریابی',
  },
  {
    id: 'inventory',
    label: 'انبارداری پیشرفته',
    desc: 'پروفایل جامع موجودی، حواله و هشدار',
  },
  {
    id: 'gym_bodybuilding',
    label: 'باشگاه بدنسازی',
    desc: 'پروفایل جامع اعضا، بسته، سانس و برنامه',
  },
  { id: 'job', label: 'کاریابی', desc: 'پروفایل کامل کاریابی' },
  { id: 'shop', label: 'فروشگاه', desc: 'پروفایل خریدار / فروشگاهی' },
  { id: 'booking', label: 'نوبت‌دهی', desc: 'پروفایل نوبت‌دهی' },
  { id: 'repairs', label: 'تعمیرات', desc: 'پروفایل تعمیرات' },
  { id: 'school', label: 'مدرسه', desc: 'پروفایل مدرسه' },
  { id: 'basic', label: 'پایه', desc: 'فقط حساب + بخش‌های روشن' },
]

export const DEFAULT_PROFILE_LAYOUT = {
  primary: 'auto',
  sections: Object.fromEntries(
    PROFILE_SECTION_DEFS.map((s) => [s.id, s.defaultOn !== false]),
  ),
}

export function normalizeProfileLayout(raw = {}) {
  const primaryIds = new Set(PROFILE_PRIMARY_OPTIONS.map((o) => o.id))
  const primary =
    typeof raw.primary === 'string' && primaryIds.has(raw.primary)
      ? raw.primary
      : DEFAULT_PROFILE_LAYOUT.primary

  const sections = { ...DEFAULT_PROFILE_LAYOUT.sections }
  const incoming =
    raw.sections && typeof raw.sections === 'object' ? raw.sections : {}
  PROFILE_SECTION_DEFS.forEach((def) => {
    if (Object.prototype.hasOwnProperty.call(incoming, def.id)) {
      sections[def.id] = !!incoming[def.id]
    }
  })

  return { primary, sections }
}

/**
 * آیا ماژول لازم برای بخش روشن است؟
 * @param {Record<string, boolean>} moduleMap
 */
export function isProfileSectionModuleOn(def, moduleMap = {}) {
  if (!def?.moduleKey && !def?.fallbackModuleKey) return true
  if (def.moduleKey && moduleMap[def.moduleKey]) return true
  if (def.fallbackModuleKey && moduleMap[def.fallbackModuleKey]) return true
  return false
}

/**
 * بخش‌های قابل‌نمایش با توجه به تنظیمات ادمین + ماژول‌های فعال
 */
export function getVisibleProfileSections(layout, moduleMap = {}) {
  const normalized = normalizeProfileLayout(layout)
  return PROFILE_SECTION_DEFS.filter((def) => {
    if (!normalized.sections[def.id]) return false
    return isProfileSectionModuleOn(def, moduleMap)
  })
}

export function isProfileSectionEnabled(layout, sectionId, moduleMap = {}) {
  return getVisibleProfileSections(layout, moduleMap).some(
    (s) => s.id === sectionId,
  )
}
