'use client'

import React, { Suspense } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import ShopAccountingPanel from '@/components/Shop/owner/ShopAccountingPanel'

function Fallback() {
  return (
    <div dir="rtl" style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
      در حال بارگذاری هاب فروشگاه…
    </div>
  )
}

export default function DashboardShopAccountingPage() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP} notFoundWhenInactive>
      <Suspense fallback={<Fallback />}>
        <ShopAccountingPanel />
      </Suspense>
    </ModuleGate>
  )
}
