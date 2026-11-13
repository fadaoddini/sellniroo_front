'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  normalizeSadraPixelSettings,
  resolveSadraTextDirection,
  sadraPixelCssVars,
  SADRA_PIXEL_THEMES,
} from '@/config/sadraPixelWidgetSettings'
import {
  paintLedMatrixFrame,
  rasterizeTextToLedGrid,
  waitForLedFonts,
} from './sadraLedRaster'
import styles from './SadraPixelTitleWidget.module.css'

/**
 * تابلو روان ماتریسی: کل صفحه چراغ خاموش، عبور کلمه → روشن شدن همان چراغ‌ها
 */
export default function SadraPixelTitleWidget({ settings: raw }) {
  const settings = normalizeSadraPixelSettings(raw)
  const text = String(settings.title || '').trim() || 'SADRA'
  const textDir = resolveSadraTextDirection(settings)
  const toRight = settings.scroll_direction === 'to_right'

  const boardRef = useRef(null)
  const canvasRef = useRef(null)
  const patternRef = useRef(null)
  const [ready, setReady] = useState(false)

  // سلول‌های خیلی ریز — ظاهر ماتریس LED فشرده
  const cell = Math.max(2, Math.min(5, Math.round(settings.pixel_size * 0.45)))
  const gap = Math.max(0.55, Math.min(1.4, settings.pixel_gap * 0.55))
  const fontSize = Math.round(14 + settings.pixel_size * 1.8)
  const sample = 2

  // ساخت پترن متن
  useEffect(() => {
    let cancelled = false
    setReady(false)
    ;(async () => {
      await waitForLedFonts(fontSize)
      if (cancelled) return
      const next = rasterizeTextToLedGrid(text, {
        fontSize,
        sample,
        direction: textDir,
        threshold: 40,
      })
      if (cancelled) return
      patternRef.current = next
      setReady(!!next)
    })()
    return () => {
      cancelled = true
    }
  }, [text, fontSize, sample, textDir])

  // انیمیشن ماتریس ثابت + اسکرول منطقی
  useEffect(() => {
    if (!ready || !patternRef.current) return
    const canvas = canvasRef.current
    const board = boardRef.current
    if (!canvas || !board) return

    let raf = 0
    let scrollX = 0
    let last = performance.now()
    let running = true

    const measure = () => {
      const pad = 12
      const avail = Math.max(120, board.clientWidth - pad)
      const step = cell + gap
      const viewCols = Math.max(8, Math.floor((avail + gap) / step))
      // ارتفاع کم: فقط به اندازه ردیف‌های متن (+۱ حاشیه)
      const viewRows = Math.max(5, patternRef.current.rows)
      return { viewCols, viewRows }
    }

    let dims = measure()
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            dims = measure()
          })
        : null
    ro?.observe(board)

    const period =
      patternRef.current.cols + Math.max(10, Math.round(dims.viewCols * 0.45))
    // شروع از بیرون تا کلمه وارد ماتریس شود
    scrollX = toRight ? period - dims.viewCols : 0

    // یک دور کامل نرم؛ کمی سریع‌تر از قبل تا روان‌تر حس شود
    const seconds = Math.max(5, Math.min(28, (settings.scroll_seconds || 10) * 0.85))
    const speed = period / seconds // ستون در ثانیه (کسری)

    const tick = (now) => {
      if (!running) return
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      if (settings.animate) {
        scrollX += (toRight ? -speed : speed) * dt
      }
      const gapCols = Math.max(10, Math.round(dims.viewCols * 0.45))
      // LED قرمز با نوسان روشنایی؛ تم سفارشی رنگ دستی را حفظ می‌کند
      const themeKey =
        settings.theme === 'custom'
          ? 'custom'
          : settings.theme === 'gold'
            ? 'red'
            : settings.theme || 'red'
      const themeColors =
        themeKey === 'custom' ? null : SADRA_PIXEL_THEMES[themeKey] || SADRA_PIXEL_THEMES.red

      paintLedMatrixFrame(canvas, {
        viewCols: dims.viewCols,
        viewRows: dims.viewRows,
        pattern: patternRef.current,
        scrollX,
        gapCols,
        cell,
        gap,
        color: themeColors?.color || settings.color || '#ff1a1a',
        glow: themeColors?.color_glow || settings.color_glow || '#ff6b6b',
        dim: themeColors?.color_dim || settings.color_dim || 'rgba(255, 40, 40, 0.2)',
        time: now / 1000,
        flicker: true,
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [
    ready,
    cell,
    gap,
    toRight,
    settings.animate,
    settings.scroll_seconds,
    settings.color,
    settings.color_glow,
    settings.color_dim,
  ])

  return (
    <div
      className={[
        styles.shell,
        settings.show_on_mobile === false ? styles.hideOnMobile : '',
        settings.show_on_desktop === false ? styles.hideOnDesktop : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={sadraPixelCssVars(settings)}
      data-sadra-pixel="1"
    >
      <div className={styles.inner}>
        <div
          ref={boardRef}
          className={styles.board}
          role="img"
          aria-label={text}
        >
          <div className={styles.boardGlow} aria-hidden />
          <div className={styles.viewport}>
            <canvas ref={canvasRef} className={styles.ledCanvas} />
            {!ready ? (
              <span className={styles.loadingText} dir={textDir}>
                {text}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
