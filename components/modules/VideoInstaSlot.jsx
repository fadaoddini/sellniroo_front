'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import VideoArchiveSection from '@/components/Story/VideoArchiveSection'
import VideoInstaStoriesRail from '@/components/Story/VideoInstaStoriesRail'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * videoinsta
 * - variant="rail": نوار استوری زیر breaking news (موبایل)
 * - variant="section": آرشیو کامل صفحه اصلی (دسکتاپ)
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
