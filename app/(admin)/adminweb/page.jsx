// app/(admin)/adminweb — داشبورد ادمین کل (مالک پلتفرم)
'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Boxes,
  Newspaper,
  Briefcase,
  Settings2,
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
  AppWindow,
  Wrench,
  List,
  FileText,
  Phone,
  ExternalLink,
  CreditCard,
  Cloud,
  ShoppingBag,
  Radar,
  LayoutTemplate,
  Layers,
  Rocket,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS, isShopModuleOn } from '@/config/siteModules'
import {
  isOwnerNavItemVisible,
  isReboControlSite,
  normalizeIranMobile,
  OWNER_PHONES,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import axios from 'axios'
import styles from './AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

/**
 * هاب ربو: همهٔ ابزارها.
 * سایت‌های دیگر: فقط داشبورد / ماژول / طراحی قالب / طراحی فروشگاه (اگر shop) /
 * دیپلوی / پرداخت — بقیه فقط روی ربو.
 * reboOnly: فقط هاب ربو
 */
const GROUPS = [
  {
    id: 'design',
    title: 'طراحی',
    items: [
      { href: '/templatesystem', title: 'طراحی قالب', desc: 'خانه، صفحات، پروفایل', icon: LayoutTemplate, color: '#2c481e', tenant: true },
      { href: '/adminsettings?tab=pages', title: 'صفحات داخلی', desc: 'خبر فوری و منو', icon: Layers, color: '#2c481e', tenant: true },
      { href: '/shopdesign', title: 'طراحی فروشگاه', desc: 'لیست، سینگل، سبد', icon: ShoppingBag, color: '#2c481e', tenant: true, requireShop: true },
      { href: '/deploysystem', title: 'دیپلوی', desc: 'local_settings', icon: Rocket, color: '#2c481e', tenant: true },
      { href: '/adminsettings?tab=jobs', title: 'طراحی کاریابی', desc: 'آگهی و برد', icon: Briefcase, color: '#2c481e', reboOnly: true, moduleKey: SITE_MODULE_KEYS.JOB_BOARD },
      { href: '/adminsettings?tab=news', title: 'طراحی اخبار', desc: 'لیست و سینگل', icon: Newspaper, color: '#2c481e', reboOnly: true, moduleKey: SITE_MODULE_KEYS.NEWS },
      { href: '/site-settings', title: 'برند و SEO', desc: 'تنظیمات سایت', icon: Settings2, color: '#2c481e', reboOnly: true },
      { href: '/product-single', title: 'سینگل محصول', desc: 'اجزای PDP', icon: ShoppingBag, color: '#2c481e', reboOnly: true, moduleKey: SITE_MODULE_KEYS.SHOP },
    ],
  },
  {
    id: 'shop',
    title: 'فروشگاه و پرداخت',
    items: [
      { href: '/paymentsystem', title: 'تنظیمات پرداخت', desc: 'درگاه و اهداف', icon: CreditCard, color: '#2c481e', tenant: true },
      { href: '/adminsettings?tab=checkout', title: 'سفارش و سبد', desc: 'مراحل خرید', icon: ShoppingCart, color: '#2c481e', tenant: true, requireShop: true },
      { href: '/product-single', title: 'سینگل محصول', desc: 'اجزای PDP', icon: ShoppingBag, color: '#2c481e', reboOnly: true, moduleKey: SITE_MODULE_KEYS.SHOP },
    ],
  },
  {
    id: 'systems',
    title: 'سیستم‌ها',
    items: [
      { href: '/adminmodule', title: 'ماژول‌ها', desc: 'روشن و خاموش', icon: Boxes, color: '#2c481e', tenant: true },
      { href: '/dashboard', title: 'داشبورد کارمندی', desc: 'خلاصه', icon: LayoutDashboard, color: '#2c481e', tenant: true },
      { href: '/rebosystem', title: 'سیستم ربو', desc: 'آموزش، قیمت، مدیریت', icon: Layers, color: '#2c481e', reboOnly: true },
      { href: '/serversystem', title: 'سرور', desc: 'سایت، گیت، ابری', icon: Cloud, color: '#2c481e', reboOnly: true },
    ],
  },
  {
    id: 'content',
    title: 'محتوا و ابزار',
    reboOnly: true,
    items: [
      { href: '/news-management', title: 'مدیریت اخبار', desc: 'محتوا', icon: Newspaper, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.NEWS },
      { href: '/news-single', title: 'سینگل خبر', desc: 'اجزای خبر', icon: FileText, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.NEWS },
      { href: '/jobs-manage', title: 'آگهی‌ها', desc: 'کاریابی', icon: Briefcase, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.JOB_BOARD },
      { href: '/job-single', title: 'سینگل آگهی', desc: 'اجزای آگهی', icon: Briefcase, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.JOB_BOARD },
      { href: '/menu-lists', title: 'فهرست‌های منو', desc: 'منوها', icon: List, color: '#2c481e' },
      { href: '/header-menu', title: 'منوی سایت', desc: 'ظاهر', icon: PanelTop, color: '#2c481e' },
      { href: '/hero-slider', title: 'هیرو', desc: 'اسلایدر', icon: Images, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.HERO_SLIDER },
      { href: '/home-hero-manage', title: 'هیرو مدرسه', desc: 'اسلایدر مدرسه', icon: Images, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SCHOOL },
      { href: '/ticker', title: 'نوار خبر', desc: 'تیتر', icon: Megaphone, color: '#2c481e' },
      { href: '/about-manage', title: 'درباره ما', desc: 'محتوا', icon: Info, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.ABOUT_US },
      { href: '/catalog-manage', title: 'کاتالوگ', desc: 'فلیپ‌بوک', icon: BookOpen, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.CATALOG },
      { href: '/videoinsta-manage', title: 'ویدیو', desc: 'استوری', icon: Images, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.VIDEOINSTA },
      { href: '/quiz-manage', title: 'آزمون', desc: 'سوالات', icon: Brain, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.QUIZ },
      { href: '/faq-manage', title: 'FAQ', desc: 'سوالات', icon: HelpCircle, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.FAQ },
      { href: '/school-manage', title: 'مدرسه', desc: 'آموزش', icon: GraduationCap, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SCHOOL },
      { href: '/apps-manage', title: 'نرم‌افزارها', desc: 'دانلود', icon: AppWindow, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SOFTAPPS },
      { href: '/todoservice', title: 'میزکار سرویس', desc: 'مدیر / سرویسکار / مشتری', icon: Wrench, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.REPAIRS },
      { href: '/platform-connections', title: 'پیام‌رسان', desc: 'اتصالات', icon: Radio, color: '#2c481e' },
      { href: '/request-types', title: 'درخواست‌ها', desc: 'انواع', icon: Tags, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SALES_MARKETING },
      { href: '/employees', title: 'کارمندان', desc: 'دسترسی', icon: Users, color: '#2c481e' },
      { href: '/sale', title: 'فروش', desc: 'لید', icon: ShoppingCart, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SALES_MARKETING },
      { href: '/rasad', title: 'رصد', desc: 'روند استانی', icon: Radar, color: '#2c481e', moduleKey: SITE_MODULE_KEYS.SALES_MARKETING },
    ],
  },
]

function matchesQuery(item, q) {
  if (!q) return true
  const hay = `${item.title} ${item.desc} ${item.href}`.toLowerCase()
  return hay.includes(q)
}

/** کاشی‌های adminweb با توجه به هاب ربو / فروشگاه */
function isAdminWebItemForSite(item, moduleMap) {
  if (!item) return false
  const map = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  const reboHub = isReboControlSite(map)

  if (item.reboOnly && !reboHub) return false
  if (!reboHub && !item.tenant && !item.reboOnly) {
    // گروه محتوا فقط ربو
    return false
  }
  if (!reboHub && item.requireShop && !isShopModuleOn(map)) return false
  if (!reboHub && item.href && !isOwnerNavItemVisible(item.href, map)) {
    return false
  }

  if (reboHub) {
    const keys = []
    if (item.moduleKey) keys.push(item.moduleKey)
    if (Array.isArray(item.moduleKeys)) keys.push(...item.moduleKeys)
    if (!keys.length) return true
    if (!Object.keys(map).length) return false
    return keys.some((k) => {
      if (k === SITE_MODULE_KEYS.SHOP) return isShopModuleOn(map)
      return !!map[k]
    })
  }

  return true
}

function AdminWebDashboardInner() {
  const gate = useOwnerGate('/adminweb')
  const { getAuthHeaders } = useAuth()
  const [query, setQuery] = useState('')
  const [moduleMap, setModuleMap] = useState({})
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    active: 0,
    groups: 0,
  })
  const [newsStats, setNewsStats] = useState(null)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const reboHub = isReboControlSite(moduleMap)
    return GROUPS.filter((group) => !group.reboOnly || reboHub)
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            isAdminWebItemForSite(item, moduleMap) && matchesQuery(item, q),
        ),
      }))
      .filter((group) => group.items.length)
  }, [query, moduleMap])

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { list, map } = await fetchSiteModules({ force: true })
        if (cancelled) return
        setModuleMap(map || {})
        const total = list?.length || 0
        const active = Object.values(map || {}).filter(Boolean).length
        const groupsCount = (list || []).filter(
          (m) =>
            m.is_group ||
            (!m.parent_key &&
              (list || []).some((c) => c.parent_key === m.key)),
        ).length
        setModuleStats({ total, active, groups: groupsCount })
      } catch {
        if (!cancelled) {
          setModuleMap({})
          setModuleStats({ total: 0, active: 0, groups: 0 })
        }
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
    const palette = ['#2c481e', '#ab863d', '#6a7268', '#8f6e2f']
    const rows = [
      { label: 'منتشرشده', value: Number(s.published || s.published_count || 0) },
      { label: 'پیش‌نویس', value: Number(s.draft || s.draft_count || 0) },
      { label: 'بازدید', value: Number(s.total_views || s.views || 0) },
      { label: 'کل اخبار', value: Number(s.total || s.count || 0) },
    ]
    const max = Math.max(...rows.map((r) => r.value), 1)
    return rows.map((r, i) => ({
      ...r,
      pct: Math.round((r.value / max) * 100),
      color: palette[i % palette.length],
    }))
  }, [newsStats])

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="داشبورد مالک پلتفرم"
      title="داشبورد"
      wide
      {...gate}
    >
      <div className={styles.dashTopRow}>
        <div className={styles.statsStrip}>
          <div className={`${styles.statCard} ${styles.statForest}`}>
            <span className={styles.statValue}>{moduleStats.active}</span>
            <span className={styles.statLabel}>ماژول فعال</span>
          </div>
          <div className={`${styles.statCard} ${styles.statOlive}`}>
            <span className={styles.statValue}>{moduleStats.total}</span>
            <span className={styles.statLabel}>کل ماژول‌ها</span>
          </div>
          <div className={`${styles.statCard} ${styles.statSand}`}>
            <span className={styles.statValue}>{moduleStats.groups}</span>
            <span className={styles.statLabel}>مجموعهٔ گروهی</span>
          </div>
          <div className={`${styles.statCard} ${styles.statCream}`}>
            <span className={styles.statValue}>{activePct}٪</span>
            <span className={styles.statLabel}>نسبت فعال</span>
          </div>
        </div>

        <div className={styles.dashChartsCol}>
          <section
            className={`${portalStyles.chartCard} ${styles.dashChartForest}`}
          >
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
                      style={{ background: '#2c481e' }}
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
                      style={{ background: '#cfd5c8' }}
                    />
                    خاموش
                  </span>
                  <span className={portalStyles.legendVal}>{inactive}</span>
                </div>
                <div className={portalStyles.legendRow}>
                  <span className={portalStyles.legendLeft}>
                    <span
                      className={portalStyles.legendDot}
                      style={{ background: '#ab863d' }}
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

          <section
            className={`${portalStyles.chartCard} ${styles.dashChartNews}`}
          >
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
                      style={{
                        width: `${row.pct || 0}%`,
                        background: row.color,
                      }}
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
      </div>

      <div className={styles.dashToolbar}>
        <input
          className={styles.dashSearch}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی صفحه، ابزار یا تنظیمات…"
          aria-label="جستجوی داشبورد"
        />
      </div>

      {groups.length ? (
        <>
          {(groups.some((g) => g.id === 'design') ||
            groups.some((g) => g.id === 'shop')) && (
            <div className={styles.dashPair}>
              {['design', 'shop'].map((id) => {
                const group = groups.find((g) => g.id === id)
                if (!group) return null
                return (
                  <section
                    key={group.id}
                    className={`${styles.dashGroup} ${
                      group.id === 'design'
                        ? styles.dashGroupDesign
                        : styles.dashGroupShop
                    }`}
                  >
                    <div className={styles.dashGroupHead}>
                      <h2>{group.title}</h2>
                      <span>
                        {group.items.length.toLocaleString('fa-IR')} مورد
                      </span>
                    </div>
                    <div
                      className={`${styles.dashTiles} ${
                        group.id === 'design'
                          ? styles.dashTilesCols3
                          : styles.dashTilesCols2
                      }`}
                    >
                      {group.items.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={styles.dashTile}
                          >
                            <span className={styles.dashTileIcon}>
                              <Icon size={18} strokeWidth={2} />
                            </span>
                            <span className={styles.dashTileBody}>
                              <strong>{item.title}</strong>
                              {item.desc ? <em>{item.desc}</em> : null}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {groups
            .filter((g) => g.id !== 'design' && g.id !== 'shop')
            .map((group) => {
              const colsClass =
                group.id === 'systems'
                  ? styles.dashTilesCols5
                  : group.id === 'content'
                    ? styles.dashTilesCols6
                    : ''
              return (
                <section
                  key={group.id}
                  className={`${styles.dashGroup} ${
                    group.id === 'systems'
                      ? styles.dashGroupSystems
                      : group.id === 'content'
                        ? styles.dashGroupContent
                        : ''
                  }`}
                >
                  <div className={styles.dashGroupHead}>
                    <h2>{group.title}</h2>
                    <span>
                      {group.items.length.toLocaleString('fa-IR')} مورد
                    </span>
                  </div>
                  <div className={`${styles.dashTiles} ${colsClass}`}>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={styles.dashTile}
                        >
                          <span className={styles.dashTileIcon}>
                            <Icon size={18} strokeWidth={2} />
                          </span>
                          <span className={styles.dashTileBody}>
                            <strong>{item.title}</strong>
                            {item.desc ? <em>{item.desc}</em> : null}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
        </>
      ) : (
        <p className={styles.dashEmpty}>موردی با این جستجو پیدا نشد.</p>
      )}

      <div className={`${styles.split} ${styles.metaStrip}`} id="access">
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Phone size={16} />
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
            <ExternalLink size={16} />
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

export default function AdminWebDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminWebDashboardInner />
    </Suspense>
  )
}
