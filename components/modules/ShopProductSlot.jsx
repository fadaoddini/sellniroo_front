'use client'

import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** سینگل محصول — وابسته به ماژول فروشگاه؛ خاموش → ۴۰۴ */
export default function ShopProductSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.SHOP}
      notFoundWhenInactive
    >
      {children}
    </ModuleGate>
  )
}
