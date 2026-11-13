'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './SchoolPixelCampus.module.css'

const CAMPUS = [
  { id: 'salon', label: '' },
  { id: 'clinic', label: '' },
  { id: 'school', label: 'مدرسه آسمان علم' },
  { id: 'shop', label: '' },
  { id: 'company', label: '' },
  { id: 'restaurant', label: '' },
]

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
]

const TREE_STRIP = [
  { kind: 'pine', height: 'tall' },
  { kind: 'round', height: 'short' },
  { kind: 'wide', height: 'mid' },
  { kind: 'pine', height: 'short' },
  { kind: 'round', height: 'tall' },
  { kind: 'wide', height: 'short' },
]

function BuildingArt({ id }) {
  switch (id) {
    case 'salon':
      return (
        <div className={`${styles.buildingBody} ${styles.bSalon}`}>
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
        <div className={`${styles.buildingBody} ${styles.bClinic}`}>
          <div className={styles.clinicCross} />
          <div className={styles.roof} />
          <div className={styles.facade}>
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={`${styles.door} ${styles.doorWide}`} />
          </div>
        </div>
      )
    case 'school':
      return (
        <div className={`${styles.buildingBody} ${styles.bSchool}`}>
          <div className={styles.schoolFlag} />
          <div className={styles.schoolBell} />
          <div className={styles.roof} />
          <div className={`${styles.facade} ${styles.facadeWide}`}>
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={styles.win} />
            <span className={`${styles.door} ${styles.doorArch}`} />
          </div>
          <div className={styles.schoolSteps} />
        </div>
      )
    case 'shop':
      return (
        <div className={`${styles.buildingBody} ${styles.bShop}`}>
          <div className={styles.shopSign} />
          <div className={styles.facade}>
            <span className={styles.shopWindow} />
            <span className={`${styles.door} ${styles.doorSide}`} />
          </div>
        </div>
      )
    case 'company':
      return (
        <div className={`${styles.buildingBody} ${styles.bCompany}`}>
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
    case 'restaurant':
      return (
        <div className={`${styles.buildingBody} ${styles.bRestaurant}`}>
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
    default:
      return (
        <div className={styles.buildingBody}>
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
      className={`${styles.building} ${isSchool ? styles.buildingSchool : styles.buildingMono}`}
      data-building-id={item.id}
    >
      {isSchool ? <span className={styles.buildingLabel}>{item.label}</span> : (
        <span className={styles.labelSpacer} aria-hidden />
      )}
      <BuildingArt id={item.id} />
    </div>
  )
}

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

function PixelTree({ kind, height }) {
  return (
    <div
      className={`${styles.tree} ${styles[`tree_${kind}`]} ${styles[`treeH_${height}`]}`}
      aria-hidden
    >
      <div className={styles.treeCrown}>
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

function PixelBird({ className }) {
  return (
    <span className={`${styles.bird} ${className || ''}`} aria-hidden>
      <span className={styles.birdWingL} />
      <span className={styles.birdBody} />
      <span className={styles.birdWingR} />
    </span>
  )
}

/* حروف پیکسلی ۵×۷ با لامپ — عین ربو */
const BULB_GLYPHS = {
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
}

function BulbLetter({ char, hueOffset = 0 }) {
  const rows = BULB_GLYPHS[char] || BULB_GLYPHS['.']
  return (
    <div className={styles.bulbLetter} aria-hidden>
      {rows.map((row, y) =>
        row.split('').map((cell, x) => {
          if (cell !== '1') {
            return <span key={`${y}-${x}`} className={styles.bulbGap} />
          }
          return (
            <span
              key={`${y}-${x}`}
              className={styles.bulb}
              style={{ animationDelay: `${((y * 5 + x + hueOffset) % 8) * 0.14}s` }}
            />
          )
        }),
      )}
    </div>
  )
}

function SkyBulbSign({ text = 'REBO.IR' }) {
  const chars = String(text || 'REBO.IR')
    .toUpperCase()
    .split('')
    .filter((ch) => BULB_GLYPHS[ch])
    .slice(0, 14)
  return (
    <div className={styles.skyBulbSign} data-bulb-color="red" aria-hidden>
      <span className={styles.skyBrandSr}>{text}</span>
      {chars.map((ch, i) => (
        <BulbLetter key={`${ch}-${i}`} char={ch} hueOffset={i * 2} />
      ))}
    </div>
  )
}

function PixelWalker({ lampOn = false }) {
  return (
    <div className={`${styles.walker} ${lampOn ? styles.walkerLit : ''}`} aria-hidden>
      <div className={`${styles.lampWrap} ${lampOn ? styles.lampWrapOn : ''}`}>
        <span className={`${styles.mark} ${styles.markQ}`} aria-hidden>
          ?
        </span>
        <div className={`${styles.lamp} ${lampOn ? styles.lampOn : styles.lampOff}`}>
          <span className={styles.lampGlass} />
          <span className={styles.lampScrew} />
        </div>
        <span className={`${styles.mark} ${styles.markBang}`} aria-hidden>
          !
        </span>
      </div>
      <div className={styles.walkerSprite}>
        <span className={styles.hairTop} />
        <span className={`${styles.hairBun} ${styles.hairBunL}`} />
        <span className={`${styles.hairBun} ${styles.hairBunR}`} />
        <span className={styles.head} />
        <span className={styles.brow} />
        <span className={`${styles.eye} ${styles.eyeL}`} />
        <span className={`${styles.eye} ${styles.eyeR}`} />
        <span className={styles.tear} />
        <span className={styles.nose} />
        <span className={styles.mouth} />
        <span className={styles.body} />
        <span className={`${styles.arm} ${styles.armL}`} />
        <span className={`${styles.arm} ${styles.armR}`} />
        <span className={`${styles.leg} ${styles.legL}`}>
          <span className={`${styles.foot} ${styles.footL}`} />
        </span>
        <span className={`${styles.leg} ${styles.legR}`}>
          <span className={`${styles.foot} ${styles.footR}`} />
        </span>
      </div>
      <div className={styles.shadow} />
    </div>
  )
}

/** صحنه پیکسلی مدرسه — الگوی ربو (شهر / درخت / جاده / واکر) */
export default function SchoolPixelCampus() {
  const sceneRef = useRef(null)
  const worldRef = useRef(null)
  const cityRef = useRef(null)
  const treesRef = useRef(null)
  const walkerRef = useRef(null)
  const lampOnRef = useRef(false)
  const [setCopies, setSetCopies] = useState(4)
  const [cityCopies, setCityCopies] = useState(3)
  const [treeCopies, setTreeCopies] = useState(3)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [lampOn, setLampOn] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
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
    const loopSeconds = 14

    const measure = () => {
      const setEl = world.querySelector('[data-world-set="1"]')
      const citySetEl = city?.querySelector('[data-city-set="1"]')
      const treeSetEl = trees?.querySelector('[data-tree-set="1"]')
      const sceneW = scene.getBoundingClientRect().width
      if (setEl) {
        const next = setEl.getBoundingClientRect().width
        if (next >= 8) {
          setSetCopies((p) => {
            const need = Math.max(3, Math.ceil(sceneW / next) + 2)
            return p === need ? p : need
          })
          if (setW > 0) offset = (offset / setW) * next
          setW = next
        }
      }
      if (citySetEl) {
        const next = citySetEl.getBoundingClientRect().width
        if (next >= 8) {
          setCityCopies((p) => {
            const need = Math.max(3, Math.ceil(sceneW / next) + 2)
            return p === need ? p : need
          })
          if (citySetW > 0) cityOffset = (cityOffset / citySetW) * next
          citySetW = next
        }
      }
      if (treeSetEl) {
        const next = treeSetEl.getBoundingClientRect().width
        if (next >= 8) {
          setTreeCopies((p) => {
            const need = Math.max(3, Math.ceil(sceneW / next) + 2)
            return p === need ? p : need
          })
          if (treeSetW > 0) treeOffset = (treeOffset / treeSetW) * next
          treeSetW = next
        }
      }
    }

    const tick = (ts) => {
      if (!reduceMotion) {
        if (!lastTs) lastTs = ts
        const dt = Math.min(0.05, (ts - lastTs) / 1000)
        lastTs = ts
        const speed = setW > 0 ? setW / loopSeconds : 0
        const px = speed * dt
        if (setW > 0) {
          offset += px
          if (offset >= setW) offset -= setW
          world.style.transform = `translate3d(${-offset}px, 0, 0)`
        }
        if (city && citySetW > 0) {
          cityOffset += px * 0.32
          if (cityOffset >= citySetW) cityOffset -= citySetW
          city.style.transform = `translate3d(${-cityOffset}px, 0, 0)`
        }
        if (trees && treeSetW > 0) {
          treeOffset += px * 0.55
          if (treeOffset >= treeSetW) treeOffset -= treeSetW
          trees.style.transform = `translate3d(${-treeOffset}px, 0, 0)`
        }
      }

      const walker = walkerRef.current
      if (walker) {
        const wr = walker.getBoundingClientRect()
        const walkerX = wr.left + wr.width * 0.5
        // به‌محض رسیدن لبهٔ جلوی مدرسه به آدمک
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
        }
      }

      raf = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(() => window.requestAnimationFrame(measure))
    ro.observe(scene)
    ro.observe(world)
    if (city) ro.observe(city)
    if (trees) ro.observe(trees)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      world.style.transform = ''
      if (city) city.style.transform = ''
      if (trees) trees.style.transform = ''
    }
  }, [reduceMotion, setCopies, cityCopies, treeCopies])

  return (
    <div
      className={`${styles.scene} ${reduceMotion ? styles.sceneStatic : ''}`}
      ref={sceneRef}
      aria-label="انیمیشن پیکسلی مدرسه"
    >
      <div className={styles.sky}>
        <SkyBulbSign text="REBO.IR" />
        <span className={styles.cloud} aria-hidden />
        <span className={`${styles.cloud} ${styles.cloud2}`} aria-hidden />
        {!reduceMotion ? (
          <>
            <PixelBird className={styles.birdA} />
            <PixelBird className={styles.birdB} />
            <PixelBird className={styles.birdC} />
          </>
        ) : null}
      </div>

      <div className={styles.ground}>
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

        <div ref={worldRef} className={styles.world} data-pixel-world="1">
          {Array.from({ length: setCopies }, (_, copy) => (
            <div
              className={styles.worldSet}
              key={`set-${copy}`}
              data-world-set={copy === 0 ? '1' : undefined}
              aria-hidden={copy > 0}
            >
              {CAMPUS.map((item) => (
                <PixelBuilding key={`${item.id}-${copy}`} item={item} />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.road} aria-hidden>
          <div className={styles.roadSurface} />
          <div className={styles.roadDash} />
          <div className={styles.roadEdge} />
        </div>

        <div className={styles.walkerSlot} ref={walkerRef}>
          <PixelWalker lampOn={lampOn} />
        </div>

        <div ref={treesRef} className={styles.treeStrip} aria-hidden>
          {Array.from({ length: treeCopies }, (_, copy) => (
            <div
              className={styles.treeSet}
              key={`trees-${copy}`}
              data-tree-set={copy === 0 ? '1' : undefined}
            >
              {TREE_STRIP.map((item, i) => (
                <PixelTree
                  key={`${item.kind}-${copy}-${i}`}
                  kind={item.kind}
                  height={item.height}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
