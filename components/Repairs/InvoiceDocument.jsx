'use client'

import React, { forwardRef } from 'react'
import styles from './InvoiceDocument.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function formatTehran(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

/**
 * سند فاکتور A4 — برای چاپ / ذخیره PDF
 */
const InvoiceDocument = forwardRef(function InvoiceDocument(
  { job, companyTitle = 'سرویس و تعمیرات' },
  ref,
) {
  if (!job) return null
  const inv = job.invoice || {}
  const balance = Number(
    inv.remaining ??
      job.balance_due ??
      Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
  )
  const labor = job.labor_lines || []
  const parts = job.part_lines || []
  const payments = (job.payments || []).filter((p) => p.status === 'paid')

  return (
    <div ref={ref} className={styles.sheet} dir="rtl">
      <header className={styles.head}>
        <div>
          <p className={styles.brand}>{companyTitle || inv.company_title}</p>
          <h1>فاکتور خدمات تعمیر</h1>
        </div>
        <div className={styles.headMeta}>
          <div>
            <span>کد پیگیری</span>
            <strong>{job.code}</strong>
          </div>
          <div>
            <span>تاریخ تکمیل</span>
            <strong>{formatTehran(job.completed_at || job.updated_at)}</strong>
          </div>
          <div>
            <span>وضعیت</span>
            <strong>{job.status_label || job.status}</strong>
          </div>
        </div>
      </header>

      <section className={styles.parties}>
        <div>
          <h2>مشتری</h2>
          <p>{job.customer_name || '—'}</p>
          <p dir="ltr">{job.customer_mobile || '—'}</p>
          <p>
            {[job.city, job.address].filter(Boolean).join(' — ') || '—'}
          </p>
        </div>
        <div>
          <h2>سرویس</h2>
          <p>دستگاه: {job.device_title || '—'}</p>
          <p>سرویسکار: {job.technician_name || '—'}</p>
          <p>درخواست: {job.customer_request || '—'}</p>
        </div>
      </section>

      {labor.length ? (
        <section className={styles.block}>
          <h2>اجرت‌ها</h2>
          <table>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>تعداد</th>
                <th>مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {labor.map((l) => (
                <tr key={l.id || l.title}>
                  <td>{l.title}</td>
                  <td>{money(l.quantity || 1)}</td>
                  <td>{money(l.amount ?? l.unit_price)} ت</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {parts.length ? (
        <section className={styles.block}>
          <h2>قطعات</h2>
          <table>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>تعداد</th>
                <th>مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id || p.title}>
                  <td>{p.title}</td>
                  <td>{money(p.quantity || 1)}</td>
                  <td>{money(p.amount ?? p.unit_price)} ت</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className={styles.totals}>
        <div>
          <span>جمع اجرت</span>
          <strong>{money(inv.labor_total ?? job.labor_total)} ت</strong>
        </div>
        <div>
          <span>جمع قطعات</span>
          <strong>{money(inv.parts_total ?? job.parts_total)} ت</strong>
        </div>
        <div>
          <span>
            هزینه زمان ({money(inv.labor_minutes ?? job.labor_minutes)} دقیقه)
          </span>
          <strong>{money(inv.time_total ?? job.time_total)} ت</strong>
        </div>
        {Number(job.settlement_discount || 0) > 0 ? (
          <div>
            <span>تخفیف / رند مدیر</span>
            <strong>{money(job.settlement_discount)} ت</strong>
          </div>
        ) : null}
        <div className={styles.totalStrong}>
          <span>جمع کل</span>
          <strong>{money(inv.grand_total ?? job.grand_total)} ت</strong>
        </div>
        <div>
          <span>پرداخت‌شده</span>
          <strong>{money(inv.paid_total ?? job.paid_total)} ت</strong>
        </div>
        <div className={styles.totalRemain}>
          <span>باقیمانده</span>
          <strong>{money(balance)} ت</strong>
        </div>
      </section>

      {job.tech_report ? (
        <section className={styles.block}>
          <h2>گزارش سرویسکار</h2>
          <p className={styles.report}>{job.tech_report}</p>
        </section>
      ) : null}

      {payments.length ? (
        <section className={styles.block}>
          <h2>پرداخت‌های تاییدشده</h2>
          <table>
            <thead>
              <tr>
                <th>موضوع</th>
                <th>مبلغ</th>
                <th>زمان</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.purpose_label || p.purpose || p.stage_label || p.stage}</td>
                  <td>{money(p.amount)} ت</td>
                  <td>{formatTehran(p.paid_at || p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <footer className={styles.foot}>
        <p>این سند به‌صورت الکترونیکی صادر شده و مبنای تسویه خدمات است.</p>
        <p>ساعت مبنا: Asia/Tehran</p>
      </footer>
    </div>
  )
})

export default InvoiceDocument
