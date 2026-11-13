'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  RefreshCw,
  Map,
  Info,
  Radar,
  Database,
  CalendarClock,
  Tags,
  MapPinned,
  Trophy,
  Flame,
  Loader2,
  AlertCircle,
  TrendingUp,
  Search,
  HeartPulse,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import IranChoropleth from './IranChoropleth'
import WorldStatsPanel from './WorldStatsPanel'
import styles from './rasad.module.css'

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')
const DEFAULT_KEYWORD = 'ال اس اف'
const TABS = [
  { id: 'trends', label: 'علاقه استانی', Icon: Radar },
  { id: 'stats', label: 'آمار جهان و ایران', Icon: HeartPulse },
]

const sourceMeta = (source) => {
  if (source === 'trends') {
    return { label: 'Google Trends', Icon: TrendingUp, tone: 'ok' }
  }
  if (source === 'cache') {
    return { label: 'کش Trends', Icon: Database, tone: 'warn' }
  }
  return { label: 'داده پایه', Icon: Database, tone: 'muted' }
}

function TrendsTab() {
  const { isAuthenticated, getAuthHeaders } = useAuth() || {}
  const [keywordInput, setKeywordInput] = useState(DEFAULT_KEYWORD)
  const [activeKeyword, setActiveKeyword] = useState(DEFAULT_KEYWORD)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const applyPayload = useCallback((payload) => {
    setData(payload)
    if (payload?.keyword) setActiveKeyword(payload.keyword)
    setSelectedId((prev) => {
      const still = payload?.provinces?.some((p) => p.id === prev)
      return still ? prev : payload?.provinces?.[0]?.id || null
    })
  }, [])

  const load = useCallback(async (kw = DEFAULT_KEYWORD) => {
    setLoading(true)
    setError(null)
    try {
      const url = Config.endpoints.rasad.provinces({ q: kw })
      const res = await axios.get(url)
      const payload = res.data?.data || res.data
      applyPayload(payload)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'خطا در دریافت داده رصد')
    } finally {
      setLoading(false)
    }
  }, [applyPayload])

  useEffect(() => {
    load(DEFAULT_KEYWORD)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const searchKeyword = async (e) => {
    e?.preventDefault?.()
    const kw = keywordInput.trim()
    if (!kw) {
      setError('کلمه کلیدی را وارد کنید')
      return
    }
    setSearching(true)
    setError(null)
    try {
      const url = Config.endpoints.rasad.search()
      const res = await axios.post(url, { q: kw, refresh: '1' })
      const payload = res.data?.data || res.data
      applyPayload(payload)
      setActiveKeyword(kw)
    } catch (err) {
      try {
        await load(kw)
        setActiveKeyword(kw)
      } catch (e2) {
        setError(
          err?.response?.data?.message ||
            e2?.response?.data?.message ||
            err.message ||
            'جستجو ناموفق بود'
        )
      }
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    setError(null)
    const kw = (activeKeyword || keywordInput || DEFAULT_KEYWORD).trim()
    try {
      if (isAuthenticated && typeof getAuthHeaders === 'function') {
        const url = Config.endpoints.rasad.refresh()
        const res = await axios.post(
          url,
          { q: kw },
          { headers: getAuthHeaders() }
        )
        applyPayload(res.data?.data || res.data)
      } else {
        const url = Config.endpoints.rasad.search()
        const res = await axios.post(url, { q: kw, refresh: '1' })
        applyPayload(res.data?.data || res.data)
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'به‌روزرسانی ناموفق بود')
      await load(kw)
    } finally {
      setRefreshing(false)
    }
  }

  const provinces = data?.provinces || []
  const selected = useMemo(
    () => provinces.find((p) => p.id === selectedId) || provinces[0] || null,
    [provinces, selectedId]
  )
  const top = provinces[0]
  const src = sourceMeta(data?.source)

  const fetchedLabel = useMemo(() => {
    if (!data?.fetched_at) return '—'
    try {
      return new Date(data.fetched_at).toLocaleString('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return data.fetched_at
    }
  }, [data])

  return (
    <>
      <div className={styles.tabToolbar}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={refresh}
          disabled={refreshing || loading || searching}
          aria-label="به‌روزرسانی"
        >
          <RefreshCw size={15} className={refreshing ? styles.spin : undefined} />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      <form className={styles.searchForm} onSubmit={searchKeyword}>
        <label className={styles.searchLabel} htmlFor="rasad-keyword">
          کلمه کلیدی
        </label>
        <div className={styles.searchRow}>
          <input
            id="rasad-keyword"
            className={styles.searchInput}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="مثلاً: ال اس اف، ویلا، سوله..."
            maxLength={120}
            disabled={searching || loading}
          />
          <button
            type="submit"
            className={styles.searchBtn}
            disabled={searching || loading || !keywordInput.trim()}
          >
            {searching ? (
              <Loader2 size={16} className={styles.spin} />
            ) : (
              <Search size={16} />
            )}
            رتبه‌بندی کشور
          </button>
        </div>
        <p className={styles.searchHint}>
          با وارد کردن کلمه، علاقه نسبی جستجو در استان‌ها از Google Trends گرفته می‌شود.
        </p>
      </form>

      <div className={styles.metaRow}>
        <span className={`${styles.chip} ${styles[`chip_${src.tone}`] || ''}`}>
          <src.Icon size={13} strokeWidth={2.2} />
          {src.label}
        </span>
        <span className={styles.chip}>
          <CalendarClock size={13} strokeWidth={2.2} />
          ۱۲ ماه · {fetchedLabel}
        </span>
        <span className={styles.chip}>
          <Tags size={13} strokeWidth={2.2} />
          {activeKeyword || '—'}
        </span>
        {top ? (
          <span className={`${styles.chip} ${styles.chipHot}`}>
            <Flame size={13} strokeWidth={2.2} />
            رتبه ۱: {top.nameFa} ({faNum(top.score)})
          </span>
        ) : null}
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      ) : null}

      {loading && !data ? (
        <div className={styles.loadingBox}>
          <Loader2 size={20} className={styles.spin} />
          <span>در حال بارگذاری نقشه...</span>
        </div>
      ) : (
        <div className={styles.layout}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <Map size={15} strokeWidth={2.2} />
              <h2>نقشه استان‌ها</h2>
            </div>
            <IranChoropleth
              provinces={provinces}
              selectedId={selected?.id}
              onSelect={(p) => setSelectedId(p.id)}
              width={560}
              height={420}
            />
            {selected ? (
              <div className={styles.selectedCard}>
                <span className={styles.selectedIcon}>
                  <MapPinned size={16} strokeWidth={2.2} />
                </span>
                <div className={styles.selectedBody}>
                  <strong>
                    رتبه {faNum(selected.rank || provinces.findIndex((p) => p.id === selected.id) + 1)} ·{' '}
                    {selected.nameFa}
                  </strong>
                  <em>
                    امتیاز نسبی {faNum(selected.score)}
                    <span> / ۱۰۰</span>
                  </em>
                </div>
                <div
                  className={styles.selectedRing}
                  style={{
                    background: `conic-gradient(#800020 ${selected.score}%, #e2e8f0 0)`,
                  }}
                  aria-hidden
                >
                  <span>{faNum(selected.score)}</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <Trophy size={15} strokeWidth={2.2} />
              <h2>رتبه‌بندی کشور</h2>
              <span className={styles.count}>{faNum(provinces.length)} استان</span>
            </div>
            <ul className={styles.list}>
              {provinces.map((p, i) => {
                const isTop = i < 3
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`${styles.listItem} ${
                        selected?.id === p.id ? styles.listItemActive : ''
                      }`}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <span
                        className={`${styles.rank} ${isTop ? styles.rankHot : ''}`}
                      >
                        {isTop ? (
                          <Flame size={12} strokeWidth={2.4} />
                        ) : (
                          faNum(p.rank || i + 1)
                        )}
                      </span>
                      <span className={styles.name}>{p.nameFa}</span>
                      <span className={styles.score}>{faNum(p.score)}</span>
                      <span className={styles.barWrap}>
                        <span
                          className={styles.bar}
                          style={{ width: `${Math.max(6, p.score)}%` }}
                        />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}

      <p className={styles.note}>
        <Info size={13} strokeWidth={2.2} />
        <span>
          {data?.meta?.note ||
            'امتیاز ۰ تا ۱۰۰ نسبی است و درصد مطلق تقاضا نیست.'}
        </span>
      </p>
    </>
  )
}

export default function RasadPage() {
  const [tab, setTab] = useState('trends')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden>
            <Radar size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h1>رصد</h1>
            <p>
              {tab === 'stats'
                ? 'پالس جمعیتی جهان و ایران با منابع رسمی'
                : 'رتبه‌بندی جستجو در استان‌های ایران با کلمه کلیدی'}
            </p>
          </div>
        </div>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="بخش‌های رصد">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} strokeWidth={2.2} />
              {label}
            </button>
          )
        })}
      </nav>

      <div role="tabpanel">
        {tab === 'trends' ? <TrendsTab /> : <WorldStatsPanel />}
      </div>
    </div>
  )
}
