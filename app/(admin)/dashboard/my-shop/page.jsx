'use client'

import React, { Suspense } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import ShopOwnerPanel from '@/components/Shop/owner/ShopOwnerPanel'

function MyShopFallback() {
  return (
    <div dir="rtl" style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
      در حال بارگذاری فروشگاه من…
    </div>
  )
}

export default function DashboardMyShopPage() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP} notFoundWhenInactive>
      <Suspense fallback={<MyShopFallback />}>
        <ShopOwnerPanel embedded initialTab="overview" />
      </Suspense>
    </ModuleGate>
  )
}
