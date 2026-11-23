'use client'

import React from 'react'
import WidgetThemeChips from './WidgetThemeChips'
import {
  applyBreakingNewsTheme,
  listBreakingNewsThemes,
  snapshotBreakingNewsAsTheme,
} from '@/config/breakingNewsThemes'

/** تم‌های جمع‌وجور ویجت خبر فوری */
export default function WidgetBreakingNewsThemes({ settings, onChange }) {
  return (
    <WidgetThemeChips
      settings={settings}
      onChange={onChange}
      presetKey="breaking_news"
      label="تم خبر"
      listThemes={listBreakingNewsThemes}
      applyTheme={applyBreakingNewsTheme}
      snapshotTheme={snapshotBreakingNewsAsTheme}
    />
  )
}
