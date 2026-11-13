'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** صفحه /videos — ماژول خاموش → ۴۰۴ */
export default function VideoArchivePageSlot({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.VIDEOINSTA}
      notFoundWhenInactive
    >
      {children}
    </ModuleGate>
  )
}
