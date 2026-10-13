'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const RANK_FA = {
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'طلایی',
  platinum: 'پلاتینیوم',
  diamond: 'الماس',
}

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

export default function SchoolProfilePanel() {
  const [me, setMe] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await schoolService.me()
      if (cancelled) return
      if (!res.success) {
        setErr(res.error)
        return
      }
      setMe(res.data)
      const canSeeAttempts = !!(res.data?.student || res.data?.teacher || res.data?.is_admin)
      if (!canSeeAttempts) return
      const att = await schoolService.listAttempts()
      if (!cancelled && att.success) setAttempts(att.data || [])
    })()
    return () => { cancelled = true }
  }, [])

  if (err) return <p className={styles.schoolProfileEmpty}>{err}</p>
  if (!me) return <p className={styles.schoolProfileEmpty}>در حال بارگذاری…</p>

  const student = me.student
  const teacher = me.teacher
  const links = []
  links.push({ href: '/school', label: 'مدرسه' })
  if (teacher || me.is_admin || me.can_view_teacher_panel) {
    links.push({ href: '/school/teacher', label: 'پنل معلم' })
  }
  if (student || me.is_admin || me.can_view_student_panel) {
    links.push({ href: '/school/student', label: 'پنل دانش‌آموز' })
  }
  if (me.is_admin || me.can_view_manage_panel) {
    links.push({ href: '/school-manage', label: 'مدیریت' })
  }

  return (
    <div className={styles.schoolProfile}>
      <nav className={styles.schoolProfileLinks} aria-label="میانبر مدرسه">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.schoolProfileLink}>
            {l.label}
          </Link>
        ))}
      </nav>

      {student ? (
        <p className={styles.schoolProfileMeta}>
          {student.display_name}
          {' · '}
          {RANK_FA[student.rank_tier] || student.rank_tier}
          {' · معدل '}
          {faNum(student.average_percent)}٪
        </p>
      ) : null}

      {teacher ? (
        <p className={styles.schoolProfileMeta}>
          معلم: {teacher.display_name}
          {teacher.specialty ? ` · ${teacher.specialty}` : ''}
        </p>
      ) : null}

      {!student && !teacher && !me.is_admin ? (
        <p className={styles.schoolProfileEmpty}>نقش مدرسه‌ای تعریف نشده است.</p>
      ) : null}

      {attempts.length ? (
        <ul className={styles.schoolProfileList}>
          {attempts.slice(0, 10).map((a) => (
            <li key={a.id}>
              <div>
                <strong>{a.quiz_title || 'آزمون'}</strong>
                <span>
                  {[a.lesson_title, a.student_name].filter(Boolean).join(' · ')}
                </span>
              </div>
              <em>{faNum(a.percentage)}٪</em>
            </li>
          ))}
        </ul>
      ) : (student || teacher || me.is_admin) ? (
        <p className={styles.schoolProfileEmpty}>هنوز آزمونی ثبت نشده</p>
      ) : null}
    </div>
  )
}
