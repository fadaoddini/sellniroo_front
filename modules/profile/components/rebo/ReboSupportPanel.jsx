'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  LifeBuoy,
  Loader2,
  RefreshCw,
  Shield,
  Timer,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { DEFAULT_SUPPORT, formatRial } from '@/config/reboPricing'
import styles from '../../styles/ReboHub.module.css'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

function normalizePlans(block) {
  const raw = Array.isArray(block?.plans) ? block.plans : []
  return raw
    .map((p, idx) => ({
      id: String(p.id || p.key || `plan-${idx}`),
      name: String(p.name || p.title || `پلن ${idx + 1}`),
      monthly_price: Number(p.monthly_price || p.price || 0),
      hours_per_month: Number(p.hours_per_month || p.hours || 0) || null,
      suitable_for: String(p.suitable_for || p.suitable || '').trim(),
      breakdown: Array.isArray(p.breakdown) ? p.breakdown : [],
      tone:
        p.id === 'gold' || /طلا/i.test(p.name || '')
          ? 'gold'
          : p.id === 'silver' || /نقره/i.test(p.name || '')
            ? 'silver'
            : p.id === 'basic' || /پایه|بیسیک/i.test(p.name || '')
              ? 'basic'
              : 'bronze',
    }))
    .filter((p) => p.name)
}

function daysRemaining(untilIso) {
  if (!untilIso) return null
  const until = new Date(untilIso).getTime()
  if (!Number.isFinite(until)) return null
  return Math.max(0, Math.floor((until - Date.now()) / 86400000))
}

export default function ReboSupportPanel({ site = null }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCode, setSelectedCode] = useState('')
  const [planId, setPlanId] = useState('')
  const [planDetailId, setPlanDetailId] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const supportBlock = useMemo(() => {
    const fromSite = site?.rebo_pricing?.support || {}
    return {
      ...DEFAULT_SUPPORT,
      ...fromSite,
      plans:
        Array.isArray(fromSite.plans) && fromSite.plans.length
          ? fromSite.plans
          : DEFAULT_SUPPORT.plans,
    }
  }, [site])

  const plans = useMemo(() => normalizePlans(supportBlock), [supportBlock])
  const freeMonths = Number(supportBlock.free_months || 3)
  const renewWindow = Number(supportBlock.renew_window_days || 10)
  const currency = supportBlock.currency_label || 'تومان'
  const title = supportBlock.title || 'پشتیبانی پس از تحویل'
  const desc =
    supportBlock.desc ||
    supportBlock.description ||
    `${freeMonths.toLocaleString('fa-IR')} ماه رایگان پس از تحویل نهایی؛ سپس تمدید ماهانه.`
  const coverage = Array.isArray(supportBlock.coverage) ? supportBlock.coverage : []
  const terms = Array.isArray(supportBlock.terms) ? supportBlock.terms : []
  const intro = supportBlock.intro || ''
  const inflationNote = supportBlock.inflation_note || ''

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await axios.get(Config.endpoints.reboOrders.my({ archived: '0' }), {
        headers: getAuthHeaders(),
        timeout: 12000,
      })
      const rows = Array.isArray(res.data?.data) ? res.data.data : []
      setOrders(rows)
      setSelectedCode((prev) => {
        if (prev && rows.some((o) => o.code === prev)) return prev
        const withSupport = rows.find(
          (o) => o.support_status && o.support_status !== 'inactive',
        )
        return withSupport?.code || rows[0]?.code || ''
      })
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!planId && plans[0]?.id) setPlanId(plans[0].id)
  }, [planId, plans])

  const supportOrders = useMemo(() => {
    void tick
    return orders
      .filter((o) => o.support_status && o.support_status !== 'inactive')
      .map((o) => {
        const days = daysRemaining(o.support_until)
        const expired = o.support_status === 'expired' || days === 0
        const active =
          (o.support_status === 'free_active' || o.support_status === 'paid_active') &&
          !expired
        const inRenewWindow = expired || days == null || days <= renewWindow
        const renewEligible = Boolean(plans.length)
        const canRenew = renewEligible && inRenewWindow
        const total = Math.max(1, freeMonths * 30)
        const pct =
          days == null
            ? 0
            : Math.max(0, Math.min(100, Math.round((days / total) * 100)))
        return { ...o, days, expired, active, inRenewWindow, canRenew, pct }
      })
  }, [orders, freeMonths, renewWindow, plans.length, tick])

  const current =
    supportOrders.find((o) => o.code === selectedCode) || supportOrders[0] || null

  const selectedPlan =
    plans.find((p) => p.id === planId) || plans[0] || null

  return (
    <section className={`${styles.support} ${styles.compactPanel}`} dir="rtl" lang="fa">
      <header className={styles.deskHeroCompact}>
        <div>
          <p className={styles.eyebrow}>
            <LifeBuoy size={12} />
            پنل پشتیبانی
          </p>
          <h2>{title}</h2>
        </div>
        <button type="button" className={styles.ghostIconBtn} onClick={load}>
          <RefreshCw size={12} className={loading ? styles.spin : undefined} />
        </button>
      </header>

      <div className={styles.spBox}>
        <div className={styles.spHero}>
          <span className={styles.spHeroIcon} aria-hidden>
            <Shield size={15} />
          </span>
          <div>
            <strong>{title}</strong>
            <p>{desc}</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.panelLoading}>
            <Loader2 size={14} className={styles.spin} />
          </div>
        ) : !current ? (
          <p className={styles.spMuted}>
            پشتیبانی بعد از «اتمام کار» در ستون تحویل نهایی فعال می‌شود —{' '}
            {freeMonths.toLocaleString('fa-IR')} ماه رایگان.
          </p>
        ) : (
          <>
            {supportOrders.length > 1 ? (
              <div className={styles.spOrderTabs} role="tablist">
                {supportOrders.map((o) => (
                  <button
                    key={o.code}
                    type="button"
                    role="tab"
                    aria-selected={o.code === current.code}
                    className={`${styles.spOrderTab} ${
                      o.code === current.code ? styles.spOrderTabOn : ''
                    }`}
                    onClick={() => setSelectedCode(o.code)}
                  >
                    <span dir="ltr">{o.code}</span>
                    <small>
                      {(o.days ?? 0).toLocaleString('fa-IR')} روز
                    </small>
                  </button>
                ))}
              </div>
            ) : null}

            <div className={styles.spMeter}>
              <div className={styles.spMeterTop}>
                <span
                  className={styles.spStatusPill}
                  data-state={current.support_status || 'inactive'}
                >
                  {current.support_status_display || current.support_status}
                </span>
                <span className={styles.spDaysBig}>
                  {(current.days ?? 0).toLocaleString('fa-IR')}
                  <small>روز باقی</small>
                </span>
              </div>
              <div
                className={styles.spMeterBar}
                role="progressbar"
                aria-valuenow={current.pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ width: `${current.pct}%` }} />
              </div>
              <div className={styles.spMeterMeta}>
                <span>
                  پایان: <b>{formatDate(current.support_until)}</b>
                </span>
                {current.support_plan_name ? (
                  <span>
                    پلن: <b>{current.support_plan_name}</b>
                  </span>
                ) : null}
                <span dir="ltr">{current.code}</span>
              </div>
            </div>

            {current.active && current.support_status === 'free_active' ? (
              <p className={styles.spOk}>
                <CheckCircle2 size={12} />
                دوره رایگان فعال — {freeMonths.toLocaleString('fa-IR')} ماه از
                اتمام تحویل نهایی
              </p>
            ) : null}

            {current.expired ? (
              <p className={styles.spAlert}>
                <AlertTriangle size={12} />
                دوره تمام شده — برای ادامه، پلن تمدید را انتخاب کنید.
              </p>
            ) : null}

            {!current.expired &&
            current.days != null &&
            current.days <= renewWindow &&
            current.days > 0 ? (
              <p className={styles.spWarn}>
                <Timer size={12} />
                کمتر از {renewWindow.toLocaleString('fa-IR')} روز مانده — تمدید
                باز است.
              </p>
            ) : null}

            <div className={styles.spTerms}>
              <button
                type="button"
                className={styles.spToggle}
                onClick={() => setTermsOpen((v) => !v)}
              >
                <FileText size={13} />
                <span>
                  {termsOpen ? 'بستن پوشش و مفاد' : 'پوشش و مفاد پشتیبانی'}
                </span>
              </button>
              {termsOpen ? (
                <div className={styles.spTermsBody}>
                  {intro ? <p className={styles.spIntro}>{intro}</p> : null}
                  {coverage.length ? (
                    <ul className={styles.spCoverage}>
                      {coverage.map((item) => (
                        <li key={item.id || item.title}>
                          <b>{item.title}</b>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : terms.length ? (
                    <ol className={styles.spTermsList}>
                      {terms.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  ) : null}
                  <div className={styles.spFacts}>
                    <span>
                      {freeMonths.toLocaleString('fa-IR')} ماه رایگان پس از تحویل
                    </span>
                    <span>
                      تمدید از {renewWindow.toLocaleString('fa-IR')} روز مانده
                    </span>
                    {inflationNote ? <span>{inflationNote}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>

            {plans.length ? (
              <div
                className={`${styles.spRenew} ${
                  current.canRenew ? '' : styles.spRenewDim
                }`}
                aria-disabled={!current.canRenew}
              >
                <div className={styles.spRenewHead}>
                  <strong>
                    <RefreshCw size={13} /> تمدید ماهانه
                  </strong>
                  <p>
                    {current.canRenew
                      ? 'پلن را انتخاب کنید و برای پرداخت وارد میزکار قرارداد شوید.'
                      : `از ${renewWindow.toLocaleString('fa-IR')} روز مانده فعال می‌شود${
                          current.days != null
                            ? ` — الان ${current.days.toLocaleString('fa-IR')} روز باقی است`
                            : ''
                        }.`}
                  </p>
                </div>

                <div
                  className={styles.spPlanStrip}
                  role="radiogroup"
                  aria-label="پلن پشتیبانی"
                >
                  {plans.map((p) => {
                    const on =
                      current.canRenew && (selectedPlan?.id || '') === p.id
                    const showDetail =
                      planDetailId === p.id || (current.canRenew && on)
                    return (
                      <div
                        key={p.id}
                        className={`${styles.spPlan} ${
                          styles[`spPlan_${p.tone}`] || ''
                        } ${on ? styles.spPlanOn : ''}`}
                      >
                        <button
                          type="button"
                          className={styles.spPlanMain}
                          disabled={!current.canRenew}
                          onClick={() => {
                            if (!current.canRenew) return
                            setPlanId(p.id)
                            setPlanDetailId(p.id)
                          }}
                        >
                          <span className={styles.spPlanBadge}>{p.name}</span>
                          <span className={styles.spPlanPrice}>
                            {formatRial(p.monthly_price)}
                            <small>{currency}/ماه</small>
                          </span>
                          {p.hours_per_month ? (
                            <span className={styles.spPlanHours}>
                              ≈{' '}
                              {Number(p.hours_per_month).toLocaleString('fa-IR')}{' '}
                              ساعت
                            </span>
                          ) : null}
                          {p.suitable_for ? (
                            <span className={styles.spPlanSuit}>
                              {p.suitable_for}
                            </span>
                          ) : null}
                        </button>
                        {(p.breakdown || []).length ? (
                          <>
                            <button
                              type="button"
                              className={styles.spPlanMore}
                              onClick={() =>
                                setPlanDetailId((cur) =>
                                  cur === p.id ? '' : p.id,
                                )
                              }
                            >
                              {showDetail
                                ? 'بستن جزئیات جلسات'
                                : 'جزئیات جلسات'}
                            </button>
                            {showDetail ? (
                              <ul className={styles.spPlanBreak}>
                                {p.breakdown.map((b) => (
                                  <li key={b.id || b.title}>
                                    <strong>{b.title}</strong>
                                    {b.detail ? <span>{b.detail}</span> : null}
                                    {b.monthly ? <span>{b.monthly}</span> : null}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>

                {current.canRenew ? (
                  <Link
                    href={`/todorebo?code=${encodeURIComponent(current.code)}${
                      selectedPlan?.id
                        ? `&supportPlan=${encodeURIComponent(selectedPlan.id)}`
                        : ''
                    }`}
                    className={styles.spPayBtn}
                  >
                    تمدید در میزکار قرارداد
                    <ArrowLeft size={13} />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
