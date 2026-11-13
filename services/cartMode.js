import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { resolveProfileSystemId } from '@/services/profileSystem'
import { fetchSiteSettings } from '@/services/siteSettings'
import {
  getCheckoutSystemConfig,
  isCheckoutOptionOn,
  normalizeCheckoutPipelines,
} from '@/config/checkoutPipelines'

/**
 * حالت سبد شناور سایت — بر اساس پایپ‌لاین سفارش ادمین + ماژول‌ها
 * @returns {Promise<'rebo'|'shop'|'none'>}
 */
export async function resolveCartMode({ force = false } = {}) {
  let pipelines = normalizeCheckoutPipelines({})
  try {
    const settings = await fetchSiteSettings({ force })
    pipelines = normalizeCheckoutPipelines(settings?.checkout_pipelines)
  } catch {
    /* defaults */
  }

  const fabPriority = pipelines.fab_priority || 'auto'
  if (fabPriority === 'none') return 'none'

  const shopCfg = getCheckoutSystemConfig(pipelines, 'shop')
  const reboCfg = getCheckoutSystemConfig(pipelines, 'rebo')

  const reboOn =
    reboCfg.enabled &&
    (await isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE, {
      force,
    })) &&
    isCheckoutOptionOn(pipelines, 'rebo', 'show_fab')

  const [shopTheme, marketTheme, shopProfile, shopOn] = await Promise.all([
    isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE, { force }),
    isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE, {
      force,
    }),
    isSiteModuleActive(SITE_MODULE_KEYS.SHOP_PROFILE, { force }),
    isSiteModuleActive(SITE_MODULE_KEYS.SHOP, { force }),
  ])

  const shopEligible =
    shopCfg.enabled &&
    shopOn &&
    (shopTheme || marketTheme || shopProfile)

  let shopFallback = false
  if (!shopEligible && shopCfg.enabled && shopOn) {
    const profileId = await resolveProfileSystemId({ force })
    shopFallback = profileId === 'shop'
  }
  const shopOk = shopEligible || shopFallback

  if (fabPriority === 'shop') {
    if (shopOk) return 'shop'
    if (reboOn) return 'rebo'
    return 'none'
  }

  if (fabPriority === 'rebo') {
    if (reboOn) return 'rebo'
    if (shopOk) return 'shop'
    return 'none'
  }

  // auto: ربو → فروشگاه → هیچ (نوبت/تعمیرات سبد شناور ندارند)
  if (reboOn) return 'rebo'
  if (shopOk) return 'shop'
  return 'none'
}
