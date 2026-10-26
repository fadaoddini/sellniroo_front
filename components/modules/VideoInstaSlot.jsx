'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import VideoArchiveSection from '@/components/Story/VideoArchiveSection'
import VideoInstaStoriesRail from '@/components/Story/VideoInstaStoriesRail'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * videoinsta — فقط از ویجت صفحه‌ساز فراخوانی شود (سراسری نیست)
 * - variant="rail": نوار استوری دایره‌ای
 * - variant="section": آرشیو کامل ویدیو
 */
export default function VideoInstaSlot({ variant = 'section', ...props }) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.VIDEOINSTA}>
      {variant === 'rail' ? (
        <VideoInstaStoriesRail {...props} />
      ) : (
        <VideoArchiveSection {...props} />
      )}
    </ModuleGate>
  )
}
