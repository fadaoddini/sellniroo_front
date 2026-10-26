'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import { normalizeHomeLayout } from '@/config/homeLayout'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'

import styles from '../styles/HomePage.module.css'

/**
 * صفحه اصلی فقط آنچه در تب «طراحی صفحه اصلی» ساخته شده را نشان می‌دهد.
 * بدون fallback به ماژول‌های خودکار.
 */
const HomePage = ({ seoSubtitle = '', siteName = '' }) => {
  const [homeLayout, setHomeLayout] = useState(null)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const settings = await fetchSiteSettings({ force: false })
      setHomeLayout(normalizeHomeLayout(settings?.home_layout))
    } catch {
      setHomeLayout(normalizeHomeLayout(DEFAULT_SITE_SETTINGS.home_layout))
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onLayout = (ev) => {
      if (ev?.detail) {
        setHomeLayout(normalizeHomeLayout(ev.detail))
        setReady(true)
      } else {
        fetchSiteSettings({ force: true })
          .then((s) => setHomeLayout(normalizeHomeLayout(s?.home_layout)))
          .catch(() => {})
      }
    }
    window.addEventListener('home-layout-changed', onLayout)
    return () => window.removeEventListener('home-layout-changed', onLayout)
  }, [refresh])

  return (
    <div className={styles.homeContainer}>
      {seoSubtitle ? (
        <h2 className="sr-only">{seoSubtitle}</h2>
      ) : siteName ? (
        <h2 className="sr-only">{siteName}</h2>
      ) : null}

      {ready ? (
        <PageBuilderRenderer layout={homeLayout} fallback={null} />
      ) : null}
    </div>
  )
}

export default HomePage
