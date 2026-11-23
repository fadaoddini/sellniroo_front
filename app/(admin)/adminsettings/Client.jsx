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
  PanelTop,
  Menu,
  PanelBottom,
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
  isModulePageModuleOn,
  SHARED_INTERNAL_LAYOUT_KEY_LEGACY,
  isSharedInternalLayoutKey,
} from '@/config/modulePageLayouts'
import { isReboControlSite } from '@/utils/ownerAccess'
import ShopDesignEmbed from './ShopDesignEmbed'
import JobDesignEmbed from './JobDesignEmbed'
import NewsDesignEmbed from './NewsDesignEmbed'
import styles from '../adminweb/AdminWeb.module.css'

const BASE_TABS = [
  { id: 'header', label: 'هدر بالا', icon: PanelTop },
  { id: 'menu', label: 'منوی بالا', icon: Menu },
  { id: 'home', label: 'صفحه اصلی', icon: LayoutTemplate },
  { id: 'pages', label: 'صفحات داخلی', icon: Layers },
  { id: 'footer', label: 'فوتر', icon: PanelBottom },
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
  {
    id: 'checkout',
    label: 'سفارش و سبد',
    icon: ShoppingCart,
    moduleKey: SITE_MODULE_KEYS.SHOP,
  },
  { id: 'local', label: 'local_settings', icon: FileCode2 },
]

function visibleTabs(moduleMap) {
  const reboHub = isReboControlSite(moduleMap)
  return BASE_TABS.filter((t) => {
    if (t.moduleKey && !moduleMap[t.moduleKey]) return false
    // طراحی کاریابی/اخبار فقط روی هاب ربو در پورتال مالک
    if (!reboHub && (t.id === 'jobs' || t.id === 'news')) return false
    return true
  })
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
      : tab === 'header'
        ? '/adminsettings?tab=header'
        : tab === 'menu'
          ? '/adminsettings?tab=menu'
          : tab === 'footer'
            ? '/adminsettings?tab=footer'
            : tab === 'profile'
              ? '/adminsettings?tab=profile'
              : '/adminsettings'
  return {
    title: 'طراحی قالب',
    tagline: 'هدر، منو، خانه، صفحات داخلی و فوتر',
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
    if (MODULE_PAGE_DEFS.some((d) => d.key === pageFromQuery)) {
      return pageFromQuery
    }
    return MODULE_PAGE_DEFS[0]?.key || 'profile'
  })

  useEffect(() => {
    const next = resolveTab(searchParams?.get('tab'), moduleMap)
    setTab(next)
    const p = searchParams?.get('page') || ''
    if (MODULE_PAGE_DEFS.some((d) => d.key === p)) {
      setPageKey(p)
    } else if (
      isSharedInternalLayoutKey(p) ||
      p === SHARED_INTERNAL_LAYOUT_KEY_LEGACY
    ) {
      setPageKey(MODULE_PAGE_DEFS[0]?.key || 'profile')
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

  const isSharedPage = false
  const activePage = useMemo(
    () => MODULE_PAGE_DEFS.find((d) => d.key === pageKey) || MODULE_PAGE_DEFS[0],
    [pageKey],
  )

  const wide =
    tab === 'home' ||
    tab === 'header' ||
    tab === 'menu' ||
    tab === 'footer' ||
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

          {tab === 'header' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="chrome:header"
            />
          ) : null}

          {tab === 'menu' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="chrome:menu"
            />
          ) : null}

          {tab === 'footer' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="chrome:footer"
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
                  {MODULE_PAGE_DEFS.map((p) => {
                    const on = p.key === activePage?.key && !isSharedPage
                    const moduleOn = isModulePageModuleOn(p, moduleMap)
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
                {activePage && !isSharedPage ? (
                  <p className={styles.modulePagesHint}>
                    {activePage.desc || ''} — هدر و منو را با سوییچ بالای بوم
                    روشن کنید تا از تب‌های «هدر بالا» و «منوی بالا» بیایند. بعد
                    از ذخیره روی{' '}
                    <Link href={activePage.path} target="_blank">
                      {activePage.path}
                    </Link>{' '}
                    اعمال می‌شود.
                    {activePage.key === 'profile' ? (
                      <>
                        {' '}
                        برای بخش‌های پروفایل به{' '}
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
                  </p>
                ) : null}
              </aside>
              <div className={styles.modulePagesStudio}>
                {activePage && !isSharedPage ? (
                  <SiteSkeletonStudio
                    key={activePage.key}
                    moduleMap={moduleMap}
                    standalone
                    layoutMode={`module:${activePage.key}`}
                  />
                ) : (
                  <SiteSkeletonStudio
                    key={MODULE_PAGE_DEFS[0]?.key || 'profile'}
                    moduleMap={moduleMap}
                    standalone
                    layoutMode={`module:${MODULE_PAGE_DEFS[0]?.key || 'profile'}`}
                  />
                )}
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
