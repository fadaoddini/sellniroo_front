'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  normalizeDeepSliderSettings,
  parseDeepSliderColor,
} from '@/config/deepSliderSettings'
import styles from './DeepSlider.module.css'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function clamp01(t) {
  return Math.min(1, Math.max(0, t))
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function easeInCubic(t) {
  return t * t * t
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function mixChannel(a, b, t) {
  return Math.round(lerp(a, b, t))
}

function rgba(r, g, b, a = 1) {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * اسلایدر عمیق — ماسک کلمه روی انیمیشن ربو / محتوای زیر
 * embedded: داخل DeepRevealPin، فقط ماسک روی انیمیشن ربو
 */
export default function DeepSlider({ settings: raw = {}, embedded = false }) {
  const s = useMemo(() => normalizeDeepSliderSettings(raw), [raw])
  const trackRef = useRef(null)
  const stickyRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.48, tx: 0.5, ty: 0.48 })
  const progressRef = useRef(0)
  const demoRafRef = useRef(0)
  const paintRafRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(max-width: 900px)')
    const apply = () => {
      setVisible(mq.matches ? s.show_on_mobile : s.show_on_desktop)
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [s.show_on_desktop, s.show_on_mobile])

  useEffect(() => {
    const own = trackRef.current
    if (!own) return undefined
    const track =
      (embedded && own.closest('[data-deep-reveal-pin]')) || own

    const readProgress = () => {
      const total = track.offsetHeight - window.innerHeight
      if (total <= 48) {
        setDemoMode(!embedded)
        return
      }
      setDemoMode(false)
      const rect = track.getBoundingClientRect()
      const scrolled = clamp01(-rect.top / total)
      progressRef.current = scrolled
      setProgress(scrolled)
    }

    readProgress()
    window.addEventListener('scroll', readProgress, { passive: true })
    window.addEventListener('resize', readProgress)
    return () => {
      window.removeEventListener('scroll', readProgress)
      window.removeEventListener('resize', readProgress)
    }
  }, [s.scroll_vh, embedded])

  useEffect(() => {
    if (!demoMode || !s.auto_demo) return undefined
    let start = performance.now()
    let alive = true
    const tick = (now) => {
      if (!alive) return
      const t = ((now - start) / 7800) % 2
      const p = t < 1 ? easeInOut(t) : easeInOut(2 - t)
      progressRef.current = p
      setProgress(p)
      demoRafRef.current = requestAnimationFrame(tick)
    }
    demoRafRef.current = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(demoRafRef.current)
    }
  }, [demoMode, s.auto_demo])

  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky || !s.mouse_follow) return undefined
    const onMove = (e) => {
      const rect = sticky.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      mouseRef.current.tx = clamp01((e.clientX - rect.left) / rect.width)
      mouseRef.current.ty = clamp01((e.clientY - rect.top) / rect.height)
    }
    sticky.addEventListener('pointermove', onMove, { passive: true })
    return () => sticky.removeEventListener('pointermove', onMove)
  }, [s.mouse_follow])

  useEffect(() => {
    const canvas = canvasRef.current
    const sticky = stickyRef.current
    if (!canvas || !sticky) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let alive = true
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = sticky.clientWidth
      const h = sticky.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d')
    const fontStack =
      '900 {size}px iran_extra, iran_bold, Impact, "Arial Black", sans-serif'

    const measureWord = (word, size, tracking) => {
      if (!offCtx) return size * word.length * 0.6
      offCtx.font = fontStack.replace('{size}', String(Math.max(12, size)))
      const chars = [...word]
      const widths = chars.map((ch) => offCtx.measureText(ch).width)
      const gap = size * tracking
      return (
        widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * gap
      )
    }

    const fitStartSize = (word, targetW, maxH, tracking) => {
      let lo = 24
      let hi = Math.max(80, maxH)
      for (let i = 0; i < 20; i += 1) {
        const mid = (lo + hi) / 2
        if (measureWord(word, mid, tracking) <= targetW) lo = mid
        else hi = mid
      }
      return lo
    }

    const drawWord = (c, word, cx, cy, fontSize, tracking) => {
      c.font = fontStack.replace('{size}', String(Math.max(12, fontSize)))
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillStyle = '#000'
      const chars = [...word]
      const widths = chars.map((ch) => c.measureText(ch).width)
      const gap = fontSize * tracking
      const total =
        widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * gap
      let x = cx - total / 2
      for (let i = 0; i < chars.length; i += 1) {
        const hw = widths[i] / 2
        c.fillText(chars[i], x + hw, cy)
        x += widths[i] + gap
      }
    }

    const paintWordMask = (w, h, cx, cy, fontSize, feather, word, t, tracking) => {
      if (!offCtx) return
      const needW = Math.max(1, Math.floor(w * dpr))
      const needH = Math.max(1, Math.floor(h * dpr))
      if (off.width !== needW || off.height !== needH) {
        off.width = needW
        off.height = needH
      }
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      offCtx.clearRect(0, 0, w, h)

      offCtx.save()
      offCtx.translate(cx, cy)
      offCtx.rotate(Math.sin(t * 0.25) * 0.006)
      offCtx.scale(
        1 + Math.sin(t * 0.55) * 0.006,
        1 + Math.cos(t * 0.48) * 0.01,
      )

      if (feather > 0.5) {
        offCtx.save()
        offCtx.filter = `blur(${feather}px)`
        drawWord(offCtx, word, 0, 0, fontSize, tracking)
        offCtx.restore()
      }

      offCtx.filter = 'none'
      drawWord(offCtx, word, 0, 0, fontSize, tracking)
      offCtx.save()
      offCtx.globalAlpha = 0.9
      offCtx.lineWidth = Math.max(2, fontSize * 0.018)
      offCtx.strokeStyle = '#000'
      offCtx.font = fontStack.replace('{size}', String(Math.max(12, fontSize)))
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'
      const chars = [...word]
      const widths = chars.map((ch) => offCtx.measureText(ch).width)
      const gap = fontSize * tracking
      const total =
        widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * gap
      let x = -total / 2
      for (let i = 0; i < chars.length; i += 1) {
        const hw = widths[i] / 2
        offCtx.strokeText(chars[i], x + hw, 0)
        x += widths[i] + gap
      }
      offCtx.restore()
      offCtx.restore()

      ctx.drawImage(off, 0, 0, w, h)
    }

    const paint = (time) => {
      if (!alive) return
      const w = sticky.clientWidth
      const h = sticky.clientHeight
      if (!w || !h) {
        paintRafRef.current = requestAnimationFrame(paint)
        return
      }

      const m = mouseRef.current
      m.x = lerp(m.x, m.tx, 0.08)
      m.y = lerp(m.y, m.ty, 0.08)

      const p = progressRef.current
      // زودتر پرصفحه می‌شود؛ بعد کرم با آسمان یکی می‌شود و لایه کنار می‌رود
      const dive = easeInCubic(clamp01((p - 0.02) / 0.62))
      const open = easeOutCubic(clamp01((p - 0.42) / 0.4))
      const exit = easeOutCubic(clamp01((p - 0.72) / 0.28))
      const toScene = easeInOut(clamp01((p - 0.1) / 0.38))
      const unify = easeOutCubic(clamp01((p - 0.4) / 0.38))

      const startRgb = parseDeepSliderColor(s.overlay_start, { r: 8, g: 8, b: 8 })
      const skyRgb = parseDeepSliderColor(s.sky_color || s.overlay_end, {
        r: 200,
        g: 210,
        b: 219,
      })
      const creamRgb = parseDeepSliderColor(s.cream_color, {
        r: 230,
        g: 212,
        b: 176,
      })
      // کرم پایین → آسمان بالا (یکپارچگی)
      const groundRgb = {
        r: mixChannel(creamRgb.r, skyRgb.r, unify),
        g: mixChannel(creamRgb.g, skyRgb.g, unify),
        b: mixChannel(creamRgb.b, skyRgb.b, unify),
      }
      const topRgb = {
        r: mixChannel(startRgb.r, skyRgb.r, toScene),
        g: mixChannel(startRgb.g, skyRgb.g, toScene),
        b: mixChannel(startRgb.b, skyRgb.b, toScene),
      }
      const botRgb = {
        r: mixChannel(startRgb.r, groundRgb.r, toScene),
        g: mixChannel(startRgb.g, groundRgb.g, toScene),
        b: mixChannel(startRgb.b, groundRgb.b, toScene),
      }

      const word = String(s.mask_text || s.brand || 'REBO').toUpperCase()
      const tracking = lerp(s.letter_spacing, s.letter_spacing * 0.35, dive)
      const startSize = fitStartSize(
        word,
        w * s.blob_start,
        h * 0.42,
        tracking,
      )
      // پر کردن تمام صفحه و بیرون زدن حروف
      const burstSize = Math.max(w, h) * 3.4
      const fillZoom = burstSize / Math.max(1, startSize)
      const zoomEnd = Math.max(s.blob_end, fillZoom)
      const zoom = lerp(1, zoomEnd, dive)
      const fontSize = startSize * zoom
      const dissolve = open
      const feather = Math.max(
        0,
        s.feather * (1 - dive * 0.5) + dissolve * 28,
      )
      const t = time * 0.001
      const settle = 1 - dive
      const cx =
        w * (s.mouse_follow ? lerp(0.5, m.x, 0.08 * settle) : 0.5) +
        Math.sin(t * 0.4) * (3 * settle)
      const cy =
        h * (s.mouse_follow ? lerp(0.5, m.y, 0.06 * settle) : 0.5) +
        Math.cos(t * 0.35) * (2 * settle)

      ctx.clearRect(0, 0, w, h)
      if (exit >= 0.995) {
        ctx.globalCompositeOperation = 'source-over'
        paintRafRef.current = requestAnimationFrame(paint)
        return
      }

      ctx.globalCompositeOperation = 'source-over'
      const paperGrad = ctx.createLinearGradient(0, 0, 0, h)
      paperGrad.addColorStop(0, rgba(topRgb.r, topRgb.g, topRgb.b, 1))
      paperGrad.addColorStop(0.45, rgba(
        mixChannel(topRgb.r, botRgb.r, 0.35),
        mixChannel(topRgb.g, botRgb.g, 0.35),
        mixChannel(topRgb.b, botRgb.b, 0.35),
        1,
      ))
      paperGrad.addColorStop(1, rgba(botRgb.r, botRgb.g, botRgb.b, 1))
      ctx.fillStyle = paperGrad
      ctx.fillRect(0, 0, w, h)

      ctx.globalCompositeOperation = 'destination-out'
      paintWordMask(w, h, cx, cy, fontSize, feather, word, t, tracking)

      if (dissolve > 0.001) {
        const rr = Math.hypot(w, h) * (0.12 + dissolve * 1.35)
        const g = ctx.createRadialGradient(cx, cy, rr * 0.02, cx, cy, rr)
        g.addColorStop(0, `rgba(0,0,0,${dissolve})`)
        g.addColorStop(0.4, `rgba(0,0,0,${0.85 * dissolve})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, rr, 0, Math.PI * 2)
        ctx.fill()
      }

      if (exit > 0.001) {
        ctx.fillStyle = `rgba(0,0,0,${exit})`
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalCompositeOperation = 'source-over'
      paintRafRef.current = requestAnimationFrame(paint)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(sticky)
    const startPaint = () => {
      paintRafRef.current = requestAnimationFrame(paint)
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(startPaint).catch(startPaint)
    } else {
      startPaint()
    }

    return () => {
      alive = false
      ro.disconnect()
      cancelAnimationFrame(paintRafRef.current)
    }
  }, [
    s.blob_end,
    s.blob_start,
    s.brand,
    s.cream_color,
    s.feather,
    s.letter_spacing,
    s.mask_text,
    s.mouse_follow,
    s.overlay_end,
    s.overlay_start,
    s.sky_color,
  ])

  if (!visible) return null

  const startLum = (() => {
    const c = parseDeepSliderColor(s.overlay_start, { r: 8, g: 8, b: 8 })
    return (c.r * 299 + c.g * 587 + c.b * 114) / 1000
  })()
  const skyLum = (() => {
    const c = parseDeepSliderColor(s.sky_color || s.overlay_end, {
      r: 200,
      g: 210,
      b: 219,
    })
    return (c.r * 299 + c.g * 587 + c.b * 114) / 1000
  })()
  const darkHud = (progress < 0.35 ? startLum : skyLum) < 140
  const hudFade = 1 - clamp01((progress - 0.12) / 0.36)
  const scrollCueFade = 1 - clamp01((progress - 0.02) / 0.28)
  const done = progress >= 0.88
  const hasUnderMedia =
    s.under_source === 'media' && !!String(s.under_media_src || '').trim()
  const showScrollCue = s.show_scroll_hint !== false && scrollCueFade > 0.04
  const scrollStyle = {
    '--ds-scroll-vh': demoMode ? undefined : `${s.scroll_vh}vh`,
    '--ds-hud-opacity': String(hudFade),
    '--ds-scroll-cue': String(scrollCueFade),
  }

  return (
    <section
      ref={trackRef}
      className={`${styles.root} ${embedded ? styles.rootEmbedded : ''} ${
        hasUnderMedia && !embedded ? styles.rootWithMedia : ''
      } ${demoMode ? styles.rootDemo : ''} ${done ? styles.rootDone : ''}`}
      style={scrollStyle}
      data-deep-slider="1"
      data-deep-slider-embedded={embedded ? '1' : '0'}
      data-deep-slider-done={done ? '1' : '0'}
      aria-label={s.title || 'اسلایدر عمیق'}
    >
      <div
        ref={stickyRef}
        className={embedded ? styles.stickyEmbedded : styles.sticky}
      >
        <div className={styles.stage}>
          {hasUnderMedia && !embedded ? (
            <div className={styles.underMedia} aria-hidden>
              {s.under_media_kind === 'video' ? (
                <video
                  className={styles.underMediaEl}
                  src={s.under_media_src}
                  muted
                  playsInline
                  loop
                  autoPlay
                  style={{ objectFit: s.under_media_fit || 'cover' }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.underMediaEl}
                  src={s.under_media_src}
                  alt=""
                  loading="eager"
                  draggable={false}
                  style={{ objectFit: s.under_media_fit || 'cover' }}
                />
              )}
            </div>
          ) : null}
          <canvas ref={canvasRef} className={styles.mask} aria-hidden />
        </div>

        {showScrollCue ? (
          <div className={styles.scrollCue} aria-hidden>
            <div className={styles.scrollMouse}>
              <span className={styles.scrollWheel} />
            </div>
            <div className={styles.scrollCueArrows}>
              <i />
              <i />
              <i />
            </div>
            <p className={styles.scrollCueLabel}>
              {s.scroll_hint || 'به پایین بروید'}
            </p>
          </div>
        ) : null}

        <div className={`${styles.hud} ${darkHud ? styles.hudDark : ''}`}>
          <div className={styles.topRow}>
            {s.show_brand ? <p className={styles.brand}>{s.brand}</p> : <span />}
          </div>

          <div className={styles.center}>
            {s.show_title ? <h2 className={styles.title}>{s.title}</h2> : null}
            {s.show_subtitle ? (
              <p className={styles.subtitle}>{s.subtitle}</p>
            ) : null}
            {s.show_cta && s.cta_label ? (
              <Link href={s.cta_href || '#'} className={styles.cta}>
                {s.cta_label}
              </Link>
            ) : null}
          </div>

          <div className={styles.bottomRow}>
            <span />
            {s.show_progress ? (
              <div className={styles.progress} aria-hidden>
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
