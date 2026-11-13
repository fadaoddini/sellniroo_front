'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import Config from '@/config/config'
import {
  bookingCtaCssVars,
  bookingFormCssVars,
  bookingLookupCssVars,
  bookingServicesCssVars,
  bookingStaffCssVars,
  normalizeBookingCtaSettings,
  normalizeBookingFormSettings,
  normalizeBookingLookupSettings,
  normalizeBookingServicesSettings,
  normalizeBookingStaffSettings,
} from '@/config/bookingWidgetSettings'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import FilterDialog, {
  FilterSelectTrigger,
} from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import styles from './Booking.module.css'

function money(n) {
  const v = Number(n || 0)
  if (!v) return 'توافقی'
  return `${v.toLocaleString('fa-IR')} تومان`
}

function useNobatBundle() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await axios.get(Config.endpoints.nobat.bundle())
        if (!cancelled) setData(res.data?.data || null)
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'خطا در بارگذاری')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, err, loading }
}

export function BookingCtaWidget({ settings: rawSettings = {} }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeBookingCtaSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => bookingCtaCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )

  const hiddenByDevice =
    (isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)
  if (hiddenByDevice) return null

  const bgMode = cfg.bg_mode || 'solid'
  const showGlow = !!cfg.show_glow && bgMode === 'gradient'

  return (
    <section
      className={[
        styles.ctaShell,
        cfg.layout === 'stack' ? styles.ctaStack : '',
        cfg.section_full ? styles.ctaShellFull : '',
        bgMode === 'solid' ? styles.ctaBgSolid : '',
        bgMode === 'transparent' ? styles.ctaBgTransparent : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cssVars}
      dir="rtl"
      data-bg-mode={bgMode}
    >
      <div className={styles.ctaBand}>
        {showGlow ? <div className={styles.ctaGlow} aria-hidden /> : null}
        <div className={styles.ctaInner}>
          {cfg.show_icon ? (
            <span className={styles.ctaIcon}>
              <Sparkles size={22} strokeWidth={1.75} />
            </span>
          ) : null}
          <div className={styles.ctaText}>
            <h2>{cfg.title || 'نوبت خود را آنلاین رزرو کنید'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
          {cfg.show_primary || cfg.show_secondary ? (
            <div className={styles.ctaActions}>
              {cfg.show_primary ? (
                <Link
                  href={cfg.primary_href || '/booking'}
                  className={styles.ctaBtnPrimary}
                >
                  <CalendarCheck size={16} />
                  {cfg.primary_label || 'شروع رزرو'}
                </Link>
              ) : null}
              {cfg.show_secondary ? (
                <Link
                  href={cfg.secondary_href || '/booking?tab=lookup'}
                  className={styles.ctaBtnSecondary}
                >
                  <Search size={16} />
                  {cfg.secondary_label || 'پیگیری نوبت'}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function BookingServicesWidget({ settings: rawSettings = {} }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeBookingServicesSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => bookingServicesCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )

  const { data, loading, err } = useNobatBundle()

  const hiddenByDevice =
    (isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)
  if (hiddenByDevice) return null

  const layout = cfg.layout || 'cards'
  const layoutClass = layout === 'cards' ? '' : styles[`layout_${layout}`] || ''
  const surfaceMode = cfg.surface_mode || 'transparent'
  const surfaceSpan = cfg.surface_span || 'full'
  const surfaceOn = surfaceMode === 'color' && !!(cfg.surface_bg || '').trim()
  const surfaceClass = surfaceOn
    ? surfaceSpan === 'container'
      ? styles.servicesSurfaceContained
      : styles.servicesSurfaceFull
    : ''

  const shellClass = [
    styles.servicesShell,
    cfg.section_full ? styles.servicesShellFull : '',
    surfaceClass,
    layoutClass,
  ]
    .filter(Boolean)
    .join(' ')

  if (loading) {
    return (
      <section className={shellClass} style={cssVars} dir="rtl">
        <div className={styles.servicesInner}>
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </section>
    )
  }
  if (err) return <p className={styles.error}>{err}</p>
  const services = data?.services || []
  const linkBase = cfg.link_base || '/booking?service='

  const ctaStyle = cfg.cta_style || 'text'
  const ctaSide = cfg.cta_side || 'bottom'
  const ctaHeight = cfg.cta_height || 'auto'
  const showCtaLabel = cfg.cta_show_label !== false
  const showCtaIcon = cfg.cta_show_icon !== false
  const CtaIcon = resolveLucideIcon(cfg.cta_icon || 'ArrowLeft', ArrowLeft)
  const ctaIconPx = Math.max(10, Math.min(28, Number(cfg.cta_icon_size) || 16))
  const isRail = ctaStyle === 'rail' && (ctaSide === 'left' || ctaSide === 'right')

  const ctaClass = [
    styles.cardCta,
    isRail
      ? styles.cardCtaRail
      : ctaStyle === 'chip' && ctaSide === 'bottom'
        ? styles.cardCtaBottom
        : ctaStyle === 'chip'
          ? styles.cardCtaChip
          : styles.cardCtaText,
    !showCtaLabel && showCtaIcon ? styles.cardCtaIconOnly : '',
  ]
    .filter(Boolean)
    .join(' ')

  const renderCta = () => {
    if (!cfg.show_cta) return null
    const label = cfg.cta_label || 'رزرو'
    const iconEl = showCtaIcon ? (
      <CtaIcon size={ctaIconPx} strokeWidth={2.25} />
    ) : null
    return (
      <span
        className={ctaClass}
        data-cta-side={ctaSide}
        data-cta-height={ctaHeight}
      >
        {isRail ? (
          <>
            {iconEl}
            {showCtaLabel ? (
              <span className={styles.cardCtaRailLabel}>{label}</span>
            ) : null}
          </>
        ) : (
          <>
            {showCtaLabel ? <span>{label}</span> : null}
            {iconEl}
          </>
        )}
      </span>
    )
  }

  return (
    <section
      className={shellClass}
      style={cssVars}
      dir="rtl"
      data-layout={layout}
      data-surface-mode={surfaceMode}
      data-surface-span={surfaceSpan}
      data-section-full={cfg.section_full ? '1' : '0'}
      data-cta-style={ctaStyle}
    >
      <div className={styles.servicesInner}>
        <header className={styles.head}>
          <div>
            {cfg.show_eyebrow ? (
              <p className={styles.eyebrow}>{cfg.eyebrow_text || 'خدمات'}</p>
            ) : null}
            <h2>{cfg.title || 'خدمات'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
        </header>
        {services.length === 0 ? (
          <p className={styles.servicesEmpty}>هنوز خدمتی ثبت نشده است.</p>
        ) : (
          <div
            className={`${styles.grid} ${cfg.card_lift ? '' : styles.gridNoLift}`}
          >
            {services.map((s) => (
              <Link
                key={s.id}
                href={`${linkBase}${s.id}`}
                className={[
                  styles.card,
                  isRail ? styles.cardWithRail : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  /* اکسنت ویجت (تم طلایی و…) بر رنگ سرویس اولویت دارد */
                  '--accent': cfg.accent || s.color || '#0f766e',
                }}
                data-cta-side={isRail ? ctaSide : undefined}
              >
                <div className={styles.cardBody}>
                  {cfg.show_dot ? (
                    <span className={styles.cardDot} aria-hidden />
                  ) : null}
                  <strong>{s.name}</strong>
                  {cfg.show_duration ? (
                    <span className={styles.metaRow}>
                      <Clock3 size={13} />
                      {s.duration_minutes} دقیقه
                    </span>
                  ) : null}
                  {cfg.show_price ? <em>{money(s.price)}</em> : null}
                  {!isRail ? renderCta() : null}
                </div>
                {isRail ? renderCta() : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function BookingStaffWidget({ settings: rawSettings = {} }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeBookingStaffSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => bookingStaffCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )

  const { data, loading, err } = useNobatBundle()

  const hiddenByDevice =
    (isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)
  if (hiddenByDevice) return null

  if (loading) {
    return (
      <section className={styles.staffShell} style={cssVars}>
        <p className={styles.muted}>در حال بارگذاری تیم…</p>
      </section>
    )
  }
  if (err) return <p className={styles.error}>{err}</p>
  const staff = data?.staff || []

  return (
    <section className={styles.staffShell} style={cssVars} dir="rtl">
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'پرسنل'}</p>
          ) : null}
          <h2>{cfg.title || 'تیم ما'}</h2>
          {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
        </div>
      </header>
      <div
        className={`${styles.staffGrid} ${
          cfg.card_lift ? '' : styles.staffGridNoLift
        }`}
      >
        {staff.map((st) => (
          <article key={st.id} className={styles.staffCard}>
            {cfg.show_avatar ? (
              <div className={styles.avatar}>
                {(st.name || '?').slice(0, 1)}
              </div>
            ) : null}
            <strong>{st.name}</strong>
            {cfg.show_role ? (
              <span>{st.title || 'کارشناس'}</span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export function BookingLookupWidget({ settings: rawSettings = {} }) {
  const [isMobile, setIsMobile] = useState(false)
  const [code, setCode] = useState('')
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeBookingLookupSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => bookingLookupCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )

  const lookup = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setMsg('')
    setResult(null)
    try {
      const res = await axios.get(Config.endpoints.nobat.lookup({ code, mobile }))
      setResult(res.data?.data || null)
    } catch (err) {
      setMsg(err.response?.data?.message || 'یافت نشد')
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    setBusy(true)
    try {
      const res = await axios.post(Config.endpoints.nobat.lookup(), {
        code,
        mobile,
        action: 'cancel',
      })
      setResult(res.data?.data || null)
      setMsg(res.data?.message || 'لغو شد')
    } catch (err) {
      setMsg(err.response?.data?.message || 'خطا')
    } finally {
      setBusy(false)
    }
  }

  const hiddenByDevice =
    (isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)
  if (hiddenByDevice) return null

  return (
    <section
      className={[
        styles.lookupShell,
        cfg.show_panel ? styles.lookupPanel : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cssVars}
      dir="rtl"
    >
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'پیگیری'}</p>
          ) : null}
          <h2>{cfg.title || 'پیگیری نوبت'}</h2>
          {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
        </div>
      </header>
      <form className={styles.formStack} onSubmit={lookup}>
        <label className={styles.label}>
          {cfg.code_label || 'کد پیگیری'}
          <input
            className={styles.input}
            dir="ltr"
            placeholder={cfg.code_placeholder || 'مثلاً AB12CD'}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </label>
        <label className={styles.label}>
          {cfg.mobile_label || 'موبایل'}
          <input
            className={styles.input}
            dir="ltr"
            placeholder={cfg.mobile_placeholder || '09xxxxxxxxx'}
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, '').slice(0, 11))
            }
            required
            pattern="09[0-9]{9}"
          />
        </label>
        <button type="submit" className={styles.btn} disabled={busy}>
          <Search size={15} />
          {busy ? '…' : cfg.submit_label || 'جستجو'}
        </button>
      </form>
      {msg ? <p className={styles.msg}>{msg}</p> : null}
      {result ? (
        <div className={styles.result}>
          <p>
            <strong>{result.service_name}</strong>
          </p>
          <p>
            {result.jalali_date} · ساعت {String(result.start_time).slice(0, 5)}
          </p>
          <p>
            وضعیت: {result.status_label} · کد:{' '}
            <span dir="ltr">{result.confirmation_code}</span>
          </p>
          {cfg.show_cancel &&
          result.status !== 'cancelled' &&
          result.status !== 'completed' ? (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={cancel}
              disabled={busy}
            >
              {cfg.cancel_label || 'لغو نوبت'}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

const STEPS = [
  { id: 1, label: 'خدمت' },
  { id: 2, label: 'زمان' },
  { id: 3, label: 'اطلاعات' },
]

export function BookingFormWidget({ settings: rawSettings = {}, initialServiceId = null }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeBookingFormSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => bookingFormCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const { data, loading, err } = useNobatBundle()
  const [serviceId, setServiceId] = useState(initialServiceId || '')
  const [staffId, setStaffId] = useState('')
  const [calendar, setCalendar] = useState([])
  const [day, setDay] = useState('')
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [msg, setMsg] = useState('')
  const [picker, setPicker] = useState(null) // 'service' | 'staff' | null

  const settingsBiz = data?.settings
  const services = data?.services || []
  const staffAll = data?.staff || []
  const step = !serviceId ? 1 : !day || !time ? 2 : 3

  const staffForService = useMemo(() => {
    if (!serviceId) return staffAll
    const sid = Number(serviceId)
    return staffAll.filter(
      (st) =>
        !st.service_ids?.length ||
        st.service_ids.includes(sid) ||
        (st.services || []).some?.((x) => x === sid || x?.id === sid),
    )
  }, [staffAll, serviceId])

  const showStaff =
    cfg.show_staff_field &&
    (!!settingsBiz?.require_staff || staffForService.length > 0)

  useEffect(() => {
    if (initialServiceId) setServiceId(String(initialServiceId))
  }, [initialServiceId])

  const loadCalendar = useCallback(async () => {
    if (!serviceId) return
    setBusy(true)
    setMsg('')
    try {
      const params = { service_id: serviceId, days: cfg.calendar_days }
      if (staffId) params.staff_id = staffId
      const res = await axios.get(Config.endpoints.nobat.availability(params))
      setCalendar(res.data?.data?.calendar || [])
      setDay('')
      setSlots([])
      setTime('')
    } catch (e) {
      setMsg(e.response?.data?.message || 'خطا در تقویم')
    } finally {
      setBusy(false)
    }
  }, [serviceId, staffId, cfg.calendar_days])

  useEffect(() => {
    loadCalendar()
  }, [loadCalendar])

  const loadSlots = async (jalali) => {
    setDay(jalali)
    setTime('')
    setBusy(true)
    try {
      const params = { service_id: serviceId, date: jalali }
      if (staffId) params.staff_id = staffId
      const res = await axios.get(Config.endpoints.nobat.availability(params))
      setSlots(res.data?.data?.slots || [])
    } catch (e) {
      setMsg(e.response?.data?.message || 'خطا در ساعات')
      setSlots([])
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const payload = {
        service_id: Number(serviceId),
        date: day,
        start_time: time.length === 5 ? `${time}:00` : time,
        customer_name: name,
        customer_mobile: mobile,
        customer_note: cfg.show_note_field ? note : '',
      }
      if (staffId) payload.staff_id = Number(staffId)
      const res = await axios.post(Config.endpoints.nobat.book(), payload)
      setDone(res.data?.data || null)
      setMsg(res.data?.message || 'ثبت شد')
    } catch (err) {
      setMsg(err.response?.data?.message || 'ثبت ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const serviceOptionLabel = (s) => {
    const parts = [s.name]
    if (cfg.show_duration) parts.push(`${s.duration_minutes}′`)
    if (cfg.show_prices) parts.push(money(s.price))
    return parts.join(' — ')
  }

  const serviceOptions = useMemo(
    () =>
      services.map((s) => {
        const metaParts = []
        if (cfg.show_duration && s.duration_minutes) {
          metaParts.push(`${s.duration_minutes} دقیقه`)
        }
        if (cfg.show_prices) metaParts.push(money(s.price))
        return {
          id: s.id,
          name: s.name,
          description: metaParts.join(' · '),
        }
      }),
    [services, cfg.show_duration, cfg.show_prices],
  )

  const staffOptions = useMemo(
    () =>
      staffForService.map((st) => ({
        id: st.id,
        name: st.name,
        description: st.title || '',
      })),
    [staffForService],
  )

  const selectedService = services.find((s) => String(s.id) === String(serviceId))
  const selectedStaff = staffForService.find(
    (st) => String(st.id) === String(staffId),
  )

  const shellClass = [
    styles.formShell,
    cfg.show_panel ? styles.panel : '',
    cfg.density === 'compact' ? styles.compact : '',
  ]
    .filter(Boolean)
    .join(' ')

  const hiddenByDevice =
    (isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)

  if (hiddenByDevice) return null

  if (loading) {
    return (
      <section className={styles.formShell} style={cssVars}>
        <div className={styles.skeletonCard} style={{ height: 220 }} />
      </section>
    )
  }
  if (err) return <p className={styles.error}>{err}</p>
  if (!settingsBiz?.is_public_booking_open) {
    return <p className={styles.muted}>رزرو آنلاین فعلاً بسته است.</p>
  }

  if (done) {
    return (
      <section className={shellClass} style={cssVars} dir="rtl">
        <div className={styles.successBox}>
          <CheckCircle2 size={36} className={styles.successIcon} />
          <h2>{cfg.success_title || 'نوبت ثبت شد'}</h2>
          <p className={styles.codeLine}>
            کد پیگیری:{' '}
            <strong dir="ltr">{done.confirmation_code}</strong>
          </p>
          <p>
            {done.jalali_date} · {String(done.start_time).slice(0, 5)} —{' '}
            {done.service_name}
          </p>
          <p className={styles.muted}>
            {cfg.success_hint || 'این کد را برای پیگیری نگه دارید.'}
          </p>
          <Link href="/booking?tab=lookup" className={styles.btn}>
            {cfg.lookup_link_label || 'پیگیری نوبت'}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={shellClass} style={cssVars} dir="rtl">
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'رزرو'}</p>
          ) : null}
          <h2>
            {cfg.title || settingsBiz?.business_name || 'رزرو نوبت'}
          </h2>
          {(cfg.subtitle || settingsBiz?.tagline) ? (
            <p>{cfg.subtitle || settingsBiz?.tagline}</p>
          ) : null}
        </div>
      </header>

      {cfg.show_steps ? (
        <ol className={styles.steps} aria-label="مراحل رزرو">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`${styles.step} ${step >= s.id ? styles.stepOn : ''}`}
            >
              <span>{s.id}</span>
              {s.label}
            </li>
          ))}
        </ol>
      ) : null}

      <form className={styles.formStack} onSubmit={submit}>
        <FilterSelectTrigger
          label={cfg.service_label || 'خدمت'}
          displayValue={
            selectedService ? serviceOptionLabel(selectedService) : ''
          }
          placeholder="انتخاب کنید"
          onClick={() => setPicker('service')}
        />
        {showStaff ? (
          <FilterSelectTrigger
            label={`${cfg.staff_label || 'پرسنل'}${
              settingsBiz?.require_staff
                ? ''
                : ` ${cfg.staff_optional_hint || '(اختیاری)'}`
            }`}
            icon={UserRound}
            displayValue={
              selectedStaff
                ? `${selectedStaff.name}${
                    selectedStaff.title ? ` — ${selectedStaff.title}` : ''
                  }`
                : ''
            }
            placeholder="هر کدام آزاد باشد"
            onClick={() => setPicker('staff')}
          />
        ) : null}

        <FilterDialog
          isOpen={picker === 'service'}
          title={cfg.service_label || 'انتخاب خدمت'}
          options={serviceOptions}
          value={serviceId}
          emptyLabel="انتخاب کنید"
          showEmpty={false}
          searchable={serviceOptions.length > 5}
          onChange={(v) => {
            setServiceId(v)
            setStaffId('')
            setDay('')
            setSlots([])
            setTime('')
          }}
          onClose={() => setPicker(null)}
        />

        <FilterDialog
          isOpen={picker === 'staff'}
          title={cfg.staff_label || 'انتخاب پرسنل'}
          options={staffOptions}
          value={staffId}
          emptyLabel="هر کدام آزاد باشد"
          showEmpty={!settingsBiz?.require_staff}
          searchable={staffOptions.length > 5}
          onChange={(v) => setStaffId(v)}
          onClose={() => setPicker(null)}
        />

        {calendar.length ? (
          <div>
            <p className={styles.fieldHint}>{cfg.date_label || 'تاریخ (شمسی)'}</p>
            <div className={styles.dayRow}>
              {calendar.map((d) => (
                <button
                  key={d.jalali_date}
                  type="button"
                  disabled={!d.has_slots}
                  className={`${styles.dayBtn} ${day === d.jalali_date ? styles.dayOn : ''}`}
                  onClick={() => d.has_slots && loadSlots(d.jalali_date)}
                >
                  <span>{d.jalali_date}</span>
                  <small>{d.has_slots ? `${d.slot_count} نوبت` : 'پر'}</small>
                </button>
              ))}
            </div>
          </div>
        ) : serviceId ? (
          <p className={styles.muted}>
            {busy ? 'بارگذاری تقویم…' : 'روز آزادی نیست'}
          </p>
        ) : null}

        {slots.length ? (
          <div>
            <p className={styles.fieldHint}>{cfg.time_label || 'ساعت'}</p>
            <div className={styles.slotRow}>
              {slots.map((s) => (
                <button
                  key={`${s.time}-${s.staff_id || 0}`}
                  type="button"
                  className={`${styles.slotBtn} ${time === s.time ? styles.slotOn : ''}`}
                  onClick={() => {
                    setTime(s.time)
                    if (s.staff_id && !staffId) setStaffId(String(s.staff_id))
                  }}
                >
                  {s.time}
                </button>
              ))}
            </div>
          </div>
        ) : day ? (
          <p className={styles.muted}>ساعت آزادی نیست</p>
        ) : null}

        <label className={styles.label}>
          {cfg.name_label || 'نام'}
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          {cfg.mobile_label || 'موبایل'}
          <input
            className={styles.input}
            dir="ltr"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="09xxxxxxxxx"
            required
            pattern="09[0-9]{9}"
          />
        </label>
        {cfg.show_note_field ? (
          <label className={styles.label}>
            {cfg.note_label || 'یادداشت'}
            <textarea
              className={styles.input}
              rows={cfg.density === 'compact' ? 1 : 2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        ) : null}

        {msg ? <p className={styles.msg}>{msg}</p> : null}

        <button
          type="submit"
          className={styles.btn}
          disabled={
            busy ||
            !serviceId ||
            (settingsBiz?.require_staff && !staffId) ||
            !day ||
            !time ||
            !name ||
            mobile.length !== 11
          }
        >
          <CalendarCheck size={16} />
          {busy ? 'در حال ثبت…' : cfg.submit_label || 'ثبت نوبت'}
        </button>
      </form>
    </section>
  )
}

export default BookingFormWidget
