/**
 * مسیرهای پیش‌نمایش زنده برای بسته‌های برآورد هزینه ربو.
 * فقط سیستم‌هایی که صفحه/اپ واقعی قابل تست دارند.
 */

export const REBO_LIVE_PREVIEWS = [
  {
    id: 'inventory',
    test: /انبار|inventory|pkg_inventory/i,
    href: '/preview/system/inventory_theme_one',
    label: 'تست زنده انبار',
    hint: 'پیش‌نمایش واقعی سیستم انبارداری پیشرفته',
    pack: 'inventory_theme_one',
  },
  {
    id: 'gym_bodybuilding',
    test: /بدنسازی|gym_bodybuilding|pkg_gym/i,
    href: '/preview/system/gym_bodybuilding_theme_one',
    label: 'تست زنده باشگاه',
    hint: 'پیش‌نمایش واقعی باشگاه بدنسازی',
    pack: 'gym_bodybuilding_theme_one',
  },
  {
    id: 'billiard',
    test: /بیلیارد|billiard/i,
    href: '/gym/billiard',
    label: 'تست زنده بیلیارد',
    hint: 'ورود به مدیریت باشگاه بیلیارد',
  },
  {
    id: 'jobs',
    test: /کاریابی|jobs|job_board/i,
    href: '/preview/system/job_theme_two',
    label: 'تست زنده کاریابی تم دو',
    hint: 'پیش‌نمایش واقعی سیستم کاریابی تم دو',
    pack: 'job_theme_two',
  },
  {
    id: 'booking',
    test: /نوبت|booking/i,
    href: '/booking',
    label: 'تست زنده نوبت‌دهی',
    hint: 'رزرو و پیگیری نوبت واقعی',
  },
  {
    id: 'shop_single',
    test: /فروشگاه\s*تکی|shop_single|single_store/i,
    href: '/shop',
    label: 'تست زنده فروشگاه',
    hint: 'ویترین، سبد و پرداخت فروشگاه',
  },
  {
    id: 'shop_marketplace',
    test: /مارکت|چندفروش|marketplace/i,
    href: '/shop',
    label: 'تست زنده مارکت‌پلیس',
    hint: 'ویترین چندفروشندگی',
  },
  {
    id: 'news',
    test: /خبر|news/i,
    href: '/news',
    label: 'تست زنده اخبار',
    hint: 'لیست و سینگل خبر',
  },
  {
    id: 'repairs',
    test: /تعمیر|repairs/i,
    href: '/repairs',
    label: 'تست زنده تعمیرات',
    hint: 'درخواست سرویس و پیگیری',
  },
  {
    id: 'school',
    test: /مدرسه|school/i,
    href: '/preview/system/school_theme_one',
    label: 'تست زنده مدرسه',
    hint: 'پیش‌نمایش واقعی سیستم مدرسه تم یک',
    pack: 'school_theme_one',
  },
  {
    id: 'video',
    test: /ویدیو|استوری|video/i,
    href: '/videos',
    label: 'تست زنده ویدیو',
    hint: 'آرشیو ویدیو و استوری',
  },
  {
    id: 'catalog',
    test: /کاتالوگ|catalog/i,
    href: '/apps',
    label: 'تست زنده کاتالوگ',
    hint: 'نمایش نرم‌افزارها و کاتالوگ',
  },
]

function haystack(pkgOrItem) {
  return [
    pkgOrItem?.id,
    pkgOrItem?.key,
    pkgOrItem?.type,
    pkgOrItem?.name,
    pkgOrItem?.label,
    pkgOrItem?.category,
    pkgOrItem?.desc,
  ]
    .filter(Boolean)
    .join(' ')
}

/** اگر سیستم صفحه زنده داشته باشد، اطلاعات پیش‌نمایش را برمی‌گرداند */
export function resolvePackageLivePreview(pkgOrItem) {
  if (!pkgOrItem) return null
  const hay = haystack(pkgOrItem)
  const found = REBO_LIVE_PREVIEWS.find((p) => p.test.test(hay))
  if (!found) return null
  return {
    id: found.id,
    href: found.href,
    label: found.label,
    hint: found.hint,
  }
}
