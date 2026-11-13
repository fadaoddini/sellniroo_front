'use client'

import React, { useEffect, useState } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { findFirstWidgetByType } from '@/config/homeLayout'
import { extractChromeWidgets } from '@/config/chromeThemeSync'
import { fetchSiteSettings } from '@/services/siteSettings'

/** تنظیمات نوار بالا از ویجت breaking_news خانه — یا کروم embedشده در هیرو باشگاه */
function resolveBreakingSettings(homeLayout) {
  const widget = findFirstWidgetByType(homeLayout, ['breaking_news'])
  if (widget?.settings && typeof widget.settings === 'object') {
    return { ...widget.settings }
  }
  const chrome = extractChromeWidgets(homeLayout)
  const embedded = chrome.find((w) => w?.type === 'breaking_news')
  if (embedded?.settings && typeof embedded.settings === 'object') {
    return { ...embedded.settings }
  }
  return null
}

/**
 * نوار Breaking News — رنگ و ظاهر از چیدمان صفحه اصلی
 * (پروفایل، سبد و صفحات SiteChrome با هدر خانه هم‌رنگ می‌شوند)
 */
export default function BreakingNewsSlot({ settings = null } = {}) {
  const [resolved, setResolved] = useState(settings)

  useEffect(() => {
    if (settings != null) {
      setResolved(settings)
      return undefined
    }
    let cancelled = false
    const apply = (layout) => {
      if (!cancelled) setResolved(resolveBreakingSettings(layout))
    }
    fetchSiteSettings({ force: true })
      .then((data) => apply(data?.home_layout))
      .catch(() => apply(null))
    const onLayout = (e) => apply(e?.detail)
    window.addEventListener('home-layout-changed', onLayout)
    return () => {
      cancelled = true
      window.removeEventListener('home-layout-changed', onLayout)
    }
  }, [settings])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BREAKING_NEWS}>
      <BreakingNews settings={resolved ?? undefined} />
    </ModuleGate>
  )
}
