// app/(admin)/payment-manage — تنظیمات ماژول پرداخت سراسری
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  CreditCard,
  LayoutDashboard,
  RefreshCw,
  Save,
  Shield,
  ExternalLink,
  Settings2,
  Wallet,
  Target,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Power,
  KeyRound,
  Star,
  Inbox,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { isPlatformOwner } from '@/utils/ownerAccess'
import styles from './PaymentManage.module.css'

const TABS = [
  { id: 'settings', label: 'تنظیمات کلی', icon: Settings2 },
  { id: 'gateways', label: 'درگاه‌ها', icon: Wallet },
  { id: 'purposes', label: 'اهداف پرداخت', icon: Target },
  { id: 'payments', label: 'پرداخت‌های اخیر', icon: Receipt },
]

const STATUS_FA = {
  paid: 'پرداخت‌شده',
  unpaid: 'پرداخت‌نشده',
  failed: 'ناموفق',
  canceled: 'لغو',
}

function statusBadgeClass(status) {
  if (status === 'paid') return styles.badgeOk
  if (status === 'unpaid') return styles.badgeWarn
  if (status === 'failed' || status === 'canceled') return styles.badgeDanger
  return styles.badgeOff
}

function ToggleSwitch({ checked, onChange, title, desc }) {
  return (
    <label
      className={`${styles.toggleCard} ${checked ? styles.toggleCardOn : ''}`}
    >
      <span className={styles.toggleText}>
        <span className={styles.toggleTitle}>{title}</span>
        {desc ? <span className={styles.toggleDesc}>{desc}</span> : null}
      </span>
      <span className={styles.switch}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
      </span>
    </label>
  )
}

export default function PaymentManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const canManage =
    user?.is_superuser ||
    user?.is_staff ||
    canManageEmployees ||
    isPlatformOwner(user)

  const [tab, setTab] = useState('settings')
  const [bundle, setBundle] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    try {
      const res = await axios.get(Config.endpoints.payment.bundle(), {
        headers: getAuthHeaders(),
      })
      setBundle(res.data)
      setSettings({ ...(res.data?.settings || {}) })
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || 'بارگذاری ناموفق بود')
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/payment-manage')}`)
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

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    try {
      const body = {
        is_enabled: !!settings.is_enabled,
        sandbox_mode: !!settings.sandbox_mode,
        allow_wallet: !!settings.allow_wallet,
        callback_base_url: settings.callback_base_url || '',
        currency_label: settings.currency_label || 'تومان',
        min_amount: Number(settings.min_amount) || 1000,
        max_amount: Number(settings.max_amount) || 500000000,
        notes: settings.notes || '',
        default_gateway: settings.default_gateway || null,
      }
      const res = await axios.patch(Config.endpoints.payment.settings(), body, {
        headers: getAuthHeaders(),
      })
      setSettings(res.data)
      setMsg('تنظیمات ذخیره شد')
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  const patchGateway = async (id, patch) => {
    setErr(null)
    try {
      await axios.patch(Config.endpoints.payment.gatewayDetail(id), patch, {
        headers: getAuthHeaders(),
      })
      setMsg('درگاه به‌روز شد')
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'خطا در درگاه')
    }
  }

  const patchPurpose = async (id, patch) => {
    setErr(null)
    try {
      await axios.patch(Config.endpoints.payment.purposeDetail(id), patch, {
        headers: getAuthHeaders(),
      })
      setMsg('هدف پرداخت به‌روز شد')
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'خطا در هدف پرداخت')
    }
  }

  const markPaid = async (id) => {
    try {
      await axios.post(
        Config.endpoints.payment.paymentDetail(id),
        { action: 'mark_paid', ref_id: 'manual-admin' },
        { headers: getAuthHeaders() }
      )
      setMsg(`پرداخت #${id} تأیید شد`)
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  const gateways = bundle?.gateways || []
  const purposes = bundle?.purposes || []
  const payments = bundle?.recent_payments || []

  const stats = useMemo(() => {
    const activeGw = gateways.filter((g) => g.is_enable).length
    const activePurpose = purposes.filter((p) => p.is_active).length
    const paid = payments.filter((p) => p.status === 'paid').length
    const unpaid = payments.filter((p) => p.status === 'unpaid').length
    return { activeGw, activePurpose, paid, unpaid, totalPayments: payments.length }
  }, [gateways, purposes, payments])

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <RefreshCw size={26} className={styles.spin} />
          <p>در حال بررسی دسترسی…</p>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <Shield size={32} />
          <h1>دسترسی محدود</h1>
          <p>فقط مدیر می‌تواند تنظیمات پرداخت را مدیریت کند.</p>
          <Link href="/dashboard" className={styles.solidBtn}>
            داشبورد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>
              <CreditCard size={24} />
            </span>
            <div>
              <h1 className={styles.pageTitle}>ماژول پرداخت</h1>
              <p className={styles.pageDesc}>
                درگاه سراسری برای فروشگاه، اخبار، کاریابی، کیف پول و امکانات بعدی
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {isPlatformOwner(user) ? (
              <Link href="/adminweb" className={styles.ghostBtn}>
                <ExternalLink size={14} />
                adminweb
              </Link>
            ) : null}
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={14} />
              داشبورد
            </Link>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={load}
              disabled={loadingData}
            >
              <RefreshCw size={14} className={loadingData ? styles.spin : undefined} />
              بروزرسانی
            </button>
          </div>
        </header>

        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.statTeal}`}>
            <span className={styles.statLabel}>وضعیت ماژول</span>
            <span className={styles.statValue}>
              {settings?.is_enabled ? 'فعال' : 'خاموش'}
            </span>
            <span className={styles.statMeta}>
              {settings?.sandbox_mode ? 'حالت آزمایشی' : 'حالت واقعی'}
            </span>
          </div>
          <div className={`${styles.statCard} ${styles.statOk}`}>
            <span className={styles.statLabel}>درگاه فعال</span>
            <span className={styles.statValue}>{stats.activeGw}</span>
            <span className={styles.statMeta}>از {gateways.length} درگاه</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>اهداف فعال</span>
            <span className={styles.statValue}>{stats.activePurpose}</span>
            <span className={styles.statMeta}>از {purposes.length} هدف</span>
          </div>
          <div className={`${styles.statCard} ${styles.statWarn}`}>
            <span className={styles.statLabel}>پرداخت‌های اخیر</span>
            <span className={styles.statValue}>{stats.totalPayments}</span>
            <span className={styles.statMeta}>
              {stats.paid} موفق · {stats.unpaid} در انتظار
            </span>
          </div>
        </div>

        {msg ? (
          <div className={styles.msg}>
            <CheckCircle2 size={16} />
            {msg}
          </div>
        ) : null}
        {err ? (
          <div className={styles.err}>
            <AlertCircle size={16} />
            {err}
          </div>
        ) : null}

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon
            const count =
              t.id === 'gateways'
                ? gateways.length
                : t.id === 'purposes'
                  ? purposes.length
                  : t.id === 'payments'
                    ? payments.length
                    : null
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
                onClick={() => setTab(t.id)}
              >
                <Icon size={15} />
                {t.label}
                {count != null ? (
                  <span className={styles.tabCount}>{count}</span>
                ) : null}
              </button>
            )
          })}
        </div>

        {loadingData || !settings ? (
          <div className={styles.card}>
            <div className={styles.loadingCard}>
              <RefreshCw size={20} className={styles.spin} />
              در حال بارگذاری…
            </div>
          </div>
        ) : null}

        {!loadingData && settings && tab === 'settings' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>تنظیمات کلی</h2>
                <p className={styles.hint}>
                  این تنظیمات روی همهٔ پرداخت‌ها (فروشگاه، استوری، اخبار، کاریابی و …)
                  اعمال می‌شود.
                </p>
              </div>
            </div>

            <div className={styles.toggleGrid}>
              <ToggleSwitch
                checked={!!settings.is_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, is_enabled: v }))}
                title="ماژول پرداخت فعال"
                desc="بدون این گزینه هیچ intentی ساخته نمی‌شود"
              />
              <ToggleSwitch
                checked={!!settings.sandbox_mode}
                onChange={(v) => setSettings((s) => ({ ...s, sandbox_mode: v }))}
                title="حالت آزمایشی"
                desc="درگاه در sandbox / تست کار می‌کند"
              />
              <ToggleSwitch
                checked={!!settings.allow_wallet}
                onChange={(v) => setSettings((s) => ({ ...s, allow_wallet: v }))}
                title="شارژ کیف پول"
                desc="اجازهٔ هدف wallet_charge"
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="pm-default-gw">درگاه پیش‌فرض</label>
                <select
                  id="pm-default-gw"
                  value={settings.default_gateway || ''}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      default_gateway: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                >
                  <option value="">— انتخاب کنید —</option>
                  {gateways.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.gateway_code})
                      {g.is_enable ? '' : ' · خاموش'}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-currency">واحد پول</label>
                <input
                  id="pm-currency"
                  value={settings.currency_label || ''}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, currency_label: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-min">حداقل مبلغ</label>
                <input
                  id="pm-min"
                  type="number"
                  value={settings.min_amount ?? 1000}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      min_amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pm-max">حداکثر مبلغ</label>
                <input
                  id="pm-max"
                  type="number"
                  value={settings.max_amount ?? 500000000}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      max_amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="pm-callback">آدرس پایه کال‌بک (BACKEND URL)</label>
              <input
                id="pm-callback"
                dir="ltr"
                placeholder="https://example.com"
                value={settings.callback_base_url || ''}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    callback_base_url: e.target.value,
                  }))
                }
              />
              <span className={styles.fieldHint}>
                مسیرهایی مثل{' '}
                <code className={styles.code}>/api/payment/v1/callback/shop/</code>{' '}
                به این آدرس اضافه می‌شوند.
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="pm-notes">یادداشت داخلی</label>
              <textarea
                id="pm-notes"
                placeholder="نکات تیم، Merchant ID تست، و …"
                value={settings.notes || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, notes: e.target.value }))
                }
              />
            </div>

            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.solidBtn}
                onClick={saveSettings}
                disabled={saving}
              >
                <Save size={15} />
                {saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
              </button>
            </div>
          </section>
        ) : null}

        {!loadingData && tab === 'gateways' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>درگاه‌ها</h2>
                <p className={styles.hint}>
                  برای زرین‌پال در فیلد credentials مقدار JSON مثل{' '}
                  <code className={styles.code}>{`{"merchant_id":"..."}`}</code>{' '}
                  بگذارید.
                </p>
              </div>
            </div>

            {gateways.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Inbox size={22} />
                </span>
                <strong>درگاهی ثبت نشده</strong>
                <p>با بروزرسانی صفحه، درگاه‌های پیش‌فرض ساخته می‌شوند.</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {gateways.map((g) => (
                  <article key={g.id} className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div className={styles.itemIdentity}>
                        <span className={styles.itemIcon}>
                          <Wallet size={18} />
                        </span>
                        <div>
                          <h3 className={styles.itemTitle}>{g.title}</h3>
                          <p className={styles.itemSub}>{g.gateway_code}</p>
                        </div>
                      </div>
                      <div className={styles.itemBadges}>
                        <span
                          className={`${styles.badge} ${
                            g.is_enable ? styles.badgeOk : styles.badgeOff
                          }`}
                        >
                          {g.is_enable ? 'فعال' : 'خاموش'}
                        </span>
                        {g.is_default ? (
                          <span className={`${styles.badge} ${styles.badgeInfo}`}>
                            <Star size={11} />
                            پیش‌فرض
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.itemBody}>
                      <div className={styles.field}>
                        <label
                          htmlFor={`gw-auth-${g.id}`}
                          className={styles.fieldLabelIcon}
                        >
                          <KeyRound size={12} />
                          credentials (JSON)
                        </label>
                        <textarea
                          id={`gw-auth-${g.id}`}
                          className={styles.authInput}
                          defaultValue={g.auth_data || '{}'}
                          rows={3}
                          spellCheck={false}
                        />
                      </div>
                      <div className={styles.itemMeta}>
                        <div className={styles.metaRow}>
                          <span className={styles.metaKey}>شناسه</span>
                          <span className={styles.metaVal}>#{g.id}</span>
                        </div>
                        <div className={styles.metaRow}>
                          <span className={styles.metaKey}>ترتیب</span>
                          <span className={styles.metaVal}>{g.sort_order ?? '—'}</span>
                        </div>
                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={`${styles.miniBtn} ${
                              g.is_enable ? styles.miniBtnDanger : styles.miniBtnPrimary
                            }`}
                            onClick={() =>
                              patchGateway(g.id, { is_enable: !g.is_enable })
                            }
                          >
                            <Power size={13} />
                            {g.is_enable ? 'خاموش' : 'روشن'}
                          </button>
                          {!g.is_default ? (
                            <button
                              type="button"
                              className={styles.miniBtn}
                              onClick={() =>
                                patchGateway(g.id, { is_default: true })
                              }
                            >
                              <Star size={13} />
                              پیش‌فرض
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className={`${styles.miniBtn} ${styles.miniBtnPrimary}`}
                            onClick={() => {
                              const el = document.getElementById(`gw-auth-${g.id}`)
                              patchGateway(g.id, {
                                auth_data: el?.value || '{}',
                              })
                            }}
                          >
                            <Save size={13} />
                            ذخیره کلید
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {!loadingData && tab === 'purposes' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>اهداف پرداخت</h2>
                <p className={styles.hint}>
                  هر بخش سایت با یک{' '}
                  <code className={styles.code}>purpose_key</code> پرداخت می‌سازد —
                  فروشگاه، اخبار، کاریابی و … را جداگانه روشن/خاموش کنید.
                </p>
              </div>
            </div>

            {purposes.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Target size={22} />
                </span>
                <strong>هدف پرداختی نیست</strong>
                <p>اهداف پیش‌فرض با bootstrap ساخته می‌شوند.</p>
              </div>
            ) : (
              <div className={styles.purposeGrid}>
                {purposes.map((p) => (
                  <article key={p.id} className={styles.purposeCard}>
                    <div className={styles.purposeTop}>
                      <div>
                        <h3 className={styles.itemTitle}>{p.title}</h3>
                        <span className={styles.purposeKey}>{p.key}</span>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          p.is_active ? styles.badgeOk : styles.badgeOff
                        }`}
                      >
                        {p.is_active ? 'فعال' : 'خاموش'}
                      </span>
                    </div>
                    <p className={styles.purposeDesc}>
                      {p.description ||
                        (p.source_app
                          ? `اپ مبدأ: ${p.source_app}`
                          : 'بدون توضیح')}
                    </p>
                    <div className={styles.purposeFoot}>
                      <span className={styles.mono}>
                        {p.source_app || '—'}
                        {p.callback_path ? ` · ${p.callback_path}` : ''}
                      </span>
                      <button
                        type="button"
                        className={`${styles.miniBtn} ${
                          p.is_active
                            ? styles.miniBtnDanger
                            : styles.miniBtnPrimary
                        }`}
                        onClick={() =>
                          patchPurpose(p.id, { is_active: !p.is_active })
                        }
                      >
                        <Power size={13} />
                        {p.is_active ? 'خاموش' : 'روشن'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {!loadingData && tab === 'payments' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>۳۰ پرداخت اخیر</h2>
                <p className={styles.hint}>
                  پرداخت‌های موفق، ناموفق و در انتظار — تأیید دستی فقط برای unpaid.
                </p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Receipt size={22} />
                </span>
                <strong>هنوز پرداختی ثبت نشده</strong>
                <p>با اولین intent از فروشگاه، استوری یا بخش‌های دیگر اینجا دیده می‌شود.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>مبلغ</th>
                      <th>هدف</th>
                      <th>کاربر</th>
                      <th>وضعیت</th>
                      <th>تاریخ</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className={styles.mono}>{p.id}</td>
                        <td className={styles.amount}>
                          {Number(p.amount).toLocaleString('fa-IR')}
                          <span className={styles.amountUnit}>
                            {settings?.currency_label || 'تومان'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.mono}>
                            {p.purpose_key || p.payment_type}
                          </span>
                        </td>
                        <td>
                          <span className={styles.mono}>
                            {p.user_mobile || '—'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${statusBadgeClass(
                              p.status
                            )}`}
                          >
                            {STATUS_FA[p.status] || p.status}
                          </span>
                        </td>
                        <td>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleString('fa-IR')
                            : '—'}
                        </td>
                        <td>
                          {p.status === 'unpaid' ? (
                            <button
                              type="button"
                              className={`${styles.miniBtn} ${styles.miniBtnPrimary}`}
                              onClick={() => markPaid(p.id)}
                            >
                              <CheckCircle2 size={13} />
                              تأیید دستی
                            </button>
                          ) : (
                            <span className={styles.fieldHint}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}
