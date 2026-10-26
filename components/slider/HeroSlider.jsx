// components/slider/HeroSlider.jsx
// ماژول سایت: hero_slider — از /adminweb فعال/غیرفعال می‌شود
'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react'
import axios from 'axios'
import Config from '@/config/config'
import { getFullImageUrl } from '@/utils/imageUrl'
import {
  DEFAULT_SLIDER_WIDGET_SETTINGS,
  getSliderVisibilityFlags,
  normalizeSliderWidgetSettings,
  sliderWidgetCssVars,
} from '@/config/sliderWidgetSettings'
import styles from './HeroSlider.module.css'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return isMobile
}

const FALLBACK_SLIDES = [
  {
    id: 'f1',
    title: 'بهترین فرصت‌های شغلی فروش و بازاریابی',
    description: 'با بیش از ۵۰۰ فرصت شغلی فعال در سراسر کشور',
    image: '/images/bg01.png',
    link: '/jobs',
  },
  {
    id: 'f2',
    title: 'رزومه خود را حرفه‌ای بسازید',
    description: 'با ابزارهای رایگان ما در کمترین زمان استخدام شوید',
    image: '/images/bg01.png',
    link: '/resume',
  },
  {
    id: 'f3',
    title: 'مشاوره شغلی تخصصی رایگان',
    description: 'کارشناسان ما در کنار شما هستند تا بهترین انتخاب را داشته باشید',
    image: '/images/bg01.png',
    link: '/consult',
  },
]

const resolveImage = (src) => {
  if (!src || typeof src !== 'string') return null
  if (
    src.startsWith('/images/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src
  }
  return getFullImageUrl(src)
}

const normalizeSlide = (item) => ({
  id: item.id,
  title: item.title || '',
  description: item.description || '',
  link: item.link || '',
  image: resolveImage(item.image_display || item.image_url || item.image),
})

const HeroSlider = memo(function HeroSlider({
  slides: customSlides,
  autoPlayInterval,
  settings: rawSettings,
}) {
  const raw = rawSettings || DEFAULT_SLIDER_WIDGET_SETTINGS
  const isMobile = useIsMobile(768)
  const viewport = isMobile ? 'mobile' : 'desktop'
  const settings = normalizeSliderWidgetSettings(raw, { viewport })
  const visibility = getSliderVisibilityFlags(raw)
  const intervalMs =
    typeof autoPlayInterval === 'number' && autoPlayInterval > 0
      ? autoPlayInterval
      : settings.autoplay_ms

  const [remoteSlides, setRemoteSlides] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const intervalRef = useRef(null)
  const sliderRef = useRef(null)
  const dragRef = useRef({
    active: false,
    startX: 0,
    dx: 0,
    width: 0,
    pointerId: null,
    moved: false,
    startT: 0,
  })
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const loadedImages = useRef(new Set())

  const slides = useMemo(() => {
    if (Array.isArray(customSlides) && customSlides.length) {
      return customSlides.map(normalizeSlide)
    }
    if (Array.isArray(remoteSlides) && remoteSlides.length) {
      return remoteSlides
    }
    return FALLBACK_SLIDES
  }, [customSlides, remoteSlides])

  const count = slides.length
  const safeIndex = count ? currentIndex % count : 0
  const current = count ? slides[safeIndex] : null

  useEffect(() => {
    if (customSlides?.length) return undefined
    const controller = new AbortController()
    let cancelled = false

    ;(async () => {
      try {
        const res = await axios.get(Config.endpoints.news.heroSlides.active(), {
          signal: controller.signal,
          timeout: 8000,
        })
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
        if (!cancelled) {
          setRemoteSlides(list.map(normalizeSlide).filter((s) => s.title))
        }
      } catch (err) {
        if (!cancelled && err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setRemoteSlides([])
        }
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [customSlides])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(!!mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    setCurrentIndex(0)
    setProgressKey((k) => k + 1)
  }, [count])

  const preload = useCallback((src) => {
    if (!src || typeof window === 'undefined' || loadedImages.current.has(src)) return
    const img = new window.Image()
    img.decoding = 'async'
    img.src = src
    loadedImages.current.add(src)
  }, [])

  useEffect(() => {
    if (!count) return
    preload(slides[safeIndex]?.image)
    preload(slides[(safeIndex + 1) % count]?.image)
  }, [safeIndex, count, slides, preload])

  const goToSlide = useCallback(
    (index) => {
      if (!count) return
      setCurrentIndex(((index % count) + count) % count)
      setProgressKey((prev) => prev + 1)
    },
    [count]
  )

  const nextSlide = useCallback(() => {
    if (!count) return
    setCurrentIndex((prev) => (prev + 1) % count)
    setProgressKey((prev) => prev + 1)
  }, [count])

  const goToPrev = useCallback(() => {
    if (!count) return
    setCurrentIndex((prev) => (prev - 1 + count) % count)
    setProgressKey((prev) => prev + 1)
  }, [count])

  useEffect(() => {
    if (
      !settings.autoplay ||
      isPaused ||
      isDragging ||
      reduceMotion ||
      count < 2
    ) {
      return undefined
    }

    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      nextSlide()
    }

    intervalRef.current = window.setInterval(tick, intervalMs)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [
    settings.autoplay,
    isPaused,
    isDragging,
    reduceMotion,
    nextSlide,
    intervalMs,
    count,
    progressKey,
  ])

  /* کشیدن مثل اپ — لمس و موس */
  useEffect(() => {
    const el = sliderRef.current
    if (!el || !settings.swipe_drag || count < 2) return undefined

    const drag = dragRef.current
    const THRESHOLD_PX = 48
    const VELOCITY = 0.35

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const rect = el.getBoundingClientRect()
      drag.active = true
      drag.moved = false
      drag.startX = e.clientX
      drag.lastX = e.clientX
      drag.dx = 0
      drag.width = rect.width || 1
      drag.pointerId = e.pointerId
      drag.startT = performance.now()
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      setIsDragging(true)
      setIsPaused(true)
      setDragDx(0)
    }

    const onMove = (e) => {
      if (!drag.active || drag.pointerId !== e.pointerId) return
      const dx = e.clientX - drag.startX
      drag.dx = dx
      drag.lastX = e.clientX
      if (Math.abs(dx) > 6) drag.moved = true
      setDragDx(dx)
    }

    const endDrag = (e) => {
      if (!drag.active) return
      if (e && drag.pointerId != null && e.pointerId !== drag.pointerId) return
      const dx = drag.dx
      const dt = Math.max(16, performance.now() - drag.startT)
      const velocity = Math.abs(dx) / dt
      const pass =
        Math.abs(dx) > Math.min(THRESHOLD_PX, drag.width * 0.18) ||
        velocity > VELOCITY

      drag.active = false
      drag.pointerId = null
      setIsDragging(false)
      setDragDx(0)

      if (pass && drag.moved) {
        /* انگشت به چپ → بعدی؛ به راست → قبلی */
        if (dx < 0) nextSlide()
        else goToPrev()
      }

      window.setTimeout(() => {
        drag.moved = false
        setIsPaused(false)
      }, 40)
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
    }
  }, [settings.swipe_drag, count, nextSlide, goToPrev])

  if (!current) return null

  const heightClass =
    settings.height === 'sm'
      ? styles.heightSm
      : settings.height === 'lg'
        ? styles.heightLg
        : styles.heightMd

  const shellStyle = sliderWidgetCssVars(raw, { viewport })
  const fullBleed = settings.full_bleed !== false
  const swipeOn = settings.swipe_drag !== false && count > 1
  const trackStyle = {
    transform: `translate3d(calc(${-safeIndex * 100}% + ${dragDx}px), 0, 0)`,
    transition: isDragging
      ? 'none'
      : reduceMotion
        ? 'none'
        : 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
  }

  const dotsButtons = slides.map((slide, index) => (
    <button
      key={slide.id}
      type="button"
      role="tab"
      aria-selected={index === safeIndex}
      className={`${styles.dot} ${index === safeIndex ? styles.dotActive : ''}`}
      onClick={() => goToSlide(index)}
      aria-label={`رفتن به اسلاید ${index + 1}`}
    >
      {index === safeIndex &&
      settings.autoplay &&
      !isPaused &&
      !isDragging &&
      !reduceMotion ? (
        <span
          key={progressKey}
          className={styles.dotProgress}
          style={{ animationDuration: `${intervalMs}ms` }}
        />
      ) : null}
    </button>
  ))

  return (
    <div
      className={[
        styles.shell,
        fullBleed ? styles.shellFullBleed : styles.shellInset,
        visibility.show_on_mobile === false ? styles.hideOnMobile : '',
        visibility.show_on_desktop === false ? styles.hideOnDesktop : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={shellStyle}
    >
    <div
      ref={sliderRef}
      className={[
        styles.slider,
        heightClass,
        swipeOn ? styles.sliderSwipe : '',
        isDragging ? styles.sliderDragging : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsPaused(false)
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      dir="rtl"
      role="region"
      aria-roledescription="carousel"
      aria-label="اسلایدر اصلی"
    >
      <div
        className={styles.slidesWrapper}
        style={trackStyle}
      >
        {slides.map((slide, index) => {
          const isActive = index === safeIndex
          const isNear =
            Math.abs(index - safeIndex) <= 1 ||
            (safeIndex === 0 && index === count - 1) ||
            (safeIndex === count - 1 && index === 0)
          const showBg = isActive || isNear || isDragging

          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.active : ''}`}
              style={
                showBg && slide.image
                  ? { backgroundImage: `url(${slide.image})` }
                  : undefined
              }
              aria-hidden={!isActive}
            >
              <div className={styles.overlay} />
              {settings.show_caption ? (
                <div className={styles.content}>
                  {slide.link ? (
                    <a
                      href={slide.link}
                      className={styles.slideLink}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <h2
                        className={`${styles.title} ${isActive ? styles.titleActive : ''}`}
                      >
                        {slide.title}
                      </h2>
                      {slide.description ? (
                        <p
                          className={`${styles.description} ${
                            isActive ? styles.descActive : ''
                          }`}
                        >
                          {slide.description}
                        </p>
                      ) : null}
                    </a>
                  ) : (
                    <>
                      <h2
                        className={`${styles.title} ${isActive ? styles.titleActive : ''}`}
                      >
                        {slide.title}
                      </h2>
                      {slide.description ? (
                        <p
                          className={`${styles.description} ${
                            isActive ? styles.descActive : ''
                          }`}
                        >
                          {slide.description}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <>
          {settings.show_arrows ? (
            <>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navPrev}`}
                onClick={goToPrev}
                aria-label="اسلاید قبلی"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className={`${styles.navBtn} ${styles.navNext}`}
                onClick={nextSlide}
                aria-label="اسلاید بعدی"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : null}

          {settings.show_dots && settings.dots_place !== 'below' ? (
            <div className={styles.dots} role="tablist" aria-label="انتخاب اسلاید">
              {dotsButtons}
            </div>
          ) : null}
        </>
      )}
    </div>
      {settings.show_dots && settings.dots_place === 'below' && count > 1 ? (
        <div
          className={styles.dotsBelow}
          role="tablist"
          aria-label="انتخاب اسلاید"
        >
          {dotsButtons}
        </div>
      ) : null}
    </div>
  )
})

export default HeroSlider
