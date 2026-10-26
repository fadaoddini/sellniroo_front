// PageBuilderRenderer — رندر زنده rows/columns/widgets صفحه اصلی / سینگل
'use client'

import React, { useEffect, useState } from 'react'
import {
  isJobBoardWidgetType,
  normalizeJobBoardWidgetSettings,
} from '@/config/jobBoardWidgetSettings'
import {
  isShopWidgetType,
  normalizeShopWidgetSettings,
} from '@/config/shopWidgetSettings'
import {
  JobFullBoardWidget,
  JobCardsStripWidget,
  JobSearchBarWidget,
  JobCategoriesGridWidget,
  VerifiedCompaniesWidget,
  PublicResumesWidget,
  JobQuickFiltersWidget,
  JobStatsStripWidget,
  JobHeaderBarWidget,
  JobBottomNavWidget,
} from '@/components/widgets/jobs/JobSystemWidgets'
import {
  ShopProductsStripWidget,
  ProductStoriesWidget,
  ShopSearchBarWidget,
  ShopCategoriesWidget,
} from '@/components/widgets/shop/ShopProductWidgets'
import CTASectionSlot from '@/components/modules/CTASectionSlot'
import VideoInstaSlot from '@/components/modules/VideoInstaSlot'
import CatalogSlot from '@/components/modules/CatalogSlot'
import HeroSliderSlot from '@/components/modules/HeroSliderSlot'
import BreakingNewsSlot from '@/components/modules/BreakingNewsSlot'
import CorporateBrandBarSlot from '@/components/modules/CorporateBrandBarSlot'
import ModuleGate from '@/components/modules/ModuleGate'
import NavBarWidget from '@/components/layout/NavBarWidget'
import LatestNewsWidget from '@/components/widgets/LatestNewsWidget'
import NewsListMagazineWidget from '@/components/widgets/NewsListMagazineWidget'
import FeaturedNewsSliderWidget from '@/components/widgets/FeaturedNewsSliderWidget'
import SiteTopNavWidget from '@/components/widgets/SiteTopNavWidget'
import PostJobButtonWidget from '@/components/widgets/PostJobButtonWidget'
import PersianDateTimeWidget from '@/components/widgets/PersianDateTimeWidget'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { widgetMeta } from '@/config/pageBuilderWidgets'
import {
  getNewsWidgetVariant,
  normalizeNewsWidgetSettings,
} from '@/config/newsWidgetSettings'
import { normalizeCtaWidgetSettings } from '@/config/ctaWidgetSettings'
import {
  isNavWidgetType,
  normalizeNavWidgetSettings,
} from '@/config/navWidgetSettings'
import {
  isSiteTopNavWidgetType,
  normalizeSiteTopNavSettings,
} from '@/config/siteTopNavWidgetSettings'
import { normalizeHomeLayout } from '@/config/homeLayout'
import {
  isSliderWidgetType,
  normalizeSliderWidgetSettings,
} from '@/config/sliderWidgetSettings'
import styles from './PageBuilder.module.css'

function VideoInstaWidget({ type, settings }) {
  /* story / story_circles = نوار دایره‌ای · بقیه = آرشیو کامل */
  const rail =
    type === 'story' || type === 'story_circles' || type === 'featured_video'
  return (
    <VideoInstaSlot
      variant={rail ? 'rail' : 'section'}
      settings={settings}
    />
  )
}

function LogoWidget() {
  return (
    <div className={styles.simpleWidget}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" alt="لوگو" className={styles.logoImg} />
    </div>
  )
}

function PlaceholderWidget({ type }) {
  const meta = widgetMeta(type)
  return (
    <div className={styles.placeholder}>
      <strong>{meta?.label || type}</strong>
      <span>به‌زودی در سایت فعال می‌شود</span>
    </div>
  )
}

function SpacerWidget() {
  return <div className={styles.spacer} aria-hidden />
}

function TextWidget({ settings }) {
  const text = settings?.text || ''
  if (!text) return null
  return <div className={styles.textBlock}>{text}</div>
}

/**
 * در سکشن چندستونه، breakout با 100vw از وسط ستون اشتباه می‌شود.
 * پس full-bleed را موقتاً خاموش می‌کنیم تا ویجت عرض ستون خودش را پر کند.
 */
function settingsForColumn(instance, constrainBleed) {
  const raw =
    instance?.settings && typeof instance.settings === 'object'
      ? { ...instance.settings }
      : {}
  if (!constrainBleed) return raw

  if (isNavWidgetType(instance.type)) {
    raw.bar_full_bleed = false
    if (raw.mobile && typeof raw.mobile === 'object') {
      raw.mobile = { ...raw.mobile, bar_full_bleed: false }
    }
  }
  if (isSiteTopNavWidgetType(instance.type)) {
    raw.full_bleed = false
    if (raw.mobile && typeof raw.mobile === 'object') {
      raw.mobile = { ...raw.mobile, full_bleed: false }
    }
  }
  if (isSliderWidgetType(instance.type)) {
    raw.full_bleed = false
    if (raw.mobile && typeof raw.mobile === 'object') {
      raw.mobile = { ...raw.mobile, full_bleed: false }
    }
  }
  if (instance.type === 'latest_news_recycler') {
    raw.recycler_section_full = false
  }
  if (instance.type === 'cta_contact') {
    raw.section_full = false
  }
  if (isJobBoardWidgetType(instance.type)) {
    raw.section_full = false
  }
  return raw
}

function isChromeWidgetType(type) {
  return (
    isNavWidgetType(type) ||
    isSiteTopNavWidgetType(type) ||
    type === 'breaking_news' ||
    type === 'hero_slider' ||
    type === 'brand_bar' ||
    type === 'job_header_bar' ||
    type === 'job_bottom_nav' ||
    type === 'story' ||
    type === 'story_circles'
  )
}

/** ویجت‌هایی که خودشان پدینگ عمودی دارند — پدینگ ردیف صفحه‌ساز فاصلهٔ دوبل می‌سازد */
function isSelfSpacedWidgetType(type) {
  return (
    isChromeWidgetType(type) ||
    type === 'cta_contact' ||
    type === 'video_gallery' ||
    type === 'video_archive_grid' ||
    type === 'featured_video' ||
    type === 'latest_news' ||
    type === 'latest_news_recycler' ||
    type === 'news_list' ||
    type === 'featured_news' ||
    type === 'featured_news_slider' ||
    type === 'news_by_category' ||
    isSliderWidgetType(type) ||
    isJobBoardWidgetType(type)
  )
}

function widgetBleedClass(instance, sectionWidth, constrainBleed) {
  if (constrainBleed || sectionWidth === 'full') return false
  const raw = instance?.settings || {}
  const type = instance?.type

  if (isSliderWidgetType(type)) {
    return normalizeSliderWidgetSettings(raw).full_bleed !== false
  }
  if (type === 'latest_news_recycler') {
    return !!normalizeNewsWidgetSettings(raw).recycler_section_full
  }
  if (type === 'cta_contact') {
    return !!normalizeCtaWidgetSettings(raw).section_full
  }
  if (isJobBoardWidgetType(type)) {
    return !!normalizeJobBoardWidgetSettings(raw).section_full
  }
  if (isShopWidgetType(type)) {
    return !!normalizeShopWidgetSettings(raw, type).section_full
  }
  if (isNavWidgetType(type) || type === 'breaking_news') {
    return normalizeNavWidgetSettings(raw).bar_full_bleed !== false
  }
  if (isSiteTopNavWidgetType(type)) {
    return normalizeSiteTopNavSettings(raw).full_bleed !== false
  }
  return false
}

function renderWidget(instance, { articleSlot, settings } = {}) {
  const s = settings != null ? settings : instance.settings || {}
  switch (instance.type) {
    case 'news_article':
      return articleSlot || (
        <div className={styles.placeholder}>
          <strong>محتوای کامل سینگل</strong>
          <span>گالری، عنوان، متن، لایک و کامنت اینجا می‌آید</span>
        </div>
      )
    case 'news_page':
      return articleSlot || (
        <div className={styles.placeholder}>
          <strong>محتوای کامل لیست اخبار</strong>
          <span>جستجو، دسته، گرید کارت و صفحه‌بندی اینجا می‌آید</span>
        </div>
      )
    case 'job_article':
      return articleSlot || (
        <div className={styles.placeholder}>
          <strong>محتوای کامل سینگل آگهی</strong>
          <span>تصویر، عنوان، جزئیات، درخواست و شرکت اینجا می‌آید</span>
        </div>
      )
    case 'product_article':
      return articleSlot || (
        <div className={styles.placeholder}>
          <strong>محتوای کامل سینگل محصول</strong>
          <span>گالری، قیمت، توضیحات و افزودن به سبد اینجا می‌آید</span>
        </div>
      )
    case 'shop_page':
      return articleSlot || (
        <div className={styles.placeholder}>
          <strong>محتوای کامل لیست فروشگاه</strong>
          <span>جستجو، دسته و گرید محصولات اینجا می‌آید</span>
        </div>
      )
    case 'featured_products':
    case 'latest_products':
    case 'bestsellers_products':
    case 'discounted_products':
    case 'products_recycler':
    case 'products_grid':
    case 'products_by_category':
      return <ShopProductsStripWidget type={instance.type} settings={s} />
    case 'product_stories':
      return <ProductStoriesWidget settings={s} />
    case 'shop_categories':
      return <ShopCategoriesWidget settings={s} />
    case 'shop_search_bar':
      return <ShopSearchBarWidget settings={s} />
    case 'latest_news':
    case 'news_by_category':
    case 'featured_news':
    case 'latest_news_recycler': {
      const variant = getNewsWidgetVariant(instance.type)
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.NEWS_SECTION}>
          <LatestNewsWidget
            settings={s}
            source={variant.source}
            layout={variant.layout}
          />
        </ModuleGate>
      )
    }
    case 'news_list':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.NEWS_SECTION}>
          <NewsListMagazineWidget settings={s} />
        </ModuleGate>
      )
    case 'featured_news_slider':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.NEWS_SECTION}>
          <FeaturedNewsSliderWidget settings={s} />
        </ModuleGate>
      )
    case 'job_board_system':
    case 'job_listings':
    case 'job_list_only':
    case 'job_filters_only':
      return <JobFullBoardWidget type={instance.type} settings={s} />
    case 'featured_jobs':
    case 'latest_jobs':
    case 'hiring_jobs':
    case 'seeking_jobs':
      return <JobCardsStripWidget type={instance.type} settings={s} />
    case 'job_search_bar':
      return <JobSearchBarWidget settings={s} />
    case 'job_categories_grid':
      return <JobCategoriesGridWidget settings={s} />
    case 'verified_companies':
      return <VerifiedCompaniesWidget settings={s} />
    case 'public_resumes':
      return <PublicResumesWidget settings={s} />
    case 'job_quick_filters':
      return <JobQuickFiltersWidget settings={s} />
    case 'job_stats_strip':
      return <JobStatsStripWidget settings={s} />
    case 'job_header_bar':
      return <JobHeaderBarWidget />
    case 'job_bottom_nav':
      return <JobBottomNavWidget />
    case 'cta_contact':
      return <CTASectionSlot settings={s} />
    case 'story':
    case 'story_circles':
    case 'video_gallery':
    case 'video_archive_grid':
    case 'featured_video':
      return <VideoInstaWidget type={instance.type} settings={s} />
    case 'catalog':
      return <CatalogSlot />
    case 'hero_slider':
      return <HeroSliderSlot settings={s} />
    case 'breaking_news':
      return <BreakingNewsSlot settings={s} />
    case 'persian_datetime':
      return <PersianDateTimeWidget />
    case 'brand_bar':
      return <CorporateBrandBarSlot />
    case 'site_menu':
    case 'site_top_nav':
    case 'corporate_header':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
          <SiteTopNavWidget settings={s} />
        </ModuleGate>
      )
    case 'post_job_button':
    case 'post_job_cta':
      return <PostJobButtonWidget settings={s} />
    case 'nav_bar':
    case 'header_menu':
    case 'hamburger_menu':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_MENU}>
          <NavBarWidget type={instance.type} settings={s} />
        </ModuleGate>
      )
    case 'profile':
      return <NavBarWidget type={instance.type} settings={s} />
    case 'logo':
      return <LogoWidget />
    case 'spacer':
      return <SpacerWidget />
    case 'html_block':
      return <TextWidget settings={s} />
    case 'quick_actions':
    case 'calendar':
    default:
      return <PlaceholderWidget type={instance.type} />
  }
}

function useIsMobileLayout(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  })
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return mobile
}

/**
 * @param {{ layout: any, fallback?: React.ReactNode, articleSlot?: React.ReactNode }} props
 */
export default function PageBuilderRenderer({
  layout,
  fallback = null,
  articleSlot = null,
}) {
  const L = normalizeHomeLayout(layout)
  const isMobile = useIsMobileLayout()
  if (!L.rows?.length) return fallback

  const hasArticleWidget = L.rows.some((row) =>
    (row.columns || []).some((col) =>
      (col.widgets || []).some(
        (w) =>
          w.type === 'news_article' ||
          w.type === 'news_page' ||
          w.type === 'job_article' ||
          w.type === 'product_article' ||
          w.type === 'shop_page'
      )
    )
  )

  return (
    <div
      className={`${styles.page} ${L.page_width === 'full' ? styles.pageFluid : styles.pageBoxed}`}
      style={{
        '--home-max-width': `${L.max_width}px`,
        '--home-gutter': `${L.gutter}px`,
      }}
      data-pb-mobile={isMobile ? '1' : '0'}
    >
      {L.rows.map((row) => {
        const width =
          row.width === 'inherit' ? L.page_width : row.width || L.page_width
        const columns = row.columns || []
        /* روی موبایل همیشه تک‌ستونه — بدون gridColumn ضمنی و بدون خاموش‌کردن bleed */
        const multiCol = columns.length > 1 && !isMobile
        /* کروم یا سکشن‌های خودپدینگ‌دار: پدینگ ردیف را صفر کن تا فاصلهٔ دوبل نیاید */
        const onlySelfSpaced =
          columns.length > 0 &&
          columns.every(
            (col) =>
              (col.widgets || []).length > 0 &&
              (col.widgets || []).every((w) => isSelfSpacedWidgetType(w.type))
          )
        const padY = onlySelfSpaced ? 'none' : row.padding_y

        return (
          <section
            key={row.id}
            className={`${styles.section} ${styles[`pad_${padY}`] || ''} ${
              width === 'full' ? styles.sectionFull : styles.sectionBoxed
            }`}
            data-layout-section={row.id}
            data-pb-chrome-section={onlySelfSpaced ? '1' : undefined}
          >
            <div
              className={styles.columns}
              style={{
                gridTemplateColumns: multiCol
                  ? columns
                      .map((c) => `minmax(0, ${Number(c.span) || 1}fr)`)
                      .join(' ')
                  : 'minmax(0, 1fr)',
              }}
            >
              {columns.map((col, colIdx) => {
                const widgets = col.widgets || []
                if (!widgets.length) return null
                const stackedFromSide =
                  isMobile && columns.length > 1 && colIdx > 0
                return (
                  <div
                    key={col.id || `col_${colIdx}`}
                    className={styles.column}
                    style={
                      multiCol
                        ? { gridColumn: colIdx + 1 }
                        : stackedFromSide
                          ? { marginTop: '0.85rem' }
                          : undefined
                    }
                    data-pb-col={columns.length > 1 ? colIdx + 1 : undefined}
                  >
                    {widgets.map((w) => {
                      const constrainBleed = multiCol
                      const settings = settingsForColumn(w, constrainBleed)
                      const bleed = widgetBleedClass(w, width, constrainBleed)
                      const chrome = isChromeWidgetType(w.type)
                      return (
                        <div
                          key={w.id}
                          className={`${styles.widget} ${bleed ? styles.widgetBleed : ''}`}
                          data-pb-chrome={chrome ? '1' : undefined}
                        >
                          {renderWidget(w, { articleSlot, settings })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
      {!hasArticleWidget && articleSlot ? (
        <section className={`${styles.section} ${styles.pad_md} ${styles.sectionBoxed}`}>
          <div className={styles.columns} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.widget}>{articleSlot}</div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
