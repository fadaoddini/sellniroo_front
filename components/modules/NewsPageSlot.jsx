'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** صفحات /news و /news/[slug] — ماژول خاموش → ۴۰۴ واقعی */
export default function NewsPageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.NEWS}
      notFoundWhenInactive
    >
      {children}
    </ModuleGate>
  )
}
