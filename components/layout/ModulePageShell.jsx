'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  createDefaultModulePageLayout,
  getModulePageDef,
  getSharedInternalLayoutRaw,
  normalizeModulePageLayout,
  SHARED_INTERNAL_LAYOUT_EVENT,
  sharedInternalLayoutHasContent,
  normalizeSharedInternalLayout,
} from '@/config/modulePageLayouts'
import {
  applyHomeChromeSettingsToShared,
  composeInternalPageLayout,
  stripSyncedHeroWidgets,
} from '@/config/chromeThemeSync'
import { fetchSiteSettings } from '@/services/siteSettings'

const ModulePageShellContext = createContext(false)

/**
 * پوسته چیدمان صفحات داخلی ماژول.
 * هدر/منو از «چیدمان مشترک» (سکشن ۱ صفحه اصلی) می‌آید.
 * اگر داخل یک ModulePageShell دیگر باشیم، فقط children را رد می‌کند
 * تا شاخه‌های تو در تو (مثل /repairs/track) دوبار کروم نگیرند.
 */
export default function ModulePageShell({
  pageKey,
  children,
  fallback = null,
}) {
  const nested = useContext(ModulePageShellContext)
  const def = getModulePageDef(pageKey)
  const empty = createDefaultModulePageLayout(pageKey)
  const [layout, setLayout] = useState(empty)

  useEffect(() => {
    if (nested) return undefined
    let cancelled = false
    const resolve = (settings, pageOverride = null) => {
      const pageLayout = stripSyncedHeroWidgets(
        normalizeModulePageLayout(
          pageOverride ?? settings?.module_page_layouts?.[pageKey],
          pageKey,
        ),
      )
      if (def?.keepOwnChrome) {
        return pageLayout
      }

      const shared = applyHomeChromeSettingsToShared(
        normalizeSharedInternalLayout(
          getSharedInternalLayoutRaw(settings?.module_page_layouts),
        ),
        settings?.home_layout,
      )
      if (sharedInternalLayoutHasContent(shared)) {
        return stripSyncedHeroWidgets(
          composeInternalPageLayout(pageLayout, shared, {
            pageKey,
            contentWidget: def?.contentWidget,
          }),
        )
      }

      // چیدمان مشترک خالی است → فقط محتوای صفحه (بدون هدر اجباری خانه)
      return pageLayout
    }
    ;(async () => {
      try {
        const s = await fetchSiteSettings({ force: true })
        if (cancelled) return
        setLayout(resolve(s))
      } catch {
        if (!cancelled) setLayout(empty)
      }
    })()
    const eventName =
      def?.event || `module-page-layout-changed:${pageKey}`
    const onLayout = (ev) => {
      if (!ev?.detail) return
      fetchSiteSettings({ force: true })
        .then((s) => {
          if (!cancelled) setLayout(resolve(s, ev.detail))
        })
        .catch(() => {
          if (!cancelled) {
            setLayout(normalizeModulePageLayout(ev.detail, pageKey))
          }
        })
    }
    const onSharedOrHome = () => {
      fetchSiteSettings({ force: true })
        .then((s) => {
          if (!cancelled) setLayout(resolve(s))
        })
        .catch(() => {})
    }
    window.addEventListener(eventName, onLayout)
    window.addEventListener(SHARED_INTERNAL_LAYOUT_EVENT, onSharedOrHome)
    window.addEventListener('home-layout-changed', onSharedOrHome)
    window.addEventListener('module-page-layouts-changed', onSharedOrHome)
    return () => {
      cancelled = true
      window.removeEventListener(eventName, onLayout)
      window.removeEventListener(SHARED_INTERNAL_LAYOUT_EVENT, onSharedOrHome)
      window.removeEventListener('home-layout-changed', onSharedOrHome)
      window.removeEventListener('module-page-layouts-changed', onSharedOrHome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, nested])

  if (nested) {
    return children
  }

  return (
    <ModulePageShellContext.Provider value={true}>
      <PageBuilderRenderer
        layout={normalizeModulePageLayout(layout, pageKey)}
        articleSlot={children}
        fallback={fallback || children}
      />
    </ModulePageShellContext.Provider>
  )
}
