'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModuleNotFound from '@/components/modules/ModuleNotFound'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * صفحات /jobs و /jobs/[id] — اگر job_board خاموش باشد → شبیه ۴۰۴
 */
export default function JobsPageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.JOB_BOARD}
      fallback={
        <ModuleNotFound />
      }
    >
      {children}
    </ModuleGate>
  )
}
