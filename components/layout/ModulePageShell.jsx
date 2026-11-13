'use client'

import React, { useEffect, useState } from 'react'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  createDefaultModulePageLayout,
  getModulePageDef,
  normalizeModulePageLayout,
} from '@/config/modulePageLayouts'
import {
  applyChromeToLayout,
  extractChromeWidgets,
} from '@/config/chromeThemeSync'
import { fetchSiteSettings } from '@/services/siteSettings'

/**
 * پوسته چیدمان صفحات داخلی ماژول — مثل /news با news_list_layout
 * اگر هدر در چیدمان صفحه نباشد، از هدر صفحه اصلی قرض می‌گیرد.
 * @param {{ pageKey: string, children: React.ReactNode, fallback?: React.ReactNode }} props
 */
export default function ModulePageShell({
  pageKey,
  children,
  fallback = null,
}) {
  const def = getModulePageDef(pageKey)
  const empty = createDefaultModulePageLayout(pageKey)
  const [layout, setLayout] = useState(empty)

  useEffect(() => {
    let cancelled = false
    const resolve = (settings, pageOverride = null) => {
      const pageLayout = normalizeModulePageLayout(
        pageOverride ?? settings?.module_page_layouts?.[pageKey],
        pageKey,
      )
      const home = settings?.home_layout
      // صفحه مدرسه کروم اختصاصی دارد؛ هدر خانه را رویش ننشان.
      if (def?.keepOwnChrome) {
        return pageLayout
      }
      // همیشه هدر/رنگ خانه را روی صفحات ماژول (مثل پروفایل) بنشان —
      // وگرنه هدر قدیمی ذخیره‌شده، «اعمال هدر و رنگ به همه» را خنثی می‌کند.
      if (extractChromeWidgets(home).length > 0) {
        return applyChromeToLayout(pageLayout, home, {
          idPrefix: `${pageKey}_live`,
          contentWidget: def?.contentWidget,
        })
      }
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
    const onHome = () => {
      fetchSiteSettings({ force: true })
        .then((s) => {
          if (!cancelled) setLayout(resolve(s))
        })
        .catch(() => {})
    }
    window.addEventListener(eventName, onLayout)
    window.addEventListener('home-layout-changed', onHome)
    window.addEventListener('module-page-layouts-changed', onHome)
    return () => {
      cancelled = true
      window.removeEventListener(eventName, onLayout)
      window.removeEventListener('home-layout-changed', onHome)
      window.removeEventListener('module-page-layouts-changed', onHome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey])

  return (
    <PageBuilderRenderer
      layout={normalizeModulePageLayout(layout, pageKey)}
      articleSlot={children}
      fallback={fallback || children}
    />
  )
}
