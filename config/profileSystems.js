import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * پروفایل اختصاصی هر کسب‌وکار روی /profile
 * توجه: قالب ربو (data_pack_rebo_theme_one) جداگانه و با اولویت بالاتر در resolveProfileSystemId مدیریت می‌شود.
 * اولویت بقیه وقتی چند سیستم با هم روشن‌اند: از بالا به پایین.
 */
export const PROFILE_SYSTEMS = [
  {
    id: 'job',
    moduleKey: SITE_MODULE_KEYS.JOB_PROFILE,
    parentKey: SITE_MODULE_KEYS.JOB_BOARD,
    label: 'پروفایل کاریابی',
    defaultTab: 'hiring',
  },
  {
    id: 'shop',
    moduleKey: SITE_MODULE_KEYS.SHOP_PROFILE,
    parentKey: SITE_MODULE_KEYS.SHOP,
    label: 'پروفایل فروشگاهی',
    defaultTab: 'orders',
    /** اگر ماژول پروفایل هنوز در دیتابیس نباشد ولی فروشگاه روشن باشد */
    fallbackParentOnly: true,
  },
  {
    id: 'booking',
    moduleKey: SITE_MODULE_KEYS.BOOKING_PROFILE,
    parentKey: SITE_MODULE_KEYS.BOOKING,
    label: 'پروفایل نوبت‌دهی',
    defaultTab: 'bookings',
    fallbackParentOnly: true,
  },
  {
    id: 'repairs',
    moduleKey: SITE_MODULE_KEYS.REPAIRS_PROFILE,
    parentKey: SITE_MODULE_KEYS.REPAIRS,
    label: 'پروفایل تعمیرات',
    defaultTab: 'requests',
    fallbackParentOnly: true,
  },
  {
    id: 'school',
    moduleKey: SITE_MODULE_KEYS.SCHOOL_PROFILE,
    parentKey: SITE_MODULE_KEYS.SCHOOL,
    label: 'پروفایل مدرسه',
    defaultTab: 'school',
    fallbackParentOnly: true,
  },
]

export const PROFILE_SYSTEM_IDS = PROFILE_SYSTEMS.map((s) => s.id)

export function getProfileSystem(id) {
  return PROFILE_SYSTEMS.find((s) => s.id === id) || null
}
