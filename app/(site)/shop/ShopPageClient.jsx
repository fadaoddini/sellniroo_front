'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import { ShopListingContent } from '@/components/widgets/shop/ShopProductWidgets'
import {
  fetchSiteSettings,
  clearSiteSettingsCache,
  resolveShopListLayoutForMode,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import {
  applyChromeToLayout,
  extractChromeWidgets,
} from '@/config/chromeThemeSync'
import {
  DEFAULT_SHOP_LIST_LAYOUT,
  findFirstWidgetByType,
  normalizeHomeLayout,
  normalizeShopListLayout,
} from '@/config/homeLayout'
import { resolveActiveShopLayoutMode } from '@/config/shopLayoutModes'

/** اگر چیدمان فروشگاه هدر/منو نداشت، از صفحه اصلی قرض می‌گیرد */
function resolveShopListLayout(settings, moduleMap = {}) {
  const mode = resolveActiveShopLayoutMode(moduleMap)
  const pageLayout = resolveShopListLayoutForMode(settings, mode)
  const home = normalizeHomeLayout(settings?.home_layout)
  const hasChrome = extractChromeWidgets(pageLayout).length > 0
  if (hasChrome || !extractChromeWidgets(home).length) {
    return pageLayout
  }
  return applyChromeToLayout(pageLayout, home, {
    idPrefix: 'shop_list_live',
  })
}

export default function ShopPageClient() {
  const searchParams = useSearchParams()
  const q = searchParams?.get('q') || ''
  const category = searchParams?.get('category') || ''
  const sort = searchParams?.get('sort') || 'newest'
  const filter = searchParams?.get('filter') || 'all'
  const cols = searchParams?.get('cols') || '4'
  const [layout, setLayout] = useState(
    normalizeShopListLayout(DEFAULT_SHOP_LIST_LAYOUT)
  )

  const reload = useCallback(async () => {
    clearSiteSettingsCache()
    clearSiteModulesCache()
    const [s, mods] = await Promise.all([
      fetchSiteSettings({ force: true }),
      fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
    ])
    return resolveShopListLayout(s, mods?.map || {})
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const next = await reload()
        if (!cancelled) setLayout(next)
      } catch {
        /* defaults */
      }
    })()
    const onShop = () => {
      reload()
        .then((next) => {
          if (!cancelled) setLayout(next)
        })
        .catch(() => {})
    }
    const onHome = () => {
      reload()
        .then((next) => {
          if (!cancelled) setLayout(next)
        })
        .catch(() => {})
    }
    const onModules = () => {
      reload()
        .then((next) => {
          if (!cancelled) setLayout(next)
        })
        .catch(() => {})
    }
    window.addEventListener('shop-list-layout-changed', onShop)
    window.addEventListener('shop-list-layouts-changed', onShop)
    window.addEventListener('home-layout-changed', onHome)
    window.addEventListener('site-modules-changed', onModules)
    return () => {
      cancelled = true
      window.removeEventListener('shop-list-layout-changed', onShop)
      window.removeEventListener('shop-list-layouts-changed', onShop)
      window.removeEventListener('home-layout-changed', onHome)
      window.removeEventListener('site-modules-changed', onModules)
    }
  }, [reload])

  const pageSettings = useMemo(
    () => findFirstWidgetByType(layout, 'shop_page')?.settings || {},
    [layout]
  )

  const slot = useMemo(
    () => (
      <ShopListingContent
        initialQuery={q}
        category={category}
        sort={sort}
        filter={filter}
        cols={cols}
        settings={pageSettings}
      />
    ),
    [q, category, sort, filter, cols, pageSettings]
  )

  return (
    <div className="shopListAppShell">
      <PageBuilderRenderer layout={layout} articleSlot={slot} />
    </div>
  )
}
