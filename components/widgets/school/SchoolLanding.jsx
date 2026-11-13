'use client'

import React, { useMemo } from 'react'
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

function resolveAuthedHref(href, fallback = '/school') {
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

const MARQUEE = [
  'کارنامه ماهانه',
  'نمودار پیشرفت',
  'پنل مشاور',
  'آزمون IQ / EQ',
  'حضور و غیاب',
  'آزمون‌ساز',
  'رتبه کلاسی',
  'تکالیف تصویری',
]

function visibilityClass(s) {
  if (!s.show_on_mobile && !s.show_on_desktop) return styles.hiddenMobile
  if (!s.show_on_mobile) return styles.hiddenMobile
  if (!s.show_on_desktop) return styles.hiddenDesktop
  return undefined
}

function HeroSection({ s, breakingSettings = null, ctaHref, ctaLabel }) {
  const withBreaking = !!breakingSettings
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
            سامانه یکپارچه آموزش
          </p>
          <h1 className={styles.brand}>{s.brand}</h1>
          <p className={styles.headline}>{s.headline}</p>
          <p className={styles.subtitle}>{s.subtitle}</p>
          <div className={styles.ctaRow}>
            <Link href={ctaHref} className={styles.ctaPrimary}>
              {ctaLabel}
              <ArrowLeft size={17} />
            </Link>
            <Link href={s.secondary_href} className={styles.ctaGhost}>
              {s.secondary_label}
            </Link>
          </div>
        </div>

        <div className={styles.heroDeck} aria-hidden>
          <div className={styles.floatReport}>
            <div className={styles.floatReportTop}>
              <strong>کارنامه ماهانه</strong>
              <span>رتبه ۳ / ۲۸</span>
            </div>
            <div className={styles.floatGpa}>
              <em>۱۷٫۸</em>
              <small>معدل</small>
            </div>
            <div className={styles.miniBars}>
              {REPORT_SUBJECTS.slice(0, 4).map((row) => (
                <div key={row.name} className={styles.miniBarRow}>
                  <span>{row.name}</span>
                  <div className={styles.miniBarTrack}>
                    <div className={styles.miniBarFill} style={{ width: `${row.bar}%` }} />
                  </div>
                  <b>{row.score}</b>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.floatChart}>
            <div className={styles.floatChartHead}>
              <BarChart3 size={14} />
              روند شش‌ماهه
            </div>
            <div className={styles.sparkBars}>
              {CHART_MONTHS.map((m, i) => (
                <i
                  key={m.label}
                  style={{ height: `${m.v}%`, animationDelay: `${0.06 * i}s` }}
                  title={m.label}
                />
              ))}
            </div>
            <p>
              <TrendingUp size={13} />
              رشد ۲۶٪ از مهر
            </p>
          </div>

          <div className={styles.floatBadge}>
            <Brain size={16} />
            IQ · EQ
          </div>
        </div>
      </div>

      <div className={styles.marquee} aria-hidden>
        <div className={styles.marqueeTrack}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`}>
              {item}
              <em />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortalsSection() {
  const byId = Object.fromEntries(SCHOOL_PORTALS.map((p) => [p.id, p]))
  const order = ['admin', 'counselor', 'teacher', 'student']

  return (
    <section className={`${styles.portalsBand} ${styles.bgWhite}`} aria-label="ورود نقش‌ها">
      <div className={styles.wrap}>
        <header className={styles.bandHead}>
          <p className={styles.kickerOnLight}>
            <Sparkles size={13} />
            چهار درگاه زنده
          </p>
          <h2 className={styles.bandTitleDark}>
            هر نقش،
            <em> صحنه خودش</em>
          </h2>
          <p className={styles.bandLeadDark}>
            مدیر، مشاور، معلم و دانش‌آموز — ورود جدا، امکانات اختصاصی، یک هسته مشترک.
          </p>
        </header>

        <div className={styles.bento}>
          {order.map((id) => {
            const p = byId[id]
            const Icon = PORTAL_ICONS[id]
            return (
              <Link
                key={id}
                href={p.href}
                className={`${styles.bentoCard} ${styles[`bento_${id}`]}`}
              >
                <span className={styles.bentoIcon}>
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                <div className={styles.bentoBody}>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
                <span className={styles.bentoGo}>
                  ورود
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

function ReportPreviewSection() {
  return (
    <section className={`${styles.reportBand} ${styles.bgRed}`} aria-label="کارنامه و نمودار">
      <div className={styles.bandGlowSoft} aria-hidden />
      <div className={styles.wrap}>
        <header className={styles.reportIntro}>
          <p className={styles.kickerOnDark}>
            <BarChart3 size={13} />
            کارنامه هوشمند
          </p>
          <h2 className={styles.bandTitle}>
            نمره را ببین،
            <em> مسیر را بساز</em>
          </h2>
          <p className={styles.bandLead}>
            معدل، رتبه کلاسی و نمودار شش‌ماهه — همان چیزی که دانش‌آموز و والدین در پنل می‌بینند.
          </p>
          <div className={styles.statRow}>
            <div className={styles.statPulse}>
              <strong>۱۷٫۸</strong>
              <span>معدل</span>
            </div>
            <div className={styles.statPulse}>
              <strong>۳</strong>
              <span>رتبه کلاس</span>
            </div>
            <div className={styles.statPulse}>
              <strong>۲۶٪</strong>
              <span>رشد ترم</span>
            </div>
          </div>
        </header>

        <div className={styles.reportDeck}>
          <div className={`${styles.reportSheet} ${styles.sheetTiltA}`}>
            <div className={styles.reportSheetHead}>
              <div>
                <h3>کارنامه آذر</h3>
                <p>پایه نهم · نمونه زنده</p>
              </div>
              <span className={styles.rankPill}>
                <Medal size={14} />
                رتبه ۳
              </span>
            </div>
            <ul className={styles.scoreList}>
              {REPORT_SUBJECTS.map((row) => (
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
              <span>نمودار پیشرفت</span>
            </div>
            <div className={styles.chartArea} role="img" aria-label="نمودار میله‌ای پیشرفت">
              {CHART_MONTHS.map((m, i) => (
                <div key={m.label} className={styles.chartCol}>
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
              رشد از مهر تا اسفند · تمرکز بعدی: ریاضی و انگلیسی
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CounselingSection({ s }) {
  return (
    <section className={`${styles.counselBand} ${styles.bgWhite}`} aria-label="پنل مشاور">
      <div className={styles.wrap}>
        <div className={styles.counselGrid}>
          <div className={styles.counselCopy}>
            <p className={styles.kickerOnLight}>
              <HeartHandshake size={13} />
              پنل مشاور
            </p>
            <h2 className={styles.bandTitleDark}>
              هوش و هیجان،
              <em> کنار هم</em>
            </h2>
            <p className={styles.bandLeadDark}>
              آزمون IQ و EQ، پرونده دانش‌آموز و پیشنهاد مسیر رشد — صحنه اختصاصی مشاور مدرسه.
            </p>
            <div className={styles.testList}>
              {COUNSELOR_TESTS.map((t) => (
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
              <Link href="/login?next=/school/counselor" className={styles.ctaPrimary}>
                ورود مشاور
                <ArrowLeft size={16} />
              </Link>
              <Link href={s.secondary_href} className={styles.ctaGhostDark}>
                آزمون دانش‌آموز
              </Link>
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

function ToolsSection() {
  return (
    <section className={`${styles.toolsBand} ${styles.bgGreen}`} aria-label="ابزار معلم">
      <div className={styles.bandGlowSoft} aria-hidden />
      <div className={styles.wrap}>
        <header className={styles.bandHead}>
          <p className={styles.kickerOnDark}>
            <GraduationCap size={13} />
            جریان کار معلم
          </p>
          <h2 className={styles.bandTitle}>
            از نمره
            <em> تا حضور</em>
          </h2>
          <p className={styles.bandLead}>
            چهار ستون اصلی داشبورد معلم — سریع، شفاف، آماده کلاس.
          </p>
        </header>
        <div className={styles.toolsRail}>
          {TEACHER_TOOLS.map((t, i) => {
            const Icon = TOOL_ICONS[i] || BookOpen
            return (
              <article key={t.title} className={styles.toolCard}>
                <span className={styles.toolNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.toolIcon}>
                  <Icon size={26} strokeWidth={1.45} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ClosingSection({ s, ctaHref, ctaLabel, counselorHref }) {
  return (
    <section className={`${styles.closing} ${styles.bgWhite}`} aria-label="شروع">
      <div className={styles.wrap}>
        <p className={styles.kickerOnLight}>
          <Sparkles size={13} />
          الان شروع کن
        </p>
        <h2 className={styles.closingTitleDark}>مدرسه‌تان روشن است</h2>
        <p className={styles.closingLeadDark}>
          کارنامه، نمودار، مشاوره و کلاس — با یک ورود در دسترس.
        </p>
        <div className={styles.ctaRow}>
          <Link href={ctaHref} className={styles.ctaPrimary}>
            {ctaLabel}
            <ArrowLeft size={16} />
          </Link>
          <Link href={counselorHref} className={styles.ctaGhostDark}>
            پنل مشاور
          </Link>
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
  const s = normalizeSchoolSettings(raw)
  const show = sections || {
    hero: !s.hide_hero,
    portals: !s.hide_portals,
    report: true,
    counseling: true,
    tools: true,
    closing: true,
  }
  const showDock = !s.hide_mobile_dock && show.hero !== false
  const embedBreaking =
    breakingProp != null ||
    raw?.embed_breaking === true ||
    raw?.show_breaking_in_hero === true
  const breakingSettings = embedBreaking
    ? buildHeroBreakingNewsSettings(
        breakingProp || raw?.breaking || raw?.breaking_news || {},
      )
    : null

  const cta = useMemo(() => {
    if (!isAuthenticated || !isLoginHref(s.cta_href)) {
      return { href: s.cta_href, label: s.cta_label }
    }
    return {
      href: resolveAuthedHref(s.cta_href, '/school'),
      label: 'ورود به مدرسه',
    }
  }, [isAuthenticated, s.cta_href, s.cta_label])

  const studentHref = isAuthenticated
    ? '/profile?tab=students'
    : '/login?next=' + encodeURIComponent('/profile?tab=students')
  const teacherHref = isAuthenticated
    ? '/profile?tab=teacher'
    : '/login?next=' + encodeURIComponent('/profile?tab=teacher')
  const counselorHref = isAuthenticated
    ? '/profile?tab=counselor'
    : '/login?next=' + encodeURIComponent('/profile?tab=counselor')

  return (
    <div
      className={`${styles.root} ${breakingSettings ? styles.rootHeroBreaking : ''} ${showDock ? styles.appShell : ''} ${visibilityClass(s) || ''}`}
    >
      {show.hero ? (
        <HeroSection
          s={s}
          breakingSettings={breakingSettings}
          ctaHref={cta.href}
          ctaLabel={cta.label}
        />
      ) : null}
      {show.portals ? <PortalsSection /> : null}
      {show.report ? <ReportPreviewSection /> : null}
      {show.counseling ? <CounselingSection s={s} /> : null}
      {show.tools ? <ToolsSection /> : null}
      {show.closing ? (
        <ClosingSection
          s={s}
          ctaHref={cta.href}
          ctaLabel={cta.label}
          counselorHref={counselorHref}
        />
      ) : null}

      {showDock ? (
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
