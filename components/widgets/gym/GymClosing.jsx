'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  DEFAULT_GYM_CLOSING,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import styles from './GymClosing.module.css'

export default function GymClosing({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_CLOSING)

  return (
    <section className={styles.closing} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <p className={styles.brand}>{s.brand}</p>
        <h2>{s.title}</h2>
        <p className={styles.subtitle}>{s.subtitle}</p>
        <Link href={s.cta_href || '/gym/profile?tab=manage'} className={styles.cta}>
          {s.cta_label}
          <ArrowLeft size={16} />
        </Link>
      </div>
    </section>
  )
}
