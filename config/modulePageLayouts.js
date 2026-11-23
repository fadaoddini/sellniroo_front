// config/modulePageLayouts.js — کاتالوگ صفحات داخلی قابل‌چیدمان در adminsettings
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { normalizeHomeLayout } from '@/config/homeLayout'

/**
 * چیدمان مشترک همه صفحات داخلی (به‌جز صفحه اصلی و صفحات keepOwnChrome).
 * معمولاً همان سکشن ۱ صفحه اصلی (هدر/منو/خبر فوری) است و روی همهٔ
 * شاخه‌های ماژول — مثل /repairs و /repairs/track/:token — اعمال می‌شود.
 */
export const SHARED_INTERNAL_LAYOUT_KEY = 'shared'
/** کلید قدیمی — فقط برای خواندن از دیتای ذخیره‌شده */
export const SHARED_INTERNAL_LAYOUT_KEY_LEGACY = '__shared__'
export const SHARED_INTERNAL_LAYOUT_EVENT =
  'module-page-layout-changed:shared'

/**
 * @typedef {{
 *   key: string,
 *   path: string,
 *   label: string,
 *   desc?: string,
 *   moduleKey: string,
 *   altModuleKeys?: string[],
 *   contentWidget: string,
 *   event: string,
 *   keepOwnChrome?: boolean,
 *   ownChromeWhenSchool?: boolean,
 *   relatedPaths?: string[],
 * }} ModulePageDef
 */

/**
 * آیا ماژول این صفحه (یا یکی از جایگزین‌ها) روشن است؟
 * مثلاً پروفایل: job_profile یا school_profile.
 */
export function isModulePageModuleOn(def, moduleMap = {}) {
  if (!def) return false
  const map = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  if (map[def.moduleKey]) return true
  const alts = Array.isArray(def.altModuleKeys) ? def.altModuleKeys : []
  return alts.some((k) => !!map[k])
}

/**
 * قالب مدرسه (بدون کاریابی) کروم اختصاصی news/profile دارد
 * تا در adminsettings?tab=pages جدا از چیدمان مشترک / قالب شغلی تنظیم شود.
 */
export function pageKeepsOwnChrome(def, moduleMap = {}) {
  if (!def) return false
  if (def.keepOwnChrome === true) return true
  if (!def.ownChromeWhenSchool) return false
  const map = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  const schoolOn =
    !!map[SITE_MODULE_KEYS.SCHOOL] ||
    !!map[SITE_MODULE_KEYS.SCHOOL_PROFILE] ||
    !!map[SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE]
  const jobOn = !!map[SITE_MODULE_KEYS.JOB_BOARD]
  return schoolOn && !jobOn
}

/** @type {ModulePageDef[]} */
export const MODULE_PAGE_DEFS = [
  {
    key: 'repairs',
    path: '/repairs',
    label: 'صفحه تعمیرات',
    desc: 'درخواست سرویس و فرم تعمیر — میزکار /todoservice هم همین کروم را می‌گیرد',
    moduleKey: SITE_MODULE_KEYS.REPAIRS,
    contentWidget: 'repairs_page',
    event: 'module-page-layout-changed:repairs',
    /** مسیرهای وابسته که باید همان هدر مشترک repairs را داشته باشند */
    relatedPaths: ['/todoservice'],
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
    desc: 'پروفایل اختصاصی سیستم فعال (مدرسه، کاریابی، فروشگاه، نوبت، …)',
    moduleKey: SITE_MODULE_KEYS.JOB_PROFILE,
    altModuleKeys: [
      SITE_MODULE_KEYS.SCHOOL_PROFILE,
      SITE_MODULE_KEYS.SCHOOL,
      SITE_MODULE_KEYS.SHOP_PROFILE,
      SITE_MODULE_KEYS.BOOKING_PROFILE,
      SITE_MODULE_KEYS.REPAIRS_PROFILE,
      SITE_MODULE_KEYS.GYM_PROFILE,
    ],
    contentWidget: 'profile_page',
    event: 'module-page-layout-changed:profile',
    /** مدرسه: خبر فوری و منو روی خود صفحه؛ کاریابی: چیدمان مشترک */
    ownChromeWhenSchool: true,
  },
  {
    key: 'news',
    path: '/news',
    label: 'صفحه اخبار',
    desc: 'لیست اخبار — در قالب مدرسه جای خبر فوری و منو روی همین صفحه تنظیم می‌شود',
    moduleKey: SITE_MODULE_KEYS.NEWS,
    contentWidget: 'news_list_content',
    event: 'module-page-layout-changed:news',
    ownChromeWhenSchool: true,
  },
  {
    key: 'search',
    path: '/search',
    label: 'صفحه جستجو',
    desc: 'نتایج جستجوی سایت به‌صورت لیست با فیلتر — از نوار خبر فوری',
    moduleKey: SITE_MODULE_KEYS.BREAKING_NEWS,
    altModuleKeys: [SITE_MODULE_KEYS.NEWS, SITE_MODULE_KEYS.JOB_BOARD],
    contentWidget: 'search_page',
    event: 'module-page-layout-changed:search',
  },
  {
    key: 'teacher',
    path: '/teachers',
    label: 'معرفی معلم',
    desc:
      'پروفایل عمومی معلم با QR — مسیرهایی مثل /teachers/خانم-محمدی؛ هدر و منو با سوییچ صفحه',
    moduleKey: SITE_MODULE_KEYS.SCHOOL,
    altModuleKeys: [SITE_MODULE_KEYS.SCHOOL_PROFILE],
    contentWidget: 'teacher_page',
    event: 'module-page-layout-changed:teacher',
    ownChromeWhenSchool: true,
  },
  {
    key: 'counselor',
    path: '/counselors',
    label: 'معرفی مشاور',
    desc:
      'پروفایل عمومی مشاور با QR — مسیرهایی مثل /counselors/:slug؛ هدر و منو با سوییچ صفحه',
    moduleKey: SITE_MODULE_KEYS.SCHOOL,
    altModuleKeys: [SITE_MODULE_KEYS.SCHOOL_PROFILE],
    contentWidget: 'counselor_page',
    event: 'module-page-layout-changed:counselor',
    ownChromeWhenSchool: true,
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
    desc: 'سفارش و شارژ سرور ابری اشتراکی ربو — هدر مشترک صفحات داخلی',
    moduleKey: SITE_MODULE_KEYS.CLOUD_SERVER,
    contentWidget: 'cloud_server_page',
    event: 'module-page-layout-changed:cloud_server',
    keepOwnChrome: false,
  },
  {
    key: 'reboserver',
    path: '/reboserver',
    label: 'پنل سرور ربو (/reboserver)',
    desc:
      'مدیریت سرور ابری قرارداد — خبر فوری و هدر از «چیدمان مشترک» می‌آید (مثل بقیه صفحات داخلی)',
    moduleKey: SITE_MODULE_KEYS.CLOUD_SERVER,
    contentWidget: 'reboserver_page',
    event: 'module-page-layout-changed:reboserver',
    keepOwnChrome: false,
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

/**
 * برای مسیرهایی مثل /repairs/track/:token → تعریف صفحهٔ ریشهٔ ماژول (repairs).
 * صفحه اصلی (/) null برمی‌گرداند.
 */
export function getModulePageDefForPath(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '') || ''
  if (!p || p === '/') return null
  let best = null
  let bestLen = -1
  for (const def of MODULE_PAGE_DEFS) {
    const path = String(def.path || '').replace(/\/+$/, '') || ''
    if (!path) continue
    if (p === path || p.startsWith(`${path}/`)) {
      if (path.length > bestLen) {
        best = def
        bestLen = path.length
      }
    }
    const related = Array.isArray(def.relatedPaths) ? def.relatedPaths : []
    for (const rel of related) {
      const rp = String(rel || '').replace(/\/+$/, '') || ''
      if (!rp) continue
      if (p === rp || p.startsWith(`${rp}/`)) {
        if (rp.length > bestLen) {
          best = def
          bestLen = rp.length
        }
      }
    }
  }
  return best
}

/** آیا این مسیر شاخهٔ داخلی یک صفحهٔ ماژول است (نه خود خانه)؟ */
export function isInternalModuleBranchPath(pathname) {
  return Boolean(getModulePageDefForPath(pathname))
}

export function isSharedInternalLayoutKey(key) {
  const k = String(key || '')
  return (
    k === SHARED_INTERNAL_LAYOUT_KEY ||
    k === SHARED_INTERNAL_LAYOUT_KEY_LEGACY
  )
}

/** خواندن چیدمان مشترک از map (کلید جدید یا قدیمی) */
export function getSharedInternalLayoutRaw(modulePageLayouts) {
  const root =
    modulePageLayouts && typeof modulePageLayouts === 'object'
      ? modulePageLayouts
      : {}
  if (root[SHARED_INTERNAL_LAYOUT_KEY] != null) {
    return root[SHARED_INTERNAL_LAYOUT_KEY]
  }
  if (root[SHARED_INTERNAL_LAYOUT_KEY_LEGACY] != null) {
    return root[SHARED_INTERNAL_LAYOUT_KEY_LEGACY]
  }
  return null
}

function layoutHasWidgets(layout) {
  return (layout?.rows || []).some((row) =>
    (row.columns || []).some((col) => (col.widgets || []).length > 0),
  )
}

/** چیدمان خالی مشترک — یک سکشن آماده برای هدر/منو */
export function createDefaultSharedInternalLayout() {
  return normalizeHomeLayout({
    version: 2,
    page_width: 'boxed',
    max_width: 1200,
    gutter: 16,
    rows: [
      {
        id: 'sec_shared_chrome_default',
        template: '1',
        width: 'full',
        padding_y: 'none',
        columns: [
          {
            id: 'col_shared_chrome_default',
            span: 100,
            widgets: [],
          },
        ],
      },
    ],
  })
}

/**
 * چیدمان مشترک نباید ویجت محتوای صفحه (*_page) داشته باشد.
 * سکشن‌های خالی را نگه می‌داریم تا در استودیو بشود ویجت اضافه کرد
 * (حذف سکشن خالی باعث می‌شد ذخیره/افزودن خبر فوری عملاً کار نکند).
 */
export function normalizeSharedInternalLayout(raw) {
  const L = normalizeHomeLayout(raw || {})
  const rows = (L.rows || []).map((row) => ({
    ...row,
    columns: (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).filter(
        (w) => !isModulePageContentWidget(w?.type),
      ),
    })),
  }))
  if (!rows.length) {
    return createDefaultSharedInternalLayout()
  }
  return normalizeHomeLayout({ ...L, rows })
}

export function sharedInternalLayoutHasContent(raw) {
  return layoutHasWidgets(normalizeSharedInternalLayout(raw))
}

export function createDefaultModulePageLayout(pageKey) {
  if (isSharedInternalLayoutKey(pageKey)) {
    return createDefaultSharedInternalLayout()
  }
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
  if (isSharedInternalLayoutKey(pageKey)) {
    return normalizeSharedInternalLayout(raw)
  }
  // هدر/منو/فوتر سراسری — نباید به layout صفحه ماژول تبدیل شوند
  if (
    pageKey === 'chrome_header' ||
    pageKey === 'chrome_menu' ||
    pageKey === 'chrome_footer'
  ) {
    const kind =
      pageKey === 'chrome_header'
        ? 'header'
        : pageKey === 'chrome_menu'
          ? 'menu'
          : 'footer'
    const L = normalizeHomeLayout(raw || {})
    if (!L.rows?.length) {
      return normalizeHomeLayout({
        version: 2,
        page_width: 'full',
        max_width: 1200,
        gutter: 16,
        rows: [
          {
            id: `sec_${kind}_default`,
            template: '1',
            width: 'full',
            padding_y: 'none',
            columns: [{ id: `col_${kind}_default`, span: 100, widgets: [] }],
          },
        ],
      })
    }
    return L
  }
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return createDefaultModulePageLayout(pageKey)
  }
  return L
}

export function normalizeModulePageLayoutsMap(raw = {}) {
  const root = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const out = {
    [SHARED_INTERNAL_LAYOUT_KEY]: normalizeSharedInternalLayout(
      getSharedInternalLayoutRaw(root),
    ),
  }
  MODULE_PAGE_DEFS.forEach((def) => {
    out[def.key] = normalizeModulePageLayout(root[def.key], def.key)
  })
  Object.keys(root).forEach((key) => {
    if (out[key]) return
    if (isSharedInternalLayoutKey(key)) return
    out[key] = normalizeModulePageLayout(root[key], key)
  })
  return out
}
