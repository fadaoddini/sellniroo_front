'use client'

import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** صفحات فروشگاه (/shop، /cart، …) — ماژول خاموش → ۴۰۴ */
export default function ShopPageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.SHOP}
      notFoundWhenInactive
    >
      {children}
    </ModuleGate>
  )
}
