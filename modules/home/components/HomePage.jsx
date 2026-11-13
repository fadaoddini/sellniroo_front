'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import { normalizeHomeLayout } from '@/config/homeLayout'
import { isSadraAppShell } from '@/config/sadraTheme'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import HomeSplash from './HomeSplash'

import styles from '../styles/HomePage.module.css'

const MIN_SPLASH_MS = 650

/**
 * صفحه اصلی فقط آنچه در تب «طراحی صفحه اصلی» ساخته شده را نشان می‌دهد.
 * بدون fallback به ماژول‌های خودکار.
 */
const HomePage = ({ seoSubtitle = '', siteName = '' }) => {
  const [homeLayout, setHomeLayout] = useState(null)
  const [dataReady, setDataReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [appShell, setAppShell] = useState(() => isSadraAppShell(null, siteName))
  const [brandName, setBrandName] = useState(siteName || '')
  const startedAt = useRef(0)

  const refresh = useCallback(async ({ force = true } = {}) => {
    try {
      const settings = await fetchSiteSettings({ force })
      setHomeLayout(normalizeHomeLayout(settings?.home_layout))
      setAppShell(isSadraAppShell(settings, siteName))
      setBrandName(
        settings?.site_name ||
          settings?.logo_title ||
          siteName ||
          DEFAULT_SITE_SETTINGS.site_name
      )
    } catch {
      setHomeLayout(normalizeHomeLayout(DEFAULT_SITE_SETTINGS.home_layout))
      setAppShell(isSadraAppShell(null, siteName))
      setBrandName(siteName || DEFAULT_SITE_SETTINGS.site_name)
    } finally {
      setDataReady(true)
    }
  }, [siteName])

  useEffect(() => {
    startedAt.current = Date.now()
    refresh({ force: true })
    const onLayout = (ev) => {
      if (ev?.detail) {
        setHomeLayout(normalizeHomeLayout(ev.detail))
        setDataReady(true)
      } else {
        refresh({ force: true })
      }
    }
    window.addEventListener('home-layout-changed', onLayout)
    window.addEventListener('site-data-bust', onLayout)
    return () => {
      window.removeEventListener('home-layout-changed', onLayout)
      window.removeEventListener('site-data-bust', onLayout)
    }
  }, [refresh, siteName])

  useEffect(() => {
    if (!dataReady) return undefined
    const elapsed = Date.now() - (startedAt.current || Date.now())
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed)
    const t = window.setTimeout(() => setShowSplash(false), wait)
    return () => window.clearTimeout(t)
  }, [dataReady])

  return (
    <div
      className={[styles.homeContainer, appShell ? styles.homeAppShell : '']
        .filter(Boolean)
        .join(' ')}
      data-app-shell={appShell ? '1' : '0'}
    >
      <HomeSplash active={showSplash} siteName={brandName || siteName} />

      {seoSubtitle ? (
        <h2 className="sr-only">{seoSubtitle}</h2>
      ) : siteName ? (
        <h2 className="sr-only">{siteName}</h2>
      ) : null}

      {dataReady ? (
        <div
          className={[
            styles.homeContent,
            showSplash ? styles.homeContentPending : styles.homeContentIn,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <PageBuilderRenderer layout={homeLayout} fallback={null} />
        </div>
      ) : null}
    </div>
  )
}

export default HomePage
