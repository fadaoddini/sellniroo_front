'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SiteTopNavWidget from '@/components/widgets/SiteTopNavWidget'
import {
  DEFAULT_HERO_WITH_MENU_MENU,
  HERO_MENU_GREEN,
  mergeHeroMenuSettings,
  normalizeHeroWithMenuSettings,
  resolveHeroMenuChromeColors,
  scrubHeroMenuColor,
} from '@/config/heroWithMenuSettings'
import { normalizeSiteTopNavSettings } from '@/config/siteTopNavWidgetSettings'
import { buildSideFill } from './gymCurveSplit'
import {
  curveViewBoxSlice,
  reportGymCurveHeight,
  reportGymCurveStyle,
  subscribeGymCurveHeights,
} from './gymCurveSync'
import styles from './GymHero.module.css'

const AUTO_MS = 5200

function clampIndex(i, n) {
  if (n <= 0) return 0
  return ((i % n) + n) % n
}

export default function GymHero({ settings: raw = {} }) {
  const s = useMemo(() => normalizeHeroWithMenuSettings(raw), [raw])
  /* ادغام عمیق تا اسلایس موبایل/دسکتاپ رنگ‌ها را نبلعد */
  const menuRaw = useMemo(() => {
    if (s.show_menu === false) return null
    return mergeHeroMenuSettings(
      DEFAULT_HERO_WITH_MENU_MENU,
      raw?.menu && typeof raw.menu === 'object' ? raw.menu : null,
      s.menu && typeof s.menu === 'object' ? s.menu : null,
    )
  }, [raw, s.show_menu, s.menu])
  const items = s.dial_items
  const count = items.length

  const [index, setIndex] = useState(0)
  const [textOut, setTextOut] = useState(false)
  const [entered, setEntered] = useState(false)
  const [menuSolid, setMenuSolid] = useState(false)
  const [menuHeight, setMenuHeight] = useState(56)
  const [desktopMenu, setDesktopMenu] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const pauseUntil = useRef(0)
  const menuRef = useRef(null)
  const sectionRef = useRef(null)
  const showMenuBar = !!menuRaw
  const [curveViewBox, setCurveViewBox] = useState('-20 0 420 1000')

  const menuViewport = useMemo(() => {
    if (!menuRaw) return null
    return normalizeSiteTopNavSettings(menuRaw, {
      viewport: desktopMenu ? 'desktop' : 'mobile',
    })
  }, [menuRaw, desktopMenu])

  const active = items[index] || items[0]
  const sideImages = useMemo(() => {
    if (!count) return []
    return [0, 1, 2].map((offset) => {
      const i = clampIndex(index + offset, count)
      return { ...items[i], _i: i, primary: offset === 0 }
    })
  }, [items, index, count])

  const goTo = useCallback(
    (next, { user = false } = {}) => {
      if (!count) return
      const target = clampIndex(next, count)
      if (target === index) {
        if (user) pauseUntil.current = Date.now() + AUTO_MS * 1.6
        return
      }
      setIndex(target)
      setTextOut(true)
      window.setTimeout(() => setTextOut(false), 220)
      if (user) pauseUntil.current = Date.now() + AUTO_MS * 1.6
    },
    [count, index],
  )

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [])

  /* موبایل: بک‌گراند body/html را با رنگ اپ یکی کن + پالت منوی سبز */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const root = document.documentElement
    const mq = window.matchMedia('(max-width: 900px)')
    const chrome = resolveHeroMenuChromeColors(menuRaw || {}, {
      viewport: 'mobile',
    })
    const green = chrome.color_bg || s.bg_color_alt || HERO_MENU_GREEN.bg
    const icon = chrome.color_icon || HERO_MENU_GREEN.icon
    const text = chrome.color_text || HERO_MENU_GREEN.text
    const active =
      chrome.color_accent === green
        ? chrome.color_hover || HERO_MENU_GREEN.accent
        : chrome.color_accent || HERO_MENU_GREEN.accent
    const apply = () => {
      if (mq.matches) {
        root.setAttribute('data-gym-app-mobile', '1')
        root.style.setProperty('--gym-menu-bg', green)
        root.style.setProperty('--gym-menu-text', text)
        root.style.setProperty('--gym-menu-icon', icon)
        root.style.setProperty('--gym-menu-active', active)
        root.style.setProperty('--gym-menu-drawer', chrome.color_drawer_bg)
        root.style.setProperty('--gym-menu-btn', chrome.color_btn_bg)
        root.style.setProperty('--gym-menu-date', chrome.color_date)
      } else {
        root.removeAttribute('data-gym-app-mobile')
        ;[
          '--gym-menu-bg',
          '--gym-menu-text',
          '--gym-menu-icon',
          '--gym-menu-active',
          '--gym-menu-drawer',
          '--gym-menu-btn',
          '--gym-menu-date',
        ].forEach((k) => root.style.removeProperty(k))
      }
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => {
      mq.removeEventListener?.('change', apply)
      root.removeAttribute('data-gym-app-mobile')
      ;[
        '--gym-menu-bg',
        '--gym-menu-text',
        '--gym-menu-icon',
        '--gym-menu-active',
        '--gym-menu-drawer',
        '--gym-menu-btn',
        '--gym-menu-date',
      ].forEach((k) => root.style.removeProperty(k))
    }
  }, [menuRaw, s.bg_color_alt])

  const bgMode = s.bg_mode || 'curve'
  const curveIntensity = s.curve_intensity ?? 50
  const bgColor = s.bg_color || '#ffffff'
  const bgColorAlt = s.bg_color_alt || '#023c2c'
  const sideFillPath = useMemo(
    () => buildSideFill(curveIntensity),
    [curveIntensity],
  )

  useEffect(() => {
    reportGymCurveStyle({
      mode: bgMode,
      intensity: curveIntensity,
      color: bgColorAlt,
      colorAlt: bgColor,
    })
  }, [bgMode, curveIntensity, bgColor, bgColorAlt])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const publish = () => reportGymCurveHeight('hero', el.getBoundingClientRect().height)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    const unsub = subscribeGymCurveHeights((sizes) => {
      setCurveViewBox(curveViewBoxSlice('hero', sizes))
    })
    return () => {
      ro.disconnect()
      unsub()
      reportGymCurveHeight('hero', 0)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mqDesktop = window.matchMedia('(min-width: 768px)')
    const applyDesktop = () => setDesktopMenu(mqDesktop.matches)
    applyDesktop()
    setPortalReady(true)
    mqDesktop.addEventListener?.('change', applyDesktop)
    return () => mqDesktop.removeEventListener?.('change', applyDesktop)
  }, [])

  useEffect(() => {
    if (!showMenuBar || typeof window === 'undefined') return undefined
    const onScroll = () => setMenuSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showMenuBar])

  useEffect(() => {
    if (!showMenuBar || !menuRef.current || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const el = menuRef.current
    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height)
      if (h > 0) setMenuHeight(h)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showMenuBar, menuRaw])

  useEffect(() => {
    if (count < 2) return undefined
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntil.current) return
      goTo(index + 1)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [count, goTo, index])

  if (!active) return null

  const gymGreen = String(
    scrubHeroMenuColor(s.bg_color_alt, HERO_MENU_GREEN.bg) || HERO_MENU_GREEN.bg,
  )
  const menuColors = resolveHeroMenuChromeColors(menuRaw || {}, {
    viewport: desktopMenu ? 'desktop' : 'mobile',
  })
  /* دسکتاپ می‌تواند شفاف بماند؛ موبایل همیشه رنگ تم */
  const deskBgRaw = scrubHeroMenuColor(
    menuRaw?.desktop?.color_bg ?? menuRaw?.color_bg,
    'transparent',
  )
  const menuBg =
    deskBgRaw && deskBgRaw !== 'transparent' ? deskBgRaw : 'transparent'
  const menuBgSolid =
    menuBg === 'transparent' ? menuColors.color_bg || gymGreen : menuBg
  const paintMenuBg = !desktopMenu ? menuColors.color_bg || gymGreen : menuBg
  const menuFullBleed = menuViewport?.full_bleed !== false
  const menuRadiusRaw = Math.max(0, Number(menuViewport?.radius) || 0)
  /* اینست بدون رادیوس تنظیم‌شده → کمی گرد پیش‌فرض */
  const menuRadius = menuFullBleed
    ? menuRadiusRaw
    : menuRadiusRaw > 0
      ? menuRadiusRaw
      : 14
  /* ارتفاع جمع‌وجور — پدینگ عمودی جداگانه صفر می‌شود */
  const menuBarH = Math.min(
    48,
    Math.max(36, Number(menuViewport?.height) || 40),
  )
  const menuBarHSolid = Math.max(32, Math.round(menuBarH * 0.82))
  /* فاصله از بالا فقط در حالت شناور؛ اسکرول می‌چسبد به لبه */
  const menuTopGapRaw = Number(menuViewport?.margin_top)
  const menuTopGap = menuSolid
    ? 0
    : Number.isFinite(menuTopGapRaw) && menuTopGapRaw > 0
      ? menuTopGapRaw
      : 16
  const menuLogoH = Math.min(
    menuBarH - 8,
    Math.max(22, Number(menuViewport?.logo_height) || Math.round(menuBarH * 0.62)),
  )
  const menuLogoHSolid = Math.min(
    menuBarHSolid - 6,
    Math.max(18, Math.round(menuLogoH * 0.88)),
  )

  const menuBarNode = showMenuBar ? (
    <div
      ref={menuRef}
      className={[
        styles.heroMenu,
        desktopMenu ? styles.heroMenuFixed : '',
        menuSolid ? styles.heroMenuSolid : '',
        menuFullBleed ? styles.heroMenuFull : styles.heroMenuInset,
      ]
        .filter(Boolean)
        .join(' ')}
      data-hero-with-menu-nav="1"
      data-menu-solid={menuSolid ? '1' : '0'}
      style={{
        '--hero-menu-bg': paintMenuBg,
        '--hero-menu-bg-solid': menuBgSolid,
        '--hero-menu-radius': `${menuRadius}px`,
        '--hero-menu-top': `${menuTopGap}px`,
        '--hero-menu-bar-h': `${menuBarH}px`,
        '--hero-menu-bar-h-solid': `${menuBarHSolid}px`,
        '--hero-menu-logo-h': `${menuLogoH}px`,
        '--hero-menu-logo-h-solid': `${menuLogoHSolid}px`,
        '--stn-h': menuSolid ? `${menuBarHSolid}px` : `${menuBarH}px`,
        '--stn-logo-h': menuSolid ? `${menuLogoHSolid}px` : `${menuLogoH}px`,
        '--stn-pt': '0px',
        '--stn-pb': '0px',
      }}
    >
      <SiteTopNavWidget
        settings={{
          ...menuRaw,
          show_logo: true,
          use_site_logo: menuRaw.use_site_logo !== false,
          /* عرض/فاصله را قاب هیرو کنترل می‌کند — shell نباید 100vw بزند */
          full_bleed: false,
          sticky: false,
          margin_top: 0,
          margin_bottom: 0,
          margin_left: 0,
          margin_right: 0,
          padding_top: 0,
          padding_bottom: 0,
          height: menuSolid ? menuBarHSolid : menuBarH,
          logo_height: menuSolid ? menuLogoHSolid : menuLogoH,
          ...menuColors,
          /* بعد از menuColors تا دسکتاپ شفاف بماند */
          color_bg: paintMenuBg,
          desktop: {
            ...(menuRaw.desktop && typeof menuRaw.desktop === 'object'
              ? menuRaw.desktop
              : {}),
            full_bleed: false,
            sticky: false,
            show_logo: true,
            margin_top: 0,
            margin_bottom: 0,
            margin_left: 0,
            margin_right: 0,
            padding_top: 0,
            padding_bottom: 0,
            height: menuSolid ? menuBarHSolid : menuBarH,
            logo_height: menuSolid ? menuLogoHSolid : menuLogoH,
            ...menuColors,
            color_bg: paintMenuBg,
          },
          mobile: {
            ...(menuRaw.mobile && typeof menuRaw.mobile === 'object'
              ? menuRaw.mobile
              : {}),
            full_bleed: false,
            show_logo: menuRaw.mobile?.show_logo !== false,
            margin_top: 0,
            padding_top: 0,
            padding_bottom: 0,
            ...menuColors,
            color_bg: paintMenuBg,
          },
        }}
      />
    </div>
  ) : null

  const menuBarRendered =
    menuBarNode &&
    desktopMenu &&
    portalReady &&
    typeof document !== 'undefined'
      ? createPortal(menuBarNode, document.body)
      : menuBarNode

  const bgClass =
    bgMode === 'simple'
      ? styles.bgSimple
      : bgMode === 'gradient'
        ? styles.bgGradient
        : styles.bgCurve

  return (
    <section
      ref={sectionRef}
      data-gym-hero-root="1"
      data-menu-solid={menuSolid ? '1' : '0'}
      data-hero-bg={bgMode}
      className={`${styles.hero} ${bgClass} ${entered ? styles.heroIn : ''} ${showMenuBar ? styles.heroWithBreaking : ''}`}
      style={{
        '--hero-menu-h': `${menuHeight}px`,
        '--hero-menu-top': `${menuTopGap}px`,
        '--hero-menu-spacer': menuSolid
          ? `${menuBarHSolid}px`
          : `${menuTopGap + menuBarH}px`,
        '--hero-bg': bgColor,
        '--hero-bg-alt': bgColorAlt,
      }}
      dir="rtl"
      lang="fa"
      aria-roledescription="carousel"
      aria-label="هیرو دارای منو"
    >
      {/* نیمه تیره — فقط در حالت منحنی؛ شدت از تنظیمات */}
      {bgMode === 'curve' ? (
        <div className={styles.curveSide} aria-hidden>
          <svg
            className={styles.curveSideSvg}
            viewBox={curveViewBox}
            preserveAspectRatio="none"
          >
            <path d={sideFillPath} fill={bgColorAlt} fillRule="nonzero" />
          </svg>
        </div>
      ) : null}

      {showMenuBar ? (
        <>
          <div className={styles.heroMenuSpacer} aria-hidden />
          {menuBarRendered}
        </>
      ) : null}

      <div
        className={`${styles.stage} ${showMenuBar ? styles.stageWithBreaking : ''}`}
        dir="ltr"
      >
        {/* موبایل: عنوان بالا وسط */}
        <p className={styles.brandMobile}>{s.brand || 'باشگاه بدنسازی'}</p>

        {/* دسکتاپ: متن کنار تصویر */}
        <div className={styles.copy} dir="rtl">
          <p className={styles.brand}>{s.brand || 'باشگاه بدنسازی'}</p>
          <p className={styles.kicker}>{active.label}</p>
          <h1 className={`${styles.title} ${textOut ? styles.titleOut : ''}`}>
            {active.title}
          </h1>
          <p className={`${styles.desc} ${textOut ? styles.descOut : ''}`}>
            {active.desc}
          </p>

          <div className={styles.dots} role="tablist" aria-label="اسلایدها">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
                aria-label={item.label}
                aria-selected={i === index}
                onClick={() => goTo(i, { user: true })}
              />
            ))}
          </div>
        </div>

        <div className={styles.media}>
          {/* موبایل: اسلایدر تمام‌عرض با متن روی تصویر */}
          <div className={styles.slider}>
            {items.map((item, i) => {
              const on = i === index
              return (
                <div
                  key={`slide-${item.id}`}
                  className={[
                    styles.slide,
                    on ? styles.slideOn : '',
                    textOut && on ? styles.slideTextOut : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={!on}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className={styles.slideImg}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <span className={styles.mediaFallback}>{item.label}</span>
                  )}
                  <div className={styles.slideOverlay} dir="rtl">
                    <p className={styles.slideKicker}>{item.label}</p>
                    <h2 className={styles.slideTitle}>{item.title}</h2>
                    <p className={styles.slideDesc}>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* دسکتاپ: کلاژ چندتصویری */}
          <div className={styles.mediaGrid}>
            {sideImages.map((item, slot) => (
              <button
                key={`${item.id}-${slot}`}
                type="button"
                className={[
                  styles.mediaCell,
                  styles[`mediaSlot${slot}`],
                  item.primary ? styles.mediaPrimary : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goTo(item._i, { user: true })}
                aria-label={item.label}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className={styles.mediaImg}
                    loading={slot === 0 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <span className={styles.mediaFallback}>{item.label}</span>
                )}
                <span className={styles.mediaLabel}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* موبایل: نقطه‌ها زیر اسلایدر */}
        <div
          className={styles.dotsMobile}
          role="tablist"
          aria-label="اسلایدها"
        >
          {items.map((item, i) => (
            <button
              key={`m-${item.id}`}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
              aria-label={item.label}
              aria-selected={i === index}
              onClick={() => goTo(i, { user: true })}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
