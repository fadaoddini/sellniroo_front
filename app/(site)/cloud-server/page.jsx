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
          <Cloud size={20} strokeWidth={1.8} />
        </span>
        <div className={styles.heroText}>
          <h1>{cfg?.title || 'سرور ابری اشتراکی'}</h1>
          <p>
            {cfg?.description ||
              'بدون سرور اختصاصی — با شارژ اعتبار و کسر روزانه از حساب شما'}
          </p>
        </div>
        {sub ? (
          <button
            type="button"
            className={styles.heroRefresh}
            onClick={load}
            aria-label="بروزرسانی"
          >
            <RefreshCw size={14} />
          </button>
        ) : null}
      </header>

      {msg || err ? (
        <div className={styles.alerts}>
          {msg ? <p className={styles.ok}>{msg}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.col}>
          <h2>پلن و مشخصات</h2>
          {cfg ? (
            <>
              <div className={styles.stats}>
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
                  <span>هشدار پیامک</span>
                </div>
              </div>
              {(cfg.specs || []).length ? (
                <ul className={styles.specs}>
                  {cfg.specs.map((s, i) => (
                    <li key={i}>
                      <Server size={13} strokeWidth={2} />
                      <span>
                        <b>{s.label}</b>
                        {s.value}
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
            </>
          ) : (
            <p className={styles.empty}>در حال بارگذاری پلن…</p>
          )}
        </section>

        <section className={styles.col}>
          {!isAuthenticated && !loading ? (
            <>
              <h2>شروع سفارش</h2>
              <p className={styles.hint}>
                برای سفارش سرور و شارژ اعتبار وارد حساب کاربری شوید.
              </p>
              <Link
                href="/login?next=/cloud-server"
                className={styles.primary}
              >
                <LogIn size={15} />
                ورود به حساب
              </Link>
            </>
          ) : null}

          {isAuthenticated && !sub ? (
            <>
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
                  شرایط حذف داده پس از اتمام اعتبار را می‌پذیرم.
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
            </>
          ) : null}

          {sub ? (
            <>
              <div className={styles.colHead}>
                <h2>اشتراک {sub.code}</h2>
                {sub.in_warning ? (
                  <span className={styles.warnBadge}>
                    <AlertTriangle size={12} /> هشدار
                  </span>
                ) : null}
              </div>
              <div className={styles.stats}>
                <div>
                  <strong>{sub.status_display || sub.status}</strong>
                  <span>وضعیت</span>
                </div>
                <div>
                  <strong>{money(sub.balance, currency)}</strong>
                  <span>موجودی</span>
                </div>
                <div>
                  <strong>
                    {(sub.days_remaining || 0).toLocaleString('fa-IR')} روز
                  </strong>
                  <span>باقی‌مانده</span>
                </div>
              </div>
              {sub.status === 'grace' ? (
                <p className={styles.err}>
                  اعتبار تمام شده — حداکثر{' '}
                  {(sub.wipe_in_days ?? 0).toLocaleString('fa-IR')} روز تا حذف
                  داده.
                </p>
              ) : null}
              {sub.status === 'wiped' ? (
                <p className={styles.err}>
                  داده این سرور به‌دلیل عدم شارژ حذف شده است.
                </p>
              ) : null}
              {sub.status !== 'wiped' ? (
                <div className={styles.charge}>
                  <h3>شارژ اعتبار</h3>
                  {cfg?.payment_instructions ? (
                    <p className={styles.hint}>{cfg.payment_instructions}</p>
                  ) : null}
                  {(cfg?.bank_card || cfg?.bank_sheba) && (
                    <div className={styles.bank}>
                      {cfg.bank_name ? <span>بانک: {cfg.bank_name}</span> : null}
                      {cfg.bank_owner ? (
                        <span>به نام: {cfg.bank_owner}</span>
                      ) : null}
                      {cfg.bank_card ? <span>کارت: {cfg.bank_card}</span> : null}
                      {cfg.bank_sheba ? <span>شبا: {cfg.bank_sheba}</span> : null}
                    </div>
                  )}
                  <label className={styles.field}>
                    مبلغ ({currency})
                    <input
                      type="number"
                      dir="ltr"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder={
                        cfg?.min_topup_amount
                          ? `حداقل ${money(cfg.min_topup_amount, currency)}`
                          : ''
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={busy}
                    onClick={topupGateway}
                  >
                    <CreditCard size={15} />
                    پرداخت آنلاین
                  </button>
                  <div className={styles.receiptBox}>
                    <h3>
                      <Receipt size={14} /> فیش واریزی
                    </h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setReceiptFile(e.target.files?.[0] || null)
                      }
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
                      ارسال فیش
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <section className={styles.col}>
          <h2>گردش و درخواست‌ها</h2>
          {!sub ? (
            <p className={styles.empty}>
              بعد از ثبت سفارش، گردش حساب و درخواست‌های شارژ اینجا دیده می‌شود.
            </p>
          ) : (
            <>
              <h3>آخرین گردش</h3>
              <ul className={styles.ledger}>
                {ledger.map((row) => (
                  <li key={row.id}>
                    <span>{row.entry_type_display}</span>
                    <b>{money(row.amount, currency)}</b>
                    {row.description ? <small>{row.description}</small> : null}
                  </li>
                ))}
                {!ledger.length ? (
                  <li className={styles.ledgerEmpty}>موردی نیست</li>
                ) : null}
              </ul>
              <h3>درخواست‌های شارژ</h3>
              <ul className={styles.ledger}>
                {topups.map((t) => (
                  <li key={t.id}>
                    <span>{t.method_display}</span>
                    <b>{money(t.amount, currency)}</b>
                    <small>{t.status_display}</small>
                  </li>
                ))}
                {!topups.length ? (
                  <li className={styles.ledgerEmpty}>موردی نیست</li>
                ) : null}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
