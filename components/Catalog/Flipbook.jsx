'use client'

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import catalogService from './services/catalogService'
import BuilderRenderer from './builder/BuilderRenderer'
import styles from './styles/Flipbook.module.css'

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false })

const Page = React.forwardRef(function Page(
  { number, children, showNumber },
  ref
) {
  return (
    <div ref={ref} className={styles.page}>
      <span className={styles.pageTopBar} />
      <div className={styles.pageContent}>{children}</div>
      {showNumber ? <span className={styles.pageNumber}>{number}</span> : null}
    </div>
  )
})

const DEFAULT_SETTINGS = {
  show_on_homepage: true,
  show_header: true,
  show_page_numbers: true,
  header_title_fa: 'کاتالوگ دیجیتال',
  header_title_en: 'Digital Catalog',
  header_subtitle_fa:
    'برای صفحه بعد، سمت چپ صفحه را بکشید یا روی دکمه «بعدی» بزنید',
  header_subtitle_en: 'Use buttons, swipe, or drag page corners to flip',
  accent_color: '#800020',
  accent_secondary: '#c9a227',
  stage_bg: '#0c0a10',
  page_bg: '#f7f2e8',
  page_text: '#1c1410',
}

function getBookSize(viewportWidth) {
  const container = Math.min(1200, viewportWidth)
  const pad = viewportWidth <= 768 ? 24 : 48
  const avail = Math.max(260, container - pad)

  if (viewportWidth <= 640) {
    const width = Math.min(avail, 360)
    return {
      width,
      height: Math.round(width * 1.38),
      minWidth: 260,
      maxWidth: avail,
      minHeight: 340,
      maxHeight: Math.round(avail * 1.55),
    }
  }

  if (viewportWidth <= 900) {
    const width = Math.min(avail, 460)
    return {
      width,
      height: Math.round(width * 1.32),
      minWidth: 300,
      maxWidth: avail,
      minHeight: 400,
      maxHeight: 820,
    }
  }

  return {
    width: 520,
    height: 700,
    minWidth: 315,
    maxWidth: Math.min(1100, avail),
    minHeight: 420,
    maxHeight: 1500,
  }
}

export default function Flipbook() {
  const bookRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [flipReady, setFlipReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [pages, setPages] = useState([])
  const [bookSize, setBookSize] = useState(() =>
    typeof window !== 'undefined' ? getBookSize(window.innerWidth) : getBookSize(1200)
  )
  const { language } = useLanguage()
  const isRtl = language === 'fa'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const res = await catalogService.getBundle()
      if (cancelled) return
      if (!res.success) {
        setError(res.error)
        setLoading(false)
        return
      }
      setSettings({ ...DEFAULT_SETTINGS, ...(res.data.settings || {}) })
      setPages(Array.isArray(res.data.pages) ? res.data.pages : [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let frame = 0
    const updateSize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setBookSize(getBookSize(window.innerWidth))
      })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  useEffect(() => {
    setFlipReady(false)
    setCurrentPage(0)
  }, [isRtl])

  // کتابخانه LTR است؛ برای فارسی صفحات را برعکس می‌چینیم و جهت ورق را عوض می‌کنیم
  const flipPages = useMemo(
    () => (isRtl ? [...pages].reverse() : pages),
    [isRtl, pages]
  )

  const toLogicalPage = useCallback(
    (physicalIndex) => {
      if (!isRtl) return physicalIndex
      return Math.max(0, pages.length - 1 - physicalIndex)
    },
    [isRtl, pages.length]
  )

  const toPhysicalPage = useCallback(
    (logicalIndex) => {
      if (!isRtl) return logicalIndex
      return Math.max(0, pages.length - 1 - logicalIndex)
    },
    [isRtl, pages.length]
  )

  const onInit = useCallback(() => setFlipReady(true), [])
  const onFlip = useCallback(
    (e) => setCurrentPage(toLogicalPage(e.data)),
    [toLogicalPage]
  )

  const getApi = useCallback(() => {
    const ref = bookRef.current
    if (!ref) return null
    if (typeof ref.pageFlip === 'function') {
      try {
        return ref.pageFlip()
      } catch {
        return null
      }
    }
    return null
  }, [])

  const goNext = useCallback(() => {
    const api = getApi()
    if (!api) return
    // فارسی: صفحه بعدی با ورق زدن به سمت راست (flipPrev در موتور LTR)
    if (isRtl) api.flipPrev?.()
    else api.flipNext?.()
  }, [getApi, isRtl])

  const goPrev = useCallback(() => {
    const api = getApi()
    if (!api) return
    if (isRtl) api.flipNext?.()
    else api.flipPrev?.()
  }, [getApi, isRtl])

  const renderContent = (page) => (
    <BuilderRenderer page={page} isRtl={isRtl} />
  )

  const themeStyle = useMemo(
    () => ({
      '--cat-accent': settings.accent_color || DEFAULT_SETTINGS.accent_color,
      '--cat-accent-2':
        settings.accent_secondary || DEFAULT_SETTINGS.accent_secondary,
      '--cat-stage-bg': settings.stage_bg || DEFAULT_SETTINGS.stage_bg,
      '--cat-page-bg': settings.page_bg || DEFAULT_SETTINGS.page_bg,
      '--cat-page-text': settings.page_text || DEFAULT_SETTINGS.page_text,
    }),
    [settings]
  )

  if (settings.show_on_homepage === false) return null

  if (loading) {
    return (
      <section className={styles.stage} style={themeStyle}>
        <div className={styles.stageInner}>
          <div className={styles.centerBox}>
            <div className={styles.spinner} />
            <span className={styles.centerText}>
              {isRtl ? 'در حال بارگذاری...' : 'Loading...'}
            </span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.stage} style={themeStyle}>
        <div className={styles.stageInner}>
          <div className={styles.centerBox}>
            <span className={styles.errorText}>
              {isRtl ? 'خطا در بارگذاری کاتالوگ' : 'Error loading catalog'}
            </span>
          </div>
        </div>
      </section>
    )
  }

  if (pages.length === 0) return null

  const headerTitle = isRtl
    ? settings.header_title_fa
    : settings.header_title_en
  const headerSubtitle = isRtl
    ? settings.header_subtitle_fa
    : settings.header_subtitle_en

  const sizeBand =
    bookSize.maxWidth <= 360 ? 'sm' : bookSize.maxWidth <= 460 ? 'md' : 'lg'
  const bookKey = `${sizeBand}-${isRtl ? 'rtl' : 'ltr'}`
  const startPhysicalPage = toPhysicalPage(currentPage)

  return (
    <section
      className={styles.stage}
      style={themeStyle}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className={styles.stageInner}>
        {settings.show_header !== false && (
          <header className={styles.stageHeader}>
            {headerTitle ? (
              <h2 className={styles.stageTitle}>{headerTitle}</h2>
            ) : null}
            {headerSubtitle ? (
              <p className={styles.stageSubtitle}>{headerSubtitle}</p>
            ) : null}
            <span className={styles.titleRule} />
          </header>
        )}

        {/* موتور فلیپ LTR است؛ جهت هندسی کتاب را LTR نگه می‌داریم */}
        <div className={styles.bookStage} dir="ltr">
          <HTMLFlipBook
            key={bookKey}
            width={bookSize.width}
            height={bookSize.height}
            size="stretch"
            minWidth={bookSize.minWidth}
            maxWidth={bookSize.maxWidth}
            minHeight={bookSize.minHeight}
            maxHeight={bookSize.maxHeight}
            startPage={startPhysicalPage}
            flippingTime={1100}
            usePortrait
            startZIndex={0}
            autoSize
            drawShadow
            maxShadowOpacity={0.4}
            showCover={false}
            mobileScrollSupport
            useMouseEvents
            clickEventForward
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            onFlip={onFlip}
            onInit={onInit}
            className={styles.book}
            ref={bookRef}
          >
            {flipPages.map((page, physicalIndex) => {
              const logicalNumber = toLogicalPage(physicalIndex) + 1
              return (
                <Page
                  key={page.id}
                  number={logicalNumber}
                  showNumber={settings.show_page_numbers !== false}
                >
                  <div dir={isRtl ? 'rtl' : 'ltr'} className={styles.pageDir}>
                    {renderContent(page)}
                  </div>
                </Page>
              )
            })}
          </HTMLFlipBook>
        </div>

        <nav
          className={styles.controls}
          aria-label={isRtl ? 'صفحه‌بندی کاتالوگ' : 'Catalog pagination'}
        >
          <button
            type="button"
            onClick={goPrev}
            disabled={!flipReady || currentPage === 0}
            className={styles.controlBtn}
          >
            {isRtl ? (
              <>
                <span>{'قبلی'}</span>
                <span aria-hidden>→</span>
              </>
            ) : (
              <>
                <span aria-hidden>←</span>
                <span>Previous</span>
              </>
            )}
          </button>

          <span className={styles.pageIndicator}>
            {currentPage + 1} / {pages.length}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={!flipReady || currentPage >= pages.length - 1}
            className={styles.controlBtn}
          >
            {isRtl ? (
              <>
                <span aria-hidden>←</span>
                <span>{'بعدی'}</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </section>
  )
}
