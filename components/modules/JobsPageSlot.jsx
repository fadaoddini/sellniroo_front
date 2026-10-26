'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * صفحات /jobs و /jobs/[id] — ماژول کاریابی خاموش → ۴۰۴ واقعی
 */
export default function JobsPageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.JOB_BOARD}
      notFoundWhenInactive
    >
      {children}
    </ModuleGate>
  )
}
