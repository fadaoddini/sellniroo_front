'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import HeroSlider from '@/components/slider'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** اسلایدر هیرو — وضعیت از /adminweb (ماژول hero_slider) */
export default function HeroSliderSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.HERO_SLIDER}>
      <HeroSlider />
    </ModuleGate>
  )
}
