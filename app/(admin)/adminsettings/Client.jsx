// app/(admin)/adminsettings — طراحی قالب / فروشگاه / دیپلوی (تب‌محور)
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutTemplate,
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
import {
  getTemplateSystemPageNav,
  isTemplateSystemTab,
} from '@/components/Admin/templateSystemNav'
import {
  getShopDesignPageNav,
  isShopDesignTab,
} from '@/components/Admin/shopDesignNav'
import {
  getDeploySystemPageNav,
  isDeploySystemTab,
} from '@/components/Admin/deploySystemNav'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
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
import {
  MODULE_PAGE_DEFS,
  SHARED_INTERNAL_LAYOUT_KEY,
  SHARED_INTERNAL_LAYOUT_KEY_LEGACY,
  isSharedInternalLayoutKey,
} from '@/config/modulePageLayouts'
import ShopDesignEmbed from './ShopDesignEmbed'
import JobDesignEmbed from './JobDesignEmbed'
import NewsDesignEmbed from './NewsDesignEmbed'
import styles from '../adminweb/AdminWeb.module.css'

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
  { id: 'local', label: 'local_settings', icon: FileCode2 },
]

function visibleTabs(moduleMap) {
  return BASE_TABS.filter((t) => !t.moduleKey || !!moduleMap[t.moduleKey])
}

function resolveTab(raw, moduleMap) {
  // سفارشی‌سازی شرکتی حذف شد
  if (raw === 'corporate') return 'home'
  const allowed = visibleTabs(moduleMap).map((t) => t.id)
  if (allowed.includes(raw)) return raw
  return 'home'
}

function shellMeta(tab) {
  if (isDeploySystemTab(tab)) {
    return {
      title: 'دیپلوی',
      tagline: 'استقرار و تنظیمات محلی',
      nav: getDeploySystemPageNav('/adminsettings?tab=local'),
    }
  }
  if (isShopDesignTab(tab)) {
    const navActive =
      tab === 'checkout'
        ? '/adminsettings?tab=checkout'
        : '/adminsettings?tab=shop'
    return {
      title: 'طراحی فروشگاه',
      tagline: 'لیست، سینگل و مسیر خرید',
      nav: getShopDesignPageNav(navActive),
    }
  }
  if (tab === 'jobs' || tab === 'news') {
    return {
      title: tab === 'jobs' ? 'طراحی کاریابی' : 'طراحی اخبار',
      tagline: 'ابزار طراحی محتوا',
      nav: getTemplateSystemPageNav('/templatesystem'),
    }
  }
  const navActive =
    tab === 'pages'
      ? '/adminsettings?tab=pages'
      : tab === 'profile'
        ? '/adminsettings?tab=profile'
        : '/adminsettings'
  return {
    title: 'طراحی قالب',
    tagline: 'خانه، صفحات داخلی و پروفایل',
    nav: getTemplateSystemPageNav(navActive),
  }
}

export default function AdminSettingsPage() {
  const gate = useOwnerGate('/adminsettings')
  const router = useRouter()
  const { getAuthHeaders } = useAuth()
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [activePack, setActivePack] = useState(null)
  const [tab, setTab] = useState(() =>
    resolveTab(searchParams?.get('tab'), {}),
  )
  const pageFromQuery = searchParams?.get('page') || ''
  const [pageKey, setPageKey] = useState(() => {
    if (
      isSharedInternalLayoutKey(pageFromQuery) ||
      pageFromQuery === SHARED_INTERNAL_LAYOUT_KEY_LEGACY
    ) {
      return SHARED_INTERNAL_LAYOUT_KEY
    }
    if (MODULE_PAGE_DEFS.some((d) => d.key === pageFromQuery)) {
      return pageFromQuery
    }
    return SHARED_INTERNAL_LAYOUT_KEY
  })

  useEffect(() => {
    const next = resolveTab(searchParams?.get('tab'), moduleMap)
    setTab(next)
    const p = searchParams?.get('page') || ''
    if (isSharedInternalLayoutKey(p) || p === SHARED_INTERNAL_LAYOUT_KEY_LEGACY) {
      setPageKey(SHARED_INTERNAL_LAYOUT_KEY)
    } else if (MODULE_PAGE_DEFS.some((d) => d.key === p)) {
      setPageKey(p)
    }
  }, [searchParams, moduleMap])

  useEffect(() => {
    if (searchParams?.get('tab') === 'corporate') {
      router.replace('/adminsettings')
    }
  }, [searchParams, router])

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

  const isSharedPage = isSharedInternalLayoutKey(pageKey)
  const activePage = useMemo(() => {
    if (isSharedInternalLayoutKey(pageKey)) {
      return {
        key: SHARED_INTERNAL_LAYOUT_KEY,
        path: 'همه صفحات داخلی',
        label: 'چیدمان مشترک',
        desc:
          'هدر، منو و ویجت‌های مشترک — همه صفحات داخلی از این چیدمان پیروی می‌کنند (صفحه اصلی جداست)',
      }
    }
    return (
      MODULE_PAGE_DEFS.find((d) => d.key === pageKey) || MODULE_PAGE_DEFS[0]
    )
  }, [pageKey])

  const wide =
    tab === 'home' ||
    tab === 'pages' ||
    tab === 'shop' ||
    tab === 'jobs' ||
    tab === 'news'

  const meta = shellMeta(tab)

  const goProfile = () => {
    router.push('/adminsettings?tab=profile')
  }

  return (
    <OwnerPortalShell
      brand="settings"
      brandAccent="admin"
      tagline={meta.tagline}
      title={meta.title}
      wide={wide}
      pageNav={gate.allowed ? meta.nav : null}
      {...gate}
    >
      {gate.allowed ? (
        <>
          {activePack?.custom && isTemplateSystemTab(tab) ? (
            <DesignWizard
              packKey={activePack.key}
              packName={activePack.name}
              defaultOpen={searchParams?.get('wizard') === '1'}
              moduleMap={moduleMap}
            />
          ) : null}

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
                  <button
                    type="button"
                    className={`${styles.modulePagesItem} ${
                      isSharedPage ? styles.modulePagesItemOn : ''
                    }`}
                    onClick={() => setPageKey(SHARED_INTERNAL_LAYOUT_KEY)}
                  >
                    <strong>چیدمان مشترک</strong>
                    <small>همه صفحات داخلی</small>
                  </button>
                  {MODULE_PAGE_DEFS.map((p) => {
                    const on = !isSharedPage && p.key === activePage?.key
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
                    {isSharedPage ? (
                      <>
                        {activePage.desc}. از «طراحی قالب» هم می‌توانید با «اعمال
                        هدر و رنگ به همه» همین چیدمان را از صفحه اصلی پر کنید.
                      </>
                    ) : (
                      <>
                        {activePage.desc || ''} — بعد از ذخیره، چیدمان روی{' '}
                        <Link href={activePage.path} target="_blank">
                          {activePage.path}
                        </Link>{' '}
                        اعمال می‌شود. هدر مشترک از «چیدمان مشترک» می‌آید.
                        {activePage.key === 'reboserver' ? (
                          <>
                            {' '}
                            خبر فوری این صفحه از «چیدمان مشترک» می‌آید — همان
                            ویجتی که آنجا گذاشته‌اید روی /reboserver هم دیده
                            می‌شود.
                          </>
                        ) : null}
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
                              onClick={goProfile}
                            >
                              چیدمان پروفایل
                            </button>{' '}
                            بروید.
                          </>
                        ) : null}
                      </>
                    )}
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
          {tab === 'local' ? <LocalSettingsEditor /> : null}
        </>
      ) : null}
    </OwnerPortalShell>
  )
}
