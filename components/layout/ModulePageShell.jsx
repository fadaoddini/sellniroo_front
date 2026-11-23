'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  createDefaultModulePageLayout,
  getModulePageDef,
  getSharedInternalLayoutRaw,
  normalizeModulePageLayout,
  pageKeepsOwnChrome,
  SHARED_INTERNAL_LAYOUT_EVENT,
  sharedInternalLayoutHasContent,
  normalizeSharedInternalLayout,
} from '@/config/modulePageLayouts'
import {
  applyHomeChromeSettingsToShared,
  composeInternalPageLayout,
  stripSyncedHeroWidgets,
} from '@/config/chromeThemeSync'
import {
  composeWithSiteChrome,
  layoutHasChromeOpts,
} from '@/config/siteChrome'
import { fetchSiteSettings } from '@/services/siteSettings'
import { fetchSiteModules } from '@/services/siteModules'
import { normalizeNewsListLayout } from '@/config/homeLayout'

const ModulePageShellContext = createContext(false)

/** آیا این درخت داخل پوستهٔ صفحهٔ ماژول است (برای جلوگیری از کروم دوبل) */
export function useModulePageShell() {
  return useContext(ModulePageShellContext)
}

function layoutHasAnyWidget(layout) {
  return (layout?.rows || []).some((row) =>
    (row.columns || []).some((col) => (col.widgets || []).length > 0),
  )
}

/** لیست اخبار قدیمی → چیدمان ماژول news (محتوای کامل = news_list_content) */
function newsListLayoutAsModulePage(raw) {
  const L = normalizeNewsListLayout(raw)
  const rows = (L.rows || []).map((row) => ({
    ...row,
    columns: (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).map((w) => {
        const t = String(w?.type || '')
        if (t === 'news_page' || t === 'news_list_page') {
          return { ...w, type: 'news_list_content' }
        }
        return w
      }),
    })),
  }))
  return normalizeModulePageLayout({ ...L, rows }, 'news')
}

/**
 * پوسته چیدمان صفحات داخلی ماژول.
 * هدر/منو از «چیدمان مشترک» (سکشن ۱ صفحه اصلی) می‌آید —
 * مگر صفحه keepOwnChrome / ownChromeWhenSchool (مثل news و profile در قالب مدرسه).
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
    const resolve = (settings, moduleMap, pageOverride = null) => {
      let pageLayout = stripSyncedHeroWidgets(
        normalizeModulePageLayout(
          pageOverride ?? settings?.module_page_layouts?.[pageKey],
          pageKey,
        ),
      )
      const keepOwn = pageKeepsOwnChrome(def, moduleMap)

      if (keepOwn) {
        // مدرسه: اگر چیدمان ماژول news خالی بود، از news_list_layout بساز
        if (
          pageKey === 'news' &&
          !layoutHasAnyWidget(pageLayout) &&
          settings?.news_list_layout
        ) {
          pageLayout = stripSyncedHeroWidgets(
            newsListLayoutAsModulePage(settings.news_list_layout),
          )
        }
        // مدل جدید: هدر/منو/فوتر اختیاری حتی روی صفحات keepOwnChrome
        if (layoutHasChromeOpts(pageLayout)) {
          return composeWithSiteChrome(pageLayout, settings, {
            pageKey,
            contentWidget: def?.contentWidget,
          })
        }
        return pageLayout
      }

      // مدل جدید: انتخاب اختیاری هدر/منو/فوتر به‌جای کپی اجباری از shared
      if (layoutHasChromeOpts(pageLayout)) {
        return composeWithSiteChrome(pageLayout, settings, {
          pageKey,
          contentWidget: def?.contentWidget,
        })
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
        const [s, mods] = await Promise.all([
          fetchSiteSettings({ force: true }),
          fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
        ])
        if (cancelled) return
        setLayout(resolve(s, mods?.map || {}))
      } catch {
        if (!cancelled) setLayout(empty)
      }
    })()
    const eventName =
      def?.event || `module-page-layout-changed:${pageKey}`
    const onLayout = (ev) => {
      if (!ev?.detail) return
      Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
      ])
        .then(([s, mods]) => {
          if (!cancelled) setLayout(resolve(s, mods?.map || {}, ev.detail))
        })
        .catch(() => {
          if (!cancelled) {
            setLayout(normalizeModulePageLayout(ev.detail, pageKey))
          }
        })
    }
    const onSharedOrHome = () => {
      Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
      ])
        .then(([s, mods]) => {
          if (!cancelled) setLayout(resolve(s, mods?.map || {}))
        })
        .catch(() => {})
    }
    window.addEventListener(eventName, onLayout)
    window.addEventListener(SHARED_INTERNAL_LAYOUT_EVENT, onSharedOrHome)
    window.addEventListener('home-layout-changed', onSharedOrHome)
    window.addEventListener('module-page-layouts-changed', onSharedOrHome)
    window.addEventListener('site-modules-changed', onSharedOrHome)
    window.addEventListener(
      'module-page-layout-changed:chrome_header',
      onSharedOrHome,
    )
    window.addEventListener(
      'module-page-layout-changed:chrome_menu',
      onSharedOrHome,
    )
    window.addEventListener(
      'module-page-layout-changed:chrome_footer',
      onSharedOrHome,
    )
    return () => {
      cancelled = true
      window.removeEventListener(eventName, onLayout)
      window.removeEventListener(SHARED_INTERNAL_LAYOUT_EVENT, onSharedOrHome)
      window.removeEventListener('home-layout-changed', onSharedOrHome)
      window.removeEventListener('module-page-layouts-changed', onSharedOrHome)
      window.removeEventListener('site-modules-changed', onSharedOrHome)
      window.removeEventListener(
        'module-page-layout-changed:chrome_header',
        onSharedOrHome,
      )
      window.removeEventListener(
        'module-page-layout-changed:chrome_menu',
        onSharedOrHome,
      )
      window.removeEventListener(
        'module-page-layout-changed:chrome_footer',
        onSharedOrHome,
      )
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
