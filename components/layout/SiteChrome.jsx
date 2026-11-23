// SiteChrome — هدر/فوتر و اسلات‌های سراسری؛ صفحه اصلی و سینگل خبر/آگهی فقط از صفحه‌ساز
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import HeaderSlot from '@/components/modules/HeaderSlot'
import HeaderByMenuTopSlot from '@/components/modules/HeaderByMenuTopSlot'
import CorporateMobileNavSlot from '@/components/modules/CorporateMobileNavSlot'
import CorporateBrandBarSlot from '@/components/modules/CorporateBrandBarSlot'
import MobileBottomNavSlot from '@/components/modules/MobileBottomNavSlot'
import SiteFooter from '@/components/common/SiteFooter'
import BreakingNewsSlot from '@/components/modules/BreakingNewsSlot'
import HeroSliderSlot from '@/components/modules/HeroSliderSlot'
import LayoutSection from '@/components/layout/LayoutSection'
import { fetchSiteSettings } from '@/services/siteSettings'
import { isSadraAppShell, SADRA_APP_BG } from '@/config/sadraTheme'
import ModulePageShell from '@/components/layout/ModulePageShell'
import {
  getModulePageDef,
  getModulePageDefForPath,
  pageKeepsOwnChrome,
} from '@/config/modulePageLayouts'
import { fetchSiteModules } from '@/services/siteModules'

function isHomepagePath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || '/'
  return p === '/' || p === ''
}

function isNewsSinglePath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return /^\/news\/[^/]+$/.test(p)
}

function isNewsListPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/news'
}

function isVideosListPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/videos'
}

function isJobSinglePath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return /^\/jobs\/[^/]+$/.test(p)
}

function isProductSinglePath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return /^\/shop\/products\/[^/]+$/.test(p)
}

function isShopListPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/shop'
}

function isBarePresentationPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/mosharekat' || p.startsWith('/preview/system/')
}

function isCartPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/cart'
}

/**
 * صفحات داخلی ماژول — هدر از چیدمان خودشان، نه اسلات سراسری سایت.
 * /news فقط وقتی کروم اختصاصی مدرسه روشن است ماژول‌شِل می‌شود؛
 * وگرنه از news_list_layout (کاریابی و بقیه) استفاده می‌کند.
 * /gym/* بدون def جدا: فقط حالت builder (شل داخل layout خود صفحه است).
 */
function resolveModuleBuilderDef(pathname, schoolNewsOwnChrome) {
  if (!pathname) return { def: null, builder: false }
  const p = pathname.replace(/\/+$/, '') || ''
  const def = getModulePageDefForPath(p)
  if (def) {
    if (def.key === 'news' && !schoolNewsOwnChrome) {
      return { def: null, builder: false }
    }
    return { def, builder: true }
  }
  if (p === '/gym' || p.startsWith('/gym/')) {
    return { def: null, builder: true }
  }
  return { def: null, builder: false }
}

/**
 * @param {{ siteName?: string, children: React.ReactNode }} props
 */
export default function SiteChrome({ siteName = '', children }) {
  const pathname = usePathname()
  const home = isHomepagePath(pathname)
  const newsPath = isNewsSinglePath(pathname)
  const newsListPath = isNewsListPath(pathname)
  const videosListPath = isVideosListPath(pathname)
  const jobPath = isJobSinglePath(pathname)
  const productPath = isProductSinglePath(pathname)
  const shopListPath = isShopListPath(pathname)
  const barePresentation = isBarePresentationPath(pathname)
  const cartPath = isCartPath(pathname)
  const [appShell, setAppShell] = useState(() => isSadraAppShell(null, siteName))
  /** قالب مدرسه: /news از ModulePageShell با کروم اختصاصی */
  const [schoolNewsOwnChrome, setSchoolNewsOwnChrome] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await fetchSiteSettings({ force: false })
        if (!cancelled) setAppShell(isSadraAppShell(s, siteName))
      } catch {
        if (!cancelled) setAppShell(isSadraAppShell(null, siteName))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [siteName])

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      fetchSiteModules({ force: false })
        .then(({ map }) => {
          if (cancelled) return
          setSchoolNewsOwnChrome(
            pageKeepsOwnChrome(getModulePageDef('news'), map || {}),
          )
        })
        .catch(() => {
          if (!cancelled) setSchoolNewsOwnChrome(false)
        })
    }
    refresh()
    window.addEventListener('site-modules-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', refresh)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    if (!appShell) {
      document.body.classList.remove('sadra-app-shell')
      return undefined
    }
    document.body.classList.add('sadra-app-shell')
    document.documentElement.style.setProperty('--sadra-app-bg', SADRA_APP_BG)
    return () => {
      document.body.classList.remove('sadra-app-shell')
    }
  }, [appShell])

  /* پروپوزال / پیش‌نمایش سیستم: بدون هدر/منوی سایت */
  if (barePresentation) {
    const systemPreview = String(pathname || '').startsWith('/preview/system/')
    return (
      <>
        <main className="siteMain siteMain--bare">{children}</main>
        {systemPreview ? null : <SiteFooter />}
      </>
    )
  }

  const { def: moduleDef, builder: moduleBuilder } = resolveModuleBuilderDef(
    pathname,
    schoolNewsOwnChrome,
  )

  const withModuleChrome = (node) => {
    if (!moduleDef) return node
    return (
      <ModulePageShell pageKey={moduleDef.key}>{node}</ModulePageShell>
    )
  }

  /* سبد خرید: بدون هیرو/برندبار — فقط هدر دسکتاپ + منوی پایین موبایل */
  if (cartPath) {
    return (
      <>
        <LayoutSection widgetId="w_header_menu">
          <HeaderByMenuTopSlot />
        </LayoutSection>
        <main className="siteMain siteMain--cart">{children}</main>
        <SiteFooter />
        <LayoutSection widgetId="w_corp_mobile">
          <CorporateMobileNavSlot />
        </LayoutSection>
      </>
    )
  }

  /* صفحه اصلی، لیست/سینگل، فروشگاه، صفحات داخلی ماژول: صفحه‌ساز + فوتر ربو
   * /news در قالب مدرسه → ModulePageShell؛ در کاریابی → news_list_layout مستقیم */
  if (
    home ||
    newsPath ||
    newsListPath ||
    videosListPath ||
    jobPath ||
    productPath ||
    shopListPath ||
    moduleBuilder
  ) {
    return (
      <>
        <main
          className={`siteMain siteMain--builder${
            newsPath ? ' siteMain--news-single' : ''
          }${newsListPath || videosListPath ? ' siteMain--news-list' : ''}${
            jobPath ? ' siteMain--job-single' : ''
          }${productPath ? ' siteMain--product-single' : ''}${
            shopListPath ? ' siteMain--shop-list' : ''
          }${moduleBuilder ? ' siteMain--module-page' : ''}`}
        >
          {moduleBuilder ? withModuleChrome(children) : children}
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <LayoutSection widgetId="w_breaking_news">
        <BreakingNewsSlot />
      </LayoutSection>
      {/* استوری فقط از ویجت صفحه‌ساز — نه به‌صورت سراسری */}
      <LayoutSection widgetId="w_brand_bar">
        <CorporateBrandBarSlot />
      </LayoutSection>
      <LayoutSection widgetId="w_hero">
        <HeroSliderSlot />
      </LayoutSection>
      <LayoutSection widgetId="w_header_menu">
        <HeaderByMenuTopSlot />
      </LayoutSection>
      <LayoutSection widgetId="w_job_header">
        <HeaderSlot />
      </LayoutSection>
      <main className="siteMain">{children}</main>
      <SiteFooter />
      <LayoutSection widgetId="w_corp_mobile">
        <CorporateMobileNavSlot />
      </LayoutSection>
      <LayoutSection widgetId="w_job_mobile">
        <MobileBottomNavSlot />
      </LayoutSection>
    </>
  )
}
