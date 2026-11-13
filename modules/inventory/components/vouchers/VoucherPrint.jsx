'use client'

import React, { useEffect } from 'react'
import { Printer, X, Undo2, Archive } from 'lucide-react'
import styles from './vouchers.module.css'

const faNum = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('fa-IR')
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return `${d.toLocaleDateString('fa-IR')} — ${d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } catch {
    return '—'
  }
}

export default function VoucherPrint({ voucher, onClose, onReject, onArchive }) {
  useEffect(() => {
    if (!voucher) return undefined
    const prev = document.documentElement.classList.contains('inv-voucher-print')
    const onAfterPrint = () => {
      document.documentElement.classList.remove('inv-voucher-print')
    }
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('afterprint', onAfterPrint)
      if (!prev) document.documentElement.classList.remove('inv-voucher-print')
    }
  }, [voucher])

  if (!voucher) return null

  const handlePrint = () => {
    document.documentElement.classList.add('inv-voucher-print')
    window.setTimeout(() => window.print(), 50)
  }

  const unitLabel =
    voucher.unit_abbreviation || voucher.unit_title || 'واحد'
  const authName = voucher.authorized_by_name || '—'
  const authPosition = voucher.authorized_by_position || ''
  const authPhone = voucher.authorized_by_phone || ''

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
      <div className={styles.sheetShell}>
        <div className={styles.sheetToolbar}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            <X size={16} />
            بستن
          </button>
          {onReject ? (
            <button type="button" className={styles.btnDanger} onClick={onReject}>
              <Undo2 size={16} />
              رد حواله
            </button>
          ) : null}
          {onArchive ? (
            <button type="button" className={styles.btnGhost} onClick={onArchive}>
              <Archive size={16} />
              آرشیو
            </button>
          ) : null}
          <button type="button" className={styles.btnPrimary} onClick={handlePrint}>
            <Printer size={16} />
            چاپ حواله
          </button>
        </div>

        <article className={styles.sheet}>
          <header className={styles.sheetHead}>
            <div className={styles.sheetBrand}>
              <strong>حواله خروج کالا</strong>
              <span>مجوز خروج از انبار و تحویل کالا</span>
            </div>
            <div className={styles.sheetMeta}>
              <div>
                <b>شماره:</b> {voucher.reference_number || '—'}
              </div>
              <div>
                <b>تاریخ:</b> {formatDate(voucher.transaction_date || voucher.created_at)}
              </div>
              <div>
                <b>وضعیت:</b>{' '}
                {voucher.status === 'CANCELLED'
                  ? 'رد شده / برگشت به انبار'
                  : voucher.status_display || voucher.status || '—'}
                {voucher.is_archived ? ' · آرشیو' : ''}
              </div>
            </div>
          </header>

          <div className={styles.grid}>
            <div className={styles.field}>
              <span>انبار مبدأ</span>
              <strong>{voucher.warehouse_title || '—'}</strong>
            </div>
            <div className={styles.field}>
              <span>مجوز خروج (فرد مجاز)</span>
              <strong>
                {authName}
                {authPosition ? ` — ${authPosition}` : ''}
              </strong>
              {authPhone ? (
                <span style={{ marginTop: 4 }}>تلفن: {authPhone}</span>
              ) : null}
            </div>
            <div className={styles.field}>
              <span>ثبت‌کننده</span>
              <strong>{voucher.created_by_name || '—'}</strong>
            </div>
            <div className={styles.field}>
              <span>کد کالا</span>
              <strong>{voucher.product_code || '—'}</strong>
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span>نام کالا</span>
              <strong>{voucher.product_title || '—'}</strong>
            </div>
          </div>

          <div className={styles.tableBlock}>
            <table>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>شرح</th>
                  <th>واحد</th>
                  <th>تعداد</th>
                  <th>معادل ریشه</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>۱</td>
                  <td>
                    {voucher.product_title}
                    {voucher.unit_full_path ? (
                      <div className={styles.muted}>{voucher.unit_full_path}</div>
                    ) : null}
                  </td>
                  <td>{unitLabel}</td>
                  <td>{faNum(voucher.quantity)}</td>
                  <td>
                    {faNum(voucher.root_quantity ?? 0)}{' '}
                    {voucher.root_unit_abbr || voucher.root_unit_title || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {voucher.description ? (
            <div className={styles.notes}>
              <strong>توضیحات: </strong>
              {voucher.description}
            </div>
          ) : (
            <div className={styles.notes}>
              <strong>توضیحات: </strong>
              —
            </div>
          )}

          <div className={styles.signs}>
            <div className={styles.signBox}>
              <strong>انباردار / ثبت‌کننده</strong>
              {voucher.created_by_name || 'نام و امضا'}
            </div>
            <div className={styles.signBox}>
              <strong>فرد مجاز (مجوز خروج)</strong>
              {authName}
            </div>
            <div className={styles.signBox}>
              <strong>تحویل‌گیرنده</strong>
              نام و امضا
            </div>
          </div>

          <p className={styles.footerNote}>
            این حواله صرفاً برای خروج کالا از انبار «{voucher.warehouse_title || '—'}»
            با مجوز «{authName}» صادر شده است.
          </p>
        </article>
      </div>
    </div>
  )
}
