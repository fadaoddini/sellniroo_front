'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  AlertTriangle,
  Check,
  Cloud,
  Copy,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCw,
  Server,
  ShieldAlert,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import CloudRemainTimer from './CloudRemainTimer'
import styles from '../../styles/ReboHub.module.css'

function money(n, cur = 'تومان') {
  return `${Number(n || 0).toLocaleString('fa-IR')} ${cur}`
}

function formatCardNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatSheba(raw) {
  const s = String(raw || '').replace(/\s/g, '').toUpperCase()
  if (!s) return ''
  return s.replace(/(.{4})/g, '$1 ').trim()
}

const PAY_METHODS = [
  { id: 'receipt', label: 'فیش', icon: Receipt },
  { id: 'gateway', label: 'درگاه', icon: CreditCard },
  { id: 'wallet', label: 'کیف پول', icon: Wallet },
]

export default function ReboCloudPanel({
  onSubscriptionChange,
  compact = false,
}) {
  const { isAuthenticated, getAuthHeaders, user } = useAuth()
  const [cfg, setCfg] = useState(null)
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [ledger, setLedger] = useState([])
  const [topups, setTopups] = useState([])
  const [walletBalance, setWalletBalance] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState('')
  const [payMethod, setPayMethod] = useState('receipt')
  const [form, setForm] = useState({
    display_name: '',
    contact_name: '',
    contact_mobile: '',
    accepted_policy: false,
  })
  const [topupAmount, setTopupAmount] = useState('')
  const [receiptNote, setReceiptNote] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)

  const sub = useMemo(() => {
    if (!items.length) return null
    return items.find((s) => String(s.id) === String(selectedId)) || items[0]
  }, [items, selectedId])

  const load = useCallback(async () => {
    setErr(null)
    try {
      const [cfgRes, payRes] = await Promise.all([
        axios.get(Config.endpoints.cloudServer.config()),
        axios.get(Config.endpoints.reboOrders.config()).catch(() => null),
      ])
      const cloudCfg = cfgRes.data?.data || null
      const payCfg = payRes?.data?.data || {}
      setCfg({
        ...(cloudCfg || {}),
        bank_name: payCfg.bank_name || cloudCfg?.bank_name || '',
        bank_owner: payCfg.bank_owner || cloudCfg?.bank_owner || '',
        bank_card: payCfg.bank_card || cloudCfg?.bank_card || '',
        bank_sheba: payCfg.bank_sheba || cloudCfg?.bank_sheba || '',
        payment_instructions:
          payCfg.payment_instructions || cloudCfg?.payment_instructions || '',
      })
      if (!isAuthenticated) {
        setItems([])
        setWalletBalance(null)
        onSubscriptionChange?.(null)
        return
      }
      const headers = getAuthHeaders()
      const [my, led, tops, walletRes] = await Promise.all([
        axios.get(Config.endpoints.cloudServer.my(), { headers }),
        axios.get(Config.endpoints.cloudServer.myLedger(), { headers }),
        axios.get(Config.endpoints.cloudServer.myTopups(), { headers }),
        axios
          .get(Config.endpoints.order.wallet(), { headers, timeout: 8000 })
          .catch(() => null),
      ])
      const list = Array.isArray(my.data?.items)
        ? my.data.items
        : my.data?.data
          ? [my.data.data]
          : []
      setItems(list)
      setSelectedId((prev) => {
        if (prev && list.some((s) => String(s.id) === String(prev))) return prev
        return list[0]?.id ?? null
      })
      setLedger(led.data?.data || [])
      setTopups(tops.data?.data || [])
      if (walletRes) {
        const bal =
          walletRes.data?.data?.balance ??
          walletRes.data?.balance ??
          walletRes.data?.data ??
          0
        setWalletBalance(Number(bal) || 0)
      } else {
        setWalletBalance(null)
      }
      onSubscriptionChange?.(list[0] || null)
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

  const copyText = async (value, key) => {
    const text = String(value || '').replace(/\s/g, '')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      setErr('کپی نشد — دستی کپی کنید')
    }
  }

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
      const created = res.data?.data || null
      setMsg('اشتراک ثبت شد — برای فعال‌سازی شارژ کنید')
      if (created?.id) setSelectedId(created.id)
      await load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'ثبت سفارش ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const parsedAmount = Math.round(Number(topupAmount) || 0)

  const topupGateway = async () => {
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.cloudServer.myTopups(),
        { method: 'gateway', amount: parsedAmount },
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
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('method', 'receipt')
      fd.append('amount', String(parsedAmount))
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

  const topupWallet = async () => {
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.cloudServer.myTopups(),
        { method: 'wallet', amount: parsedAmount },
        { headers: getAuthHeaders() },
      )
      setMsg(res.data?.message || 'شارژ از کیف پول انجام شد')
      setTopupAmount('')
      await load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'پرداخت از کیف پول ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const currency = cfg?.currency_label || sub?.currency_label || 'تومان'
  const cardDigits = formatCardNumber(cfg?.bank_card)
  const shebaFmt = formatSheba(cfg?.bank_sheba)
  const minTop = cfg?.min_topup_amount || 0
  const amountOk = parsedAmount >= minTop

  if (loading) {
    return (
      <div className={styles.panelLoading} role="status">
        <Loader2 size={22} className={styles.spin} />
      </div>
    )
  }

  return (
    <section
      className={`${styles.cloud} ${styles.compactPanel} ${compact ? styles.cloudCompact : ''}`}
      dir="rtl"
      lang="fa"
    >
      <header className={styles.deskHeroCompact}>
        <div>
          <p className={styles.eyebrow}>
            <Cloud size={12} />
            سرور ابری
          </p>
          <h2>{cfg?.title || 'سرور ابری ربو'}</h2>
        </div>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={load}
          aria-label="بروزرسانی"
        >
          <RefreshCw size={12} />
          بروزرسانی
        </button>
      </header>

      {msg || err ? (
        <div className={styles.alerts}>
          {msg ? <p className={styles.ok}>{msg}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}
        </div>
      ) : null}

      {/* چند اشتراک: انتخاب سریع */}
      {items.length > 1 ? (
        <div className={styles.csPick} role="tablist" aria-label="انتخاب سرور">
          {items.map((row) => {
            const active = String(row.id) === String(sub?.id)
            return (
              <button
                key={row.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.csPickBtn} ${active ? styles.csPickOn : ''}`}
                onClick={() => {
                  setSelectedId(row.id)
                  onSubscriptionChange?.(row)
                }}
              >
                <span dir="ltr">{row.code}</span>
                <small>{row.status_display || row.status}</small>
              </button>
            )
          })}
        </div>
      ) : null}

      {/* وضعیت اشتراک فعال */}
      {sub ? (
        <article className={styles.csStatus}>
          <div className={styles.csStatusTop}>
            <div>
              <p className={styles.csStatusLabel}>اشتراک فعلی</p>
              <h3>{sub.display_name || sub.domain || 'سرور ابری'}</h3>
              <span className={styles.csCode} dir="ltr">
                {sub.code}
              </span>
            </div>
            <span
              className={`${styles.csBadge} ${
                sub.status === 'grace' || sub.in_warning
                  ? styles.csBadgeWarn
                  : sub.status === 'wiped'
                    ? styles.csBadgeBad
                    : styles.csBadgeOk
              }`}
            >
              {sub.in_warning ? <AlertTriangle size={11} /> : null}
              {sub.status_display || sub.status}
            </span>
          </div>

          <div className={styles.csMetrics}>
            <div>
              <span>موجودی</span>
              <strong>{money(sub.balance, currency)}</strong>
            </div>
            <div>
              <span>روزانه</span>
              <strong>
                {money(cfg?.daily_price || sub.daily_price, currency)}
              </strong>
            </div>
            <div className={styles.csMetricTimer}>
              <CloudRemainTimer
                balance={sub.balance}
                dailyPrice={cfg?.daily_price || sub.daily_price}
                daysRemaining={sub.days_remaining}
                status={sub.status}
                wipeInDays={sub.wipe_in_days}
                compact
              />
            </div>
          </div>

          {sub.status === 'grace' ? (
            <p className={styles.csAlert}>
              اعتبار تمام شده — حداکثر{' '}
              {(sub.wipe_in_days ?? 0).toLocaleString('fa-IR')} روز تا حذف داده.
            </p>
          ) : null}
          {sub.status === 'wiped' ? (
            <p className={styles.csAlertBad}>
              داده این سرور به‌دلیل عدم شارژ حذف شده است.
            </p>
          ) : null}
        </article>
      ) : null}

      {/* سفارش جدید — بدون اشتراک */}
      {cfg && !items.length ? (
        <article className={styles.csCard}>
          <h3>شروع سرور ابری</h3>
          <div className={styles.csPriceRow}>
            <div>
              <strong>{money(cfg.daily_price, currency)}</strong>
              <span>روزانه</span>
            </div>
            <div>
              <strong>{money(cfg.monthly_estimate, currency)}</strong>
              <span>برآورد ۳۰ روز</span>
            </div>
            <div>
              <strong>
                {(cfg.warning_days || 5).toLocaleString('fa-IR')} روز
              </strong>
              <span>شروع هشدار</span>
            </div>
          </div>

          {(cfg.specs || []).length ? (
            <ul className={styles.csSpecs}>
              {cfg.specs.map((s, i) => (
                <li key={i}>
                  <Server size={12} />
                  <span>
                    <b>{s.label}:</b> {s.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {cfg.wipe_policy_text ? (
            <div className={styles.csPolicy}>
              <ShieldAlert size={14} />
              <p>{cfg.wipe_policy_text}</p>
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className={styles.csForm}>
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
                className={`${styles.csCheck} ${
                  form.accepted_policy ? styles.csCheckOn : ''
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
                <span>
                  <strong>پذیرش شرایط حذف داده</strong>
                  <small>
                    پس از اتمام اعتبار و پایان مهلت، داده‌ها حذف می‌شود.
                  </small>
                </span>
              </label>
              <button
                type="button"
                className={styles.cloudPrimaryBtn}
                disabled={
                  busy || !cfg?.is_accepting_orders || !form.accepted_policy
                }
                onClick={order}
              >
                {busy ? <Loader2 size={14} className={styles.spin} /> : null}
                ثبت سفارش سرور
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      {/* شارژ اعتبار */}
      {sub && sub.status !== 'wiped' ? (
        <article className={styles.csCard}>
          <div className={styles.csPayHead}>
            <div>
              <h3>شارژ اعتبار</h3>
              <p>
                حداقل مبلغ {money(minTop, currency)}
                {cfg?.payment_instructions
                  ? ` — ${cfg.payment_instructions}`
                  : ''}
              </p>
            </div>
            <label className={styles.csAmount}>
              <span>مبلغ ({currency})</span>
              <input
                type="number"
                dir="ltr"
                inputMode="numeric"
                placeholder={String(minTop || '')}
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.csMethods} role="tablist">
            {PAY_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={payMethod === id}
                className={`${styles.csMethod} ${
                  payMethod === id ? styles.csMethodOn : ''
                }`}
                onClick={() => setPayMethod(id)}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className={styles.csPayBody}>
            {payMethod === 'receipt' ? (
              <>
                {(cardDigits || shebaFmt) ? (
                  <div className={styles.csBank}>
                    <div className={styles.csBankTop}>
                      <span>{cfg?.bank_name || 'کارت واریز'}</span>
                      <em>{cfg?.bank_owner || 'ربو'}</em>
                    </div>
                    {cardDigits ? (
                      <button
                        type="button"
                        className={styles.csBankNum}
                        dir="ltr"
                        onClick={() => copyText(cfg.bank_card, 'card')}
                      >
                        {cardDigits}
                        {copied === 'card' ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    ) : null}
                    {shebaFmt ? (
                      <button
                        type="button"
                        className={styles.csBankSheba}
                        dir="ltr"
                        onClick={() => copyText(cfg.bank_sheba, 'sheba')}
                      >
                        {shebaFmt}
                        {copied === 'sheba' ? (
                          <Check size={11} />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className={styles.csMuted}>
                    شماره کارت در تنظیمات پرداخت ربو ثبت نشده است.
                  </p>
                )}
                <label className={styles.csFile}>
                  <span>
                    {receiptFile ? receiptFile.name : 'انتخاب تصویر فیش'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReceiptFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
                <input
                  className={styles.csInput}
                  type="text"
                  placeholder="توضیح رسید (اختیاری)"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.cloudPrimaryBtn}
                  disabled={busy || !receiptFile || !amountOk}
                  onClick={topupReceipt}
                >
                  {busy ? <Loader2 size={14} className={styles.spin} /> : null}
                  ارسال فیش برای تأیید
                </button>
              </>
            ) : null}

            {payMethod === 'gateway' ? (
              <>
                <div className={styles.csSummary}>
                  <span>مبلغ پرداخت</span>
                  <b>{amountOk ? money(parsedAmount, currency) : '—'}</b>
                </div>
                <p className={styles.csMuted}>
                  پس از درگاه، اعتبار سرور بلافاصله شارژ می‌شود.
                </p>
                <button
                  type="button"
                  className={styles.cloudPrimaryBtn}
                  disabled={busy || !amountOk}
                  onClick={topupGateway}
                >
                  {busy ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  پرداخت آنلاین
                </button>
              </>
            ) : null}

            {payMethod === 'wallet' ? (
              <>
                <div className={styles.csSummary}>
                  <span>موجودی کیف پول</span>
                  <b>
                    {walletBalance == null
                      ? '—'
                      : money(walletBalance, currency)}
                  </b>
                </div>
                <div className={styles.csSummary}>
                  <span>برداشت</span>
                  <b>{amountOk ? money(parsedAmount, currency) : '—'}</b>
                </div>
                <button
                  type="button"
                  className={styles.cloudPrimaryBtn}
                  disabled={
                    busy ||
                    !amountOk ||
                    walletBalance == null ||
                    walletBalance < parsedAmount
                  }
                  onClick={topupWallet}
                >
                  {busy ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Wallet size={14} />
                  )}
                  پرداخت از کیف پول
                </button>
              </>
            ) : null}
          </div>
        </article>
      ) : null}

      {/* تاریخچه */}
      {sub ? (
        <div className={styles.csHistory}>
          <article className={styles.csCard}>
            <h3>گردش حساب</h3>
            <ul className={styles.csList}>
              {ledger.slice(0, 8).map((row) => (
                <li key={row.id}>
                  <span>{row.entry_type_display}</span>
                  <b>{money(row.amount, currency)}</b>
                  {row.description ? <small>{row.description}</small> : null}
                </li>
              ))}
              {!ledger.length ? (
                <li className={styles.csEmpty}>موردی نیست</li>
              ) : null}
            </ul>
          </article>
          <article className={styles.csCard}>
            <h3>درخواست‌های شارژ</h3>
            <ul className={styles.csList}>
              {topups.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <span>{t.method_display}</span>
                  <b>{money(t.amount, currency)}</b>
                  <small>{t.status_display}</small>
                </li>
              ))}
              {!topups.length ? (
                <li className={styles.csEmpty}>موردی نیست</li>
              ) : null}
            </ul>
          </article>
        </div>
      ) : null}
    </section>
  )
}
