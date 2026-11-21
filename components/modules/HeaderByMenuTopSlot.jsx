'use client'

import React, { useEffect, useState } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import SiteTopNavWidget from '@/components/widgets/SiteTopNavWidget'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { findFirstWidgetByType } from '@/config/homeLayout'
import { createDefaultSiteTopNavSettings } from '@/config/siteTopNavWidgetSettings'
import { resolveSiteChromeLayout } from '@/config/chromeThemeSync'
import { SHARED_INTERNAL_LAYOUT_EVENT } from '@/config/modulePageLayouts'
import { fetchSiteSettings } from '@/services/siteSettings'

/** تنظیمات منوی دسکتاپ — از چیدمان مشترک / خانه */
function resolveChromeMenuSettings(chromeLayout) {
  const widget = findFirstWidgetByType(chromeLayout, [
    'site_menu',
    'site_top_nav',
    'corporate_header',
  ])
  const base = {
    ...createDefaultSiteTopNavSettings(),
    ...(widget?.settings && typeof widget.settings === 'object'
      ? widget.settings
      : {}),
  }
  return {
    ...base,
    mobile_bottom_nav: false,
    show_on_mobile: false,
    show_on_desktop: true,
  }
}

/** هدر دارای منو — هم‌ظاهر با هدر مشترک صفحات داخلی */
export default function HeaderByMenuTopSlot() {
  const [settings, setSettings] = useState(() =>
    resolveChromeMenuSettings(null)
  )

  useEffect(() => {
    let cancelled = false
    const applyFromSettings = (data) => {
      if (cancelled) return
      setSettings(resolveChromeMenuSettings(resolveSiteChromeLayout(data)))
    }
    fetchSiteSettings({ force: true })
      .then(applyFromSettings)
      .catch(() => applyFromSettings(null))
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
  }, [])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
      <SiteTopNavWidget settings={settings} />
    </ModuleGate>
  )
}
