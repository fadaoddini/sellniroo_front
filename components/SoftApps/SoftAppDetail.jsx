'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppWindow, ArrowRight, Download, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import softappsService from '@/components/SoftApps/services/softappsService'
import styles from './SoftApps.module.css'

function formatPrice(n) {
  if (!n) return '۰'
  return Number(n).toLocaleString('fa-IR')
}

const PLATFORM_FA = {
  windows: 'ویندوز',
  mac: 'مک',
  android: 'اندروید',
  ios: 'iOS',
  linux: 'لینوکس',
  web: 'وب',
  other: 'سایر',
}

export default function SoftAppDetail({ slug }) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { language, dir } = useLanguage()
  const isEn = language === 'en'

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [msgErr, setMsgErr] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await softappsService.detail(slug)
    if (!res.success) {
      setError(res.error || 'یافت نشد')
      setApp(null)
      setLoading(false)
      return
    }
    setApp(res.data)
    setLoading(false)
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  const needLogin = () => {
    router.push(`/login?next=/apps/${encodeURIComponent(slug)}`)
  }

  const handleDownload = async () => {
    setMsg(null)
    setMsgErr(null)
    if (!app) return
    if (!app.is_free && !isAuthenticated) {
      needLogin()
      return
    }
    if (app.is_free && app.requires_login_for_free && !isAuthenticated) {
      needLogin()
      return
    }
    setBusy(true)
    const res = await softappsService.download(app.id)
    setBusy(false)
    if (!res.success) {
      if (res.code === 'login_required' || res.httpStatus === 401) {
        needLogin()
        return
      }
      if (res.code === 'purchase_required') {
        setMsgErr(
          isEn
            ? 'Please purchase this app first.'
            : 'ابتدا نرم‌افزار را خریداری کنید.'
        )
        return
      }
      setMsgErr(res.error || 'خطا')
      return
    }
    const url = res.data?.download_url
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      setMsg(isEn ? 'Download started.' : 'دانلود آغاز شد.')
      load()
    } else {
      setMsgErr(isEn ? 'No download link.' : 'لینک دانلود موجود نیست.')
    }
  }

  const handlePurchase = async () => {
    setMsg(null)
    setMsgErr(null)
    if (!isAuthenticated) {
      needLogin()
      return
    }
    setBusy(true)
    const res = await softappsService.purchase(app.id)
    setBusy(false)
    if (!res.success) {
      setMsgErr(res.error || 'خطا در پرداخت')
      return
    }
    if (res.data?.already_owned) {
      setMsg(isEn ? 'You already own this app.' : 'این نرم‌افزار را قبلاً خریده‌اید.')
      load()
      return
    }
    const payUrl = res.data?.payment_url
    if (payUrl) {
      window.location.href = payUrl
      return
    }
    setMsgErr(
      isEn
        ? 'Payment gateway is not available.'
        : 'درگاه پرداخت در دسترس نیست.'
    )
  }

  if (loading || authLoading) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.inner}>
          <div className={styles.state}>
            {isEn ? 'Loading…' : 'در حال بارگذاری…'}
          </div>
        </div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.inner}>
          <div className={styles.state}>{error || 'یافت نشد'}</div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/apps" className={styles.backLink}>
              {isEn ? 'Back to apps' : 'بازگشت به لیست'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canDownload =
    app.is_free || app.owned || (!app.is_free && app.owned)

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.inner}>
        <div className={styles.detailLayout}>
          <div className={styles.detailMain}>
            <Link href="/apps" className={styles.backLink}>
              <ArrowRight size={14} />
              {isEn ? 'All apps' : 'همه نرم‌افزارها'}
            </Link>

            <div className={styles.detailHead}>
              {app.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={app.icon_url} alt="" className={styles.detailIcon} />
              ) : (
                <div className={styles.detailIconPh}>
                  <AppWindow size={36} />
                </div>
              )}
              <div>
                <h1 className={styles.detailTitle}>{app.title}</h1>
                {app.short_desc ? (
                  <p className={styles.detailShort}>{app.short_desc}</p>
                ) : null}
                <div className={styles.badges}>
                  {app.is_free ? (
                    <span className={`${styles.badge} ${styles.badgeFree}`}>
                      {isEn ? 'Free' : 'رایگان'}
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgePaid}`}>
                      {isEn ? 'Paid' : 'پولی'}
                    </span>
                  )}
                  {app.category?.name ? (
                    <span className={styles.badge}>{app.category.name}</span>
                  ) : null}
                  {app.platform ? (
                    <span className={styles.badge}>
                      {PLATFORM_FA[app.platform] || app.platform}
                    </span>
                  ) : null}
                  {app.version ? (
                    <span className={styles.badge}>v{app.version}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {app.description ? (
              <p className={styles.description}>{app.description}</p>
            ) : (
              <p className={styles.detailShort}>
                {isEn
                  ? 'No detailed description yet.'
                  : 'توضیحات تکمیلی ثبت نشده است.'}
              </p>
            )}
          </div>

          <aside className={styles.sidePanel}>
            <p
              className={`${styles.sidePrice} ${
                app.is_free ? styles.priceFree : ''
              }`}
            >
              {app.is_free
                ? isEn
                  ? 'Free'
                  : 'رایگان'
                : `${formatPrice(app.price)} ${isEn ? 'Toman' : 'تومان'}`}
            </p>

            <div className={styles.sideMeta}>
              {app.file_size_label ? (
                <span>
                  {isEn ? 'Size' : 'حجم'}: <strong>{app.file_size_label}</strong>
                </span>
              ) : null}
              <span>
                {isEn ? 'Downloads' : 'دانلودها'}:{' '}
                <strong>{formatPrice(app.download_count || 0)}</strong>
              </span>
              {!app.is_free ? (
                <span>
                  {isEn ? 'Purchases' : 'خریدها'}:{' '}
                  <strong>{formatPrice(app.purchase_count || 0)}</strong>
                </span>
              ) : null}
              {app.owned && !app.is_free ? (
                <span className={styles.msgOk}>
                  {isEn ? 'Owned — ready to download' : 'خریداری‌شده — آماده دانلود'}
                </span>
              ) : null}
            </div>

            {canDownload || app.is_free ? (
              <button
                type="button"
                className={styles.ctaBtn}
                disabled={busy || !app.has_file}
                onClick={handleDownload}
              >
                <Download size={18} />
                {busy
                  ? isEn
                    ? 'Please wait…'
                    : 'لطفاً صبر کنید…'
                  : isEn
                    ? 'Download'
                    : 'دانلود'}
              </button>
            ) : null}

            {!app.is_free && !app.owned ? (
              <button
                type="button"
                className={styles.ctaBtn}
                disabled={busy}
                onClick={handlePurchase}
              >
                <ShoppingCart size={18} />
                {busy
                  ? isEn
                    ? 'Please wait…'
                    : 'لطفاً صبر کنید…'
                  : isEn
                    ? 'Buy & download'
                    : 'خرید و دانلود'}
              </button>
            ) : null}

            {!app.has_file ? (
              <p className={`${styles.msg} ${styles.msgErr}`}>
                {isEn
                  ? 'Download file is not available yet.'
                  : 'فایل دانلود هنوز تعریف نشده است.'}
              </p>
            ) : null}

            {msg ? <p className={`${styles.msg} ${styles.msgOk}`}>{msg}</p> : null}
            {msgErr ? (
              <p className={`${styles.msg} ${styles.msgErr}`}>{msgErr}</p>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
