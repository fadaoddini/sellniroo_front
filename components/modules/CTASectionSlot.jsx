'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import CTASection from '@/modules/home/components/sections/CTASection'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** بخش تماس صفحه اصلی — وضعیت از /adminweb (ماژول cta_section ⊂ sales_marketing) */
export default function CTASectionSlot(props) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.CTA_SECTION}>
      <CTASection {...props} />
    </ModuleGate>
  )
}
