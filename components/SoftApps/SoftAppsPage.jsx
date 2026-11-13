'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AppWindow, Download } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import softappsService from '@/components/SoftApps/services/softappsService'
import styles from './SoftApps.module.css'

function formatPrice(n) {
  if (!n) return '۰'
  return Number(n).toLocaleString('fa-IR')
}

export default function SoftAppsPage() {
  const { language, dir } = useLanguage()
  const isEn = language === 'en'
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [cat, setCat] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const res = await softappsService.list()
      if (cancelled) return
      if (!res.success) {
        setError(res.error || 'خطا')
        setLoading(false)
        return
      }
      setApps(res.data.apps || [])
      setCategories(res.data.categories || [])
      setPlatforms(res.data.platforms || [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = apps
    if (cat !== 'all') {
      list = list.filter(
        (a) =>
          String(a.category?.id) === String(cat) ||
          a.category?.slug === cat
      )
    }
    if (platform !== 'all') {
      list = list.filter((a) => a.platform === platform)
    }
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(needle) ||
          (a.short_desc || '').toLowerCase().includes(needle)
      )
    }
    return list
  }, [apps, cat, platform, q])

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.brand}>سلنیرو</p>
          <h1 className={styles.title}>
            {isEn ? 'Utility Software' : 'نرم‌افزارهای کاربردی'}
          </h1>
          <p className={styles.subtitle}>
            {isEn
              ? 'Free and paid tools ready to download — pick what you need.'
              : 'ابزارهای رایگان و پولی آمادهٔ دانلود — همانی که لازم دارید را بردارید.'}
          </p>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isEn ? 'Search apps…' : 'جستجوی نرم‌افزار…'}
              aria-label={isEn ? 'Search' : 'جستجو'}
            />
          </div>
          <div className={styles.filters} role="tablist">
            <button
              type="button"
              className={`${styles.chip} ${cat === 'all' ? styles.chipOn : ''}`}
              onClick={() => setCat('all')}
            >
              {isEn ? 'All' : 'همه'}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.chip} ${
                  String(cat) === String(c.id) ? styles.chipOn : ''
                }`}
                onClick={() => setCat(c.id)}
                style={
                  String(cat) === String(c.id) && c.color
                    ? { background: c.color, borderColor: c.color }
                    : undefined
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {platforms.length > 0 ? (
          <div
            className={styles.filters}
            style={{ marginBottom: '1.25rem', justifyContent: 'center' }}
          >
            <button
              type="button"
              className={`${styles.chip} ${
                platform === 'all' ? styles.chipOn : ''
              }`}
              onClick={() => setPlatform('all')}
            >
              {isEn ? 'All platforms' : 'همه پلتفرم‌ها'}
            </button>
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.chip} ${
                  platform === p.id ? styles.chipOn : ''
                }`}
                onClick={() => setPlatform(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className={styles.state}>
            {isEn ? 'Loading…' : 'در حال بارگذاری…'}
          </div>
        ) : error ? (
          <div className={styles.state}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.state}>
            {isEn ? 'No apps yet.' : 'هنوز نرم‌افزاری ثبت نشده است.'}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((app) => (
              <Link
                key={app.id}
                href={`/apps/${app.slug}`}
                className={styles.appCard}
              >
                <div className={styles.cardTop}>
                  {app.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.icon_url}
                      alt=""
                      className={styles.icon}
                    />
                  ) : (
                    <div className={styles.iconPlaceholder}>
                      <AppWindow size={26} />
                    </div>
                  )}
                  <div className={styles.cardMeta}>
                    <h2 className={styles.appTitle}>{app.title}</h2>
                    {app.short_desc ? (
                      <p className={styles.appDesc}>{app.short_desc}</p>
                    ) : null}
                    <div className={styles.badges}>
                      {app.is_free ? (
                        <span className={`${styles.badge} ${styles.badgeFree}`}>
                          {isEn ? 'Free' : 'رایگان'}
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgePaid}`}>
                          {isEn ? 'Paid' : 'پولی'}
                        </span>
                      )}
                      {app.platform ? (
                        <span className={styles.badge}>
                          {platforms.find((p) => p.id === app.platform)?.label ||
                            app.platform}
                        </span>
                      ) : null}
                      {app.version ? (
                        <span className={styles.badge}>v{app.version}</span>
                      ) : null}
                      {app.is_featured ? (
                        <span className={styles.badge}>
                          {isEn ? 'Featured' : 'ویژه'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.stats}>
                    <Download
                      size={12}
                      style={{ display: 'inline', marginInlineEnd: 4 }}
                    />
                    {formatPrice(app.download_count || 0)}{' '}
                    {isEn ? 'downloads' : 'دانلود'}
                  </span>
                  <span
                    className={`${styles.price} ${
                      app.is_free ? styles.priceFree : ''
                    }`}
                  >
                    {app.is_free
                      ? isEn
                        ? 'Free'
                        : 'رایگان'
                      : `${formatPrice(app.price)} ${isEn ? 'Toman' : 'تومان'}`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
