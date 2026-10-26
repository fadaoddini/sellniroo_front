// utils/multiVendorAccess.js — دسترسی چندفروشندگی (مدیریت همه فروشگاه‌ها)
import { isPlatformOwner } from '@/utils/ownerAccess'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export const MULTI_VENDOR_PERMISSION = 'multi_vendor'
export const MULTI_VENDOR_MODULE_KEY = SITE_MODULE_KEYS.MULTI_VENDOR

/**
 * دسترسی داشبوردی چندفروشندگی (نه adminweb / adminshops مالک).
 * مسیرهای /shops-* وقتی ماژول multi_vendor روشن است.
 */
export function canManageMultiVendor(
  user,
  { hasPermission, canManageEmployees } = {},
) {
  if (!user) return false
  // مالک پلتفرم ابزارهای خودش را از /admin* دارد؛ در داشبورد هم می‌تواند ببیند
  if (isPlatformOwner(user)) return true
  if (user.is_superuser || user.is_staff) return true
  if (canManageEmployees) return true
  if (typeof hasPermission === 'function' && hasPermission(MULTI_VENDOR_PERMISSION)) {
    return true
  }
  return false
}
