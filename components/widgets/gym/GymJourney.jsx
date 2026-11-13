'use client'

import React from 'react'
import {
  DEFAULT_GYM_JOURNEY,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import styles from './GymJourney.module.css'

const ATHLETES = [
  { id: 'squat', label: 'اسکوات', pose: 'squat', skin: 'a' },
  { id: 'curl', label: 'دمبل', pose: 'curl', skin: 'b' },
  { id: 'pullup', label: 'بارفیکس', pose: 'pullup', skin: 'c' },
  { id: 'press', label: 'دمبل شانه', pose: 'press', skin: 'd' },
  { id: 'lift', label: 'وزنه', pose: 'lift', skin: 'e' },
]

function PixelAthlete({ pose, skin, label }) {
  return (
    <div
      className={`${styles.athlete} ${styles[`pose_${pose}`]} ${styles[`skin_${skin}`]}`}
      aria-label={label}
    >
      <div className={styles.rig} aria-hidden>
        {pose === 'pullup' ? <span className={styles.barFixed} /> : null}
        {pose === 'lift' ? <span className={styles.barbell} /> : null}
        <span className={styles.head} />
        <span className={styles.body} />
        <span className={`${styles.arm} ${styles.armL}`}>
          {(pose === 'curl' || pose === 'press') && (
            <i className={styles.dumbbell} />
          )}
        </span>
        <span className={`${styles.arm} ${styles.armR}`}>
          {(pose === 'curl' || pose === 'press') && (
            <i className={styles.dumbbell} />
          )}
        </span>
        <span className={`${styles.leg} ${styles.legL}`} />
        <span className={`${styles.leg} ${styles.legR}`} />
      </div>
      <span className={styles.shadow} aria-hidden />
      <span className={styles.tag}>{label}</span>
    </div>
  )
}

export default function GymJourney({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_JOURNEY)

  return (
    <section className={styles.section} dir="rtl" lang="fa">
      <div className={styles.head}>
        <p className={styles.eyebrow}>{s.eyebrow}</p>
        <h2>{s.title}</h2>
        <p className={styles.subtitle}>{s.subtitle}</p>
      </div>

      <div className={styles.scene} aria-label="صحنه پیکسلی باشگاه">
        <div className={styles.wall} aria-hidden>
          <span className={styles.window} />
          <span className={styles.window} />
          <span className={styles.window} />
          <span className={styles.poster} />
          <span className={styles.rack} />
        </div>

        <div className={styles.floor} aria-hidden>
          <span className={styles.mat} />
          <span className={styles.mat} />
          <span className={styles.mat} />
        </div>

        <div className={styles.stage}>
          {ATHLETES.map((a) => (
            <PixelAthlete
              key={a.id}
              pose={a.pose}
              skin={a.skin}
              label={a.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
