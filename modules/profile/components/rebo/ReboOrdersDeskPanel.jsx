'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  Archive,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  LayoutDashboard,
  Loader2,
  Package,
  RefreshCw,
  Timer,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { formatRial } from '@/config/reboPricing'
import { goHomeHash } from '@/utils/goHomeHash'
import styles from '../../styles/ReboHub.module.css'

function money(n, cur = 'تومان') {
  return `${formatRial(n)} ${cur}`
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

function stageTone(status) {
  if (status === 'paid' || status === 'done') return styles.stageDone
  if (status === 'open' || status === 'awaiting_review') return styles.stageOpen
  if (status === 'locked') return styles.stageLocked
  return styles.stageIdle
}

export default function ReboOrdersDeskPanel({ onNavigate }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [activeOrders, setActiveOrders] = useState([])
  const [archivedOrders, setArchivedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [mode, setMode] = useState('0') // 0 active | 1 archived | all | flow

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setErr('')
    try {
      const headers = getAuthHeaders()
      const [a, z] = await Promise.all([
        axios.get(Config.endpoints.reboOrders.my({ archived: '0' }), {
          headers,
          timeout: 12000,
        }),
        axios.get(Config.endpoints.reboOrders.my({ archived: '1' }), {
          headers,
          timeout: 12000,
        }),
      ])
      if (!a.data?.success) throw new Error(a.data?.message || 'بارگذاری ناموفق')
      setActiveOrders(Array.isArray(a.data?.data) ? a.data.data : [])
      setArchivedOrders(Array.isArray(z.data?.data) ? z.data.data : [])
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در دریافت سفارش‌ها')
      setActiveOrders([])
      setArchivedOrders([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  const summary = useMemo(() => {
    const open = activeOrders.filter((o) =>
      ['awaiting_payment', 'awaiting_review', 'in_progress'].includes(o.status),
    )
    const paidSum = activeOrders.reduce(
      (sum, o) => sum + Number(o.paid_amount || 0),
      0,
    )
    const remaining = activeOrders.reduce(
      (sum, o) => sum + Number(o.remaining_amount || 0),
      0,
    )
    const supportOn = activeOrders.filter(
      (o) => o.support_status === 'active' || o.support_status === 'expiring',
    ).length
    const currency = activeOrders[0]?.currency_label || 'تومان'
    return {
      count: activeOrders.length,
      open: open.length,
      remaining,
      paidSum,
      archived: archivedOrders.length,
      supportOn,
      currency,
    }
  }, [activeOrders, archivedOrders])

  const orders = useMemo(() => {
    if (mode === '1') return archivedOrders
    if (mode === 'all') return [...activeOrders, ...archivedOrders]
    if (mode === 'flow') {
      return activeOrders.filter((o) =>
        ['awaiting_payment', 'awaiting_review', 'in_progress'].includes(o.status),
      )
    }
    return activeOrders
  }, [mode, activeOrders, archivedOrders])

  const widgets = [
    {
      key: 'active',
      label: 'فعال',
      value: summary.count.toLocaleString('fa-IR'),
      icon: LayoutDashboard,
      tone: 'accent',
    },
    {
      key: 'flow',
      label: 'در جریان',
      value: summary.open.toLocaleString('fa-IR'),
      icon: Timer,
      tone: 'warn',
    },
    {
      key: 'paid',
      label: 'پرداخت‌شده',
      value: money(summary.paidSum, summary.currency),
      icon: CircleDollarSign,
      tone: 'ok',
    },
    {
      key: 'remain',
      label: 'مانده',
      value: money(summary.remaining, summary.currency),
      icon: Wallet,
      tone: 'accent',
    },
    {
      key: 'support',
      label: 'پشتیبانی',
      value: summary.supportOn.toLocaleString('fa-IR'),
      icon: FileCheck2,
      tone: 'ok',
    },
    {
      key: 'archive',
      label: 'آرشیو',
      value: summary.archived.toLocaleString('fa-IR'),
      icon: Archive,
      tone: 'muted',
    },
  ]

  const filters = [
    { id: '0', label: 'فعال', icon: LayoutDashboard },
    { id: 'flow', label: 'در جریان', icon: Timer },
    { id: '1', label: 'آرشیو', icon: Archive },
    { id: 'all', label: 'همه', icon: ClipboardList },
  ]

  return (
    <section className={`${styles.desk} ${styles.compactPanel}`} dir="rtl" lang="fa">
      <header className={styles.deskHeroCompact}>
        <div>
          <p className={styles.eyebrow}>
            <LayoutDashboard size={12} />
            میزکار قرارداد
          </p>
          <h2>پیگیری و ادامه سفارش</h2>
        </div>
        <div className={styles.deskHeroActions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => onNavigate?.('cart')}
          >
            <Package size={12} />
            سبد
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => goHomeHash('rebo-cost')}
          >
            <Calculator size={12} />
            بسته‌ها
          </button>
          <button
            type="button"
            className={styles.ghostIconBtn}
            onClick={load}
            disabled={loading}
            aria-label="بروزرسانی"
          >
            <RefreshCw size={12} className={loading ? styles.spin : undefined} />
          </button>
        </div>
      </header>

      <div className={styles.deskWidgets6}>
        {widgets.map((w) => {
          const Icon = w.icon
          return (
            <article
              key={w.key}
              className={`${styles.deskWidget} ${styles[`w_${w.tone}`] || ''}`}
            >
              <span className={styles.deskWidgetIcon} aria-hidden>
                <Icon size={14} strokeWidth={1.9} />
              </span>
              <span>{w.label}</span>
              <strong>{w.value}</strong>
            </article>
          )
        })}
      </div>

      <div className={styles.deskFilters4}>
        {filters.map((f) => {
          const Icon = f.icon
          const on = mode === f.id
          return (
            <button
              key={f.id}
              type="button"
              className={on ? styles.filterOn : styles.filterBtn}
              onClick={() => setMode(f.id)}
            >
              <Icon size={12} />
              {f.label}
            </button>
          )
        })}
      </div>

      {err ? <p className={styles.err}>{err}</p> : null}

      {loading ? (
        <div className={styles.panelLoading} role="status">
          <Loader2 size={16} className={styles.spin} />
          بارگذاری…
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.deskEmpty}>
          <ClipboardList size={18} />
          <h3>{mode === '1' ? 'آرشیوی نیست' : 'سفارشی نیست'}</h3>
          <p>بسته را انتخاب کنید و قرارداد را از سبد ثبت کنید.</p>
          <div className={styles.deskEmptyActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => goHomeHash('rebo-cost')}
            >
              انتخاب بسته
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => onNavigate?.('cart')}
            >
              سبد
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.deskGrid4}>
          {orders.map((o) => {
            const paid = Number(o.paid_amount || 0)
            const total = Number(o.amount || 0)
            const pct =
              total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
            const href = `/todorebo?code=${encodeURIComponent(o.code)}`
            return (
              <article key={o.id || o.code} className={styles.deskCard}>
                <div className={styles.deskCardTop}>
                  <span className={styles.deskStatus}>
                    {o.status_display || o.status}
                  </span>
                  <small>{formatDate(o.created_at)}</small>
                </div>

                <Link href={href} className={styles.deskCode}>
                  <strong dir="ltr">{o.code}</strong>
                  <ExternalLink size={11} />
                </Link>

                <div className={styles.deskMoney}>
                  <span>
                    <Wallet size={11} />
                    {money(total, o.currency_label)}
                  </span>
                  <span>مانده {money(o.remaining_amount, o.currency_label)}</span>
                </div>

                <div className={styles.deskProgress} aria-hidden>
                  <i style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.deskProgressLabel}>
                  {pct.toLocaleString('fa-IR')}٪
                </div>

                {(o.stages || []).length > 0 ? (
                  <div className={styles.stageRow}>
                    {o.stages.map((s) => (
                      <span
                        key={s.key || s.title}
                        className={`${styles.stageChip} ${stageTone(s.status)}`}
                        title={s.status_display || s.status}
                      >
                        {(s.status === 'paid' || s.status === 'done') && (
                          <CheckCircle2 size={10} />
                        )}
                        {s.title}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className={styles.deskCardActions}>
                  <Link href={href} className={styles.primaryBtn}>
                    ادامه
                    <ArrowLeft size={11} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
