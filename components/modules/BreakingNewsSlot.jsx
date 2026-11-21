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
  SHARED_INTERNAL_LAYOUT_EVENT,
} from '@/config/modulePageLayouts'
import { fetchSiteSettings } from '@/services/siteSettings'

/** تنظیمات نوار بالا از چیدمان مشترک / خانه */
function resolveBreakingSettings(chromeLayout) {
  const widget = findFirstWidgetByType(chromeLayout, ['breaking_news'])
  if (widget?.settings && typeof widget.settings === 'object') {
    return { ...widget.settings }
  }
  const chrome = extractChromeWidgets(chromeLayout)
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
      setResolved(resolveBreakingSettings(resolveSiteChromeLayout(data)))
    }
    fetchSiteSettings({ force: true })
      .then(applyFromSettings)
      .catch(() => {
        if (!cancelled) setResolved(null)
      })
    const refresh = () => {
      fetchSiteSettings({ force: true })
        .then(applyFromSettings)
        .catch(() => {})
    }
    const onHome = (e) => {
      if (e?.detail) {
        applyFromSettings({ home_layout: e.detail })
        return
      }
      refresh()
    }
    window.addEventListener('home-layout-changed', onHome)
    window.addEventListener(SHARED_INTERNAL_LAYOUT_EVENT, refresh)
    window.addEventListener('module-page-layouts-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('home-layout-changed', onHome)
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
