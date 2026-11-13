'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import VideoArchiveSection from '@/components/Story/VideoArchiveSection'
import VideoArchiveRecycler from '@/components/Story/VideoArchiveRecycler'
import VideoInstaStoriesRail from '@/components/Story/VideoInstaStoriesRail'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * videoinsta — فقط از ویجت صفحه‌ساز فراخوانی شود (سراسری نیست)
 * - variant="rail": نوار استوری دایره‌ای
 * - variant="section": آرشیو کامل ویدیو
 * - variant="recycler": ردیف افقی (ریسایکلر)
 */
export default function VideoInstaSlot({ variant = 'section', ...props }) {
  let body = <VideoArchiveSection {...props} />
  if (variant === 'rail') body = <VideoInstaStoriesRail {...props} />
  if (variant === 'recycler') body = <VideoArchiveRecycler {...props} />

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.VIDEOINSTA}>{body}</ModuleGate>
  )
}
