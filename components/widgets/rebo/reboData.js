import {
  AppWindow,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  Gauge,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Newspaper,
  Package,
  ShieldCheck,
  Smartphone,
  Store,
  Terminal,
  Users,
  Webhook,
  Workflow,
  Wrench,
} from 'lucide-react'

/** نوار استک فنی — هر آیتم آیکون Lucide مخصوص خودش */
export const REBO_STACK = [
  {
    id: 'python',
    icon: Terminal,
    label: 'بک‌اند',
    value: 'Python',
    hint: 'هسته پایدار و مقیاس‌پذیر',
    accent: '#26a680',
  },
  {
    id: 'next',
    icon: AppWindow,
    label: 'فرانت',
    value: 'Next.js',
    hint: 'تجربه سریع و واکنش‌گرا',
    accent: '#3b82f6',
  },
  {
    id: 'api',
    icon: Webhook,
    label: 'ارتباطات',
    value: 'API',
    hint: 'اتصال تمیز سرویس‌ها',
    accent: '#14b8a6',
  },
  {
    id: 'quality',
    icon: Gauge,
    label: 'کیفیت',
    value: 'مقیاس‌پذیر',
    hint: 'آماده رشد و نگهداری',
    accent: '#f59e0b',
  },
  {
    id: 'pwa',
    icon: Smartphone,
    label: 'موبایل',
    value: 'PWA',
    hint: 'نصب‌پذیر مثل اپ',
    accent: '#06b6d4',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'مدیریت',
    value: 'داشبورد',
    hint: 'پنل ساده و روان',
    accent: '#8b5cf6',
  },
]

/** امکانات ربو — کارت افقی با تصویر عمودی موبایل‌مانند */
export const REBO_CAPABILITIES = [
  {
    id: 'jobs',
    icon: Briefcase,
    title: 'کاریابی',
    desc: 'آگهی، رزومه و پنل کارجو / کارفرما',
    accent: '#0d9488',
    features: [
      'آگهی شغلی و ویژه',
      'بانک رزومه',
      'پنل کارفرما و کارجو',
      'درخواست و پیگیری',
      'شهر، دسته و فیلتر',
    ],
  },
  {
    id: 'shop',
    icon: Store,
    title: 'فروشگاه',
    desc: 'تک‌فروشگاهی یا مارکت‌پلیس',
    accent: '#c2410c',
    features: [
      'محصول و موجودی',
      'دسته‌بندی و ویترین',
      'سبد و درگاه پرداخت',
      'حالت چندفروشنده',
      'سفارش و پیگیری',
    ],
  },
  {
    id: 'booking',
    icon: CalendarCheck,
    title: 'نوبت‌دهی',
    desc: 'کل سیستم — ۳۵ میلیون تومان',
    accent: '#2563eb',
    features: [
      'تقویم شمسی',
      'خدمات و پرسنل',
      'ساعات کاری و تعطیلی',
      'پیگیری کد نوبت',
      'حسابداری سهم پرسنل',
    ],
  },
  {
    id: 'repairs',
    icon: Wrench,
    title: 'تعمیرات',
    desc: 'کل سیستم — ۳۵ میلیون تومان',
    accent: '#b91c1c',
    features: [
      'ثبت سفارش سرویس',
      'تعمیرکار و اعزام',
      'اجرت و قطعات',
      'پرداخت مرحله‌ای',
      'یادآور پیگیری',
    ],
  },
  {
    id: 'news',
    icon: Newspaper,
    title: 'اخبار',
    desc: 'مجله، دسته‌ها و نوار خبر',
    accent: '#e67e22',
    features: [
      'انتشار و آرشیو',
      'اسلایدر ویژه',
      'دسته‌بندی موضوعی',
      'نوار خبر فوری',
      'اتصال پیام‌رسان',
    ],
  },
  {
    id: 'school',
    icon: GraduationCap,
    title: 'مدرسه',
    desc: 'مدیر، معلم، دانش‌آموز و آزمون',
    accent: '#1d4ed8',
    features: [
      'پنل مدیر و معلم',
      'دانش‌آموز و کلاس',
      'تکلیف و فعالیت',
      'آزمون دوره‌ای',
      'گزارش پیشرفت',
    ],
  },
  {
    id: 'softapps',
    icon: AppWindow,
    title: 'نرم‌افزار',
    desc: 'ویترین دانلود با حسابداری',
    accent: '#4f46e5',
    features: [
      'ویترین دانلود',
      'نسخه رایگان و پولی',
      'دسته‌بندی اپ',
      'حسابداری خرید',
      'درگاه پرداخت',
    ],
  },
  {
    id: 'quiz',
    icon: Brain,
    title: 'آزمون',
    desc: 'سنجش مهارت فروش',
    accent: '#9333ea',
    features: [
      'بانک سوال تخصصی',
      'شرکت‌کنندگان',
      'جدول نفرات برتر',
      'زمان‌بندی آزمون',
      'گزارش نتیجه',
    ],
  },
  {
    id: 'sales',
    icon: CreditCard,
    title: 'فروش',
    desc: 'لید، درخواست و پیگیری',
    accent: '#0f766e',
    features: [
      'ثبت لید و قیف فروش',
      'انواع درخواست',
      'یادداشت پیگیری',
      'درگاه‌های پرداخت',
      'گزارش تبدیل',
    ],
  },
  {
    id: 'brand',
    icon: Building2,
    title: 'سیستم شرکتی',
    desc: 'ساختار سازمانی و هویت شرکت — ۲۵ میلیون',
    accent: '#a16207',
    features: [
      'ساختار و هویت سازمانی',
      'درباره ما، تیم و تماس',
      'هیرو و معرفی برند',
      'منو و فوتر حرفه‌ای',
      'آماده فرایندهای داخلی',
    ],
  },
  {
    id: 'crm',
    icon: Users,
    title: 'CRM اختصاصی',
    desc: 'مدیریت مشتری، پیگیری و فروش روی یک پنل',
    accent: '#334155',
    features: [
      'پرونده مشتری',
      'پیگیری تماس و یادداشت',
      'قیف فروش و لید',
      'وظایف و یادآور',
      'گزارش عملکرد تیم',
    ],
  },
  {
    id: 'club',
    icon: Dumbbell,
    title: 'سامانه اشتراکی',
    desc: 'فروش اشتراک ماهانه بر اساس تعداد نفرات — مثل باشگاه',
    accent: '#26a680',
    features: [
      'اشتراک ماهانه',
      'قیمت بر اساس تعداد اعضا',
      'مدیریت اعضا و زیرمجموعه',
      'برنامه / خدمت حوزه‌ای',
      'درآمد تکرارشونده',
    ],
  },
]

export const REBO_PILLARS = [
  {
    id: 'flexible',
    icon: Layers,
    title: 'منعطف',
    text: 'فقط همان قابلیت‌هایی که نیاز دارید روشن می‌شوند — بدون بار اضافه.',
    accent: '#26a680',
  },
  {
    id: 'standard',
    icon: Workflow,
    title: 'استاندارد',
    text: 'پایتون و Next.js برای توسعه امن، تمیز و قابل گسترش.',
    accent: '#3b82f6',
  },
  {
    id: 'unified',
    icon: ShieldCheck,
    title: 'یکپارچه',
    text: 'احراز هویت، پرداخت و API روی یک هسته هماهنگ.',
    accent: '#8b5cf6',
  },
]

export const REBO_USE_CASES = [
  {
    id: 'jobs',
    icon: Briefcase,
    title: 'کاریابی',
    text: 'آگهی، رزومه و اتصال کارجو به کارفرما',
    accent: '#0d9488',
  },
  {
    id: 'shop',
    icon: Package,
    title: 'فروش آنلاین',
    text: 'فروشگاه تکی یا مارکت‌پلیس چندفروشنده',
    accent: '#c2410c',
  },
  {
    id: 'booking',
    icon: CalendarCheck,
    title: 'نوبت‌دهی',
    text: 'کل سیستم نوبت‌دهی — ۳۵ میلیون تومان',
    accent: '#2563eb',
  },
  {
    id: 'repairs',
    icon: Wrench,
    title: 'تعمیرات',
    text: 'سرویس، اجرت و پیگیری — ۳۵ میلیون تومان',
    accent: '#b91c1c',
  },
  {
    id: 'education',
    icon: BookOpen,
    title: 'آموزش',
    text: 'مدرسه، کلاس، تکلیف و آزمون',
    accent: '#1d4ed8',
  },
  {
    id: 'corporate',
    icon: Building2,
    title: 'سیستم شرکتی',
    text: 'ساختار سازمانی و برند — ۲۵ میلیون تومان',
    accent: '#26a680',
  },
  {
    id: 'subscription',
    icon: Dumbbell,
    title: 'اشتراکی',
    text: 'سامانه اشتراکی حوزه‌ای مثل باشگاه',
    accent: '#0f766e',
  },
]

export { REBO_WIDGET_TYPES } from '@/config/reboWidgetSettings'

export function reboVisible(settings = {}, isMobile) {
  const showOnMobile =
    settings.show_on_mobile === undefined ? true : !!settings.show_on_mobile
  const showOnDesktop =
    settings.show_on_desktop === undefined ? true : !!settings.show_on_desktop
  if (isMobile && !showOnMobile) return false
  if (!isMobile && !showOnDesktop) return false
  return true
}
