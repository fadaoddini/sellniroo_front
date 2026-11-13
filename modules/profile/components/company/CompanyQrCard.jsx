'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Download, QrCode } from 'lucide-react'
import {
  companyPublicUrl,
  companyQrImageUrl,
  downloadCompanyQrPng,
} from '@/utils/companyQr'
import styles from '../../styles/company/CompanyQrCard.module.css'

export default function CompanyQrCard({ company }) {
  const slug = company?.slug || ''
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const publicUrl = useMemo(() => {
    if (!slug || typeof window === 'undefined') return ''
    return companyPublicUrl(slug, window.location.origin)
  }, [slug])

  const qrSrc = useMemo(
    () => (publicUrl ? companyQrImageUrl(publicUrl, 240) : ''),
    [publicUrl]
  )

  if (!slug) return null

  const handleCopy = async () => {
    setError('')
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('کپی لینک انجام نشد')
    }
  }

  const handleDownload = async () => {
    setError('')
    setBusy(true)
    try {
      const safe = String(company?.name || slug)
        .replace(/[^\w\u0600-\u06FF-]+/g, '-')
        .slice(0, 40)
      await downloadCompanyQrPng(publicUrl, `qr-${safe || 'company'}.png`)
    } catch (e) {
      setError(e?.message || 'دانلود ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.card} aria-label="کد QR اختصاصی شرکت">
      <div className={styles.head}>
        <span className={styles.iconWrap} aria-hidden>
          <QrCode size={18} strokeWidth={2.2} />
        </span>
        <div className={styles.headText}>
          <h3 className={styles.title}>کد QR اختصاصی شرکت</h3>
          <p className={styles.desc}>
            این کد به صفحهٔ عمومی شرکت شما وصل است. روی تابلو، کارت ویزیت یا
            آگهی چاپ کنید تا بازدیدکننده مستقیم وارد پروفایل شرکت شود.
          </p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.qrWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={`QR شرکت ${company?.name || ''}`}
            className={styles.qrImg}
            width={240}
            height={240}
          />
        </div>

        <div className={styles.side}>
          <label className={styles.label}>لینک عمومی</label>
          <div className={styles.linkRow}>
            <input
              className={styles.linkInput}
              value={publicUrl}
              readOnly
              dir="ltr"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleCopy}
              aria-label="کپی لینک"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleDownload}
              disabled={busy}
            >
              <Download size={16} strokeWidth={2.2} />
              {busy ? 'در حال آماده‌سازی…' : 'دانلود QR'}
            </button>
            <a
              className={styles.ghostBtn}
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              مشاهده صفحه عمومی
            </a>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}
          {copied ? <p className={styles.ok}>لینک کپی شد</p> : null}
        </div>
      </div>
    </section>
  )
}
