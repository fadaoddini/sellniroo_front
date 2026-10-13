// config/siteModules.js — کاتالوگ ماژول‌های قابل فعال/غیرفعال

export const SITE_MODULE_KEYS = {
  BREAKING_NEWS: 'breaking_news',
  CORPORATE_SYSTEM: 'corporate_system',
  HEADER_BY_MENU_TOP: 'header_by_menu_top',
  CORPORATE_MOBILE_NAV: 'corporate_mobile_nav',
  HERO_SLIDER: 'hero_slider',
  JOB_BOARD: 'job_board',
  JOB_HEADER: 'job_header',
  JOB_MOBILE_NAV: 'job_mobile_nav',
  JOB_LISTINGS: 'job_listings',
  JOB_PROFILE: 'job_profile',
  NEWS: 'news',
  NEWS_SECTION: 'news_section',
  SALES_MARKETING: 'sales_marketing',
  CTA_SECTION: 'cta_section',
  SITE_FOOTER: 'site_footer',
  ABOUT_US: 'about_us',
  VIDEOINSTA: 'videoinsta',
  CATALOG: 'catalog',
  QUIZ: 'quiz',
  FAQ: 'faq',
  SCHOOL: 'school',
}

/** متادیتای فرانت برای نمایش در adminweb (در صورت نبود رکورد API) */
export const SITE_MODULES_CATALOG = [
  {
    key: SITE_MODULE_KEYS.BREAKING_NEWS,
    name: 'نوار خبر فوری (هدر بالا)',
    name_en: 'Breaking News Bar',
    description: 'نوار بالای سایت شامل اخبار فوری، تاریخ و منوی کاربری',
    category: 'layout',
    parentKey: null,
    componentPath: 'components/common/breakingnews/BreakingNews.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
    name: 'سیستم شرکتی',
    name_en: 'Corporate System',
    description: 'مجموعه هدر و منوی شرکتی — خاموش کردن همه زیرمجموعه‌ها را مخفی می‌کند',
    category: 'corporate',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: false,
  },
  {
    key: SITE_MODULE_KEYS.HEADER_BY_MENU_TOP,
    name: 'هدر دارای منو',
    name_en: 'Header With Menu',
    description: 'هدر سیاه با لینک‌های قابل مدیریت از داشبورد',
    category: 'corporate',
    parentKey: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
    componentPath: 'components/common/HeaderByMenuTop/HeaderByMenuTop.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.CORPORATE_MOBILE_NAV,
    name: 'منوی حالت موبایل',
    name_en: 'Corporate Mobile Menu',
    description: 'نوار پایین موبایل با همان لینک‌های منوی شرکتی',
    category: 'corporate',
    parentKey: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
    componentPath: 'components/common/CorporateMobileNav/CorporateMobileNav.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.HERO_SLIDER,
    name: 'اسلایدر هیرو (بنر اصلی)',
    name_en: 'Hero Slider',
    description: 'اسلایدر تصویری بالای صفحه اصلی',
    category: 'layout',
    parentKey: null,
    componentPath: 'components/slider/HeroSlider.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.JOB_BOARD,
    name: 'سیستم کاریابی',
    name_en: 'Job Board System',
    description: 'مجموعه کامل کاریابی — خاموش کردن همهٔ اجزا را با هم مخفی می‌کند',
    category: 'jobs',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.JOB_HEADER,
    name: 'هدر کاریابی',
    name_en: 'Job Board Header',
    description: 'هدر اصلی با لوگو، جستجوی شغل و دکمه ثبت آگهی',
    category: 'jobs',
    parentKey: SITE_MODULE_KEYS.JOB_BOARD,
    componentPath: 'components/common/Header.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.JOB_MOBILE_NAV,
    name: 'منوی موبایل سیستم کاریابی',
    name_en: 'Job Board Mobile Menu',
    description: 'نوار پایین موبایل با لینک‌های هماهنگ کاریابی',
    category: 'jobs',
    parentKey: SITE_MODULE_KEYS.JOB_BOARD,
    componentPath: 'components/common/MobileBottomNav.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.JOB_LISTINGS,
    name: 'لیست و فیلتر آگهی‌ها',
    name_en: 'Job Listings Box',
    description: 'باکس آگهی‌ها، فیلترها و کارت‌های شغلی',
    category: 'jobs',
    parentKey: SITE_MODULE_KEYS.JOB_BOARD,
    componentPath: 'components/AllBoxItem/AllBoxItem.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.JOB_PROFILE,
    name: 'پروفایل کاریابی',
    name_en: 'Job Board Profile',
    description:
      'بخش آگهی/رزومه در /profile — با خاموش شدن، پروفایل عادی جایگزین می‌شود',
    category: 'jobs',
    parentKey: SITE_MODULE_KEYS.JOB_BOARD,
    componentPath: 'modules/profile/components/ProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NEWS,
    name: 'ماژول اخبار',
    name_en: 'News Module',
    description: 'مجموعه اخبار — خاموش کردن همهٔ اجزای اخبار را مخفی می‌کند',
    category: 'news',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NEWS_SECTION,
    name: 'بخش اخبار صفحه اصلی',
    name_en: 'Homepage News Section',
    description: 'کارت‌های اخبار در صفحه اصلی (NewsSection)',
    category: 'news',
    parentKey: SITE_MODULE_KEYS.NEWS,
    componentPath: 'modules/home/components/sections/news/NewsSection.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SALES_MARKETING,
    name: 'ماژول بازاریابی و فروش',
    name_en: 'Sales & Marketing',
    description: 'مجموعه بازاریابی و فروش — خاموش کردن فرم تماس و بخش‌های مرتبط را مخفی می‌کند',
    category: 'sales',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.CTA_SECTION,
    name: 'بخش تماس و درخواست (صفحه اصلی)',
    name_en: 'Homepage CTA / Contact',
    description: 'فرم مشاوره و تماس صفحه اصلی (CTASection)',
    category: 'sales',
    parentKey: SITE_MODULE_KEYS.SALES_MARKETING,
    componentPath: 'modules/home/components/sections/CTASection.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SITE_FOOTER,
    name: 'فوتر سایت',
    name_en: 'Site Footer',
    description: 'فوتر پایین صفحات سایت با کپی‌رایت و اعتبار طراح',
    category: 'layout',
    parentKey: null,
    componentPath: 'components/common/SiteFooter.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.ABOUT_US,
    name: 'درباره ما',
    name_en: 'About Us',
    description: 'صفحه درباره ما با محتوای دیتابیس',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/About/index.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.VIDEOINSTA,
    name: 'آرشیو ویدیو (استوری)',
    name_en: 'Video Insta Archive',
    description:
      'موبایل: دایره‌های استوری زیر نوار خبر · دسکتاپ: آرشیو کامل صفحه اصلی',
    category: 'media',
    parentKey: null,
    componentPath: 'components/Story/VideoInstaStoriesRail.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.CATALOG,
    name: 'کاتالوگ دیجیتال',
    name_en: 'Digital Catalog',
    description: 'فلیپ‌بوک کاتالوگ قابل مدیریت از داشبورد',
    category: 'media',
    parentKey: null,
    componentPath: 'components/Catalog/Flipbook.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.QUIZ,
    name: 'آزمون تخصصی',
    name_en: 'Specialty Quiz',
    description: 'آزمون فروش و بازاریابی با جدول نفرات برتر',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/Quiz/Quiz.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.FAQ,
    name: 'سوالات متداول',
    name_en: 'FAQ',
    description: 'صفحه سوالات متداول با مدیریت از داشبورد',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/Faq/FaqPage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SCHOOL,
    name: 'مدرسه',
    name_en: 'School',
    description: 'معلمان، دانش‌آموزان، دروس، تکالیف و آزمون',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/School/SchoolHub.jsx',
    defaultActive: true,
  },
]

export const getCatalogMeta = (key) =>
  SITE_MODULES_CATALOG.find((m) => m.key === key) || null

/**
 * سکشن‌های قابل جابه‌جایی در بدنهٔ صفحه اصلی (HomePage)
 * ترتیب پیش‌فرض = ترتیب فعلی JSX
 */
export const HOMEPAGE_ORDERABLE_MODULES = [
  {
    key: SITE_MODULE_KEYS.NEWS_SECTION,
    name: 'بخش اخبار',
    defaultOrder: 10,
  },
  {
    key: SITE_MODULE_KEYS.VIDEOINSTA,
    name: 'آرشیو ویدیو / استوری',
    defaultOrder: 20,
  },
  {
    key: SITE_MODULE_KEYS.CATALOG,
    name: 'کاتالوگ دیجیتال',
    defaultOrder: 30,
  },
  {
    key: SITE_MODULE_KEYS.JOB_LISTINGS,
    name: 'لیست آگهی‌ها',
    defaultOrder: 40,
  },
  {
    key: SITE_MODULE_KEYS.CTA_SECTION,
    name: 'تماس و درخواست',
    defaultOrder: 50,
  },
]

export const HOMEPAGE_ORDERABLE_KEYS = HOMEPAGE_ORDERABLE_MODULES.map((m) => m.key)

/** مرتب‌سازی کلیدهای صفحه اصلی بر اساس home_order از API */
export function sortHomepageModuleKeys(list) {
  const byKey = Object.fromEntries(
    (list || [])
      .filter((m) => HOMEPAGE_ORDERABLE_KEYS.includes(m.key))
      .map((m) => [m.key, m])
  )
  const defaults = Object.fromEntries(
    HOMEPAGE_ORDERABLE_MODULES.map((m) => [m.key, m.defaultOrder])
  )
  return [...HOMEPAGE_ORDERABLE_KEYS].sort((a, b) => {
    const ao = byKey[a]?.home_order ?? defaults[a] ?? 999
    const bo = byKey[b]?.home_order ?? defaults[b] ?? 999
    if (ao !== bo) return ao - bo
    return a.localeCompare(b)
  })
}

/**
 * مسیرهای داشبورد / ادمین که به ماژول سایت وابسته‌اند.
 * اگر ماژول خاموش باشد، آیتم مربوطه در داشبورد هم غیرفعال می‌شود.
 */
export const DASHBOARD_ROUTE_MODULES = {
  '/ticker': SITE_MODULE_KEYS.BREAKING_NEWS,
  '/header-menu': SITE_MODULE_KEYS.CORPORATE_SYSTEM,
  '/hero-slider': SITE_MODULE_KEYS.HERO_SLIDER,
  '/jobs-manage': SITE_MODULE_KEYS.JOB_BOARD,
  '/post-job': SITE_MODULE_KEYS.JOB_BOARD,
  '/jobs': SITE_MODULE_KEYS.JOB_LISTINGS,
  // /profile همیشه باز است (کاریابی یا پروفایل عادی)
  '/news-management': SITE_MODULE_KEYS.NEWS,
  '/news': SITE_MODULE_KEYS.NEWS,
  '/platform-connections': SITE_MODULE_KEYS.NEWS,
  '/sale': SITE_MODULE_KEYS.SALES_MARKETING,
  '/request-types': SITE_MODULE_KEYS.SALES_MARKETING,
  '/about': SITE_MODULE_KEYS.ABOUT_US,
  '/about-manage': SITE_MODULE_KEYS.ABOUT_US,
  '/videoinsta-manage': SITE_MODULE_KEYS.VIDEOINSTA,
  '/catalog-manage': SITE_MODULE_KEYS.CATALOG,
  '/quiz': SITE_MODULE_KEYS.QUIZ,
  '/quiz-manage': SITE_MODULE_KEYS.QUIZ,
  '/faq': SITE_MODULE_KEYS.FAQ,
  '/faq-manage': SITE_MODULE_KEYS.FAQ,
  '/school': SITE_MODULE_KEYS.SCHOOL,
  '/school-manage': SITE_MODULE_KEYS.SCHOOL,
  '/school/teacher': SITE_MODULE_KEYS.SCHOOL,
  '/school/student': SITE_MODULE_KEYS.SCHOOL,
}

/** کد بخش‌های کارمندی که به ماژول سایت وابسته‌اند */
export const DASHBOARD_SECTION_MODULES = {
  jobs: SITE_MODULE_KEYS.JOB_BOARD,
  jobisell: SITE_MODULE_KEYS.JOB_BOARD,
  profile: SITE_MODULE_KEYS.JOB_PROFILE,
  ticker: SITE_MODULE_KEYS.BREAKING_NEWS,
  'header-menu': SITE_MODULE_KEYS.CORPORATE_SYSTEM,
  headerbymenutop: SITE_MODULE_KEYS.HEADER_BY_MENU_TOP,
  corporate: SITE_MODULE_KEYS.CORPORATE_SYSTEM,
  'corporate-system': SITE_MODULE_KEYS.CORPORATE_SYSTEM,
  'corporate-mobile-nav': SITE_MODULE_KEYS.CORPORATE_MOBILE_NAV,
  hero: SITE_MODULE_KEYS.HERO_SLIDER,
  'hero-slider': SITE_MODULE_KEYS.HERO_SLIDER,
  news: SITE_MODULE_KEYS.NEWS,
  'news-management': SITE_MODULE_KEYS.NEWS,
  'platform-connections': SITE_MODULE_KEYS.NEWS,
  sale: SITE_MODULE_KEYS.SALES_MARKETING,
  sales: SITE_MODULE_KEYS.SALES_MARKETING,
  marketing: SITE_MODULE_KEYS.SALES_MARKETING,
  'request-types': SITE_MODULE_KEYS.SALES_MARKETING,
  about: SITE_MODULE_KEYS.ABOUT_US,
  'about-manage': SITE_MODULE_KEYS.ABOUT_US,
  'about-us': SITE_MODULE_KEYS.ABOUT_US,
  'videoinsta-manage': SITE_MODULE_KEYS.VIDEOINSTA,
  videoinsta: SITE_MODULE_KEYS.VIDEOINSTA,
  'catalog-manage': SITE_MODULE_KEYS.CATALOG,
  catalog: SITE_MODULE_KEYS.CATALOG,
  quiz: SITE_MODULE_KEYS.QUIZ,
  'quiz-manage': SITE_MODULE_KEYS.QUIZ,
  faq: SITE_MODULE_KEYS.FAQ,
  'faq-manage': SITE_MODULE_KEYS.FAQ,
  school: SITE_MODULE_KEYS.SCHOOL,
  'school-manage': SITE_MODULE_KEYS.SCHOOL,
}

export function getModuleKeyForDashboardHref(href) {
  if (!href) return null
  const path = String(href).split('?')[0].replace(/\/$/, '') || '/'
  if (DASHBOARD_ROUTE_MODULES[path]) return DASHBOARD_ROUTE_MODULES[path]
  // پیشوندها مثلاً /jobs/123
  const hit = Object.keys(DASHBOARD_ROUTE_MODULES).find(
    (route) => route !== '/' && path.startsWith(`${route}/`)
  )
  return hit ? DASHBOARD_ROUTE_MODULES[hit] : null
}

export function getModuleKeyForSectionCode(code) {
  if (!code) return null
  const normalized = String(code).toLowerCase().replace(/_/g, '-')
  return DASHBOARD_SECTION_MODULES[normalized] || null
}

/** آیا لینک داشبورد با توجه به map ماژول‌ها مجاز است؟ */
export function isDashboardItemModuleActive(href, moduleMap, sectionCode) {
  const key =
    getModuleKeyForDashboardHref(href) ||
    getModuleKeyForSectionCode(sectionCode)
  if (!key) return true
  if (!moduleMap || !Object.prototype.hasOwnProperty.call(moduleMap, key)) {
    return true
  }
  return !!moduleMap[key]
}

/** ساخت درخت والد → فرزندان از لیست تخت */
export function groupModulesTree(list = []) {
  const roots = []
  const childrenByParent = {}

  list.forEach((m) => {
    const parentKey = m.parent_key || m.parentKey || null
    if (parentKey) {
      if (!childrenByParent[parentKey]) childrenByParent[parentKey] = []
      childrenByParent[parentKey].push(m)
    } else {
      roots.push(m)
    }
  })

  return roots.map((root) => ({
    ...root,
    children: childrenByParent[root.key] || [],
  }))
}
