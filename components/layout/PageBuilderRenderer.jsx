// PageBuilderRenderer — رندر زنده rows/columns/widgets صفحه اصلی / سینگل
'use client'

import React, { useEffect, useState } from 'react'
import ChromeHeroOverlayStack from '@/components/layout/ChromeHeroOverlayStack'
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
import SadraPixelTitleWidget from '@/components/widgets/SadraPixelTitleWidget'
import {
  BookingCtaWidget,
  BookingFormWidget,
  BookingLookupWidget,
  BookingServicesWidget,
  BookingStaffWidget,
} from '@/components/Booking/BookingWidgets'
import FeatureCardsWidget from '@/components/widgets/FeatureCardsWidget'
import DeepSlider from '@/components/widgets/DeepSlider/DeepSlider'
import DeepRevealPin from '@/components/widgets/DeepSlider/DeepRevealPin'
import {
  isDeepSliderWidgetType,
  normalizeDeepSliderSettings,
  shouldDeepRevealPair,
} from '@/config/deepSliderSettings'
import SoftAppsGridWidget from '@/components/widgets/SoftAppsGridWidget'
import ReboShowcaseWidget from '@/components/widgets/ReboShowcaseWidget'
import {
  ReboCapabilities,
  ReboCloudOrderSection,
  ReboClosing,
  ReboDashboard,
  ReboHero,
  ReboOps,
  ReboPillars,
  ReboPricing,
  ReboOrderSteps,
  ReboSetupCosts,
  ReboStack,
  ReboUsecases,
  REBO_WIDGET_TYPES,
} from '@/components/widgets/rebo'
import {
  GymClosing,
  GymFeatures,
  GymHero,
  GymJourney,
  GymPillars,
  GymSessions,
  GymShop,
  GymTrainers,
  GYM_WIDGET_TYPES,
} from '@/components/widgets/gym'
import { isGymWidgetType } from '@/config/gymWidgetSettings'
import { isHeroWithMenuWidgetType } from '@/config/heroWithMenuSettings'
import {
  SchoolClosing,
  SchoolCounseling,
  SchoolHero,
  SchoolLanding,
  SchoolAnimation,
  SchoolHeroBreaking,
  SchoolRoleBar,
  SchoolPortals,
  SchoolReportPreview,
  SchoolTools,
  SchoolTopStudentsRecycler,
  SchoolClassLeaders,
  SchoolTeacherIntroRecycler,
  SchoolCounselorIntroRecycler,
} from '@/components/widgets/school'
import { renderNobatWidget } from '@/components/widgets/nobat'
import { NOBAT_WIDGET_TYPES } from '@/config/nobatWidgetSettings'
import { renderInventoryWidget } from '@/components/widgets/inventory/InventoryHomeWidgets'
import { INVENTORY_WIDGET_TYPES } from '@/config/inventoryWidgetSettings'
import {
  RepairsCtaWidget,
  RepairsRequestWidget,
  RepairsServicesWidget,
  RepairsTechniciansWidget,
  RepairsTrackWidget,
} from '@/components/Repairs/RepairsWidgets'
import { TodoServiceWidget } from '@/modules/todoservice'
import { isModulePageContentWidget } from '@/config/modulePageLayouts'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { widgetMeta } from '@/config/pageBuilderWidgets'
import {
  getNewsWidgetVariant,
  normalizeNewsWidgetSettings,
} from '@/config/newsWidgetSettings'
import { normalizeCtaWidgetSettings } from '@/config/ctaWidgetSettings'
import {
  isBookingCtaWidgetType,
  isBookingFormWidgetType,
  isBookingServicesWidgetType,
  normalizeBookingCtaSettings,
  normalizeBookingFormSettings,
  normalizeBookingServicesSettings,
} from '@/config/bookingWidgetSettings'
import { normalizeRepairsCtaSettings } from '@/config/repairsWidgetSettings'
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
  /* story = نوار دایره‌ای · recycler = ردیف افقی · بقیه = آرشیو کامل */
  const rail =
    type === 'story' || type === 'story_circles' || type === 'featured_video'
  const recycler = type === 'video_archive_recycler'
  const variant = rail ? 'rail' : recycler ? 'recycler' : 'section'
  return <VideoInstaSlot variant={variant} settings={settings} />
}

function LogoWidget({ settings }) {
  const src =
    settings?.logo_url ||
    settings?.logo_display ||
    settings?.src ||
    ''
  if (!src) {
    return <div className={styles.simpleWidget} aria-hidden />
  }
  return (
    <div className={styles.simpleWidget}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={settings?.alt || 'لوگو'} className={styles.logoImg} />
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
  if (isShopWidgetType(instance.type)) {
    raw.section_full = false
    raw.surface_span = 'container'
  }
  if (isBookingServicesWidgetType(instance.type)) {
    raw.section_full = false
    raw.surface_span = 'container'
  }
  return raw
}

function isChromeWidgetType(type) {
  return (
    isNavWidgetType(type) ||
    isSiteTopNavWidgetType(type) ||
    type === 'breaking_news' ||
    type === 'shop_search_bar' ||
    type === 'hero_slider' ||
    type === 'deep_slider' ||
    type === 'rebo_hero' ||
    type === 'rebo_usecases' ||
    type === 'rebo_showcase' ||
    type === 'gym_hero' ||
    type === 'hero_with_menu' ||
    type === 'school_animation' ||
    type === 'school_landing' ||
    type === 'school_hero_breaking' ||
    type === 'school_hero' ||
    type === 'brand_bar' ||
    type === 'job_header_bar' ||
    type === 'job_bottom_nav' ||
    type === 'story' ||
    type === 'story_circles'
  )
}

/**
 * ویجت‌هایی که خودشان پدینگ عمودی کامل دارند —
 * فقط این‌ها پدینگ سکشن را صفر می‌کنند (نه همهٔ ویجت‌های مدرسه).
 */
const SCHOOL_SELF_SPACED_TYPES = new Set([
  'school_landing',
  'school_hero_breaking',
  'school_hero',
  'school_animation',
])

/** ویجت‌هایی که خودشان پدینگ عمودی دارند — پدینگ ردیف صفحه‌ساز فاصلهٔ دوبل می‌سازد */
function isSelfSpacedWidgetType(type) {
  return (
    isChromeWidgetType(type) ||
    SCHOOL_SELF_SPACED_TYPES.has(type) ||
    type === 'cta_contact' ||
    type === 'video_gallery' ||
    type === 'video_archive_grid' ||
    type === 'video_archive_recycler' ||
    type === 'featured_video' ||
    type === 'latest_news' ||
    type === 'latest_news_recycler' ||
    type === 'news_list' ||
    type === 'featured_news' ||
    type === 'featured_news_slider' ||
    type === 'news_by_category' ||
    type === 'dual_cta_buttons' ||
    type === 'feature_cards' ||
    REBO_WIDGET_TYPES.includes(type) ||
    GYM_WIDGET_TYPES.includes(type) ||
    isGymWidgetType(type) ||
    isHeroWithMenuWidgetType(type) ||
    NOBAT_WIDGET_TYPES.includes(type) ||
    INVENTORY_WIDGET_TYPES.includes(type) ||
    type === 'booking_cta' ||
    type === 'booking_services' ||
    type === 'booking_staff' ||
    type === 'repairs_cta' ||
    type === 'repairs_technicians' ||
    type === 'repairs_services' ||
    type === 'repairs_request' ||
    type === 'repairs_track' ||
    type === 'repairs_todoservice' ||
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
    const shop = normalizeShopWidgetSettings(raw, type)
    if (shop.section_full) return true
    return (
      shop.surface_mode === 'color' && (shop.surface_span || 'full') === 'full'
    )
  }
  if (isBookingFormWidgetType(type)) {
    return !!normalizeBookingFormSettings(raw).section_full
  }
  if (isBookingCtaWidgetType(type) || type === 'dual_cta_buttons') {
    return !!normalizeBookingCtaSettings(raw).section_full
  }
  if (isBookingServicesWidgetType(type)) {
    const svc = normalizeBookingServicesSettings(raw)
    if (svc.section_full) return true
    return (
      svc.surface_mode === 'color' && (svc.surface_span || 'full') === 'full'
    )
  }
  if (type === 'repairs_cta') {
    return !!normalizeRepairsCtaSettings(raw).section_full
  }
  if (isNavWidgetType(type) || type === 'breaking_news') {
    return normalizeNavWidgetSettings(raw).bar_full_bleed !== false
  }
  if (isSiteTopNavWidgetType(type)) {
    return normalizeSiteTopNavSettings(raw).full_bleed === true
  }
  if (isDeepSliderWidgetType(type)) {
    return normalizeDeepSliderSettings(raw).full_bleed !== false
  }
  return false
}

function renderWidget(instance, { articleSlot, settings, productContext } = {}) {
  if (isModulePageContentWidget(instance?.type)) {
    return (
      <div className={styles.modulePageContent} data-module-page-content="1">
        {articleSlot || (
          <p style={{ opacity: 0.55, fontSize: '0.9rem' }}>
            محتوای صفحه داخلی
          </p>
        )}
      </div>
    )
  }
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
    case 'product_similar':
      return (
        <ShopProductsStripWidget
          type={instance.type}
          settings={s}
          product={productContext}
        />
      )
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
    case 'dual_cta_buttons':
      return <BookingCtaWidget settings={s} />
    case 'feature_cards':
      return <FeatureCardsWidget settings={s} />
    case 'deep_slider':
      return <DeepSlider settings={s} />
    case 'rebo_hero':
      return <ReboHero settings={s} />
    case 'rebo_stack':
      return <ReboStack settings={s} />
    case 'rebo_pillars':
      return <ReboPillars settings={s} />
    case 'rebo_capabilities':
      return <ReboCapabilities settings={s} />
    case 'rebo_dashboard':
      return <ReboDashboard settings={s} />
    case 'rebo_usecases':
      return <ReboUsecases settings={s} />
    case 'rebo_pricing':
      return <ReboPricing settings={s} />
    case 'rebo_order_steps':
      return <ReboOrderSteps settings={s} />
    case 'rebo_setup_costs':
      return <ReboSetupCosts settings={s} />
    case 'rebo_ops':
      return <ReboOps settings={s} />
    case 'rebo_cloud_order':
      return <ReboCloudOrderSection settings={s} />
    case 'rebo_closing':
      return <ReboClosing settings={s} />
    case 'rebo_showcase':
      return <ReboShowcaseWidget settings={s} />
    case 'gym_hero':
    case 'hero_with_menu':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.HERO_WITH_MENU}>
          <GymHero settings={s} />
        </ModuleGate>
      )
    case 'gym_journey':
      return <GymJourney settings={s} />
    case 'gym_features':
    case 'curved_timeline':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.CURVED_TIMELINE}>
          <GymFeatures settings={s} />
        </ModuleGate>
      )
    case 'gym_sessions':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.GYM_BODYBUILDING}>
          <GymSessions settings={s} />
        </ModuleGate>
      )
    case 'gym_trainers':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.GYM_BODYBUILDING}>
          <GymTrainers settings={s} />
        </ModuleGate>
      )
    case 'gym_shop':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.GYM_BODYBUILDING}>
          <GymShop settings={s} />
        </ModuleGate>
      )
    case 'gym_pillars':
      return <GymPillars settings={s} />
    case 'gym_closing':
      return <GymClosing settings={s} />
    case 'school_animation':
      return <SchoolAnimation settings={s} />
    case 'school_landing':
      return <SchoolLanding settings={s} />
    case 'school_hero_breaking':
      return <SchoolHeroBreaking settings={s} />
    case 'school_role_bar':
      return <SchoolRoleBar settings={s} />
    case 'school_hero':
      return <SchoolHero settings={s} />
    case 'school_portals':
      return <SchoolPortals settings={s} />
    case 'school_report_preview':
      return <SchoolReportPreview settings={s} />
    case 'school_counseling':
      return <SchoolCounseling settings={s} />
    case 'school_tools':
      return <SchoolTools settings={s} />
    case 'school_closing':
      return <SchoolClosing settings={s} />
    case 'school_top_students':
      return <SchoolTopStudentsRecycler settings={s} />
    case 'school_class_leaders':
      return <SchoolClassLeaders settings={s} />
    case 'school_teacher_intro':
      return <SchoolTeacherIntroRecycler settings={s} />
    case 'school_counselor_intro':
      return <SchoolCounselorIntroRecycler settings={s} />
    case 'booking_form':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_WIDGET}>
          <BookingFormWidget settings={s} />
        </ModuleGate>
      )
    case 'booking_services':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_SERVICES}>
          <BookingServicesWidget settings={s} />
        </ModuleGate>
      )
    case 'booking_staff':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_STAFF}>
          <BookingStaffWidget settings={s} />
        </ModuleGate>
      )
    case 'booking_lookup':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_LOOKUP}>
          <BookingLookupWidget settings={s} />
        </ModuleGate>
      )
    case 'booking_cta':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_CTA}>
          <BookingCtaWidget settings={s} />
        </ModuleGate>
      )
    case 'story':
    case 'story_circles':
    case 'video_gallery':
    case 'video_archive_grid':
    case 'video_archive_recycler':
    case 'featured_video':
      return <VideoInstaWidget type={instance.type} settings={s} />
    case 'catalog':
      return <CatalogSlot />
    case 'softapps_grid':
    case 'softapps_featured':
    case 'softapps_cta':
      return (
        <SoftAppsGridWidget type={instance.type} settings={s} />
      )
    case 'repairs_cta':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <RepairsCtaWidget settings={s} />
        </ModuleGate>
      )
    case 'repairs_technicians':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <RepairsTechniciansWidget settings={s} />
        </ModuleGate>
      )
    case 'repairs_services':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <RepairsServicesWidget settings={s} />
        </ModuleGate>
      )
    case 'repairs_request':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <RepairsRequestWidget settings={s} />
        </ModuleGate>
      )
    case 'repairs_track':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <RepairsTrackWidget settings={s} />
        </ModuleGate>
      )
    case 'repairs_todoservice':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
          <TodoServiceWidget settings={s} />
        </ModuleGate>
      )
    case 'nobat_hero':
    case 'nobat_pillars':
    case 'nobat_parts':
    case 'nobat_search':
    case 'nobat_process':
    case 'nobat_book':
    case 'nobat_team':
    case 'nobat_report':
    case 'nobat_closing':
      return (
        <ModuleGate moduleKey={instance.type}>
          {renderNobatWidget(instance.type, s)}
        </ModuleGate>
      )
    case 'inventory_add_keeper':
    case 'inventory_top_operators':
    case 'inventory_stock_in_cta':
    case 'inventory_stock_out_cta':
    case 'inventory_activity_chart':
    case 'inventory_today_vouchers':
      return (
        <ModuleGate moduleKey={SITE_MODULE_KEYS.ADVANCED_INVENTORY}>
          {renderInventoryWidget(instance)}
        </ModuleGate>
      )
    case 'hero_slider':
      return <HeroSliderSlot settings={s} />
    case 'breaking_news':
      return <BreakingNewsSlot settings={s} />
    case 'persian_datetime':
      return <PersianDateTimeWidget />
    case 'sadra_pixel_title':
      return <SadraPixelTitleWidget settings={s} />
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
      return <LogoWidget settings={settings} />
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
  // همیشه false شروع شود تا SSR و هیدریشن یکی باشند؛ بعد از mount به‌روز می‌شود
  const [mobile, setMobile] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setMobile(mq.matches)
    apply()
    setReady(true)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return ready ? mobile : false
}

function getSoloWidget(row) {
  const cols = row?.columns || []
  if (cols.length !== 1) return null
  const ws = cols[0]?.widgets || []
  if (ws.length !== 1) return null
  return ws[0]
}

/**
 * نوار خبر فوری / منوی بالا وقتی sticky است باید روی خود سکشن sticky شود —
 * والد کوتاه ویجت جلوی position:sticky داخلی را می‌گیرد.
 * فقط دسکتاپ (CSS) و فقط وقتی ردیف فقط همین ویجت را دارد.
 */
function getDesktopStickyChromeMeta(row) {
  const w = getSoloWidget(row)
  if (!w) return null

  /* site_top_nav و breaking_news خودشان با fixed پین می‌شوند (منو زیر نوار خبر) */
  if (isSiteTopNavWidgetType(w.type)) return null
  if (w.type === 'breaking_news') return null

  if (isNavWidgetType(w.type)) {
    const s = normalizeNavWidgetSettings(w.settings || {}, {
      viewport: 'desktop',
    })
    if (!s.sticky) return null
    return { offset: Number(s.sticky_offset) || 0 }
  }

  return null
}

/** هدر/منوی overlay + هیرو زیرش را در یک استک جمع می‌کند */
function groupRowsForChromeHeroOverlay(rows) {
  const list = Array.isArray(rows) ? rows : []
  const out = []
  let i = 0
  while (i < list.length) {
    const row = list[i]
    if (row?.chrome_overlay_hero) {
      const chromeRows = []
      while (i < list.length && list[i]?.chrome_overlay_hero) {
        chromeRows.push(list[i])
        i += 1
      }
      const heroRow =
        i < list.length && list[i]?.chrome_underlay_hero ? list[i] : null
      if (heroRow) {
        out.push({
          kind: 'chrome_hero_overlay',
          id: `chrome_hero_${chromeRows[0]?.id || 'c'}_${heroRow.id}`,
          chromeRows,
          heroRow,
        })
        i += 1
        continue
      }
      chromeRows.forEach((r) => out.push({ kind: 'row', id: r.id, row: r }))
      continue
    }
    out.push({ kind: 'row', id: row.id, row })
    i += 1
  }
  return out
}

/** اسلایدر عمیق + انیمیشن انتخاب‌شده را جفت می‌کند */
function groupRowsForDeepReveal(rows) {
  const list = groupRowsForChromeHeroOverlay(rows)
  const out = []
  for (let i = 0; i < list.length; i += 1) {
    const entry = list[i]
    if (entry.kind !== 'row') {
      out.push(entry)
      continue
    }
    const row = entry.row
    const nextEntry = list[i + 1]
    const next = nextEntry?.kind === 'row' ? nextEntry.row : null
    const a = getSoloWidget(row)
    const b = next ? getSoloWidget(next) : null
    if (
      a &&
      b &&
      isDeepSliderWidgetType(a.type) &&
      shouldDeepRevealPair(a.settings, b.type)
    ) {
      out.push({
        kind: 'deep_reveal',
        id: `deep_reveal_${row.id}_${next.id}`,
        deepRow: row,
        underRow: next,
        deepWidget: a,
        underWidget: b,
      })
      i += 1
    } else {
      out.push(entry)
    }
  }
  return out
}

function groupWidgetsForDeepReveal(widgets) {
  const list = Array.isArray(widgets) ? widgets : []
  const out = []
  for (let i = 0; i < list.length; i += 1) {
    const w = list[i]
    const next = list[i + 1]
    if (
      w &&
      next &&
      isDeepSliderWidgetType(w.type) &&
      shouldDeepRevealPair(w.settings, next.type)
    ) {
      out.push({ kind: 'deep_reveal', deepWidget: w, underWidget: next })
      i += 1
    } else {
      out.push({ kind: 'widget', widget: w })
    }
  }
  return out
}

/**
 * @param {{ layout: any, fallback?: React.ReactNode, articleSlot?: React.ReactNode, productContext?: any }} props
 */
export default function PageBuilderRenderer({
  layout,
  fallback = null,
  articleSlot = null,
  productContext = null,
}) {
  const L = normalizeHomeLayout(layout)
  const isMobile = useIsMobileLayout()
  const pageBg = L.page_background || ''

  useEffect(() => {
    if (!pageBg || typeof document === 'undefined') return undefined
    const body = document.body
    const prev = body.style.background
    body.style.background = pageBg
    body.dataset.pageBuilderBg = '1'
    return () => {
      if (body.dataset.pageBuilderBg === '1') {
        body.style.background = prev
        delete body.dataset.pageBuilderBg
      }
    }
  }, [pageBg])

  if (!L.rows?.length) return fallback

  const hasArticleWidget = L.rows.some((row) =>
    (row.columns || []).some((col) =>
      (col.widgets || []).some(
        (w) =>
          w.type === 'news_article' ||
          w.type === 'news_page' ||
          w.type === 'job_article' ||
          w.type === 'product_article' ||
          w.type === 'shop_page' ||
          isModulePageContentWidget(w.type)
      )
    )
  )

  const renderRowSection = (row, { skipSticky = false } = {}) => {
    if (!row) return null
    const width =
      row.width === 'inherit' ? L.page_width : row.width || L.page_width
    const columns = row.columns || []
    const multiCol = columns.length > 1 && !isMobile
    const onlySelfSpaced =
      columns.length > 0 &&
      columns.every(
        (col) =>
          (col.widgets || []).length > 0 &&
          (col.widgets || []).every((w) => isSelfSpacedWidgetType(w.type))
      )
    const padY = onlySelfSpaced ? 'none' : row.padding_y
    const stickyChrome = skipSticky ? null : getDesktopStickyChromeMeta(row)
    const overlayChrome = !!row.chrome_overlay_hero
    const underlayHero = !!row.chrome_underlay_hero

    const sectionBg = String(row.background || '').trim()
    const sectionStyle = {
      ...(stickyChrome
        ? { '--pb-sticky-nav-top': `${stickyChrome.offset}px` }
        : {}),
      ...(sectionBg ? { background: sectionBg } : {}),
    }

    return (
      <section
        key={row.id}
        className={`${styles.section} ${styles[`pad_${padY}`] || ''} ${
          width === 'full' ? styles.sectionFull : styles.sectionBoxed
        }${stickyChrome ? ` ${styles.sectionStickyNav}` : ''}`}
        style={Object.keys(sectionStyle).length ? sectionStyle : undefined}
        data-layout-section={row.id}
        data-pb-chrome-section={onlySelfSpaced || overlayChrome ? '1' : undefined}
        data-sticky-top-nav={stickyChrome ? '1' : undefined}
        data-chrome-overlay-hero={overlayChrome ? '1' : undefined}
        data-chrome-underlay-hero={underlayHero ? '1' : undefined}
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
            const grouped = groupWidgetsForDeepReveal(widgets)
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
                {grouped.map((item) => {
                  const constrainBleed = multiCol
                  if (item.kind === 'deep_reveal') {
                    return (
                      <div
                        key={`${item.deepWidget.id}_${item.underWidget.id}`}
                        className={`${styles.widget} ${styles.widgetBleed}`}
                        data-pb-chrome="1"
                      >
                        <DeepRevealPin
                          deepWidget={item.deepWidget}
                          underWidget={item.underWidget}
                          renderUnder={(uw) =>
                            renderWidget(uw, {
                              articleSlot,
                              settings: {
                                ...settingsForColumn(uw, constrainBleed),
                                deep_reveal_pinned: true,
                                scene_full_page: true,
                              },
                              productContext,
                            })
                          }
                        />
                      </div>
                    )
                  }
                  const w = item.widget
                  const settings = settingsForColumn(w, constrainBleed)
                  const bleed = widgetBleedClass(w, width, constrainBleed)
                  const chrome = isChromeWidgetType(w.type)
                  return (
                    <div
                      key={w.id}
                      className={`${styles.widget} ${bleed ? styles.widgetBleed : ''}`}
                      data-pb-chrome={chrome ? '1' : undefined}
                    >
                      {renderWidget(w, {
                        articleSlot,
                        settings,
                        productContext,
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div
      className={`${styles.page} ${L.page_width === 'full' ? styles.pageFluid : styles.pageBoxed}`}
      style={{
        '--home-max-width': `${L.max_width}px`,
        '--home-gutter': `${L.gutter}px`,
        ...(pageBg ? { background: pageBg } : {}),
      }}
      data-pb-mobile={isMobile ? '1' : '0'}
    >
      {groupRowsForDeepReveal(L.rows).map((entry) => {
        if (entry.kind === 'chrome_hero_overlay') {
          return (
            <ChromeHeroOverlayStack
              key={entry.id}
              chrome={entry.chromeRows.map((row) =>
                renderRowSection(row, { skipSticky: true }),
              )}
              hero={renderRowSection(entry.heroRow, { skipSticky: true })}
            />
          )
        }

        if (entry.kind === 'deep_reveal') {
          const width =
            entry.deepRow.width === 'inherit'
              ? L.page_width
              : entry.deepRow.width || L.page_width
          return (
            <section
              key={entry.id}
              className={`${styles.section} ${styles.pad_none} ${
                width === 'full' ? styles.sectionFull : styles.sectionBoxed
              }`}
              data-layout-section={entry.deepRow.id}
              data-deep-reveal-section="1"
              data-pb-chrome-section="1"
            >
              <div
                className={styles.columns}
                style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
              >
                <div className={`${styles.column} ${styles.widgetBleed}`}>
                  <div
                    className={`${styles.widget} ${styles.widgetBleed}`}
                    data-pb-chrome="1"
                  >
                    <DeepRevealPin
                      deepWidget={entry.deepWidget}
                      underWidget={entry.underWidget}
                      renderUnder={(uw) =>
                        renderWidget(uw, {
                          articleSlot,
                          settings: {
                            ...settingsForColumn(uw, false),
                            deep_reveal_pinned: true,
                            scene_full_page: true,
                          },
                          productContext,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          )
        }

        return renderRowSection(entry.row)
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
