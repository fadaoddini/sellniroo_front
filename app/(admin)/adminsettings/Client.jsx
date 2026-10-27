// app/(admin)/adminsettings — چیدمان صفحه اصلی + ظاهر + local_settings
'use client'

import React, { useEffect, useState } from 'react'
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
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import CorporateCustomizePanel from '../adminweb/CorporateCustomizePanel'
import LocalSettingsEditor from '../adminweb/LocalSettingsEditor'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'home', label: 'چیدمان صفحه اصلی', icon: LayoutTemplate },
  { id: 'corporate', label: 'سفارشی‌سازی شرکتی', icon: Palette },
  { id: 'local', label: 'local_settings', icon: FileCode2 },
]

const SETTING_LINKS = [
  { href: '/payment-manage', label: 'ماژول پرداخت', desc: 'درگاه سراسری', icon: CreditCard },
  { href: '/site-settings', label: 'تنظیمات سایت', desc: 'برند و SEO', icon: Settings2 },
  { href: '/header-menu', label: 'منوی سایت', desc: 'لینک و ظاهر', icon: PanelTop },
  { href: '/menu-lists', label: 'فهرست‌های منو', desc: 'منوها', icon: List },
  { href: '/hero-slider', label: 'اسلایدر هیرو', desc: 'تصاویر', icon: Images },
]

function resolveTab(raw) {
  if (raw === 'corporate' || raw === 'local' || raw === 'home') return raw
  return 'home'
}

export default function AdminSettingsPage() {
  const gate = useOwnerGate('/adminsettings')
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [tab, setTab] = useState(() =>
    resolveTab(searchParams?.get('tab'))
  )

  useEffect(() => {
    const next = resolveTab(searchParams?.get('tab'))
    setTab(next)
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

  return (
    <OwnerPortalShell
      brand="settings"
      brandAccent="admin"
      tagline="چیدمان صفحه اصلی، ظاهر شرکتی و تنظیمات محلی"
      wide={tab === 'home'}
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
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="home"
            />
          ) : null}
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
