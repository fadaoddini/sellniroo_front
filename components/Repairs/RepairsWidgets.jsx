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
    <section
      className={`${styles.techShell} ${styles.techShellFlush}`}
      style={cssVars}
      dir="rtl"
    >
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
              <div className={styles.avatar} aria-hidden>
                {(t.name || '?').slice(0, 1)}
              </div>
            ) : null}
            <div className={styles.techBody}>
              <strong>{t.name}</strong>
              {cfg.show_specialty && t.specialty ? (
                <span>{t.specialty}</span>
              ) : null}
              {cfg.show_city && t.city ? (
                <span className={styles.meta}>
                  <MapPin size={11} aria-hidden />
                  {t.city}
                </span>
              ) : null}
            </div>
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
    <section
      className={`${styles.svcShell} ${styles.svcShellFlush}`}
      style={cssVars}
      dir="rtl"
    >
      <header className={styles.head}>
        <div>
          {cfg.show_eyebrow ? (
            <p className={styles.eyebrow}>{cfg.eyebrow_text || 'تعرفه'}</p>
          ) : null}
          <h2>{cfg.title || 'هزینه خدمات'}</h2>
          {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
        </div>
      </header>
      <div className={`${styles.svcGrid} ${cfg.card_lift ? styles.cardLift : ''}`}>
        {list.map((item) => (
          <Link key={item.id} href={href} className={styles.svcCard}>
            {cfg.show_dot ? <span className={styles.svcDot} aria-hidden /> : null}
            <div className={styles.svcTop}>
              <strong>{item.title}</strong>
              {cfg.show_unit ? (
                <span className={styles.svcUnit}>{unitLabel(item.unit)}</span>
              ) : null}
            </div>
            {cfg.show_desc && item.description ? (
              <span className={styles.svcDesc}>{item.description}</span>
            ) : null}
            <div className={styles.svcFoot}>
              {cfg.show_price ? (
                <div className={styles.svcPrice}>
                  <span className={styles.svcPriceLabel}>از</span>
                  <em>{money(item.price)}</em>
                </div>
              ) : (
                <span />
              )}
              {cfg.show_cta ? (
                <span className={styles.svcCta}>
                  {cfg.cta_label || 'درخواست تعمیر'}
                  <ArrowLeft size={13} aria-hidden />
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      {!list.length ? (
        <p className={styles.muted}>هنوز تعرفه‌ای ثبت نشده است.</p>
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
        <header className={styles.headRow}>
          <div className={styles.headMain}>
            {cfg.show_eyebrow ? (
              <p className={styles.eyebrow}>{cfg.eyebrow_text || 'تعمیر در محل'}</p>
            ) : null}
            <h2>{cfg.title || 'فرم درخواست تعمیر'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
          {cfg.show_deposit_hint && config?.deposit_amount ? (
            <aside className={styles.depositBadge} aria-label="مبلغ رزرو">
              <span className={styles.depositLabel}>مبلغ رزرو نوبت</span>
              <strong className={styles.depositAmount}>
                {Number(config.deposit_amount).toLocaleString('fa-IR')}
              </strong>
              <em className={styles.depositUnit}>تومان</em>
              <span className={styles.depositNote}>
                هنگام ثبت درخواست پرداخت می‌شود
              </span>
            </aside>
          ) : null}
        </header>

        {authLoading ? (
          <p className={styles.muted}>در حال بررسی ورود…</p>
        ) : !isAuthenticated ? (
          <div className={styles.formStack}>
            <p className={styles.hint}>
              برای ثبت درخواست وارد حساب کاربری شوید. شماره موبایل تأییدشدهٔ
              حساب برای تماس استفاده می‌شود.
            </p>
            <Link href={loginHref} className={styles.submitBtn}>
              ورود / ثبت‌نام
            </Link>
          </div>
        ) : (
          <form className={styles.formStack} onSubmit={submit}>
            <section className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>اطلاعات تماس</h3>
              <div className={styles.row2}>
                <label className={styles.label}>
                  نام و نام خانوادگی *
                  <input
                    className={styles.input}
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="مثل: علی رضایی"
                  />
                </label>
                <label className={styles.label}>
                  موبایل تأییدشده
                  <input
                    className={styles.input}
                    value={user?.mobile || ''}
                    readOnly
                    dir="ltr"
                  />
                </label>
              </div>
            </section>

            <section className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>مشخصات دستگاه</h3>
              <div className={styles.row3}>
                <label className={styles.label}>
                  نوع دستگاه
                  <input
                    className={styles.input}
                    value={form.device_title}
                    onChange={(e) => set('device_title', e.target.value)}
                    placeholder="مثل: دستگاه لیزر"
                  />
                </label>
                {cfg.show_brand_fields ? (
                  <label className={styles.label}>
                    برند
                    <input
                      className={styles.input}
                      value={form.brand}
                      onChange={(e) => set('brand', e.target.value)}
                      placeholder="مثل: کندلا"
                    />
                  </label>
                ) : null}
                {cfg.show_brand_fields ? (
                  <label className={styles.label}>
                    مدل
                    <input
                      className={styles.input}
                      value={form.model}
                      onChange={(e) => set('model', e.target.value)}
                    />
                  </label>
                ) : null}
              </div>
              {cfg.show_serial ? (
                <label className={styles.label}>
                  شماره سریال
                  <input
                    className={styles.input}
                    value={form.serial}
                    onChange={(e) => set('serial', e.target.value)}
                    dir="ltr"
                    placeholder="در صورت وجود روی دستگاه"
                  />
                </label>
              ) : null}
            </section>

            <section className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>محل سرویس</h3>
              <div className={styles.row2}>
                <label className={styles.label}>
                  شهر
                  <input
                    className={styles.input}
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="مثل: تهران"
                  />
                </label>
                <span className={styles.rowSpacer} aria-hidden />
              </div>
              <label className={styles.label}>
                آدرس کامل
                <input
                  className={styles.input}
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="خیابان، کوچه، پلاک، واحد"
                />
              </label>
            </section>

            <section className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>شرح مشکل</h3>
              <label className={styles.label}>
                چه ایرادی دارد؟
                <textarea
                  className={styles.textarea}
                  value={form.customer_request}
                  onChange={(e) => set('customer_request', e.target.value)}
                  placeholder="مثال: دستگاه روشن نمی‌شود / ارور می‌دهد / خروجی ضعیف است"
                  rows={4}
                />
              </label>
            </section>

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
  const { isAuthenticated } = useAuth()
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
      setMsg(res.error || 'سفارشی با این کد و موبایل پیدا نشد')
      return
    }
    setResult(res.data || null)
  }

  const trackHref =
    result?.track_path ||
    (result?.tracking_token ? `/repairs/track/${result.tracking_token}` : '')

  return (
    <section
      className={`${styles.trackShell} ${styles.trackShellFlush}`}
      style={cssVars}
      dir="rtl"
    >
      <div className={cfg.show_panel ? styles.panel : undefined}>
        <header className={styles.head}>
          <div>
            {cfg.show_eyebrow ? (
              <p className={styles.eyebrow}>
                {cfg.eyebrow_text || 'پیگیری سفارش'}
              </p>
            ) : null}
            <h2>{cfg.title || 'وضعیت تعمیر من'}</h2>
            {cfg.subtitle ? <p>{cfg.subtitle}</p> : null}
          </div>
        </header>

        {isAuthenticated ? (
          <p className={styles.trackDeskHint}>
            اگر وارد حساب شده‌اید، همه سفارش‌هایتان را در{' '}
            <Link href="/todoservice">میز خدمت تعمیرات</Link> هم می‌بینید.
          </p>
        ) : null}

        <form className={styles.formStack} onSubmit={lookup}>
          <div className={styles.row2}>
            <label className={styles.label}>
              {cfg.code_label || 'کد سفارش'}
              <input
                className={styles.input}
                dir="ltr"
                placeholder={cfg.code_placeholder || 'مثلاً R-1403-001'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            <label className={styles.label}>
              {cfg.mobile_label || 'شماره موبایل'}
              <input
                className={styles.input}
                dir="ltr"
                inputMode="tel"
                placeholder={cfg.mobile_placeholder || '09xxxxxxxxx'}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </label>
          </div>
          {msg ? <p className={styles.error}>{msg}</p> : null}
          <button type="submit" className={styles.submitBtn} disabled={busy}>
            <Search size={16} aria-hidden />
            {busy ? 'در حال جستجو…' : cfg.submit_label || 'نمایش وضعیت'}
          </button>
        </form>

        {result ? (
          <div className={styles.trackResult}>
            <div className={styles.trackResultTop}>
              <div>
                <span className={styles.trackResultCode}>کد {result.code}</span>
                <strong className={styles.trackResultStatus}>
                  {result.status_label || result.status}
                </strong>
              </div>
              {result.city ? (
                <span className={styles.trackResultCity}>{result.city}</span>
              ) : null}
            </div>
            <div className={styles.trackResultMeta}>
              {result.device_title ? (
                <span>دستگاه: {result.device_title}</span>
              ) : null}
              {result.technician_name ? (
                <span>تکنسین: {result.technician_name}</span>
              ) : null}
            </div>
            <div className={styles.trackResultActions}>
              {trackHref ? (
                <Link href={trackHref} className={styles.trackResultPrimary}>
                  مشاهده جزئیات و پرداخت
                </Link>
              ) : null}
              {isAuthenticated ? (
                <Link href="/todoservice" className={styles.trackResultSecondary}>
                  میز خدمت تعمیرات
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
