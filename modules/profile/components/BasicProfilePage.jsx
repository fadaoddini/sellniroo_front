'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2,
  Brain,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react'
import moment from 'moment-jalaali'
import { useAuth } from '@/contexts/AuthContext'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import QuizProfilePanel from './QuizProfilePanel'
import styles from '../styles/ProfilePage.module.css'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

const BASE_TABS = [{ key: 'account', label: 'اطلاعات من', icon: 'user' }]
const QUIZ_TAB = { key: 'quiz', label: 'آزمون‌ها', icon: 'brain' }

function BasicProfileInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizOn, setQuizOn] = useState(false)

  const tabs = useMemo(
    () => (quizOn ? [...BASE_TABS, QUIZ_TAB] : BASE_TABS),
    [quizOn]
  )
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return 'account'
  }, [searchParams, tabKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?next=/profile')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    let cancelled = false
    isSiteModuleActive(SITE_MODULE_KEYS.QUIZ, { force: true }).then((v) => {
      if (!cancelled) setQuizOn(!!v)
    })
    const onChanged = () => {
      isSiteModuleActive(SITE_MODULE_KEYS.QUIZ, { force: true }).then((v) => {
        if (!cancelled) setQuizOn(!!v)
      })
    }
    window.addEventListener('site-modules-changed', onChanged)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChanged)
    }
  }, [])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) {
      setActiveTab('account')
    }
  }, [tabKeys, activeTab])

  const handleTabChange = useCallback(
    (key) => {
      if (!tabKeys.has(key)) return
      setActiveTab(key)
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)
      router.replace(`/profile?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, tabKeys]
  )

  const joinDate = user?.date_joined
    ? moment(user.date_joined).format('jYYYY/jMM/jDD')
    : '—'

  if (authLoading || !isAuthenticated) {
    return (
      <div className={`${styles.loadingContainer} ${styles.loadingBasic}`} role="status">
        <Loader2 className={styles.spinner} size={36} />
        <p>در حال بارگذاری حساب کاربری...</p>
      </div>
    )
  }

  return (
    <div className={`${styles.profilePage} ${styles.profilePageBasic}`}>
      <div className={`${styles.container} ${styles.containerBasic}`}>
        <ProfileHeader
          user={user}
          variant="basic"
          showJobShortcuts={false}
        />

        {tabs.length > 1 ? (
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            tone="basic"
          />
        ) : null}

        <div
          className={styles.tabContent}
          role="tabpanel"
          id={`panel-${activeTab}`}
        >
          {activeTab === 'account' ? (
            <div className={styles.basicGrid}>
              <section className={styles.basicCard}>
                <div className={styles.basicCardHead}>
                  <ShieldCheck size={18} />
                  <h2>اطلاعات تماس</h2>
                </div>
                <ul className={styles.basicInfoList}>
                  <li>
                    <Phone size={15} aria-hidden />
                    <div>
                      <span>موبایل</span>
                      <strong dir="ltr">{user?.mobile || '—'}</strong>
                    </div>
                  </li>
                  <li>
                    <Mail size={15} aria-hidden />
                    <div>
                      <span>ایمیل</span>
                      <strong dir="ltr">{user?.email || 'ثبت نشده'}</strong>
                    </div>
                  </li>
                  <li>
                    <Calendar size={15} aria-hidden />
                    <div>
                      <span>عضویت</span>
                      <strong>{joinDate}</strong>
                    </div>
                  </li>
                </ul>
                <p className={styles.basicNote}>
                  برای ویرایش نام، ایمیل یا تصویر از دکمه «ویرایش پروفایل» در کارت
                  بالا استفاده کنید.
                </p>
              </section>

              {quizOn ? (
                <section className={`${styles.basicCard} ${styles.basicQuizCard}`}>
                  <div className={styles.basicCardHead}>
                    <Brain size={18} />
                    <h2>آزمون تخصصی</h2>
                  </div>
                  <p className={styles.basicQuizText}>
                    تاریخچه آزمون‌ها، امتیازها و رتبه‌های خود را ببینید یا یک آزمون
                    جدید شروع کنید.
                  </p>
                  <div className={styles.basicQuizActions}>
                    <button
                      type="button"
                      className={styles.basicBtnPrimary}
                      onClick={() => handleTabChange('quiz')}
                    >
                      مشاهده نتایج من
                      <ChevronLeft size={16} />
                    </button>
                    <Link href="/quiz" className={styles.basicBtnGhost}>
                      شروع آزمون
                    </Link>
                  </div>
                </section>
              ) : (
                <section className={`${styles.basicCard} ${styles.basicQuietCard}`}>
                  <h2>حساب شخصی</h2>
                  <p>
                    از این صفحه می‌توانید اطلاعات شخصی خود را مدیریت کنید.
                  </p>
                </section>
              )}
            </div>
          ) : null}

          {activeTab === 'quiz' && quizOn ? (
            <QuizProfilePanel variant="standalone" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BasicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${styles.loadingContainer} ${styles.loadingBasic}`}>
          <Loader2 className={styles.spinner} size={36} />
          <p>در حال بارگذاری حساب کاربری...</p>
        </div>
      }
    >
      <BasicProfileInner />
    </Suspense>
  )
}
