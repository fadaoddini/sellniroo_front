// app/(admin)/adminsettings — همهٔ طراحی قالب در یک جا
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LayoutTemplate,
  Palette,
  FileCode2,
  Layers,
  UserRound,
  ShoppingCart,
  Store,
  Briefcase,
  Newspaper,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import CorporateCustomizePanel from '../adminweb/CorporateCustomizePanel'
import LocalSettingsEditor from '../adminweb/LocalSettingsEditor'
import ProfileLayoutPanel from '../adminweb/ProfileLayoutPanel'
import CheckoutPipelinesPanel from '../adminweb/CheckoutPipelinesPanel'
import axios from 'axios'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import DesignWizard from '../adminweb/DesignWizard'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { MODULE_PAGE_DEFS } from '@/config/modulePageLayouts'
import ShopDesignEmbed from './ShopDesignEmbed'
import JobDesignEmbed from './JobDesignEmbed'
import NewsDesignEmbed from './NewsDesignEmbed'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const BASE_TABS = [
  { id: 'home', label: 'طراحی قالب', icon: LayoutTemplate },
  { id: 'pages', label: 'صفحات داخلی', icon: Layers },
  {
    id: 'shop',
    label: 'طراحی فروشگاه',
    icon: Store,
    moduleKey: SITE_MODULE_KEYS.SHOP,
  },
  {
    id: 'jobs',
    label: 'طراحی کاریابی',
    icon: Briefcase,
    moduleKey: SITE_MODULE_KEYS.JOB_BOARD,
  },
  {
    id: 'news',
    label: 'طراحی اخبار',
    icon: Newspaper,
    moduleKey: SITE_MODULE_KEYS.NEWS,
  },
  { id: 'profile', label: 'چیدمان پروفایل', icon: UserRound },
  { id: 'checkout', label: 'سفارش و سبد', icon: ShoppingCart },
  { id: 'corporate', label: 'سفارشی‌سازی شرکتی', icon: Palette },
  { id: 'local', label: 'local_settings', icon: FileCode2 },
]

function visibleTabs(moduleMap) {
  return BASE_TABS.filter((t) => !t.moduleKey || !!moduleMap[t.moduleKey])
}

function resolveTab(raw, moduleMap) {
  const allowed = visibleTabs(moduleMap).map((t) => t.id)
  if (allowed.includes(raw)) return raw
  return 'home'
}

export default function AdminSettingsPage() {
  const gate = useOwnerGate('/adminsettings')
  const { getAuthHeaders } = useAuth()
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [activePack, setActivePack] = useState(null)
  const tabs = useMemo(() => visibleTabs(moduleMap), [moduleMap])
  const [tab, setTab] = useState(() =>
    resolveTab(searchParams?.get('tab'), {}),
  )
  const pageFromQuery = searchParams?.get('page') || ''
  const [pageKey, setPageKey] = useState(() => {
    if (MODULE_PAGE_DEFS.some((d) => d.key === pageFromQuery)) {
      return pageFromQuery
    }
    return MODULE_PAGE_DEFS[0]?.key || 'repairs'
  })

  useEffect(() => {
    const next = resolveTab(searchParams?.get('tab'), moduleMap)
    setTab(next)
    const p = searchParams?.get('page') || ''
    if (MODULE_PAGE_DEFS.some((d) => d.key === p)) {
      setPageKey(p)
    }
  }, [searchParams, moduleMap])

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { map } = await fetchSiteModules({ force: true })
        if (!cancelled) setModuleMap(map || {})
        try {
          const packRes = await axios.get(
            Config.endpoints.news.topicPacks.list(),
            { headers: getAuthHeaders() },
          )
          const data = packRes.data?.data || {}
          const key = data.current_pack || ''
          const owner = (data.owner_systems || []).find((p) => p.key === key)
          if (!cancelled) {
            setActivePack(
              owner
                ? { key: owner.key, name: owner.name, custom: true }
                : key
                  ? { key, name: data.current_site_name || key, custom: false }
                  : null,
            )
          }
        } catch {
          if (!cancelled) setActivePack(null)
        }
      } catch {
        if (!cancelled) setModuleMap({})
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gate.allowed, getAuthHeaders])

  const activePage = useMemo(
    () => MODULE_PAGE_DEFS.find((d) => d.key === pageKey) || MODULE_PAGE_DEFS[0],
    [pageKey],
  )

  const wide =
    tab === 'home' ||
    tab === 'pages' ||
    tab === 'shop' ||
    tab === 'jobs' ||
    tab === 'news'

  return (
    <OwnerPortalShell
      brand="settings"
      brandAccent="admin"
      tagline="همهٔ طراحی قالب در یک صفحه"
      wide={wide}
      {...gate}
    >
      {gate.allowed ? (
        <>
          {activePack?.custom ? (
            <DesignWizard
              packKey={activePack.key}
              packName={activePack.name}
              defaultOpen={searchParams?.get('wizard') === '1'}
              moduleMap={moduleMap}
            />
          ) : null}
          <div className={portalStyles.tabsRow}>
            {tabs.map((t) => {
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
                      خانه را اینجا ویرایش کنید؛ صفحه باشگاه را از «صفحات داخلی»
                      و پروفایل را از «چیدمان پروفایل».
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
                        برای بخش‌ها به{' '}
                        <button
                          type="button"
                          className={styles.modulePagesHint}
                          style={{
                            display: 'inline',
                            padding: 0,
                            border: 0,
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: 800,
                          }}
                          onClick={() => setTab('profile')}
                        >
                          چیدمان پروفایل
                        </button>{' '}
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

          {tab === 'shop' ? <ShopDesignEmbed moduleMap={moduleMap} /> : null}
          {tab === 'jobs' ? <JobDesignEmbed moduleMap={moduleMap} /> : null}
          {tab === 'news' ? <NewsDesignEmbed moduleMap={moduleMap} /> : null}
          {tab === 'profile' ? <ProfileLayoutPanel /> : null}
          {tab === 'checkout' ? <CheckoutPipelinesPanel /> : null}
          {tab === 'corporate' ? <CorporateCustomizePanel /> : null}
          {tab === 'local' ? <LocalSettingsEditor /> : null}
        </>
      ) : null}
    </OwnerPortalShell>
  )
}
