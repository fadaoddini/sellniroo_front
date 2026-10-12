'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** نوار Breaking News — وضعیت از API (بدون کش SSR) */
export default function BreakingNewsSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BREAKING_NEWS}>
      <BreakingNews />
    </ModuleGate>
  )
}
