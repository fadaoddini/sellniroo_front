'use client'

import React from 'react'
import WidgetThemeChips from './WidgetThemeChips'
import {
  applySiteMenuTheme,
  listSiteMenuThemes,
  snapshotSiteMenuAsTheme,
} from '@/config/siteMenuThemes'

/** تم‌های جمع‌وجور ویجت منو */
export default function WidgetSiteMenuThemes({ settings, onChange }) {
  return (
    <WidgetThemeChips
      settings={settings}
      onChange={onChange}
      presetKey="site_menu"
      label="تم منو"
      listThemes={listSiteMenuThemes}
      applyTheme={applySiteMenuTheme}
      snapshotTheme={snapshotSiteMenuAsTheme}
    />
  )
}
