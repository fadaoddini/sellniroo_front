// config/modulePageLayouts.js — کاتالوگ صفحات داخلی قابل‌چیدمان در adminsettings
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { normalizeHomeLayout } from '@/config/homeLayout'

/**
 * @typedef {{
 *   key: string,
 *   path: string,
 *   label: string,
 *   desc?: string,
 *   moduleKey: string,
 *   contentWidget: string,
 *   event: string,
 * }} ModulePageDef
 */

/** @type {ModulePageDef[]} */
export const MODULE_PAGE_DEFS = [
  {
    key: 'repairs',
    path: '/repairs',
    label: 'صفحه تعمیرات',
    desc: 'درخواست سرویس و فرم تعمیر',
    moduleKey: SITE_MODULE_KEYS.REPAIRS,
    contentWidget: 'repairs_page',
    event: 'module-page-layout-changed:repairs',
  },
  {
    key: 'apps',
    path: '/apps',
    label: 'صفحه نرم‌افزارها',
    desc: 'لیست نرم‌افزارهای کاربردی',
    moduleKey: SITE_MODULE_KEYS.SOFTAPPS,
    contentWidget: 'apps_page',
    event: 'module-page-layout-changed:apps',
  },
  {
    key: 'booking',
    path: '/booking',
    label: 'صفحه نوبت‌دهی',
    desc: 'رزرو نوبت و پیگیری',
    moduleKey: SITE_MODULE_KEYS.BOOKING,
    contentWidget: 'booking_page',
    event: 'module-page-layout-changed:booking',
  },
  {
    key: 'about',
    path: '/about',
    label: 'صفحه درباره ما',
    desc: 'محتوای درباره ما',
    moduleKey: SITE_MODULE_KEYS.ABOUT_US,
    contentWidget: 'about_page',
    event: 'module-page-layout-changed:about',
  },
  {
    key: 'profile',
    path: '/profile',
    label: 'صفحه پروفایل',
    desc: 'پروفایل اختصاصی سیستم فعال (کاریابی، فروشگاه، نوبت، …)',
    moduleKey: SITE_MODULE_KEYS.JOB_PROFILE,
    contentWidget: 'profile_page',
    event: 'module-page-layout-changed:profile',
  },
  {
    key: 'contact',
    path: '/contact',
    label: 'صفحه تماس با ما',
    desc: 'فرم و کانال‌های تماس',
    moduleKey: SITE_MODULE_KEYS.CTA_SECTION,
    contentWidget: 'contact_page',
    event: 'module-page-layout-changed:contact',
  },
  {
    key: 'quiz',
    path: '/quiz',
    label: 'صفحه آزمون',
    desc: 'آزمون تخصصی فروش و بازاریابی',
    moduleKey: SITE_MODULE_KEYS.QUIZ,
    contentWidget: 'quiz_page',
    event: 'module-page-layout-changed:quiz',
  },
  {
    key: 'sale',
    path: '/sale',
    label: 'صفحه فروش / بازاریابی',
    desc: 'ماژول فروش و لید',
    moduleKey: SITE_MODULE_KEYS.SALES_MARKETING,
    contentWidget: 'sale_page',
    event: 'module-page-layout-changed:sale',
  },
  {
    key: 'cloud_server',
    path: '/cloud-server',
    label: 'صفحه سرور ابری',
    desc: 'سفارش و شارژ سرور ابری اشتراکی ربو',
    moduleKey: SITE_MODULE_KEYS.CLOUD_SERVER,
    contentWidget: 'cloud_server_page',
    event: 'module-page-layout-changed:cloud_server',
    keepOwnChrome: true,
  },
  {
    key: 'inventory',
    path: '/inventory',
    label: 'انبارداری پیشرفته',
    desc: 'انبار، کالا، ورود/خروج، حواله و گزارش',
    moduleKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    contentWidget: 'inventory_page',
    event: 'module-page-layout-changed:inventory',
    // مثل /sale: خبر فوری + ویجت منو از چیدمان خانه قالب انبار می‌آید
    keepOwnChrome: false,
  },
  {
    key: 'gym_bodybuilding',
    path: '/gym/bodybuilding',
    label: 'باشگاه بدنسازی',
    desc: 'مدیریت باشگاه بدنسازی — اعضا، بسته، سانس و برنامه',
    moduleKey: SITE_MODULE_KEYS.GYM_BODYBUILDING,
    contentWidget: 'gym_bodybuilding_page',
    event: 'module-page-layout-changed:gym_bodybuilding',
    keepOwnChrome: false,
  },
  {
    key: 'school',
    path: '/school',
    label: 'صفحه مدرسه',
    desc: 'هاب عمومی مدرسه — فوری، هیرو، منو و لندینگ',
    moduleKey: SITE_MODULE_KEYS.SCHOOL,
    contentWidget: 'school_page',
    event: 'module-page-layout-changed:school',
    keepOwnChrome: true,
  },
]

export const MODULE_PAGE_BY_KEY = Object.fromEntries(
  MODULE_PAGE_DEFS.map((d) => [d.key, d]),
)

export const MODULE_PAGE_CONTENT_WIDGETS = new Set(
  MODULE_PAGE_DEFS.map((d) => d.contentWidget),
)

export function isModulePageContentWidget(type) {
  return MODULE_PAGE_CONTENT_WIDGETS.has(String(type || ''))
}

export function getModulePageDef(key) {
  return MODULE_PAGE_BY_KEY[String(key || '')] || null
}

export function createDefaultModulePageLayout(pageKey) {
  const def = getModulePageDef(pageKey)
  const widgetType = def?.contentWidget || 'module_page'
  const idBase = String(pageKey || 'module').replace(/[^a-z0-9_]/gi, '_')
  return normalizeHomeLayout({
    version: 2,
    page_width: 'boxed',
    max_width: 1200,
    gutter: 16,
    rows: [
      {
        id: `sec_${idBase}_page_default`,
        template: '1',
        width: 'inherit',
        padding_y: 'none',
        columns: [
          {
            id: `col_${idBase}_page_default`,
            span: 100,
            widgets: [
              {
                id: `w_${idBase}_page_default`,
                type: widgetType,
                settings: {},
              },
            ],
          },
        ],
      },
    ],
  })
}

export function normalizeModulePageLayout(raw, pageKey) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return createDefaultModulePageLayout(pageKey)
  }
  return L
}

export function normalizeModulePageLayoutsMap(raw = {}) {
  const root = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const out = {}
  MODULE_PAGE_DEFS.forEach((def) => {
    out[def.key] = normalizeModulePageLayout(root[def.key], def.key)
  })
  Object.keys(root).forEach((key) => {
    if (out[key]) return
    out[key] = normalizeModulePageLayout(root[key], key)
  })
  return out
}
