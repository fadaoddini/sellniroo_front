/** تور راهنمای میزکار سرویس /todoservice */

export const TODO_SERVICE_TOUR_STORAGE_KEY = 'sellniroo-todoservice-tour-seen-v1'

const SHARED_INTRO = {
  target: '[data-tour="ts-header"]',
  title: 'میزکار سرویس و تعمیر',
  text: 'اینجا همه پرونده‌های تعمیر از ورودی تا تکمیل را می‌بینید و مدیریت می‌کنید.',
  howTo: [
    'هر کارت یک سفارش است؛ با کلیک جزئیات باز می‌شود.',
    'نقش شما مشخص می‌کند چه کارهایی در دسترس است.',
  ],
  hint: 'هر وقت خواستید دوباره تور را از دکمه «راهنمای تور» شروع کنید.',
}

const ROLE_STEP = {
  target: '[data-tour="ts-roles"]',
  title: 'تغییر نقش',
  text: 'اگر چند نقش دارید (مدیر، سرویسکار، مشتری)، از اینجا بین نماها جابه‌جا شوید.',
  howTo: [
    'نمای مدیر: تخصیص، تسویه و تایید تکمیل',
    'نمای سرویسکار: گزارش بازدید و کارگاه',
    'نمای مشتری: پیگیری و پرداخت',
  ],
}

const VIEWS_ADMIN = {
  target: '[data-tour="ts-views"]',
  title: 'تب‌های میزکار',
  text: 'میزکار، آرشیو، حسابداری، عملیات و مرکز مشتری — هر کدام یک کار مشخص دارند.',
  howTo: [
    'میزکار: ستون‌های زنده پرونده‌ها',
    'آرشیو: سفارش‌های بسته‌شده و فیلتر تاریخ',
    'حسابداری و عملیات: گزارش مالی و تنظیمات واحد سرویس',
  ],
}

const VIEWS_TECH = {
  target: '[data-tour="ts-views"]',
  title: 'تب‌های سرویسکار',
  text: 'از میزکار سفارش‌های اعزام‌شده را ببینید؛ مرکز مشتری برای پیگیری پرداخت مشتری است.',
}

const VIEWS_CUSTOMER = {
  target: '[data-tour="ts-views"]',
  title: 'تب‌های مشتری',
  text: 'میزکار وضعیت سفارش‌ها را نشان می‌دهد؛ مرکز مشتری برای ثبت درخواست و پرداخت است.',
}

const STATS_STEP = {
  target: '[data-tour="ts-stats"]',
  title: 'آمار لحظه‌ای',
  text: 'تعداد پرونده در هر مرحله را یک‌جا ببینید تا اولویت کار روشن باشد.',
}

const TOOLBAR_STEP = {
  target: '[data-tour="ts-toolbar"]',
  title: 'فیلتر و جستجو',
  text: 'ستون‌ها را فیلتر کنید یا با کد سفارش، نام مشتری، شهر یا دستگاه جستجو کنید.',
}

const BOARD_STEP = {
  target: '[data-tour="ts-board"]',
  title: 'ستون‌های پرونده',
  text: 'مسیر کار: ورودی → اعزام → در حال تعمیر → پایان.',
  howTo: [
    'ورودی: ثبت و رزرو',
    'اعزام: تخصیص سرویسکار و بازدید',
    'در حال تعمیر: اجرت، قطعات و تسویه',
    'پایان: تکمیل یا لغو',
  ],
}

const COL_INBOX = {
  target: '[data-tour="ts-col-inbox"]',
  title: 'ستون ورودی',
  text: 'سفارش‌های تازه اینجا می‌آیند؛ مدیر می‌تواند سرویسکار را تخصیص دهد.',
}

const COL_FIELD = {
  target: '[data-tour="ts-col-field"]',
  title: 'ستون اعزام',
  text: 'پرونده‌هایی که سرویسکار برای بازدید/اعزام دارند.',
}

const COL_WORK = {
  target: '[data-tour="ts-col-work"]',
  title: 'ستون تعمیر',
  text: 'کارگاه فعال، پیشنهادها و پرداخت‌های میانی/نهایی اینجا پیگیری می‌شود.',
}

const COL_DONE = {
  target: '[data-tour="ts-col-done"]',
  title: 'ستون پایان',
  text: 'سفارش‌های تکمیل یا لغوشده؛ فاکتور پس از تسویه قطعی قابل دانلود است.',
}

const CARD_STEP = {
  target: '[data-tour="ts-card"], [data-tour="ts-board"]',
  title: 'کارت سفارش',
  text: 'روی کارت بزنید تا دیالوگ نقش‌محور باز شود و اقدامات همان مرحله را انجام دهید.',
  hint: 'اگر کارتی نبود، بعداً با ثبت درخواست اینجا پر می‌شود.',
}

const REFRESH_STEP = {
  target: '[data-tour="ts-refresh"]',
  title: 'بروزرسانی',
  text: 'لیست و آمار را تازه کنید تا آخرین وضعیت پرداخت و تخصیص را ببینید.',
}

const TOUR_BTN_STEP = {
  target: '[data-tour="ts-tour-btn"]',
  title: 'همین راهنما',
  text: 'هر زمان لازم بود دوباره تور را از این دکمه اجرا کنید.',
}

/**
 * @param {'admin'|'tech'|'customer'|string} role
 */
export function buildTodoServiceTourSteps(role = 'customer') {
  const views =
    role === 'admin' ? VIEWS_ADMIN : role === 'tech' ? VIEWS_TECH : VIEWS_CUSTOMER

  if (role === 'customer') {
    return [
      SHARED_INTRO,
      ROLE_STEP,
      views,
      STATS_STEP,
      TOOLBAR_STEP,
      BOARD_STEP,
      CARD_STEP,
      {
        target: '[data-tour="ts-view-customer"], [data-tour="ts-views"]',
        title: 'مرکز مشتری',
        text: 'از این تب درخواست جدید ثبت کنید، سفارش‌ها را ببینید و پرداخت را انجام دهید.',
      },
      REFRESH_STEP,
      TOUR_BTN_STEP,
    ]
  }

  if (role === 'tech') {
    return [
      SHARED_INTRO,
      ROLE_STEP,
      views,
      STATS_STEP,
      TOOLBAR_STEP,
      BOARD_STEP,
      COL_FIELD,
      COL_WORK,
      CARD_STEP,
      REFRESH_STEP,
      TOUR_BTN_STEP,
    ]
  }

  // admin (default)
  return [
    SHARED_INTRO,
    ROLE_STEP,
    views,
    {
      target: '[data-tour="ts-view-ops"], [data-tour="ts-views"]',
      title: 'عملیات',
      text: 'تنظیمات واحد سرویس، کارت بانکی واریز، نرخ‌ها و تکنسین‌ها از تب عملیات است.',
    },
    {
      target: '[data-tour="ts-view-accounting"], [data-tour="ts-views"]',
      title: 'حسابداری',
      text: 'دفتر مالی سرویس و خلاصه پرداخت‌ها را اینجا ببینید.',
    },
    STATS_STEP,
    TOOLBAR_STEP,
    BOARD_STEP,
    COL_INBOX,
    COL_FIELD,
    COL_WORK,
    COL_DONE,
    CARD_STEP,
    REFRESH_STEP,
    TOUR_BTN_STEP,
  ]
}
