'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** هدر از چیدمان مشترک صفحات داخلی (SiteChrome + ModulePageShell) می‌آید. */
export default function ReboServerLayout({ children }) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.CLOUD_SERVER}>
      {children}
    </ModuleGate>
  )
}
