'use client'

import React from 'react'
import {
  ReboCapabilities,
  ReboCloudOrderSection,
  ReboClosing,
  ReboDashboard,
  ReboHero,
  ReboOps,
  ReboPillars,
  ReboPricing,
  ReboStack,
  ReboUsecases,
} from '@/components/widgets/rebo'
import styles from './ReboShowcaseWidget.module.css'

/**
 * ویجت ترکیبی قدیمی — همه بخش‌های ربو را پشت سر هم رندر می‌کند.
 * ترجیح: ویجت‌های جدا (rebo_hero، rebo_pricing، …) در صفحه‌ساز.
 */
export default function ReboShowcaseWidget({ settings: raw = {} }) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const showPricing =
    s.show_pricing_calculator === undefined ? true : !!s.show_pricing_calculator
  const showCloudOrder =
    s.show_cloud_order === undefined ? true : !!s.show_cloud_order

  const shared = {
    show_on_mobile: s.show_on_mobile,
    show_on_desktop: s.show_on_desktop,
  }

  return (
    <div className={styles.shell} dir="rtl">
      <ReboHero
        settings={{
          ...shared,
          brand: s.brand,
          headline: s.headline,
          subtitle: s.subtitle,
          cta_label: s.cta_label,
          cta_href: s.cta_href,
        }}
      />
      <ReboStack settings={shared} />
      <ReboPillars settings={shared} />
      <ReboCapabilities settings={shared} />
      <ReboDashboard settings={shared} />
      <ReboUsecases settings={shared} />
      {showPricing ? (
        <ReboPricing settings={{ ...shared, cta_href: s.cta_href }} />
      ) : null}
      <ReboOps settings={shared} />
      {showCloudOrder ? <ReboCloudOrderSection settings={shared} /> : null}
      <ReboClosing
        settings={{
          ...shared,
          brand: s.brand,
          cta_label: s.cta_label,
          cta_href: s.cta_href,
        }}
      />
    </div>
  )
}
