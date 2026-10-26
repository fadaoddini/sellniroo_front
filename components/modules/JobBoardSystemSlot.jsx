'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import AllBoxItem from '@/components/AllBoxItem'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  normalizeJobBoardWidgetSettings,
  jobBoardWidgetCssVars,
} from '@/config/jobBoardWidgetSettings'
import styles from './JobBoardSystemSlot.module.css'

/**
 * ویجت سیستم کاریابی — کل بخش فیلتر + لیست آگهی داخل سکشن صفحه
 */
export default function JobBoardSystemSlot({
  settings: rawSettings,
  initialFilters = {},
} = {}) {
  const settings = normalizeJobBoardWidgetSettings(rawSettings)
  const vars = jobBoardWidgetCssVars(settings)

  const hideClass = [
    settings.show_on_mobile === false ? styles.hideOnMobile : '',
    settings.show_on_desktop === false ? styles.hideOnDesktop : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_BOARD}>
      <div
        className={`${styles.wrap} ${hideClass}`.trim()}
        style={vars}
        data-jb-system="1"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <AllBoxItem
            embedded
            demoMode={settings.use_demo_data === true}
            initialFilters={{
              ...initialFilters,
              ...(settings.default_tab === 'hiring'
                ? { adType: 'hiring' }
                : settings.default_tab === 'seeking'
                  ? { adType: 'seeking' }
                  : {}),
            }}
            ui={{
              showFilters: settings.show_filters,
              showTabs: settings.show_tabs,
              showViewToggle: settings.show_view_toggle,
              showTitle: settings.show_title,
              showCount: settings.show_count,
              defaultView: settings.default_view,
            }}
          />
        </div>
      </div>
    </ModuleGate>
  )
}
