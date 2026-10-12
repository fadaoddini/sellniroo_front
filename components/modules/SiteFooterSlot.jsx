'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import SiteFooter from '@/components/common/SiteFooter'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** فوتر سایت — وضعیت از /adminweb (ماژول site_footer) */
export default function SiteFooterSlot(props) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SITE_FOOTER}>
      <SiteFooter {...props} />
    </ModuleGate>
  )
}
