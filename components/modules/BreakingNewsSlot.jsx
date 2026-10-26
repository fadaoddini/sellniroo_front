'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** نوار Breaking News — همیشه پشت ماژول breaking_news */
export default function BreakingNewsSlot({ settings = null } = {}) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BREAKING_NEWS}>
      <BreakingNews settings={settings ?? undefined} />
    </ModuleGate>
  )
}
