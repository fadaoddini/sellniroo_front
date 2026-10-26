// app/(admin)/adminnews — چیدمان و ابزارهای اخبار
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FileText,
  Newspaper,
  LayoutTemplate,
  GalleryHorizontal,
  Star,
  FolderOpen,
  Radio,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'list', label: 'چیدمان /news', icon: Newspaper },
  { id: 'single', label: 'چیدمان سینگل خبر', icon: FileText },
]

const NEWS_LINKS = [
  { href: '/news-management', label: 'مدیریت اخبار', desc: 'محتوا', icon: Newspaper },
  { href: '/news-single', label: 'تنظیمات سینگل', desc: 'اجزای خبر', icon: FileText },
  { href: '/news-list', label: 'ویجت لیست مجله', desc: 'صفحه اصلی', icon: Newspaper },
  { href: '/news-latest', label: 'آخرین اخبار', desc: 'ویجت', icon: Newspaper },
  { href: '/news-recycler', label: 'ریسایکلرویو', desc: 'ویجت', icon: GalleryHorizontal },
  { href: '/news-featured-list', label: 'لیست ویژه', desc: 'ویجت', icon: Star },
  { href: '/news-by-category', label: 'اخبار یک دسته', desc: 'ویجت', icon: FolderOpen },
  { href: '/platform-connections', label: 'پیام‌رسان', desc: 'اتصالات', icon: Radio },
  { href: '/ticker', label: 'نوار خبر', desc: 'تیتر', icon: LayoutTemplate },
]

export default function AdminNewsPage() {
  const gate = useOwnerGate('/adminnews')
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [modulesReady, setModulesReady] = useState(false)
  const initialTab =
    searchParams?.get('tab') === 'single' ? 'single' : 'list'
  const [tab, setTab] = useState(initialTab)
  const newsKey = SITE_MODULE_KEYS.NEWS
  const newsKnown = Object.prototype.hasOwnProperty.call(moduleMap, newsKey)
  const newsOn = !modulesReady || !newsKnown || !!moduleMap[newsKey]

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { map } = await fetchSiteModules({ force: true })
        if (!cancelled) {
          setModuleMap(map || {})
          setModulesReady(true)
        }
      } catch {
        if (!cancelled) {
          setModuleMap({})
          setModulesReady(true)
        }
      }
    })()
    const onChange = () => {
      clearSiteModulesCache()
      fetchSiteModules({ force: true })
        .then(({ map }) => {
          setModuleMap(map || {})
          setModulesReady(true)
        })
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChange)
    }
  }, [gate.allowed])

  return (
    <OwnerPortalShell
      brand="news"
      brandAccent="admin"
      tagline="چیدمان لیست و سینگل اخبار"
      wide
      {...gate}
    >
      {gate.allowed && modulesReady && !newsOn ? (
        <div className={styles.section}>
          <p className={styles.moduleIntro}>
            ماژول اخبار خاموش است — چیدمان را می‌توانید بسازید؛ برای نمایش روی سایت از{' '}
            <Link href="/adminmodule">adminmodule</Link> روشن کنید.
          </p>
        </div>
      ) : null}

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

          {tab === 'list' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="news_list"
            />
          ) : null}
          {tab === 'single' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="news_single"
            />
          ) : null}
        </>
      ) : null}

      <section className={portalStyles.sectionBlock} style={{ marginTop: '1.25rem' }}>
        <h2 className={portalStyles.sectionTitle}>ابزارهای اخبار</h2>
        <div className={styles.linkGrid}>
          {NEWS_LINKS.map((item) => {
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
    </OwnerPortalShell>
  )
}
