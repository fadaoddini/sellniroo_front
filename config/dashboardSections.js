// config/dashboardSections.js — بخش‌بندی دسترسی سریع داشبورد

/**
 * ترتیب و برچسب گروه‌های داشبورد.
 * هر اکشن با `group` به یکی از این idها وصل می‌شود.
 */
export const DASHBOARD_SECTION_DEFS = [
  { id: 'news', labelFa: 'اخبار', labelEn: 'News' },
  { id: 'jobs', labelFa: 'کاریابی', labelEn: 'Jobs' },
  { id: 'booking', labelFa: 'نوبت‌دهی', labelEn: 'Booking' },
  { id: 'repairs', labelFa: 'تعمیرات و سرویس', labelEn: 'Repairs' },
  { id: 'gym', labelFa: 'باشگاه ورزشی', labelEn: 'Gym & clubs' },
  { id: 'school', labelFa: 'مدیریت مدرسه', labelEn: 'School management' },
  { id: 'content', labelFa: 'محتوا و رسانه', labelEn: 'Content & media' },
  { id: 'site', labelFa: 'سایت و تنظیمات', labelEn: 'Site & settings' },
  { id: 'sales', labelFa: 'فروش و تماس', labelEn: 'Sales & contact' },
  { id: 'inventory', labelFa: 'انبارداری', labelEn: 'Inventory' },
  {
    id: 'shop',
    labelFa: 'فروشگاه',
    labelEn: 'Shop',
  },
  {
    id: 'marketplace',
    labelFa: 'چندفروشندگی',
    labelEn: 'Multi-vendor',
  },
  { id: 'team', labelFa: 'تیم', labelEn: 'Team' },
  { id: 'other', labelFa: 'سایر', labelEn: 'Other' },
]

/** از روی href / id، گروه داشبورد را مشخص می‌کند */
export function resolveDashboardGroup(action) {
  const href = String(action?.href || '').split('?')[0]
  const id = String(action?.id || action?.sectionCode || '')

  if (
    href.startsWith('/news') ||
    href === '/news-featured-list' ||
    href === '/news-by-category' ||
    href === '/news-latest' ||
    href === '/news-recycler' ||
    href === '/news-list' ||
    href === '/news-single' ||
    href === '/platform-connections' ||
    id === 'news' ||
    id === 'news-featured' ||
    id === 'news-featured-list' ||
    id === 'news-by-category' ||
    id === 'news-latest' ||
    id === 'news-recycler' ||
    id === 'news-list' ||
    id === 'news-single' ||
    id === 'platform-connections'
  ) {
    return 'news'
  }
  if (
    href.startsWith('/jobs') ||
    href === '/job-single' ||
    href === '/post-job' ||
    href.startsWith('/jobs-data') ||
    id === 'jobs' ||
    id === 'jobs-manage' ||
    id === 'job-single' ||
    id === 'post-job' ||
    id === 'jobs-data' ||
    id === 'jobs-locations' ||
    id === 'jobs-cooperation' ||
    id === 'jobs-categories' ||
    id === 'jobs-titles' ||
    id === 'jobs-filters' ||
    id === 'jobs-companies' ||
    id === 'jobs-applications' ||
    id === 'jobs-resumes' ||
    id === 'jobisell'
  ) {
    return 'jobs'
  }
  if (
    href === '/booking' ||
    href === '/booking-manage' ||
    id === 'booking' ||
    id === 'booking-manage' ||
    id === 'nobat'
  ) {
    return 'booking'
  }
  if (
    href === '/ticker' ||
    href === '/hero-slider' ||
    href === '/home-hero-manage' ||
    href === '/videoinsta-manage' ||
    id === 'home-hero-manage' ||
    href === '/catalog-manage' ||
    href === '/about-manage' ||
    href === '/quiz-manage' ||
    href === '/faq-manage' ||
    href === '/apps-manage' ||
    href === '/apps' ||
    href.startsWith('/apps/')
  ) {
    return 'content'
  }
  if (
    href === '/school-manage' ||
    href.startsWith('/teachers') ||
    href.startsWith('/counselors') ||
    id === 'school' ||
    id === 'school-manage' ||
    id === 'school-profile' ||
    id === 'school-teacher' ||
    id === 'school-student' ||
    id === 'school-counselor' ||
    id === 'school-account' ||
    id.startsWith('school-')
  ) {
    return 'school'
  }
  if (
    href === '/todoservice' ||
    href === '/repairs' ||
    href.startsWith('/repairs/') ||
    id === 'repairs' ||
    id === 'todoservice' ||
    id.startsWith('repairs-')
  ) {
    return 'repairs'
  }
  if (
    href === '/gym' ||
    href.startsWith('/gym/') ||
    id === 'gym' ||
    id === 'gym-bodybuilding' ||
    id === 'gym-billiard' ||
    id === 'gym_bodybuilding' ||
    id === 'gym_billiard' ||
    id.startsWith('gym-')
  ) {
    return 'gym'
  }
  if (
    href === '/site-settings' ||
    href === '/header-menu' ||
    href === '/payment-manage' ||
    href === '/paymentsystem' ||
    href === '/serversystem' ||
    href === '/cloud-manage' ||
    href === '/adminweb' ||
    href === '/adminmodule' ||
    href === '/rebosystem' ||
    href === '/rebolearn' ||
    href === '/rebo-pricing' ||
    href === '/adminnews' ||
    href === '/adminkaryabi' ||
    href === '/adminshop' ||
    href === '/adminsettings' ||
    id === 'payment' ||
    id === 'payment-manage' ||
    id === 'paymentsystem' ||
    id === 'serversystem' ||
    id === 'cloud-manage'
  ) {
    return 'site'
  }
  if (
    href === '/shops-manage' ||
    href === '/shops-accounting' ||
    href === '/shops-products' ||
    id === 'shops-manage' ||
    id === 'shops-accounting' ||
    id === 'shops-products' ||
    id === 'multi-vendor' ||
    id === 'multi_vendor' ||
    id === 'marketplace'
  ) {
    return 'marketplace'
  }
  if (
    href === '/shop-panel' ||
    href === '/dashboard/my-shop' ||
    href === '/dashboard/shop-accounting' ||
    href.startsWith('/dashboard/shop-accounting') ||
    href === '/product-single' ||
    href === '/adminshop' ||
    href === '/adminshops' ||
    href === '/adminproducts' ||
    href === '/admincategories' ||
    href.startsWith('/shop-') ||
    href === '/shop' ||
    id === 'shop' ||
    id === 'shop-manage' ||
    id === 'shop-panel' ||
    id === 'my-shop' ||
    id === 'shop-accounting' ||
    id === 'shop-settings' ||
    id === 'shop-categories' ||
    id === 'product-single' ||
    id === 'adminshop' ||
    id === 'adminshops' ||
    id === 'adminproducts' ||
    id === 'admincategories' ||
    id === 'single-store' ||
    id === 'single_store'
  ) {
    return 'shop'
  }
  if (
    href === '/request-types' ||
    href === '/sale' ||
    href === '/rebo-manage' ||
    href === '/rebosystem' ||
    id === 'sale' ||
    id === 'rebo-manage' ||
    id === 'rebosystem'
  ) {
    return 'sales'
  }
  if (
    href === '/inventory' ||
    href.startsWith('/inventory/') ||
    id === 'inventory' ||
    id === 'warehouse'
  ) {
    return 'inventory'
  }
  if (href === '/employees' || id === 'employees') {
    return 'team'
  }
  return action?.group || 'other'
}

/**
 * اکشن‌های تخت را به آرایهٔ بخش‌ها تبدیل می‌کند.
 * بخش‌های خالی حذف می‌شوند.
 */
export function groupDashboardActions(actions, language = 'fa') {
  const byId = Object.fromEntries(
    (actions || []).map((a) => {
      const group = a.group || resolveDashboardGroup(a)
      return [a.id, { ...a, group }]
    })
  )
  const buckets = {}
  Object.values(byId).forEach((a) => {
    const g = a.group || 'other'
    if (!buckets[g]) buckets[g] = []
    buckets[g].push(a)
  })

  return DASHBOARD_SECTION_DEFS.map((def) => ({
    id: def.id,
    label: language === 'en' ? def.labelEn : def.labelFa,
    actions: buckets[def.id] || [],
  })).filter((s) => s.actions.length > 0)
}
