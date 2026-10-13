'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModuleNotFound from '@/components/modules/ModuleNotFound'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export default function SchoolSlot({ children }) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SCHOOL} fallback={<ModuleNotFound />}>
      {children}
    </ModuleGate>
  )
}
