'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import CorporateBrandBar from '@/components/common/CorporateBrandBar'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** نوار پروفایل برند — پشت ماژول منوی پیشرفته */
export default function CorporateBrandBarSlot() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
      <CorporateBrandBar />
    </ModuleGate>
  )
}
