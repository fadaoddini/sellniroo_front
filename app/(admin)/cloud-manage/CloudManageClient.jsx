'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
  Cloud,
  ExternalLink,
  Play,
  RefreshCw,
  Save,
  Settings2,
  Users,
  Wallet,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getServerSystemPageNav } from '@/components/Admin/serverSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import styles from '../adminweb/AdminWeb.module.css'
import local from './CloudManage.module.css'

const TABS = [
  { id: 'settings', label: 'تنظیمات', icon: Settings2 },
  { id: 'subs', label: 'مشترکین', icon: Users },
  { id: 'topups', label: 'حسابداری', icon: Wallet },
]

function resolveCloudTab(raw) {
  if (raw === 'subs' || raw === 'subscribers') return 'subs'
  if (raw === 'topups' || raw === 'ledger' || raw === 'accounting') {
    return 'topups'
  }
  return 'settings'
}

const STATUS_FA = {
  pending: 'در انتظار شارژ',
  active: 'فعال',
  grace: 'مهلت بدون شارژ',
  suspended: 'معلق',
  wiped: 'داده حذف‌شده',
  cancelled: 'لغو',
}

function money(n) {
  return `${Number(n || 0).toLocaleString('fa-IR')} تومان`
}

export default function CloudManageClient() {
  const gate = useOwnerGate('/cloud-manage')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAuthHeaders } = useAuth()
  const [tab, setTab] = useState(() =>
    resolveCloudTab(searchParams?.get('tab')),
  )
  const [settings, setSettings] = useState(null)
  const [subs, setSubs] = useState([])
  const [topups, setTopups] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')
  const [adjust, setAdjust] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const headers = getAuthHeaders()
      const [s, st, su, tu] = await Promise.all([
        axios.get(Config.endpoints.cloudServer.manageSettings(), { headers }),
        axios.get(Config.endpoints.cloudServer.manageStats(), { headers }),
        axios.get(Config.endpoints.cloudServer.manageSubscriptions({ q }), {
          headers,
        }),
        axios.get(Config.endpoints.cloudServer.manageTopups({ status: 'pending' }), {
          headers,
        }),
      ])
      setSettings(s.data?.data || null)
      setStats(st.data?.data || null)
      setSubs(su.data?.data || [])
      setTopups(tu.data?.data || [])
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در بارگذاری')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, q])

  useEffect(() => {
    if (gate.allowed) load()
  }, [gate.allowed, load])

  useEffect(() => {
    const next = resolveCloudTab(searchParams?.get('tab'))
    setTab(next)
    if (!searchParams?.get('tab')) {
      router.replace(`/cloud-manage?tab=${next}`)
    }
  }, [searchParams, router])

  const goTab = (id) => {
    setTab(id)
    router.replace(`/cloud-manage?tab=${id}`)
  }

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await axios.patch(
        Config.endpoints.cloudServer.manageSettings(),
        settings,
        { headers: getAuthHeaders() },
      )
      setSettings(res.data?.data || settings)
      setMsg('تنظیمات ذخیره شد')
    } catch (e) {
      setErr(e?.response?.data?.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  const setField = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const setSpec = (idx, patch) => {
    setSettings((s) => {
      const specs = [...(s.specs_json || [])]
      specs[idx] = { ...specs[idx], ...patch }
      return { ...s, specs_json: specs }
    })
  }

  const topupAction = async (id, action) => {
    try {
      await axios.post(
        Config.endpoints.cloudServer.manageTopupAction(id),
        { action },
        { headers: getAuthHeaders() },
      )
      setMsg(action === 'approve' ? 'شارژ تأیید شد' : 'رد شد')
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'خطا')
    }
  }

  const applyAdjust = async (id) => {
    const amount = Math.round(Number(adjust[id] || 0))
    if (!amount) return
    try {
      await axios.patch(
        Config.endpoints.cloudServer.manageSubscription(id),
        { adjust_amount: amount, adjust_note: 'تعدیل از پنل مدیریت' },
        { headers: getAuthHeaders() },
      )
      setAdjust((a) => ({ ...a, [id]: '' }))
      setMsg('موجودی بروزرسانی شد')
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'خطا در تعدیل')
    }
  }

  const runBilling = async () => {
    try {
      const res = await axios.post(
        Config.endpoints.cloudServer.runBilling(),
        {},
        { headers: getAuthHeaders() },
      )
      setMsg(`صورتحساب روزانه: ${JSON.stringify(res.data?.data || {})}`)
      load()
    } catch (e) {
      setErr(e?.response?.data?.message || 'اجرای صورتحساب ناموفق')
    }
  }

  const activeNav =
    tab === 'subs'
      ? '/cloud-manage?tab=subs'
      : tab === 'topups'
        ? '/cloud-manage?tab=topups'
        : '/cloud-manage?tab=settings'

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="مدیریت سفارش، شارژ، کسر روزانه و هشدار پیامکی سرور ابری"
      title={
        tab === 'subs'
          ? 'مشترکین سرور'
          : tab === 'topups'
            ? 'حسابداری سرور'
            : 'تنظیمات سرور ابری'
      }
      wide
      pageNav={getServerSystemPageNav(activeNav)}
      {...gate}
    >
      <div className={local.toolbar}>
        <div className={styles.awTabs}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.awTab} ${tab === id ? styles.awTabOn : ''}`}
              onClick={() => goTab(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <div className={local.actions}>
          <Link href="/cloud-server" className={styles.extBtnGhost} target="_blank">
            <ExternalLink size={14} />
            پنل کاربر
          </Link>
          <button type="button" className={styles.refreshBtn} onClick={load}>
            <RefreshCw size={14} />
            بروزرسانی
          </button>
          <button type="button" className={styles.extBtnGhost} onClick={runBilling}>
            <Play size={14} />
            اجرای کسر روزانه
          </button>
        </div>
      </div>

      {stats ? (
        <div className={local.stats}>
          <div className={local.stat}>
            <strong>{money(stats.total_balance)}</strong>
            <span>جمع موجودی‌ها</span>
          </div>
          <div className={local.stat}>
            <strong>{(stats.pending_topups || 0).toLocaleString('fa-IR')}</strong>
            <span>فیش در انتظار</span>
          </div>
          {Object.entries(stats.counts || {}).map(([k, v]) => (
            <div key={k} className={local.stat}>
              <strong>{Number(v).toLocaleString('fa-IR')}</strong>
              <span>{STATUS_FA[k] || k}</span>
            </div>
          ))}
        </div>
      ) : null}

      {msg ? <p className={local.ok}>{msg}</p> : null}
      {err ? <p className={local.err}>{err}</p> : null}
      {loading ? <p className={local.muted}>در حال بارگذاری…</p> : null}

      {!loading && tab === 'settings' && settings ? (
        <section className={local.panel}>
          <div className={local.grid2}>
            <label>
              عنوان
              <input
                value={settings.title || ''}
                onChange={(e) => setField('title', e.target.value)}
              />
            </label>
            <label>
              هزینه روزانه (تومان)
              <input
                type="number"
                dir="ltr"
                value={settings.daily_price ?? 0}
                onChange={(e) =>
                  setField('daily_price', Math.max(0, Number(e.target.value) || 0))
                }
              />
            </label>
            <label>
              روزهای هشدار پیامک (مانده)
              <input
                type="number"
                dir="ltr"
                value={settings.warning_days ?? 5}
                onChange={(e) =>
                  setField('warning_days', Math.max(0, Number(e.target.value) || 0))
                }
              />
            </label>
            <label>
              مهلت بدون شارژ تا حذف داده (روز)
              <input
                type="number"
                dir="ltr"
                value={settings.grace_days ?? 5}
                onChange={(e) =>
                  setField('grace_days', Math.max(1, Number(e.target.value) || 1))
                }
              />
            </label>
            <label>
              حداقل شارژ (تومان)
              <input
                type="number"
                dir="ltr"
                value={settings.min_topup_amount ?? 0}
                onChange={(e) =>
                  setField(
                    'min_topup_amount',
                    Math.max(0, Number(e.target.value) || 0),
                  )
                }
              />
            </label>
            <label>
              کد پترن پیامک
              <input
                dir="ltr"
                value={settings.sms_pattern_code || ''}
                onChange={(e) => setField('sms_pattern_code', e.target.value)}
              />
            </label>
            <label>
              بانک
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
              کارت
              <input
                dir="ltr"
                value={settings.bank_card || ''}
                onChange={(e) => setField('bank_card', e.target.value)}
              />
            </label>
            <label>
              شبا
              <input
                dir="ltr"
                value={settings.bank_sheba || ''}
                onChange={(e) => setField('bank_sheba', e.target.value)}
              />
            </label>
          </div>
          <label className={local.full}>
            متن مسئولیت حذف داده
            <textarea
              rows={4}
              value={settings.wipe_policy_text || ''}
              onChange={(e) => setField('wipe_policy_text', e.target.value)}
            />
          </label>
          <label className={local.full}>
            راهنمای واریز
            <textarea
              rows={3}
              value={settings.payment_instructions || ''}
              onChange={(e) => setField('payment_instructions', e.target.value)}
            />
          </label>
          <div className={local.toggles}>
            <label>
              <input
                type="checkbox"
                checked={!!settings.sms_enabled}
                onChange={(e) => setField('sms_enabled', e.target.checked)}
              />
              ارسال پیامک هشدار
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!settings.is_accepting_orders}
                onChange={(e) => setField('is_accepting_orders', e.target.checked)}
              />
              پذیرش سفارش جدید
            </label>
          </div>
          <h3>مشخصات سرور</h3>
          {(settings.specs_json || []).map((sp, i) => (
            <div key={i} className={local.specRow}>
              <input
                value={sp.label || ''}
                placeholder="عنوان"
                onChange={(e) => setSpec(i, { label: e.target.value })}
              />
              <input
                value={sp.value || ''}
                placeholder="مقدار"
                onChange={(e) => setSpec(i, { value: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={() =>
              setSettings((s) => ({
                ...s,
                specs_json: [...(s.specs_json || []), { label: '', value: '' }],
              }))
            }
          >
            + مشخصه
          </button>
          <div className={local.saveRow}>
            <button
              type="button"
              className={styles.extBtn}
              onClick={saveSettings}
              disabled={saving}
            >
              <Save size={14} />
              ذخیره تنظیمات
            </button>
          </div>
          <p className={local.muted} style={{ marginTop: '1rem' }}>
            کرون روزانه (سرور):{' '}
            <code dir="ltr">python manage.py bill_cloud_daily</code>
            — کسر روزانه، ورود به مهلت، پیامک هشدار و حذف داده پس از مهلت.
          </p>
        </section>
      ) : null}

      {!loading && tab === 'subs' ? (
        <section className={local.panel}>
          <div className={local.searchRow}>
            <input
              placeholder="جستجو کد / موبایل / نام / دامنه…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="button" className={styles.refreshBtn} onClick={load}>
              جستجو
            </button>
          </div>
          <div className={local.table}>
            {subs.map((s) => (
              <article key={s.id} className={local.card}>
                <div className={local.cardTop}>
                  <strong>{s.code}</strong>
                  <span className={local.badge}>{STATUS_FA[s.status] || s.status}</span>
                </div>
                <p>
                  {s.display_name || s.contact_name || s.user_name} ·{' '}
                  {s.contact_mobile || s.user_mobile}
                </p>
                <p>
                  دامنه نصب:{' '}
                  {s.domain ? (
                    <>
                      <b dir="ltr">{s.domain}</b>
                      {s.domain_confirmed ? ' · تأیید مشتری' : ' · بدون تأیید'}
                      {' · '}
                      <a
                        href={`/adminweb?domain=${encodeURIComponent(s.domain)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        نصب روی سرور
                      </a>
                    </>
                  ) : (
                    <span className={local.muted}>هنوز اعلام نشده</span>
                  )}
                </p>
                <p>
                  موجودی: <b>{money(s.balance)}</b> · روزانه:{' '}
                  {money(s.daily_price)} · حدود{' '}
                  {(s.days_remaining || 0).toLocaleString('fa-IR')} روز
                </p>
                <div className={local.adjust}>
                  <input
                    type="number"
                    dir="ltr"
                    placeholder="تعدیل (+/-)"
                    value={adjust[s.id] ?? ''}
                    onChange={(e) =>
                      setAdjust((a) => ({ ...a, [s.id]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className={styles.extBtn}
                    onClick={() => applyAdjust(s.id)}
                  >
                    اعمال
                  </button>
                </div>
              </article>
            ))}
            {!subs.length ? <p className={local.muted}>مشترکی نیست.</p> : null}
          </div>
        </section>
      ) : null}

      {!loading && tab === 'topups' ? (
        <section className={local.panel}>
          <h2>
            <Cloud size={16} /> حسابداری — فیش‌ها و شارژهای در انتظار
          </h2>
          <div className={local.table}>
            {topups.map((t) => (
              <article key={t.id} className={local.card}>
                <div className={local.cardTop}>
                  <strong>
                    #{t.id} · {t.subscription_code}
                  </strong>
                  <span>{money(t.amount)}</span>
                </div>
                <p>
                  {t.method_display} · {t.status_display}
                </p>
                {t.receipt_note ? <p>{t.receipt_note}</p> : null}
                {t.receipt_url ? (
                  <a href={t.receipt_url} target="_blank" rel="noreferrer">
                    مشاهده رسید
                  </a>
                ) : null}
                {t.status === 'pending' ? (
                  <div className={local.adjust}>
                    <button
                      type="button"
                      className={styles.extBtn}
                      onClick={() => topupAction(t.id, 'approve')}
                    >
                      تأیید شارژ
                    </button>
                    <button
                      type="button"
                      className={styles.extBtnGhost}
                      onClick={() => topupAction(t.id, 'reject')}
                    >
                      رد
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
            {!topups.length ? (
              <p className={local.muted}>مورد در انتظار نیست.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </OwnerPortalShell>
  )
}
