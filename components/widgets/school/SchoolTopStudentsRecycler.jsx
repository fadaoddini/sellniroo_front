'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  isTopStudentsFramePlain,
  normalizeSchoolTopStudentsSettings,
  resolveSchoolTopClassCards,
  schoolTopStudentsCssVars,
  topStudentPlaceTone,
} from '@/config/schoolTopStudentsWidgetSettings'
import frame from './SchoolTeacherIntroRecycler.module.css'
import styles from './SchoolTopStudentsRecycler.module.css'

function resolveSideImageSrc(url) {
  if (!url) return ''
  const raw = String(url).trim()
  if (!raw) return ''
  if (
    raw.startsWith('data:') ||
    raw.startsWith('blob:') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://')
  ) {
    return raw
  }
  if (raw.startsWith('/media/') || raw.startsWith('/images/')) return raw
  if (raw.startsWith('media/')) return `/${raw}`
  if (raw.startsWith('/')) return raw
  return `/media/${raw.replace(/^\/+/, '')}`
}

function faPlace(n) {
  try {
    return new Intl.NumberFormat('fa-IR').format(n)
  } catch {
    return String(n)
  }
}

const TONE_CLASS = {
  gold: styles.rowGold,
  silver: styles.rowSilver,
  bronze: styles.rowBronze,
  plain: styles.rowPlain,
}

function PlaceIcon({ place }) {
  const props = { size: 11, strokeWidth: 2.35, 'aria-hidden': true }
  if (place === 1) return <Crown {...props} />
  if (place === 2) return <Medal {...props} />
  if (place === 3) return <Award {...props} />
  return <Star {...props} />
}

export default function SchoolTopStudentsRecycler({ settings: raw = {} }) {
  const settings = useMemo(
    () => normalizeSchoolTopStudentsSettings(raw),
    [raw],
  )
  const classCards = useMemo(
    () => resolveSchoolTopClassCards(settings),
    [settings],
  )
  const trackRef = useRef(null)

  const visibilityClass =
    !settings.show_on_mobile && !settings.show_on_desktop
      ? frame.hiddenMobile
      : !settings.show_on_mobile
        ? frame.hiddenMobile
        : !settings.show_on_desktop
          ? frame.hiddenDesktop
          : ''

  const scrollByDir = (sign) => {
    const el = trackRef.current
    if (!el) return
    const step = (settings.card_width || 178) + (settings.gap || 10)
    const rtl = getComputedStyle(el).direction === 'rtl'
    const delta = (rtl ? -sign : sign) * step
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return undefined
    let dragging = false
    let startX = 0
    let startScroll = 0

    const onDown = (e) => {
      dragging = true
      startX = e.pageX || e.touches?.[0]?.pageX || 0
      startScroll = el.scrollLeft
    }
    const onMove = (e) => {
      if (!dragging) return
      const x = e.pageX || e.touches?.[0]?.pageX || 0
      el.scrollLeft = startScroll - (x - startX)
    }
    const onUp = () => {
      dragging = false
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onUp)
    }
  }, [classCards.length])

  const vars = schoolTopStudentsCssVars(settings)
  const framePlain = isTopStudentsFramePlain(settings)
  const sideSrc = settings.side_image
    ? resolveSideImageSrc(settings.side_image)
    : ''
  const showSide =
    Boolean(sideSrc) && settings.show_side_image !== false
  const sideIsLeft = settings.side_image_side === 'left'
  const arrowsAtEnd = settings.arrows_side !== 'start'

  const navButtons =
    settings.show_arrows !== false ||
    (settings.show_more_link && settings.more_href) ? (
      <div
        className={frame.navGroup}
        style={{
          background: vars['--sti-frame-body'] || vars['--sti-frame'],
          ['--sti-nav-bg']:
            vars['--sti-frame-body'] || vars['--sti-frame'] || '#8e0413',
        }}
      >
        {settings.show_arrows !== false ? (
          <>
            <button
              type="button"
              className={frame.navBtn}
              aria-label="قبلی"
              onClick={() => scrollByDir(-1)}
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className={frame.navBtn}
              aria-label="بعدی"
              onClick={() => scrollByDir(1)}
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>
          </>
        ) : null}
        {settings.show_more_link && settings.more_href ? (
          <Link href={settings.more_href} className={frame.more}>
            {settings.more_label || 'مشاهده همه'}
            <ArrowLeft size={12} strokeWidth={2.4} />
          </Link>
        ) : null}
      </div>
    ) : null

  const sidePanel = showSide ? (
    <aside className={frame.sidePanel}>
      {String(settings.side_image_title || '').trim() ? (
        <h3 className={frame.sideTitle}>{settings.side_image_title}</h3>
      ) : null}
      <div className={frame.sideImageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sideSrc}
          alt={
            settings.side_image_alt ||
            String(settings.side_image_title || '').trim() ||
            'نفرات برتر'
          }
        />
      </div>
      {String(settings.side_image_caption || '').trim() ? (
        <p className={frame.sideCaption}>{settings.side_image_caption}</p>
      ) : null}
    </aside>
  ) : null

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SCHOOL}>
      <section
        className={`${frame.root} ${settings.section_full ? frame.rootFull : frame.rootBoxed} ${visibilityClass}`}
        style={vars}
        data-school-top-students="1"
        aria-label={settings.title || 'نفرات برتر مدرسه'}
      >
        <div className={frame.inner}>
          <div
            className={`${frame.frame} ${framePlain ? frame.framePlain : ''}`}
          >
            <div
              className={`${frame.frameTop} ${
                arrowsAtEnd ? frame.frameTopEnd : frame.frameTopStart
              } ${arrowsAtEnd ? frame.navDockEnd : frame.navDockStart}`}
            >
              {arrowsAtEnd ? (
                <>
                  <div className={frame.frameTopCopy}>
                    {settings.show_title !== false ? (
                      <>
                        <p className={frame.kicker}>
                          <Trophy size={11} strokeWidth={2.35} />
                          افتخارات
                        </p>
                        <h2 className={frame.title}>{settings.title}</h2>
                      </>
                    ) : null}
                    {settings.show_subtitle && settings.subtitle ? (
                      <p className={frame.subtitle}>{settings.subtitle}</p>
                    ) : null}
                  </div>
                  {navButtons}
                </>
              ) : (
                <>
                  {navButtons}
                  <div
                    className={frame.frameTopCopy}
                    style={{ textAlign: 'start' }}
                  >
                    {settings.show_title !== false ? (
                      <>
                        <p className={frame.kicker}>
                          <Trophy size={11} strokeWidth={2.35} />
                          افتخارات
                        </p>
                        <h2 className={frame.title}>{settings.title}</h2>
                      </>
                    ) : null}
                    {settings.show_subtitle && settings.subtitle ? (
                      <p className={frame.subtitle}>{settings.subtitle}</p>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {!classCards.length && !showSide ? (
              <div className={frame.empty}>
                هنوز کلاسی برای نمایش نفرات برتر تنظیم نشده است.
              </div>
            ) : (
              <div
                className={`${frame.frameBody} ${
                  sideIsLeft
                    ? frame.frameBodySideLeft
                    : frame.frameBodySideRight
                }`}
                style={{
                  background: vars['--sti-frame-body'],
                  borderRadius: `${vars['--sti-body-r-tl']} ${vars['--sti-body-r-tr']} ${vars['--sti-body-r-br']} ${vars['--sti-body-r-bl']}`,
                }}
              >
                {sidePanel}
                <div
                  ref={trackRef}
                  className={`${frame.track} ${
                    settings.show_scrollbar
                      ? frame.trackShowBar
                      : frame.trackHideBar
                  }`}
                >
                  {!classCards.length ? (
                    <div className={frame.emptyInline}>
                      هنوز کلاسی برای نمایش نفرات برتر تنظیم نشده است.
                    </div>
                  ) : null}
                  {classCards.map((cls) => (
                    <article key={cls.id} className={frame.card}>
                      <div className={frame.qrBox} aria-hidden>
                        <span className={styles.trophyBadge}>
                          <Trophy size={18} strokeWidth={2.2} />
                        </span>
                      </div>
                      <header className={styles.cardHead}>
                        <div className={styles.cardTitleRow}>
                          <span className={styles.classIcon}>
                            <Users size={12} strokeWidth={2.35} />
                          </span>
                          <h3 className={styles.className}>{cls.label}</h3>
                        </div>
                        <span className={styles.classMeta}>
                          <Trophy size={10} strokeWidth={2.35} />
                          {faPlace(cls.students.length)} نفر برتر
                        </span>
                      </header>

                      {!cls.students.length ? (
                        <p className={styles.cardEmpty}>لیست خالی است</p>
                      ) : (
                        <ol className={styles.list}>
                          {cls.students.map((person, index) => {
                            const place = index + 1
                            const tone = topStudentPlaceTone(place)
                            const rowClass = `${styles.row} ${TONE_CLASS[tone] || styles.rowPlain}`
                            const body = (
                              <>
                                <span
                                  className={styles.place}
                                  title={`رتبه ${place}`}
                                >
                                  <PlaceIcon place={place} />
                                </span>
                                <p className={styles.name}>{person.name}</p>
                                {settings.show_score && person.score ? (
                                  <span className={styles.score}>
                                    {person.score}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                {settings.show_points && person.points > 0 ? (
                                  <span className={styles.points}>
                                    <Star size={9} strokeWidth={2.4} />
                                    {faPlace(person.points)}
                                  </span>
                                ) : (
                                  <span />
                                )}
                              </>
                            )
                            if (person.href) {
                              return (
                                <li key={person.id}>
                                  <Link href={person.href} className={rowClass}>
                                    {body}
                                  </Link>
                                </li>
                              )
                            }
                            return (
                              <li key={person.id}>
                                <div className={rowClass}>{body}</div>
                              </li>
                            )
                          })}
                        </ol>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </ModuleGate>
  )
}
