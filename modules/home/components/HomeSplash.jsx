'use client'

import React, { useEffect, useState } from 'react'
import styles from '../styles/HomeSplash.module.css'

/**
 * لودینگ تمام‌صفحهٔ صفحه اصلی — تا چیدمان آماده شود، بعد محو می‌شود.
 */
export default function HomeSplash({
  active = true,
  siteName = '',
  brandHint = '',
}) {
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return undefined
    if (active) {
      setLeaving(false)
      setGone(false)
      return undefined
    }
    setLeaving(true)
    const t = window.setTimeout(() => setGone(true), 520)
    return () => window.clearTimeout(t)
  }, [active, mounted])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const html = document.documentElement
    const body = document.body
    const unlock = () => {
      html.style.removeProperty('overflow')
      body.style.removeProperty('overflow')
    }
    if (gone || (!active && leaving)) {
      unlock()
      return undefined
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return unlock
  }, [active, leaving, gone])

  if (gone) return null

  const title = (siteName || brandHint || 'در حال بارگذاری').trim()

  return (
    <div
      className={[
        styles.splash,
        leaving ? styles.splashOut : '',
        !mounted ? styles.splashBoot : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-busy={active ? 'true' : 'false'}
      aria-label="در حال بارگذاری صفحه اصلی"
    >
      <div className={styles.glowA} aria-hidden />
      <div className={styles.glowB} aria-hidden />
      <div className={styles.grain} aria-hidden />

      <div className={styles.stage}>
        <div className={styles.markWrap} aria-hidden>
          <span className={styles.ring} />
          <span className={styles.ringSoft} />
          <span className={styles.core}>
            <span className={styles.coreShine} />
          </span>
        </div>

        <p className={styles.brand}>{title}</p>
        <p className={styles.caption}>در حال آماده‌سازی صفحه</p>

        <div className={styles.barTrack} aria-hidden>
          <span className={styles.barFill} />
        </div>
      </div>
    </div>
  )
}
