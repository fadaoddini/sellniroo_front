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
import styles from './HeroSlider.module.css'

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
  autoPlayInterval = 5000,
}) {
  const [remoteSlides, setRemoteSlides] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const intervalRef = useRef(null)
  const touchStartX = useRef(null)
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
    if (isPaused || reduceMotion || count < 2) return undefined

    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      nextSlide()
    }

    intervalRef.current = window.setInterval(tick, autoPlayInterval)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [isPaused, reduceMotion, nextSlide, autoPlayInterval, count, progressKey])

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.changedTouches?.[0]?.clientX ?? null
  }, [])

  const onTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current == null || count < 2) return
      const dx = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current
      touchStartX.current = null
      if (Math.abs(dx) < 40) return
      // RTL: swipe right → prev visually? swipe left (negative) → next
      if (dx > 0) goToPrev()
      else nextSlide()
    },
    [count, goToPrev, nextSlide]
  )

  if (!current) return null

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      dir="rtl"
      role="region"
      aria-roledescription="carousel"
      aria-label="اسلایدر اصلی"
    >
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => {
          const isActive = index === safeIndex
          const isNear = Math.abs(index - safeIndex) <= 1 || (safeIndex === 0 && index === count - 1) || (safeIndex === count - 1 && index === 0)
          const showBg = isActive || isNear

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
              <div className={styles.content}>
                {slide.link ? (
                  <a href={slide.link} className={styles.slideLink} tabIndex={isActive ? 0 : -1}>
                    <h2 className={`${styles.title} ${isActive ? styles.titleActive : ''}`}>
                      {slide.title}
                    </h2>
                    {slide.description ? (
                      <p className={`${styles.description} ${isActive ? styles.descActive : ''}`}>
                        {slide.description}
                      </p>
                    ) : null}
                  </a>
                ) : (
                  <>
                    <h2 className={`${styles.title} ${isActive ? styles.titleActive : ''}`}>
                      {slide.title}
                    </h2>
                    {slide.description ? (
                      <p className={`${styles.description} ${isActive ? styles.descActive : ''}`}>
                        {slide.description}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {count > 1 && (
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

          <div className={styles.dots} role="tablist" aria-label="انتخاب اسلاید">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === safeIndex}
                className={`${styles.dot} ${index === safeIndex ? styles.dotActive : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`رفتن به اسلاید ${index + 1}`}
              >
                {index === safeIndex && !isPaused && !reduceMotion && (
                  <span
                    key={progressKey}
                    className={styles.dotProgress}
                    style={{ animationDuration: `${autoPlayInterval}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

export default HeroSlider
