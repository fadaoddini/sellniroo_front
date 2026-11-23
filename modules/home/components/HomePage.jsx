'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import { normalizeHomeLayout } from '@/config/homeLayout'
import { composeHomeWithSiteChrome } from '@/config/siteChrome'
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
      setHomeLayout(
        composeHomeWithSiteChrome(
          normalizeHomeLayout(settings?.home_layout),
          settings,
        ),
      )
      setAppShell(isSadraAppShell(settings, siteName))
      const nextName = String(
        settings?.site_name ||
          settings?.logo_title ||
          siteName ||
          '',
      ).trim()
      setBrandName(
        /^(سلنیرو|sellniroo)$/i.test(nextName) ? '' : nextName,
      )
    } catch {
      setHomeLayout(normalizeHomeLayout(DEFAULT_SITE_SETTINGS.home_layout))
      setAppShell(isSadraAppShell(null, siteName))
      const fallback = String(siteName || '').trim()
      setBrandName(
        /^(سلنیرو|sellniroo)$/i.test(fallback) ? '' : fallback,
      )
    } finally {
      setDataReady(true)
    }
  }, [siteName])

  useEffect(() => {
    startedAt.current = Date.now()
    refresh({ force: true })
    const onLayout = (ev) => {
      if (ev?.detail) {
        fetchSiteSettings({ force: true })
          .then((settings) => {
            setHomeLayout(
              composeHomeWithSiteChrome(
                normalizeHomeLayout(ev.detail),
                settings,
              ),
            )
            setDataReady(true)
          })
          .catch(() => {
            setHomeLayout(normalizeHomeLayout(ev.detail))
            setDataReady(true)
          })
      } else {
        refresh({ force: true })
      }
    }
    const onChrome = () => refresh({ force: true })
    window.addEventListener('home-layout-changed', onLayout)
    window.addEventListener('site-data-bust', onLayout)
    window.addEventListener('module-page-layout-changed:chrome_header', onChrome)
    window.addEventListener('module-page-layout-changed:chrome_menu', onChrome)
    window.addEventListener('module-page-layout-changed:chrome_footer', onChrome)
    return () => {
      window.removeEventListener('home-layout-changed', onLayout)
      window.removeEventListener('site-data-bust', onLayout)
      window.removeEventListener(
        'module-page-layout-changed:chrome_header',
        onChrome,
      )
      window.removeEventListener(
        'module-page-layout-changed:chrome_menu',
        onChrome,
      )
      window.removeEventListener(
        'module-page-layout-changed:chrome_footer',
        onChrome,
      )
    }
  }, [refresh, siteName])

  useEffect(() => {
    if (!dataReady) return undefined
    const elapsed = Date.now() - (startedAt.current || Date.now())
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed)
    const t = window.setTimeout(() => setShowSplash(false), wait)
    return () => window.clearTimeout(t)
  }, [dataReady])

  // اسکرول به هش بعد از آماده شدن صفحه (مثلاً /#rebo-cost از پروفایل)
  useEffect(() => {
    if (!dataReady || showSplash) return undefined
    const raw = typeof window !== 'undefined' ? window.location.hash : ''
    const id = raw.replace(/^#/, '').trim()
    if (!id) return undefined

    let tries = 0
    const maxTries = 20
    const tick = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }
    if (tick()) return undefined

    const iv = window.setInterval(() => {
      tries += 1
      if (tick() || tries >= maxTries) window.clearInterval(iv)
    }, 80)
    return () => window.clearInterval(iv)
  }, [dataReady, showSplash, homeLayout])

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
