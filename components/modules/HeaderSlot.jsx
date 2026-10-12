'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import Header from '@/components/common/Header'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** هدر کاریابی — وقتی سیستم شرکتی فعال باشد مخفی می‌شود */
export default function HeaderSlot() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.JOB_HEADER}
      unlessKey={SITE_MODULE_KEYS.CORPORATE_SYSTEM}
    >
      <Header />
    </ModuleGate>
  )
}
