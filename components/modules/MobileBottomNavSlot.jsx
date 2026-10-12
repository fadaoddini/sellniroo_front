'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import MobileBottomNav from '@/components/common/MobileBottomNav'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** منوی پایین کاریابی — وقتی سیستم شرکتی فعال باشد مخفی می‌شود */
export default function MobileBottomNavSlot() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.JOB_MOBILE_NAV}
      unlessKey={SITE_MODULE_KEYS.CORPORATE_SYSTEM}
    >
      <MobileBottomNav />
    </ModuleGate>
  )
}
