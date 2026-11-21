'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  AlertTriangle,
  Cloud,
  CreditCard,
  Loader2,
  LogIn,
  RefreshCw,
  Server,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import ReceiptDropzone from '@/components/Repairs/ReceiptDropzone'
import styles from '../styles/ReboServer.module.css'

function money(n, cur = 'تومان') {
  return `${Number(n || 0).toLocaleString('fa-IR')} ${cur}`
}

export default function ReboServerPanel() {
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
    domain: '',
    domain_confirmed: false,
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
        setLedger([])
        setTopups([])
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
    if (!String(form.domain || '').trim()) {
      setErr('نام دامنه را وارد کنید')
      return
    }
    if (!form.domain_confirmed) {
      setErr('تأیید مالکیت و صحت دامنه الزامی است')
      return
    }
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await axios.post(
        Config.endpoints.cloudServer.my(),
        {
          ...form,
          domain_confirmed: true,
        },
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

  const saveDomain = async () => {
    if (!String(form.domain || '').trim()) {
      setErr('نام دامنه را وارد کنید')
      return
    }
    if (!form.domain_confirmed) {
      setErr('تأیید مالکیت و صحت دامنه الزامی است')
      return
    }
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await axios.patch(
        Config.endpoints.cloudServer.my(),
        {
          domain: form.domain,
          domain_confirmed: true,
        },
        { headers: getAuthHeaders() },
      )
      setSub(res.data?.data || null)
      setMsg('دامنه ثبت شد')
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'ثبت دامنه ناموفق')
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
      setReceiptNote('')
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'ارسال رسید ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const currency = cfg?.currency_label || sub?.currency_label || 'تومان'
  const warnDays = cfg?.warning_days || sub?.warning_days || 5
  const daysLeft = sub?.days_remaining ?? null
  const inWarning =
    !!sub &&
    (sub.in_warning ||
      (typeof daysLeft === 'number' && daysLeft <= Number(warnDays)))

  return (
    <div className={styles.page} dir="rtl" lang="fa">
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden>
            <Cloud size={15} strokeWidth={1.9} />
          </span>
          <div>
            <h1>پنل سرور ربو</h1>
            <p>موجودی، روز تقریبی، شارژ و وضعیت سرور</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btn}
            onClick={load}
            disabled={busy}
            aria-label="بروزرسانی"
          >
            <RefreshCw size={12} className={busy ? styles.spin : undefined} />
            بروزرسانی
          </button>
        </div>
      </header>

      {sub ? (
        <div
          className={`${styles.daysBar} ${
            inWarning ? styles.daysBarWarn : styles.daysBarOk
          }`}
          role="status"
        >
          <div className={styles.daysMain}>
            <strong>
              {(daysLeft ?? 0).toLocaleString('fa-IR')} روز تقریبی باقی‌مانده
            </strong>
            <span>
              موجودی {money(sub.balance, currency)} · روزانه{' '}
              {money(sub.daily_price || cfg?.daily_price, currency)}
            </span>
          </div>
          {inWarning ? (
            <p>
              <AlertTriangle size={12} />
              کمتر از {String(warnDays).toLocaleString('fa-IR')} روز — هرچه
              سریع‌تر شارژ کنید.
            </p>
          ) : (
            <p>وضعیت پایدار است؛ با شارژ می‌توانید روز بیشتری رزرو کنید.</p>
          )}
        </div>
      ) : null}

      {msg || err ? (
        <div className={styles.alerts}>
          {msg ? <p className={styles.ok}>{msg}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>پلن سرور</h2>
          {cfg ? (
            <>
              <div className={styles.stats}>
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
                  <span>آستانه هشدار</span>
                </div>
              </div>
              {(cfg.specs || []).length ? (
                <ul className={styles.specs}>
                  {cfg.specs.map((s, i) => (
                    <li key={i}>
                      <Server size={11} strokeWidth={2} />
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
                  <ShieldAlert size={13} />
                  <p>{cfg.wipe_policy_text}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.empty}>در حال بارگذاری پلن…</p>
          )}
        </section>

        <section className={styles.card}>
          {!isAuthenticated && !loading ? (
            <>
              <h2>ورود</h2>
              <p className={styles.hint}>
                برای مدیریت سرور و شارژ اعتبار وارد حساب شوید.
              </p>
              <Link
                href="/login?next=/reboserver"
                className={styles.btnPrimary}
              >
                <LogIn size={13} />
                ورود به حساب
              </Link>
            </>
          ) : null}

          {isAuthenticated && !sub ? (
            <>
              <h2>ثبت سفارش سرور</h2>
              <div className={styles.form}>
                <label>
                  دامنه نصب (برای دکمه نصب روی سرور)
                  <input
                    dir="ltr"
                    placeholder="example.ir"
                    value={form.domain}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, domain: e.target.value }))
                    }
                  />
                </label>
                <p className={styles.hint}>
                  فقط نام دامنه را بنویسید (بدون http). املا و پسوند (.ir / .com
                  و …) را دقیق چک کنید تا نصب روی همان دامنه انجام شود.
                </p>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={form.domain_confirmed}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        domain_confirmed: e.target.checked,
                      }))
                    }
                  />
                  تأیید می‌کنم این دامنه متعلق به من است و نوشتار و پسوند آن
                  درست است.
                </label>
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
                className={styles.btnPrimary}
                disabled={
                  busy ||
                  !cfg?.is_accepting_orders ||
                  !form.accepted_policy ||
                  !form.domain_confirmed ||
                  !String(form.domain || '').trim()
                }
                onClick={order}
                style={{ marginTop: 8 }}
              >
                {busy ? <Loader2 size={12} className={styles.spin} /> : null}
                ثبت سفارش
              </button>
            </>
          ) : null}

          {sub ? (
            <>
              <div className={styles.subHead}>
                <h2>اشتراک {sub.code}</h2>
                {inWarning ? (
                  <span className={styles.warnBadge}>
                    <AlertTriangle size={10} /> هشدار
                  </span>
                ) : null}
              </div>
              {sub.domain ? (
                <p className={styles.hint} style={{ marginBottom: 8 }}>
                  دامنه نصب:{' '}
                  <b dir="ltr">{sub.domain}</b>
                  {sub.domain_confirmed ? ' · تأییدشده' : ''}
                </p>
              ) : (
                <div className={styles.form} style={{ marginBottom: 10 }}>
                  <h3>ثبت دامنه نصب</h3>
                  <p className={styles.hint}>
                    دامنه را وارد کنید تا مدیر بداند نصب روی سرور برای کدام دامنه
                    انجام شود.
                  </p>
                  <label>
                    دامنه
                    <input
                      dir="ltr"
                      placeholder="example.ir"
                      value={form.domain}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, domain: e.target.value }))
                      }
                    />
                  </label>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={form.domain_confirmed}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          domain_confirmed: e.target.checked,
                        }))
                      }
                    />
                    تأیید می‌کنم این دامنه متعلق به من است و نوشتار و پسوند آن
                    درست است.
                  </label>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    disabled={
                      busy ||
                      !form.domain_confirmed ||
                      !String(form.domain || '').trim()
                    }
                    onClick={saveDomain}
                  >
                    {busy ? <Loader2 size={12} className={styles.spin} /> : null}
                    ثبت دامنه
                  </button>
                </div>
              )}
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
                  <div className={styles.actionsRow}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={busy}
                      onClick={topupGateway}
                    >
                      <CreditCard size={12} />
                      پرداخت آنلاین
                    </button>
                  </div>
                  <ReceiptDropzone
                    file={receiptFile}
                    onChange={setReceiptFile}
                    disabled={busy}
                    label="فیش واریزی"
                    hint="بکشید و رها کنید، یا کلیک کنید"
                  />
                  <label className={styles.field}>
                    توضیح رسید (اختیاری)
                    <input
                      type="text"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      placeholder="مثلاً آخرین ۴ رقم کارت"
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busy || !receiptFile}
                    onClick={topupReceipt}
                  >
                    {busy ? <Loader2 size={12} className={styles.spin} /> : null}
                    ارسال فیش
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <section className={styles.card}>
          <h2>گردش و شارژها</h2>
          {!sub ? (
            <p className={styles.empty}>
              بعد از ثبت سفارش، گردش حساب اینجا دیده می‌شود.
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
