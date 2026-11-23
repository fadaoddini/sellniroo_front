'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  QrCode,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  teacherPublicAbsoluteUrl,
  teacherQrImageUrl,
} from '@/components/School/teacherQr'
import schoolService from '@/components/School/services/schoolService'
import {
  isTeacherIntroFramePlain,
  normalizeSchoolTeacherIntroSettings,
  resolveTeacherIntroList,
  schoolTeacherIntroCssVars,
} from '@/config/schoolTeacherIntroWidgetSettings'
import styles from './SchoolTeacherIntroRecycler.module.css'

/**
 * مسیر تصویر کناری — data/http مطلق را نگه می‌دارد؛
 * مسیرهای /media را هم نسبی می‌گذارد (ری‌رایت Next) هم به‌عنوان fallback قابل‌استفاده است.
 */
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

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'م'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

export default function SchoolTeacherIntroRecycler({ settings: raw = {} }) {
  const settings = useMemo(
    () => normalizeSchoolTeacherIntroSettings(raw),
    [raw],
  )
  const [apiTeachers, setApiTeachers] = useState(null)
  const trackRef = useRef(null)

  useEffect(() => {
    if (settings.items?.length) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const res = await schoolService.listTeachers()
        if (cancelled || !res?.success) return
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : []
        const publicOnes = list.filter(
          (t) => t && t.is_active !== false && t.is_profile_public !== false,
        )
        if (publicOnes.length) setApiTeachers(publicOnes)
      } catch {
        /* دمو */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.items])

  const items = useMemo(
    () => resolveTeacherIntroList(settings, apiTeachers),
    [settings, apiTeachers],
  )

  const visibilityClass =
    !settings.show_on_mobile && !settings.show_on_desktop
      ? styles.hiddenMobile
      : !settings.show_on_mobile
        ? styles.hiddenMobile
        : !settings.show_on_desktop
          ? styles.hiddenDesktop
          : ''

  const scrollByDir = (sign) => {
    const el = trackRef.current
    if (!el) return
    const step = (settings.card_width || 220) + (settings.gap || 12)
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
  }, [items.length])

  const vars = schoolTeacherIntroCssVars(settings)
  const framePlain = isTeacherIntroFramePlain(settings)
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
        className={styles.navGroup}
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
              className={styles.navBtn}
              aria-label="قبلی"
              onClick={() => scrollByDir(-1)}
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="بعدی"
              onClick={() => scrollByDir(1)}
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>
          </>
        ) : null}
        {settings.show_more_link && settings.more_href ? (
          <Link href={settings.more_href} className={styles.more}>
            {settings.more_label || 'همه معلمان'}
            <ArrowLeft size={12} strokeWidth={2.4} />
          </Link>
        ) : null}
      </div>
    ) : null

  const sidePanel = showSide ? (
    <aside className={styles.sidePanel}>
      {String(settings.side_image_title || '').trim() ? (
        <h3 className={styles.sideTitle}>{settings.side_image_title}</h3>
      ) : null}
      <div className={styles.sideImageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sideSrc}
          alt={
            settings.side_image_alt ||
            String(settings.side_image_title || '').trim() ||
            'معرفی معلمان'
          }
        />
      </div>
      {String(settings.side_image_caption || '').trim() ? (
        <p className={styles.sideCaption}>{settings.side_image_caption}</p>
      ) : null}
    </aside>
  ) : null

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SCHOOL}>
      <section
        className={`${styles.root} ${settings.section_full ? styles.rootFull : styles.rootBoxed} ${visibilityClass}`}
        style={vars}
        data-school-teacher-intro="1"
        aria-label={settings.title || 'معرفی معلم'}
      >
        <div className={styles.inner}>
          <div
            className={`${styles.frame} ${framePlain ? styles.framePlain : ''}`}
          >
            <div
              className={`${styles.frameTop} ${
                arrowsAtEnd ? styles.frameTopEnd : styles.frameTopStart
              } ${arrowsAtEnd ? styles.navDockEnd : styles.navDockStart}`}
            >
              {arrowsAtEnd ? (
                <>
                  <div className={styles.frameTopCopy}>
                    {settings.show_title !== false ? (
                      <>
                        <p className={styles.kicker}>
                          <GraduationCap size={11} strokeWidth={2.35} />
                          کادر آموزشی
                        </p>
                        <h2 className={styles.title}>{settings.title}</h2>
                      </>
                    ) : null}
                    {settings.show_subtitle && settings.subtitle ? (
                      <p className={styles.subtitle}>{settings.subtitle}</p>
                    ) : null}
                  </div>
                  {navButtons}
                </>
              ) : (
                <>
                  {navButtons}
                  <div
                    className={styles.frameTopCopy}
                    style={{ textAlign: 'start' }}
                  >
                    {settings.show_title !== false ? (
                      <>
                        <p className={styles.kicker}>
                          <GraduationCap size={11} strokeWidth={2.35} />
                          کادر آموزشی
                        </p>
                        <h2 className={styles.title}>{settings.title}</h2>
                      </>
                    ) : null}
                    {settings.show_subtitle && settings.subtitle ? (
                      <p className={styles.subtitle}>{settings.subtitle}</p>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {!items.length && !showSide ? (
              <div className={styles.empty}>
                هنوز معلمی برای نمایش تنظیم نشده است.
              </div>
            ) : (
              <div
                className={`${styles.frameBody} ${
                  sideIsLeft ? styles.frameBodySideLeft : styles.frameBodySideRight
                }`}
                style={{
                  background: vars['--sti-frame-body'],
                  borderRadius: `${vars['--sti-body-r-tl']} ${vars['--sti-body-r-tr']} ${vars['--sti-body-r-br']} ${vars['--sti-body-r-bl']}`,
                }}
              >
                {sidePanel}
                <div
                  ref={trackRef}
                  className={`${styles.track} ${
                    settings.show_scrollbar
                      ? styles.trackShowBar
                      : styles.trackHideBar
                  }`}
                >
                  {!items.length ? (
                    <div className={styles.emptyInline}>
                      هنوز معلمی برای نمایش تنظیم نشده است.
                    </div>
                  ) : null}
                  {items.map((teacher) => {
                    const href =
                      teacher.href ||
                      (teacher.slug ? `/teachers/${teacher.slug}` : '')
                    const abs = teacherPublicAbsoluteUrl(
                      teacher.href || teacher.slug,
                    )
                    const qrSrc =
                      settings.show_qr && abs
                        ? teacherQrImageUrl(abs, settings.qr_size || 72)
                        : ''

                    const body = (
                      <>
                        <div className={styles.cardTop}>
                          <div className={styles.avatar} aria-hidden>
                            {teacher.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={teacher.avatar} alt="" />
                            ) : (
                              initials(teacher.name)
                            )}
                          </div>
                          {qrSrc ? (
                            <div className={styles.qrBox}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={qrSrc} alt={`QR ${teacher.name}`} />
                              <span className={styles.qrLabel}>
                                <QrCode size={9} />
                                پروفایل
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <h3 className={styles.name}>{teacher.name}</h3>
                          {settings.show_specialty && teacher.specialty ? (
                            <p className={styles.specialty}>
                              {teacher.specialty}
                            </p>
                          ) : null}
                          {settings.show_bio && teacher.bio ? (
                            <p className={styles.bio}>{teacher.bio}</p>
                          ) : null}
                        </div>
                        {href ? (
                          <span className={styles.cta}>
                            مشاهده پروفایل
                            <ArrowLeft size={12} />
                          </span>
                        ) : null}
                      </>
                    )

                    if (href) {
                      return (
                        <Link
                          key={teacher.id}
                          href={href}
                          className={styles.card}
                        >
                          {body}
                        </Link>
                      )
                    }
                    return (
                      <div key={teacher.id} className={styles.card}>
                        {body}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </ModuleGate>
  )
}
