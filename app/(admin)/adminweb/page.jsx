// app/(admin)/adminweb — داشبورد ادمین کل (مالک پلتفرم)
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Boxes,
  Newspaper,
  Briefcase,
  Settings2,
  Sparkles,
  LayoutDashboard,
  PanelTop,
  Images,
  Megaphone,
  Tags,
  Radio,
  Users,
  ShoppingCart,
  Info,
  BookOpen,
  Brain,
  HelpCircle,
  GraduationCap,
  List,
  FileText,
  Phone,
  ExternalLink,
  CreditCard,
  ShoppingBag,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import useShopMode from '@/hooks/useShopMode'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import {
  normalizeIranMobile,
  OWNER_PHONES,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import axios from 'axios'
import styles from './AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const HUBS = [
  {
    href: '/adminsettings',
    title: 'چیدمان صفحه اصلی',
    desc: 'ویجت‌ها و سکشن‌های صفحهٔ اول سایت',
    icon: LayoutDashboard,
    color: '#7c3aed',
  },
  {
    href: '/payment-manage',
    title: 'ماژول پرداخت',
    desc: 'درگاه سراسری، اهداف و پرداخت‌های فروشگاه / اخبار / کاریابی',
    icon: CreditCard,
    color: '#0f766e',
  },
  {
    href: '/adminshops',
    title: 'فروشگاه‌ها و تسویه',
    desc: 'مدیریت همه فروشگاه‌ها، کارمزد، و تسویه حساب با زیرمجموعه‌ها',
    icon: ShoppingBag,
    color: '#b45309',
  },
  {
    href: '/adminproducts',
    title: 'محصولات فروشگاه‌ها',
    desc: 'ویرایش کاتالوگ همه فروشگاه‌ها؛ قیمت، موجودی و تصاویر',
    icon: ShoppingBag,
    color: '#9a3412',
  },
  {
    href: '/admincategories',
    title: 'دسته‌بندی محصولات',
    desc: 'درخت دسته، تزریق قالب مشاغل (سوپرمارکت، پوشاک، لوازم خانگی و …)',
    icon: ShoppingBag,
    color: '#7c2d12',
  },
  {
    href: '/adminshop',
    title: 'طراحی فروشگاه',
    desc: 'چیدمان سینگل محصول، لیست فروشگاه و ویجت‌های ویترین',
    icon: ShoppingBag,
    color: '#c2410c',
  },
  {
    href: '/adminmodule',
    title: 'ماژول‌ها',
    desc: 'روشن و خاموش کردن قابلیت‌های سایت',
    icon: Boxes,
    color: '#2563eb',
  },
  {
    href: '/adminnews',
    title: 'اخبار',
    desc: 'چیدمان /news، سینگل خبر و ابزارهای خبری',
    icon: Newspaper,
    color: '#e67e22',
  },
  {
    href: '/adminkaryabi',
    title: 'کاریابی',
    desc: 'چیدمان سینگل آگهی و داده‌های سیستم کاریابی',
    icon: Briefcase,
    color: '#0d9488',
  },
]

const QUICK_LINKS = [
  { href: '/dashboard', label: 'داشبورد کارمندی', desc: 'خلاصه', icon: LayoutDashboard },
  { href: '/adminnews', label: 'چیدمان /news', desc: 'لیست اخبار', icon: Newspaper },
  { href: '/adminnews?tab=single', label: 'چیدمان سینگل خبر', desc: 'صفحه خبر', icon: FileText },
  { href: '/adminkaryabi', label: 'چیدمان سینگل آگهی', desc: 'کاریابی', icon: Briefcase },
  { href: '/adminsettings', label: 'چیدمان صفحه اصلی', desc: 'ویجت‌ها', icon: LayoutDashboard },
  { href: '/adminsettings?tab=corporate', label: 'ظاهر شرکتی', desc: 'هدر و منو', icon: PanelTop },
  { href: '/payment-manage', label: 'ماژول پرداخت', desc: 'درگاه و اهداف', icon: CreditCard },
  { href: '/adminshops', label: 'فروشگاه‌ها و تسویه', desc: 'حسابداری', icon: ShoppingBag },
  { href: '/adminproducts', label: 'محصولات فروشگاه‌ها', desc: 'ویرایش کاتالوگ', icon: ShoppingBag },
  { href: '/admincategories', label: 'دسته‌بندی محصولات', desc: 'درخت و قالب مشاغل', icon: ShoppingBag },
  { href: '/adminshop', label: 'طراحی فروشگاه', desc: 'سینگل و لیست', icon: ShoppingBag },
  { href: '/shop-manage', label: 'مدیریت محصولات', desc: 'کاتالوگ', icon: ShoppingBag },
  { href: '/product-single', label: 'تنظیمات سینگل محصول', desc: 'اجزای PDP', icon: ShoppingBag },
  { href: '/adminmodule', label: 'ماژول‌ها', desc: 'روشن/خاموش', icon: Boxes },
  { href: '/site-settings', label: 'تنظیمات سایت', desc: 'برند و SEO', icon: Settings2 },
  { href: '/menu-lists', label: 'فهرست‌های منو', desc: 'منوها', icon: List },
  { href: '/header-menu', label: 'منوی سایت', desc: 'ظاهر', icon: PanelTop },
  { href: '/hero-slider', label: 'هیرو', desc: 'اسلایدر', icon: Images },
  { href: '/ticker', label: 'نوار خبر', desc: 'تیتر', icon: Megaphone },
  { href: '/news-management', label: 'مدیریت اخبار', desc: 'محتوا', icon: Newspaper },
  { href: '/news-single', label: 'تنظیمات سینگل', desc: 'اجزای خبر', icon: FileText },
  { href: '/jobs-manage', label: 'آگهی‌ها', desc: 'کاریابی', icon: Briefcase },
  { href: '/job-single', label: 'سینگل آگهی', desc: 'اجزای آگهی', icon: Briefcase },
  { href: '/about-manage', label: 'درباره ما', desc: 'محتوا', icon: Info },
  { href: '/catalog-manage', label: 'کاتالوگ', desc: 'فلیپ‌بوک', icon: BookOpen },
  { href: '/videoinsta-manage', label: 'ویدیو', desc: 'استوری', icon: Images },
  { href: '/quiz-manage', label: 'آزمون', desc: 'سوالات', icon: Brain },
  { href: '/faq-manage', label: 'FAQ', desc: 'سوالات', icon: HelpCircle },
  { href: '/school-manage', label: 'مدرسه', desc: 'آموزش', icon: GraduationCap },
  { href: '/platform-connections', label: 'پیام‌رسان', desc: 'اتصالات', icon: Radio },
  { href: '/request-types', label: 'درخواست‌ها', desc: 'انواع', icon: Tags },
  { href: '/employees', label: 'کارمندان', desc: 'دسترسی', icon: Users },
  { href: '/sale', label: 'فروش', desc: 'لید', icon: ShoppingCart },
]

export default function AdminWebDashboardPage() {
  const gate = useOwnerGate('/adminweb')
  const { multiVendor } = useShopMode()
  const { getAuthHeaders } = useAuth()
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    active: 0,
    groups: 0,
  })
  const [newsStats, setNewsStats] = useState(null)

  const hubs = useMemo(
    () =>
      HUBS.map((h) => {
        if (h.href === '/adminshops') {
          return multiVendor
            ? h
            : {
                ...h,
                title: 'فروشگاه',
                desc: 'تنظیمات فروشگاه، نقشه، وضعیت باز/بسته و اطلاعات بانکی',
              }
        }
        if (h.href === '/adminproducts') {
          return multiVendor
            ? h
            : {
                ...h,
                title: 'محصولات',
                desc: 'ویرایش کاتالوگ فروشگاه؛ قیمت، موجودی و تصاویر',
              }
        }
        return h
      }),
    [multiVendor],
  )

  const quickLinks = useMemo(
    () =>
      QUICK_LINKS.map((l) => {
        if (l.href === '/adminshops') {
          return multiVendor
            ? l
            : { ...l, label: 'فروشگاه', desc: 'تنظیمات' }
        }
        if (l.href === '/adminproducts') {
          return multiVendor
            ? l
            : { ...l, label: 'محصولات', desc: 'کاتالوگ' }
        }
        return l
      }),
    [multiVendor],
  )

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { list, map } = await fetchSiteModules({ force: true })
        if (cancelled) return
        const total = list?.length || 0
        const active = Object.values(map || {}).filter(Boolean).length
        const groups = (list || []).filter(
          (m) =>
            m.is_group ||
            (!m.parent_key &&
              (list || []).some((c) => c.parent_key === m.key))
        ).length
        setModuleStats({ total, active, groups })
      } catch {
        if (!cancelled) setModuleStats({ total: 0, active: 0, groups: 0 })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gate.allowed])

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const url = Config.endpoints.news.stats()
        const res = await axios.get(url, { headers: getAuthHeaders() })
        if (!cancelled) setNewsStats(res.data?.data || res.data)
      } catch {
        if (!cancelled) setNewsStats(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gate.allowed, getAuthHeaders])

  const inactive = Math.max(0, moduleStats.total - moduleStats.active)
  const activePct =
    moduleStats.total > 0
      ? Math.round((moduleStats.active / moduleStats.total) * 100)
      : 0

  const newsBars = useMemo(() => {
    const s = newsStats || {}
    const rows = [
      { label: 'منتشرشده', value: Number(s.published || s.published_count || 0) },
      { label: 'پیش‌نویس', value: Number(s.draft || s.draft_count || 0) },
      { label: 'بازدید', value: Number(s.total_views || s.views || 0) },
      { label: 'کل اخبار', value: Number(s.total || s.count || 0) },
    ].filter((r) => r.value > 0)
    if (!rows.length) {
      return [
        { label: 'منتشرشده', value: 0 },
        { label: 'پیش‌نویس', value: 0 },
        { label: 'بازدید', value: 0 },
      ]
    }
    const max = Math.max(...rows.map((r) => r.value), 1)
    return rows.map((r) => ({ ...r, pct: Math.round((r.value / max) * 100) }))
  }, [newsStats])

  return (
    <OwnerPortalShell
      brand="web"
      brandAccent="admin"
      tagline="داشبورد ادمین کل پلتفرم"
      {...gate}
    >
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

      <div className={portalStyles.hubGrid}>
        {hubs.map((hub) => {
          const Icon = hub.icon
          return (
            <Link key={hub.href} href={hub.href} className={portalStyles.hubCard}>
              <span
                className={portalStyles.hubIcon}
                style={{ background: hub.color }}
              >
                <Icon size={20} />
              </span>
              <h2 className={portalStyles.hubTitle}>{hub.title}</h2>
              <p className={portalStyles.hubDesc}>{hub.desc}</p>
              <span
                className={portalStyles.hubGlow}
                style={{ background: hub.color }}
                aria-hidden
              />
            </Link>
          )
        })}
      </div>

      <div className={portalStyles.chartsRow}>
        <section className={portalStyles.chartCard}>
          <div className={portalStyles.chartHead}>
            <div>
              <h3 className={portalStyles.chartTitle}>وضعیت ماژول‌ها</h3>
              <p className={portalStyles.chartSub}>فعال در برابر کل</p>
            </div>
          </div>
          <div className={portalStyles.donutWrap}>
            <div
              className={portalStyles.donut}
              style={{ '--donut-pct': activePct }}
              role="img"
              aria-label={`${activePct} درصد فعال`}
            >
              <div className={portalStyles.donutCenter}>
                <span className={portalStyles.donutValue}>{activePct}٪</span>
                <span className={portalStyles.donutLabel}>فعال</span>
              </div>
            </div>
            <div className={portalStyles.legend}>
              <div className={portalStyles.legendRow}>
                <span className={portalStyles.legendLeft}>
                  <span
                    className={portalStyles.legendDot}
                    style={{ background: '#1a9a52' }}
                  />
                  فعال
                </span>
                <span className={portalStyles.legendVal}>
                  {moduleStats.active}
                </span>
              </div>
              <div className={portalStyles.legendRow}>
                <span className={portalStyles.legendLeft}>
                  <span
                    className={portalStyles.legendDot}
                    style={{ background: '#c5cad3' }}
                  />
                  خاموش
                </span>
                <span className={portalStyles.legendVal}>{inactive}</span>
              </div>
              <div className={portalStyles.legendRow}>
                <span className={portalStyles.legendLeft}>
                  <span
                    className={portalStyles.legendDot}
                    style={{ background: '#e8b800' }}
                  />
                  گروه
                </span>
                <span className={portalStyles.legendVal}>
                  {moduleStats.groups}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={portalStyles.chartCard}>
          <div className={portalStyles.chartHead}>
            <div>
              <h3 className={portalStyles.chartTitle}>نمای اخبار</h3>
              <p className={portalStyles.chartSub}>آمار نسبی محتوا</p>
            </div>
          </div>
          <div className={portalStyles.bars}>
            {newsBars.map((row) => (
              <div key={row.label} className={portalStyles.barRow}>
                <span className={portalStyles.barLabel}>{row.label}</span>
                <div className={portalStyles.barTrack}>
                  <div
                    className={portalStyles.barFill}
                    style={{ width: `${row.pct || 0}%` }}
                  />
                </div>
                <span className={portalStyles.barVal}>
                  {Number(row.value || 0).toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={portalStyles.sectionBlock} id="quick">
        <h2 className={portalStyles.sectionTitle}>
          <Sparkles size={16} />
          دسترسی سریع
        </h2>
        <div className={styles.linkGrid}>
          {quickLinks.map((item) => {
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
          <ul className={styles.phoneList}>
            {OWNER_PHONES.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone}`} dir="ltr" className={styles.phoneLink}>
                  {phone}
                </a>
                {normalizeIranMobile(gate.user?.mobile) ===
                  normalizeIranMobile(phone) && (
                  <span className={styles.activePill}>جلسه فعلی</span>
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
              داشبورد کارمندی
            </Link>
          </div>
        </section>
      </div>
    </OwnerPortalShell>
  )
}
