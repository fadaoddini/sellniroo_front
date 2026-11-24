// config/siteModules.js — کاتالوگ ماژول‌های قابل فعال/غیرفعال

export const SITE_MODULE_KEYS = {
  BREAKING_NEWS: 'breaking_news',
  ADVANCED_MENU: 'advanced_menu',
  SEO: 'seo',
  DATA_PACK_AGRICULTURE: 'data_pack_agriculture',
  DATA_PACK_BRANDING: 'data_pack_branding',
  DATA_PACK_CORPORATE: 'data_pack_corporate',
  DATA_PACK_JOB_THEME_ONE: 'data_pack_job_theme_one',
  DATA_PACK_JOB_THEME_TWO: 'data_pack_job_theme_two',
  DATA_PACK_BOOKING_THEME_ONE: 'data_pack_booking_theme_one',
  DATA_PACK_SHOP_THEME_ONE: 'data_pack_shop_theme_one',
  DATA_PACK_MARKETPLACE_THEME_ONE: 'data_pack_marketplace_theme_one',
  DATA_PACK_AGRI_THEME_ONE: 'data_pack_agri_theme_one',
  DATA_PACK_BRANDING_THEME_ONE: 'data_pack_branding_theme_one',
  DATA_PACK_SCHOOL_THEME_ONE: 'data_pack_school_theme_one',
  DATA_PACK_REBO_THEME_ONE: 'data_pack_rebo_theme_one',
  DATA_PACK_SADRA_THEME_ONE: 'data_pack_sadra_theme_one',
  DATA_PACK_CRM_THEME_ONE: 'data_pack_crm_theme_one',
  DATA_PACK_INVENTORY_THEME_ONE: 'data_pack_inventory_theme_one',
  DATA_PACK_GYM_BODYBUILDING_THEME_ONE: 'data_pack_gym_bodybuilding_theme_one',
  BOOKING: 'booking',
  BOOKING_WIDGET: 'booking_widget',
  BOOKING_SERVICES: 'booking_services',
  BOOKING_STAFF: 'booking_staff',
  BOOKING_LOOKUP: 'booking_lookup',
  BOOKING_CTA: 'booking_cta',
  NOBAT: 'nobat',
  NOBAT_HERO: 'nobat_hero',
  NOBAT_PILLARS: 'nobat_pillars',
  NOBAT_PARTS: 'nobat_parts',
  NOBAT_SEARCH: 'nobat_search',
  NOBAT_PROCESS: 'nobat_process',
  NOBAT_BOOK: 'nobat_book',
  NOBAT_TEAM: 'nobat_team',
  NOBAT_REPORT: 'nobat_report',
  NOBAT_CLOSING: 'nobat_closing',
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
  SHOP_PROFILE: 'shop_profile',
  BOOKING_PROFILE: 'booking_profile',
  REPAIRS_PROFILE: 'repairs_profile',
  SCHOOL_PROFILE: 'school_profile',
  NEWS: 'news',
  NEWS_SECTION: 'news_section',
  SALES_MARKETING: 'sales_marketing',
  CTA_SECTION: 'cta_section',
  /** انبارداری پیشرفته — داشبورد /inventory */
  ADVANCED_INVENTORY: 'advanced_inventory',
  INVENTORY_WAREHOUSES: 'inventory_warehouses',
  INVENTORY_PRODUCTS: 'inventory_products',
  INVENTORY_UNITS: 'inventory_units',
  INVENTORY_STOCK_IN: 'inventory_stock_in',
  INVENTORY_STOCK_OUT: 'inventory_stock_out',
  INVENTORY_TRANSACTIONS: 'inventory_transactions',
  INVENTORY_VOUCHERS: 'inventory_vouchers',
  INVENTORY_ALERTS: 'inventory_alerts',
  INVENTORY_AUTHORIZED: 'inventory_authorized_persons',
  INVENTORY_REPORTS: 'inventory_reports',

  SITE_FOOTER: 'site_footer',
  ABOUT_US: 'about_us',
  VIDEOINSTA: 'videoinsta',
  CATALOG: 'catalog',
  QUIZ: 'quiz',
  FAQ: 'faq',
  /** تایم‌لاین منحنی — ویجت و مدیریت محتوا از داشبورد */
  CURVED_TIMELINE: 'curved_timeline',
  SCHOOL: 'school',
  SOFTAPPS: 'softapps',
  REPAIRS: 'repairs',
  /** مدیریت باشگاه بدنسازی — /gym/profile */
  GYM_BODYBUILDING: 'gym_bodybuilding',
  /** مدیریت باشگاه بیلیارد — /gym/billiard */
  GYM_BILLIARD: 'gym_billiard',
  GYM_PROFILE: 'gym_profile',
  /** هیرو دارای منو — خبر فوری + ویجت منو + اسلایدر دیال */
  HERO_WITH_MENU: 'hero_with_menu',
  CLOUD_SERVER: 'cloud_server',
  PAYMENT: 'payment',
  /** پرداخت سفارش بسته‌های ربو — فقط با قالب ربو */
  REBO_PAYMENTS: 'rebo_payments',
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
  [SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO]: 'job_theme_two',
  [SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE]: 'booking_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE]: 'shop_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE]: 'marketplace_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_AGRI_THEME_ONE]: 'agri_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_BRANDING_THEME_ONE]: 'branding_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE]: 'school_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE]: 'rebo_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE]: 'sadra_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE]: 'crm_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE]: 'inventory_theme_one',
  [SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE]: 'gym_bodybuilding_theme_one',
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
    key: SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
    name: 'سیستم کاریابی تم دو',
    name_en: 'Job Board Theme Two',
    description:
      'بسته کامل: خانه، آگهی، اخبار، ویدیو، پروفایل (رزومه/شرکت)، تماس + داده فیک — یک کلیک از موتور و بسته‌ها',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'job_theme_two',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE,
    name: 'سیستم نوبت‌دهی تم یک',
    name_en: 'Booking Theme One',
    description:
      'چیدمان نوبت‌دهی + داده دمو آرایشگاه با تقویم شمسی — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'booking_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE,
    name: 'سیستم تک‌فروشگاهی تم یک',
    name_en: 'Single Store Theme One',
    description:
      'چیدمان ویترین تک‌فروشگاهی + داده دمو محصولات — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'shop_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE,
    name: 'سیستم چندفروشگاهی تم یک',
    name_en: 'Marketplace Theme One',
    description:
      'چیدمان ویترین مارکت‌پلیس + داده دمو محصولات — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'marketplace_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_AGRI_THEME_ONE,
    name: 'سیستم شرکتی کود و سم تم یک',
    name_en: 'Agri Corporate Theme One',
    description:
      'چیدمان شرکتی کود و سم + کاتالوگ و ظاهر سبز — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'agri_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_BRANDING_THEME_ONE,
    name: 'سیستم برندینگ تم یک',
    name_en: 'Branding Theme One',
    description:
      'چیدمان تیره-طلایی استودیو برندینگ + مجله و فرم مشاوره — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'branding_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE,
    name: 'سیستم مدرسه تم یک',
    name_en: 'School Theme One',
    description:
      'چیدمان معرفی کامل امکانات مدرسه + پنل مدیر/معلم/دانش‌آموز — با یک کلیک اعمال می‌شود',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'school_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    name: 'موتور قدرتمند ربو',
    name_en: 'Rebo Power Engine',
    description:
      'بسته کامل یک‌کلیکه: چیدمان فروش ربو، سیستم‌های قابل فروش، قیمت‌گذاری و سفارش از پروفایل',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'rebo_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
    name: 'صدرا',
    name_en: 'Sadra Laser Service',
    description:
      'بسته یک‌کلیکه: خانه، فروشگاه، سبد، پروفایل ترکیبی، نوبت، تعمیرات و پالت روشن صدرا — از تب موتور/بسته‌ها تحویل دهید',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'sadra_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
    name: 'سامانه CRM کامل',
    name_en: 'CRM Suite Theme One',
    description:
      'بسته یک‌کلیکه فروش و بازاریابی + منو و پروفایل جامع (بدون انبار پیش‌فرض) — از تب موتور و بسته‌ها',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'crm_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
    name: 'انبارداری پیشرفته',
    name_en: 'Advanced Inventory Theme One',
    description:
      'بسته یک‌کلیکه انبارداری با تم خاکستری + خبر فوری، ویجت منو و پروفایل جامع — از تب موتور و بسته‌ها',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'inventory_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
    name: 'باشگاه بدنسازی (تم روشن)',
    name_en: 'Gym Bodybuilding Light Theme',
    description:
      'هیرو دارای منو (لوگو/پروفایل/تاریخ) + چیدمان خانه و صفحات باشگاه/پروفایل + منوها + داده اولیه — یک کلیک از موتور و بسته‌ها',
    category: 'data_pack',
    parentKey: null,
    componentPath: '',
    defaultActive: false,
    dashboardOnly: true,
    topicPackKey: 'gym_bodybuilding_theme_one',
  },
  {
    key: SITE_MODULE_KEYS.BOOKING,
    name: 'سیستم نوبت‌دهی',
    name_en: 'Appointment Booking',
    description:
      'رزرو وقت قبلی برای آرایشگاه، مطب، تعویض روغن، وکالت و خدمات مشابه — تقویم شمسی',
    category: 'booking',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: false,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT,
    name: 'ویجت‌های اختصاصی نوبت (صدرا)',
    name_en: 'Nobat Theme Widgets',
    description: 'ویجت‌های اختصاصی صفحه اصلی مرکز خدمات لیزر با پیشوند nobat_',
    category: 'booking',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: false,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_HERO,
    name: 'هیرو نوبت صدرا',
    name_en: 'Nobat Hero',
    description: 'هیرو برند مرکز خدمات لیزر',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_PILLARS,
    name: 'ارکان خدمات نوبت',
    name_en: 'Nobat Pillars',
    description: 'چهار ستون خدمات صدرا',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_PARTS,
    name: 'ویترین قطعات نوبت',
    name_en: 'Nobat Parts',
    description: 'دسته‌های قطعات لیزر',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_SEARCH,
    name: 'جستجوی قطعات نوبت',
    name_en: 'Nobat Parts Search',
    description: 'جستجوی مینیمال قطعات لیزر — تم اختصاصی صدرا',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_PROCESS,
    name: 'فرآیند سرویس نوبت',
    name_en: 'Nobat Process',
    description: 'مراحل رزرو تا گزارش',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_BOOK,
    name: 'باند رزرو نوبت',
    name_en: 'Nobat Book Band',
    description: 'فراخوان رزرو تعمیر',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_TEAM,
    name: 'تیم فنی نوبت',
    name_en: 'Nobat Team',
    description: 'معرفی تکنسین‌ها',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_REPORT,
    name: 'گزارش تعمیر نوبت',
    name_en: 'Nobat Report',
    description: 'پیگیری تکنسین و مراحل',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.NOBAT_CLOSING,
    name: 'جمع‌بندی نوبت',
    name_en: 'Nobat Closing',
    description: 'CTA پایانی مرکز صدرا',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.NOBAT,
    componentPath: 'components/widgets/nobat/NobatWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_WIDGET,
    name: 'ویجت رزرو نوبت',
    name_en: 'Booking Widget',
    description: 'فرم رزرو نوبت در صفحه‌ساز / صفحه اصلی',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'components/Booking/BookingWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_SERVICES,
    name: 'لیست خدمات نوبت‌دهی',
    name_en: 'Booking Services',
    description: 'نمایش کارت خدمات قابل رزرو',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'components/Booking/BookingWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_STAFF,
    name: 'پرسنل نوبت‌دهی',
    name_en: 'Booking Staff',
    description: 'نمایش پرسنل / منابع',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'components/Booking/BookingWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_LOOKUP,
    name: 'پیگیری نوبت',
    name_en: 'Booking Lookup',
    description: 'جستجو و لغو نوبت با کد پیگیری و موبایل',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'components/Booking/BookingWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_CTA,
    name: 'فراخوان رزرو نوبت',
    name_en: 'Booking CTA Banner',
    description: 'بنر دعوت به رزرو در صفحه اصلی / صفحه‌ساز',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'components/Booking/BookingWidgets.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.BOOKING_PROFILE,
    name: 'پروفایل نوبت‌دهی',
    name_en: 'Booking Profile',
    description: 'پروفایل اختصاصی /profile برای نوبت‌ها و پیگیری رزرو',
    category: 'booking',
    parentKey: SITE_MODULE_KEYS.BOOKING,
    componentPath: 'modules/profile/components/BookingProfilePage.jsx',
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
      'پروفایل اختصاصی /profile برای کاریابی — آگهی، رزومه، شرکت و درخواست‌ها',
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
    key: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    name: 'انبارداری پیشرفته',
    name_en: 'Advanced Inventory',
    description:
      'مجموعه کامل انبار: انبارها، کالا، واحد سلسله‌مراتبی، ورود/خروج، حواله، تراکنش، هشدار، افراد مجاز و گزارش — /inventory',
    category: 'inventory',
    parentKey: null,
    isGroup: true,
    componentPath: '',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_WAREHOUSES,
    name: 'مدیریت انبارها',
    name_en: 'Warehouses',
    description: 'تعریف و مدیریت انبارها و موجودی هر انبار',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/warehouses/WarehousesList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_PRODUCTS,
    name: 'کالا و دسته‌بندی',
    name_en: 'Products & Categories',
    description: 'کاتالوگ کالا، کد کالا، دسته و واحد اصلی',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/products/ProductList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_UNITS,
    name: 'واحدهای سلسله‌مراتبی',
    name_en: 'Hierarchical Units',
    description: 'درخت واحد (مثلاً کارتن ← بسته ← عدد) و تبدیل مقدار',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/Units/UnitList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_STOCK_IN,
    name: 'ورود کالا',
    name_en: 'Stock In',
    description: 'ثبت ورود کالا به انبار با واحد سلسله‌مراتبی',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/stock/StockIn.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_STOCK_OUT,
    name: 'خروج کالا',
    name_en: 'Stock Out',
    description: 'ثبت خروج کالا از انبار با تأیید افراد مجاز',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/stock/StockOut.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_TRANSACTIONS,
    name: 'تراکنش‌های انبار',
    name_en: 'Stock Transactions',
    description: 'لیست، تأیید، لغو، برگشت و آرشیو تراکنش‌ها',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/Transactions/TransactionList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_VOUCHERS,
    name: 'حواله‌ها',
    name_en: 'Vouchers',
    description: 'حواله خروج، چاپ و آرشیو',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/vouchers/VoucherList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_ALERTS,
    name: 'هشدار موجودی',
    name_en: 'Stock Alerts',
    description: 'هشدار کمبود / ظرفیت و رفع هشدار',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/Alerts/AlertList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_AUTHORIZED,
    name: 'افراد مجاز',
    name_en: 'Authorized Persons',
    description: 'افراد مجاز تأیید خروج و دسترسی به انبارها',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath:
      'modules/inventory/components/authorized-persons/AuthorizedPersonList.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.INVENTORY_REPORTS,
    name: 'گزارش‌های انبار',
    name_en: 'Inventory Reports',
    description: 'گزارش موجودی، ورود/خروج روزانه و موجودی کم',
    category: 'inventory',
    parentKey: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
    componentPath: 'modules/inventory/components/InventoryDashboard.jsx',
    defaultActive: true,
    dashboardOnly: true,
  },
  {
    key: SITE_MODULE_KEYS.SITE_FOOTER,
    name: 'فوتر سایت',
    name_en: 'Site Footer',
    description: 'فوتر سراسری — موتور اختصاصی ربو و اعتبار طراح',
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
    key: SITE_MODULE_KEYS.CURVED_TIMELINE,
    name: 'تایم لاین منحنی',
    name_en: 'Curved Timeline',
    description: 'تایم‌لاین عمودی منحنی با بافر اسکرول — مدیریت از داشبورد',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/widgets/gym/GymFeatures.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SCHOOL,
    name: 'مدرسه',
    name_en: 'School',
    description: 'معلمان، دانش‌آموزان، دروس، تکالیف و آزمون — ورود از /profile',
    category: 'pages',
    parentKey: null,
    componentPath: 'modules/profile/components/SchoolProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SCHOOL_PROFILE,
    name: 'پروفایل مدرسه',
    name_en: 'School Profile',
    description: 'پروفایل اختصاصی /profile برای نقش‌های مدرسه و وضعیت کلاس',
    category: 'pages',
    parentKey: SITE_MODULE_KEYS.SCHOOL,
    componentPath: 'modules/profile/components/SchoolProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.SOFTAPPS,
    name: 'نرم‌افزارهای کاربردی',
    name_en: 'Utility Software',
    description:
      'انتشار نرم‌افزار رایگان و پولی برای دانلود — پرداخت، آمار دانلود و حسابداری خرید',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/SoftApps/SoftAppsPage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.REPAIRS,
    name: 'تعمیرات و سرویس',
    name_en: 'Repairs & Service',
    description:
      'تعمیرکاران، اجرت، قطعات، سفارش سرویس، پرداخت مرحله‌ای و یادآور دوره سرویس',
    category: 'pages',
    parentKey: null,
    componentPath: 'components/Repairs/RepairsRequestPage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.REPAIRS_PROFILE,
    name: 'پروفایل تعمیرات',
    name_en: 'Repairs Profile',
    description: 'پروفایل اختصاصی /profile برای درخواست‌ها و پیگیری سرویس',
    category: 'pages',
    parentKey: SITE_MODULE_KEYS.REPAIRS,
    componentPath: 'modules/profile/components/RepairsProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.GYM_BODYBUILDING,
    name: 'مدیریت باشگاه بدنسازی',
    name_en: 'Gym Bodybuilding Management',
    description:
      'اعضا، بسته‌ها، سانس‌ها، مربیان، برنامه تمرینی/غذایی و پنل پیامکی — /gym/profile',
    category: 'gym',
    parentKey: null,
    componentPath: 'modules/profile/components/GymBodybuildingProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.GYM_BILLIARD,
    name: 'مدیریت باشگاه بیلیارد',
    name_en: 'Billiard Club Management',
    description:
      'میزها، کاربران، مدیران و پنل پیامکی باشگاه بیلیارد — /gym/billiard',
    category: 'gym',
    parentKey: null,
    componentPath: 'modules/gym/components/BilliardPage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.GYM_PROFILE,
    name: 'پروفایل باشگاه بدنسازی',
    name_en: 'Gym Bodybuilding Profile',
    description: 'پروفایل اختصاصی باشگاه بدنسازی در /gym/profile',
    category: 'gym',
    parentKey: SITE_MODULE_KEYS.GYM_BODYBUILDING,
    componentPath: 'modules/profile/components/GymBodybuildingProfilePage.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.HERO_WITH_MENU,
    name: 'هیرو دارای منو',
    name_en: 'Hero With Menu',
    description:
      'اسلایدر هیرو با ویجت منو (دایره وسط و …) به‌همراه پروفایل و تاریخ — قابل استفاده در هر صفحه',
    category: 'layout',
    parentKey: null,
    componentPath: 'components/widgets/gym/GymHero.jsx',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.CLOUD_SERVER,
    name: 'سرور ابری اشتراکی',
    name_en: 'Shared Cloud Server',
    description:
      'سفارش سرور ابری، شارژ اعتبار، کسر روزانه، هشدار پیامکی و حذف داده پس از اتمام اعتبار',
    category: 'commerce',
    parentKey: null,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.PAYMENT,
    name: 'ماژول پرداخت',
    name_en: 'Payment Module',
    description:
      'درگاه سراسری — فروشگاه، کیف پول، اخبار، کاریابی؛ تنظیمات از /dashboard → تنظیمات پرداخت',
    category: 'commerce',
    parentKey: null,
    componentPath: '',
    defaultActive: true,
  },
  {
    key: SITE_MODULE_KEYS.REBO_PAYMENTS,
    name: 'پرداخت اختصاصی ربو',
    name_en: 'Rebo Payments',
    description:
      'پرداخت بسته‌های ربو از درگاه، کیف پول یا واریز کارت با تأیید دستی — فقط وقتی قالب ربو فعال است',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    componentPath: '',
    defaultActive: false,
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
    key: SITE_MODULE_KEYS.SHOP_PROFILE,
    name: 'پروفایل فروشگاهی',
    name_en: 'Shop Profile',
    description:
      'پروفایل اختصاصی /profile برای فروشگاه — سفارش‌ها، آدرس‌ها و میانبر خریدار/فروشنده',
    category: 'commerce',
    parentKey: SITE_MODULE_KEYS.SHOP,
    componentPath: 'modules/profile/components/ShopProfilePage.jsx',
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
      'سیاست یک فروشگاه — فروشگاه خودکار و /dashboard/my-shop. با چندفروشندگی همزمان فعال نمی‌شود',
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
  // قالب‌های اختصاصی سیستم → تب جدا در /adminmodule
  'data_pack_job_theme_one',
  'data_pack_job_theme_two',
  'data_pack_booking_theme_one',
  'data_pack_shop_theme_one',
  'data_pack_marketplace_theme_one',
  'data_pack_agri_theme_one',
  'data_pack_branding_theme_one',
  'data_pack_school_theme_one',
  'data_pack_rebo_theme_one',
  'data_pack_sadra_theme_one',
  'data_pack_crm_theme_one',
  'data_pack_inventory_theme_one',
  'data_pack_gym_bodybuilding_theme_one',
  // جایگزین شده با قالب‌های سیستم در تب قالب‌ها / پنهان از ماژول‌ها
  'data_pack_agriculture',
  'data_pack_branding',
  'data_pack_corporate',
  // school عمداً پنهان نیست — باید در ماژول‌ها دیده و مدیریت شود
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
    key: SITE_MODULE_KEYS.BOOKING_WIDGET,
    name: 'رزرو نوبت',
    defaultOrder: 15,
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
 * مسیرهایی که همیشه در داشبورد دیده می‌شوند و در همهٔ قالب‌ها نصب می‌شوند؛
 * مستقل از روشن/خاموش بودن ماژول متناظر.
 */
export const ALWAYS_ON_DASHBOARD_ROUTES = new Set([
  '/site-settings',
  '/header-menu',
  '/request-types',
  '/employees',
  '/platform-connections',
  '/ticker',
  '/hero-slider',
  '/home-hero-manage',
  '/about-manage',
  '/videoinsta-manage',
  '/quiz-manage',
])

export const ALWAYS_ON_DASHBOARD_SECTIONS = new Set([
  'site-settings',
  'seo',
  'header-menu',
  'advanced-menu',
  'request-types',
  'employees',
  'platform-connections',
  'ticker',
  'hero-slider',
  'hero',
  'home-hero-manage',
  'about-manage',
  'about',
  'about-us',
  'videoinsta-manage',
  'videoinsta',
  'quiz-manage',
  'quiz',
])

/**
 * مسیرهای داشبورد / ادمین که به ماژول سایت وابسته‌اند.
 * اگر ماژول خاموش باشد، آیتم مربوطه در داشبورد هم غیرفعال می‌شود.
 * (به‌جز ALWAYS_ON_DASHBOARD_ROUTES)
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
  '/booking': SITE_MODULE_KEYS.BOOKING,
  '/booking-manage': SITE_MODULE_KEYS.BOOKING,
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
  '/search': SITE_MODULE_KEYS.BREAKING_NEWS,
  // چیدمان /news از AdminWeb tab news_list_layout
  '/platform-connections': SITE_MODULE_KEYS.NEWS,
  '/sale': SITE_MODULE_KEYS.SALES_MARKETING,
  '/rasad': SITE_MODULE_KEYS.SALES_MARKETING,
  '/request-types': SITE_MODULE_KEYS.SALES_MARKETING,
  '/inventory': SITE_MODULE_KEYS.ADVANCED_INVENTORY,
  '/inventory/warehouses': SITE_MODULE_KEYS.INVENTORY_WAREHOUSES,
  '/inventory/products': SITE_MODULE_KEYS.INVENTORY_PRODUCTS,
  '/inventory/units': SITE_MODULE_KEYS.INVENTORY_UNITS,
  '/inventory/in': SITE_MODULE_KEYS.INVENTORY_STOCK_IN,
  '/inventory/out': SITE_MODULE_KEYS.INVENTORY_STOCK_OUT,
  '/inventory/transactions': SITE_MODULE_KEYS.INVENTORY_TRANSACTIONS,
  '/inventory/vouchers': SITE_MODULE_KEYS.INVENTORY_VOUCHERS,
  '/inventory/alerts': SITE_MODULE_KEYS.INVENTORY_ALERTS,
  '/inventory/authorized-persons': SITE_MODULE_KEYS.INVENTORY_AUTHORIZED,
  '/contact': SITE_MODULE_KEYS.CTA_SECTION,
  '/about': SITE_MODULE_KEYS.ABOUT_US,
  '/about-manage': SITE_MODULE_KEYS.ABOUT_US,
  '/videoinsta-manage': SITE_MODULE_KEYS.VIDEOINSTA,
  '/videos': SITE_MODULE_KEYS.VIDEOINSTA,
  '/catalog-manage': SITE_MODULE_KEYS.CATALOG,
  '/quiz': SITE_MODULE_KEYS.QUIZ,
  '/quiz-manage': SITE_MODULE_KEYS.QUIZ,
  '/faq': SITE_MODULE_KEYS.FAQ,
  '/faq-manage': SITE_MODULE_KEYS.FAQ,
  '/curved-timeline-manage': SITE_MODULE_KEYS.CURVED_TIMELINE,
  '/school-manage': SITE_MODULE_KEYS.SCHOOL,
  '/home-hero-manage': SITE_MODULE_KEYS.SCHOOL,
  '/teachers': SITE_MODULE_KEYS.SCHOOL,
  '/counselors': SITE_MODULE_KEYS.SCHOOL,
  '/apps': SITE_MODULE_KEYS.SOFTAPPS,
  '/apps-manage': SITE_MODULE_KEYS.SOFTAPPS,
  '/repairs': SITE_MODULE_KEYS.REPAIRS,
  '/todoservice': SITE_MODULE_KEYS.REPAIRS,
  '/gym/profile': SITE_MODULE_KEYS.GYM_BODYBUILDING,
  '/gym/bodybuilding': SITE_MODULE_KEYS.GYM_BODYBUILDING,
  '/gym/bodybuilding/dashboard': SITE_MODULE_KEYS.GYM_BODYBUILDING,
  '/gym/billiard': SITE_MODULE_KEYS.GYM_BILLIARD,
  '/gym/billiard/dashboard': SITE_MODULE_KEYS.GYM_BILLIARD,
  '/cloud-server': SITE_MODULE_KEYS.CLOUD_SERVER,
  '/reboserver': SITE_MODULE_KEYS.CLOUD_SERVER,
  '/serversystem': SITE_MODULE_KEYS.CLOUD_SERVER,
  '/cloud-manage': SITE_MODULE_KEYS.CLOUD_SERVER,
  '/paymentsystem': SITE_MODULE_KEYS.PAYMENT,
  '/payment-manage': SITE_MODULE_KEYS.PAYMENT,
  '/rebosystem': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  '/rebolearn': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  '/rebo-manage': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  '/rebo-pricing': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  '/reboaccunting': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  '/todorebo': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  // عمومی — وابسته به والد shop
  '/shop-manage': SITE_MODULE_KEYS.SHOP, // redirect → shop-accounting
  '/shop-panel': SITE_MODULE_KEYS.SHOP,
  '/dashboard/my-shop': SITE_MODULE_KEYS.SHOP,
  '/dashboard/shop-accounting': SITE_MODULE_KEYS.SHOP,
  '/product-single': SITE_MODULE_KEYS.SHOP_PRODUCT,
  '/adminshop': SITE_MODULE_KEYS.SHOP,
  '/adminshops': SITE_MODULE_KEYS.SHOP,
  '/adminproducts': SITE_MODULE_KEYS.SHOP,
  '/admincategories': SITE_MODULE_KEYS.SHOP,
  '/shop-categories': SITE_MODULE_KEYS.SHOP,
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
  rasad: SITE_MODULE_KEYS.SALES_MARKETING,
  'request-types': SITE_MODULE_KEYS.SALES_MARKETING,
  inventory: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
  warehouse: SITE_MODULE_KEYS.ADVANCED_INVENTORY,
  'advanced-inventory': SITE_MODULE_KEYS.ADVANCED_INVENTORY,
  'inventory-warehouses': SITE_MODULE_KEYS.INVENTORY_WAREHOUSES,
  'inventory-products': SITE_MODULE_KEYS.INVENTORY_PRODUCTS,
  'inventory-units': SITE_MODULE_KEYS.INVENTORY_UNITS,
  'inventory-stock-in': SITE_MODULE_KEYS.INVENTORY_STOCK_IN,
  'inventory-stock-out': SITE_MODULE_KEYS.INVENTORY_STOCK_OUT,
  'inventory-transactions': SITE_MODULE_KEYS.INVENTORY_TRANSACTIONS,
  'inventory-vouchers': SITE_MODULE_KEYS.INVENTORY_VOUCHERS,
  'inventory-alerts': SITE_MODULE_KEYS.INVENTORY_ALERTS,
  'inventory-authorized-persons': SITE_MODULE_KEYS.INVENTORY_AUTHORIZED,
  'inventory-reports': SITE_MODULE_KEYS.INVENTORY_REPORTS,
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
  'curved-timeline-manage': SITE_MODULE_KEYS.CURVED_TIMELINE,
  curved_timeline: SITE_MODULE_KEYS.CURVED_TIMELINE,
  school: SITE_MODULE_KEYS.SCHOOL,
  'school-manage': SITE_MODULE_KEYS.SCHOOL,
  'school-profile': SITE_MODULE_KEYS.SCHOOL,
  'school-teacher': SITE_MODULE_KEYS.SCHOOL,
  'school-student': SITE_MODULE_KEYS.SCHOOL,
  'school-counselor': SITE_MODULE_KEYS.SCHOOL,
  'school-account': SITE_MODULE_KEYS.SCHOOL,
  'home-hero-manage': SITE_MODULE_KEYS.SCHOOL,
  softapps: SITE_MODULE_KEYS.SOFTAPPS,
  'apps-manage': SITE_MODULE_KEYS.SOFTAPPS,
  apps: SITE_MODULE_KEYS.SOFTAPPS,
  repairs: SITE_MODULE_KEYS.REPAIRS,
  'repairs-page': SITE_MODULE_KEYS.REPAIRS,
  todoservice: SITE_MODULE_KEYS.REPAIRS,
  'todo-service': SITE_MODULE_KEYS.REPAIRS,
  gym: SITE_MODULE_KEYS.GYM_BODYBUILDING,
  'gym-bodybuilding': SITE_MODULE_KEYS.GYM_BODYBUILDING,
  gym_bodybuilding: SITE_MODULE_KEYS.GYM_BODYBUILDING,
  'gym-billiard': SITE_MODULE_KEYS.GYM_BILLIARD,
  gym_billiard: SITE_MODULE_KEYS.GYM_BILLIARD,
  'gym-profile': SITE_MODULE_KEYS.GYM_PROFILE,
  gym_profile: SITE_MODULE_KEYS.GYM_PROFILE,
  'hero-with-menu': SITE_MODULE_KEYS.HERO_WITH_MENU,
  hero_with_menu: SITE_MODULE_KEYS.HERO_WITH_MENU,
  'data-pack-gym-bodybuilding-theme-one': SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
  'cloud-server': SITE_MODULE_KEYS.CLOUD_SERVER,
  'reboserver': SITE_MODULE_KEYS.CLOUD_SERVER,
  'serversystem': SITE_MODULE_KEYS.CLOUD_SERVER,
  'cloud-manage': SITE_MODULE_KEYS.CLOUD_SERVER,
  payment: SITE_MODULE_KEYS.PAYMENT,
  'paymentsystem': SITE_MODULE_KEYS.PAYMENT,
  'payment-manage': SITE_MODULE_KEYS.PAYMENT,
  'rebosystem': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  'rebolearn': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  'rebo-manage': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  'rebo-pricing': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  'reboaccunting': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  'todorebo': SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
  shop: SITE_MODULE_KEYS.SHOP,
  'shop-manage': SITE_MODULE_KEYS.SHOP,
  'shop-panel': SITE_MODULE_KEYS.SHOP,
  'my-shop': SITE_MODULE_KEYS.SHOP,
  'shop-accounting': SITE_MODULE_KEYS.SHOP,
  'product-single': SITE_MODULE_KEYS.SHOP_PRODUCT,
  adminshop: SITE_MODULE_KEYS.SHOP,
  adminshops: SITE_MODULE_KEYS.SHOP,
  adminproducts: SITE_MODULE_KEYS.SHOP,
  admincategories: SITE_MODULE_KEYS.SHOP,
  'shop-categories': SITE_MODULE_KEYS.SHOP,
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
  'data-pack-job-theme-two': SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
  'data-pack-booking-theme-one': SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE,
  'data-pack-shop-theme-one': SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE,
  'data-pack-marketplace-theme-one': SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE,
  'data-pack-sadra-theme-one': SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
  'data-pack-crm-theme-one': SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
  'data-pack-inventory-theme-one': SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
  booking: SITE_MODULE_KEYS.BOOKING,
  'booking-manage': SITE_MODULE_KEYS.BOOKING,
  'booking-widget': SITE_MODULE_KEYS.BOOKING_WIDGET,
  'booking-services': SITE_MODULE_KEYS.BOOKING_SERVICES,
  'booking-staff': SITE_MODULE_KEYS.BOOKING_STAFF,
  'booking-lookup': SITE_MODULE_KEYS.BOOKING_LOOKUP,
  'booking-cta': SITE_MODULE_KEYS.BOOKING_CTA,
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
  const path = String(href || '').split('?')[0].replace(/\/$/, '') || '/'
  const sectionNorm = String(sectionCode || '')
    .toLowerCase()
    .replace(/_/g, '-')
  if (
    ALWAYS_ON_DASHBOARD_ROUTES.has(path) ||
    ALWAYS_ON_DASHBOARD_SECTIONS.has(sectionNorm)
  ) {
    return true
  }

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

  // تنظیمات پرداخت: وقتی ماژول payment روشن است، یا فروشگاه روشن است (نیاز به درگاه)
  if (key === SITE_MODULE_KEYS.PAYMENT) {
    if (Object.prototype.hasOwnProperty.call(moduleMap, SITE_MODULE_KEYS.PAYMENT)) {
      if (moduleMap[SITE_MODULE_KEYS.PAYMENT]) return true
    }
    return isShopModuleOn(moduleMap)
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
