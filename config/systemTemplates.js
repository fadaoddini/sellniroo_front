// قالب‌های اختصاصی سیستم — در هر لحظه فقط یکی فعال است
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * هر قالب تم و نیازمندی‌های خودش را دارد.
 * exclusiveModules با فعال‌سازی این قالب خاموش می‌شوند (سیستم‌های رقیب).
 */
export const SYSTEM_TEMPLATES = [
  {
    key: 'job_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
    name: 'سیستم کاریابی تم یک',
    nameEn: 'Job Board Theme One',
    topic: 'کاریابی',
    accent: '#1e5a8a',
    accentSoft: 'rgba(30, 90, 138, 0.12)',
    tagline: 'تم اختصاصی کاریابی + داده دمو',
    description:
      'چیدمان، سئو و محتوای کاریابی را جایگزین می‌کند و فقط ماژول‌های لازم همین سیستم را روشن می‌گذارد.',
    replaces: [
      'چیدمان صفحه اصلی و سینگل آگهی',
      'منوی سایت، اسلایدر و نوار خبر',
      'سئو، برند و درباره ما',
      'دادهٔ دموی آگهی‌ها و شرکت‌ها',
    ],
    requires: [
      'ماژول کاریابی (آگهی، هدر، منوی موبایل، پروفایل)',
      'منوی پیشرفته و اسلایدر',
      'اخبار و سئو',
      'داده فیک آگهی و رزومه',
    ],
    /** فقط ریشه‌ها — خاموش کردن با آبشار، بدون روشن شدن دوبارهٔ فرزند */
    deactivateKeys: [
      SITE_MODULE_KEYS.JOB_BOARD,
      SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
      SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
    ],
    enablesHint: 'نیاز: کاریابی + منو + سئو',
  },
  {
    key: 'job_theme_two',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
    name: 'سیستم کاریابی تم دو',
    nameEn: 'Job Board Theme Two',
    topic: 'کاریابی',
    accent: '#D4621A',
    accentSoft: 'rgba(212, 98, 26, 0.14)',
    tagline: 'بسته کامل کاریابی — پالت #FEF3E2 · #F4AE52 · #D4621A · #2A1A0E',
    description:
      'همه چیدمان‌ها، ماژول‌ها و دادهٔ کاریابی در یک بسته: خانه، آگهی، اخبار، ویدیو، پروفایل (رزومه/شرکت)، تماس و داده فیک — یک کلیک.',
    replaces: [
      'چیدمان خانه، سینگل آگهی، لیست و سینگل خبر',
      'صفحات پروفایل، تماس و درباره ما',
      'منو، اسلایدر، نوار خبر، ظاهر هدر و سئو',
      'دادهٔ دموی آگهی، رزومه و شرکت',
    ],
    requires: [
      'ماژول کاریابی (آگهی، هدر، منوی موبایل، پروفایل)',
      'اخبار، آرشیو ویدیو و فرم تماس',
      'منوی پیشرفته و اسلایدر',
      'داده فیک آگهی / رزومه / شرکت',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.JOB_BOARD,
      SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
      SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
    ],
    enablesHint: 'کاریابی + اخبار + ویدیو + تماس — یک کلیک',
  },
  {
    key: 'booking_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE,
    name: 'سیستم نوبت‌دهی تم یک',
    nameEn: 'Booking Theme One',
    topic: 'نوبت‌دهی',
    accent: '#0d7377',
    accentSoft: 'rgba(13, 115, 119, 0.12)',
    tagline: 'تم اختصاصی نوبت‌دهی + تقویم شمسی',
    description:
      'چیدمان نوبت‌دهی و دموی آرایشگاه را جایگزین می‌کند و ماژول‌های کاریابی رقیب را خاموش می‌کند.',
    replaces: [
      'چیدمان صفحه اصلی و مسیر /booking',
      'منوی سایت، اسلایدر و نوار خبر',
      'سئو، برند و درباره ما',
      'دادهٔ دموی خدمات، پرسنل و نوبت‌ها',
    ],
    requires: [
      'فرم رزرو، خدمات، پرسنل، پیگیری و فراخوان',
      'منوی پیشرفته و اسلایدر',
      'سئو و درباره ما',
      'دموی آرایشگاه با تقویم شمسی',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.BOOKING,
      SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE,
    ],
    enablesHint: 'نیاز: ۵ ماژول نوبت‌دهی + منو + سئو',
  },
  {
    key: 'shop_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE,
    name: 'سیستم تک‌فروشگاهی تم یک',
    nameEn: 'Single Store Theme One',
    topic: 'فروشگاه',
    accent: '#b45309',
    accentSoft: 'rgba(180, 83, 9, 0.12)',
    tagline: 'تم اختصاصی تک‌فروشگاهی + ویترین دمو',
    description:
      'چیدمان ویترین، سینگل محصول و لیست فروشگاه را جایگزین می‌کند و سیاست تک‌فروشگاهی را روشن می‌گذارد.',
    replaces: [
      'چیدمان صفحه اصلی، /shop و سینگل محصول',
      'منوی سایت، اسلایدر و نوار خبر',
      'سئو، برند و درباره ما',
      'دادهٔ دموی محصولات و دسته‌ها',
    ],
    requires: [
      'فروشگاه + ویترین + سینگل محصول',
      'سیاست تک‌فروشگاهی (نه چندفروشندگی)',
      'پرداخت، منوی پیشرفته و سئو',
      'داده دموی محصولات',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.SHOP,
      SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE,
    ],
    enablesHint: 'نیاز: فروشگاه تک‌فروشگاهی + پرداخت + منو + سئو',
  },
  {
    key: 'marketplace_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE,
    name: 'سیستم چندفروشگاهی تم یک',
    nameEn: 'Marketplace Theme One',
    topic: 'مارکت‌پلیس',
    accent: '#CB2957',
    accentSoft: 'rgba(203, 41, 87, 0.12)',
    tagline: 'اسنپ‌شات کامل چندفروشگاهی — یک کلیک',
    description:
      'خانه، منوی دسته، فروشگاه، سینگل، سبد/چک‌اوت با پالت مشکی/صورتی، هدر، تیکر، هیرو و دموی چندفروشگاهی را یکجا نصب می‌کند.',
    replaces: [
      'چیدمان صفحه اصلی، /shop و سینگل محصول',
      'سبد خرید / چک‌اوت + تم رنگی',
      'منوی سایت، منوی دسته، اسلایدر و نوار خبر',
      'سئو، برند، ظاهر هدر و درباره ما',
      'دادهٔ دموی محصولات و دسته‌ها',
    ],
    requires: [
      'فروشگاه + ویترین + سینگل محصول',
      'سیاست چندفروشندگی (نه تک‌فروشگاهی)',
      'پرداخت، منوی پیشرفته و سئو',
      'مدیریت فروشگاه‌ها و تسویه از داشبورد',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.SHOP,
      SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE,
    ],
    enablesHint: 'نیاز: مارکت‌پلیس چندفروشندگی + پرداخت + منو + سئو',
  },
  {
    key: 'agri_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_AGRI_THEME_ONE,
    name: 'سیستم شرکتی کود و سم تم یک',
    nameEn: 'Agri Corporate Theme One',
    topic: 'کود و سم',
    accent: '#2d6a4f',
    accentSoft: 'rgba(45, 106, 79, 0.12)',
    tagline: 'تم شرکتی سبز + کاتالوگ و مشاوره',
    description:
      'چیدمان شرکتی کود و سم با منوی سبز، خطوط محصول، کاتالوگ، اخبار و فرم مشاوره را جایگزین می‌کند.',
    replaces: [
      'چیدمان صفحه اصلی شرکتی (منو، هیرو، CTA)',
      'کارت‌های خطوط محصول کود و سم',
      'کاتالوگ، اخبار و ویدیو',
      'سئو، برند، درباره ما و ظاهر سبز',
    ],
    requires: [
      'کاتالوگ محصولات کود و سم',
      'اخبار، ویدیو و کارت‌های ویژگی',
      'منوی پیشرفته و اسلایدر',
      'سئو و فرم مشاوره سفارش',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.DATA_PACK_AGRI_THEME_ONE,
      SITE_MODULE_KEYS.DATA_PACK_AGRICULTURE,
    ],
    enablesHint: 'نیاز: کاتالوگ + اخبار + منو + سئو',
  },
  {
    key: 'branding_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_BRANDING_THEME_ONE,
    name: 'سیستم برندینگ تم یک',
    nameEn: 'Branding Theme One',
    topic: 'برندینگ',
    accent: '#e8b800',
    accentSoft: 'rgba(232, 184, 0, 0.14)',
    tagline: 'تم تیره-طلایی استودیو برندینگ',
    description:
      'چیدمان استودیو برندینگ را جایگزین می‌کند و ظاهر تیره-طلایی، مجله برند و فرم مشاوره را روشن می‌گذارد.',
    replaces: [
      'چیدمان صفحه اصلی تیره-طلایی',
      'کارت‌های خدمات برندینگ',
      'مجله برند، ویدیو و فرم مشاوره',
      'سئو، برند و درباره ما',
    ],
    requires: [
      'منوی پیشرفته و اسلایدر',
      'اخبار / مجله برند',
      'ویدیو و درباره ما',
      'سئو و فرم درخواست پروژه',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.DATA_PACK_BRANDING_THEME_ONE,
      SITE_MODULE_KEYS.DATA_PACK_BRANDING,
    ],
    enablesHint: 'نیاز: اخبار + ویدیو + منو + سئو',
  },
  {
    key: 'school_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE,
    name: 'سیستم مدرسه تم یک',
    nameEn: 'School Theme One',
    topic: 'مدرسه',
    accent: '#2b6a4d',
    accentSoft: 'rgba(43, 106, 77, 0.14)',
    tagline: 'بسته یک‌کلیکه — چیدمان adminweb + داده کامل مدرسه',
    description:
      'نصب یک‌کلیکه: چیدمان خانه و صفحات مدرسه از adminweb، نقش‌ها، کارنامه، نتایج آزمون، بانک مشاوره و مجله آموزشی.',
    replaces: [
      'چیدمان خانه (هیرو مدرسه + انیمیشن)',
      'چیدمان /school، پروفایل، درباره، تماس، مجله',
      'ورود مدیر / معلم / مشاور / دانش‌آموز',
      'کارنامه، نتایج آزمون، تست IQ/EQ',
      'حضور، برنامه، آزمون‌ساز',
    ],
    requires: [
      'ماژول مدرسه (هاب، مدیریت، معلم، مشاور، دانش‌آموز)',
      'منوی پیشرفته و اسلایدر',
      'اخبار / مجله آموزشی',
      'سئو و فرم تماس',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.SCHOOL,
      SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE,
    ],
    enablesHint: 'نیاز: مدرسه + منو + اخبار + سئو',
  },
  {
    key: 'rebo_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    name: 'موتور قدرتمند ربو',
    nameEn: 'Rebo Power Engine',
    topic: 'پلتفرم',
    accent: '#e8b800',
    accentSoft: 'rgba(232, 184, 0, 0.14)',
    tagline: 'موتور قدرتمند ربو — بسته سبک و استاندارد فروش سامانه',
    description:
      'چیدمان صفحه اصلی ربو با برآورد هزینه، مراحل سفارش و سفارش یک‌کلیکه در پروفایل — بدون روشن‌کردن سامانه‌های محصولی اضافه.',
    replaces: [
      'چیدمان صفحه اصلی موتور قدرتمند ربو',
      'بسته‌های قیمت‌گذاری و هزینه‌های راه‌اندازی',
      'برند، سئو و فرم تماس',
      'فعال‌سازی هسته ربو، پرداخت و سرور ابری',
    ],
    requires: [
      'ویجت‌های معرفی موتور ربو',
      'منوی پیشرفته و نوار خبر',
      'فرم تماس و سئو',
      'پرداخت ربو و سرور ابری',
    ],
    deactivateKeys: [SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE],
    enablesHint: 'بسته سبک ربو — کروم صفحه + پرداخت + سرور ابری',
  },
  {
    key: 'sadra_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
    name: 'صدرا',
    nameEn: 'Sadra Laser Service',
    topic: 'لیزر و خدمات',
    accent: '#C8B48A',
    accentSoft: 'rgba(200, 180, 138, 0.22)',
    tagline:
      'اسنپ‌شات کامل صدرا — خانه، فروشگاه، سبد، پروفایل، نوبت و تعمیرات',
    description:
      'همان وضعیت زنده سایت صدرا: چیدمان خانه و هدر روشن، صفحات داخلی، پروفایل ترکیبی، فروشگاه و سینگل محصول، سبد/چک‌اوت، منو/تیکر/هیرو، پالت #1E3B2F·#7F8C6A·#C8B48A·#F5F0E6 و داده دمو — با یک کلیک تحویل بدهید.',
    replaces: [
      'چیدمان صفحه اصلی (هدر روشن + ویجت‌های نوبت/فروشگاه)',
      'صفحات داخلی، پروفایل ترکیبی، فروشگاه و سینگل محصول',
      'سبد خرید / چک‌اوت و مسیرهای نوبت و تعمیرات',
      'منو، تیکر، هیرو، سئو و برند صدرا',
      'داده دموی قطعات لیزر و سرویس',
    ],
    requires: [
      'نوار خبر، اسلایدر هیرو و ویجت منو',
      'فروشگاه تک‌فروشگاهی + پرداخت',
      'سیستم نوبت‌دهی و تعمیرات',
      'منو پیشرفته و سئو',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.SHOP,
      SITE_MODULE_KEYS.BOOKING,
      SITE_MODULE_KEYS.REPAIRS,
      SITE_MODULE_KEYS.VIDEOINSTA,
      SITE_MODULE_KEYS.NOBAT,
      SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
    ],
    enablesHint:
      'خانه روشن + فروشگاه + سبد + پروفایل + رزرو + تعمیرات با یک کلیک',
  },
  {
    key: 'crm_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
    name: 'سامانه CRM کامل',
    nameEn: 'CRM Suite Theme One',
    topic: 'CRM',
    accent: '#0f766e',
    accentSoft: 'rgba(15, 118, 110, 0.14)',
    tagline: 'فروش کامل + خبر فوری + ویجت منو + پروفایل — یک کلیک',
    description:
      'بسته CRM عملیاتی بدون انبار پیش‌فرض: لید، پیگیری، آنالیتیکس، مانیتور، پیش‌فاکتور و گزارش فعالیت + خبر فوری، ویجت منو و پروفایل جامع فروش (الگوی صدرا).',
    replaces: [
      'چیدمان صفحه اصلی با خبر فوری و ویجت منو',
      'منوی سایت، اسلایدر و نوار خبر فوری',
      'سئو، تماس و درباره ما',
      'پروفایل جامع فروش و داده دموی لید',
    ],
    requires: [
      'ماژول فروش و بازاریابی (/sale)',
      'خبر فوری + ویجت منو (site_menu) + اسلایدر',
      'پروفایل جامع CRM (/profile)',
      'داده دموی لید فروش',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.SALES_MARKETING,
      SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
    ],
    enablesHint: 'فروش + خبر فوری + ویجت منو + پروفایل',
  },
  {
    key: 'inventory_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
    name: 'انبارداری پیشرفته',
    nameEn: 'Advanced Inventory Theme One',
    topic: 'انبار',
    accent: '#374151',
    accentSoft: 'rgba(55, 65, 81, 0.14)',
    tagline: 'تم خاکستری حرفه‌ای + خبر فوری + ویجت منو + پروفایل — یک کلیک',
    description:
      'بسته کامل انبارداری پیشرفته: انبار چندگانه، کالا، واحد سلسله‌مراتبی، ورود/خروج، تراکنش، حواله، هشدار و افراد مجاز + خبر فوری، ویجت منو و پروفایل جامع.',
    replaces: [
      'چیدمان صفحه اصلی با خبر فوری و ویجت منو (پالت خاکستری)',
      'منوی سایت، اسلایدر و نوار خبر فوری',
      'سئو، تماس و درباره ما',
      'پروفایل جامع انبار و داده دموی موجودی',
    ],
    requires: [
      'ماژول انبارداری پیشرفته (/inventory) و زیرماژول‌ها',
      'خبر فوری + ویجت منو (site_menu) + اسلایدر',
      'پروفایل جامع انبار (/profile)',
      'داده دموی انبار/کالا/موجودی',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.ADVANCED_INVENTORY,
      SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
    ],
    enablesHint: 'انبار + خبر فوری + ویجت منو + پروفایل',
  },
  {
    key: 'gym_bodybuilding_theme_one',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
    name: 'باشگاه بدنسازی (تم روشن)',
    nameEn: 'Gym Bodybuilding Light Theme',
    topic: 'باشگاه',
    accent: '#046c4e',
    accentSoft: 'rgba(4, 108, 78, 0.14)',
    tagline:
      'یک کلیک: خانه + فروشگاه + سینگل + صفحات داخلی + منو/رنگ + داده اولیه',
    description:
      'نصب کامل سیستم باشگاه بدنسازی: چیدمان خانه (هیرو دارای منو، تایم‌لاین، سانس، مربی، فروشگاه)، لیست و سینگل فروشگاه هم‌سبک، صفحات /gym و /profile، منو با لینک فروشگاه/سبد، ظاهر شرکتی، پروفایل باشگاه و داده اولیه اعضا/بسته/سانس.',
    replaces: [
      'خانه: هیرو دارای منو + تایم‌لاین + سانس + مربی + فروشگاه + جمع‌بندی',
      'فروشگاه: /shop و /shop/products با منوی باشگاه (سبد/سفارش مشترک)',
      'صفحات داخلی: /gym/profile، درباره، تماس',
      'منو، تیکر، هیرو، سئو و ظاهر شرکتی آبی نفتی/سبز',
      'ماژول‌ها: باشگاه + shop/single_store/payment + curved_timeline',
      'داده اولیه: کتابخانه حرکت/غذا + اعضا + بسته + سانس + مربی + محصول',
    ],
    requires: [
      'ماژول باشگاه بدنسازی — همه عملیات داخل پروفایل /gym/profile',
      'ماژول فروشگاه (shop + single_store + payment)',
      'هیرو دارای منو + خبر فوری + تایم‌لاین منحنی',
      'پروفایل باشگاه (/profile) — سیستم اصلی gym_bodybuilding',
      'داده اولیه: کتابخانه حرکت/غذا + اعضا/بسته/سانس/محصول',
    ],
    deactivateKeys: [
      SITE_MODULE_KEYS.GYM_BODYBUILDING,
      SITE_MODULE_KEYS.GYM_PROFILE,
      SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
    ],
    enablesHint:
      'خانه + فروشگاه/سینگل + صفحات داخلی + منو + پروفایل + داده اولیه',
  },
]

export const SYSTEM_TEMPLATE_MODULE_KEYS = new Set(
  SYSTEM_TEMPLATES.map((t) => t.moduleKey),
)

export const SYSTEM_TEMPLATE_PACK_KEYS = new Set(
  SYSTEM_TEMPLATES.map((t) => t.key),
)

export function getSystemTemplateByPack(packKey) {
  return SYSTEM_TEMPLATES.find((t) => t.key === packKey) || null
}

export function getSystemTemplateByModule(moduleKey) {
  return SYSTEM_TEMPLATES.find((t) => t.moduleKey === moduleKey) || null
}

/** کدام قالب الان به‌صورت انحصاری فعال است (حداکثر یکی) */
export function ownerSystemToTemplate(row) {
  const keys = row?.module_keys || []
  const names = row?.module_names || keys
  return {
    key: row.key,
    moduleKey: null,
    name: row.name,
    nameEn: row.name,
    topic: row.topic || 'سفارشی',
    accent: '#3d4f5f',
    accentSoft: 'rgba(61, 79, 95, 0.14)',
    tagline: `${keys.length} ماژول انتخابی`,
    description:
      row.description ||
      'سیستم ساخته‌شده از ماژول‌های اصلی که خودتان انتخاب کردید.',
    replaces: ['ماژول‌های اختصاصی سیستم قبلی'],
    requires: names,
    deactivateKeys: keys,
    enablesHint: names.filter(Boolean).join(' + ') || 'ماژول‌های انتخابی',
    custom: true,
  }
}

export function getActiveExclusiveTemplate(
  moduleMap = {},
  currentPack = null,
  extraTemplates = [],
) {
  const extras = Array.isArray(extraTemplates) ? extraTemplates : []
  const all = [...SYSTEM_TEMPLATES, ...extras]
  if (currentPack) {
    const hit = all.find((t) => t.key === currentPack)
    if (hit) {
      if (hit.custom || String(hit.key).startsWith('custom_')) return hit
      if (hit.moduleKey && moduleMap?.[hit.moduleKey]) return hit
    }
  }
  const on = SYSTEM_TEMPLATES.filter((t) => !!moduleMap?.[t.moduleKey])
  if (on.length === 1) return on[0]
  if (on.length > 1) {
    return on.find((t) => t.key === currentPack) || on[0]
  }
  return extras.find((t) => t.key === currentPack) || null
}
