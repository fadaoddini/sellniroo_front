'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModuleNotFound from '@/components/modules/ModuleNotFound'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** صفحات /news و /news/[slug] — فقط وقتی ماژول news فعال باشد */
export default function NewsPageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.NEWS}
      fallback={
        <ModuleNotFound />
      }
    >
      {children}
    </ModuleGate>
  )
}
