'use client'

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  BellRing,
  CalendarClock,
  ClipboardList,
  ShoppingBag,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'
import {
  DEFAULT_GYM_FEATURES,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import curvedTimelineService from './curvedTimelineService'
import { GYM_EMERALD_DEEP, buildSideFill } from './gymCurveSplit'
import {
  curveViewBoxSlice,
  reportGymCurveHeight,
  subscribeGymCurveHeights,
  subscribeGymCurveStyle,
} from './gymCurveSync'
import styles from './GymFeatures.module.css'

const BEE_PATH =
  'M 24 0 ' +
  'C 38 80, 10 160, 34 240 ' +
  'S 12 400, 36 480 ' +
  'S 10 640, 34 720 ' +
  'S 14 860, 32 940 ' +
  'S 26 980, 24 1000'

const ICON_MAP = {
  users: UsersRound,
  calendar: CalendarClock,
  coach: UserRoundCog,
  bell: BellRing,
  shop: ShoppingBag,
  clipboard: ClipboardList,
}

const FALLBACK_STEPS = [
  {
    id: 'members',
    icon: 'users',
    step: '۰۱',
    need: 'شروع راحت',
    title: 'عضویت ساده',
    text: 'ثبت‌نام سریع، سطح عضویت مشخص، تمدید بدون دردسر.',
    result: 'از امروز شروع کن',
    side: 'light',
  },
  {
    id: 'sessions',
    icon: 'calendar',
    step: '۰۲',
    need: 'زمانت مال خودته',
    title: 'سانس دلخواه',
    text: 'سانس آقایان و بانوان با ظرفیت مشخص — جات رزرو می‌مونه.',
    result: 'بدون شلوغی اضافه',
    side: 'dark',
  },
  {
    id: 'coach',
    icon: 'coach',
    step: '۰۳',
    need: 'تنها تمرین نکن',
    title: 'مربی کنارته',
    text: 'برنامه تمرین و رژیم از مربی باشگاه، مخصوص خودت.',
    result: 'مسیر مشخص',
    side: 'light',
  },
  {
    id: 'alerts',
    icon: 'bell',
    step: '۰۴',
    need: 'یادت نره',
    title: 'یادآوری تمدید',
    text: 'قبل از تموم شدن عضویت بهت خبر می‌دیم تا تمرینت قطع نشه.',
    result: 'تمرین پیوسته',
    side: 'dark',
  },
  {
    id: 'shop',
    icon: 'shop',
    step: '۰۵',
    need: 'همه‌چیز دم‌دست',
    title: 'فروشگاه باشگاه',
    text: 'مکمل و پوشاک با قیمت اعضا — همون‌جا که تمرین می‌کنی.',
    result: 'خرید راحت',
    side: 'light',
  },
  {
    id: 'profile',
    icon: 'clipboard',
    step: '۰۶',
    need: 'همیشه باهات',
    title: 'پروفایل خودت',
    text: 'وضعیت عضویت، برنامه و سانس‌هات همیشه جلو چشمت.',
    result: 'همه‌چیز یک‌جا',
    side: 'dark',
  },
]

function mapApiStep(row) {
  return {
    id: row.key || `step-${row.id}`,
    icon: row.icon || 'users',
    step: row.step_label || '',
    need: row.need || '',
    title: row.title || '',
    text: row.text || '',
    result: row.result || '',
    side: row.side === 'dark' ? 'dark' : 'light',
  }
}

export default function GymFeatures({ settings: raw = {} }) {
  const layoutSettings = normalizeGymSettings(raw, DEFAULT_GYM_FEATURES)
  const sectionRef = useRef(null)
  const timelineRef = useRef(null)
  const pathSvgRef = useRef(null)
  const pathGeomRef = useRef(null)
  const [active, setActive] = useState(0)
  const [remote, setRemote] = useState(null)
  const [iconPos, setIconPos] = useState([])
  const [curveViewBox, setCurveViewBox] = useState('-20 0 420 1000')
  const [curveStyle, setCurveStyle] = useState({
    mode: 'curve',
    intensity: 50,
    color: GYM_EMERALD_DEEP,
    colorAlt: '#ffffff',
  })
  const sideFillPath = useMemo(
    () => buildSideFill(curveStyle.intensity),
    [curveStyle.intensity],
  )

  useEffect(() => {
    let cancelled = false
    curvedTimelineService.getBundle().then((res) => {
      if (cancelled || !res.success) return
      setRemote(res.data || null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => subscribeGymCurveStyle(setCurveStyle), [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const root = document.documentElement
    const mq = window.matchMedia('(max-width: 900px)')
    const apply = () => {
      if (mq.matches) root.setAttribute('data-gym-app-mobile', '1')
      else root.removeAttribute('data-gym-app-mobile')
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => {
      mq.removeEventListener?.('change', apply)
      /* فقط اگر هیرو هم attribute را برنداشته — هیرو cleanup خودش را دارد */
      if (!document.querySelector('[data-gym-hero-root]')) {
        root.removeAttribute('data-gym-app-mobile')
      }
    }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const publish = () =>
      reportGymCurveHeight('features', el.getBoundingClientRect().height)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    const unsub = subscribeGymCurveHeights((sizes) => {
      setCurveViewBox(curveViewBoxSlice('features', sizes))
    })
    return () => {
      ro.disconnect()
      unsub()
      reportGymCurveHeight('features', 0)
    }
  }, [])

  const header = useMemo(() => {
    const rs = remote?.settings || {}
    return {
      eyebrow: rs.eyebrow || layoutSettings.eyebrow,
      title: rs.title || layoutSettings.title,
      subtitle: rs.subtitle || layoutSettings.subtitle,
    }
  }, [remote, layoutSettings.eyebrow, layoutSettings.title, layoutSettings.subtitle])

  const steps = useMemo(() => {
    const rows = remote?.steps
    if (Array.isArray(rows) && rows.length) return rows.map(mapApiStep)
    return FALLBACK_STEPS
  }, [remote])

  useLayoutEffect(() => {
    const timeline = timelineRef.current
    const pathEl = pathGeomRef.current
    if (!timeline || !pathEl || typeof window === 'undefined') return undefined

    const placeIcons = () => {
      const cards = Array.from(timeline.querySelectorAll('[data-step-card]'))
      if (!cards.length) return

      const tRect = timeline.getBoundingClientRect()
      const totalLen = pathEl.getTotalLength()
      if (!totalLen || !tRect.height) return

      const samples = []
      const stepsN = 120
      for (let i = 0; i <= stepsN; i += 1) {
        samples.push(pathEl.getPointAtLength((i / stepsN) * totalLen))
      }

      const next = cards.map((card) => {
        const cRect = card.getBoundingClientRect()
        const targetY = ((cRect.top - tRect.top + 22) / tRect.height) * 1000
        let best = samples[0]
        let bestDist = Math.abs(best.y - targetY)
        for (let i = 1; i < samples.length; i += 1) {
          const d = Math.abs(samples[i].y - targetY)
          if (d < bestDist) {
            best = samples[i]
            bestDist = d
          }
        }
        return {
          left: (best.x / 48) * 100,
          top: (best.y / 1000) * 100,
          ready: true,
        }
      })
      setIconPos(next)
    }

    placeIcons()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(placeIcons) : null
    if (ro) ro.observe(timeline)
    window.addEventListener('resize', placeIcons)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', placeIcons)
    }
  }, [steps])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return undefined

    const nodes = Array.from(section.querySelectorAll('[data-step-card]'))
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        setActive(Number(visible.target.getAttribute('data-step-card') || 0))
      },
      { threshold: [0.35, 0.55, 0.7], rootMargin: '-10% 0px -30% 0px' },
    )
    nodes.forEach((n) => io.observe(n))

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const viewH = window.innerHeight || 1
        const traveled = Math.min(
          1,
          Math.max(0, (viewH * 0.28 - rect.top) / (rect.height * 0.85)),
        )
        if (pathSvgRef.current) {
          pathSvgRef.current.style.setProperty('--draw', `${traveled}`)
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps])

  const bgMode = curveStyle.mode || 'curve'
  const bgClass =
    bgMode === 'simple'
      ? styles.bgSimple
      : bgMode === 'gradient'
        ? styles.bgGradient
        : styles.bgCurve

  return (
    <section
      className={`${styles.section} ${bgClass}`}
      ref={sectionRef}
      dir="rtl"
      lang="fa"
      data-hero-bg={bgMode}
      style={{
        '--feat-bg': curveStyle.colorAlt || '#ffffff',
        '--feat-bg-alt': curveStyle.color || GYM_EMERALD_DEEP,
      }}
    >
      {bgMode === 'curve' ? (
        <div className={styles.curveSide} aria-hidden>
          <svg
            className={styles.curveSideSvg}
            viewBox={curveViewBox}
            preserveAspectRatio="none"
          >
            <path
              d={sideFillPath}
              fill={curveStyle.color || GYM_EMERALD_DEEP}
              fillRule="nonzero"
            />
          </svg>
        </div>
      ) : null}

      <header className={styles.head}>
        <p className={styles.eyebrow}>{header.eyebrow}</p>
        <h2>{header.title}</h2>
        <p className={styles.lead}>{header.subtitle}</p>
      </header>

      <div className={styles.timeline} ref={timelineRef}>
        <div className={styles.pathStroke} aria-hidden>
          <svg
            ref={pathSvgRef}
            className={styles.path}
            viewBox="0 0 48 1000"
            preserveAspectRatio="none"
          >
            <path className={styles.pathTrack} d={BEE_PATH} fill="none" />
            <path
              ref={pathGeomRef}
              className={styles.pathFill}
              d={BEE_PATH}
              fill="none"
              pathLength="1"
            />
          </svg>

          {steps.map((step, idx) => {
            const Icon = ICON_MAP[step.icon] || UsersRound
            const pos = iconPos[idx]
            const on = idx === active
            if (!pos?.ready) return null
            return (
              <span
                key={`icon-${step.id}`}
                className={[styles.pathIcon, on ? styles.pathIconOn : '']
                  .filter(Boolean)
                  .join(' ')}
                style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>
            )
          })}
        </div>

        <div className={styles.cards}>
          {steps.map((step, idx) => {
            const on = idx === active
            return (
              <article
                key={step.id}
                className={[
                  styles.card,
                  styles[`side_${step.side}`],
                  on ? styles.cardOn : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-step-card={idx}
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardStep}>{step.step}</span>
                  </div>
                  <p className={styles.cardNeed}>{step.need}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.cardText}>{step.text}</p>
                  <p className={styles.cardResult}>{step.result}</p>
                  <span className={styles.cardHint}>
                    گام {idx + 1} از {steps.length}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
