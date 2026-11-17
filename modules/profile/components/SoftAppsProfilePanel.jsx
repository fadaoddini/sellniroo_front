'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AppWindow,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import softappsService from '@/components/SoftApps/services/softappsService'
import styles from '../styles/SoftAppsProfilePanel.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function statusLabel(status) {
  if (status === 'paid') return 'پرداخت‌شده'
  if (status === 'pending') return 'در انتظار پرداخت'
  if (status === 'canceled') return 'لغو'
  if (status === 'refunded') return 'بازگشت وجه'
  return status || '—'
}

export default function SoftAppsProfilePanel({ variant = 'embedded' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await softappsService.myLibrary()
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      setData(null)
      return
    }
    setData(res.data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDownload = async (app) => {
    if (!app?.id) return
    setBusyId(app.id)
    setActionMsg(null)
    const res = await softappsService.download(app.id)
    setBusyId(null)
    if (!res.success) {
      setActionMsg(res.error || 'دانلود ناموفق بود')
      return
    }
    const url = res.data?.download_url
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
      setActionMsg('لینک دانلود باز شد')
      load()
      return
    }
    setActionMsg('لینک دانلود دریافت نشد')
  }

  if (loading) {
    return (
      <div className={styles.wrap} role="status">
        <Loader2 className={styles.spinner} size={26} />
        <p>در حال بارگذاری نرم‌افزارهای شما…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <p className={styles.error}>{error}</p>
        <button type="button" className={styles.btnGhost} onClick={load}>
          <RefreshCw size={15} />
          تلاش مجدد
        </button>
      </div>
    )
  }

  const summary = data?.summary || {}
  const apps = data?.apps || []
  const pending = data?.pending_purchases || []
  const purchases = data?.purchases || []

  return (
    <div
      className={`${styles.panel} ${
        variant === 'standalone' ? styles.panelStandalone : ''
      }`}
    >
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>کتابخانه نرم‌افزار</p>
          <h2 className={styles.title}>
            <AppWindow size={18} strokeWidth={2.1} />
            نرم‌افزارهای من
          </h2>
          <p className={styles.sub}>
            خریدها، دانلودها و دسترسی به فایل‌های نرم‌افزارهای کاربردی
          </p>
        </div>
        <div className={styles.headActions}>
          <button type="button" className={styles.btnGhost} onClick={load}>
            <RefreshCw size={13} strokeWidth={2.2} />
            بروزرسانی
          </button>
          <Link href="/apps" className={styles.btnPrimary}>
            <ShoppingBag size={14} />
            فروشگاه نرم‌افزار
          </Link>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong>{summary.owned_count || 0}</strong>
          <span>در کتابخانه</span>
        </div>
        <div className={styles.stat}>
          <strong>{summary.paid_count || 0}</strong>
          <span>خرید موفق</span>
        </div>
        <div className={styles.stat}>
          <strong>{summary.pending_count || 0}</strong>
          <span>در انتظار پرداخت</span>
        </div>
        <div className={styles.stat}>
          <strong>{summary.download_events || 0}</strong>
          <span>دانلود ثبت‌شده</span>
        </div>
      </div>

      {actionMsg ? <p className={styles.msg}>{actionMsg}</p> : null}

      {pending.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>پرداخت‌های ناتمام</h3>
          <ul className={styles.list}>
            {pending.map((p) => (
              <li key={`pending-${p.id}`} className={styles.item}>
                <div className={styles.itemMain}>
                  <p className={styles.itemTitle}>{p.app_title}</p>
                  <p className={styles.itemMeta}>
                    {money(p.amount)} تومان · {statusLabel(p.status)}
                  </p>
                </div>
                {p.app_slug ? (
                  <Link href={`/apps/${p.app_slug}`} className={styles.linkBtn}>
                    ادامه خرید
                    <ExternalLink size={13} />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>کتابخانه شما</h3>
        {apps.length === 0 ? (
          <div className={styles.empty}>
            <p>هنوز نرم‌افزاری خریداری یا دانلود نکرده‌اید.</p>
            <Link href="/apps" className={styles.btnPrimary}>
              مشاهده نرم‌افزارها
            </Link>
          </div>
        ) : (
          <ul className={styles.appGrid}>
            {apps.map((app) => (
              <li key={app.id} className={styles.appCard}>
                <div className={styles.appTop}>
                  {app.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.icon_url} alt="" className={styles.icon} />
                  ) : (
                    <div className={styles.iconPh}>
                      <AppWindow size={20} />
                    </div>
                  )}
                  <div className={styles.appMeta}>
                    <Link href={`/apps/${app.slug}`} className={styles.appTitle}>
                      {app.title}
                    </Link>
                    <p className={styles.appDesc}>
                      {app.is_free
                        ? 'رایگان'
                        : `${money(app.price)} تومان`}
                      {app.version ? ` · v${app.version}` : ''}
                      {app.platform ? ` · ${app.platform}` : ''}
                    </p>
                  </div>
                </div>
                <div className={styles.appActions}>
                  <Link href={`/apps/${app.slug}`} className={styles.btnGhost}>
                    جزئیات
                  </Link>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    disabled={busyId === app.id}
                    onClick={() => handleDownload(app)}
                  >
                    {busyId === app.id ? (
                      <Loader2 className={styles.spinnerInline} size={14} />
                    ) : (
                      <Download size={14} />
                    )}
                    دانلود
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {purchases.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>تاریخچه خرید</h3>
          <ul className={styles.list}>
            {purchases.slice(0, 12).map((p) => (
              <li key={`buy-${p.id}`} className={styles.item}>
                <div className={styles.itemMain}>
                  <p className={styles.itemTitle}>{p.app_title}</p>
                  <p className={styles.itemMeta}>
                    {money(p.amount)} تومان · {statusLabel(p.status)}
                  </p>
                </div>
                {p.app_slug ? (
                  <Link href={`/apps/${p.app_slug}`} className={styles.linkBtn}>
                    مشاهده
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
