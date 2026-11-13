'use client'

import React from 'react'
import {
  BellRing,
  CalendarClock,
  ShoppingBag,
  UserRoundCog,
} from 'lucide-react'
import {
  DEFAULT_GYM_PILLARS,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import styles from './GymPillars.module.css'

/** خطاب به عضو باشگاه — از زبان مدیر باشگاه */
const PILLARS = [
  {
    id: 'sessions',
    icon: CalendarClock,
    title: 'سانس مال خودته',
    text: 'سانس آقایان و بانوان با ظرفیت مشخص — جات رو رزرو کن و سر وقت بیا.',
  },
  {
    id: 'coach',
    icon: UserRoundCog,
    title: 'مربی کنارت هست',
    text: 'برنامه تمرین و رژیم مخصوص خودت؛ فقط انجام بده، ما مسیر رو چیدیم.',
  },
  {
    id: 'shop',
    icon: ShoppingBag,
    title: 'فروشگاه اعضا',
    text: 'مکمل و پوشاک با قیمت ویژه اعضا — همون‌جایی که تمرین می‌کنی.',
  },
  {
    id: 'alerts',
    icon: BellRing,
    title: 'یادآوری تمدید',
    text: 'قبل از تموم شدن عضویت بهت خبر می‌دیم تا تمرینت قطع نشه.',
  },
]

export default function GymPillars({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_PILLARS)

  return (
    <section className={styles.pillars} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2>{s.title}</h2>
          <p className={styles.subtitle}>{s.subtitle}</p>
        </header>
        <div className={styles.grid}>
          {PILLARS.map(({ id, icon: Icon, title, text }) => (
            <article key={id} className={styles.card}>
              <span className={styles.icon} aria-hidden>
                <Icon size={22} strokeWidth={2.1} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
