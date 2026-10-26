// SiteChrome — هدر/فوتر و اسلات‌های سراسری؛ صفحه اصلی و سینگل خبر/آگهی فقط از صفحه‌ساز
'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import HeaderSlot from '@/components/modules/HeaderSlot'
import HeaderByMenuTopSlot from '@/components/modules/HeaderByMenuTopSlot'
import CorporateMobileNavSlot from '@/components/modules/CorporateMobileNavSlot'
import CorporateBrandBarSlot from '@/components/modules/CorporateBrandBarSlot'
import MobileBottomNavSlot from '@/components/modules/MobileBottomNavSlot'
import SiteFooterSlot from '@/components/modules/SiteFooterSlot'
import BreakingNewsSlot from '@/components/modules/BreakingNewsSlot'
import HeroSliderSlot from '@/components/modules/HeroSliderSlot'
import LayoutSection from '@/components/layout/LayoutSection'
import CartFab from '@/components/Shop/CartFab'

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

/**
 * @param {{ siteName?: string, children: React.ReactNode }} props
 */
export default function SiteChrome({ siteName = '', children }) {
  const pathname = usePathname()
  const home = isHomepagePath(pathname)
  const newsPath = isNewsSinglePath(pathname)
  const newsListPath = isNewsListPath(pathname)
  const jobPath = isJobSinglePath(pathname)
  const productPath = isProductSinglePath(pathname)
  const shopListPath = isShopListPath(pathname)
  const onCartPage = (pathname || '').replace(/\/+$/, '') === '/cart'

  /* صفحه اصلی، لیست/سینگل خبر، سینگل آگهی، فروشگاه: فقط صفحه‌ساز */
  if (home || newsPath || newsListPath || jobPath || productPath || shopListPath) {
    return (
      <>
        <main
          className={`siteMain siteMain--builder${
            newsPath ? ' siteMain--news-single' : ''
          }${newsListPath ? ' siteMain--news-list' : ''}${
            jobPath ? ' siteMain--job-single' : ''
          }${productPath ? ' siteMain--product-single' : ''}${
            shopListPath ? ' siteMain--shop-list' : ''
          }`}
        >
          {children}
        </main>
        {!onCartPage ? <CartFab /> : null}
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
      <LayoutSection widgetId="w_footer">
        <SiteFooterSlot siteName={siteName} />
      </LayoutSection>
      <LayoutSection widgetId="w_corp_mobile">
        <CorporateMobileNavSlot />
      </LayoutSection>
      <LayoutSection widgetId="w_job_mobile">
        <MobileBottomNavSlot />
      </LayoutSection>
      {!onCartPage ? <CartFab /> : null}
    </>
  )
}
