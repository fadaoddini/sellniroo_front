// config/siteModules.js — کاتالوگ ماژول‌های قابل فعال/غیرفعال

export const SITE_MODULE_KEYS = {
  BREAKING_NEWS: 'breaking_news',
  ADVANCED_MENU: 'advanced_menu',
  SEO: 'seo',
  DATA_PACK_AGRICULTURE: 'data_pack_agriculture',
  DATA_PACK_BRANDING: 'data_pack_branding',
  DATA_PACK_CORPORATE: 'data_pack_corporate',
  DATA_PACK_JOB_THEME_ONE: 'data_pack_job_theme_one',
  /** @deprecated استفاده از ADVANCED_MENU — برای سازگاری موقت */
  CORPORATE_SYSTEM: 'advanced_menu',
  HEADER_BY_MENU_TOP: 'header_by_menu_top',
  CORPORATE_MOBILE_NAV: 'corporate_mobile_nav',
  CORPORATE_BRAND_BAR: 'corporate_brand_bar',
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
  PAYMENT: 'payment',
  SHOP: 'shop',
  SHOP_LISTINGS: 'shop_listings',
  SHOP_PRODUCT: 'shop_product',
  /** تک‌فروشگاهی — یک فروشگاه خودکار، بدون مارکت‌پلیس */
  SINGLE_STORE: 'single_store',
  /** چندفروشندگی — مدیریت همه فروشگاه‌ها، تسویه و محصولات از داشبورد */
  MULTI_VENDOR: 'multi_vendor',
}

/** این دو ماژول همزمان فعال نمی‌شوند (سیاست فروش متفاوت) */
export const EXCLUSIVE_SHOP_MODE_KEYS = [
  SITE_MODULE_KEYS.SINGLE_STORE,
  SITE_MODULE_KEYS.MULTI_VENDOR,
]

/** کلید بسته موضوعی مرتبط با هر ماژول بسته داده */
export const DATA_PACK_TOPIC_KEYS = {
  [SITE_MODULE_KEYS.DATA_PACK_AGRICULTURE]: 'mammut_sabz',
  [SITE_MODULE_KEYS.DATA_PACK_BRANDING]: 'branding_agency',
  [SITE_MODULE_KEYS.DATA_PACK_CORPORATE]: 'corporate_company',
  [SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE]: 'job_theme_one',
}

/** متادیتای فرانت برای نمایش در adminweb (در صورت نبود رکورد API) */
export const SITE_MODULES_CATALOG = [
  {
    key: SITE_MODULE_KEYS.BREAKING_NEWS,
    name: 'ماژول خبر فوری',
    name_en: 'Breaking News Module',
    description: 'نوار خبر فوری — با فعال‌سازی، مدیریت تیترها از داشبورد در دسترس است',
    category: 'layout',
    parentKey: null,
    componentPath: 'components/common/breakingnews/BreakingNews.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SEO,
    name: 'ماژول تنظیمات سئو',
    name_en: 'SEO Settings Module',
    description: 'با فعال‌سازی، دسترسی کامل تنظیمات سئو و برند در داشبورد باز می‌شود',
    category: 'seo',
    parentKey: null,
    componentPath: '',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.ADVANCED_MENU,
    name: 'ماژول منوی پیشرفته',
    name_en: 'Advanced Menu Module',
    description:
      'منوی بالای سایت و منوی موبایل — با فعال‌سازی، دسترسی کامل تنظیمات منو در داشبورد باز می‌شود',
    category: 'layout',
    parentKey: null,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_AGRICULTURE,
    name: 'ماژول بسته داده کود و کشاورزی',
    name_en: 'Agriculture Data Pack',
    description: 'واریز دادهٔ آمادهٔ موضوع کود و کشاورزی — فقط از داشبورد، بدون ویجت',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'mammut_sabz',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_BRANDING,
    name: 'ماژول بسته داده برندینگ',
    name_en: 'Branding Data Pack',
    description: 'واریز دادهٔ آمادهٔ موضوع برندینگ — فقط از داشبورد، بدون ویجت',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'branding_agency',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_CORPORATE,
    name: 'ماژول بسته شرکتی',
    name_en: 'Corporate Data Pack',
    description: 'واریز دادهٔ آمادهٔ سایت شرکتی — فقط از داشبورد، بدون ویجت',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'corporate_company',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
    name: 'سیستم کاریابی تم یک',
    name_en: 'Job Board Theme One',
    description:
      'چیدمان صفحه اصلی و سینگل آگهی + داده فیک کاریابی — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'job_theme_one',
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
    name: 'ماژول درباره ما',
    name_en: 'About Us Module',
    description: 'صفحه درباره ما — در ویجت‌ها و داشبورد برای مدیریت محتوا',
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
      'ویجت استوری و آرشیو ویدیو در صفحه‌ساز — هر جا بخواهید بچینید',
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
  {
    key: SITE_MODULE_KEYS.PAYMENT,
    name: 'ماژول پرداخت',
    name_en: 'Payment Module',
    description:
      'درگاه سراسری — فروشگاه، کیف پول، اخبار، کاریابی و امکانات بعدی؛ تنظیمات از داشبورد و adminweb',
    category: 'commerce',
    parentKey: null,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SHOP,
    name: 'ماژول فروشگاه',
    name_en: 'Shop Module',
    description:
      'کل فروشگاه — اگر خاموش باشد هیچ فروشگاهی نیست. شامل امکانات عمومی و یکی از دو سیاست تک‌فروشگاهی یا چندفروشندگی',
    category: 'commerce',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SHOP_LISTINGS,
    name: 'ویترین و لیست (عمومی)',
    name_en: 'Shop Listings (Shared)',
    description:
      'مشترک هر دو سیاست — ویجت‌های لیست، ریسایکلر، کارت، گرید و استوری',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.SHOP,
    componentPath: 'components/widgets/shop/ShopProductWidgets.jsx',
    defaultActive: true,
    shopRole: 'shared',
  },
  {
    key: SITE_MODULE_KEYS.SHOP_PRODUCT,
    name: 'سینگل محصول (عمومی)',
    name_en: 'Product Single (Shared)',
    description: 'مشترک هر دو سیاست — صفحه جزئیات محصول و چیدمان PDP',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.SHOP,
    componentPath: '',
    defaultActive: true,
    shopRole: 'shared',
  },
  {
    key: SITE_MODULE_KEYS.SINGLE_STORE,
    name: 'تک‌فروشگاهی',
    name_en: 'Single Store',
    description:
      'سیاست یک فروشگاه — فروشگاه خودکار و /shop-panel. با چندفروشندگی همزمان فعال نمی‌شود',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.SHOP,
    componentPath: '',
    defaultActive: true,
    dashboardOnly: true,
    shopRole: 'mode',
  },
  {
    key: SITE_MODULE_KEYS.MULTI_VENDOR,
    name: 'چندفروشندگی',
    name_en: 'Multi-Vendor',
    description:
      'سیاست مارکت‌پلیس — مدیریت چند فروشگاه، تسویه و محصولات از داشبورد. با تک‌فروشگاهی همزمان فعال نمی‌شود',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.SHOP,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    shopRole: 'mode',
  },
]

export const getCatalogMeta = (key) =>
  SITE_MODULES_CATALOG.find((m) => m.key === key) || null

/** ماژول‌هایی که فقط داشبورد/واریز داده دارند و در کاتالوگ ویجت نیستند */
export function isDashboardOnlyModule(key) {
  const meta = getCatalogMeta(key)
  return !!(meta?.dashboardOnly || meta?.category === 'data_pack')
}

/** کلیدهایی که در لیست ماژول‌های adminweb نباید نمایش داده شوند */
export const HIDDEN_MODULE_KEYS = new Set([
  'corporate_system',
  'header_by_menu_top',
  'corporate_mobile_nav',
  'corporate_brand_bar',
])

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
    key: SITE_MODULE_KEYS.SHOP_LISTINGS,
    name: 'ویترین فروشگاه',
    defaultOrder: 35,
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
  '/header-menu': SITE_MODULE_KEYS.ADVANCED_MENU,
  '/site-settings': SITE_MODULE_KEYS.SEO,
  '/hero-slider': SITE_MODULE_KEYS.HERO_SLIDER,
  '/jobs-manage': SITE_MODULE_KEYS.JOB_BOARD,
  '/job-single': SITE_MODULE_KEYS.JOB_BOARD,
  '/post-job': SITE_MODULE_KEYS.JOB_BOARD,
  '/jobs-data': SITE_MODULE_KEYS.JOB_BOARD,
  '/jobs': SITE_MODULE_KEYS.JOB_LISTINGS,
  // /profile همیشه باز است (کاریابی یا پروفایل عادی)
  '/news-management': SITE_MODULE_KEYS.NEWS,
  // لیست/اسلایدر ویژه به بخش اخبار صفحه اصلی وابسته‌اند
  '/news-featured-list': SITE_MODULE_KEYS.NEWS_SECTION,
  '/news-by-category': SITE_MODULE_KEYS.NEWS_SECTION,
  '/news-latest': SITE_MODULE_KEYS.NEWS_SECTION,
  '/news-recycler': SITE_MODULE_KEYS.NEWS_SECTION,
  '/news-list': SITE_MODULE_KEYS.NEWS_SECTION,
  '/news-single': SITE_MODULE_KEYS.NEWS,
  '/news': SITE_MODULE_KEYS.NEWS,
  // چیدمان /news از AdminWeb tab news_list_layout
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
  '/payment-manage': SITE_MODULE_KEYS.PAYMENT,
  // عمومی — وابسته به والد shop
  '/shop-manage': SITE_MODULE_KEYS.SHOP,
  '/shop-panel': SITE_MODULE_KEYS.SHOP,
  '/product-single': SITE_MODULE_KEYS.SHOP_PRODUCT,
  '/adminshop': SITE_MODULE_KEYS.SHOP,
  '/adminshops': SITE_MODULE_KEYS.SHOP,
  '/adminproducts': SITE_MODULE_KEYS.SHOP,
  '/admincategories': SITE_MODULE_KEYS.SHOP,
  '/shop': SITE_MODULE_KEYS.SHOP,
  '/cart': SITE_MODULE_KEYS.SHOP,
  // سیاست چندفروشندگی (مؤثر فقط اگر shop هم روشن باشد)
  '/shops-manage': SITE_MODULE_KEYS.MULTI_VENDOR,
  '/shops-accounting': SITE_MODULE_KEYS.MULTI_VENDOR,
  '/shops-products': SITE_MODULE_KEYS.MULTI_VENDOR,
}

/** کد بخش‌های کارمندی که به ماژول سایت وابسته‌اند */
export const DASHBOARD_SECTION_MODULES = {
  jobs: SITE_MODULE_KEYS.JOB_BOARD,
  jobisell: SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-manage': SITE_MODULE_KEYS.JOB_BOARD,
  'job-single': SITE_MODULE_KEYS.JOB_BOARD,
  'post-job': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-data': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-locations': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-cooperation': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-categories': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-titles': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-filters': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-companies': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-applications': SITE_MODULE_KEYS.JOB_BOARD,
  'jobs-resumes': SITE_MODULE_KEYS.JOB_BOARD,
  profile: SITE_MODULE_KEYS.JOB_PROFILE,
  ticker: SITE_MODULE_KEYS.BREAKING_NEWS,
  'header-menu': SITE_MODULE_KEYS.ADVANCED_MENU,
  'site-settings': SITE_MODULE_KEYS.SEO,
  seo: SITE_MODULE_KEYS.SEO,
  headerbymenutop: SITE_MODULE_KEYS.ADVANCED_MENU,
  'advanced-menu': SITE_MODULE_KEYS.ADVANCED_MENU,
  'corporate-mobile-nav': SITE_MODULE_KEYS.ADVANCED_MENU,
  'corporate-brand-bar': SITE_MODULE_KEYS.ADVANCED_MENU,
  corporatebrandbar: SITE_MODULE_KEYS.ADVANCED_MENU,
  'header-by-menu-top': SITE_MODULE_KEYS.ADVANCED_MENU,
  hero: SITE_MODULE_KEYS.HERO_SLIDER,
  'hero-slider': SITE_MODULE_KEYS.HERO_SLIDER,
  news: SITE_MODULE_KEYS.NEWS,
  'news-management': SITE_MODULE_KEYS.NEWS,
  'news-featured': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-featured-list': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-by-category': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-latest': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-recycler': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-list': SITE_MODULE_KEYS.NEWS_SECTION,
  'news-single': SITE_MODULE_KEYS.NEWS,
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
  payment: SITE_MODULE_KEYS.PAYMENT,
  'payment-manage': SITE_MODULE_KEYS.PAYMENT,
  shop: SITE_MODULE_KEYS.SHOP,
  'shop-manage': SITE_MODULE_KEYS.SHOP,
  'shop-panel': SITE_MODULE_KEYS.SHOP,
  'product-single': SITE_MODULE_KEYS.SHOP_PRODUCT,
  adminshop: SITE_MODULE_KEYS.SHOP,
  adminshops: SITE_MODULE_KEYS.SHOP,
  adminproducts: SITE_MODULE_KEYS.SHOP,
  admincategories: SITE_MODULE_KEYS.SHOP,
  'shop-listings': SITE_MODULE_KEYS.SHOP_LISTINGS,
  'single-store': SITE_MODULE_KEYS.SINGLE_STORE,
  single_store: SITE_MODULE_KEYS.SINGLE_STORE,
  'multi-vendor': SITE_MODULE_KEYS.MULTI_VENDOR,
  multi_vendor: SITE_MODULE_KEYS.MULTI_VENDOR,
  'shops-manage': SITE_MODULE_KEYS.MULTI_VENDOR,
  'shops-accounting': SITE_MODULE_KEYS.MULTI_VENDOR,
  'shops-products': SITE_MODULE_KEYS.MULTI_VENDOR,
  'data-pack-agriculture': SITE_MODULE_KEYS.DATA_PACK_AGRICULTURE,
  'data-pack-branding': SITE_MODULE_KEYS.DATA_PACK_BRANDING,
  'data-pack-corporate': SITE_MODULE_KEYS.DATA_PACK_CORPORATE,
  'data-pack-job-theme-one': SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
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

/** فروشگاه والد روشن است؟ */
export function isShopModuleOn(moduleMap) {
  if (!moduleMap || !Object.keys(moduleMap).length) return false
  if (!Object.prototype.hasOwnProperty.call(moduleMap, SITE_MODULE_KEYS.SHOP)) {
    return true
  }
  return !!moduleMap[SITE_MODULE_KEYS.SHOP]
}

/** چندفروشندگی مؤثر = shop + multi_vendor */
export function isEffectiveMultiVendor(moduleMap) {
  return (
    isShopModuleOn(moduleMap) && !!moduleMap?.[SITE_MODULE_KEYS.MULTI_VENDOR]
  )
}

/** تک‌فروشگاهی مؤثر = shop + single_store و نه multi */
export function isEffectiveSingleStore(moduleMap) {
  if (!isShopModuleOn(moduleMap)) return false
  if (moduleMap?.[SITE_MODULE_KEYS.MULTI_VENDOR]) return false
  if (
    Object.prototype.hasOwnProperty.call(
      moduleMap || {},
      SITE_MODULE_KEYS.SINGLE_STORE,
    )
  ) {
    return !!moduleMap[SITE_MODULE_KEYS.SINGLE_STORE]
  }
  return true
}

/** آیا لینک داشبورد با توجه به map ماژول‌ها مجاز است؟ */
export function isDashboardItemModuleActive(href, moduleMap, sectionCode) {
  // sectionCode اولویت دارد تا اکشن‌های هم‌مسیر (مثل اسلایدر ویژه زیر اخبار) جدا گیت شوند
  const key =
    getModuleKeyForSectionCode(sectionCode) ||
    getModuleKeyForDashboardHref(href)
  if (!key) return true
  // تا وقتی map لود نشده، آیتم‌های وابسته به ماژول را نشان نده
  if (!moduleMap || !Object.keys(moduleMap).length) return false

  // سیاست چندفروشندگی فقط وقتی مؤثر است
  if (key === SITE_MODULE_KEYS.MULTI_VENDOR) {
    return isEffectiveMultiVendor(moduleMap)
  }
  // تک‌فروشگاهی فقط وقتی مؤثر است
  if (key === SITE_MODULE_KEYS.SINGLE_STORE) {
    return isEffectiveSingleStore(moduleMap)
  }
  // هر چیز وابسته به shop وقتی والد خاموش است مخفی
  if (
    key === SITE_MODULE_KEYS.SHOP ||
    key === SITE_MODULE_KEYS.SHOP_LISTINGS ||
    key === SITE_MODULE_KEYS.SHOP_PRODUCT
  ) {
    return isShopModuleOn(moduleMap) && !!moduleMap[key]
  }

  if (!Object.prototype.hasOwnProperty.call(moduleMap, key)) {
    return false
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
