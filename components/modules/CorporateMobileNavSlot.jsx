'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import CorporateMobileNav from '@/components/common/CorporateMobileNav'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** منوی پایین سیستم شرکتی — ماژول corporate_mobile_nav ⊂ corporate_system */
export default function CorporateMobileNavSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.CORPORATE_MOBILE_NAV}>
      <CorporateMobileNav />
    </ModuleGate>
  )
}
