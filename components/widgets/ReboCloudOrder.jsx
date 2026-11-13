'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowLeft,
  Cloud,
  Loader2,
  LogIn,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import {
  cloudMonthlyEstimate,
  formatMoney,
  normalizeCloudServer,
} from '@/config/reboPricing'
import styles from '@/components/widgets/rebo/ReboCloudOrder.module.css'

export default function ReboCloudOrder({ pricing, heading = {}, style }) {
  const cloud = normalizeCloudServer(pricing?.cloud_server)
  const { isAuthenticated, loading: authLoading, getAuthHeaders, user } =
    useAuth()
  const [apiCfg, setApiCfg] = useState(null)
  const [sub, setSub] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [form, setForm] = useState({
    display_name: '',
    contact_name: '',
    contact_mobile: '',
    accepted_policy: false,
  })

  const currency = cloud.currency_label || 'تومان'
  const monthly = cloudMonthlyEstimate(cloud.daily_price)
  const wipeText =
    apiCfg?.wipe_policy_text ||
    'در صورت اتمام اعتبار و گذشت مهلت بدون شارژ، اطلاعات سرور حذف می‌شود و مسئولیت با مشتری است.'

  const load = useCallback(async () => {
    try {
      const cfgRes = await axios.get(Config.endpoints.cloudServer.config())
      setApiCfg(cfgRes.data?.data || null)
      if (!isAuthenticated) {
        setSub(null)
        return
      }
      const my = await axios.get(Config.endpoints.cloudServer.my(), {
        headers: getAuthHeaders(),
      })
      setSub(my.data?.data || null)
    } catch {
      /* ignore preview errors */
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    if (!cloud.enabled) return undefined
    load()
  }, [cloud.enabled, load])

  useEffect(() => {
    if (user?.mobile) {
      setForm((f) =>
        f.contact_mobile ? f : { ...f, contact_mobile: user.mobile },
      )
    }
  }, [user?.mobile])

  const submit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setErr('برای ثبت سفارش وارد شوید')
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
      setMsg('سفارش ثبت شد — برای فعال‌سازی شارژ کنید')
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'ثبت سفارش ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  if (!cloud.enabled) return null

  const showKicker = heading.kicker !== ''
  const showSubtitle = heading.subtitle !== ''

  return (
    <section
      className={styles.section}
      id="rebo-cloud-order"
      style={style}
      dir="rtl"
      lang="fa"
    >
      <div className={styles.glow} aria-hidden />
      <div className={styles.mesh} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.head}>
          {showKicker ? (
            <p className={styles.eyebrow}>
              <Cloud size={13} strokeWidth={2} />
              {heading.kicker || 'سرور ابری ربو'}
            </p>
          ) : null}
          <h2 className={styles.title}>
            {heading.title || 'ثبت سفارش سرور ابری اشتراکی'}
          </h2>
          {showSubtitle ? (
            <p className={styles.subtitle}>
              {heading.subtitle || (
                <>
                  بدون سرور اختصاصی — هزینه روزانه{' '}
                  <strong>{formatMoney(cloud.daily_price, currency)}</strong>
                  {monthly > 0 ? (
                    <>
                      {' '}
                      (برآورد ماهانه حدود {formatMoney(monthly, currency)})
                    </>
                  ) : null}
                  . شارژ از طریق درگاه یا فیش واریزی؛ پس از اتمام اعتبار هشدار
                  پیامکی و مهلت محدود تا حذف داده.
                </>
              )}
            </p>
          ) : null}
        </header>

        <div className={styles.grid}>
          <div className={styles.info}>
            {cloud.specs?.length ? (
              <ul className={styles.specs}>
                {cloud.specs.map((sp) => (
                  <li key={sp.id || sp.label}>
                    <strong>{sp.label}</strong>
                    <span>{sp.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={styles.policy}>
              <ShieldAlert size={16} />
              <p>{wipeText}</p>
            </div>
            {(apiCfg?.warning_days || apiCfg?.grace_days) && (
              <p className={styles.meta}>
                هشدار پیامک از{' '}
                {(apiCfg.warning_days || 5).toLocaleString('fa-IR')} روز مانده ·
                مهلت بدون شارژ{' '}
                {(apiCfg.grace_days || 5).toLocaleString('fa-IR')} روز تا حذف
                داده
              </p>
            )}
          </div>

          <div className={styles.panel}>
            {msg ? <p className={styles.ok}>{msg}</p> : null}
            {err ? <p className={styles.err}>{err}</p> : null}

            {sub ? (
              <div className={styles.done}>
                {sub.in_warning || sub.status === 'grace' ? (
                  <p className={styles.warn}>
                    <AlertTriangle size={14} /> وضعیت اعتبار نیازمند توجه است
                  </p>
                ) : null}
                <p>
                  اشتراک <strong>{sub.code}</strong> ·{' '}
                  {sub.status_display || sub.status}
                </p>
                <p>
                  موجودی:{' '}
                  <strong>
                    {formatMoney(sub.balance, sub.currency_label || currency)}
                  </strong>
                  {' · '}
                  حدود {(sub.days_remaining || 0).toLocaleString('fa-IR')} روز
                </p>
                <Link href="/cloud-server" className={styles.cta}>
                  مدیریت و شارژ سرور
                  <ArrowLeft size={16} />
                </Link>
              </div>
            ) : !authLoading && !isAuthenticated ? (
              <div className={styles.done}>
                <p>برای ثبت سفارش سرور ابری وارد حساب کاربری شوید.</p>
                <Link
                  href={`/login?next=${encodeURIComponent('/#rebo-cloud-order')}`}
                  className={styles.cta}
                >
                  <LogIn size={16} />
                  ورود و ثبت سفارش
                </Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                <label>
                  نام پروژه / سامانه
                  <input
                    required
                    value={form.display_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, display_name: e.target.value }))
                    }
                    placeholder="مثلاً سایت فروشگاهی من"
                  />
                </label>
                <label>
                  نام مسئول
                  <input
                    required
                    value={form.contact_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contact_name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  موبایل (پیامک هشدار)
                  <input
                    required
                    dir="ltr"
                    value={form.contact_mobile}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contact_mobile: e.target.value,
                      }))
                    }
                    placeholder="09xxxxxxxxx"
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
                  شرایط حذف داده پس از اتمام اعتبار و مهلت را می‌پذیرم؛ مسئولیت با
                  من است.
                </label>
                <button
                  type="submit"
                  className={styles.cta}
                  disabled={
                    busy ||
                    !form.accepted_policy ||
                    apiCfg?.is_accepting_orders === false
                  }
                >
                  {busy ? <Loader2 size={16} className={styles.spin} /> : null}
                  ثبت سفارش سرور ابری
                  <ArrowLeft size={16} />
                </button>
                {apiCfg?.is_accepting_orders === false ? (
                  <p className={styles.err}>
                    فعلاً سفارش جدید پذیرفته نمی‌شود.
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
