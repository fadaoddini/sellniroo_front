'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Users,
  LayoutDashboard,
  BookOpen,
  ArrowLeft,
  HeartHandshake,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

export default function SchoolHub() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [me, setMe] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/school')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    schoolService.me().then((res) => {
      if (cancelled) return
      if (!res.success) {
        setErr(res.error)
        return
      }
      setMe(res.data)
      const isAdmin = res.data?.is_admin || res.data?.is_superuser || user?.is_superuser
      if (isAdmin) return
      if (res.data?.teacher && !res.data?.student) {
        router.replace('/profile?tab=teacher')
      } else if (res.data?.student && !res.data?.teacher) {
        router.replace('/profile?tab=students')
      } else if (res.data?.counselor && !res.data?.teacher && !res.data?.student) {
        router.replace('/profile?tab=counselor')
      }
    })
    return () => { cancelled = true }
  }, [isAuthenticated, router, user?.is_superuser])

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.empty}>در حال آماده‌سازی مدرسه…</div>
        </div>
      </div>
    )
  }

  const title = me?.settings?.title_fa || 'مدرسه'
  const isAdmin = me?.is_admin || me?.is_superuser || user?.is_superuser
  const showManage = me?.can_view_manage_panel || isAdmin
  const showTeacher = me?.can_view_teacher_panel || isAdmin || me?.teacher
  const showCounselor = me?.can_view_counselor_panel || isAdmin || me?.counselor
  const showStudent = me?.can_view_student_panel || isAdmin || me?.student

  const cards = []
  if (showManage) {
    cards.push({
      href: '/profile?tab=manage',
      icon: LayoutDashboard,
      title: 'مدیریت مدرسه',
      desc: 'رصد معلمان، مشاوران، دانش‌آموزان و فعالیت‌ها',
      meta: 'پنل مدیر',
    })
  }
  if (showTeacher) {
    cards.push({
      href: '/profile?tab=teacher',
      icon: GraduationCap,
      title: 'داشبورد معلم',
      desc: 'دروس، فصل‌ها، تمرین‌ها، آزمون و بررسی تکالیف',
      meta: me?.teacher ? me.teacher.display_name : 'پیش‌نمایش',
    })
  }
  if (showCounselor) {
    cards.push({
      href: '/profile?tab=counselor',
      icon: HeartHandshake,
      title: 'داشبورد مشاوره',
      desc: 'معرفی مشاور، آزمون IQ/EQ و پرونده هر دانش‌آموز',
      meta: me?.counselor ? me.counselor.display_name : 'پیش‌نمایش',
    })
  }
  if (showStudent) {
    cards.push({
      href: '/profile?tab=students',
      icon: BookOpen,
      title: 'داشبورد دانش‌آموز',
      desc: 'دروس، تکالیف، آزمون، رتبه و پیشنهاد مطالعه',
      meta: me?.student ? me.student.display_name : 'پیش‌نمایش',
    })
  }
  cards.push({
    href: '/profile',
    icon: Users,
    title: 'پروفایل مدرسه',
    desc: 'پنل نقش‌ها داخل حساب کاربری',
    meta: 'پروفایل',
  })

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.hubHero}>
          <div className={styles.heroGlow} aria-hidden />
          <p className={styles.badge} style={{ position: 'relative', zIndex: 1 }}>
            <GraduationCap size={12} /> School hub
          </p>
          <p className={styles.hubEyebrow} style={{ position: 'relative', zIndex: 1 }}>
            school<span className={styles.brandAccent}>hub</span>
          </p>
          <h1 className={styles.hubTitle} style={{ position: 'relative', zIndex: 1 }}>{title}</h1>
          <p className={styles.hubDesc} style={{ position: 'relative', zIndex: 1 }}>
            {isAdmin
              ? 'به‌عنوان مدیر به همه پنل‌ها دسترسی دارید؛ برای پیش‌نمایش وارد هر بخش شوید.'
              : (me?.settings?.subtitle_fa || 'یادگیری منظم، تمرین و آزمون در یک مسیر ساده.')}
          </p>
        </header>

        {err ? <div className={styles.err}>{err}</div> : null}

        {!showManage && !showTeacher && !showCounselor && !showStudent ? (
          <div className={styles.panel}>
            <p className={styles.empty}>
              هنوز نقش معلم، مشاور یا دانش‌آموز برای شما تعریف نشده.
              از مدیر مدرسه بخواهید شما را اضافه کند.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/dashboard" className={styles.btn}>بازگشت به داشبورد</Link>
            </div>
          </div>
        ) : (
          <div className={styles.hubCards}>
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.href} href={card.href} className={styles.hubCard}>
                  <span className={styles.hubIcon} aria-hidden>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h2>{card.title}</h2>
                  <p>{card.desc}</p>
                  <span className={styles.hubCardMeta}>
                    {card.meta} <ArrowLeft size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
