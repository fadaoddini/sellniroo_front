'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Settings2,
  Wallet,
  XCircle,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getReboSystemPageNav } from '@/components/Admin/reboSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { formatRial } from '@/config/reboPricing'
import aw from '../adminweb/AdminWeb.module.css'
import styles from './ReboManage.module.css'

const TABS = [
  { id: 'overview', label: 'نمای کلی', icon: LayoutDashboard },
  { id: 'pending', label: 'فیش‌های در انتظار', icon: CreditCard },
  { id: 'orders', label: 'همه سفارش‌ها', icon: Package },
  { id: 'settings', label: 'تنظیمات پرداخت', icon: Settings2 },
]

const STATUS_FILTERS = [
  { id: '', label: 'همه' },
  { id: 'awaiting_review', label: 'در انتظار تأیید' },
  { id: 'awaiting_payment', label: 'در انتظار پرداخت' },
  { id: 'paid', label: 'پرداخت‌شده' },
  { id: 'rejected', label: 'رد شده' },
  { id: 'cancelled', label: 'لغو' },
]

function badgeClass(status) {
  if (status === 'paid') return styles.badgePaid
  if (status === 'awaiting_review' || status === 'awaiting_payment') {
    return styles.badgeWarn
  }
  if (status === 'rejected' || status === 'cancelled') return styles.badgeDanger
  return styles.badgeMute
}

function money(n, cur = 'تومان') {
  return `${formatRial(n)} ${cur}`
}

function OrderCard({ order, busyId, onApprove, onReject }) {
  const lines = Array.isArray(order.lines_json) ? order.lines_json : []
  const canReview =
    order.payment_method === 'receipt' &&
    (order.status === 'awaiting_review' || order.status === 'awaiting_payment')

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div>
          <strong dir="ltr">{order.code}</strong>
          {order.request_number ? (
            <div className={styles.meta}>
              <span dir="ltr">پیگیری: {order.request_number}</span>
            </div>
          ) : null}
        </div>
        <span className={`${styles.badge} ${badgeClass(order.status)}`}>
          {order.status_display || order.status}
        </span>
      </div>

      <div className={styles.meta}>
        <span>{order.customer_name || '—'}</span>
        <span dir="ltr">{order.customer_mobile || '—'}</span>
        <span>{order.method_display || order.payment_method}</span>
        <span>{money(order.amount, order.currency_label)}</span>
      </div>

      {lines.length ? (
        <ul className={styles.lines}>
          {lines.slice(0, 4).map((line, idx) => (
            <li key={`${line.id || line.title}-${idx}`}>
              {line.title} — {money(line.price, order.currency_label)}
            </li>
          ))}
          {lines.length > 4 ? <li>… و {lines.length - 4} مورد دیگر</li> : null}
        </ul>
      ) : null}

      {order.receipt_image_url ? (
        <a href={order.receipt_image_url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.receipt_image_url}
            alt="رسید واریز"
            className={styles.receiptPreview}
          />
        </a>
      ) : null}

      {order.receipt_note ? (
        <p className={styles.meta}>توضیح رسید: {order.receipt_note}</p>
      ) : null}
      {order.note ? <p className={styles.meta}>توضیح مشتری: {order.note}</p> : null}
      {order.hosting_choice ? (
        <p className={styles.meta}>
          میزبانی:{' '}
          {order.hosting_choice_display ||
            (order.hosting_choice === 'our_cloud'
              ? 'سرور ابری ربو'
              : order.hosting_choice === 'own_server'
                ? 'سرور اختصاصی مشتری'
                : order.hosting_choice)}
          {order.hosting_choice === 'our_cloud' ? (
            <>
              {' · '}
              <a href="/reboserver" target="_blank" rel="noreferrer">
                /reboserver
              </a>
            </>
          ) : null}
          {order.own_server_note ? ` · ${order.own_server_note}` : null}
        </p>
      ) : null}

      {canReview ? (
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.btnOk}
            disabled={busyId === order.id}
            onClick={() => onApprove(order.id)}
          >
            <CheckCircle2 size={14} />
            تأیید پرداخت
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            disabled={busyId === order.id}
            onClick={() => onReject(order.id)}
          >
            <XCircle size={14} />
            رد فیش
          </button>
        </div>
      ) : null}
    </article>
  )
}

function ReboManageInner() {
  const router = useRouter()
  const gate = useOwnerGate('/rebo-manage')
  const { getAuthHeaders } = useAuth()
  const { isAuthenticated, loading, user, allowed: canManage } = gate

  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    try {
      const headers = getAuthHeaders()
      const [st, or, se] = await Promise.all([
        axios.get(Config.endpoints.reboOrders.manageStats(), { headers }),
        axios.get(Config.endpoints.reboOrders.manageOrders(), { headers }),
        axios.get(Config.endpoints.reboOrders.manageSettings(), { headers }),
      ])
      setStats(st.data?.data || null)
      setOrders(or.data?.data || [])
      setSettings(se.data?.data || null)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'بارگذاری ناموفق بود')
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/rebo-manage')}`)
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  useEffect(() => {
    if (!msg) return undefined
    const t = setTimeout(() => setMsg(null), 3500)
    return () => clearTimeout(t)
  }, [msg])

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.payment_method === 'receipt' &&
          (o.status === 'awaiting_review' || o.status === 'awaiting_payment'),
      ),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const orderAction = async (id, action) => {
    setBusyId(id)
    setErr(null)
    setMsg(null)
    try {
      await axios.post(
        Config.endpoints.reboOrders.manageOrderAction(id),
        { action },
        { headers: getAuthHeaders() },
      )
      setMsg(action === 'approve' ? 'پرداخت تأیید شد' : 'فیش رد شد')
      await load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'عملیات ناموفق بود')
    } finally {
      setBusyId(null)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.patch(
        Config.endpoints.reboOrders.manageSettings(),
        settings,
        { headers: getAuthHeaders() },
      )
      setSettings(res.data?.data || settings)
      setMsg('تنظیمات پرداخت ربو ذخیره شد')
    } catch (e) {
      setErr(e?.response?.data?.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  const setField = (key, value) => {
    setSettings((s) => ({ ...(s || {}), [key]: value }))
  }

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="مدیریت سفارش و پرداخت ربو"
      title="مدیریت ربو"
      wide
      pageNav={getReboSystemPageNav('/rebo-manage')}
      {...gate}
    >
      <div className={styles.embed} dir="rtl" lang="fa">
        <div className={styles.toolbar}>
          <p className={styles.toolbarLead}>
            سفارش بسته‌ها، تأیید فیش‌ها و تنظیمات پرداخت اختصاصی ربو
          </p>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={load}
            disabled={loadingData}
          >
            <RefreshCw size={14} className={loadingData ? styles.spin : undefined} />
            بروزرسانی
          </button>
        </div>

        <div className={aw.awTabs} role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon
            const on = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`${aw.awTab} ${on ? aw.awTabOn : ''}`}
                onClick={() => setTab(t.id)}
              >
                <Icon size={14} />
                {t.label}
                {t.id === 'pending' && pendingOrders.length ? (
                  <span>({pendingOrders.length.toLocaleString('fa-IR')})</span>
                ) : null}
              </button>
            )
          })}
        </div>

        {(msg || err) && (
          <div className={styles.alerts}>
            {msg ? <p className={styles.ok}>{msg}</p> : null}
            {err ? <p className={styles.err}>{err}</p> : null}
          </div>
        )}

        {loadingData && !orders.length && !settings ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spin} size={24} />
          </div>
        ) : null}

        {tab === 'overview' ? (
          <>
            <div className={styles.stats}>
              <article className={styles.stat}>
                <span>کل سفارش‌ها</span>
                <strong>
                  {(stats?.total || 0).toLocaleString('fa-IR')}
                </strong>
              </article>
              <article className={styles.stat}>
                <span>پرداخت‌شده</span>
                <strong>
                  {(stats?.paid || 0).toLocaleString('fa-IR')}
                </strong>
              </article>
              <article className={styles.stat}>
                <span>در انتظار تأیید فیش</span>
                <strong>
                  {(stats?.awaiting_review || 0).toLocaleString('fa-IR')}
                </strong>
              </article>
              <article className={styles.stat}>
                <span>جمع پرداخت‌شده</span>
                <strong>
                  {money(stats?.paid_amount || 0, settings?.currency_label)}
                </strong>
              </article>
            </div>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>فیش‌های نیازمند اقدام</h2>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => setTab('pending')}
                >
                  مشاهده همه
                </button>
              </div>
              {pendingOrders.length ? (
                <div className={styles.grid}>
                  {pendingOrders.slice(0, 4).map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      busyId={busyId}
                      onApprove={(id) => orderAction(id, 'approve')}
                      onReject={(id) => orderAction(id, 'reject')}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>فیش در انتظاری نیست.</p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>دسترسی سریع</h2>
              </div>
              <div className={styles.cardActions}>
                <Link href="/rebo-pricing" className={styles.btn}>
                  <Wallet size={14} />
                  مدیریت قیمت بسته‌ها
                </Link>
                <Link href="/payment-manage" className={styles.btn}>
                  <CreditCard size={14} />
                  درگاه سراسری
                </Link>
                <Link href="/cloud-manage" className={styles.btn}>
                  سرور ابری
                </Link>
                <Link href="/profile?tab=overview" className={styles.btn}>
                  پروفایل ربو
                </Link>
              </div>
            </section>
          </>
        ) : null}

        {tab === 'pending' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>تأیید واریز کارت / فیش</h2>
            </div>
            {pendingOrders.length ? (
              <div className={styles.grid}>
                {pendingOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    busyId={busyId}
                    onApprove={(id) => orderAction(id, 'approve')}
                    onReject={(id) => orderAction(id, 'reject')}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>موردی برای تأیید نیست.</p>
            )}
          </section>
        ) : null}

        {tab === 'orders' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>همه سفارش‌های ربو</h2>
              <div className={styles.filters}>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id || 'all'}
                    type="button"
                    className={`${styles.filterBtn} ${
                      statusFilter === f.id ? styles.filterOn : ''
                    }`}
                    onClick={() => setStatusFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredOrders.length ? (
              <div className={styles.grid}>
                {filteredOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    busyId={busyId}
                    onApprove={(id) => orderAction(id, 'approve')}
                    onReject={(id) => orderAction(id, 'reject')}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>سفارشی یافت نشد.</p>
            )}
          </section>
        ) : null}

        {tab === 'settings' && settings ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>تنظیمات پرداخت اختصاصی ربو</h2>
              <button
                type="button"
                className={styles.btn}
                disabled={saving}
                onClick={saveSettings}
              >
                <Save size={14} />
                {saving ? 'در حال ذخیره…' : 'ذخیره'}
              </button>
            </div>

            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={!!settings.allow_gateway}
                  onChange={(e) => setField('allow_gateway', e.target.checked)}
                />
                پرداخت از درگاه
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={!!settings.allow_wallet}
                  onChange={(e) => setField('allow_wallet', e.target.checked)}
                />
                پرداخت از کیف پول
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={!!settings.allow_receipt}
                  onChange={(e) => setField('allow_receipt', e.target.checked)}
                />
                واریز کارت / فیش دستی
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={!!settings.is_accepting_orders}
                  onChange={(e) =>
                    setField('is_accepting_orders', e.target.checked)
                  }
                />
                پذیرش سفارش پولی
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                واحد پول
                <input
                  value={settings.currency_label || ''}
                  onChange={(e) => setField('currency_label', e.target.value)}
                />
              </label>
              <label>
                نام بانک
                <input
                  value={settings.bank_name || ''}
                  onChange={(e) => setField('bank_name', e.target.value)}
                />
              </label>
              <label>
                صاحب حساب
                <input
                  value={settings.bank_owner || ''}
                  onChange={(e) => setField('bank_owner', e.target.value)}
                />
              </label>
              <label>
                شماره کارت
                <input
                  dir="ltr"
                  value={settings.bank_card || ''}
                  onChange={(e) => setField('bank_card', e.target.value)}
                />
              </label>
              <label className={styles.full}>
                شبا
                <input
                  dir="ltr"
                  value={settings.bank_sheba || ''}
                  onChange={(e) => setField('bank_sheba', e.target.value)}
                />
              </label>
              <label className={styles.full}>
                راهنمای واریز برای مشتری
                <textarea
                  rows={4}
                  value={settings.payment_instructions || ''}
                  onChange={(e) =>
                    setField('payment_instructions', e.target.value)
                  }
                />
              </label>
            </div>
          </section>
        ) : null}
      </div>
    </OwnerPortalShell>
  )
}

export default function ReboManagePage() {
  return (
    <Suspense fallback={null}>
      <ReboManageInner />
    </Suspense>
  )
}
