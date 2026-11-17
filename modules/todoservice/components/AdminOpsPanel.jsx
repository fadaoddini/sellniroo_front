'use client'

import React, { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { formatJalaliDate, formatJalaliShort } from '@/utils/dateUtils'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
)

const STATUS_FA = {
  draft: 'پیش‌نویس',
  awaiting_deposit: 'منتظر بیعانه',
  booked: 'رزرو',
  assigned: 'اعزام',
  visited: 'بازدید',
  awaiting_mid: 'منتظر برآورد',
  mid_paid: 'برآورد پرداخت',
  in_progress: 'در حال تعمیر',
  awaiting_final: 'منتظر تسویه',
  completed: 'تکمیل',
  canceled: 'لغو',
}

const CHART_COLORS = [
  '#1e3b2f',
  '#0f766e',
  '#ca8a04',
  '#b91c1c',
  '#1d4ed8',
  '#7c3aed',
  '#c2410c',
  '#166534',
  '#334155',
  '#be185d',
]

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function shamsiDay(value) {
  if (!value) return '—'
  const day = String(value).slice(0, 10)
  return formatJalaliDate(day) || formatJalaliShort(day) || day
}

function ReminderRows({ rows, emptyText, overdue = false }) {
  if (!rows.length) {
    return <p className={styles.opsEmpty}>{emptyText}</p>
  }
  return (
    <div className={styles.opsPayList}>
      {rows.map((r) => {
        const delta = Number(r.days_delta)
        const delay =
          Number.isFinite(delta) && delta !== 0
            ? `${Math.abs(delta).toLocaleString('fa-IR')} روز`
            : overdue
              ? 'امروز گذشته'
              : 'امروز'
        const resp = r.service_response || ''
        const respLabel =
          r.service_response_label ||
          (resp === 'accepted'
            ? 'تایید'
            : resp === 'declined'
              ? 'رد'
              : overdue
                ? 'منتظر پاسخ'
                : '—')
        const deviceBits = [r.brand, r.model].filter(Boolean).join(' ')
        return (
          <div
            key={r.id}
            className={`${styles.opsRemRow} ${
              overdue ? styles.opsRemRowOverdue : styles.opsRemRowOk
            }`}
          >
            <span
              className={`${styles.opsRemBadge} ${
                overdue ? styles.opsRemBadgeBad : styles.opsRemBadgeOk
              }`}
            >
              {overdue ? 'گذشته' : 'در راه'}
            </span>
            <div className={styles.opsPayMain}>
              <strong>{r.customer_name || '—'}</strong>
              {r.customer_mobile ? (
                <>
                  <span className={styles.opsPayDot}>·</span>
                  <span dir="ltr">{r.customer_mobile}</span>
                </>
              ) : null}
              <span className={styles.opsPayDot}>·</span>
              <span className={styles.opsRemDevice}>
                {r.title || r.device_title || 'دستگاه'}
                {deviceBits ? ` (${deviceBits})` : ''}
              </span>
              <span className={styles.opsPayDot}>·</span>
              <span>{shamsiDay(r.next_service_at || r.due_date)}</span>
            </div>
            <span
              className={`${styles.opsPayStatus} ${
                overdue ? styles.opsPayStatusBad : styles.opsPayStatusPend
              }`}
            >
              {overdue ? `تأخیر ${delay}` : `مانده ${delay}`}
            </span>
            <span
              className={`${styles.opsPayStatus} ${
                resp === 'accepted'
                  ? styles.opsPayStatusOk
                  : resp === 'declined'
                    ? styles.opsPayStatusBad
                    : overdue
                      ? styles.opsPayStatusPend
                      : ''
              }`}
            >
              {respLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const REMINDER_DAY_OPTIONS = [
  { value: 10, label: '۱۰ روز' },
  { value: 30, label: '۳۰ روز' },
  { value: 60, label: '۶۰ روز' },
]

function RemindersSection({ reminders, reminderDays, setReminderDays, busy }) {
  const overdue = useMemo(() => {
    if (Array.isArray(reminders?.overdue)) return reminders.overdue
    return []
  }, [reminders])
  const upcoming = useMemo(() => {
    if (Array.isArray(reminders?.upcoming)) return reminders.upcoming
    if (Array.isArray(reminders)) return reminders
    if (Array.isArray(reminders?.items)) return reminders.items
    return []
  }, [reminders])
  const counts = reminders?.counts || {
    overdue: overdue.length,
    upcoming: upcoming.length,
  }
  const withinDays = Number(reminderDays || reminders?.within_days || 30)

  return (
    <section className={styles.section}>
      <div className={styles.opsRemToolbar}>
        <div className={styles.opsRemToolbarStats}>
          <span className={`${styles.opsPayStatus} ${styles.opsPayStatusBad}`}>
            گذشته{' '}
            <strong>
              {Number(counts.overdue || 0).toLocaleString('fa-IR')}
            </strong>
          </span>
          <span className={`${styles.opsPayStatus} ${styles.opsPayStatusOk}`}>
            در راه{' '}
            <strong>
              {Number(counts.upcoming || 0).toLocaleString('fa-IR')}
            </strong>
          </span>
        </div>
        <div
          className={styles.opsRemRange}
          role="group"
          aria-label="بازه در راه"
        >
          {REMINDER_DAY_OPTIONS.map((opt) => {
            const on = Number(withinDays) === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.opsRemRangeBtn} ${
                  on ? styles.opsRemRangeBtnOn : ''
                }`}
                disabled={busy}
                aria-pressed={on}
                onClick={() => {
                  if (!on) setReminderDays?.(opt.value)
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.opsRemBlock}>
        <div className={styles.opsRemBlockHead}>
          <span className={styles.opsRemBlockTitleBad}>سررسید گذشته</span>
        </div>
        <ReminderRows
          rows={overdue}
          overdue
          emptyText="سررسید گذشته‌ای ثبت نشده است."
        />
      </div>

      <div className={styles.opsRemBlock}>
        <div className={styles.opsRemBlockHead}>
          <span className={styles.opsRemBlockTitleOk}>
            در راه — {Number(withinDays).toLocaleString('fa-IR')} روز
          </span>
        </div>
        <ReminderRows
          rows={upcoming}
          emptyText={`در ${Number(withinDays).toLocaleString('fa-IR')} روز آینده موعدی نیست.`}
        />
      </div>
    </section>
  )
}

function OpsStatsSection({ accounting }) {
  const summary = accounting?.summary || {}
  const pnl = accounting?.pnl || {}
  const byStatus = Array.isArray(accounting?.by_status)
    ? accounting.by_status
    : []
  const byMethod = Array.isArray(accounting?.by_payment_method)
    ? accounting.by_payment_method
    : []

  const statusChart = useMemo(() => {
    const labels = byStatus.map(
      (r) => STATUS_FA[r.status] || r.status_label || r.status || '—',
    )
    const values = byStatus.map((r) => Number(r.c || r.count || 0))
    return {
      labels: labels.length ? labels : ['بدون داده'],
      datasets: [
        {
          data: labels.length ? values : [1],
          backgroundColor: labels.length
            ? CHART_COLORS.slice(0, labels.length)
            : ['#e5e7eb'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }
  }, [byStatus])

  const methodChart = useMemo(() => {
    const labels = byMethod.map(
      (r) => r.method_label || r.method || '—',
    )
    const values = byMethod.map((r) => Number(r.amount || 0))
    return {
      labels: labels.length ? labels : ['بدون داده'],
      datasets: [
        {
          data: labels.length ? values : [1],
          backgroundColor: labels.length
            ? ['#0f766e', '#ca8a04', '#1d4ed8', '#b91c1c'].slice(
                0,
                Math.max(labels.length, 1),
              )
            : ['#e5e7eb'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }
  }, [byMethod])

  const financeChart = useMemo(() => {
    const revenue = Number(pnl.revenue ?? summary.revenue ?? 0)
    const expenses = Number(pnl.expenses ?? summary.expenses ?? 0)
    const receivables = Number(pnl.receivables ?? summary.receivables ?? 0)
    return {
      labels: ['درآمد', 'هزینه', 'مطالبات'],
      datasets: [
        {
          label: 'مبلغ (تومان)',
          data: [revenue, expenses, receivables],
          backgroundColor: ['#166534', '#b91c1c', '#ca8a04'],
          borderRadius: 8,
          maxBarThickness: 42,
        },
      ],
    }
  }, [pnl, summary])

  const doughnutOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            padding: 10,
            font: { size: 11, family: 'iran', weight: '400' },
            color: '#4a524c',
          },
        },
        tooltip: {
          titleFont: { family: 'iran_bold', size: 12, weight: '700' },
          bodyFont: { family: 'iran', size: 11, weight: '400' },
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.raw || 0)
              return ` ${ctx.label}: ${v.toLocaleString('fa-IR')}`
            },
          },
        },
      },
      cutout: '62%',
    }),
    [],
  )

  const barOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: 'iran_bold', size: 12, weight: '700' },
          bodyFont: { family: 'iran', size: 11, weight: '400' },
          callbacks: {
            label: (ctx) =>
              ` ${Number(ctx.raw || 0).toLocaleString('fa-IR')} ت`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11, family: 'iran', weight: '400' },
            color: '#5c655f',
          },
        },
        y: {
          grid: { color: 'rgba(30,59,47,0.08)' },
          ticks: {
            font: { size: 10, family: 'iran', weight: '400' },
            color: '#6b716c',
            callback: (v) => Number(v).toLocaleString('fa-IR'),
          },
        },
      },
    }),
    [],
  )

  const widgets = [
    {
      key: 'revenue',
      label: 'درآمد',
      value: money(summary.revenue ?? pnl.revenue),
      tone: 'ok',
      hint: 'پرداخت‌های تاییدشده',
    },
    {
      key: 'expenses',
      label: 'هزینه',
      value: money(summary.expenses ?? pnl.expenses),
      tone: 'bad',
      hint: 'هزینه‌های ثبت‌شده',
    },
    {
      key: 'net',
      label: 'سود خالص',
      value: money(summary.net ?? pnl.net),
      tone: Number(summary.net ?? pnl.net ?? 0) >= 0 ? 'ok' : 'bad',
      hint: 'درآمد منهای هزینه',
    },
    {
      key: 'receivables',
      label: 'مطالبات',
      value: money(summary.receivables ?? pnl.receivables),
      tone: 'warn',
      hint: 'بدهی باز مشتریان',
    },
    {
      key: 'receipts',
      label: 'رسید منتظر',
      value: Number(summary.pending_receipts || 0).toLocaleString('fa-IR'),
      tone: 'warn',
      hint: 'کارت‌به‌کارت در انتظار',
    },
    {
      key: 'reminders',
      label: 'یادآور سررسید',
      value: Number(summary.due_reminders || 0).toLocaleString('fa-IR'),
      tone: 'info',
      hint: 'موعد سرویس رسیده',
    },
  ]

  if (!accounting) {
    return (
      <section className={styles.section}>
        <p className={styles.opsEmpty}>آمار هنوز بارگذاری نشده است.</p>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.opsStatsSection}`}>
      <div className={styles.opsStatsCharts}>
        <article className={styles.opsChartCard}>
          <header className={styles.opsChartHead}>
            <h4>وضعیت سفارش‌ها</h4>
            <span>
              {Number(summary.jobs_total || 0).toLocaleString('fa-IR')} کل
            </span>
          </header>
          <div className={styles.opsChartBody}>
            <Doughnut data={statusChart} options={doughnutOpts} />
          </div>
        </article>

        <article className={styles.opsChartCard}>
          <header className={styles.opsChartHead}>
            <h4>روش پرداخت</h4>
            <span>مبالغ تاییدشده</span>
          </header>
          <div className={styles.opsChartBody}>
            <Doughnut data={methodChart} options={doughnutOpts} />
          </div>
        </article>

        <article className={styles.opsChartCard}>
          <header className={styles.opsChartHead}>
            <h4>درآمد و هزینه</h4>
            <span>تومان</span>
          </header>
          <div className={styles.opsChartBody}>
            <Bar data={financeChart} options={barOpts} />
          </div>
        </article>
      </div>

      <div className={styles.opsStatsWidgets}>
        {widgets.map((w) => (
          <article
            key={w.key}
            className={`${styles.opsStatWidget} ${
              w.tone === 'ok'
                ? styles.opsStatWidgetOk
                : w.tone === 'bad'
                  ? styles.opsStatWidgetBad
                  : w.tone === 'warn'
                    ? styles.opsStatWidgetWarn
                    : styles.opsStatWidgetInfo
            }`}
          >
            <span className={styles.opsStatLabel}>{w.label}</span>
            <strong className={styles.opsStatValue}>{w.value}</strong>
            <span className={styles.opsStatHint}>{w.hint}</span>
          </article>
        ))}
      </div>

      <div className={styles.opsStatsMini}>
        <span>
          سفارش باز{' '}
          <strong>
            {Number(summary.jobs_open || 0).toLocaleString('fa-IR')}
          </strong>
        </span>
        <span>
          در جریان{' '}
          <strong>
            {Number(summary.jobs_in_progress || 0).toLocaleString('fa-IR')}
          </strong>
        </span>
        <span>
          تکمیل{' '}
          <strong>
            {Number(summary.jobs_completed || 0).toLocaleString('fa-IR')}
          </strong>
        </span>
        <span>
          پیشنهاد منتظر{' '}
          <strong>
            {Number(summary.pending_proposals || 0).toLocaleString('fa-IR')}
          </strong>
        </span>
      </div>
    </section>
  )
}

const OPS_TABS = [
  { id: 'payments', label: 'تایید رسید' },
  { id: 'proposals', label: 'پیشنهادها' },
  { id: 'technicians', label: 'سرویسکارها' },
  { id: 'rates', label: 'اجرت‌ها' },
  { id: 'parts', label: 'قطعات' },
  { id: 'reminders', label: 'یادآورها' },
  { id: 'settings', label: 'تنظیمات' },
  { id: 'accounting', label: 'آمار' },
]

export default function AdminOpsPanel() {
  const {
    role,
    payments,
    proposals,
    technicians,
    rates,
    parts,
    settings,
    setSettings,
    reminders,
    reminderDays,
    setReminderDays,
    accounting,
    payFilter,
    propFilter,
    busy,
    confirmPayment,
    cancelProposal,
    reloadPayments,
    reloadProposals,
    updateSettings,
    techForm,
    setTechForm,
    editingTech,
    setEditingTech,
    saveTechnician,
    deleteTechnician,
    linkTechnicianByMobile,
    rateForm,
    setRateForm,
    editingRate,
    setEditingRate,
    saveLaborRate,
    deleteLaborRate,
    partForm,
    setPartForm,
    editingPart,
    setEditingPart,
    savePart,
    deletePart,
  } = useTodoService()

  const [opsTab, setOpsTab] = useState('payments')
  const [receiptPreview, setReceiptPreview] = useState(null)
  // { url, jobCode, amount }

  if (role !== 'admin') {
    return (
      <div className={styles.emptyBoard}>
        این بخش فقط برای مدیر سرویس در دسترس است.
      </div>
    )
  }

  return (
    <div className={styles.opsLayout}>
      <div className={styles.opsTabs}>
        {OPS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.filterBtn} ${opsTab === t.id ? styles.filterActive : ''}`}
            onClick={() => setOpsTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {opsTab === 'payments' ? (
        <section className={styles.section}>
          <div className={styles.filters}>
            {['pending', 'paid', 'rejected', ''].map((st) => (
              <button
                key={st || 'all'}
                type="button"
                className={`${styles.filterBtn} ${
                  payFilter === st ? styles.filterActive : ''
                }`}
                onClick={() => reloadPayments(st)}
              >
                {st === 'pending'
                  ? 'منتظر تایید'
                  : st === 'paid'
                    ? 'تایید شده'
                    : st === 'rejected'
                      ? 'رد شده'
                      : 'همه'}
              </button>
            ))}
          </div>

          <div className={styles.opsPayList}>
            {payments.length ? (
              payments.map((p) => {
                const receiptUrl = p.receipt_url || ''
                const canReview =
                  p.status === 'pending' && p.method === 'card_transfer'
                return (
                  <div key={p.id} className={styles.opsPayRow}>
                    {receiptUrl ? (
                      <button
                        type="button"
                        className={styles.opsReceiptThumbBtn}
                        title="مشاهده رسید"
                        onClick={() =>
                          setReceiptPreview({
                            url: receiptUrl,
                            jobCode: p.job_code || p.job || '',
                            amount: p.amount,
                            refId: p.ref_id || '',
                          })
                        }
                      >
                        <img
                          src={receiptUrl}
                          alt=""
                          className={styles.opsReceiptThumb}
                        />
                      </button>
                    ) : (
                      <span className={styles.opsReceiptEmpty} aria-hidden>
                        —
                      </span>
                    )}

                    <div className={styles.opsPayMain}>
                      <strong>{p.job_code || p.job || '—'}</strong>
                      <span className={styles.opsPayDot}>·</span>
                      <span className={styles.opsPayAmount}>
                        {money(p.amount)} ت
                      </span>
                      <span className={styles.opsPayDot}>·</span>
                      <span>{p.method_label || p.method || '—'}</span>
                      {p.ref_id ? (
                        <>
                          <span className={styles.opsPayDot}>·</span>
                          <span className={styles.opsPayRef} dir="ltr">
                            {p.ref_id}
                          </span>
                        </>
                      ) : null}
                    </div>

                    <span
                      className={`${styles.opsPayStatus} ${
                        p.status === 'pending'
                          ? styles.opsPayStatusPend
                          : p.status === 'paid'
                            ? styles.opsPayStatusOk
                            : p.status === 'rejected'
                              ? styles.opsPayStatusBad
                              : ''
                      }`}
                    >
                      {p.status_label || p.status}
                    </span>

                    <div className={styles.opsPayActions}>
                      {receiptUrl ? (
                        <button
                          type="button"
                          className={styles.opsPayLinkBtn}
                          onClick={() =>
                            setReceiptPreview({
                              url: receiptUrl,
                              jobCode: p.job_code || p.job || '',
                              amount: p.amount,
                              refId: p.ref_id || '',
                            })
                          }
                        >
                          رسید
                        </button>
                      ) : null}
                      {canReview ? (
                        <>
                          <button
                            type="button"
                            className={styles.opsPayOkBtn}
                            disabled={busy}
                            onClick={() => confirmPayment(p.id, 'approve')}
                          >
                            تایید
                          </button>
                          <button
                            type="button"
                            className={styles.opsPayBadBtn}
                            disabled={busy}
                            onClick={() => confirmPayment(p.id, 'reject')}
                          >
                            رد
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className={styles.opsEmpty}>رسیدی برای نمایش نیست.</p>
            )}
          </div>

          {receiptPreview ? (
            <div
              className={styles.opsReceiptOverlay}
              onClick={() => setReceiptPreview(null)}
              role="presentation"
            >
              <div
                className={styles.opsReceiptModal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="مشاهده رسید"
              >
                <header className={styles.opsReceiptModalHead}>
                  <div>
                    <strong>
                      رسید {receiptPreview.jobCode || 'واریز'}
                    </strong>
                    <span>
                      {money(receiptPreview.amount)} تومان
                      {receiptPreview.refId
                        ? ` · ${receiptPreview.refId}`
                        : ''}
                    </span>
                  </div>
                  <div className={styles.opsReceiptModalActions}>
                    <a
                      href={receiptPreview.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.opsPayLinkBtn}
                    >
                      تب جدید
                    </a>
                    <button
                      type="button"
                      className={styles.opsPayLinkBtn}
                      onClick={() => setReceiptPreview(null)}
                    >
                      بستن
                    </button>
                  </div>
                </header>
                <div className={styles.opsReceiptModalBody}>
                  <img src={receiptPreview.url} alt="رسید واریز" />
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {opsTab === 'proposals' ? (
        <section className={styles.section}>
          <div className={styles.filters}>
            {['pending', 'approved', 'canceled', ''].map((st) => (
              <button
                key={st || 'all'}
                type="button"
                className={`${styles.filterBtn} ${
                  propFilter === st ? styles.filterActive : ''
                }`}
                onClick={() => reloadProposals(st)}
              >
                {st === 'pending'
                  ? 'باز'
                  : st === 'approved'
                    ? 'تایید'
                    : st === 'canceled'
                      ? 'لغو'
                      : 'همه'}
              </button>
            ))}
          </div>

          <div className={styles.opsPayList}>
            {proposals.length ? (
              proposals.map((p) => {
                const isShop =
                  p.proposal_type === 'shop_product' ||
                  (p.type_label || '').includes('فروشگاه')
                return (
                  <div key={p.id} className={styles.opsPropRow}>
                    <span
                      className={`${styles.opsPropType} ${
                        isShop ? styles.opsPropTypeShop : styles.opsPropTypePay
                      }`}
                    >
                      {p.type_label || (isShop ? 'فروشگاه' : 'پرداخت')}
                    </span>

                    <div className={styles.opsPayMain}>
                      <strong className={styles.opsPropTitle}>
                        {p.title || '—'}
                      </strong>
                      {p.job_code ? (
                        <>
                          <span className={styles.opsPayDot}>·</span>
                          <span>{p.job_code}</span>
                        </>
                      ) : null}
                      <span className={styles.opsPayDot}>·</span>
                      <span className={styles.opsPayAmount}>
                        {money(p.amount)} ت
                      </span>
                    </div>

                    <span
                      className={`${styles.opsPayStatus} ${
                        p.status === 'pending'
                          ? styles.opsPayStatusPend
                          : p.status === 'approved' ||
                              p.status === 'purchased' ||
                              p.status === 'paid'
                            ? styles.opsPayStatusOk
                            : p.status === 'canceled' || p.status === 'rejected'
                              ? styles.opsPayStatusBad
                              : ''
                      }`}
                    >
                      {p.status_label || p.status}
                    </span>

                    <div className={styles.opsPayActions}>
                      {p.status === 'pending' ? (
                        <button
                          type="button"
                          className={styles.opsPayBadBtn}
                          disabled={busy}
                          onClick={() => cancelProposal(p.id)}
                        >
                          لغو
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className={styles.opsEmpty}>پیشنهادی برای نمایش نیست.</p>
            )}
          </div>
        </section>
      ) : null}

      {opsTab === 'technicians' ? (
        <section className={styles.section}>
          <div className={styles.opsTechForm}>
            <input
              className={styles.opsTechInput}
              placeholder="نام"
              value={techForm.name}
              onChange={(e) =>
                setTechForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className={styles.opsTechInput}
              placeholder="موبایل"
              dir="ltr"
              value={techForm.mobile}
              onChange={(e) =>
                setTechForm((f) => ({ ...f, mobile: e.target.value }))
              }
            />
            <input
              className={styles.opsTechInput}
              placeholder="شهر"
              value={techForm.city}
              onChange={(e) =>
                setTechForm((f) => ({ ...f, city: e.target.value }))
              }
            />
            <input
              className={styles.opsTechInput}
              placeholder="تخصص"
              value={techForm.specialty}
              onChange={(e) =>
                setTechForm((f) => ({ ...f, specialty: e.target.value }))
              }
            />
            <button
              type="button"
              className={styles.opsPayOkBtn}
              disabled={busy}
              onClick={saveTechnician}
            >
              {editingTech ? 'ذخیره' : 'افزودن'}
            </button>
            {editingTech ? (
              <button
                type="button"
                className={styles.opsPayLinkBtn}
                onClick={() => {
                  setEditingTech(null)
                  setTechForm({
                    name: '',
                    mobile: '',
                    city: '',
                    specialty: '',
                    is_active: true,
                    sort_order: 0,
                    user_id: null,
                  })
                }}
              >
                انصراف
              </button>
            ) : null}
          </div>

          <div className={styles.opsPayList}>
            {technicians.length ? (
              technicians.map((t) => {
                const initial = (t.name || 'س').trim().charAt(0)
                const linked = !!(t.user_id || t.user)
                return (
                  <div key={t.id} className={styles.opsTechRow}>
                    <span
                      className={`${styles.opsTechAvatar} ${
                        t.is_active === false ? styles.opsTechAvatarOff : ''
                      }`}
                      aria-hidden
                    >
                      {initial}
                    </span>
                    <div className={styles.opsPayMain}>
                      <strong>{t.name || '—'}</strong>
                      {t.mobile ? (
                        <>
                          <span className={styles.opsPayDot}>·</span>
                          <span dir="ltr">{t.mobile}</span>
                        </>
                      ) : null}
                      {t.city ? (
                        <>
                          <span className={styles.opsPayDot}>·</span>
                          <span>{t.city}</span>
                        </>
                      ) : null}
                      {t.specialty ? (
                        <>
                          <span className={styles.opsPayDot}>·</span>
                          <span className={styles.opsTechSpec}>
                            {t.specialty}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <span
                      className={`${styles.opsPayStatus} ${
                        t.is_active === false
                          ? styles.opsPayStatusBad
                          : styles.opsPayStatusOk
                      }`}
                    >
                      {t.is_active === false ? 'غیرفعال' : 'فعال'}
                    </span>
                    <span
                      className={`${styles.opsTechLinkBadge} ${
                        linked ? styles.opsTechLinkOk : styles.opsTechLinkNo
                      }`}
                    >
                      {linked ? 'متصل' : 'بدون حساب'}
                    </span>
                    <div className={styles.opsPayActions}>
                      <button
                        type="button"
                        className={styles.opsPayLinkBtn}
                        disabled={busy}
                        onClick={() => {
                          setEditingTech(t.id)
                          setTechForm({
                            name: t.name || '',
                            mobile: t.mobile || '',
                            city: t.city || '',
                            specialty: t.specialty || '',
                            is_active: t.is_active !== false,
                            sort_order: t.sort_order || 0,
                            user_id: t.user_id || null,
                          })
                        }}
                      >
                        ویرایش
                      </button>
                      {!linked ? (
                        <button
                          type="button"
                          className={styles.opsPayOkBtn}
                          disabled={busy}
                          onClick={() => linkTechnicianByMobile(t.id)}
                        >
                          وصل حساب
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={styles.opsPayBadBtn}
                        disabled={busy}
                        onClick={() => deleteTechnician(t.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className={styles.opsEmpty}>سرویسکاری ثبت نشده است.</p>
            )}
          </div>
        </section>
      ) : null}

      {opsTab === 'rates' ? (
        <section className={styles.section}>
          <div className={styles.opsTechForm}>
            <input
              className={styles.opsTechInput}
              placeholder="عنوان اجرت"
              value={rateForm.title || ''}
              onChange={(e) =>
                setRateForm((f) => ({ ...f, title: e.target.value }))
              }
            />
            <input
              className={styles.opsTechInput}
              placeholder="کد"
              dir="ltr"
              value={rateForm.code || ''}
              onChange={(e) =>
                setRateForm((f) => ({ ...f, code: e.target.value }))
              }
            />
            <input
              className={`${styles.opsTechInput} ${styles.opsRatePriceInput}`}
              placeholder="قیمت"
              type="number"
              dir="ltr"
              value={rateForm.price ?? ''}
              onChange={(e) =>
                setRateForm((f) => ({ ...f, price: e.target.value }))
              }
            />
            <button
              type="button"
              className={styles.opsPayOkBtn}
              disabled={busy}
              onClick={saveLaborRate}
            >
              {editingRate ? 'ذخیره' : 'افزودن'}
            </button>
            {editingRate ? (
              <button
                type="button"
                className={styles.opsPayLinkBtn}
                onClick={() => {
                  setEditingRate(null)
                  setRateForm({
                    title: '',
                    code: '',
                    unit: 'fixed',
                    price: 0,
                    description: '',
                    is_active: true,
                  })
                }}
              >
                انصراف
              </button>
            ) : null}
          </div>

          <div className={styles.opsPayList}>
            {rates.length ? (
              rates.map((r) => (
                <div key={r.id} className={styles.opsRateRow}>
                  <span className={styles.opsRateBadge} aria-hidden>
                    اجرت
                  </span>
                  <div className={styles.opsPayMain}>
                    <strong>{r.title || '—'}</strong>
                    {r.code ? (
                      <>
                        <span className={styles.opsPayDot}>·</span>
                        <span className={styles.opsRateCode} dir="ltr">
                          {r.code}
                        </span>
                      </>
                    ) : null}
                    <span className={styles.opsPayDot}>·</span>
                    <span className={styles.opsPayAmount}>
                      {money(r.price)} ت
                    </span>
                    {r.unit && r.unit !== 'fixed' ? (
                      <>
                        <span className={styles.opsPayDot}>·</span>
                        <span>{r.unit_label || r.unit}</span>
                      </>
                    ) : null}
                  </div>
                  <span
                    className={`${styles.opsPayStatus} ${
                      r.is_active === false
                        ? styles.opsPayStatusBad
                        : styles.opsPayStatusOk
                    }`}
                  >
                    {r.is_active === false ? 'غیرفعال' : 'فعال'}
                  </span>
                  <div className={styles.opsPayActions}>
                    <button
                      type="button"
                      className={styles.opsPayLinkBtn}
                      disabled={busy}
                      onClick={() => {
                        setEditingRate(r.id)
                        setRateForm({
                          title: r.title || '',
                          code: r.code || '',
                          unit: r.unit || 'fixed',
                          price: r.price ?? 0,
                          description: r.description || '',
                          is_active: r.is_active !== false,
                        })
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className={styles.opsPayBadBtn}
                      disabled={busy}
                      onClick={() => deleteLaborRate(r.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.opsEmpty}>اجرتی ثبت نشده است.</p>
            )}
          </div>
        </section>
      ) : null}

      {opsTab === 'parts' ? (
        <section className={styles.section}>
          <div className={styles.opsTechForm}>
            <input
              className={styles.opsTechInput}
              placeholder="نام قطعه"
              value={partForm.name || ''}
              onChange={(e) =>
                setPartForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className={styles.opsTechInput}
              placeholder="SKU"
              dir="ltr"
              value={partForm.sku || ''}
              onChange={(e) =>
                setPartForm((f) => ({ ...f, sku: e.target.value }))
              }
            />
            <input
              className={`${styles.opsTechInput} ${styles.opsRatePriceInput}`}
              placeholder="قیمت واحد"
              type="number"
              dir="ltr"
              value={partForm.unit_price ?? ''}
              onChange={(e) =>
                setPartForm((f) => ({ ...f, unit_price: e.target.value }))
              }
            />
            <button
              type="button"
              className={styles.opsPayOkBtn}
              disabled={busy}
              onClick={savePart}
            >
              {editingPart ? 'ذخیره' : 'افزودن'}
            </button>
            {editingPart ? (
              <button
                type="button"
                className={styles.opsPayLinkBtn}
                onClick={() => {
                  setEditingPart(null)
                  setPartForm({
                    name: '',
                    sku: '',
                    unit_price: 0,
                    description: '',
                    is_active: true,
                  })
                }}
              >
                انصراف
              </button>
            ) : null}
          </div>

          <div className={styles.opsPayList}>
            {parts.length ? (
              parts.map((p) => (
                <div key={p.id} className={styles.opsPartRow}>
                  <span className={styles.opsPartBadge} aria-hidden>
                    قطعه
                  </span>
                  <div className={styles.opsPayMain}>
                    <strong>{p.name || '—'}</strong>
                    {p.sku ? (
                      <>
                        <span className={styles.opsPayDot}>·</span>
                        <span className={styles.opsRateCode} dir="ltr">
                          {p.sku}
                        </span>
                      </>
                    ) : null}
                    <span className={styles.opsPayDot}>·</span>
                    <span className={styles.opsPayAmount}>
                      {money(p.unit_price)} ت
                    </span>
                  </div>
                  <span
                    className={`${styles.opsPayStatus} ${
                      p.is_active === false
                        ? styles.opsPayStatusBad
                        : styles.opsPayStatusOk
                    }`}
                  >
                    {p.is_active === false ? 'غیرفعال' : 'فعال'}
                  </span>
                  <div className={styles.opsPayActions}>
                    <button
                      type="button"
                      className={styles.opsPayLinkBtn}
                      disabled={busy}
                      onClick={() => {
                        setEditingPart(p.id)
                        setPartForm({
                          name: p.name || '',
                          sku: p.sku || '',
                          unit_price: p.unit_price ?? 0,
                          description: p.description || '',
                          is_active: p.is_active !== false,
                        })
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className={styles.opsPayBadBtn}
                      disabled={busy}
                      onClick={() => deletePart(p.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.opsEmpty}>قطعه‌ای ثبت نشده است.</p>
            )}
          </div>
        </section>
      ) : null}

      {opsTab === 'reminders' ? (
        <RemindersSection
          reminders={reminders}
          reminderDays={reminderDays}
          setReminderDays={setReminderDays}
          busy={busy}
        />
      ) : null}

      {opsTab === 'settings' && settings ? (
        <section className={styles.section}>
          <h3>تنظیمات سرویس</h3>
          <div className={styles.formGroup}>
            <label>نام شرکت</label>
            <input
              value={settings.company_name || ''}
              onChange={(e) =>
                setSettings((s) => ({ ...s, company_name: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>شماره کارت واریز</label>
            <input
              dir="ltr"
              value={settings.card_number || ''}
              onChange={(e) =>
                setSettings((s) => ({ ...s, card_number: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>متن راهنمای مشتری</label>
            <textarea
              rows={3}
              value={settings.customer_note || ''}
              onChange={(e) =>
                setSettings((s) => ({ ...s, customer_note: e.target.value }))
              }
            />
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={busy}
            onClick={() => updateSettings(settings)}
          >
            ذخیره تنظیمات
          </button>
        </section>
      ) : null}

      {opsTab === 'accounting' ? (
        <OpsStatsSection accounting={accounting} />
      ) : null}
    </div>
  )
}
