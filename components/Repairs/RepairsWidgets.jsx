'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Search,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import repairsService from '@/components/Repairs/services/repairsService'
import {
  normalizeRepairsCtaSettings,
  normalizeRepairsReqSettings,
  normalizeRepairsSvcSettings,
  normalizeRepairsTechSettings,
  normalizeRepairsTrackSettings,
  repairsCtaCssVars,
  repairsReqCssVars,
  repairsSvcCssVars,
  repairsTechCssVars,
  repairsTrackCssVars,
} from '@/config/repairsWidgetSettings'
import styles from './RepairsWidgets.module.css'

function money(n) {
  const v = Number(n || 0)
  if (!v) return '—'
  return `${v.toLocaleString('fa-IR')} تومان`
}

function unitLabel(unit) {
  if (unit === 'hourly') return 'ساعتی'
  return 'مبلغ ثابت'
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])
  return isMobile
}

function useRepairsPublicConfig() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await repairsService.config()
      if (cancelled) return
      if (res.success) setData(res.data || null)
      else setErr(res.error || 'خطا در بارگذاری')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, err, loading }
}

export function RepairsCtaWidget({ settings: rawSettings = {} }) {
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeRepairsCtaSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => repairsCtaCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )

  if (
    (isMobile && !cfg.show_on_mobile) ||
    (!isMobile && !cfg.show_on_desktop)
  ) {
    return null
  }

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
              <Wrench size={22} strokeWidth={1.75} />
            </span>
          ) : null}
          <div className={styles.ctaText}>
            <h2>{cfg.title || 'درخواست تعمیر و سرویس'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
          {cfg.show_primary || cfg.show_secondary ? (
            <div className={styles.ctaActions}>
              {cfg.show_primary ? (
                <Link
                  href={cfg.primary_href || '/repairs'}
                  className={styles.ctaBtnPrimary}
                >
                  <Wrench size={16} />
                  {cfg.primary_label || 'ثبت درخواست'}
                </Link>
              ) : null}
              {cfg.show_secondary ? (
                <Link
                  href={cfg.secondary_href || '/repairs#track'}
                  className={styles.ctaBtnSecondary}
                >
                  <Search size={16} />
                  {cfg.secondary_label || 'پیگیری سفارش'}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function RepairsTechniciansWidget({ settings: rawSettings = {} }) {
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeRepairsTechSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => repairsTechCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const { data, loading, err } = useRepairsPublicConfig()

  if (
    (isMobile && !cfg.show_on_mobile) ||
    (!isMobile && !cfg.show_on_desktop)
  ) {
    return null
  }

  if (loading) {
    return (
      <section className={styles.techShell} style={cssVars}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    )
  }
  if (err) return <p className={styles.error}>{err}</p>

  const list = (data?.technicians || []).slice(0, cfg.limit || 12)

  return (
    <section className={styles.techShell} style={cssVars} dir="rtl">
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'تیم سرویس'}</p>
          ) : null}
          <h2>{cfg.title || 'تعمیرکاران ما'}</h2>
          {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
        </div>
      </header>
      <div
        className={`${styles.techGrid} ${cfg.card_lift ? styles.cardLift : ''}`}
      >
        {list.map((t) => (
          <article key={t.id} className={styles.techCard}>
            {cfg.show_avatar ? (
              <div className={styles.avatar}>{(t.name || '?').slice(0, 1)}</div>
            ) : null}
            <strong>{t.name}</strong>
            {cfg.show_specialty && t.specialty ? (
              <span>{t.specialty}</span>
            ) : null}
            {cfg.show_city && t.city ? (
              <span className={styles.meta}>
                <MapPin size={12} style={{ display: 'inline', marginInlineEnd: 4 }} />
                {t.city}
              </span>
            ) : null}
          </article>
        ))}
      </div>
      {!list.length ? (
        <p className={styles.muted}>هنوز تعمیرکاری ثبت نشده است.</p>
      ) : null}
    </section>
  )
}

export function RepairsServicesWidget({ settings: rawSettings = {} }) {
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeRepairsSvcSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => repairsSvcCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const { data, loading, err } = useRepairsPublicConfig()

  if (
    (isMobile && !cfg.show_on_mobile) ||
    (!isMobile && !cfg.show_on_desktop)
  ) {
    return null
  }

  if (loading) {
    return (
      <section className={styles.svcShell} style={cssVars}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    )
  }
  if (err) return <p className={styles.error}>{err}</p>

  const list = (data?.labor_rates || []).slice(0, cfg.limit || 12)
  const href = cfg.link_base || '/repairs'

  return (
    <section className={styles.svcShell} style={cssVars} dir="rtl">
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'اجرت‌ها'}</p>
          ) : null}
          <h2>{cfg.title || 'خدمات و اجرت تعمیر'}</h2>
          {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
        </div>
      </header>
      <div className={`${styles.svcGrid} ${cfg.card_lift ? styles.cardLift : ''}`}>
        {list.map((item) => (
          <Link key={item.id} href={href} className={styles.svcCard}>
            {cfg.show_dot ? <span className={styles.svcDot} aria-hidden /> : null}
            <strong>{item.title}</strong>
            {cfg.show_unit ? (
              <span className={styles.meta}>{unitLabel(item.unit)}</span>
            ) : null}
            {cfg.show_desc && item.description ? (
              <span className={styles.meta}>{item.description}</span>
            ) : null}
            {cfg.show_price ? <em>{money(item.price)}</em> : null}
            {cfg.show_cta ? (
              <span className={styles.svcCta}>
                {cfg.cta_label || 'درخواست سرویس'}
                <ArrowLeft size={14} />
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      {!list.length ? (
        <p className={styles.muted}>هنوز اجرتی تعریف نشده است.</p>
      ) : null}
    </section>
  )
}

function userDisplayName(user) {
  if (!user) return ''
  const full = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  if (full) return full
  if (user.display_name && user.display_name !== 'کاربر محترم') {
    return user.display_name
  }
  return ''
}

export function RepairsRequestWidget({ settings: rawSettings = {} }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeRepairsReqSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => repairsReqCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const { data: config } = useRepairsPublicConfig()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    device_title: '',
    brand: '',
    model: '',
    serial: '',
    customer_request: '',
  })

  const loginHref = useMemo(() => {
    const next = pathname || '/repairs'
    return `/login?next=${encodeURIComponent(next)}`
  }, [pathname])

  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      name: f.name || userDisplayName(user),
    }))
  }, [user])

  if (
    (isMobile && !cfg.show_on_mobile) ||
    (!isMobile && !cfg.show_on_desktop)
  ) {
    return null
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push(loginHref)
      return
    }
    setErr('')
    setBusy(true)
    const res = await repairsService.request(form)
    setBusy(false)
    if (!res.success) {
      if (res.httpStatus === 401 || res.httpStatus === 403) {
        router.push(loginHref)
        return
      }
      setErr(res.error || 'خطا در ثبت')
      return
    }
    const token = res.data?.tracking_token
    if (token) router.push(`/repairs/track/${token}`)
  }

  return (
    <section
      className={[
        styles.reqShell,
        cfg.density === 'compact' ? styles.compact : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cssVars}
      dir="rtl"
    >
      <div className={cfg.show_panel ? styles.panel : undefined}>
        <header className={styles.head}>
          <div>
            {cfg.show_eyebrow ? (
              <p className={styles.eyebrow}>{cfg.eyebrow_text || 'سرویس'}</p>
            ) : null}
            <h2>{cfg.title || 'درخواست تعمیر'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
            {cfg.show_deposit_hint && config?.deposit_amount ? (
              <p className={styles.hint}>
                مبلغ رزرو:{' '}
                {Number(config.deposit_amount).toLocaleString('fa-IR')} تومان
              </p>
            ) : null}
          </div>
        </header>

        {authLoading ? (
          <p className={styles.muted}>در حال بررسی ورود…</p>
        ) : !isAuthenticated ? (
          <div className={styles.formStack}>
            <p className={styles.hint}>
              برای ثبت درخواست وارد شوید؛ موبایل احراز‌شده حساب شما استفاده
              می‌شود.
            </p>
            <Link href={loginHref} className={styles.submitBtn}>
              ورود / ثبت‌نام
            </Link>
          </div>
        ) : (
          <form className={styles.formStack} onSubmit={submit}>
            <p className={styles.hint}>
              موبایل تأیید‌شده:{' '}
              <strong dir="ltr">{user?.mobile || '—'}</strong>
            </p>
            <label className={styles.label}>
              نام *
              <input
                className={styles.input}
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </label>
            <div className={styles.row2}>
              <label className={styles.label}>
                شهر
                <input
                  className={styles.input}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </label>
              <label className={styles.label}>
                عنوان دستگاه
                <input
                  className={styles.input}
                  value={form.device_title}
                  onChange={(e) => set('device_title', e.target.value)}
                  placeholder="مثلاً چاپگر"
                />
              </label>
            </div>
            <label className={styles.label}>
              آدرس سرویس
              <input
                className={styles.input}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </label>
            {cfg.show_brand_fields ? (
              <div className={styles.row2}>
                <label className={styles.label}>
                  برند
                  <input
                    className={styles.input}
                    value={form.brand}
                    onChange={(e) => set('brand', e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  مدل
                  <input
                    className={styles.input}
                    value={form.model}
                    onChange={(e) => set('model', e.target.value)}
                  />
                </label>
              </div>
            ) : null}
            {cfg.show_serial ? (
              <label className={styles.label}>
                سریال
                <input
                  className={styles.input}
                  value={form.serial}
                  onChange={(e) => set('serial', e.target.value)}
                  dir="ltr"
                />
              </label>
            ) : null}
            <label className={styles.label}>
              شرح مشکل
              <textarea
                className={styles.textarea}
                value={form.customer_request}
                onChange={(e) => set('customer_request', e.target.value)}
              />
            </label>
            {err ? <p className={styles.error}>{err}</p> : null}
            <button type="submit" className={styles.submitBtn} disabled={busy}>
              {busy ? 'در حال ثبت…' : cfg.submit_label || 'ثبت درخواست'}
            </button>
            {cfg.success_hint ? (
              <p className={styles.hint}>{cfg.success_hint}</p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  )
}

export function RepairsTrackWidget({ settings: rawSettings = {} }) {
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const cfg = useMemo(
    () => normalizeRepairsTrackSettings(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const cssVars = useMemo(
    () => repairsTrackCssVars(rawSettings, { viewport }),
    [rawSettings, viewport],
  )
  const [code, setCode] = useState('')
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (
    (isMobile && !cfg.show_on_mobile) ||
    (!isMobile && !cfg.show_on_desktop)
  ) {
    return null
  }

  const lookup = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setMsg('')
    setResult(null)
    const res = await repairsService.lookup({ code, mobile })
    setBusy(false)
    if (!res.success) {
      setMsg(res.error || 'یافت نشد')
      return
    }
    setResult(res.data || null)
  }

  return (
    <section className={styles.trackShell} style={cssVars} dir="rtl">
      <div className={cfg.show_panel ? styles.panel : undefined}>
        <header className={styles.head}>
          <div>
            {cfg.show_eyebrow ? (
              <p className={styles.eyebrow}>{cfg.eyebrow_text || 'پیگیری'}</p>
            ) : null}
            <h2>{cfg.title || 'پیگیری سفارش تعمیر'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
        </header>
        <form className={styles.formStack} onSubmit={lookup}>
          <label className={styles.label}>
            {cfg.code_label || 'کد سفارش'}
            <input
              className={styles.input}
              dir="ltr"
              placeholder={cfg.code_placeholder || 'مثلاً RDEMO001'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </label>
          {msg ? <p className={styles.error}>{msg}</p> : null}
          <button type="submit" className={styles.submitBtn} disabled={busy}>
            <Search size={16} />
            {busy ? 'در حال جستجو…' : cfg.submit_label || 'جستجو'}
          </button>
        </form>
        {result ? (
          <div className={styles.resultBox}>
            <strong>کد {result.code}</strong>
            <span className={styles.meta}>وضعیت: {result.status}</span>
            {result.device_title ? (
              <span className={styles.meta}>دستگاه: {result.device_title}</span>
            ) : null}
            {result.technician_name ? (
              <span className={styles.meta}>
                سرویسکار: {result.technician_name}
              </span>
            ) : null}
            <Link href={result.track_path || `/repairs/track/${result.tracking_token}`}>
              مشاهده جزئیات و پرداخت
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
