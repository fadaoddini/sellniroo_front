'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Table,
  Users,
  UserCog,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './BilliardPage.module.css'

const FEATURES = [
  { title: 'میزها', desc: 'وضعیت، رزرو و مدیریت میزهای بیلیارد', icon: Table },
  { title: 'کاربران', desc: 'بازیکنان و حساب‌های باشگاه', icon: Users },
  { title: 'مدیران', desc: 'نقش مدیر سالن و دسترسی‌ها', icon: UserCog },
  { title: 'پیامک', desc: 'اطلاع‌رسانی به اعضا', icon: MessageSquare },
  {
    title: 'دسترسی کامل مدیر',
    desc: 'بدون خرید اشتراک — مخصوص مدیر و سوپریوزر سایت',
    icon: ShieldCheck,
  },
]

export default function BilliardPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const [error, setError] = useState(null)

  const canManage = !!user?.is_superuser || !!user?.is_staff

  const openDashboard = () => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent('/gym/billiard/dashboard')}`)
      return
    }
    if (!canManage) {
      setError('فقط مدیر یا سوپریوزر سایت به داشبورد بیلیارد دسترسی دارد.')
      return
    }
    router.push('/gym/billiard/dashboard')
  }

  return (
    <div className={styles.billiardPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <Link href="/gym" className={styles.backLink}>
            <ArrowLeft size={18} />
            بازگشت
          </Link>
          <div className={styles.pageHeaderMain}>
            <div>
              <div className={styles.pageBadge}>
                <Sparkles size={14} />
                <span>مدیریت باشگاه بیلیارد</span>
              </div>
              <h1 className={styles.pageTitle}>
                امکانات کامل باشگاه <span>بدون اشتراک</span>
              </h1>
              <p className={styles.pageSubtitle}>
                برای سایت هر باشگاه بیلیارد، مدیر و سوپریوزر بدون خرید پلن به
                داشبورد کامل دسترسی دارند.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.plansContainer}>
        <div className={styles.plansGrid}>
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className={styles.planCard}>
                <div className={styles.planIconWrapper}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.planName}>{item.title}</h3>
                <p className={styles.planDescription || styles.pageSubtitle}>
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {error ? <p className={styles.errorState}>{error}</p> : null}
          <button
            type="button"
            className={styles.chooseButton || styles.retryButton}
            onClick={openDashboard}
            disabled={authLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.4rem',
              borderRadius: 999,
              border: 'none',
              background: '#a3e635',
              color: '#0b0d12',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <LayoutDashboard size={18} />
            ورود به داشبورد مدیریت
          </button>
        </div>
      </div>
    </div>
  )
}
