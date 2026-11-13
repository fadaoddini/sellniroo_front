'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  AlertTriangle,
  Cloud,
  CreditCard,
  LogIn,
  Receipt,
  RefreshCw,
  Server,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import styles from './CloudServer.module.css'

function money(n, cur = 'تومان') {
  return `${Number(n || 0).toLocaleString('fa-IR')} ${cur}`
}

export default function CloudServerPage() {
  const { isAuthenticated, loading, getAuthHeaders, user } = useAuth()
  const [cfg, setCfg] = useState(null)
  const [sub, setSub] = useState(null)
  const [ledger, setLedger] = useState([])
  const [topups, setTopups] = useState([])
  const [busy, setBusy] = useState(false)
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
        return
      }
      const headers = getAuthHeaders()
      const [my, led, tops] = await Promise.all([
        axios.get(Config.endpoints.cloudServer.my(), { headers }),
        axios.get(Config.endpoints.cloudServer.myLedger(), { headers }),
        axios.get(Config.endpoints.cloudServer.myTopups(), { headers }),
      ])
      setSub(my.data?.data || null)
      setLedger(led.data?.data || [])
      setTopups(tops.data?.data || [])
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا')
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    if (!loading) load()
  }, [loading, load])

  useEffect(() => {
    if (user?.mobile) {
      setForm((f) => (f.contact_mobile ? f : { ...f, contact_mobile: user.mobile }))
    }
  }, [user?.mobile])

  const order = async () => {
    if (!isAuthenticated) {
      setErr('برای سفارش وارد شوید')
      return
    }
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

  return (
    <div className={styles.page} dir="rtl" lang="fa">
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden>
          <Cloud size={22} strokeWidth={1.8} />
        </span>
        <div>
          <h1>{cfg?.title || 'سرور ابری اشتراکی'}</h1>
          <p>
            {cfg?.description ||
              'بدون سرور اختصاصی — با شارژ اعتبار و کسر روزانه از حساب شما'}
          </p>
        </div>
      </header>

      {msg || err ? (
        <div className={styles.alerts}>
          {msg ? <p className={styles.ok}>{msg}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}
        </div>
      ) : null}

      {cfg ? (
        <section className={styles.card}>
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
              <span>شروع هشدار پیامک</span>
            </div>
            <div>
              <strong>
                {(cfg.grace_days || 5).toLocaleString('fa-IR')} روز
              </strong>
              <span>مهلت تا حذف داده</span>
            </div>
          </div>
          {(cfg.specs || []).length ? (
            <ul className={styles.specs}>
              {cfg.specs.map((s, i) => (
                <li key={i}>
                  <Server size={14} strokeWidth={2} />
                  <span>
                    <b>{s.label}:</b> {s.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {cfg.wipe_policy_text ? (
            <div className={styles.policy}>
              <ShieldAlert size={16} />
              <p>{cfg.wipe_policy_text}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isAuthenticated && !loading ? (
        <section className={`${styles.card} ${styles.loginCard}`}>
          <p>برای سفارش سرور و شارژ اعتبار وارد حساب کاربری شوید.</p>
          <Link
            href="/login?next=/cloud-server"
            className={styles.primary}
          >
            <LogIn size={16} />
            ورود به حساب
          </Link>
        </section>
      ) : null}

      {isAuthenticated && !sub ? (
        <section className={styles.card}>
          <h2>ثبت سفارش سرور</h2>
          <div className={styles.form}>
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
              موبایل (برای پیامک هشدار)
              <input
                dir="ltr"
                value={form.contact_mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_mobile: e.target.value }))
                }
              />
            </label>
            <label className={styles.check}>
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
              شرایط حذف داده پس از اتمام اعتبار و مهلت را می‌پذیرم؛ مسئولیت با من
              است.
            </label>
          </div>
          <button
            type="button"
            className={styles.primary}
            disabled={busy || !cfg?.is_accepting_orders}
            onClick={order}
          >
            ثبت سفارش
          </button>
        </section>
      ) : null}

      {sub ? (
        <>
          <section className={styles.card}>
            <div className={styles.subHead}>
              <h2>
                اشتراک {sub.code}
                {sub.in_warning ? (
                  <span className={styles.warnBadge}>
                    <AlertTriangle size={14} /> هشدار اعتبار
                  </span>
                ) : null}
              </h2>
              <button
                type="button"
                className={styles.ghost}
                onClick={load}
                aria-label="بروزرسانی"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div className={styles.balanceRow}>
              <div className={styles.balanceItem}>
                <span>وضعیت</span>
                <strong>{sub.status_display || sub.status}</strong>
              </div>
              <div className={styles.balanceItem}>
                <span>موجودی</span>
                <strong>{money(sub.balance, currency)}</strong>
              </div>
              <div className={styles.balanceItem}>
                <span>حدود باقی‌مانده</span>
                <strong>
                  {(sub.days_remaining || 0).toLocaleString('fa-IR')} روز
                </strong>
              </div>
            </div>
            {sub.status === 'grace' ? (
              <p className={styles.err} style={{ marginTop: '0.85rem' }}>
                اعتبار تمام شده — حداکثر{' '}
                {(sub.wipe_in_days ?? 0).toLocaleString('fa-IR')} روز تا حذف کامل
                داده فرصت دارید.
              </p>
            ) : null}
            {sub.status === 'wiped' ? (
              <p className={styles.err} style={{ marginTop: '0.85rem' }}>
                داده این سرور به‌دلیل عدم شارژ حذف شده است.
              </p>
            ) : null}
          </section>

          {sub.status !== 'wiped' ? (
            <section className={styles.card}>
              <h2>شارژ اعتبار</h2>
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
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={busy}
                  onClick={topupGateway}
                >
                  <CreditCard size={16} />
                  پرداخت آنلاین
                </button>
              </div>
              <div className={styles.receiptBox}>
                <h3>
                  <Receipt size={16} /> ارسال فیش واریزی
                </h3>
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
                  className={styles.ghost}
                  disabled={busy}
                  onClick={topupReceipt}
                >
                  ارسال فیش برای تأیید
                </button>
              </div>
            </section>
          ) : null}

          <section className={styles.card}>
            <h2>آخرین گردش حساب</h2>
            <ul className={styles.ledger}>
              {ledger.map((row) => (
                <li key={row.id}>
                  <span>{row.entry_type_display}</span>
                  <span>{money(row.amount, currency)}</span>
                  {row.description ? <small>{row.description}</small> : null}
                </li>
              ))}
              {!ledger.length ? (
                <li className={styles.ledgerEmpty}>موردی نیست</li>
              ) : null}
            </ul>
          </section>

          <section className={styles.card}>
            <h2>درخواست‌های شارژ</h2>
            <ul className={styles.ledger}>
              {topups.map((t) => (
                <li key={t.id}>
                  <span>{t.method_display}</span>
                  <span>{money(t.amount, currency)}</span>
                  <small>{t.status_display}</small>
                </li>
              ))}
              {!topups.length ? (
                <li className={styles.ledgerEmpty}>موردی نیست</li>
              ) : null}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
