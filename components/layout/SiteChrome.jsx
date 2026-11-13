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
  return p === '/mosharekat'
}

function isCartPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return p === '/cart'
}

/** صفحات داخلی ماژول — هدر از چیدمان خودشان (همگام با صفحه اصلی) */
function isModuleBuilderPath(pathname) {
  if (!pathname) return false
  const p = pathname.replace(/\/+$/, '') || ''
  return (
    p === '/profile' ||
    p === '/repairs' ||
    p === '/apps' ||
    p === '/booking' ||
    p === '/about' ||
    p === '/contact' ||
    p === '/quiz' ||
    p === '/sale' ||
    p === '/school' ||
    p === '/gym' ||
    p.startsWith('/gym/')
  )
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

  /* پروپوزال مشارکت: بدون هدر/منو — فوتر ربو می‌ماند */
  if (barePresentation) {
    return (
      <>
        <main className="siteMain siteMain--bare">{children}</main>
        <SiteFooter />
      </>
    )
  }

  const moduleBuilder = isModuleBuilderPath(pathname)

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

  /* صفحه اصلی، لیست/سینگل، فروشگاه، صفحات داخلی ماژول: صفحه‌ساز + فوتر ربو */
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
          {children}
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
