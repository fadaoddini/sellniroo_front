'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import HeroSlider from '@/components/slider'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * اسلایدر هیرو
 * اگر settings از چیدمان صفحه اصلی بیاید، بدون ModuleGate رندر می‌شود
 * (کنترل نمایش با خود چیدمان است).
 */
export default function HeroSliderSlot({ settings = null } = {}) {
  if (settings != null) {
    return <HeroSlider settings={settings} />
  }
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.HERO_SLIDER}>
      <HeroSlider />
    </ModuleGate>
  )
}
