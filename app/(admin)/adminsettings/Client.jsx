// app/(admin)/adminsettings — چیدمان صفحه اصلی + صفحات داخلی + ظاهر + local_settings
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LayoutTemplate,
  Palette,
  FileCode2,
  Settings2,
  PanelTop,
  List,
  Images,
  CreditCard,
  Layers,
  UserRound,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import CorporateCustomizePanel from '../adminweb/CorporateCustomizePanel'
import LocalSettingsEditor from '../adminweb/LocalSettingsEditor'
import ProfileLayoutPanel from '../adminweb/ProfileLayoutPanel'
import CheckoutPipelinesPanel from '../adminweb/CheckoutPipelinesPanel'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { MODULE_PAGE_DEFS } from '@/config/modulePageLayouts'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'home', label: 'چیدمان صفحه اصلی', icon: LayoutTemplate },
  { id: 'pages', label: 'صفحات داخلی', icon: Layers },
  { id: 'profile', label: 'چیدمان پروفایل', icon: UserRound },
  { id: 'checkout', label: 'سفارش و سبد', icon: ShoppingCart },
  { id: 'corporate', label: 'سفارشی‌سازی شرکتی', icon: Palette },
  { id: 'local', label: 'local_settings', icon: FileCode2 },
]

const SETTING_LINKS = [
  { href: '/payment-manage', label: 'ماژول پرداخت', desc: 'درگاه سراسری', icon: CreditCard },
  { href: '/site-settings', label: 'تنظیمات سایت', desc: 'برند و SEO', icon: Settings2 },
  { href: '/header-menu', label: 'منوی سایت', desc: 'لینک و ظاهر', icon: PanelTop },
  { href: '/menu-lists', label: 'فهرست‌های منو', desc: 'منوها', icon: List },
  { href: '/hero-slider', label: 'اسلایدر هیرو', desc: 'تصاویر', icon: Images },
  {
    href: '/adminmodule?tab=templates',
    label: 'موتور و بسته‌ها',
    desc: 'اعمال / اعمال مجدد قالب باشگاه',
    icon: Sparkles,
  },
  {
    href: '/adminsettings?tab=pages&page=gym_bodybuilding',
    label: 'چیدمان صفحه باشگاه',
    desc: 'پروفایل باشگاه /gym/profile',
    icon: Layers,
  },
]

function resolveTab(raw) {
  if (
    raw === 'corporate' ||
    raw === 'local' ||
    raw === 'home' ||
    raw === 'pages' ||
    raw === 'profile' ||
    raw === 'checkout'
  ) {
    return raw
  }
  return 'home'
}

export default function AdminSettingsPage() {
  const gate = useOwnerGate('/adminsettings')
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [tab, setTab] = useState(() =>
    resolveTab(searchParams?.get('tab'))
  )
  const pageFromQuery = searchParams?.get('page') || ''
  const [pageKey, setPageKey] = useState(() => {
    if (MODULE_PAGE_DEFS.some((d) => d.key === pageFromQuery)) {
      return pageFromQuery
    }
    return MODULE_PAGE_DEFS[0]?.key || 'repairs'
  })

  useEffect(() => {
    const next = resolveTab(searchParams?.get('tab'))
    setTab(next)
    const p = searchParams?.get('page') || ''
    if (MODULE_PAGE_DEFS.some((d) => d.key === p)) {
      setPageKey(p)
    }
  }, [searchParams])

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { map } = await fetchSiteModules({ force: true })
        if (!cancelled) setModuleMap(map || {})
      } catch {
        if (!cancelled) setModuleMap({})
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gate.allowed])

  const activePage = useMemo(
    () => MODULE_PAGE_DEFS.find((d) => d.key === pageKey) || MODULE_PAGE_DEFS[0],
    [pageKey],
  )

  const wide = tab === 'home' || tab === 'pages'

  return (
    <OwnerPortalShell
      brand="settings"
      brandAccent="admin"
      tagline="چیدمان صفحه اصلی، صفحات داخلی، پروفایل، سفارش و سبد، ظاهر شرکتی و تنظیمات محلی"
      wide={wide}
      {...gate}
    >
      {gate.allowed ? (
        <>
          <div className={portalStyles.tabsRow}>
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${portalStyles.tabBtn} ${
                    tab === t.id ? portalStyles.tabBtnOn : ''
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {tab === 'home' ? (
            <>
              {moduleMap?.data_pack_gym_bodybuilding_theme_one ? (
                <div className={styles.tplExclusiveBanner} role="status">
                  <div>
                    <strong>قالب باشگاه بدنسازی فعال است</strong>
                    <span>
                      مثل ربو با یک کلیک نصب شده: خانه را اینجا ویرایش کنید؛
                      صفحه باشگاه و پروفایل را از تب‌های «صفحات داخلی» و «چیدمان
                      پروفایل» مدیریت کنید. اعمال مجدد از{' '}
                      <Link href="/adminmodule?tab=templates">موتور و بسته‌ها</Link>.
                    </span>
                  </div>
                </div>
              ) : null}
              <SiteSkeletonStudio
                moduleMap={moduleMap}
                standalone
                layoutMode="home"
              />
            </>
          ) : null}

          {tab === 'pages' ? (
            <div className={styles.modulePagesLayout}>
              <aside className={styles.modulePagesAside} aria-label="صفحات داخلی">
                <p className={styles.modulePagesAsideTitle}>صفحه را انتخاب کنید</p>
                <div className={styles.modulePagesList}>
                  {MODULE_PAGE_DEFS.map((p) => {
                    const on = p.key === activePage?.key
                    const moduleOn = !!moduleMap[p.moduleKey]
                    return (
                      <button
                        key={p.key}
                        type="button"
                        className={`${styles.modulePagesItem} ${
                          on ? styles.modulePagesItemOn : ''
                        }`}
                        onClick={() => setPageKey(p.key)}
                      >
                        <strong>{p.label}</strong>
                        <small dir="ltr">{p.path}</small>
                        {!moduleOn ? (
                          <em className={styles.modulePagesOff}>ماژول خاموش</em>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
                {activePage ? (
                  <p className={styles.modulePagesHint}>
                    {activePage.desc || ''} — بعد از ذخیره، چیدمان روی{' '}
                    <Link href={activePage.path} target="_blank">
                      {activePage.path}
                    </Link>{' '}
                    اعمال می‌شود.
                    {activePage.key === 'profile' ? (
                      <>
                        {' '}
                        برای بخش‌ها و سیستم اصلی به{' '}
                        <Link href="/adminsettings?tab=profile">
                          چیدمان پروفایل
                        </Link>{' '}
                        بروید.
                      </>
                    ) : null}
                  </p>
                ) : null}
              </aside>
              <div className={styles.modulePagesStudio}>
                {activePage ? (
                  <SiteSkeletonStudio
                    key={activePage.key}
                    moduleMap={moduleMap}
                    standalone
                    layoutMode={`module:${activePage.key}`}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === 'profile' ? <ProfileLayoutPanel /> : null}
          {tab === 'checkout' ? <CheckoutPipelinesPanel /> : null}
          {tab === 'corporate' ? <CorporateCustomizePanel /> : null}
          {tab === 'local' ? <LocalSettingsEditor /> : null}
        </>
      ) : null}

      <section
        className={portalStyles.sectionBlock}
        style={{ marginTop: '1.25rem' }}
      >
        <h2 className={portalStyles.sectionTitle}>میانبر تنظیمات</h2>
        <div className={styles.linkGrid}>
          {SETTING_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.linkCard}
              >
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
    </OwnerPortalShell>
  )
}
