'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Image as ImageIcon,
  Link2,
  Share2,
  User,
} from 'lucide-react'
import newsService from '@/services/newsService'
import Config from '@/config/config'
import {
  DEFAULT_NEWS_WIDGET_SETTINGS,
  normalizeNewsWidgetSettings,
  newsWidgetCssVars,
} from '@/config/newsWidgetSettings'
import { fillNewsWithDemo } from './newsDemoData'
import styles from './LatestNewsWidget.module.css'

function getFullImageUrl(imagePath) {
  if (!imagePath) return null
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath
  }
  const baseUrl = Config.baseUrl || ''
  if (imagePath.startsWith('/media/')) return `${baseUrl}${imagePath}`
  if (imagePath.startsWith('media/')) return `${baseUrl}/${imagePath}`
  return `${baseUrl}/media/${String(imagePath).replace(/^\/+/, '')}`
}

function getBestImage(item) {
  if (!item) return null
  const candidates = [
    item.featured_image_display,
    item.featured_image,
    item.featured_image_url,
    item.images?.[0]?.image_display,
    item.images?.[0]?.image,
    item.images?.[0]?.image_url,
  ]
  for (const c of candidates) {
    const url = getFullImageUrl(c)
    if (url) return url
  }
  return null
}

function leadText(item) {
  return String(item?.lid || item?.excerpt || item?.subtitle || '').trim()
}

function authorName(item) {
  return String(
    item?.writer_name ||
      item?.source_author ||
      item?.author_name ||
      item?.author ||
      item?.source_name ||
      ''
  ).trim()
}

function truncateTitle(title, maxChars, wrap) {
  const t = String(title || '').trim()
  if (wrap || t.length <= maxChars) return t
  return `${t.slice(0, Math.max(1, maxChars - 1))}…`
}

function newsHref(item) {
  return `/news/${item.slug || item.id}`
}

function absoluteNewsUrl(item) {
  const href = newsHref(item)
  if (typeof window === 'undefined') return href
  return `${window.location.origin}${href}`
}

/** اشتراک در پیام‌رسان‌های ایرانی */
function iranShareTargets(pageUrl, title) {
  const url = encodeURIComponent(pageUrl || '')
  const text = encodeURIComponent(title || 'خبر')
  return [
    {
      id: 'rubika',
      label: 'روبیکا',
      href: `https://rubika.ir/share?url=${url}&text=${text}`,
      className: styles.shareRubika,
    },
    {
      id: 'eitaa',
      label: 'ایتا',
      href: `https://eitaa.com/share/url?url=${url}&text=${text}`,
      className: styles.shareEitaa,
    },
    {
      id: 'bale',
      label: 'بله',
      href: `https://ble.ir/share/url?url=${url}`,
      className: styles.shareBale,
    },
    {
      id: 'soroush',
      label: 'سروش',
      href: `https://splus.ir/share/url?url=${url}&text=${text}`,
      className: styles.shareSoroush,
    },
  ]
}

function itemShareKey(item, index) {
  return String(item?.id || item?.slug || index)
}

async function fetchNewsItems({ source, offset, count, categorySlug }) {
  const fetchLimit = Math.min(
    source === 'featured' ? 20 : 50,
    offset + count
  )
  let sliced = []

  if (source === 'featured') {
    const res = await newsService.getFeaturedNews(
      Math.min(20, Math.max(fetchLimit, offset + count + 10))
    )
    let list = Array.isArray(res?.data) ? res.data : []
    if (categorySlug) {
      list = list.filter(
        (n) =>
          n?.category?.slug === categorySlug ||
          n?.category_slug === categorySlug
      )
    }
    sliced = list.slice(offset, offset + count)
  } else if (source === 'category') {
    if (!categorySlug) {
      return fillNewsWithDemo(null, count)
    }
    const res = await newsService.getNews(1, fetchLimit, '', categorySlug)
    const list = Array.isArray(res?.data) ? res.data : []
    sliced = list.slice(offset, offset + count)
  } else {
    const res = await newsService.getLatestNews(fetchLimit)
    const list = Array.isArray(res?.data) ? res.data : []
    sliced = list.slice(offset, offset + count)
  }

  /* اگر داده واقعی کم بود، با خبر فیک تا تعداد درخواستی پر می‌شود */
  return fillNewsWithDemo(sliced, count)
}

/**
 * ویجت لیست اخبار — آخرین / دسته / ویژه / افقی (ریسایکلر)
 * @param {'latest'|'featured'|'category'} source
 * @param {'list'|'recycler'} layout
 */
export default function LatestNewsWidget({
  settings: rawSettings,
  source = 'latest',
  layout = 'list',
} = {}) {
  const settings = (() => {
    const raw = rawSettings || DEFAULT_NEWS_WIDGET_SETTINGS
    const s = normalizeNewsWidgetSettings(raw)
    if (layout === 'recycler' && raw.stats_layout === undefined) {
      s.stats_layout = 'row'
    }
    return s
  })()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareOpenKey, setShareOpenKey] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [rvPaused, setRvPaused] = useState(false)
  const listRef = useRef(null)
  const rvIndexRef = useRef(0)
  const rvDragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const offset = Math.max(0, settings.offset || 0)
      const count = Math.max(1, settings.count || 5)
      const list = await fetchNewsItems({
        source,
        offset,
        count,
        categorySlug: settings.category_slug,
      })
      if (cancelled) return
      setItems(list)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [settings.count, settings.offset, settings.category_slug, source])

  useEffect(() => {
    if (shareOpenKey == null) return undefined
    const onDoc = (e) => {
      const wrap = e.target?.closest?.(`.${styles.shareWrap}`)
      if (wrap) return
      setShareOpenKey(null)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setShareOpenKey(null)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [shareOpenKey])

  const toggleShare = useCallback((e, key) => {
    e.preventDefault()
    e.stopPropagation()
    setShareOpenKey((prev) => (prev === key ? null : key))
  }, [])

  const copyLink = useCallback(async (e, item, key) => {
    e.preventDefault()
    e.stopPropagation()
    const url = absoluteNewsUrl(item)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600)
    } catch {
      /* ignore */
    }
  }, [])

  const getRecyclerRtl = useCallback((el) => {
    if (!el) return true
    const dir =
      getComputedStyle(el).direction ||
      document.documentElement.getAttribute('dir') ||
      'rtl'
    return dir === 'rtl'
  }, [])

  /** ایندکس کارتی که الان ابتدای نوار را پر کرده */
  const getRecyclerActiveIndex = useCallback(() => {
    const el = listRef.current
    if (!el) return 0
    const cards = Array.from(el.querySelectorAll('[data-rv-index]'))
    if (!cards.length) return 0
    const cRect = el.getBoundingClientRect()
    const rtl = getRecyclerRtl(el)
    const pad = parseFloat(
      rtl
        ? getComputedStyle(el).paddingRight
        : getComputedStyle(el).paddingLeft
    ) || 0
    const edge = rtl ? cRect.right - pad : cRect.left + pad
    let bestIdx = 0
    let bestDist = Infinity
    for (const card of cards) {
      const r = card.getBoundingClientRect()
      const dist = Math.abs((rtl ? r.right : r.left) - edge)
      const idx = Number(card.getAttribute('data-rv-index'))
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = Number.isFinite(idx) ? idx : bestIdx
      }
    }
    return bestIdx
  }, [getRecyclerRtl])

  /**
   * فقط خودِ کانتینر اسکرول شود — نه کل صفحه (مشکل موبایل با scrollIntoView)
   * @param {number} index
   * @param {{ wrap?: boolean }} [opts]
   */
  const scrollRecyclerTo = useCallback(
    (index, opts = {}) => {
      const el = listRef.current
      if (!el || !items.length) return
      const n = items.length
      const wrap = opts.wrap !== false
      const i = wrap
        ? ((index % n) + n) % n
        : Math.max(0, Math.min(n - 1, index))
      const card = el.querySelector(`[data-rv-index="${i}"]`)
      if (!card) return
      const cRect = el.getBoundingClientRect()
      const tRect = card.getBoundingClientRect()
      const rtl = getRecyclerRtl(el)
      const pad = parseFloat(
        rtl
          ? getComputedStyle(el).paddingRight
          : getComputedStyle(el).paddingLeft
      ) || 0
      const delta = rtl
        ? tRect.right - (cRect.right - pad)
        : tRect.left - (cRect.left + pad)
      if (Math.abs(delta) < 1) {
        rvIndexRef.current = i
        return
      }
      el.scrollBy({ left: delta, behavior: 'smooth' })
      rvIndexRef.current = i
    },
    [items.length, getRecyclerRtl]
  )

  const scrollRecyclerBy = useCallback(
    (dir, opts = {}) => {
      const current = getRecyclerActiveIndex()
      rvIndexRef.current = current
      /* دکمه‌ها: بدون پرش از آخر به اول؛ اتوپلی می‌تواند wrap کند */
      scrollRecyclerTo(current + dir, { wrap: !!opts.wrap })
    },
    [getRecyclerActiveIndex, scrollRecyclerTo]
  )

  useEffect(() => {
    rvIndexRef.current = 0
  }, [items.length, layout])

  useEffect(() => {
    if (layout !== 'recycler' || !settings.recycler_autoplay || items.length < 2) {
      return undefined
    }
    if (rvPaused && settings.recycler_pause_on_hover) return undefined
    const ms = settings.recycler_autoplay_ms || 4000
    const id = window.setInterval(() => {
      scrollRecyclerBy(1, { wrap: true })
    }, ms)
    return () => window.clearInterval(id)
  }, [
    layout,
    settings.recycler_autoplay,
    settings.recycler_autoplay_ms,
    settings.recycler_pause_on_hover,
    rvPaused,
    items.length,
    scrollRecyclerBy,
  ])

  /* اسکرول با کشیدن موس — کلیک ساده باید برود به صفحه خبر */
  useEffect(() => {
    const el = listRef.current
    if (!el || layout !== 'recycler' || !settings.recycler_drag_scroll) {
      return undefined
    }

    const drag = rvDragRef.current
    const THRESHOLD = 8

    const onDown = (e) => {
      if (e.pointerType === 'touch') return
      if (e.button != null && e.button !== 0) return
      if (e.target?.closest?.('button, [role="menu"], .shareWrap')) return
      drag.active = true
      drag.moved = false
      drag.startX = e.clientX
      drag.scrollLeft = el.scrollLeft
      drag.pointerId = e.pointerId
    }

    const onMove = (e) => {
      if (!drag.active) return
      const dx = e.clientX - drag.startX
      if (!drag.moved && Math.abs(dx) > THRESHOLD) {
        drag.moved = true
        el.classList.add(styles.rvDragging)
        setRvPaused(true)
        try {
          el.setPointerCapture(drag.pointerId)
        } catch {
          /* ignore */
        }
      }
      if (!drag.moved) return
      const rtl = getComputedStyle(el).direction === 'rtl'
      el.scrollLeft = drag.scrollLeft + (rtl ? dx : -dx)
      e.preventDefault()
    }

    const endDrag = () => {
      const wasDragging = drag.moved
      drag.active = false
      el.classList.remove(styles.rvDragging)
      try {
        if (drag.pointerId != null) el.releasePointerCapture(drag.pointerId)
      } catch {
        /* ignore */
      }
      drag.pointerId = null
      setRvPaused(false)
      if (wasDragging) {
        /* یک تیک بعد ریست تا click همان ژست بلاک شود */
        window.setTimeout(() => {
          drag.moved = false
        }, 0)
      }
    }

    const onClickCapture = (e) => {
      if (drag.moved) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    el.addEventListener('click', onClickCapture, true)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('click', onClickCapture, true)
      el.classList.remove(styles.rvDragging)
    }
  }, [layout, settings.recycler_drag_scroll, items.length])

  const cssVars = newsWidgetCssVars(settings)

  const skinClass =
    layout === 'recycler'
      ? styles.skinRecycler
      : source === 'featured'
        ? styles.skinFeatured
        : source === 'category'
          ? styles.skinCategory
          : styles.skinLatest

  if (loading) {
    return (
      <div
        className={[
          styles.wrap,
          skinClass,
          settings.show_on_mobile === false ? styles.hideOnMobile : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={cssVars}
      >
        <div className={styles.loading}>در حال بارگذاری اخبار…</div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div
        className={[
          styles.wrap,
          skinClass,
          settings.show_on_mobile === false ? styles.hideOnMobile : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={cssVars}
      >
        <div className={styles.empty}>
          {source === 'category' && !settings.category_slug
            ? 'یک دسته‌بندی در تنظیمات ویجت انتخاب کنید'
            : source === 'featured'
              ? 'خبر ویژه‌ای برای نمایش نیست'
              : 'خبری برای نمایش نیست'}
        </div>
      </div>
    )
  }

  const listNodes = items.map((item, index) => {
          const href = newsHref(item)
          const img = getBestImage(item)
          const title = truncateTitle(
            item.title,
            settings.title_max_chars,
            settings.title_wrap
          )
          const lead = leadText(item)
          const author = authorName(item)
          const likes = item.like_count ?? item.likes ?? 0
          const views = item.view_count ?? item.views ?? 0
          const showAuthor = settings.show_author && author
          const showSideStats =
            settings.show_likes || settings.show_views || settings.show_share
          const shareKey = itemShareKey(item, index)
          const shareOpen = shareOpenKey === shareKey
          const pageUrl = absoluteNewsUrl(item)
          const socials = iranShareTargets(pageUrl, item.title || title)

          return (
            <li
              key={item.id || item.slug || index}
              data-rv-index={layout === 'recycler' ? index : undefined}
              className={[
                styles.item,
                layout === 'recycler' ? styles.rvItem : '',
                shareOpen ? styles.itemShareOpen : '',
                settings.show_read_more &&
                settings.read_more_place !== 'flow'
                  ? styles.itemHasAbsRm
                  : '',
                settings.show_read_more &&
                settings.read_more_place?.startsWith('bottom_')
                  ? styles.itemAbsRmBottom
                  : '',
                settings.show_read_more &&
                settings.read_more_place?.startsWith('top_')
                  ? styles.itemAbsRmTop
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div
                className={[
                  styles.row,
                  layout === 'recycler' ? styles.rvCard : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {source === 'featured' && layout !== 'recycler' ? (
                  <span className={styles.featuredBadge} aria-hidden>
                    ویژه
                  </span>
                ) : null}

                <Link
                  href={href}
                  className={[
                    styles.link,
                    layout === 'recycler' ? styles.rvLink : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {layout === 'recycler' ? (
                    <>
                      <span
                        className={`${styles.thumb} ${styles.rvCover}`}
                        aria-hidden
                      >
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className={styles.thumbImg}
                            loading={index < 3 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <span className={styles.thumbEmpty}>
                            <ImageIcon size={32} />
                          </span>
                        )}
                      </span>
                      <span className={styles.rvOverlay} aria-hidden />
                    </>
                  ) : settings.show_image ? (
                    <span
                      className={`${styles.thumb} ${
                        settings.image_shadow ? styles.thumbShadow : ''
                      }`}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className={styles.thumbImg}
                          loading={index < 3 ? 'eager' : 'lazy'}
                        />
                      ) : (
                        <span className={styles.thumbEmpty}>
                          <ImageIcon
                            size={Math.max(14, settings.image_size / 3)}
                          />
                        </span>
                      )}
                    </span>
                  ) : settings.text_marker &&
                    settings.text_marker !== 'none' ? (
                    <span
                      className={`${styles.marker} ${
                        styles[`marker_${settings.text_marker}`] || ''
                      }`}
                      aria-hidden
                    />
                  ) : null}

                  <span
                    className={[
                      styles.body,
                      layout === 'recycler' ? styles.rvBody : '',
                      layout === 'recycler'
                        ? styles[`rvY_${settings.recycler_text_y}`] || ''
                        : '',
                      layout === 'recycler'
                        ? styles[`rvX_${settings.recycler_text_x}`] || ''
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <h3
                      className={`${styles.title} ${
                        layout === 'recycler'
                          ? styles.rvTitle
                          : settings.title_wrap
                            ? styles.titleWrap
                            : styles.titleClamp
                      }`}
                    >
                      {title}
                    </h3>

                    {settings.show_lead && lead ? (
                      <p className={styles.leadInline}>{lead}</p>
                    ) : null}

                    {showAuthor ? (
                      <span className={styles.meta}>
                        <span>
                          <User size={12} />
                          {author}
                        </span>
                      </span>
                    ) : null}

                    {settings.show_read_more &&
                    settings.read_more_place === 'flow' ? (
                      <span
                        className={`${styles.readMoreWrap} ${
                          settings.read_more_on_hover
                            ? styles.readMoreOnHover
                            : ''
                        }`}
                      >
                        <span
                          className={`${styles.readMore} ${
                            settings.read_more_as_button
                              ? styles.readMoreBtn
                              : ''
                          }`}
                        >
                          {settings.read_more_text || 'ادامه مطلب…'}
                        </span>
                      </span>
                    ) : null}
                  </span>
                </Link>

                {showSideStats ? (
                  <div
                    className={[
                      styles.sideStack,
                      settings.stats_layout === 'row'
                        ? styles.sideStackRow
                        : styles.sideStackCol,
                      layout === 'recycler' ? styles.rvStats : '',
                      layout === 'recycler' &&
                      settings.stats_bg &&
                      settings.stats_bg !== 'transparent'
                        ? styles.rvStatsHasBg
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {settings.show_likes ? (
                      <span className={`${styles.stat} ${styles.statLike}`}>
                        <Heart
                          size={settings.stats_icon_size}
                          strokeWidth={2.2}
                          aria-hidden
                        />
                        <span className={styles.statNum}>{likes}</span>
                      </span>
                    ) : null}
                    {settings.show_views ? (
                      <span className={`${styles.stat} ${styles.statViews}`}>
                        <Eye
                          size={settings.stats_icon_size}
                          strokeWidth={2.2}
                          aria-hidden
                        />
                        <span className={styles.statNum}>{views}</span>
                      </span>
                    ) : null}
                    {settings.show_share ? (
                      <div className={styles.shareWrap}>
                        <button
                          type="button"
                          className={`${styles.shareBtn} ${
                            shareOpen ? styles.shareBtnOn : ''
                          }`}
                          aria-label="اشتراک‌گذاری"
                          title="اشتراک‌گذاری"
                          aria-expanded={shareOpen}
                          aria-haspopup="menu"
                          onClick={(e) => toggleShare(e, shareKey)}
                        >
                          <Share2 size={settings.stats_icon_size} />
                        </button>
                        {shareOpen ? (
                          <div
                            className={styles.shareMenu}
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <p className={styles.shareMenuLabel}>
                              اشتراک در شبکه‌ها
                            </p>
                            <div className={styles.shareGrid}>
                              {socials.map((s) => (
                                <a
                                  key={s.id}
                                  href={s.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${styles.shareItem} ${s.className}`}
                                  role="menuitem"
                                  onClick={() => setShareOpenKey(null)}
                                >
                                  {s.label}
                                </a>
                              ))}
                            </div>
                            <button
                              type="button"
                              className={styles.shareCopy}
                              onClick={(e) => copyLink(e, item, shareKey)}
                            >
                              {copiedKey === shareKey ? (
                                <Check size={14} />
                              ) : (
                                <Link2 size={14} />
                              )}
                              {copiedKey === shareKey
                                ? 'لینک کپی شد'
                                : 'کپی لینک'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* مطلق: داخل همان کادر ردیف کارت (نه بیرون از آیتم) */}
                {settings.show_read_more &&
                settings.read_more_place !== 'flow' ? (
                  <Link
                    href={href}
                    className={[
                      styles.readMoreAbs,
                      styles[`place_${settings.read_more_place}`] || '',
                      settings.read_more_on_hover ? styles.readMoreOnHover : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    tabIndex={-1}
                    aria-hidden={
                      settings.read_more_on_hover ? true : undefined
                    }
                  >
                    <span
                      className={`${styles.readMore} ${
                        settings.read_more_as_button ? styles.readMoreBtn : ''
                      }`}
                    >
                      {settings.read_more_text || 'ادامه مطلب…'}
                    </span>
                  </Link>
                ) : null}
              </div>

              {settings.hover_show_lead && lead ? (
                <div className={styles.leadCard} aria-hidden>
                  {settings.hover_lead_image && img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className={styles.leadImg} />
                  ) : null}
                  <p className={styles.leadText}>{lead}</p>
                </div>
              ) : null}
            </li>
          )
        })

  return (
    <div
      className={[
        styles.wrap,
        skinClass,
        layout === 'recycler' ? styles.wrapRecycler : '',
        settings.show_on_mobile === false ? styles.hideOnMobile : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cssVars}
      data-news-source={source}
      data-news-layout={layout}
    >
      {layout === 'recycler' ? (
        <div
          className={[
            styles.rvSection,
            settings.recycler_section_full ? styles.rvSectionBleed : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.rvContainer}>
            <div
              className={styles.rvShell}
              onMouseEnter={() => {
                if (settings.recycler_pause_on_hover) setRvPaused(true)
              }}
              onMouseLeave={() => setRvPaused(false)}
            >
              {settings.recycler_show_arrows && items.length > 1 ? (
                <>
                  <button
                    type="button"
                    className={`${styles.rvNav} ${styles.rvNavPrev}`}
                    aria-label="قبلی"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollRecyclerBy(-1, { wrap: false })
                    }}
                  >
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.rvNav} ${styles.rvNavNext}`}
                    aria-label="بعدی"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollRecyclerBy(1, { wrap: false })
                    }}
                  >
                    <ChevronLeft size={18} strokeWidth={2.4} />
                  </button>
                </>
              ) : null}
              <ul
                ref={listRef}
                className={[
                  styles.list,
                  styles.listRecycler,
                  settings.recycler_drag_scroll ? styles.rvDragEnabled : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {listNodes}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <ul className={styles.list}>{listNodes}</ul>
      )}
    </div>
  )
}
