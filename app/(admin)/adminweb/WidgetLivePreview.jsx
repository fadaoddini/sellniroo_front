'use client'

import React, { useEffect, useState } from 'react'
import {
  Menu,
  Megaphone,
  User,
  LogIn,
  Images,
  Newspaper,
  Film,
  BookOpen,
  Briefcase,
  Phone,
  Calendar,
  LayoutTemplate,
  FolderOpen,
  Star,
  GalleryHorizontal,
  PanelTop,
  Zap,
  Search,
  Building2,
} from 'lucide-react'
import { isNavWidgetType, normalizeNavWidgetSettings } from '@/config/navWidgetSettings'
import {
  isSliderWidgetType,
  normalizeSliderWidgetSettings,
} from '@/config/sliderWidgetSettings'
import {
  isNewsWidgetType,
  isNewsMagazineWidgetType,
  normalizeNewsWidgetSettings,
  normalizeNewsMagazineSettings,
} from '@/config/newsWidgetSettings'
import { fetchMenuListBySlug } from '@/services/menuLists'
import { widgetMeta } from '@/config/pageBuilderWidgets'
import styles from './AdminWeb.module.css'

const FALLBACK_ICONS = {
  breaking_news: Megaphone,
  nav_bar: Menu,
  hamburger_menu: Menu,
  header_menu: Menu,
  profile: User,
  hero_slider: Images,
  news_list: Newspaper,
  latest_news: Newspaper,
  news_by_category: FolderOpen,
  featured_news: Star,
  featured_news_slider: Images,
  latest_news_recycler: GalleryHorizontal,
  video_gallery: Film,
  video_archive_grid: Film,
  featured_video: Film,
  story: Film,
  story_circles: Film,
  catalog: BookOpen,
  job_board_system: Briefcase,
  job_listings: Briefcase,
  job_list_only: Briefcase,
  job_filters_only: FolderOpen,
  job_search_bar: Search,
  featured_jobs: Star,
  latest_jobs: Briefcase,
  hiring_jobs: Briefcase,
  seeking_jobs: User,
  job_categories_grid: FolderOpen,
  verified_companies: Building2,
  public_resumes: User,
  job_quick_filters: FolderOpen,
  job_stats_strip: Star,
  job_header_bar: PanelTop,
  job_bottom_nav: Menu,
  cta_contact: Phone,
  calendar: Calendar,
  logo: LayoutTemplate,
  site_menu: PanelTop,
  site_top_nav: PanelTop,
  corporate_header: PanelTop,
  post_job_button: Zap,
  brand_bar: LayoutTemplate,
}

/**
 * پیش‌نمایش زنده ویجت روی اسکلت — با تغییر تنظیمات فوراً عوض می‌شود
 */
export default function WidgetLivePreview({ type, settings, selected = false }) {
  const meta = widgetMeta(type)
  const nav = isNavWidgetType(type)
  const slider = isSliderWidgetType(type)
  const news = isNewsWidgetType(type)
  const magazine = isNewsMagazineWidgetType(type)
  const s = nav ? normalizeNavWidgetSettings(settings) : null
  const sliderSettings = slider
    ? normalizeSliderWidgetSettings(settings)
    : null
  const newsSettings = news
    ? magazine
      ? normalizeNewsMagazineSettings(settings)
      : normalizeNewsWidgetSettings(settings)
    : null
  const [menuLabels, setMenuLabels] = useState([])

  useEffect(() => {
    if (!nav || !s?.menu_slug) {
      setMenuLabels([])
      return undefined
    }
    if (!s.show_menu_items && type === 'hamburger_menu') {
      setMenuLabels([])
      return undefined
    }
    let cancelled = false
    fetchMenuListBySlug(s.menu_slug, { force: false }).then((menu) => {
      if (cancelled) return
      const labels = (menu?.items || [])
        .filter((i) => i.is_active !== false)
        .slice(0, 4)
        .map((i) => i.label_fa || i.label_en || '…')
      setMenuLabels(labels)
    })
    return () => {
      cancelled = true
    }
  }, [nav, s?.menu_slug, s?.show_menu_items, type])

  if (nav) {
    const showHamburger =
      s.show_hamburger && type !== 'header_menu' && type !== 'profile'
    const showTicker = type === 'breaking_news' && s.show_ticker
    const showInline =
      s.show_menu_items || type === 'header_menu'
    const showProfile = type === 'profile' || type === 'nav_bar' || type === 'breaking_news'

    return (
      <div
        className={`${styles.lpBar} ${selected ? styles.lpBarOn : ''} ${!s.show_on_mobile ? styles.lpBarNoMobile : ''}`}
        title={meta?.label || type}
      >
        {showHamburger ? (
          <span className={styles.lpChip} data-role="hamburger">
            <Menu size={12} />
          </span>
        ) : null}

        {showTicker ? (
          <span className={styles.lpTicker}>
            <Megaphone size={11} />
            <i />
            <i />
            <i />
          </span>
        ) : null}

        {showInline && menuLabels.length > 0 ? (
          <span className={styles.lpLinks}>
            {menuLabels.map((label) => (
              <em key={label}>{label}</em>
            ))}
          </span>
        ) : showInline ? (
          <span className={styles.lpLinksMuted}>لینک‌های منو…</span>
        ) : null}

        <span className={styles.lpGrow} />

        {showProfile ? (
          <span className={styles.lpProfile}>
            {s.guest_visible ? (
              <span className={styles.lpGuest} title="قبل از ورود">
                <LogIn size={10} />
                {s.guest_label || 'ورود'}
              </span>
            ) : null}
            {s.profile_mode !== 'hidden' ? (
              <span
                className={styles.lpUser}
                data-mode={s.profile_mode}
                title="بعد از ورود"
              >
                <User size={11} />
                {s.profile_mode === 'avatar_name' ? <b>کاربر</b> : null}
              </span>
            ) : null}
            {!s.guest_visible && s.profile_mode === 'hidden' ? (
              <span className={styles.lpLinksMuted}>پروفایل مخفی</span>
            ) : null}
          </span>
        ) : null}
      </div>
    )
  }

  if (slider && sliderSettings) {
    const isFeaturedNews = type === 'featured_news_slider'
    const h =
      sliderSettings.height === 'sm'
        ? styles.lpSlideSm
        : sliderSettings.height === 'lg'
          ? styles.lpSlideLg
          : styles.lpSlideMd
    const count = Math.max(1, Math.min(20, Number(settings?.count) || 5))
    return (
      <div
        className={[
          styles.lpSlide,
          isFeaturedNews ? styles.lpSlideFeatured : '',
          h,
          selected ? styles.lpSlideOn : '',
          !sliderSettings.show_on_mobile ? styles.lpBarNoMobile : '',
        ]
          .filter(Boolean)
          .join(' ')}
        title={meta?.label || type}
      >
        {isFeaturedNews ? (
          <span className={styles.lpSlideNewsBadge} aria-hidden>
            <Newspaper size={11} />
          </span>
        ) : null}
        {sliderSettings.show_caption ? (
          <span className={styles.lpSlideCaption}>
            <strong>
              {isFeaturedNews ? 'اسلایدر اخبار ویژه' : 'اسلایدر هیرو'}
            </strong>
            <small>
              {isFeaturedNews
                ? `${count} خبر ویژه · پیش‌نمایش`
                : 'پیش‌نمایش زنده'}
            </small>
          </span>
        ) : (
          <span className={styles.lpSlideCaptionMuted}>
            {isFeaturedNews ? 'اسلایدر اخبار ویژه · بدون عنوان' : 'بدون عنوان'}
          </span>
        )}
        <span className={styles.lpGrow} />
        {sliderSettings.show_dots ? (
          <span className={styles.lpSlideDots} aria-hidden>
            <i className={styles.lpSlideDotOn} />
            <i />
            <i />
          </span>
        ) : null}
      </div>
    )
  }

  if (news && newsSettings) {
    const rows = Math.min(4, Math.max(2, newsSettings.count))
    const isFeaturedList = type === 'featured_news'
    const isCategoryList = type === 'news_by_category'
    const isLatestList = type === 'latest_news'
    const isNewsList = type === 'news_list'
    const isRecycler = type === 'latest_news_recycler'
    const skinClass = isFeaturedList
      ? styles.lpNewsFeatured
      : isCategoryList
        ? styles.lpNewsCategory
        : isNewsList
          ? styles.lpNewsList
          : isLatestList
            ? styles.lpNewsLatest
            : isRecycler
              ? styles.lpNewsRecycler
              : ''
    const headClass = isFeaturedList
      ? styles.lpNewsFeaturedHead
      : isCategoryList
        ? styles.lpNewsCategoryHead
        : isNewsList
          ? styles.lpNewsListHead
          : isRecycler
            ? styles.lpNewsRecyclerHead
            : styles.lpNewsLatestHead
    const markClass = isFeaturedList
      ? styles.lpNewsStarMark
      : isCategoryList
        ? styles.lpNewsCatMark
        : isNewsList
          ? styles.lpNewsListMark
          : styles.lpNewsLatestMark
    const titleLabel = isFeaturedList
      ? 'اخبار ویژه لیست سفارشی'
      : isCategoryList
        ? 'اخبار یک دسته'
        : isNewsList
          ? 'لیست اخبار'
          : isRecycler
            ? 'ریسایکلرویوی اخبار'
            : 'آخرین اخبار'
    const sampleTitle = (i) =>
      isFeaturedList
        ? `خبر ویژه نمونه ${i + 1}`
        : isCategoryList
          ? `خبر دسته نمونه ${i + 1}`
          : isNewsList
            ? `خبر لیست نمونه ${i + 1}`
            : isRecycler
              ? `کارت ${i + 1}`
              : `آخرین خبر نمونه ${i + 1}`
    const metaPrefix = isFeaturedList
      ? 'لیست سفارشی · '
      : isCategoryList
        ? `${newsSettings.category_slug || 'بدون دسته'} · `
        : isNewsList
          ? 'لیست کارت · '
          : isRecycler
            ? `ریسایکلر · ${newsSettings.recycler_visible_desktop || 4} کارت · `
            : newsSettings.category_slug
              ? `${newsSettings.category_slug} · `
              : 'آخرین · '

    if (isNewsList) {
      return (
        <div
          className={[
            styles.lpNews,
            styles.lpNewsList,
            selected ? styles.lpNewsOn : '',
            !newsSettings.show_on_mobile ? styles.lpBarNoMobile : '',
          ]
            .filter(Boolean)
            .join(' ')}
          title={meta?.label || type}
        >
          <span className={styles.lpNewsListHead}>
            <Newspaper size={11} />
            <strong>لیست اخبار · مجله</strong>
          </span>
          <span className={styles.lpNewsRecyclerTrack} aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={styles.lpNewsRecyclerCard}>
                <i className={styles.lpNewsRecyclerImg} />
                <em>کارت مجله {i + 1}</em>
              </span>
            ))}
          </span>
          <small className={styles.lpNewsMeta}>
            {newsSettings.columns || 3} ستونی ·{' '}
            {newsSettings.card_style || 'classic'} ·{' '}
            {newsSettings.per_page || 12} در صفحه
          </small>
        </div>
      )
    }

    if (isRecycler) {
      const cards = Math.min(
        4,
        Math.max(2, Number(newsSettings.recycler_visible_desktop) || 3)
      )
      return (
        <div
          className={[
            styles.lpNews,
            styles.lpNewsRecycler,
            selected ? styles.lpNewsOn : '',
            !newsSettings.show_on_mobile ? styles.lpBarNoMobile : '',
          ]
            .filter(Boolean)
            .join(' ')}
          title={meta?.label || type}
        >
          <span className={styles.lpNewsRecyclerHead}>
            <GalleryHorizontal size={11} />
            <strong>ریسایکلرویوی اخبار</strong>
          </span>
          <span className={styles.lpNewsRecyclerTrack} aria-hidden>
            {Array.from({ length: cards }).map((_, i) => (
              <span key={i} className={styles.lpNewsRecyclerCard}>
                <i className={styles.lpNewsRecyclerImg} />
                <em>{sampleTitle(i)}</em>
              </span>
            ))}
          </span>
          <small className={styles.lpNewsMeta}>
            {metaPrefix}
            {newsSettings.count} خبر
            {newsSettings.offset ? ` · افست ${newsSettings.offset}` : ''}
            {newsSettings.recycler_autoplay ? ' · پخش خودکار' : ''}
            {newsSettings.show_views ? ' · بازدید' : ''}
            {newsSettings.show_likes ? ' · لایک' : ''}
          </small>
        </div>
      )
    }

    if (isFeaturedList || isCategoryList || isLatestList) {
      return (
        <div
          className={[
            styles.lpNews,
            skinClass,
            selected ? styles.lpNewsOn : '',
            !newsSettings.show_on_mobile ? styles.lpBarNoMobile : '',
          ]
            .filter(Boolean)
            .join(' ')}
          title={meta?.label || type}
        >
          <span className={headClass}>
            {isFeaturedList ? (
              <Star size={11} />
            ) : isCategoryList ? (
              <FolderOpen size={11} />
            ) : (
              <Newspaper size={11} />
            )}
            <strong>{titleLabel}</strong>
          </span>
          {Array.from({ length: rows }).map((_, i) => (
            <span key={i} className={styles.lpNewsRow}>
              {newsSettings.show_image ? (
                <i
                  className={styles.lpNewsThumb}
                  data-shape={newsSettings.image_shape}
                />
              ) : (
                <i className={markClass} aria-hidden />
              )}
              <em
                style={{
                  fontSize: `${Math.max(9, Math.min(13, newsSettings.font_size - 2))}px`,
                }}
              >
                {sampleTitle(i)}
              </em>
            </span>
          ))}
          <small className={styles.lpNewsMeta}>
            {metaPrefix}
            {newsSettings.count} خبر
            {newsSettings.offset ? ` · افست ${newsSettings.offset}` : ''}
            {newsSettings.show_views ? ' · بازدید' : ''}
            {newsSettings.show_likes ? ' · لایک' : ''}
          </small>
        </div>
      )
    }

    return (
      <div
        className={`${styles.lpNews} ${selected ? styles.lpNewsOn : ''} ${
          !newsSettings.show_on_mobile ? styles.lpBarNoMobile : ''
        }`}
        title={meta?.label || type}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <span key={i} className={styles.lpNewsRow}>
            {newsSettings.show_image ? (
              <i
                className={styles.lpNewsThumb}
                data-shape={newsSettings.image_shape}
              />
            ) : null}
            <em
              style={{
                fontSize: `${Math.max(9, Math.min(13, newsSettings.font_size - 2))}px`,
              }}
            >
              عنوان خبر نمونه {i + 1}
            </em>
          </span>
        ))}
        <small className={styles.lpNewsMeta}>
          {newsSettings.count} خبر
          {newsSettings.show_views ? ' · بازدید' : ''}
          {newsSettings.show_likes ? ' · لایک' : ''}
        </small>
      </div>
    )
  }

  if (type === 'news_article') {
    return (
      <div
        className={`${styles.lpNews} ${styles.lpNewsList} ${
          selected ? styles.lpNewsOn : ''
        }`}
        title={meta?.label || type}
      >
        <span className={styles.lpNewsListHead}>
          <Newspaper size={11} />
          <strong>محتوای کامل سینگل</strong>
        </span>
        <span className={styles.lpNewsRecyclerTrack} aria-hidden>
          <span className={styles.lpNewsRecyclerCard}>
            <i className={styles.lpNewsRecyclerImg} />
            <em>گالری · عنوان · متن · لایک · کامنت</em>
          </span>
        </span>
        <small className={styles.lpNewsMeta}>
          کل مقاله — کنار تقویم یا ویجت‌های دیگر بچینید
        </small>
      </div>
    )
  }

  const Icon = FALLBACK_ICONS[type] || LayoutTemplate
  return (
    <div className={`${styles.lpCard} ${selected ? styles.lpCardOn : ''}`}>
      <span className={styles.lpCardIcon}>
        <Icon size={14} />
      </span>
      <span className={styles.lpCardBody}>
        <strong>{meta?.label || type}</strong>
        <small>{meta?.desc || 'ویجت'}</small>
      </span>
    </div>
  )
}
