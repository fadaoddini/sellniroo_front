'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export default function CloudServerLayout({ children }) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.CLOUD_SERVER}>
      <ModulePageShell pageKey="cloud_server">{children}</ModulePageShell>
    </ModuleGate>
  )
}
