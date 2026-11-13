'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AppWindow, Download } from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import softappsService from '@/components/SoftApps/services/softappsService'
import {
  normalizeSoftAppsWidgetSettings,
  softAppsWidgetSectionStyle,
} from '@/config/softappsWidgetSettings'
import styles from './SoftAppsGridWidget.module.css'

const PLATFORM_FA = {
  windows: 'ویندوز',
  mac: 'مک',
  android: 'اندروید',
  ios: 'iOS',
  linux: 'لینوکس',
  web: 'وب',
  other: 'سایر',
}

function formatPrice(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  })
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return mobile
}

function sortApps(list, sort) {
  const arr = [...list]
  if (sort === 'downloads') {
    arr.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
  } else if (sort === 'newest') {
    arr.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
  } else if (sort === 'price') {
    arr.sort((a, b) => (a.price || 0) - (b.price || 0))
  }
  return arr
}

function SoftAppsCta({ settings }) {
  const s = settings
  const alignClass =
    s.cta_align === 'start'
      ? styles.ctaStart
      : s.cta_align === 'end'
        ? styles.ctaEnd
        : styles.ctaCenter

  return (
    <div
      className={styles.section}
      style={softAppsWidgetSectionStyle(s)}
      data-section-full={s.section_full ? '1' : '0'}
    >
      <div className={`${styles.ctaWrap} ${alignClass}`}>
        <Link
          href={s.cta_href || '/apps'}
          className={`${styles.ctaBtn} ${s.cta_full_width ? styles.ctaFull : ''}`}
        >
          {s.cta_label || 'نرم‌افزارهای کاربردی'}
        </Link>
      </div>
    </div>
  )
}

function AppCard({ app, settings, platforms }) {
  const s = settings
  const skeleton = s.card_skeleton || 'horizontal'
  const iconStyle = {
    width: s.icon_size,
    height: s.icon_size,
  }
  const shapeClass =
    s.icon_shape === 'circle'
      ? styles.iconCircle
      : s.icon_shape === 'square'
        ? styles.iconSquare
        : styles.iconRounded

  const styleClass =
    s.card_style === 'outline'
      ? styles.cardOutline
      : s.card_style === 'elevated'
        ? styles.cardElevated
        : s.card_style === 'minimal'
          ? styles.cardMinimal
          : styles.cardSoft

  const skelClass =
    skeleton === 'vertical'
      ? styles.skelVertical
      : skeleton === 'row'
        ? styles.skelRow
        : skeleton === 'tile'
          ? styles.skelTile
          : styles.skelHorizontal

  const listClass =
    s.display_mode === 'list' || skeleton === 'row' ? styles.cardList : ''

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`${styles.card} ${styleClass} ${skelClass} ${listClass}`}
      data-skel={skeleton}
    >
      <div className={styles.cardTop}>
        {s.show_icon ? (
          app.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.icon_url}
              alt=""
              className={`${styles.icon} ${shapeClass}`}
              style={iconStyle}
            />
          ) : (
            <div
              className={`${styles.iconPh} ${shapeClass}`}
              style={iconStyle}
            >
              <AppWindow size={Math.max(16, Math.round(s.icon_size * 0.45))} />
            </div>
          )
        ) : null}
        <div className={styles.meta}>
          <h3 className={styles.appTitle}>{app.title}</h3>
          {s.show_desc && app.short_desc ? (
            <p className={styles.desc}>{app.short_desc}</p>
          ) : null}
          {(s.show_badges ||
            s.show_platform ||
            s.show_version ||
            s.show_category) && (
            <div className={styles.badges}>
              {s.show_badges ? (
                app.is_free ? (
                  <span className={`${styles.badge} ${styles.badgeFree}`}>
                    رایگان
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgePaid}`}>
                    پولی
                  </span>
                )
              ) : null}
              {s.show_platform && app.platform ? (
                <span className={styles.badge}>
                  {PLATFORM_FA[app.platform] ||
                    platforms.find((p) => p.id === app.platform)?.label ||
                    app.platform}
                </span>
              ) : null}
              {s.show_version && app.version ? (
                <span className={styles.badge}>v{app.version}</span>
              ) : null}
              {s.show_category && app.category?.name ? (
                <span className={styles.badge}>{app.category.name}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {(s.show_downloads || s.show_price) && (
        <div className={styles.foot}>
          {s.show_downloads ? (
            <span className={styles.stats}>
              <Download size={12} />
              {formatPrice(app.download_count || 0)}
            </span>
          ) : (
            <span />
          )}
          {s.show_price ? (
            <span
              className={`${styles.price} ${
                app.is_free ? styles.priceFree : ''
              }`}
            >
              {app.is_free ? 'رایگان' : `${formatPrice(app.price)} ت`}
            </span>
          ) : null}
        </div>
      )}
    </Link>
  )
}

function SoftAppsGridInner({ settings: rawSettings, type = 'softapps_grid' }) {
  const isMobile = useIsMobile(768)
  const viewport = isMobile ? 'mobile' : 'desktop'

  const settings = useMemo(
    () =>
      normalizeSoftAppsWidgetSettings(rawSettings, type, { viewport }),
    [rawSettings, type, viewport]
  )

  const hiddenByDevice =
    (isMobile && !settings.show_on_mobile) ||
    (!isMobile && !settings.show_on_desktop)

  const [apps, setApps] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (type === 'softapps_cta') return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const params = {}
      if (settings.featured_only) params.featured = '1'
      if (settings.pricing === 'free' || settings.pricing === 'paid') {
        params.pricing = settings.pricing
      }
      if (settings.platform) params.platform = settings.platform
      if (settings.category_id) params.category = settings.category_id

      const res = await softappsService.list(params)
      if (cancelled) return

      let list = res.data?.apps || []
      if (settings.featured_only) {
        list = list.filter((a) => a.is_featured)
      }
      list = sortApps(list, settings.sort)
      const offset = settings.offset || 0
      list = list.slice(offset, offset + settings.limit)

      setApps(list)
      setPlatforms(res.data?.platforms || [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [
    type,
    settings.featured_only,
    settings.pricing,
    settings.platform,
    settings.category_id,
    settings.sort,
    settings.offset,
    settings.limit,
  ])

  if (hiddenByDevice) return null

  if (type === 'softapps_cta') {
    return <SoftAppsCta settings={settings} />
  }

  const heroAlign =
    settings.title_align === 'start'
      ? styles.heroStart
      : settings.title_align === 'end'
        ? styles.heroEnd
        : styles.heroCenter

  const colsClass =
    settings.columns === 4
      ? styles.cols4
      : settings.columns === 2
        ? styles.cols2
        : styles.cols3

  const gridStyle =
    settings.display_mode === 'grid'
      ? {
          gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
          '--sa-gap': `${settings.gap}px`,
        }
      : {
          '--sa-gap': `${settings.gap}px`,
          '--sa-recycler-w': `${settings.recycler_card_width}px`,
        }

  const listClass =
    settings.display_mode === 'list'
      ? styles.list
      : settings.display_mode === 'recycler'
        ? styles.recycler
        : `${styles.grid} ${colsClass}`

  const sectionClass = [
    styles.section,
    settings.section_full ? styles.sectionFull : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={sectionClass}
      style={softAppsWidgetSectionStyle(settings)}
      data-section-full={settings.section_full ? '1' : '0'}
      data-viewport={viewport}
    >
      <div
        className={styles.inner}
        style={
          settings.section_full
            ? undefined
            : { maxWidth: settings.max_width }
        }
      >
        {(settings.show_brand ||
          settings.show_title ||
          (settings.show_subtitle && settings.subtitle_text)) && (
          <header className={`${styles.hero} ${heroAlign}`}>
            {settings.show_brand ? (
              <p className={styles.brand}>
                {settings.brand_text || 'سلنیرو'}
              </p>
            ) : null}
            {settings.show_title ? (
              <h2 className={styles.title}>
                {settings.title_text ||
                  (type === 'softapps_featured'
                    ? 'نرم‌افزارهای ویژه'
                    : 'نرم‌افزارهای کاربردی')}
              </h2>
            ) : null}
            {settings.show_subtitle && settings.subtitle_text ? (
              <p className={styles.subtitle}>{settings.subtitle_text}</p>
            ) : null}
          </header>
        )}

        {loading ? (
          <div className={styles.state}>در حال بارگذاری…</div>
        ) : apps.length === 0 ? (
          <div className={styles.state}>نرم‌افزاری برای نمایش نیست.</div>
        ) : (
          <div className={listClass} style={gridStyle}>
            {apps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                settings={settings}
                platforms={platforms}
              />
            ))}
          </div>
        )}

        {settings.show_more_link ? (
          <div className={styles.moreWrap}>
            <Link
              href={settings.more_href || '/apps'}
              className={styles.moreBtn}
            >
              {settings.more_label || 'مشاهده همه'}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default function SoftAppsGridWidget({
  settings = {},
  type = 'softapps_grid',
}) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SOFTAPPS}>
      <SoftAppsGridInner settings={settings} type={type} />
    </ModuleGate>
  )
}
