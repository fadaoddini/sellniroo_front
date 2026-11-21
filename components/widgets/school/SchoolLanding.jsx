'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Medal,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import { useAuth } from '@/contexts/AuthContext'
import {
  DEFAULT_HOME_HERO_SLIDER,
  homePageThemeStyle,
  normalizeHomeHeroSlider,
} from '@/config/homeHeroSlider'
import { fetchSiteSettings } from '@/services/siteSettings'
import {
  buildHeroBreakingNewsSettings,
  CHART_MONTHS,
  COUNSELOR_TESTS,
  normalizeSchoolSettings,
  REPORT_SUBJECTS,
  SCHOOL_PORTALS,
  TEACHER_TOOLS,
} from './schoolData'
import styles from './SchoolLanding.module.css'

function isLoginHref(href) {
  const path = String(href || '').trim().split('?')[0].split('#')[0]
  return path === '/login' || path.endsWith('/login')
}

function resolveAuthedHref(href, fallback = '/profile') {
  if (!isLoginHref(href)) return href
  try {
    const q = String(href).split('?')[1] || ''
    const next = new URLSearchParams(q).get('next')
    if (next && next.startsWith('/')) return next
  } catch {
    /* ignore */
  }
  return fallback
}

const PORTAL_ICONS = {
  student: BookOpen,
  teacher: GraduationCap,
  counselor: HeartHandshake,
  admin: LayoutDashboard,
}

const TOOL_ICONS = [FileSpreadsheet, ClipboardList, BookOpen, CalendarCheck]

function visibilityClass(s) {
  if (!s.show_on_mobile && !s.show_on_desktop) return styles.hiddenMobile
  if (!s.show_on_mobile) return styles.hiddenMobile
  if (!s.show_on_desktop) return styles.hiddenDesktop
  return undefined
}

function HeroSection({
  s,
  content,
  breakingSettings = null,
  ctaHref,
  ctaLabel,
}) {
  const withBreaking = !!breakingSettings
  const c = content || DEFAULT_HOME_HERO_SLIDER
  const subjects = c.report?.subjects || []
  const months = c.chart?.months || []
  const marqueeItems = c.marquee?.items?.length
    ? c.marquee.items
    : DEFAULT_HOME_HERO_SLIDER.marquee.items

  return (
    <section
      className={`${styles.hero} ${withBreaking ? styles.heroWithBreaking : ''}`}
      aria-label="معرفی سامانه مدرسه"
    >
      <div className={styles.heroBg} aria-hidden />
      <div className={styles.heroGlow} aria-hidden />
      <div className={styles.heroGlowB} aria-hidden />
      <div className={styles.heroNoise} aria-hidden />

      {withBreaking ? (
        <div className={styles.heroBreaking} data-school-hero-breaking="1">
          <BreakingNews settings={breakingSettings} />
        </div>
      ) : null}

      <div className={`${styles.heroStage} ${withBreaking ? styles.heroStageWithBreaking : ''}`}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <Sparkles size={14} />
            {c.eyebrow || 'سامانه یکپارچه آموزش'}
          </p>
          <h1 className={styles.brand}>{c.brand || s.brand}</h1>
          <p className={styles.headline}>{c.headline || s.headline}</p>
          <p className={styles.subtitle}>{c.subtitle || s.subtitle}</p>
          {c.show_cta !== false || c.show_secondary !== false ? (
            <div className={styles.ctaRow}>
              {c.show_cta !== false ? (
                <Link href={ctaHref} className={styles.ctaPrimary}>
                  {ctaLabel}
                  <ArrowLeft size={17} />
                </Link>
              ) : null}
              {c.show_secondary !== false ? (
                <Link
                  href={c.secondary_href || s.secondary_href}
                  className={styles.ctaGhost}
                >
                  {c.secondary_label || s.secondary_label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.heroDeck} aria-hidden>
          {c.report?.show !== false ? (
            <div className={styles.floatReport}>
              <div className={styles.floatReportTop}>
                <strong>{c.report?.title || 'کارنامه ماهانه'}</strong>
                <span>{c.report?.rank || 'رتبه ۳ / ۲۸'}</span>
              </div>
              <div className={styles.floatGpa}>
                <em>{c.report?.gpa || '۱۷٫۸'}</em>
                <small>{c.report?.gpa_label || 'معدل'}</small>
              </div>
              <div className={styles.miniBars}>
                {subjects.slice(0, 4).map((row) => (
                  <div key={row.name} className={styles.miniBarRow}>
                    <span>{row.name}</span>
                    <div className={styles.miniBarTrack}>
                      <div
                        className={styles.miniBarFill}
                        style={{ width: `${row.bar}%` }}
                      />
                    </div>
                    <b>{row.score}</b>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {c.chart?.show !== false ? (
            <div className={styles.floatChart}>
              <div className={styles.floatChartHead}>
                <BarChart3 size={14} />
                {c.chart?.title || 'روند شش‌ماهه'}
              </div>
              <div className={styles.sparkBars}>
                {months.map((m, i) => (
                  <i
                    key={`${m.label}-${i}`}
                    style={{ height: `${m.v}%`, animationDelay: `${0.06 * i}s` }}
                    title={m.label}
                  />
                ))}
              </div>
              <p>
                <TrendingUp size={13} />
                {c.chart?.trend || 'رشد ۲۶٪ از مهر'}
              </p>
            </div>
          ) : null}

          {c.badge?.show !== false ? (
            <div className={styles.floatBadge}>
              <Brain size={16} />
              {c.badge?.text || 'IQ · EQ'}
            </div>
          ) : null}
        </div>
      </div>

      {c.marquee?.show !== false ? (
        <div className={styles.marquee} aria-hidden>
          <div className={styles.marqueeTrack}>
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`}>
                {item}
                <em />
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function PortalsSection({ content }) {
  const portals = content?.portals || DEFAULT_HOME_HERO_SLIDER.portals
  const fallbackById = Object.fromEntries(SCHOOL_PORTALS.map((p) => [p.id, p]))
  const items = (portals.items || []).filter((p) => p.show !== false)

  return (
    <section className={`${styles.portalsBand} ${styles.bgWhite}`} aria-label="ورود نقش‌ها">
      <div className={styles.wrap}>
        <header className={styles.bandHead}>
          <p className={styles.kickerOnLight}>
            <Sparkles size={13} />
            {portals.kicker}
          </p>
          <h2 className={styles.bandTitleDark}>
            {portals.title}
            <em>{portals.title_em}</em>
          </h2>
          <p className={styles.bandLeadDark}>{portals.lead}</p>
        </header>

        <div className={styles.bento}>
          {items.map((p) => {
            const Icon = PORTAL_ICONS[p.id] || GraduationCap
            const href = p.href || fallbackById[p.id]?.href || '/profile'
            return (
              <Link
                key={p.id}
                href={href}
                className={`${styles.bentoCard} ${styles[`bento_${p.id}`] || ''}`}
              >
                <span className={styles.bentoIcon}>
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                <div className={styles.bentoBody}>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
                <span className={styles.bentoGo}>
                  {portals.enter_label || 'ورود'}
                  <ArrowLeft size={13} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ReportPreviewSection({ content }) {
  const band = content?.report_band || DEFAULT_HOME_HERO_SLIDER.report_band
  const subjects = content?.report?.subjects?.length
    ? content.report.subjects
    : REPORT_SUBJECTS
  const months = content?.chart?.months?.length
    ? content.chart.months
    : CHART_MONTHS
  const stats = band.stats || []

  return (
    <section className={`${styles.reportBand} ${styles.bgRed}`} aria-label="کارنامه و نمودار">
      <div className={styles.bandGlowSoft} aria-hidden />
      <div className={styles.wrap}>
        <header className={styles.reportIntro}>
          <p className={styles.kickerOnDark}>
            <BarChart3 size={13} />
            {band.kicker}
          </p>
          <h2 className={styles.bandTitle}>
            {band.title}
            <em>{band.title_em}</em>
          </h2>
          <p className={styles.bandLead}>{band.lead}</p>
          <div className={styles.statRow}>
            {stats.map((st) => (
              <div key={st.label} className={styles.statPulse}>
                <strong>{st.value}</strong>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </header>

        <div className={styles.reportDeck}>
          <div className={`${styles.reportSheet} ${styles.sheetTiltA}`}>
            <div className={styles.reportSheetHead}>
              <div>
                <h3>{band.sheet_title}</h3>
                <p>{band.sheet_meta}</p>
              </div>
              <span className={styles.rankPill}>
                <Medal size={14} />
                {band.rank_pill}
              </span>
            </div>
            <ul className={styles.scoreList}>
              {subjects.map((row) => (
                <li key={row.name}>
                  <span>{row.name}</span>
                  <div className={styles.scoreMeter}>
                    <i style={{ width: `${row.bar}%` }} />
                  </div>
                  <b>{row.score}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.chartCard} ${styles.sheetTiltB}`}>
            <div className={styles.chartCardHead}>
              <BarChart3 size={15} />
              <span>{band.chart_title}</span>
            </div>
            <div className={styles.chartArea} role="img" aria-label="نمودار میله‌ای پیشرفت">
              {months.map((m, i) => (
                <div key={`${m.label}-${i}`} className={styles.chartCol}>
                  <div
                    className={styles.chartBar}
                    style={{ height: `${m.v}%`, animationDelay: `${0.08 * i}s` }}
                  />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <p className={styles.trendLine}>
              <TrendingUp size={14} />
              {band.chart_trend}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CounselingSection({ content, secondaryHref, counselorHref }) {
  const c = content?.counseling || DEFAULT_HOME_HERO_SLIDER.counseling
  const tests = c.tests?.length ? c.tests : COUNSELOR_TESTS
  const ctaHref = counselorHref || c.cta_href
  const secHref = secondaryHref || content?.secondary_href || '/profile'

  return (
    <section className={`${styles.counselBand} ${styles.bgWhite}`} aria-label="پنل مشاور">
      <div className={styles.wrap}>
        <div className={styles.counselGrid}>
          <div className={styles.counselCopy}>
            <p className={styles.kickerOnLight}>
              <HeartHandshake size={13} />
              {c.kicker}
            </p>
            <h2 className={styles.bandTitleDark}>
              {c.title}
              <em>{c.title_em}</em>
            </h2>
            <p className={styles.bandLeadDark}>{c.lead}</p>
            <div className={styles.testList}>
              {tests.map((t) => (
                <div key={t.title} className={`${styles.testItem} ${styles.testItemLight}`}>
                  <span className={styles.testItemIcon}>
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <strong>{t.title}</strong>
                    <span>{t.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${styles.ctaRow} ${styles.counselCta}`}>
              {c.show_cta !== false ? (
                <Link href={ctaHref} className={styles.ctaPrimary}>
                  {c.cta_label}
                  <ArrowLeft size={16} />
                </Link>
              ) : null}
              {c.show_secondary !== false ? (
                <Link href={secHref} className={styles.ctaGhostDark}>
                  {c.secondary_label}
                </Link>
              ) : null}
            </div>
          </div>

          <div className={styles.counselVisual} aria-hidden>
            <div className={styles.orbit} />
            <div className={styles.orbitInner} />
            <div className={styles.brainCore}>
              <Brain size={44} strokeWidth={1.35} />
            </div>
            <span className={`${styles.floatTag} ${styles.tagIq}`}>IQ شناختی</span>
            <span className={`${styles.floatTag} ${styles.tagEq}`}>EQ هیجانی</span>
            <span className={`${styles.floatTag} ${styles.tagFile}`}>پرونده</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ToolsSection({ content }) {
  const t = content?.tools || DEFAULT_HOME_HERO_SLIDER.tools
  const items = t.items?.length ? t.items : TEACHER_TOOLS

  return (
    <section className={`${styles.toolsBand} ${styles.bgGreen}`} aria-label="ابزار معلم">
      <div className={styles.bandGlowSoft} aria-hidden />
      <div className={styles.wrap}>
        <header className={styles.bandHead}>
          <p className={styles.kickerOnDark}>
            <GraduationCap size={13} />
            {t.kicker}
          </p>
          <h2 className={styles.bandTitle}>
            {t.title}
            <em>{t.title_em}</em>
          </h2>
          <p className={styles.bandLead}>{t.lead}</p>
        </header>
        <div className={styles.toolsRail}>
          {items.map((item, i) => {
            const Icon = TOOL_ICONS[i] || BookOpen
            return (
              <article key={item.title} className={styles.toolCard}>
                <span className={styles.toolNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.toolIcon}>
                  <Icon size={26} strokeWidth={1.45} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ClosingSection({ content, ctaHref, ctaLabel, counselorHref }) {
  const c = content?.closing || DEFAULT_HOME_HERO_SLIDER.closing

  return (
    <section className={`${styles.closing} ${styles.bgWhite}`} aria-label="شروع">
      <div className={styles.wrap}>
        <p className={styles.kickerOnLight}>
          <Sparkles size={13} />
          {c.kicker}
        </p>
        <h2 className={styles.closingTitleDark}>{c.title}</h2>
        <p className={styles.closingLeadDark}>{c.lead}</p>
        <div className={styles.ctaRow}>
          {c.show_cta !== false ? (
            <Link href={ctaHref} className={styles.ctaPrimary}>
              {ctaLabel}
              <ArrowLeft size={16} />
            </Link>
          ) : null}
          {c.show_counselor !== false ? (
            <Link href={counselorHref} className={styles.ctaGhostDark}>
              {c.counselor_label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function SchoolLanding({
  settings: raw = {},
  sections,
  breakingSettings: breakingProp = null,
} = {}) {
  const { isAuthenticated } = useAuth()
  const [heroContent, setHeroContent] = useState(() =>
    normalizeHomeHeroSlider(DEFAULT_HOME_HERO_SLIDER),
  )
  const s = normalizeSchoolSettings(raw)
  const embedBreaking =
    breakingProp != null ||
    raw?.embed_breaking === true ||
    raw?.show_breaking_in_hero === true
  const breakingSettings = embedBreaking
    ? buildHeroBreakingNewsSettings(
        breakingProp || raw?.breaking || raw?.breaking_news || {},
      )
    : null

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const settings = await fetchSiteSettings()
        if (cancelled) return
        setHeroContent(
          normalizeHomeHeroSlider(settings?.home_hero_slider || {}),
        )
      } catch {
        /* defaults remain */
      }
    })()
    const onChanged = (ev) => {
      if (ev?.detail) setHeroContent(normalizeHomeHeroSlider(ev.detail))
    }
    window.addEventListener('home-hero-slider-changed', onChanged)
    return () => {
      cancelled = true
      window.removeEventListener('home-hero-slider-changed', onChanged)
    }
  }, [])

  const mergedContent = useMemo(() => {
    // محتوای دیتابیس اولویت دارد؛ فیلدهای ویجت فقط به‌عنوان پشتیبان متن قدیمی
    return normalizeHomeHeroSlider({
      ...heroContent,
      brand: heroContent.brand || s.brand,
      headline: heroContent.headline || s.headline,
      subtitle: heroContent.subtitle || s.subtitle,
      cta_label: heroContent.cta_label || s.cta_label,
      cta_href: heroContent.cta_href || s.cta_href,
      secondary_label: heroContent.secondary_label || s.secondary_label,
      secondary_href: heroContent.secondary_href || s.secondary_href,
      show_on_mobile:
        heroContent.show_on_mobile !== false && s.show_on_mobile !== false,
      show_on_desktop:
        heroContent.show_on_desktop !== false && s.show_on_desktop !== false,
    })
  }, [heroContent, s])

  const show = useMemo(() => {
    if (sections) {
      return {
        hero: !!sections.hero,
        portals: !!sections.portals,
        report: !!sections.report,
        counseling: !!sections.counseling,
        tools: !!sections.tools,
        closing: !!sections.closing,
        mobile_dock: !!sections.mobile_dock,
      }
    }
    const sec = mergedContent.sections || {}
    return {
      hero: !s.hide_hero && sec.hero !== false,
      portals: !s.hide_portals && sec.portals !== false,
      report: sec.report_band !== false,
      counseling: sec.counseling !== false,
      tools: sec.tools !== false,
      closing: sec.closing !== false,
      mobile_dock: sec.mobile_dock !== false,
    }
  }, [mergedContent.sections, sections, s.hide_hero, s.hide_portals])

  const showDock =
    !s.hide_mobile_dock && show.hero !== false && show.mobile_dock !== false

  const cta = useMemo(() => {
    const href = mergedContent.cta_href || s.cta_href
    const label = mergedContent.cta_label || s.cta_label
    if (!isAuthenticated || !isLoginHref(href)) {
      return { href, label }
    }
    return {
      href: resolveAuthedHref(href, '/profile'),
      label: label || 'ورود به مدرسه',
    }
  }, [
    isAuthenticated,
    mergedContent.cta_href,
    mergedContent.cta_label,
    s.cta_href,
    s.cta_label,
  ])

  const studentHref = isAuthenticated
    ? '/profile?tab=students'
    : '/login?next=' + encodeURIComponent('/profile?tab=students')
  const teacherHref = isAuthenticated
    ? '/profile?tab=teacher'
    : '/login?next=' + encodeURIComponent('/profile?tab=teacher')
  const counselorHref = isAuthenticated
    ? '/profile?tab=counselor'
    : '/login?next=' + encodeURIComponent('/profile?tab=counselor')

  const visibilitySource = {
    show_on_mobile: mergedContent.show_on_mobile,
    show_on_desktop: mergedContent.show_on_desktop,
  }

  const themeStyle = useMemo(
    () => homePageThemeStyle(mergedContent.theme),
    [mergedContent.theme],
  )

  return (
    <div
      className={`${styles.root} ${breakingSettings ? styles.rootHeroBreaking : ''} ${showDock ? styles.appShell : ''} ${visibilityClass(visibilitySource) || ''}`}
      style={themeStyle}
    >
      {show.hero ? (
        <HeroSection
          s={s}
          content={mergedContent}
          breakingSettings={breakingSettings}
          ctaHref={cta.href}
          ctaLabel={cta.label}
        />
      ) : null}
      {show.portals ? <PortalsSection content={mergedContent} /> : null}
      {show.report ? <ReportPreviewSection content={mergedContent} /> : null}
      {show.counseling ? (
        <CounselingSection
          content={mergedContent}
          counselorHref={counselorHref}
          secondaryHref={
            isAuthenticated
              ? resolveAuthedHref(
                  mergedContent.secondary_href || s.secondary_href,
                  '/profile',
                )
              : mergedContent.secondary_href || s.secondary_href
          }
        />
      ) : null}
      {show.tools ? <ToolsSection content={mergedContent} /> : null}
      {show.closing ? (
        <ClosingSection
          content={mergedContent}
          ctaHref={cta.href}
          ctaLabel={cta.label}
          counselorHref={counselorHref}
        />
      ) : null}

      {showDock && mergedContent.show_cta !== false ? (
        <nav className={styles.mobileDock} aria-label="میانبر موبایل">
          <Link href={cta.href} className={styles.mobileDockPrimary}>
            {cta.label}
            <ArrowLeft size={16} />
          </Link>
          <Link href={studentHref} className={styles.mobileDockItem}>
            <BookOpen size={18} strokeWidth={1.8} />
            <span>دانش‌آموز</span>
          </Link>
          <Link href={teacherHref} className={styles.mobileDockItem}>
            <GraduationCap size={18} strokeWidth={1.8} />
            <span>معلم</span>
          </Link>
          <Link href={counselorHref} className={styles.mobileDockItem}>
            <HeartHandshake size={18} strokeWidth={1.8} />
            <span>مشاور</span>
          </Link>
        </nav>
      ) : null}
    </div>
  )
}

export function SchoolHero({ settings } = {}) {
  return <SchoolLanding settings={settings} sections={{ hero: true }} />
}

/** هیرو خبر فوری — خبر فوری شفاف روی گرادیان هیرو، یک تکه */
export function SchoolHeroBreaking({ settings: raw = {} } = {}) {
  return (
    <SchoolLanding
      settings={{ ...raw, embed_breaking: true, hide_hero: false }}
      breakingSettings={raw?.breaking || raw?.breaking_news || null}
    />
  )
}

export function SchoolPortals({ settings } = {}) {
  return <SchoolLanding settings={settings} sections={{ portals: true }} />
}

export function SchoolReportPreview({ settings } = {}) {
  return <SchoolLanding settings={settings} sections={{ report: true }} />
}

export function SchoolCounseling({ settings } = {}) {
  return <SchoolLanding settings={settings} sections={{ counseling: true }} />
}

export function SchoolClosing({ settings } = {}) {
  return <SchoolLanding settings={settings} sections={{ closing: true }} />
}
