'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import Flipbook from '@/components/Catalog/Flipbook'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

export default function CatalogSlot(props) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.CATALOG}>
      <Flipbook {...props} />
    </ModuleGate>
  )
}
