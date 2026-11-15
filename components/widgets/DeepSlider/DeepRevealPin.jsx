'use client'

import React, { useMemo } from 'react'
import DeepSlider from './DeepSlider'
import {
  isDeepRevealUnderType,
  normalizeDeepSliderSettings,
} from '@/config/deepSliderSettings'
import styles from './DeepRevealPin.module.css'

/**
 * پین مشترک: انیمیشن ربو زیر ماسک + اسلایدر عمیق روی آن
 * تا از داخل حروف REBO همان انیمیشن دیده شود.
 */
export default function DeepRevealPin({
  deepWidget,
  underWidget,
  renderUnder,
}) {
  const deepSettings = useMemo(
    () => normalizeDeepSliderSettings(deepWidget?.settings || {}),
    [deepWidget?.settings],
  )

  if (!deepWidget || !underWidget || !isDeepRevealUnderType(underWidget.type)) {
    return null
  }

  return (
    <div
      className={styles.pin}
      data-deep-reveal-pin="1"
      style={{
        '--ds-scroll-vh': `${deepSettings.scroll_vh}vh`,
        height: `${deepSettings.scroll_vh}vh`,
      }}
    >
      <div className={styles.sticky}>
        <div className={styles.under} data-deep-reveal-under="1">
          {typeof renderUnder === 'function'
            ? renderUnder({
                ...underWidget,
                settings: {
                  ...(underWidget.settings || {}),
                  deep_reveal_pinned: true,
                  scene_full_page: true,
                },
              })
            : null}
        </div>
        <div className={styles.mask}>
          <DeepSlider settings={deepWidget.settings} embedded />
        </div>
      </div>
    </div>
  )
}
