'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import {
  Baby,
  Cigarette,
  Earth,
  ExternalLink,
  HeartPulse,
  Info,
  Loader2,
  MapPinned,
  RefreshCw,
  Skull,
} from 'lucide-react'
import Config from '@/config/config'
import styles from './rasad.module.css'

const faNum = (n) =>
  Math.max(0, Math.floor(Number(n) || 0)).toLocaleString('fa-IR')

const faRate = (n) =>
  Number(n || 0).toLocaleString('fa-IR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })

function elapsedSinceDayStart(dayStartIso) {
  if (!dayStartIso) return 0
  const start = new Date(dayStartIso).getTime()
  if (Number.isNaN(start)) return 0
  return Math.max(0, (Date.now() - start) / 1000)
}

function LiveValue({ ratePerSecond, dayStartIso, seed }) {
  const [value, setValue] = useState(() =>
    Math.floor((seed ?? 0) || elapsedSinceDayStart(dayStartIso) * (ratePerSecond || 0))
  )
  const raf = useRef(0)

  useEffect(() => {
    const tick = () => {
      const next = elapsedSinceDayStart(dayStartIso) * (ratePerSecond || 0)
      setValue(Math.floor(next))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [ratePerSecond, dayStartIso])

  return <span className={styles.statValue}>{faNum(value)}</span>
}

function RegionBlock({ region, dayStartIso, tone }) {
  if (!region) return null
  const rates = region.rates || {}
  const today = region.today || {}
  const isIran = tone === 'iran'

  return (
    <section className={`${styles.statsRegion} ${isIran ? styles.statsRegionIran : ''}`}>
      <header className={styles.statsRegionHead}>
        <span className={styles.statsRegionIcon} aria-hidden>
          {isIran ? <MapPinned size={16} /> : <Earth size={16} />}
        </span>
        <div>
          <h3>{region.label_fa}</h3>
          <p>نرخ‌های سالانه و شمارنده‌های امروز</p>
        </div>
      </header>

      <div className={styles.rateGrid}>
        <article className={styles.rateCard}>
          <span className={styles.rateLabel}>نرخ خام تولد</span>
          <strong>
            {faRate(region.crude_birth_rate)}
            <em> ‰</em>
          </strong>
          <span className={styles.rateHint}>در هزار نفر / سال</span>
        </article>
        <article className={styles.rateCard}>
          <span className={styles.rateLabel}>نرخ خام مرگ</span>
          <strong>
            {faRate(region.crude_death_rate)}
            <em> ‰</em>
          </strong>
          <span className={styles.rateHint}>در هزار نفر / سال</span>
        </article>
      </div>

      <div className={styles.liveGrid}>
        <article className={`${styles.liveCard} ${styles.liveBirth}`}>
          <div className={styles.liveTop}>
            <Baby size={16} strokeWidth={2.2} />
            <span>متولدین امروز</span>
          </div>
          <LiveValue
            ratePerSecond={rates.births_per_second}
            dayStartIso={dayStartIso}
            seed={today.births}
          />
          <span className={styles.liveSub}>
            سالانه {faNum(region.births_per_year)}
          </span>
        </article>

        <article className={`${styles.liveCard} ${styles.liveDeath}`}>
          <div className={styles.liveTop}>
            <Skull size={16} strokeWidth={2.2} />
            <span>فوت‌شدگان امروز</span>
          </div>
          <LiveValue
            ratePerSecond={rates.deaths_per_second}
            dayStartIso={dayStartIso}
            seed={today.deaths}
          />
          <span className={styles.liveSub}>
            سالانه {faNum(region.deaths_per_year)}
          </span>
        </article>

        <article className={`${styles.liveCard} ${styles.liveSmoke}`}>
          <div className={styles.liveTop}>
            <Cigarette size={16} strokeWidth={2.2} />
            <span>سیگار امروز</span>
          </div>
          <LiveValue
            ratePerSecond={rates.cigarettes_per_second}
            dayStartIso={dayStartIso}
            seed={today.cigarettes}
          />
          <span className={styles.liveSub}>
            سالانه {faNum(region.cigarettes_per_year)} نخ
          </span>
        </article>
      </div>
    </section>
  )
}

export default function WorldStatsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const url = Config.endpoints.rasad.worldStats()
      const res = await axios.get(url)
      setData(res.data?.data || res.data)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'خطا در دریافت آمار')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const dayStartIso = useMemo(
    () => data?.clock?.day_start || data?.clock?.day_start_utc,
    [data]
  )

  if (loading && !data) {
    return (
      <div className={styles.loadingBox}>
        <Loader2 size={20} className={styles.spin} />
        <span>در حال بارگذاری آمار جهانی و ایران...</span>
      </div>
    )
  }

  return (
    <div className={styles.statsWrap}>
      <div className={styles.statsToolbar}>
        <div className={styles.statsIntro}>
          <HeartPulse size={15} strokeWidth={2.2} />
          <div>
            <strong>پالس جمعیتی {data?.reference_year || '—'}</strong>
            <p>برآورد زنده بر پایه نرخ‌های رسمی سالانه</p>
          </div>
        </div>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => load({ soft: true })}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? styles.spin : undefined} />
          همگام‌سازی
        </button>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          <Info size={15} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className={styles.statsRegions}>
        <RegionBlock region={data?.world} dayStartIso={dayStartIso} tone="world" />
        <RegionBlock region={data?.iran} dayStartIso={dayStartIso} tone="iran" />
      </div>

      <aside className={styles.sourcesBox}>
        <h4>
          <Info size={14} strokeWidth={2.2} />
          منابع و روش
        </h4>
        <p>{data?.methodology}</p>
        <ul>
          {(data?.sources || []).map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title_fa}
                <ExternalLink size={12} />
              </a>
              <span>{(s.covers || []).join(' · ')}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
