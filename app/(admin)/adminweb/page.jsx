// app/(admin)/adminweb/page.jsx — پنل اختصاصی مالک / طراح پلتفرم
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield,
  ShieldOff,
  LayoutDashboard,
  Newspaper,
  Briefcase,
  Settings2,
  Images,
  Megaphone,
  Tags,
  Radio,
  Users,
  ShoppingCart,
  Info,
  PanelTop,
  BookOpen,
  Brain,
  HelpCircle,
  ExternalLink,
  Phone,
  Code2,
  Sparkles,
  Home,
  Lock,
  RefreshCw,
  Boxes,
  ArrowUpLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  isPlatformOwner,
  normalizeIranMobile,
  OWNER_PHONES,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import AdminWebModules from './AdminWebModules'
import styles from './AdminWeb.module.css'

const QUICK_LINKS = [
  { href: '/dashboard', label: 'داشبورد مدیریت', desc: 'خلاصه وضعیت', icon: LayoutDashboard },
  { href: '/news-management', label: 'مدیریت اخبار', desc: 'انتشار و ویرایش', icon: Newspaper },
  { href: '/jobs-manage', label: 'مدیریت آگهی‌ها', desc: 'لیست و وضعیت‌ها', icon: Briefcase },
  { href: '/post-job', label: 'ثبت آگهی', desc: 'فرم چندمرحله‌ای', icon: Briefcase },
  { href: '/platform-connections', label: 'اتصالات پیام‌رسان', desc: 'بله / ایتا / روبیکا', icon: Radio },
  { href: '/hero-slider', label: 'اسلایدر هیرو', desc: 'بنر صفحه اصلی', icon: Images },
  { href: '/ticker', label: 'نوار خبری', desc: 'تیتر متحرک', icon: Megaphone },
  { href: '/site-settings', label: 'تنظیمات سایت', desc: 'برند و SEO', icon: Settings2 },
  { href: '/about-manage', label: 'درباره ما', desc: 'محتوا و سئو صفحه', icon: Info },
  { href: '/header-menu', label: 'منوی سیستم شرکتی', desc: 'لینک‌های هدر و موبایل', icon: PanelTop },
  { href: '/videoinsta-manage', label: 'آرشیو ویدیو / استوری', desc: 'متن، رنگ، نمایش و ویدیوها', icon: Images },
  { href: '/catalog-manage', label: 'کاتالوگ دیجیتال', desc: 'صفحات، جلد و چیدمان فلیپ‌بوک', icon: BookOpen },
  { href: '/quiz-manage', label: 'آزمون تخصصی', desc: 'سوالات، امتیاز و نفرات برتر', icon: Brain },
  { href: '/faq-manage', label: 'سوالات متداول', desc: 'سوال، پاسخ و دسته‌بندی', icon: HelpCircle },
  { href: '/request-types', label: 'انواع درخواست', desc: 'فرم تماس', icon: Tags },
  { href: '/employees', label: 'کارمندان', desc: 'دسترسی‌ها', icon: Users },
  { href: '/sale', label: 'فروش و لید', desc: 'پیگیری مشتری', icon: ShoppingCart },
]

export default function AdminWebPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [moduleStats, setModuleStats] = useState({ total: 0, active: 0, groups: 0 })

  const allowed = useMemo(() => isPlatformOwner(user), [user])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/adminweb')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { list, map } = await fetchSiteModules({ force: true })
        if (cancelled) return
        const total = list?.length || 0
        const active = Object.values(map || {}).filter(Boolean).length
        const groups = (list || []).filter((m) => m.is_group || (!m.parent_key && (list || []).some((c) => c.parent_key === m.key))).length
        setModuleStats({ total, active, groups })
      } catch {
        if (!cancelled) setModuleStats({ total: 0, active: 0, groups: 0 })
      }
    })()
    const onChange = () => {
      clearSiteModulesCache()
      fetchSiteModules({ force: true }).then(({ list, map }) => {
        const total = list?.length || 0
        const active = Object.values(map || {}).filter(Boolean).length
        const groups = (list || []).filter(
          (m) => m.is_group || (!m.parent_key && (list || []).some((c) => c.parent_key === m.key))
        ).length
        setModuleStats({ total, active, groups })
      }).catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChange)
    }
  }, [allowed])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <RefreshCw size={28} className={styles.spin} />
          <p>در حال بررسی دسترسی...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!allowed) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <div className={styles.deniedIcon}>
            <ShieldOff size={36} />
          </div>
          <h1>دسترسی مجاز نیست</h1>
          <p>
            این بخش فقط برای مالک و طراح پلتفرم است.
            <br />
            شمارهٔ حساب فعلی شما در لیست دسترسی قرار ندارد.
          </p>
          <div className={styles.deniedMeta}>
            <Lock size={14} />
            <span dir="ltr">{user?.mobile || '—'}</span>
          </div>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={16} />
            بازگشت به سایت
          </Link>
        </div>
      </div>
    )
  }

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    OWNER_PROFILE.name

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroMesh} aria-hidden />
          <div className={styles.heroBrand}>
            <span className={styles.badge}>
              <Shield size={13} />
              Owner control
            </span>
            <h1 className={styles.brand}>
              admin<span className={styles.brandAccent}>web</span>
            </h1>
            <p className={styles.tagline}>
              کنترل ماژول‌های پلتفرم
            </p>
            <nav className={styles.heroNav} aria-label="بخش‌های پنل">
              <a href="#modules">
                <Boxes size={13} />
                ماژول‌ها
              </a>
              <a href="#quick">
                <Sparkles size={13} />
                دسترسی سریع
              </a>
              <a href="#access">
                <Phone size={13} />
                دسترسی
              </a>
              <Link href="/">
                <ArrowUpLeft size={13} />
                سایت
              </Link>
            </nav>
          </div>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}>
              <Code2 size={26} />
            </div>
            <div>
              <p className={styles.ownerName}>{OWNER_PROFILE.name}</p>
              <p className={styles.ownerRole}>{displayName}</p>
              <p className={styles.sessionMobile} dir="ltr">
                {user?.mobile}
              </p>
            </div>
          </div>
        </header>

        <div className={styles.statsStrip}>
          <div className={`${styles.statCard} ${styles.statOk}`}>
            <span className={styles.statValue}>{moduleStats.active}</span>
            <span className={styles.statLabel}>ماژول فعال</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{moduleStats.total}</span>
            <span className={styles.statLabel}>کل ماژول‌ها</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{moduleStats.groups}</span>
            <span className={styles.statLabel}>مجموعهٔ گروهی</span>
          </div>
        </div>

        <div id="modules">
          <AdminWebModules onStatsChange={setModuleStats} />
        </div>

        <section className={styles.section} id="quick">
          <div className={styles.sectionHead}>
            <Sparkles size={18} />
            <h2>دسترسی سریع</h2>
          </div>
          <p className={styles.moduleIntro}>
            میانبر به بخش‌های مدیریتی پلتفرم — بدون نیاز به گشتن در منو.
          </p>
          <div className={styles.linkGrid}>
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className={styles.linkCard}>
                  <span className={styles.linkIcon}>
                    <Icon size={20} />
                  </span>
                  <span className={styles.linkText}>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <div className={styles.split} id="access">
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Phone size={18} />
              <h2>شماره‌های مجاز</h2>
            </div>
            <p className={styles.moduleIntro}>
              فقط این شماره‌ها به پنل مالک دسترسی دارند.
            </p>
            <ul className={styles.phoneList}>
              {OWNER_PHONES.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} dir="ltr" className={styles.phoneLink}>
                    {phone}
                  </a>
                  {normalizeMatch(user?.mobile, phone) && (
                    <span className={styles.activePill}>جلسة فعلی</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <ExternalLink size={18} />
              <h2>لینک‌های مفید</h2>
            </div>
            <p className={styles.moduleIntro}>
              سایت زنده، داشبورد عمومی و پروفایل طراح.
            </p>
            <div className={styles.extLinks}>
              <a
                href={OWNER_PROFILE.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.extBtn}
              >
                {OWNER_PROFILE.site}
                <ExternalLink size={14} />
              </a>
              <Link href="/" className={styles.extBtnGhost}>
                مشاهده سایت
              </Link>
              <Link href="/dashboard" className={styles.extBtnGhost}>
                داشبورد ادمین
              </Link>
            </div>
            <p className={styles.hint}>
              این صفحه فقط با ورود از شماره‌های بالا باز می‌شود؛ سایر کاربران پیام
              «دسترسی مجاز نیست» می‌بینند.
            </p>
          </section>
        </div>

        <p className={styles.pageFoot}>
          طراحی و توسعه ·{' '}
          <a href={OWNER_PROFILE.siteUrl} target="_blank" rel="noopener noreferrer">
            {OWNER_PROFILE.site}
          </a>
        </p>
      </div>
    </div>
  )
}

function normalizeMatch(a, b) {
  return normalizeIranMobile(a) === normalizeIranMobile(b)
}
