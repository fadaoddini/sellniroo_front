'use client'

import React, { useEffect } from 'react'
import { normalizeHomeLayout } from '@/config/homeLayout'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import styles from '@/modules/home/styles/HomePage.module.css'

export default function SystemPreviewClient({
  layout,
  title = 'پیش‌نمایش سیستم',
}) {
  const homeLayout = normalizeHomeLayout(layout)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const root = document.documentElement
    const prevWidth = root.dataset.homeWidth
    const prevMax = root.style.getPropertyValue('--home-max-width')
    const prevGutter = root.style.getPropertyValue('--home-gutter')
    root.dataset.homeWidth = homeLayout.page_width || 'container'
    root.style.setProperty(
      '--home-max-width',
      `${homeLayout.max_width || 1200}px`,
    )
    root.style.setProperty('--home-gutter', `${homeLayout.gutter || 16}px`)
    return () => {
      if (prevWidth) root.dataset.homeWidth = prevWidth
      else delete root.dataset.homeWidth
      root.style.setProperty('--home-max-width', prevMax)
      root.style.setProperty('--home-gutter', prevGutter)
    }
  }, [homeLayout.page_width, homeLayout.max_width, homeLayout.gutter])

  return (
    <div className={styles.homeContainer} data-system-preview="1" dir="rtl">
      <h1 className="sr-only">{title}</h1>
      <div className={`${styles.homeContent} ${styles.homeContentIn}`}>
        <PageBuilderRenderer layout={homeLayout} fallback={null} />
      </div>
    </div>
  )
}
