'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ArrowLeft,
  Bell,
  Clock3,
  Dumbbell,
  Loader2,
  Package,
  Salad,
  MessageSquare,
  ShoppingBag,
  UserCog,
  Users,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './BodybuildingPage.module.css'

const CAPABILITIES = [
  {
    title: 'اعضا',
    desc: 'عضویت، تمدید، سطح برنزی تا طلایی',
    icon: Users,
  },
  {
    title: 'بسته',
    desc: 'قیمت، تخفیف و مدت اعتبار',
    icon: Package,
  },
  {
    title: 'سانس',
    desc: 'ساعت، ظرفیت، آقایان و بانوان',
    icon: Clock3,
  },
  {
    title: 'مربی',
    desc: 'تیم مربی و اتصال به عضو',
    icon: UserCog,
  },
  {
    title: 'برنامه',
    desc: 'تمرین و رژیم با کتابخانه',
    icon: Salad,
  },
  {
    title: 'فروشگاه',
    desc: 'مکمل، پوشاک و قیمت اعضا',
    icon: ShoppingBag,
  },
  {
    title: 'هشدار',
    desc: 'انقضا و یادآوری عملیاتی',
    icon: Bell,
  },
  {
    title: 'پیامک',
    desc: 'شارژ پنل و ارسال به اعضا',
    icon: MessageSquare,
  },
]

export default function BodybuildingPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, getAuthHeaders, user } =
    useAuth()
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState(null)

  const canManage =
    !!user?.is_superuser || !!user?.is_staff || !!user?.is_staff_user

  const openDashboard = async () => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push(
        `/login?next=${encodeURIComponent('/gym/profile?tab=manage')}`,
      )
      return
    }
    if (!canManage) {
      router.push('/gym/profile')
      return
    }

    try {
      setOpening(true)
      setError(null)
      // آماده‌سازی کسب‌وکار سایت، سپس ورود به پروفایل مدیریت
      await axios.get(Config.endpoints.bodybuilding.siteBusiness(), {
        headers: getAuthHeaders(),
      })
      router.push('/gym/profile?tab=manage&section=overview')
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'خطا در آماده‌سازی باشگاه سایت',
      )
    } finally {
      setOpening(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated && canManage) {
      axios
        .get(Config.endpoints.bodybuilding.siteBusiness(), {
          headers: getAuthHeaders(),
        })
        .catch(() => {})
    }
  }, [authLoading, isAuthenticated, canManage, getAuthHeaders])

  return (
    <div className={`gymBbTheme ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/gym" className={styles.backLink}>
            <ArrowLeft size={16} />
            بازگشت
          </Link>

          <p className={styles.brand}>باشگاه بدنسازی</p>
          <h1 className={styles.title}>
            مدیریت واقعی باشگاه
            <span> بدون امکانات اضافه</span>
          </h1>
          <p className={styles.lead}>
            اعضا، بسته، سانس، مربی، فروشگاه، برنامه تمرین و رژیم، هشدار و پیامک —
            دقیقاً همان چیزهایی که در دیتابیس تعریف شده، با داده اولیه آماده.
          </p>

          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.primaryCta}
              onClick={openDashboard}
              disabled={opening || authLoading}
            >
              {opening ? (
                <>
                  <Loader2 className={styles.spinner} size={18} />
                  آماده‌سازی…
                </>
              ) : (
                <>
                  <Dumbbell size={18} />
                  ورود به پروفایل مدیریت
                </>
              )}
            </button>
            <Link href="/gym/profile" className={styles.secondaryCta}>
              پروفایل باشگاه
            </Link>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
      </section>

      <section className={styles.caps} aria-label="امکانات باشگاه">
        <div className={styles.capsInner}>
          <header className={styles.capsHeader}>
            <h2>امکانات عملیاتی</h2>
            <p>هر کارت یک مدل واقعی در سیستم باشگاه است.</p>
          </header>
          <ul className={styles.capGrid}>
            {CAPABILITIES.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.title} className={styles.capItem}>
                  <span className={styles.capIcon} aria-hidden>
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </div>
  )
}
