'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import HeaderByMenuTop from '@/components/common/HeaderByMenuTop'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** هدر دارای منو — ماژول header_by_menu_top ⊂ corporate_system */
export default function HeaderByMenuTopSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.HEADER_BY_MENU_TOP}>
      <HeaderByMenuTop />
    </ModuleGate>
  )
}
