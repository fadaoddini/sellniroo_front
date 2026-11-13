'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Shield,
} from 'lucide-react'
import { SCHOOL_PORTALS } from './schoolData'
import styles from './SchoolRoleBar.module.css'

const ROLE_META = {
  admin: {
    icon: Shield,
    short: 'مدیریت مدرسه',
    accent: 'admin',
  },
  counselor: {
    icon: HeartHandshake,
    short: 'مشاوره و آزمون',
    accent: 'counselor',
  },
  teacher: {
    icon: GraduationCap,
    short: 'کلاس و نمره',
    accent: 'teacher',
  },
  student: {
    icon: BookOpen,
    short: 'کارنامه و درس',
    accent: 'student',
  },
}

const ORDER = ['admin', 'counselor', 'teacher', 'student']

function visibilityClass(s) {
  const parts = []
  if (s.show_on_mobile === false) parts.push(styles.hiddenMobile)
  if (s.show_on_desktop === false) parts.push(styles.hiddenDesktop)
  return parts.join(' ')
}

export default function SchoolRoleBar({ settings: raw = {} } = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const byId = Object.fromEntries(SCHOOL_PORTALS.map((p) => [p.id, p]))
  const title = String(s.title || 'ورود نقش‌ها').trim() || 'ورود نقش‌ها'

  return (
    <nav
      className={`${styles.bar} ${visibilityClass(s)}`}
      aria-label={title}
      data-school-role-bar="1"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {title}
        </p>
        <ul className={styles.row}>
          {ORDER.map((id) => {
            const portal = byId[id]
            const meta = ROLE_META[id]
            if (!portal || !meta) return null
            const Icon = meta.icon
            return (
              <li key={id} className={styles.item}>
                <Link
                  href={portal.href}
                  className={`${styles.link} ${styles[meta.accent]}`}
                >
                  <span className={styles.iconWrap} aria-hidden>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className={styles.text}>
                    <strong className={styles.name}>{portal.title}</strong>
                    <span className={styles.hint}>{meta.short}</span>
                  </span>
                  <span className={styles.go} aria-hidden>
                    <ArrowLeft size={14} strokeWidth={2} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
