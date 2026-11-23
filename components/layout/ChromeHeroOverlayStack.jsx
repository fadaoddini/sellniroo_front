'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'
import styles from './PageBuilder.module.css'

/**
 * هدر/منو را روی هیرو می‌نشاند:
 * - بک‌گراند خود منو/هدر حفظ می‌شود
 * - لایهٔ زیر (هیرو) زیر کروم کشیده می‌شود
 * - با اسکرول، کروم sticky می‌ماند
 */
export default function ChromeHeroOverlayStack({ chrome, hero, className }) {
  const chromeRef = useRef(null)
  const [chromeH, setChromeH] = useState(0)

  useLayoutEffect(() => {
    const el = chromeRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      const h = Math.ceil(el.getBoundingClientRect().height || 0)
      setChromeH(h)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [chrome])

  return (
    <div
      className={`${styles.chromeHeroStack} ${className || ''}`.trim()}
      data-chrome-hero-stack="1"
      style={{ '--pb-chrome-overlay-h': `${chromeH}px` }}
    >
      <div
        ref={chromeRef}
        className={styles.chromeHeroOverlay}
        data-chrome-hero-overlay="1"
      >
        {chrome}
      </div>
      <div
        className={styles.chromeHeroUnderlay}
        data-chrome-hero-underlay="1"
        style={{
          marginTop: chromeH > 0 ? `-${chromeH}px` : undefined,
        }}
      >
        {hero}
      </div>
    </div>
  )
}
