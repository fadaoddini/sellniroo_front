'use client'

import React, { Suspense } from 'react'
import ModulePageShell from '@/components/layout/ModulePageShell'
import SiteSearchResults from '@/components/Search/SiteSearchResults'

/** صفحه جستجوی سایت — /search */
export default function SearchSlot() {
  return (
    <ModulePageShell pageKey="search">
      <Suspense
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            در حال بارگذاری جستجو…
          </div>
        }
      >
        <SiteSearchResults />
      </Suspense>
    </ModulePageShell>
  )
}
