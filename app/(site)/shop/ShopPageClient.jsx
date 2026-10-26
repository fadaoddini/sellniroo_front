'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import { ShopListingContent } from '@/components/widgets/shop/ShopProductWidgets'
import {
  fetchSiteSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  DEFAULT_SHOP_LIST_LAYOUT,
  normalizeShopListLayout,
} from '@/config/homeLayout'

export default function ShopPageClient() {
  const searchParams = useSearchParams()
  const q = searchParams?.get('q') || ''
  const category = searchParams?.get('category') || ''
  const [layout, setLayout] = useState(
    normalizeShopListLayout(DEFAULT_SHOP_LIST_LAYOUT)
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        clearSiteSettingsCache()
        const s = await fetchSiteSettings({ force: true })
        if (!cancelled) {
          setLayout(normalizeShopListLayout(s?.shop_list_layout))
        }
      } catch {
        /* defaults */
      }
    })()
    const onChange = (e) => {
      if (e?.detail) setLayout(normalizeShopListLayout(e.detail))
    }
    window.addEventListener('shop-list-layout-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('shop-list-layout-changed', onChange)
    }
  }, [])

  const slot = useMemo(
    () => <ShopListingContent initialQuery={q} category={category} />,
    [q, category]
  )

  return <PageBuilderRenderer layout={layout} articleSlot={slot} />
}
