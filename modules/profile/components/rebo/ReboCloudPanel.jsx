'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  AlertTriangle,
  Cloud,
  CreditCard,
  ExternalLink,
  Loader2,
  Receipt,
  RefreshCw,
  Server,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import styles from '../../styles/ReboHub.module.css'

function money(n, cur = 'تومان') {
  return `${Number(n || 0).toLocaleString('fa-IR')} ${cur}`
}

export default function ReboCloudPanel({
  onSubscriptionChange,
  compact = false,
}) {
  const { isAuthenticated, getAuthHeaders, user } = useAuth()
  const [cfg, setCfg] = useState(null)
  const [sub, setSub] = useState(null)
  const [ledger, setLedger] = useState([])
  const [topups, setTopups] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [form, setForm] = useState({
    display_name: '',
    contact_name: '',
    contact_mobile: '',
    accepted_policy: false,
  })
  const [topupAmount, setTopupAmount] = useState('')
  const [receiptNote, setReceiptNote] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const cfgRes = await axios.get(Config.endpoints.cloudServer.config())
      setCfg(cfgRes.data?.data || null)
      if (!isAuthenticated) {
        setSub(null)
        onSubscriptionChange?.(null)
        return
      }
      const headers = getAuthHeaders()
      const [my, led, tops] = await Promise.all([
        axios.get(Config.endpoints.cloudServer.my(), { headers }),
        axios.get(Config.endpoints.cloudServer.myLedger(), { headers }),
        axios.get(Config.endpoints.cloudServer.myTopups(), { headers }),
      ])
      const nextSub = my.data?.data || null
      setSub(nextSub)
      setLedger(led.data?.data || [])
      setTopups(tops.data?.data || [])
      onSubscriptionChange?.(nextSub)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در بارگذاری سرور')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, isAuthenticated, onSubscriptionChange])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (user?.mobile) {
      setForm((f) => (f.contact_mobile ? f : { ...f, contact_mobile: user.mobile }))
    }
  }, [user?.mobile])

  const order = async () => {
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await axios.post(
        Config.endpoints.cloudServer.my(),
        form,
        { headers: getAuthHeaders() },
      )
      setSub(res.data?.data || null)
      onSubscriptionChange?.(res.data?.data || null)
      setMsg('اشتراک ثبت شد — برای فعال‌سازی شارژ کنید')
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'ثبت سفارش ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const topupGateway = async () => {
    setBusy(true)
    setErr(null)
    try {
      const amount = Math.round(Number(topupAmount) || 0)
      const res = await axios.post(
        Config.endpoints.cloudServer.myTopups(),
        { method: 'gateway', amount },
        { headers: getAuthHeaders() },
      )
      const url = res.data?.data?.payment_url
      if (url) window.location.href = url
      else setMsg('پرداخت ایجاد شد')
    } catch (e) {
      setErr(e?.response?.data?.message || 'خطا در درگاه')
    } finally {
      setBusy(false)
    }
  }

  const topupReceipt = async () => {
    if (!receiptFile) {
      setErr('تصویر رسید را انتخاب کنید')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const amount = Math.round(Number(topupAmount) || 0)
      const fd = new FormData()
      fd.append('method', 'receipt')
      fd.append('amount', String(amount))
      fd.append('receipt_note', receiptNote)
      fd.append('receipt_image', receiptFile)
      await axios.post(Config.endpoints.cloudServer.myTopups(), fd, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
      setMsg('رسید ارسال شد و پس از تأیید مدیر شارژ می‌شود')
      setReceiptFile(null)
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'ارسال رسید ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const currency = cfg?.currency_label || sub?.currency_label || 'تومان'

  if (loading) {
    return (
      <div className={styles.panelLoading} role="status">
        <Loader2 size={22} className={styles.spin} />
      </div>
    )
  }

  return (
    <section className={`${styles.cloud} ${compact ? styles.cloudCompact : ''}`} dir="rtl" lang="fa">
      <header className={styles.sectionHead}>
        <p className={styles.eyebrow}>
          <Cloud size={14} />
          سرور ابری اشتراکی
        </p>
        <div className={styles.sectionHeadRow}>
          <div>
            <h2>{cfg?.title || 'سرور ابری ربو'}</h2>
            <p>
              {cfg?.description ||
                'بدون سرور اختصاصی — با شارژ اعتبار و کسر روزانه از حساب شما'}
            </p>
          </div>
          <div className={styles.sectionHeadActions}>
            <button
              type="button"
              className={styles.ghostIconBtn}
              onClick={load}
              aria-label="بروزرسانی"
            >
              <RefreshCw size={14} />
            </button>
            <Link href="/cloud-server" className={styles.ghostBtn}>
              صفحه کامل
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </header>

      {msg || err ? (
        <div className={styles.alerts}>
          {msg ? <p className={styles.ok}>{msg}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}
        </div>
      ) : null}

      {cfg ? (
        <article className={styles.panelCard}>
          <div className={styles.priceRow}>
            <div>
              <strong>{money(cfg.daily_price, currency)}</strong>
              <span>هزینه روزانه</span>
            </div>
            <div>
              <strong>{money(cfg.monthly_estimate, currency)}</strong>
              <span>برآورد ۳۰ روزه</span>
            </div>
            <div>
              <strong>
                {(cfg.warning_days || 5).toLocaleString('fa-IR')} روز
              </strong>
              <span>شروع هشدار</span>
            </div>
          </div>
          {(cfg.specs || []).length ? (
            <ul className={styles.specs}>
              {cfg.specs.map((s, i) => (
                <li key={i}>
                  <Server size={13} />
                  <span>
                    <b>{s.label}:</b> {s.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {cfg.wipe_policy_text ? (
            <div className={styles.policy}>
              <ShieldAlert size={15} />
              <p>{cfg.wipe_policy_text}</p>
            </div>
          ) : null}
        </article>
      ) : null}

      {isAuthenticated && !sub ? (
        <article className={styles.panelCard}>
          <h3>ثبت سفارش سرور</h3>
          <div className={styles.formGrid}>
            <label>
              نام پروژه
              <input
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
              />
            </label>
            <label>
              نام مسئول
              <input
                value={form.contact_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_name: e.target.value }))
                }
              />
            </label>
            <label>
              موبایل (پیامک هشدار)
              <input
                dir="ltr"
                value={form.contact_mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_mobile: e.target.value }))
                }
              />
            </label>
            <label
              className={`${styles.policyCheck} ${
                form.accepted_policy ? styles.policyCheckOn : ''
              }`}
            >
              <input
                type="checkbox"
                checked={form.accepted_policy}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    accepted_policy: e.target.checked,
                  }))
                }
              />
              <span className={styles.policyCheckBox} aria-hidden>
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 8.2 6.4 11l6.1-6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.policyCheckCopy}>
                <strong>پذیرش شرایط حذف داده</strong>
                <small>
                  پس از اتمام اعتبار و پایان مهلت، داده‌های سرور حذف می‌شود و
                  مسئولیت آن با من است.
                </small>
              </span>
            </label>
          </div>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={
              busy || !cfg?.is_accepting_orders || !form.accepted_policy
            }
            onClick={order}
          >
            {busy ? <Loader2 size={15} className={styles.spin} /> : null}
            ثبت سفارش سرور
          </button>
        </article>
      ) : null}

      {sub ? (
        <>
          <article className={styles.panelCard}>
            <div className={styles.subHead}>
              <h3>
                اشتراک <span dir="ltr">{sub.code}</span>
                {sub.in_warning ? (
                  <span className={styles.warnBadge}>
                    <AlertTriangle size={13} /> هشدار اعتبار
                  </span>
                ) : null}
              </h3>
            </div>
            <div className={styles.balanceRow}>
              <div>
                <span>وضعیت</span>
                <strong>{sub.status_display || sub.status}</strong>
              </div>
              <div>
                <span>موجودی</span>
                <strong>{money(sub.balance, currency)}</strong>
              </div>
              <div>
                <span>حدود باقی‌مانده</span>
                <strong>
                  {(sub.days_remaining || 0).toLocaleString('fa-IR')} روز
                </strong>
              </div>
            </div>
            {sub.status === 'grace' ? (
              <p className={styles.err}>
                اعتبار تمام شده — حداکثر{' '}
                {(sub.wipe_in_days ?? 0).toLocaleString('fa-IR')} روز تا حذف داده.
              </p>
            ) : null}
            {sub.status === 'wiped' ? (
              <p className={styles.err}>داده این سرور به‌دلیل عدم شارژ حذف شده است.</p>
            ) : null}
          </article>

          {sub.status !== 'wiped' ? (
            <article className={styles.panelCard}>
              <h3>شارژ اعتبار</h3>
              {cfg?.payment_instructions ? (
                <p className={styles.hint}>{cfg.payment_instructions}</p>
              ) : null}
              {(cfg?.bank_card || cfg?.bank_sheba) && (
                <div className={styles.bank}>
                  {cfg.bank_name ? <span>بانک: {cfg.bank_name}</span> : null}
                  {cfg.bank_owner ? <span>به نام: {cfg.bank_owner}</span> : null}
                  {cfg.bank_card ? <span>کارت: {cfg.bank_card}</span> : null}
                  {cfg.bank_sheba ? <span>شبا: {cfg.bank_sheba}</span> : null}
                </div>
              )}
              <label className={styles.field}>
                مبلغ ({currency}) — حداقل {money(cfg?.min_topup_amount, currency)}
                <input
                  type="number"
                  dir="ltr"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                />
              </label>
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={busy}
                  onClick={topupGateway}
                >
                  <CreditCard size={15} />
                  پرداخت آنلاین
                </button>
              </div>
              <div className={styles.receiptBox}>
                <h4>
                  <Receipt size={14} /> ارسال فیش واریزی
                </h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
                <input
                  type="text"
                  placeholder="توضیح رسید (اختیاری)"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.ghostBtn}
                  disabled={busy}
                  onClick={topupReceipt}
                >
                  ارسال فیش برای تأیید
                </button>
              </div>
            </article>
          ) : null}

          <div className={styles.splitRow}>
            <article className={styles.panelCard}>
              <h3>آخرین گردش حساب</h3>
              <ul className={styles.ledger}>
                {ledger.slice(0, 8).map((row) => (
                  <li key={row.id}>
                    <span>{row.entry_type_display}</span>
                    <b>{money(row.amount, currency)}</b>
                    {row.description ? <small>{row.description}</small> : null}
                  </li>
                ))}
                {!ledger.length ? (
                  <li className={styles.emptyHint}>موردی نیست</li>
                ) : null}
              </ul>
            </article>
            <article className={styles.panelCard}>
              <h3>درخواست‌های شارژ</h3>
              <ul className={styles.ledger}>
                {topups.slice(0, 8).map((t) => (
                  <li key={t.id}>
                    <span>{t.method_display}</span>
                    <b>{money(t.amount, currency)}</b>
                    <small>{t.status_display}</small>
                  </li>
                ))}
                {!topups.length ? (
                  <li className={styles.emptyHint}>موردی نیست</li>
                ) : null}
              </ul>
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}
