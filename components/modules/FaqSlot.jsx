'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModuleNotFound from '@/components/modules/ModuleNotFound'
import FaqPage from '@/components/Faq/FaqPage'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export default function FaqSlot(props) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.FAQ}
      fallback={<ModuleNotFound />}
    >
      <FaqPage {...props} />
    </ModuleGate>
  )
}
