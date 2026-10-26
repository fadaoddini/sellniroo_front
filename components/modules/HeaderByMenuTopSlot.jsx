'use client'

import React, { useEffect, useState } from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import SiteTopNavWidget from '@/components/widgets/SiteTopNavWidget'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { findFirstWidgetByType } from '@/config/homeLayout'
import { createDefaultSiteTopNavSettings } from '@/config/siteTopNavWidgetSettings'
import { fetchSiteSettings } from '@/services/siteSettings'

/** تنظیمات منوی دسکتاپ صفحات داخلی — همان ویجت منوی صفحه اصلی */
function resolveChromeMenuSettings(homeLayout) {
  const widget = findFirstWidgetByType(homeLayout, [
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
    // نوار پایین موبایل را CorporateMobileNavSlot مدیریت می‌کند
    mobile_bottom_nav: false,
    // مثل هدر قدیمی: فقط دسکتاپ (موبایل از نوار پایین)
    show_on_mobile: false,
    show_on_desktop: true,
  }
}

/** هدر دارای منو — همان SiteTopNavWidget صفحه اصلی برای یکسان بودن ظاهر */
export default function HeaderByMenuTopSlot() {
  const [settings, setSettings] = useState(() =>
    resolveChromeMenuSettings(null)
  )

  useEffect(() => {
    let cancelled = false
    const apply = (layout) => {
      if (!cancelled) setSettings(resolveChromeMenuSettings(layout))
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
  }, [])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
      <SiteTopNavWidget settings={settings} />
    </ModuleGate>
  )
}
