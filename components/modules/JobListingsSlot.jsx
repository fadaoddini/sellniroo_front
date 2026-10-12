'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import AllBoxItem from '@/components/AllBoxItem'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * لیست/فیلتر آگهی‌ها — وضعیت از /adminweb (ماژول job_listings ⊂ job_board)
 * صفحه کامل /jobs با JobsPageSlot گیت می‌شود؛ اینجا فقط محتوا مخفی می‌شود.
 */
export default function JobListingsSlot(props) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_LISTINGS}>
      <AllBoxItem {...props} />
    </ModuleGate>
  )
}
