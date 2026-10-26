'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import CorporateMobileNav from '@/components/common/CorporateMobileNav'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** منوی پایین موبایل — پشت ماژول منوی پیشرفته */
export default function CorporateMobileNavSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
      <CorporateMobileNav />
    </ModuleGate>
  )
}
