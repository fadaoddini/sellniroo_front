/** تور راهنمای پنل مشاور (profile?tab=counselor) */

export const SCHOOL_COUNSELOR_TOUR_STORAGE_KEY = 'sellniroo-school-counselor-tour-seen'

export const SCHOOL_COUNSELOR_TOUR = [
  {
    id: 'welcome',
    tab: 'info',
    target: '[data-tour="sc-tour-btn"]',
    title: 'راهنمای پنل مشاور',
    text: 'میز کار مشاور: پیگیری ریسک، آزمون‌های مشاوره، پرونده دانش‌آموز و معلم. تور کوتاه همه بخش‌ها را نشان می‌دهد.',
    howTo: [
      'با «مرحله بعد» پیش بروید.',
      'هر وقت خواستید «پایان آموزش» را بزنید.',
      'بعداً دوباره از «راهنمای تور» شروع کنید.',
    ],
    hint: 'روی موبایل کارت راهنما پایین صفحه می‌آید.',
  },
  {
    id: 'tabs',
    tab: 'info',
    target: '[data-tour="sc-tabs"]',
    title: 'زبانه‌های مشاور',
    text: 'هر زبانه یک کار مشخص دارد. در موبایل نوار زبانه‌ها را افقی بکشید.',
  },
  {
    id: 'info',
    tab: 'info',
    target: '[data-tour="sc-info"]',
    title: 'اطلاعات پایه',
    text: 'آمار پرونده‌ها، آزمون‌ها و موارد پیگیری بالا اینجا خلاصه شده؛ میانبرهای سریع هم همین‌جا هستند.',
  },
  {
    id: 'overview',
    tab: 'overview',
    target: '[data-tour="sc-overview"]',
    title: 'نمای کلی',
    text: 'KPI، نمودار پوشش آزمون‌ها، صف پیگیری و نتایج اخیر برای اقدام سریع.',
    howTo: [
      'روی کارت‌ها بزنید تا به بخش مرتبط بروید.',
      'از صف پیگیری مستقیم پرونده را باز کنید.',
    ],
  },
  {
    id: 'followup',
    tab: 'followup',
    target: '[data-tour="sc-followup"]',
    title: 'پیگیری',
    text: 'پرونده‌های پرریسک دانش‌آموز و معلم با فیلتر و جستجو — اولویت‌بندی کار روزانه مشاور.',
  },
  {
    id: 'people',
    tab: 'people',
    target: '[data-tour="sc-people"]',
    title: 'افراد',
    text: 'جستجوی دانش‌آموز یا معلم و باز کردن / ساخت پرونده مشاوره با یک کلیک.',
  },
  {
    id: 'tests',
    tab: 'tests',
    target: '[data-tour="sc-tests"]',
    title: 'آزمون‌ها',
    text: 'بانک آزمون IQ، EQ، شخصیت و هدایت تحصیلی را بسازید و تنظیم کنید.',
  },
  {
    id: 'files',
    tab: 'files',
    target: '[data-tour="sc-files"]',
    title: 'پرونده‌ها',
    text: 'پرونده دانش‌آموز و معلم: نتایج قابل‌فهم، خلاصه، یادداشت خصوصی/اشتراکی و سطح ریسک.',
  },
  {
    id: 'attempts',
    tab: 'attempts',
    target: '[data-tour="sc-attempts"]',
    title: 'نتایج',
    text: 'همه تلاش‌های آزمون مشاوره با فیلتر نوع؛ از اینجا به پرونده دانش‌آموز بروید.',
  },
  {
    id: 'profile',
    tab: 'profile',
    target: '[data-tour="sc-profile"]',
    title: 'معرفی مشاور',
    text: 'پروفایل عمومی، تخصص، رسانه و کارت معرفی خود را کامل کنید.',
  },
  {
    id: 'done',
    tab: 'info',
    target: '[data-tour="sc-tour-btn"]',
    title: 'میز کار آماده است',
    text: 'تور تمام شد. پیشنهاد مسیر: نمای کلی → پیگیری → پرونده‌ها → آزمون‌ها.',
    hint: 'هر وقت لازم شد دوباره «راهنمای تور» را بزنید.',
  },
]
