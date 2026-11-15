'use client'

import React, { useEffect, useRef, useState } from 'react'
import useReboNormalized from '../rebo/useReboNormalized'
import styles from '../rebo/ReboUsecases.module.css'
import schoolStyles from './SchoolAnimation.module.css'

/** ترتیب و نام‌ها مثل صحنه مدرسه — فقط مدرسه لیبل دارد */
const DEFAULT_PIXEL_INDUSTRIES = [
  { id: 'salon', label: '' },
  { id: 'clinic', label: '' },
  { id: 'school', label: 'مدرسه آسمان علم' },
  { id: 'shop', label: '' },
  { id: 'company', label: '' },
  { id: 'restaurant', label: '' },
]

function BuildingArt({ id }) {
  const mono = id !== 'school' ? schoolStyles.monoBody : ''
  switch (id) {
    case 'salon':
      return (
        <div className={`${styles.buildingBody} ${styles.bSalon} ${mono}`}>
          <div className={styles.salonPole} />
          <div className={styles.salonAwning} />
          <div className={styles.facade}>
            <span className={`${styles.win} ${styles.winRound}`} />
            <span className={`${styles.win} ${styles.winRound}`} />
            <span className={styles.door} />
          </div>
        </div>
      )
    case 'clinic':
      return (
        <div className={`${styles.buildingBody} ${styles.bClinic} ${mono}`}>
          <div className={styles.clinicCross} />
          <div className={styles.roof} />
          <div className={styles.facade}>
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={`${styles.door} ${styles.doorWide}`} />
          </div>
        </div>
      )
    case 'restaurant':
      return (
        <div className={`${styles.buildingBody} ${styles.bRestaurant} ${mono}`}>
          <div className={styles.chimney}>
            <span className={styles.smoke} />
          </div>
          <div className={styles.restoRoof} />
          <div className={styles.facade}>
            <span className={`${styles.win} ${styles.winTall}`} />
            <span className={`${styles.win} ${styles.winTall}`} />
            <span className={styles.door} />
          </div>
        </div>
      )
    case 'shop':
      return (
        <div className={`${styles.buildingBody} ${styles.bShop} ${mono}`}>
          <div className={styles.shopSign} />
          <div className={styles.facade}>
            <span className={styles.shopWindow} />
            <span className={`${styles.door} ${styles.doorSide}`} />
          </div>
        </div>
      )
    case 'company':
      return (
        <div className={`${styles.buildingBody} ${styles.bCompany} ${mono}`}>
          <div className={styles.antenna} />
          <div className={`${styles.facade} ${styles.facadeTall}`}>
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.door} />
          </div>
        </div>
      )
    case 'school':
      return (
        <div
          className={`${styles.buildingBody} ${styles.bSchool} ${schoolStyles.schoolBody}`}
        >
          <div className={styles.schoolFlag} />
          <div className={styles.schoolBell} />
          <div className={styles.roof} />
          <div className={`${styles.facade} ${styles.facadeWide} ${schoolStyles.schoolFacade}`}>
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={`${styles.door} ${styles.doorArch}`} />
          </div>
          <div className={`${styles.schoolSteps} ${schoolStyles.schoolSteps}`} />
        </div>
      )
    default:
      return (
        <div className={`${styles.buildingBody} ${mono}`}>
          <div className={styles.roof} />
          <div className={styles.facade}>
            <span className={styles.win} />
            <span className={styles.door} />
          </div>
        </div>
      )
  }
}

function PixelBuilding({ item }) {
  const isSchool = item.id === 'school'
  return (
    <div
      className={`${styles.building} ${isSchool ? schoolStyles.buildingSchool : schoolStyles.buildingMono}`}
      data-building-id={item.id}
    >
      {isSchool ? (
        <span className={`${styles.buildingLabel} ${schoolStyles.schoolLabel}`}>
          {item.label || 'مدرسه آسمان علم'}
        </span>
      ) : (
        <span className={schoolStyles.labelSpacer} aria-hidden />
      )}
      <BuildingArt id={item.id} />
    </div>
  )
}

/** دختر مدرسه — چهره، مو، لامپ */
function SchoolGirl({
  celebrating = false,
  lampOn = false,
  dance = 'bounce',
  dress = 'pink',
  className = '',
}) {
  const lit = lampOn || celebrating
  return (
    <div
      className={`${schoolStyles.girl} ${celebrating ? schoolStyles.girlHappy : ''} ${celebrating ? schoolStyles[`girlDance_${dance}`] : ''} ${lit ? schoolStyles.girlLit : ''} ${schoolStyles[`dress_${dress}`] || ''} ${className}`}
      aria-hidden
    >
      <div className={`${schoolStyles.lampWrap} ${lit ? schoolStyles.lampWrapOn : ''}`}>
        {!lit ? (
          <span className={`${schoolStyles.mark} ${schoolStyles.markQ}`}>?</span>
        ) : null}
        <div className={`${schoolStyles.lamp} ${lit ? schoolStyles.lampOn : schoolStyles.lampOff}`}>
          <span className={schoolStyles.lampGlass} />
          <span className={schoolStyles.lampScrew} />
        </div>
        {!lit ? (
          <span className={`${schoolStyles.mark} ${schoolStyles.markBang}`}>!</span>
        ) : null}
      </div>
      <div className={schoolStyles.girlSprite}>
        <span className={schoolStyles.hairTop} />
        <span className={`${schoolStyles.hairBun} ${schoolStyles.hairBunL}`} />
        <span className={`${schoolStyles.hairBun} ${schoolStyles.hairBunR}`} />
        <span className={schoolStyles.head} />
        <span className={`${schoolStyles.brow} ${schoolStyles.browL}`} />
        <span className={`${schoolStyles.brow} ${schoolStyles.browR}`} />
        <span className={`${schoolStyles.eye} ${schoolStyles.eyeL}`} />
        <span className={`${schoolStyles.eye} ${schoolStyles.eyeR}`} />
        {!lit ? <span className={schoolStyles.tear} /> : null}
        <span className={schoolStyles.nose} />
        <span className={schoolStyles.mouth} />
        <span className={schoolStyles.body} />
        <span className={`${schoolStyles.arm} ${schoolStyles.armL}`} />
        <span className={`${schoolStyles.arm} ${schoolStyles.armR}`} />
        <span className={`${schoolStyles.leg} ${schoolStyles.legL}`}>
          <span className={schoolStyles.foot} />
        </span>
        <span className={`${schoolStyles.leg} ${schoolStyles.legR}`}>
          <span className={schoolStyles.foot} />
        </span>
      </div>
      <div className={schoolStyles.shadow} />
    </div>
  )
}

/* دو دختر مهمانی + دختر اصلی = سه نفر */
const PARTY_CREW = [
  { id: 'a', dress: 'blue', delay: '0s', dance: 'sway' },
  { id: 'b', dress: 'purple', delay: '0.12s', dance: 'hop' },
]

const PARTY_CARS = [
  { id: '1', color: 'red', dir: 'ltr', lane: 'top', dur: '7.5s', delay: '0s' },
  { id: '2', color: 'blue', dir: 'rtl', lane: 'bot', dur: '9s', delay: '0.6s' },
  { id: '3', color: 'yellow', dir: 'ltr', lane: 'top', dur: '6.2s', delay: '1.8s' },
  { id: '4', color: 'green', dir: 'rtl', lane: 'bot', dur: '8.4s', delay: '2.4s' },
  { id: '5', color: 'purple', dir: 'ltr', lane: 'top', dur: '10s', delay: '3.5s' },
]

function PixelCar({ color = 'red', dir = 'ltr' }) {
  return (
    <div
      className={`${styles.pixelCar} ${styles[`car_${color}`]} ${dir === 'rtl' ? styles.carRtl : ''}`}
      aria-hidden
    >
      <span className={styles.carBody} />
      <span className={styles.carCabin} />
      <span className={styles.carWindow} />
      <span className={`${styles.carLight} ${styles.carLightL}`} />
      <span className={`${styles.carLight} ${styles.carLightR}`} />
      <span className={`${styles.carWheel} ${styles.carWheelL}`} />
      <span className={`${styles.carWheel} ${styles.carWheelR}`} />
    </div>
  )
}

function PixelBird({ className }) {
  return (
    <span className={`${styles.bird} ${className || ''}`} aria-hidden>
      <span className={styles.birdWingL} />
      <span className={styles.birdBody} />
      <span className={styles.birdWingR} />
    </span>
  )
}

function PixelPlane({ className }) {
  return (
    <span className={`${styles.plane} ${className || ''}`} aria-hidden>
      <span className={styles.planeBody} />
      <span className={styles.planeWing} />
      <span className={styles.planeTail} />
      <span className={styles.planeWindow} />
    </span>
  )
}

function PixelTree({ kind, height }) {
  return (
    <div
      className={`${styles.tree} ${styles[`tree_${kind}`]} ${styles[`treeH_${height}`]}`}
      aria-hidden
    >
      <div className={styles.treeCrown} aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className={styles.treeTrunk} />
      <span className={styles.treeBase} />
    </div>
  )
}

const TREE_STRIP = [
  { kind: 'pine', height: 'tall' },
  { kind: 'round', height: 'short' },
  { kind: 'wide', height: 'mid' },
  { kind: 'pine', height: 'short' },
  { kind: 'round', height: 'tall' },
  { kind: 'wide', height: 'short' },
  { kind: 'pine', height: 'mid' },
  { kind: 'round', height: 'mid' },
  { kind: 'wide', height: 'tall' },
]

const BULB_HUES = [
  styles.bulbHue0,
  styles.bulbHue1,
  styles.bulbHue2,
  styles.bulbHue3,
  styles.bulbHue4,
  styles.bulbHue5,
]

/* حروف پیکسلی ۵×۷ با لامپ */
const BULB_GLYPHS = {
  R: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10100',
    '10010',
    '10001',
  ],
  E: [
    '11111',
    '10000',
    '10000',
    '11110',
    '10000',
    '10000',
    '11111',
  ],
  B: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10001',
    '10001',
    '11110',
  ],
  O: [
    '01110',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01110',
  ],
  I: [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100',
    '11111',
  ],
  '.': [
    '00000',
    '00000',
    '00000',
    '00000',
    '00000',
    '01100',
    '01100',
  ],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
}

function BulbLetter({ char, hueOffset = 0 }) {
  const rows = BULB_GLYPHS[char] || BULB_GLYPHS['.']
  let n = 0
  return (
    <div className={styles.bulbLetter} aria-hidden>
      {rows.map((row, y) =>
        row.split('').map((cell, x) => {
          if (cell !== '1') {
            return <span key={`${y}-${x}`} className={styles.bulbGap} />
          }
          const idx = (hueOffset + n) % 6
          n += 1
          return (
            <span
              key={`${y}-${x}`}
              className={`${styles.bulb} ${BULB_HUES[idx]}`}
              style={{ animationDelay: `${((y * 5 + x + hueOffset) % 8) * 0.14}s` }}
            />
          )
        }),
      )}
    </div>
  )
}

function SkyBulbSign({
  text = 'REBO.IR',
  bulbColor = 'custom',
  bulbHex = '#e11d48',
}) {
  const chars = String(text || 'REBO.IR')
    .toUpperCase()
    .split('')
    .filter((ch) => BULB_GLYPHS[ch])
    .slice(0, 14)
  const customStyle =
    bulbColor === 'custom'
      ? {
          '--bulb-core': '#fff5f5',
          '--bulb-on': bulbHex,
          '--bulb-mid': bulbHex,
          '--bulb-glow': `${bulbHex}99`,
          '--bulb-halo': `${bulbHex}55`,
        }
      : undefined
  return (
    <div
      className={styles.skyBulbSign}
      data-bulb-color={bulbColor || 'custom'}
      style={customStyle}
      aria-hidden
    >
      <span className={styles.skyBrandSr}>{text}</span>
      {chars.map((ch, i) => (
        <BulbLetter key={`${ch}-${i}`} char={ch} hueOffset={i * 2} />
      ))}
    </div>
  )
}

/** URL مدیا را برای پخش از همان origin فرانت (/media/…) آماده می‌کند */
function resolveAudioSrc(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw)
      if (u.pathname.startsWith('/media/')) return u.pathname
      return raw
    }
  } catch {
    /* ignore */
  }
  if (raw.startsWith('/media/')) return raw
  if (raw.startsWith('media/')) return `/${raw}`
  return raw
}

function PixelMusicButton({
  url,
  label = 'پخش موسیقی',
  loop = true,
  volume = 70,
  onPlayingChange,
}) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = resolveAudioSrc(url)

  const setPlayState = (next) => {
    setPlaying(next)
    onPlayingChange?.(next)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    audio.loop = !!loop
    audio.volume = Math.max(0, Math.min(1, Number(volume) / 100))
    setPlayState(false)
    setFailed(false)
    return () => {
      audio.pause()
      onPlayingChange?.(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, volume, src])

  if (!src) return null

  const toggle = async (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    const audio = audioRef.current
    if (!audio) return
    try {
      if (!audio.paused) {
        audio.pause()
        setPlayState(false)
        return
      }
      setFailed(false)
      if (audio.src !== src && !audio.src.endsWith(src)) {
        audio.src = src
      }
      audio.load()
      await audio.play()
      setPlayState(true)
    } catch (err) {
      console.warn('[rebo music] play failed', src, err)
      setPlayState(false)
      setFailed(true)
    }
  }

  const playLabel =
    label && label !== 'PLAY' && label !== 'گوش کنید'
      ? label
      : 'پخش موسیقی'
  const stopLabel = 'متوقف'

  return (
    <div
      className={`${styles.pixelPlayWrap} ${
        playing ? styles.pixelPlayWrapOn : styles.pixelPlayWrapIdle
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        onEnded={() => {
          if (!loop) setPlayState(false)
        }}
        onError={() => {
          setPlayState(false)
          setFailed(true)
        }}
        onPause={() => setPlayState(false)}
        onPlay={() => setPlayState(true)}
      />
      <button
        type="button"
        className={`${styles.pixelPlay} ${playing ? styles.pixelPlayOn : styles.pixelPlayCall} ${failed ? styles.pixelPlayFail : ''}`}
        onClick={toggle}
        aria-label={playing ? stopLabel : playLabel}
        title={playing ? stopLabel : playLabel}
      >
        <span className={styles.sunRays} aria-hidden />
        <span className={styles.sunCore}>
          <span className={styles.pixelPlayLabel}>
            {failed ? 'خطا' : playing ? stopLabel : playLabel}
          </span>
        </span>
      </button>
    </div>
  )
}

/* اسکای‌لاین شلوغ پشت ساختمان‌های اصلی */
const CITY_BLOCKS = [
  { h: 42, w: 18, tone: 'a', win: 2 },
  { h: 68, w: 22, tone: 'b', win: 3 },
  { h: 54, w: 16, tone: 'c', win: 2 },
  { h: 88, w: 26, tone: 'a', win: 4 },
  { h: 36, w: 14, tone: 'b', win: 1 },
  { h: 76, w: 20, tone: 'c', win: 3 },
  { h: 48, w: 18, tone: 'a', win: 2 },
  { h: 96, w: 28, tone: 'b', win: 4 },
  { h: 40, w: 15, tone: 'c', win: 2 },
  { h: 62, w: 19, tone: 'a', win: 3 },
  { h: 82, w: 24, tone: 'b', win: 3 },
  { h: 34, w: 12, tone: 'c', win: 1 },
  { h: 70, w: 21, tone: 'a', win: 3 },
  { h: 58, w: 17, tone: 'b', win: 2 },
  { h: 90, w: 25, tone: 'c', win: 4 },
  { h: 46, w: 16, tone: 'a', win: 2 },
  { h: 64, w: 20, tone: 'b', win: 3 },
  { h: 78, w: 22, tone: 'c', win: 3 },
  { h: 38, w: 14, tone: 'a', win: 1 },
  { h: 100, w: 30, tone: 'b', win: 5 },
  { h: 52, w: 18, tone: 'c', win: 2 },
  { h: 72, w: 23, tone: 'a', win: 3 },
]

function CitySilhouette({ block }) {
  return (
    <div
      className={`${styles.cityBlock} ${styles[`cityTone_${block.tone}`]}`}
      style={{ height: `${block.h}px`, width: `${block.w}px` }}
      aria-hidden
    >
      <div className={styles.cityWindows}>
        {Array.from({ length: block.win * 3 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  )
}

/** ویجت انیمیشن مدرسه — الگوی کامل ربو + مدرسه آسمان علم */
export default function SchoolAnimation({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'school_animation',
  )
  const sceneRef = useRef(null)
  const worldRef = useRef(null)
  const cityRef = useRef(null)
  const treesRef = useRef(null)
  const walkerRef = useRef(null)
  const lampOnRef = useRef(false)
  const [skyFlash, setSkyFlash] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [lampOn, setLampOn] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [setCopies, setSetCopies] = useState(4)
  const [cityCopies, setCityCopies] = useState(3)
  const [treeCopies, setTreeCopies] = useState(3)
  const flashTimer = useRef(0)

  const industries = DEFAULT_PIXEL_INDUSTRIES
  const loopSeconds = s.building_loop_seconds || 14
  const treeSpeed = (s.tree_speed_factor || 55) / 100
  const citySpeed = (s.city_speed_factor || 32) / 100
  const pinned = !!raw?.deep_reveal_pinned
  const fullPage = pinned || s.scene_full_page !== false
  const sceneHeight = s.scene_height || 380

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    const scene = sceneRef.current
    const world = worldRef.current
    if (!scene || !world) return undefined

    let raf = 0
    let setW = 0
    let citySetW = 0
    let treeSetW = 0
    let offset = 0
    let cityOffset = 0
    let treeOffset = 0
    let lastTs = 0
    const city = cityRef.current
    const trees = treesRef.current
    const speed = () => (setW > 0 ? setW / loopSeconds : 0)

    const measure = () => {
      const setEl = world.querySelector('[data-world-set="1"]')
      const citySetEl = city?.querySelector('[data-city-set="1"]')
      const treeSetEl = trees?.querySelector('[data-tree-set="1"]')
      const sceneW = scene.getBoundingClientRect().width
      if (setEl) {
        const nextSetW = setEl.getBoundingClientRect().width
        if (nextSetW >= 8) {
          const need = Math.max(3, Math.ceil(sceneW / nextSetW) + 2)
          setSetCopies((prev) => (prev === need ? prev : need))
          if (setW > 0 && nextSetW > 0) {
            offset = (offset / setW) * nextSetW
          }
          setW = nextSetW
        }
      }
      if (citySetEl) {
        const nextCityW = citySetEl.getBoundingClientRect().width
        if (nextCityW >= 8) {
          const needCity = Math.max(3, Math.ceil(sceneW / nextCityW) + 2)
          setCityCopies((prev) => (prev === needCity ? prev : needCity))
          if (citySetW > 0 && nextCityW > 0) {
            cityOffset = (cityOffset / citySetW) * nextCityW
          }
          citySetW = nextCityW
        }
      }
      if (treeSetEl) {
        const nextTreeW = treeSetEl.getBoundingClientRect().width
        if (nextTreeW >= 8) {
          const needTrees = Math.max(3, Math.ceil(sceneW / nextTreeW) + 2)
          setTreeCopies((prev) => (prev === needTrees ? prev : needTrees))
          if (treeSetW > 0 && nextTreeW > 0) {
            treeOffset = (treeOffset / treeSetW) * nextTreeW
          }
          treeSetW = nextTreeW
        }
      }
    }

    const tick = (ts) => {
      if (!reduceMotion) {
        if (!lastTs) lastTs = ts
        const dt = Math.min(0.05, (ts - lastTs) / 1000)
        lastTs = ts
        const px = speed() * dt
        if (setW > 0) {
          offset += px
          if (offset >= setW) offset -= setW
          world.style.transform = `translate3d(${-offset}px, 0, 0)`
        }
        if (city && citySetW > 0 && s.show_city !== false) {
          cityOffset += px * citySpeed
          if (cityOffset >= citySetW) cityOffset -= citySetW
          city.style.transform = `translate3d(${-cityOffset}px, 0, 0)`
        }
        if (trees && treeSetW > 0 && s.show_trees !== false) {
          treeOffset += px * treeSpeed
          if (treeOffset >= treeSetW) treeOffset -= treeSetW
          trees.style.transform = `translate3d(${-treeOffset}px, 0, 0)`
        }
      }

      const walker = walkerRef.current
      if (walker && s.show_buildings !== false) {
        const walkerRect = walker.getBoundingClientRect()
        const walkerX = walkerRect.left + walkerRect.width * 0.5
        let atSchool = false
        scene.querySelectorAll('[data-building-id="school"]').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.left <= walkerX + 6 && r.right >= walkerX - 6) {
            atSchool = true
          }
        })
        if (atSchool !== lampOnRef.current) {
          lampOnRef.current = atSchool
          setLampOn(atSchool)
          if (atSchool && s.show_sky_flash !== false) {
            setSkyFlash(true)
            window.clearTimeout(flashTimer.current)
            flashTimer.current = window.setTimeout(() => setSkyFlash(false), 520)
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(measure)
    })
    ro.observe(scene)
    ro.observe(world)
    if (city) ro.observe(city)
    if (trees) ro.observe(trees)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.clearTimeout(flashTimer.current)
      world.style.transform = ''
      if (city) city.style.transform = ''
      if (trees) trees.style.transform = ''
    }
  }, [
    visible,
    reduceMotion,
    setCopies,
    cityCopies,
    treeCopies,
    loopSeconds,
    citySpeed,
    treeSpeed,
    s.show_city,
    s.show_trees,
    s.show_buildings,
    s.show_sky_flash,
  ])

  if (!visible) return null

  const sectionStyle = pinned
    ? {
        ...style,
        margin: 0,
        padding: 0,
        maxWidth: 'none',
        height: '100%',
        minHeight: '100%',
      }
    : style

  return (
    <section
      className={`${styles.section} ${schoolStyles.section}`}
      style={sectionStyle}
      dir="rtl"
      lang="fa"
      data-school-animation="1"
      data-deep-reveal-under-root={pinned ? '1' : undefined}
    >
      <div
        className={`${styles.inner} ${schoolStyles.inner}`}
        data-deep-reveal-inner={pinned ? '1' : undefined}
      >
        <div
          className={`${styles.scene} ${schoolStyles.sceneFull} ${
            pinned
              ? styles.scenePinned
              : fullPage
                ? styles.sceneFullPage
                : ''
          } ${reduceMotion ? styles.sceneStatic : ''} ${skyFlash ? styles.skyFlash : ''} ${musicPlaying ? styles.musicParty : ''}`}
          ref={sceneRef}
          aria-label="انیمیشن مدرسه"
          data-deep-reveal-scene={pinned ? '1' : undefined}
          style={{
            '--usecase-scene-h': pinned
              ? '100%'
              : fullPage
                ? '100vh'
                : `${sceneHeight}px`,
            '--road-speed': `${(s.road_speed_factor || 100) / 100}`,
            '--cloud-speed': `${(s.cloud_speed_factor || 100) / 100}`,
            '--bird-speed': `${(s.bird_speed_factor || 100) / 100}`,
            '--plane-speed': `${(s.plane_speed_factor || 100) / 100}`,
          }}
        >
          <div className={styles.sky}>
            {musicPlaying ? (
              <div className={styles.skyShow} aria-hidden>
                <span className={`${styles.beam} ${styles.beam1}`} />
                <span className={`${styles.beam} ${styles.beam2}`} />
                <span className={`${styles.beam} ${styles.beam3}`} />
                <span className={`${styles.beam} ${styles.beam4}`} />
                <span className={`${styles.burst} ${styles.burst1}`} />
                <span className={`${styles.burst} ${styles.burst2}`} />
                <span className={`${styles.burst} ${styles.burst3}`} />
                <span className={`${styles.burst} ${styles.burst4}`} />
                <span className={`${styles.burst} ${styles.burst5}`} />
              </div>
            ) : null}
            {s.show_sky_brand !== false ? (
              <SkyBulbSign
                text={s.sky_brand_text || 'REBO.IR'}
                bulbColor={musicPlaying ? 'multi' : s.sky_bulb_color || 'custom'}
                bulbHex={s.sky_bulb_hex || '#e11d48'}
              />
            ) : null}
            {s.show_music_btn !== false && s.music_url ? (
              <PixelMusicButton
                url={s.music_url}
                label={s.music_label || 'پخش موسیقی'}
                loop={s.music_loop !== false}
                volume={s.music_volume ?? 70}
                onPlayingChange={setMusicPlaying}
              />
            ) : null}
            {s.show_clouds !== false ? (
              <>
                <span className={styles.cloud} aria-hidden />
                <span className={`${styles.cloud} ${styles.cloud2}`} aria-hidden />
              </>
            ) : null}
            {!reduceMotion && s.show_birds !== false ? (
              <>
                <PixelBird className={styles.birdA} />
                <PixelBird className={styles.birdB} />
                <PixelBird className={styles.birdC} />
              </>
            ) : null}
            {!reduceMotion && s.show_planes !== false ? (
              <>
                <PixelPlane className={styles.planeA} />
                <PixelPlane className={styles.planeB} />
              </>
            ) : null}
          </div>

          <div
            className={`${styles.ground} ${schoolStyles.ground}`}
            style={
              pinned || fullPage
                ? undefined
                : { height: `clamp(220px, 42vw, ${sceneHeight}px)` }
            }
          >
            {s.show_city !== false ? (
              <div ref={cityRef} className={styles.cityStrip} aria-hidden>
                {Array.from({ length: cityCopies }, (_, copy) => (
                  <div
                    className={styles.citySet}
                    key={`city-${copy}`}
                    data-city-set={copy === 0 ? '1' : undefined}
                  >
                    {CITY_BLOCKS.map((block, i) => (
                      <CitySilhouette key={`${copy}-${i}`} block={block} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div ref={cityRef} className={styles.cityStripHidden} aria-hidden />
            )}

            {s.show_buildings !== false ? (
              <div
                ref={worldRef}
                className={styles.world}
                data-pixel-world="1"
              >
                {Array.from({ length: setCopies }, (_, copy) => (
                  <div
                    className={styles.worldSet}
                    key={`set-${copy}`}
                    data-world-set={copy === 0 ? '1' : undefined}
                    aria-hidden={copy > 0}
                  >
                    {industries.map((item) => (
                      <PixelBuilding key={`${item.id}-${copy}`} item={item} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={worldRef}
                className={styles.world}
                data-pixel-world="1"
                aria-hidden
              />
            )}

            {s.show_road !== false ? (
              <div className={styles.road} aria-hidden>
                <div className={styles.roadSurface} />
                <div className={styles.roadDash} />
                <div className={styles.roadEdge} />
                <div
                  className={`${styles.carTraffic} ${musicPlaying ? styles.carTrafficOn : ''}`}
                >
                  {PARTY_CARS.map((car) => (
                    <div
                      key={car.id}
                      className={`${styles.carTrack} ${styles[`carLane_${car.lane}`]} ${styles[`carDir_${car.dir}`]}`}
                      style={{
                        '--car-dur': car.dur,
                        '--car-delay': car.delay,
                      }}
                    >
                      <PixelCar color={car.color} dir={car.dir} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {s.show_walker !== false ? (
              <div className={styles.walkerSlot} ref={walkerRef}>
                <SchoolGirl
                  celebrating={musicPlaying}
                  dance="bounce"
                  dress="pink"
                  lampOn={lampOn || musicPlaying}
                />
                <div
                  className={`${styles.partyCrew} ${musicPlaying ? styles.partyCrewOn : ''} ${schoolStyles.partyGirls}`}
                  aria-hidden
                >
                  {PARTY_CREW.map((buddy) => (
                    <div
                      key={buddy.id}
                      className={`${styles.partyBuddy} ${styles[`partyBuddy_${buddy.id}`]} ${schoolStyles.partyGirl}`}
                      style={{ '--party-delay': buddy.delay }}
                    >
                      <SchoolGirl
                        celebrating={musicPlaying}
                        dance={buddy.dance}
                        dress={buddy.dress}
                        lampOn={musicPlaying}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.walkerSlot} ref={walkerRef} aria-hidden />
            )}

            {s.show_trees !== false ? (
              <div ref={treesRef} className={styles.treeStrip} aria-hidden>
                {Array.from({ length: treeCopies }, (_, copy) => (
                  <div
                    className={styles.treeSet}
                    key={`trees-${copy}`}
                    data-tree-set={copy === 0 ? '1' : undefined}
                  >
                    {TREE_STRIP.map((item, i) => (
                      <PixelTree
                        key={`${item.kind}-${item.height}-${copy}-${i}`}
                        kind={item.kind}
                        height={item.height}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div ref={treesRef} className={styles.treeStripHidden} aria-hidden />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
