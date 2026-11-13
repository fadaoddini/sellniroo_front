'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  ClipboardList,
  Hash,
  Loader2,
  Package,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { formatRial } from '@/config/reboPricing'
import {
  clearReboOrderHistory,
  readReboOrderHistory,
} from '@/utils/reboOrderHistory'
import styles from '../../styles/ReboHub.module.css'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

export default function ReboTrackPanel({ initialNumber = '' }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [localOrders, setLocalOrders] = useState(() => readReboOrderHistory())
  const [serverOrders, setServerOrders] = useState([])
  const [number, setNumber] = useState(initialNumber || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [result, setResult] = useState(null)

  const refreshLocal = useCallback(() => {
    setLocalOrders(readReboOrderHistory())
  }, [])

  useEffect(() => {
    refreshLocal()
    const onChange = () => refreshLocal()
    window.addEventListener('rebo-package-orders-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('rebo-package-orders-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [refreshLocal])

  useEffect(() => {
    if (initialNumber) setNumber(initialNumber)
  }, [initialNumber])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
    axios
      .get(Config.endpoints.reboOrders.my(), {
        headers: getAuthHeaders(),
        timeout: 10000,
      })
      .then((res) => {
        if (cancelled) return
        const rows = res.data?.data || []
        setServerOrders(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!cancelled) setServerOrders([])
      })
    return () => {
      cancelled = true
    }
  }, [getAuthHeaders, isAuthenticated])

  const cards = useMemo(() => {
    const map = new Map()
    localOrders.forEach((o) => {
      if (!o?.request_number) return
      map.set(o.request_number, {
        key: o.request_number,
        request_number: o.request_number,
        code: '',
        title: o.title || 'سفارش ربو',
        total: o.total || 0,
        currency: o.currency || 'تومان',
        count: (o.package_count || 0) + (o.item_count || 0),
        status: 'ثبت‌شده',
        created_at: o.created_at,
        source: 'local',
      })
    })
    serverOrders.forEach((o) => {
      const key = o.request_number || o.code || String(o.id)
      if (!key) return
      const prev = map.get(key)
      map.set(key, {
        key,
        request_number: o.request_number || prev?.request_number || '',
        code: o.code || '',
        title: prev?.title || `سفارش ${o.code || ''}`.trim() || 'سفارش ربو',
        total: o.amount ?? prev?.total ?? 0,
        currency: o.currency_label || prev?.currency || 'تومان',
        count:
          (Array.isArray(o.lines_json) ? o.lines_json.length : 0) ||
          prev?.count ||
          0,
        status: o.status_display || o.status || prev?.status || '—',
        created_at: o.created_at || prev?.created_at,
        source: 'server',
      })
    })
    return Array.from(map.values()).sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })
  }, [localOrders, serverOrders])

  const lookup = async (raw) => {
    const req = String(raw || number || '')
      .trim()
      .replace(/\s+/g, '')
    if (!req) {
      setErr('شماره پیگیری را وارد کنید')
      return
    }
    setBusy(true)
    setErr('')
    setResult(null)
    try {
      const res = await axios.get(Config.endpoints.requser.status(req), {
        timeout: 10000,
      })
      const data = res.data?.data || res.data
      if (!data || res.data?.status === 'error') {
        throw new Error(res.data?.message || 'درخواستی یافت نشد')
      }
      setResult({
        request_number: data.request_number || req,
        title: data.title || 'درخواست',
        status: data.status_display || data.status || '—',
        created_at: data.created_at || data.created || null,
        customer_name: data.customer_name || '',
        description: data.description || '',
      })
      setNumber(req)
    } catch (ex) {
      const status = ex?.response?.status
      const apiMsg = ex?.response?.data?.message
      if (status === 404) {
        setErr(apiMsg || 'درخواستی با این شماره یافت نشد')
      } else if (status >= 500) {
        setErr(apiMsg || 'خطای سرور در پیگیری. کمی بعد دوباره تلاش کنید.')
      } else {
        setErr(apiMsg || ex?.message || 'پیگیری ناموفق بود. شماره را بررسی کنید.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.track} dir="rtl" lang="fa">
      <header className={styles.sectionHead}>
        <p className={styles.eyebrow}>
          <ClipboardList size={14} />
          پیگیری سفارش
        </p>
        <h2>وضعیت درخواست ربو</h2>
        <p>
          شماره پیگیری را وارد کنید یا از کارت‌های سفارش زیر یکی را انتخاب کنید.
        </p>
      </header>

      <form
        className={styles.trackForm}
        onSubmit={(e) => {
          e.preventDefault()
          lookup()
        }}
      >
        <label>
          شماره پیگیری
          <input
            dir="ltr"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="مثلاً REQ-1404-…"
            autoComplete="off"
          />
        </label>
        <button type="submit" className={styles.primaryBtn} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={15} className={styles.spin} />
              بررسی…
            </>
          ) : (
            <>
              <Search size={15} />
              استعلام
            </>
          )}
        </button>
      </form>

      {err ? <p className={styles.err}>{err}</p> : null}

      {result ? (
        <div className={styles.trackResultGrid}>
          <article className={styles.trackMiniCard}>
            <span className={styles.trackMiniIcon} aria-hidden>
              <Hash size={14} />
            </span>
            <small>شماره پیگیری</small>
            <strong dir="ltr">{result.request_number}</strong>
          </article>
          <article className={styles.trackMiniCard}>
            <span className={styles.trackMiniIcon} aria-hidden>
              <ClipboardList size={14} />
            </span>
            <small>وضعیت</small>
            <strong>{result.status}</strong>
          </article>
          <article className={styles.trackMiniCard}>
            <span className={styles.trackMiniIcon} aria-hidden>
              <Package size={14} />
            </span>
            <small>ثبت</small>
            <strong>{formatDate(result.created_at)}</strong>
          </article>
          {(result.title || result.customer_name) && (
            <article className={`${styles.trackMiniCard} ${styles.trackMiniWide}`}>
              <small>{result.title || 'درخواست'}</small>
              <strong>{result.customer_name || '—'}</strong>
              {result.description ? (
                <p className={styles.trackMiniDesc}>{result.description}</p>
              ) : null}
            </article>
          )}
        </div>
      ) : null}

      <div className={styles.trackHistoryHead}>
        <h3>سفارش‌های شما</h3>
        {localOrders.length ? (
          <button
            type="button"
            className={styles.ghostIconBtn}
            onClick={() => {
              clearReboOrderHistory()
              refreshLocal()
              setResult(null)
            }}
            aria-label="پاک کردن تاریخچه محلی"
            title="پاک کردن تاریخچه محلی"
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>

      {cards.length ? (
        <div className={styles.trackCardGrid}>
          {cards.map((o) => (
            <button
              key={o.key}
              type="button"
              className={styles.trackOrderCard}
              onClick={() =>
                lookup(o.request_number || o.code || o.key)
              }
              disabled={busy || !(o.request_number || o.code)}
            >
              <div className={styles.trackOrderTop}>
                <span className={styles.trackOrderBadge}>{o.status}</span>
                <small>{formatDate(o.created_at)}</small>
              </div>
              <strong dir="ltr" className={styles.trackOrderCode}>
                {o.request_number || o.code}
              </strong>
              <div className={styles.trackOrderMeta}>
                <span>
                  <Package size={12} />
                  {(o.count || 0).toLocaleString('fa-IR')} مورد
                </span>
                <span>
                  <Wallet size={12} />
                  {formatRial(o.total)} {o.currency}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyHint}>
          بعد از ثبت سفارش بسته، کارت‌های پیگیری اینجا نمایش داده می‌شوند.
        </p>
      )}
    </section>
  )
}
