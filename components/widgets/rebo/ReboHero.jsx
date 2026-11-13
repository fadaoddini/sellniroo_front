'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import useReboNormalized from './useReboNormalized'
import { mixHex, normalizeDialItems } from './reboDialDefaults'
import styles from './ReboHeroDial.module.css'

const AUTO_MS = 5200

function clampIndex(i, n) {
  if (n <= 0) return 0
  return ((i % n) + n) % n
}

function angleForIndex(index, count) {
  if (!count) return 0
  return (360 / count) * index
}

function wrapIndex(t, count) {
  if (!count) return 0
  return ((t % count) + count) % count
}

export default function ReboHero({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_hero')
  const items = useMemo(
    () => normalizeDialItems(raw?.dial_items || s.dial_items),
    [raw, s.dial_items],
  )
  const count = items.length
  const step = count ? 360 / count : 0

  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragRot, setDragRot] = useState(0)
  const [textOut, setTextOut] = useState(false)
  const [entered, setEntered] = useState(false)
  const [halfDial, setHalfDial] = useState(false)
  const pauseUntil = useRef(0)
  const dragRef = useRef({ active: false, startAngle: 0, baseRot: 0 })
  const dragRotRef = useRef(0)
  const dialRef = useRef(null)

  // در موبایل: قطب فعال بالای نیم‌دایره (۲۷۰°) — دسکتاپ: پایین (۹۰°)
  const itemPole = halfDial ? 270 : 90
  // درجه SVG: ۰ = بالا، ۱۸۰ = پایین
  const markerSvgDeg = halfDial ? 0 : 180

  const baseRot = -angleForIndex(index, count)
  const ringRot = dragging ? dragRot : baseRot

  // موقعیت پیوسته روی مدار (۰ … count) برای ادغام رنگ و فعال‌سازی بج
  const continuous = wrapIndex(count ? -ringRot / (step || 1) : 0, count)
  const pointedIndex = clampIndex(Math.round(continuous), count)
  const active = items[pointedIndex] || items[0]

  const blend = useMemo(() => {
    if (!count || !items.length) {
      return { color: '#26a680', soft: '#0f3d32' }
    }
    const i0 = Math.floor(continuous) % count
    const i1 = (i0 + 1) % count
    const frac = continuous - Math.floor(continuous)
    const a = items[i0]
    const b = items[i1]
    return {
      color: mixHex(a.color, b.color, frac),
      soft: mixHex(a.color_soft, b.color_soft, frac),
    }
  }, [continuous, count, items])

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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(max-width: 900px)')
    const apply = () => setHalfDial(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
    if (count < 2 || dragging) return undefined
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntil.current) return
      goTo(index + 1)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [count, dragging, goTo, index])

  const pointerAngle = (clientX, clientY) => {
    const el = dialRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rad = Math.atan2(clientY - cy, clientX - cx)
    return (rad * 180) / Math.PI
  }

  const onPointerDown = (e) => {
    if (!count) return
    const angle = pointerAngle(e.clientX, e.clientY)
    dragRef.current = {
      active: true,
      startAngle: angle,
      baseRot,
    }
    setDragging(true)
    dragRotRef.current = baseRot
    setDragRot(baseRot)
    pauseUntil.current = Date.now() + 999999
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return
    const angle = pointerAngle(e.clientX, e.clientY)
    let delta = angle - dragRef.current.startAngle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    const next = dragRef.current.baseRot + delta
    dragRotRef.current = next
    setDragRot(next)
  }

  const onPointerUp = (e) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setDragging(false)
    const rot = dragRotRef.current
    const rawIndex = Math.round(-rot / (step || 1))
    goTo(rawIndex, { user: true })
    pauseUntil.current = Date.now() + AUTO_MS * 1.8
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  if (!visible || !active) return null

  const polar = (deg, r) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)]
  }

  const tickMarks = []
  const subdiv = 8
  const fineCount = Math.max(count, 1) * subdiv

  for (let i = 0; i < fineCount; i += 1) {
    const a = (360 / fineCount) * i
    const isMajor = i % subdiv === 0
    const isMid = !isMajor && i % (subdiv / 2) === 0
    let len = 3.1
    let rOuter = 47.15
    let cls = styles.tickFine
    if (isMajor) {
      len = 7.6
      rOuter = 47.55
      cls = styles.tickMajor
    } else if (isMid) {
      len = 5.1
      rOuter = 47.35
      cls = styles.tickMid
    }
    const [x1, y1] = polar(a, rOuter)
    const [x2, y2] = polar(a, rOuter - len)
    tickMarks.push(
      <line
        key={`t${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={cls}
      />,
    )
    if (isMajor) {
      const [dx, dy] = polar(a, rOuter + 1.15)
      tickMarks.push(
        <circle
          key={`d${i}`}
          cx={dx}
          cy={dy}
          r={0.65}
          className={styles.tickJewel}
        />,
      )
    }
  }

  const sectorSweep = Math.min(28, step * 0.72 || 28)
  const sectorStart = markerSvgDeg - sectorSweep / 2
  const sectorEnd = markerSvgDeg + sectorSweep / 2
  const arcR = 44.5
  const [ax1, ay1] = polar(sectorStart, arcR)
  const [ax2, ay2] = polar(sectorEnd, arcR)
  const largeArc = sectorSweep > 180 ? 1 : 0
  const highlightPath = `M ${ax1} ${ay1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ax2} ${ay2}`

  const radiusPct = 39.5

  const badgeNearness = (i) => {
    let d = Math.abs(continuous - i)
    d = Math.min(d, count - d)
    return d
  }

  return (
    <section
      className={`${styles.hero} ${entered ? styles.heroIn : ''} ${dragging ? styles.heroDragging : ''} ${halfDial ? styles.heroHalf : ''}`}
      style={{
        ...style,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 0,
        '--slide-color': blend.color,
        '--slide-soft': blend.soft,
        background: undefined,
      }}
      dir="rtl"
      lang="fa"
      aria-roledescription="carousel"
      aria-label="اسلایدر مدار ربو"
    >
      <div className={styles.bg} aria-hidden />
      <div className={styles.bgGlow} aria-hidden />
      <div className={styles.noise} aria-hidden />

      <div className={styles.stage}>
        <div className={styles.copy}>
          {s.show_brand !== false ? (
            <p className={styles.brand}>{s.brand || 'ربو'}</p>
          ) : null}
          <p className={styles.kicker}>
            <i />
            {active.label}
          </p>
          {s.show_headline !== false ? (
            <h1
              className={`${styles.title} ${textOut ? styles.titleOut : ''}`}
            >
              {active.title}
            </h1>
          ) : null}
          {s.show_subtitle !== false ? (
            <p className={`${styles.desc} ${textOut ? styles.descOut : ''}`}>
              {active.desc}
            </p>
          ) : null}
          {(s.show_cta !== false || s.show_secondary_cta !== false) && (
            <div className={styles.actions}>
              {s.show_cta !== false ? (
                <Link
                  href={s.cta_href || '/contact'}
                  className={styles.ctaPrimary}
                >
                  {s.cta_label || 'شروع همکاری'}
                </Link>
              ) : null}
              {s.show_secondary_cta !== false ? (
                <a
                  href={s.secondary_href || '#rebo-cost'}
                  className={styles.ctaGhost}
                >
                  {s.secondary_label || 'برآورد هزینه'}
                </a>
              ) : null}
            </div>
          )}
        </div>

        <div
          className={styles.dialPanel}
          ref={dialRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="group"
          aria-label="مدار انتخاب موضوع"
        >
          <div className={styles.dial}>
            <div
              className={`${styles.dialRing} ${dragging ? styles.dialRingDragging : ''}`}
              style={{ transform: `rotate(${ringRot}deg)` }}
            >
              <svg
                className={styles.dialSvg}
                viewBox="0 0 100 100"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id="reboDialBezel"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                  </linearGradient>
                  <radialGradient id="reboDialDisc" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                    <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
                  </radialGradient>
                  <filter
                    id="reboTickGlow"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feGaussianBlur stdDeviation="0.6" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  cx="50"
                  cy="50"
                  r="49.2"
                  className={styles.bezelOuter}
                  stroke="url(#reboDialBezel)"
                />
                <circle cx="50" cy="50" r="47.8" className={styles.bezelMid} />
                <circle
                  cx="50"
                  cy="50"
                  r="45.6"
                  className={styles.discFace}
                  fill="url(#reboDialDisc)"
                />
                <circle cx="50" cy="50" r="43.4" className={styles.arcInner} />

                <g filter="url(#reboTickGlow)">{tickMarks}</g>

                <circle cx="50" cy="50" r="36.5" className={styles.innerRail} />
                <circle
                  cx="50"
                  cy="50"
                  r="35.2"
                  className={styles.innerRailSoft}
                />
              </svg>

              <svg
                className={styles.dialSvgFixed}
                viewBox="0 0 100 100"
                aria-hidden
              >
                <path d={highlightPath} className={styles.sectorGlow} />
                <path d={highlightPath} className={styles.sectorArc} />
              </svg>

              {items.map((item, i) => {
                const a = angleForIndex(i, count) + itemPole
                const rad = (a * Math.PI) / 180
                const x = 50 + radiusPct * Math.cos(rad)
                const y = 50 + radiusPct * Math.sin(rad)
                const near = badgeNearness(i)
                const on = near < 0.42
                const warmth = Math.max(0, 1 - near / 0.55)
                return (
                  <div
                    key={item.id}
                    className={styles.item}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `rotate(${-ringRot}deg)`,
                    }}
                  >
                    <button
                      type="button"
                      className={`${styles.badge} ${on ? styles.badgeOn : ''}`}
                      style={{
                        '--badge-color': item.color,
                        '--badge-warm': warmth,
                        backgroundColor: on
                          ? item.color
                          : `color-mix(in srgb, ${item.color} ${Math.round(warmth * 38)}%, rgba(255,255,255,0.12))`,
                        borderColor: on
                          ? item.color
                          : `color-mix(in srgb, ${item.color} ${Math.round(22 + warmth * 40)}%, rgba(255,255,255,0.22))`,
                        color: on
                          ? '#fff'
                          : `rgba(255,255,255,${0.55 + warmth * 0.4})`,
                        transform: `translate(-50%, -50%) scale(${1 + warmth * 0.12})`,
                      }}
                      onPointerDown={(ev) => ev.stopPropagation()}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        goTo(i, { user: true })
                      }}
                      aria-pressed={on}
                      aria-label={item.label}
                    >
                      {item.label}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* عقربه مثلثی قرمز از بیرون به سمت مدار */}
            <div
              className={`${styles.marker} ${halfDial ? styles.markerTop : ''}`}
              aria-hidden
            >
              <span className={styles.markerArrow} />
              <span className={styles.markerStem} />
            </div>

            <div className={styles.hub}>
              <span className={styles.hubRing} aria-hidden />
              <p className={styles.hubLabel}>{active.label}</p>
              <p className={styles.hubHint}>بچرخانید یا لمس کنید</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dots} role="tablist" aria-label="اسلایدها">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.dot} ${i === pointedIndex ? styles.dotOn : ''}`}
            style={
              i === pointedIndex
                ? { background: item.color }
                : undefined
            }
            aria-label={item.label}
            aria-selected={i === pointedIndex}
            onClick={() => goTo(i, { user: true })}
          />
        ))}
      </div>
    </section>
  )
}
