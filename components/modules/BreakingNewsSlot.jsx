'use client'

import React, { useEffect, useState } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { findFirstWidgetByType } from '@/config/homeLayout'
import {
  extractChromeWidgets,
  resolveSiteChromeLayout,
} from '@/config/chromeThemeSync'
import {
  getSharedInternalLayoutRaw,
  normalizeSharedInternalLayout,
  SHARED_INTERNAL_LAYOUT_EVENT,
} from '@/config/modulePageLayouts'
import { fetchSiteSettings } from '@/services/siteSettings'

/** تنظیمات نوار بالا — اول چیدمان مشترک ذخیره‌شده، بعد کروم هم‌تراز خانه */
function resolveBreakingSettings(siteSettings) {
  const shared = normalizeSharedInternalLayout(
    getSharedInternalLayoutRaw(siteSettings?.module_page_layouts),
  )
  const fromShared = findFirstWidgetByType(shared, ['breaking_news'])
  if (fromShared?.settings && typeof fromShared.settings === 'object') {
    return { ...fromShared.settings }
  }

  const chromeLayout = resolveSiteChromeLayout(siteSettings)
  const widget = findFirstWidgetByType(chromeLayout, ['breaking_news'])
  if (widget?.settings && typeof widget.settings === 'object') {
    return { ...widget.settings }
  }
  const chrome = extractChromeWidgets(siteSettings?.home_layout || chromeLayout)
  const embedded = chrome.find((w) => w?.type === 'breaking_news')
  if (embedded?.settings && typeof embedded.settings === 'object') {
    return { ...embedded.settings }
  }
  return null
}

/**
 * نوار Breaking News — ظاهر از چیدمان مشترک صفحات داخلی (وگرنه خانه)
 * تا با هدر /reboserver و بقیهٔ صفحات داخلی هماهنگ بماند.
 */
export default function BreakingNewsSlot({ settings = null } = {}) {
  const [resolved, setResolved] = useState(settings)

  useEffect(() => {
    if (settings != null) {
      setResolved(settings)
      return undefined
    }
    let cancelled = false
    const applyFromSettings = (data) => {
      if (cancelled) return
      setResolved(resolveBreakingSettings(data || {}))
    }
    const refresh = () => {
      fetchSiteSettings({ force: true })
        .then(applyFromSettings)
        .catch(() => {
          if (!cancelled) setResolved(null)
        })
    }
    refresh()
    // همیشه تنظیمات کامل را دوباره بخوان — فقط home_layout کافی نیست
    window.addEventListener('home-layout-changed', refresh)
    window.addEventListener(SHARED_INTERNAL_LAYOUT_EVENT, refresh)
    window.addEventListener('module-page-layouts-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('home-layout-changed', refresh)
      window.removeEventListener(SHARED_INTERNAL_LAYOUT_EVENT, refresh)
      window.removeEventListener('module-page-layouts-changed', refresh)
    }
  }, [settings])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BREAKING_NEWS}>
      <BreakingNews settings={resolved ?? undefined} />
    </ModuleGate>
  )
}
