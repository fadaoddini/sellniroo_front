'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clapperboard,
  Package,
  Wrench,
  ArrowLeft,
  Search,
} from 'lucide-react'
import {
  getNobatTypeDefaults,
  nobatCssVars,
  normalizeNobatWidgetSettings,
} from '@/config/nobatWidgetSettings'
import styles from './NobatWidgets.module.css'

const ICONS = {
  Package,
  Calendar,
  Wrench,
  Clapperboard,
}

function useNobat(raw, type) {
  const settings = useMemo(
    () => normalizeNobatWidgetSettings(raw, type),
    [raw, type],
  )
  const style = useMemo(() => nobatCssVars(settings), [settings])
  const visible =
    (typeof window === 'undefined' || window.innerWidth >= 768
      ? settings.show_on_desktop !== false
      : settings.show_on_mobile !== false)
  return { settings, style, visible: settings.show_on_desktop !== false || settings.show_on_mobile !== false }
}

function Eyebrow({ text }) {
  if (!text) return null
  return (
    <p className={styles.eyebrow}>
      <i />
      {text}
    </p>
  )
}

function Head({ settings, center }) {
  return (
    <header className={center ? styles.headCenter : undefined}>
      <Eyebrow text={settings.eyebrow} />
      {settings.title ? <h2 className={styles.title}>{settings.title}</h2> : null}
      {settings.subtitle ? (
        <p className={styles.subtitle}>{settings.subtitle}</p>
      ) : null}
    </header>
  )
}

export function NobatHero({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_hero')
  if (!visible) return null
  const badges = [s.badge_a, s.badge_b, s.badge_c].filter(Boolean)

  return (
    <section className={`${styles.section} ${styles.hero}`} style={style} dir="rtl" lang="fa">
      <div className={styles.beam} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Eyebrow text={s.eyebrow} />
            {s.title ? <h1 className={styles.title}>{s.title}</h1> : null}
            {s.subtitle ? <p className={styles.subtitle}>{s.subtitle}</p> : null}
            <div className={styles.heroActions}>
              {s.primary_label ? (
                <Link href={s.primary_href || '/repairs'} className={styles.btnPrimary}>
                  {s.primary_label}
                </Link>
              ) : null}
              {s.secondary_label ? (
                <Link href={s.secondary_href || '/shop'} className={styles.btnSecondary}>
                  {s.secondary_label}
                </Link>
              ) : null}
              {s.tertiary_label ? (
                <Link href={s.tertiary_href || '/repairs'} className={styles.btnGhost}>
                  {s.tertiary_label}
                </Link>
              ) : null}
            </div>
          </div>
          <aside className={styles.heroPanel} aria-label="ویژگی‌های صدرا">
            <ul className={styles.badgeList}>
              {badges.map((b) => (
                <li key={b}>
                  <span className={styles.badgeDot} />
                  {b}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function NobatPillars({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_pillars')
  if (!visible) return null
  const items = Array.isArray(s.items) && s.items.length
    ? s.items
    : getNobatTypeDefaults('nobat_pillars').items

  return (
    <section className={`${styles.section} ${styles.light}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <Head settings={s} center />
        <div className={styles.grid4}>
          {items.map((item) => {
            const Icon = ICONS[item.icon] || Package
            const body = (
              <>
                <span
                  className={styles.iconWrap}
                  style={{ '--accent': item.accent || '#dbbe00' }}
                  aria-hidden
                >
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3>{item.title}</h3>
                {item.text ? <p>{item.text}</p> : null}
              </>
            )
            if (item.href) {
              return (
                <Link
                  key={item.id || item.title}
                  href={item.href}
                  className={styles.pillarCard}
                >
                  {body}
                </Link>
              )
            }
            return (
              <article key={item.id || item.title} className={styles.pillarCard}>
                {body}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function NobatParts({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_parts')
  if (!visible) return null
  const items = Array.isArray(s.items) && s.items.length
    ? s.items
    : getNobatTypeDefaults('nobat_parts').items

  return (
    <section className={`${styles.section} ${styles.light}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <div className={styles.partsTop}>
          <Head settings={s} />
          {s.cta_label ? (
            <Link href={s.cta_href || '/shop'} className={styles.linkCta}>
              {s.cta_label}
              <ArrowLeft size={16} />
            </Link>
          ) : null}
        </div>
        <div className={styles.partsGrid}>
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href || '/shop'}
              className={styles.partCard}
            >
              {item.tag ? <span className={styles.partTag}>{item.tag}</span> : null}
              <h3>{item.title}</h3>
              {item.desc ? <p>{item.desc}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NobatSearch({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_search')
  const router = useRouter()
  const [q, setQ] = useState('')
  if (!visible) return null

  const hasLabel = !!s.submit_label
  const hrefBase = s.results_href || '/shop'

  return (
    <section
      className={`${styles.section} ${styles.searchSection} ${styles.light}`}
      style={style}
      dir="rtl"
      lang="fa"
    >
      <div className={styles.inner}>
        <div className={styles.searchWrap}>
          {(s.title || s.eyebrow) && (
            <header className={styles.headCenter} style={{ marginBottom: 4 }}>
              <Eyebrow text={s.eyebrow} />
              {s.title ? (
                <h2 className={styles.title} style={{ fontSize: '1.15rem' }}>
                  {s.title}
                </h2>
              ) : null}
            </header>
          )}
          <form
            className={styles.searchForm}
            onSubmit={(e) => {
              e.preventDefault()
              const query = q.trim()
              router.push(
                query
                  ? `${hrefBase}${hrefBase.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`
                  : hrefBase,
              )
            }}
          >
            <Search className={styles.searchIcon} size={18} strokeWidth={1.75} aria-hidden />
            <input
              className={styles.searchInput}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={s.placeholder || 'جستجوی قطعه…'}
              aria-label={s.placeholder || 'جستجوی قطعه'}
              autoComplete="off"
            />
            <button
              type="submit"
              className={`${styles.searchSubmit} ${hasLabel ? '' : styles.searchSubmitIconOnly}`}
              aria-label={hasLabel ? s.submit_label : 'جستجو'}
            >
              {hasLabel ? s.submit_label : <Search size={16} strokeWidth={2.2} />}
            </button>
          </form>
          {s.hint ? <p className={styles.searchHint}>{s.hint}</p> : null}
        </div>
      </div>
    </section>
  )
}

export function NobatProcess({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_process')
  if (!visible) return null
  const steps = Array.isArray(s.steps) && s.steps.length
    ? s.steps
    : getNobatTypeDefaults('nobat_process').steps

  return (
    <section className={`${styles.section} ${styles.light}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <Head settings={s} center />
        <div className={styles.steps}>
          {steps.map((step) => (
            <article key={step.n || step.title} className={styles.step}>
              {step.n ? <span className={styles.stepN}>{step.n}</span> : null}
              <h3>{step.title}</h3>
              {step.text ? <p>{step.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NobatBook({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_book')
  if (!visible) return null

  return (
    <section className={`${styles.section} ${styles.book}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <div className={styles.bookRow}>
          <div>
            <Eyebrow text={s.eyebrow} />
            {s.title ? <h2 className={styles.title}>{s.title}</h2> : null}
            {s.subtitle ? <p className={styles.subtitle}>{s.subtitle}</p> : null}
          </div>
          <div className={styles.heroActions}>
            {s.primary_label ? (
              <Link href={s.primary_href || '/repairs'} className={styles.btnPrimary}>
                {s.primary_label}
              </Link>
            ) : null}
            {s.secondary_label ? (
              <Link href={s.secondary_href || '/repairs?tab=track'} className={styles.btnSecondary}>
                {s.secondary_label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function NobatTeam({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_team')
  if (!visible) return null
  const items = Array.isArray(s.items) && s.items.length
    ? s.items
    : getNobatTypeDefaults('nobat_team').items

  return (
    <section className={`${styles.section} ${styles.light}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <Head settings={s} center />
        <div className={styles.teamGrid}>
          {items.map((person) => {
            const initials = String(person.name || 'ص')
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
            return (
              <article key={person.name} className={styles.teamCard}>
                <div className={styles.avatar} aria-hidden>
                  {initials}
                </div>
                <h3>{person.name}</h3>
                {person.role ? <p className={styles.teamRole}>{person.role}</p> : null}
                <p className={styles.teamMeta}>
                  {[person.city, person.specialty].filter(Boolean).join(' · ')}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function NobatReport({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_report')
  if (!visible) return null
  const points = Array.isArray(s.points) && s.points.length
    ? s.points
    : getNobatTypeDefaults('nobat_report').points

  return (
    <section className={`${styles.section} ${styles.light}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <Head settings={s} />
        <div className={styles.reportGrid}>
          <ul className={styles.pointList}>
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <aside className={styles.reportPanel}>
            <p>
              گزارش کامل هر دستگاه در پرونده سرویس ذخیره می‌شود تا برای مراجعات بعدی
              در دسترس باشد.
            </p>
            <div className={styles.reportActions}>
              {s.primary_label ? (
                <Link href={s.primary_href || '/repairs#track'} className={styles.btnPrimary}>
                  {s.primary_label}
                </Link>
              ) : null}
              {s.secondary_label ? (
                <Link href={s.secondary_href || '/repairs'} className={styles.btnSecondary}>
                  {s.secondary_label}
                </Link>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function NobatClosing({ settings: raw = {} }) {
  const { settings: s, style, visible } = useNobat(raw, 'nobat_closing')
  if (!visible) return null

  return (
    <section className={`${styles.section} ${styles.closing}`} style={style} dir="rtl" lang="fa">
      <div className={styles.inner}>
        <Head settings={s} center />
        <div className={styles.closingActions}>
          {s.primary_label ? (
            <Link href={s.primary_href || '/repairs'} className={styles.btnPrimary}>
              {s.primary_label}
            </Link>
          ) : null}
          {s.secondary_label ? (
            <Link href={s.secondary_href || '/#contact'} className={styles.btnSecondary}>
              {s.secondary_label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function renderNobatWidget(type, settings) {
  switch (type) {
    case 'nobat_hero':
      return <NobatHero settings={settings} />
    case 'nobat_pillars':
      return <NobatPillars settings={settings} />
    case 'nobat_parts':
      return <NobatParts settings={settings} />
    case 'nobat_search':
      return <NobatSearch settings={settings} />
    case 'nobat_process':
      return <NobatProcess settings={settings} />
    case 'nobat_book':
      return <NobatBook settings={settings} />
    case 'nobat_team':
      return <NobatTeam settings={settings} />
    case 'nobat_report':
      return <NobatReport settings={settings} />
    case 'nobat_closing':
      return <NobatClosing settings={settings} />
    default:
      return null
  }
}

export { NOBAT_WIDGET_TYPES } from '@/config/nobatWidgetSettings'
