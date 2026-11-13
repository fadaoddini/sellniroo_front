'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModuleNotFound from '@/components/modules/ModuleNotFound'
import ModulePageShell from '@/components/layout/ModulePageShell'
import SoftAppsPage from '@/components/SoftApps/SoftAppsPage'
import SoftAppDetail from '@/components/SoftApps/SoftAppDetail'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export default function SoftAppsSlot({ slug = null, ...props }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.SOFTAPPS}
      fallback={<ModuleNotFound />}
    >
      {slug ? (
        <SoftAppDetail slug={slug} {...props} />
      ) : (
        <ModulePageShell pageKey="apps">
          <SoftAppsPage {...props} />
        </ModulePageShell>
      )}
    </ModuleGate>
  )
}
