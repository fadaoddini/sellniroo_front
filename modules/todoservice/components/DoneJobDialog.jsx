'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  Archive,
  ArchiveRestore,
  Bell,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import InvoicePrintButton, {
  canDownloadRepairInvoice,
} from '@/components/Repairs/InvoicePrintButton'
import TechRatingForm from '@/components/Repairs/TechRatingForm'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import {
  formatJalaliDate,
  formatJalaliShort,
  formatPersianDate,
  toPersianDate,
} from '@/utils/dateUtils'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

const DONE_STATUSES = new Set(['completed', 'canceled'])

export function isDoneJob(job) {
  return !!(job && DONE_STATUSES.has(job.status))
}

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function toDateInput(value) {
  if (!value) return ''
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  try {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

function shamsiLabel(value, withTime = false) {
  if (!value) return '—'
  const day = toDateInput(value)
  const datePart = formatJalaliDate(day) || formatJalaliShort(day) || day
  if (!withTime) return datePart
  try {
    const time = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
    return `${datePart} · ${time}`
  } catch {
    return datePart
  }
}

export default function DoneJobDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    rateTechnician,
    archiveJob,
    unarchiveJob,
    setWarranty,
    setServiceReminder,
  } = useTodoService()
  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [warrantyUntil, setWarrantyUntil] = useState('')
  const [archiveNote, setArchiveNote] = useState('')
  const [warrantyToast, setWarrantyToast] = useState(null)
  // { kind: 'active'|'cleared', dateLabel: string }
  const [nextServiceAt, setNextServiceAt] = useState('')
  const [serviceMonths, setServiceMonths] = useState('6')
  const [reminderToast, setReminderToast] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!job) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [job?.id])

  useEffect(() => {
    if (!job) return
    setWarrantyUntil(toDateInput(job.warranty_until))
    setArchiveNote(job.archive_note || '')
    setNextServiceAt(toDateInput(job.next_service_at))
    setServiceMonths(
      String(job.service_interval_months || 6),
    )
  }, [
    job?.id,
    job?.warranty_until,
    job?.archive_note,
    job?.next_service_at,
    job?.service_interval_months,
  ])

  const balanceDue = useMemo(() => {
    if (!job) return 0
    return Number(
      job.balance_due ??
        Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
    )
  }, [job])

  if (role !== 'admin' || !job || !isDoneJob(job) || !mounted) return null

  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'
  const isCanceled = job.status === 'canceled'
  const deferred = !!job.settlement_deferred
  const depositDeferredUnpaid =
    !!job.deposit_deferred && !job.deposit_paid
  const isArchived = !!(job.is_archived || job.archived_at)
  const hasWarranty = !!job.warranty_until
  const hasReminder = !!job.next_service_at
  const reminderStatus = job.service_reminder_status || (hasReminder ? 'upcoming' : 'none')
  const reminderShamsi = nextServiceAt
    ? formatPersianDate(toPersianDate(nextServiceAt), 'full')
    : ''
  const canArchive =
    job.can_manager_archive !== false &&
    !depositDeferredUnpaid &&
    balanceDue <= 0
  const archiveBlock =
    job.archive_block_reason ||
    (depositDeferredUnpaid
      ? 'بیعانه موکول‌شده هنوز پرداخت نشده — تا تسویه کامل، آرشیو ممکن نیست.'
      : balanceDue > 0
        ? `هنوز ${money(balanceDue)} تومان بدهی باقی است — فقط پرونده‌های پرداخت‌شده قابل آرشیو هستند.`
        : '')
  const deferredAmount = Number(
    job.final_amount ||
      job.invoice?.deferred_settlement_amount ||
      balanceDue ||
      0,
  )
  const warrantyShamsi = warrantyUntil
    ? formatPersianDate(toPersianDate(warrantyUntil), 'full')
    : ''

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={`${styles.modalCard} ${styles.doneModalCard}`}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="done-job-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پرونده پایان‌یافته</p>
            <h2 id="done-job-title">
              {job.code}
              <span
                className={`${styles.intakeBadge} ${
                  isCanceled ? styles.doneBadgeCancel : styles.doneBadgeOk
                }`}
              >
                {job.status_label || job.status}
              </span>
              {isArchived ? (
                <span className={styles.intakeBadge}>آرشیو</span>
              ) : null}
            </h2>
          </div>
          <button
            type="button"
            className={styles.intakeClose}
            onClick={closeJob}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <section
            className={`${styles.doneHero} ${
              isCanceled ? styles.doneHeroCancel : ''
            }`}
          >
            <span className={styles.doneHeroIcon}>
              <CheckCircle2 size={22} />
            </span>
            <div>
              <strong>
                {isCanceled ? 'این پرونده لغو شده است' : 'تعمیر با موفقیت تکمیل شد'}
              </strong>
              <p>
                {job.completed_at
                  ? `زمان ثبت: ${shamsiLabel(job.completed_at, true)}`
                  : 'خلاصه نهایی پرونده'}
              </p>
            </div>
          </section>

          {!isCanceled && deferred ? (
            <p className={styles.intakeHintWarn}>
              تسویه به بعد موکول شده — مبلغ باقیمانده:{' '}
              <strong>{money(deferredAmount)} تومان</strong>
            </p>
          ) : null}

          {!isCanceled && !deferred && balanceDue > 0 ? (
            <p className={styles.intakeHintWarn}>
              هنوز بدهی ثبت‌شده: <strong>{money(balanceDue)} تومان</strong>
            </p>
          ) : null}

          <article className={`${styles.intakeCard} ${styles.intakeCardSlim}`}>
            <div className={styles.intakeSlimRow}>
              <User size={13} className={styles.intakeSlimIcon} />
              <span className={styles.intakeSlimName}>
                {job.customer_name || '—'}
              </span>
              <span className={styles.intakeSlimDot}>·</span>
              <span className={styles.intakeSlimPhone} dir="ltr">
                <Phone size={11} />
                {job.customer_mobile || '—'}
              </span>
            </div>
            <div className={styles.intakeSlimRow}>
              <MapPin size={13} className={styles.intakeSlimIcon} />
              <span className={styles.intakeSlimAddr}>{addressLine}</span>
            </div>
          </article>

          <article
            className={`${styles.intakeCard} ${styles.intakeCardSlim} ${styles.intakeCardSlimGold}`}
          >
            <div className={styles.intakeSlimRow}>
              <Wrench size={13} className={styles.intakeSlimIconGold} />
              <span className={styles.intakeSlimLabel}>دستگاه</span>
              <span className={styles.intakeSlimValue}>
                {job.device_title || '—'}
              </span>
            </div>
            {job.technician_name ? (
              <div className={styles.intakeSlimRow}>
                <UserCog size={13} className={styles.intakeSlimIconGold} />
                <span className={styles.intakeSlimLabel}>سرویسکار</span>
                <span className={styles.intakeSlimValue}>
                  {job.technician_name}
                </span>
              </div>
            ) : null}
          </article>

          {job.tech_report ? (
            <section className={styles.intakeTechBlock}>
              <div className={styles.intakeCardHead}>
                <h3>گزارش نهایی</h3>
              </div>
              <p className={styles.doneReport}>{job.tech_report}</p>
            </section>
          ) : null}

          <section className={styles.techInvoiceBox}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <CreditCard size={14} />
              </span>
              <h3>فاکتور نهایی</h3>
            </div>
            <div className={styles.techMoneyChips}>
              <span>
                اجرت <strong>{money(job.labor_total)}</strong>
              </span>
              <span>
                قطعه <strong>{money(job.parts_total)}</strong>
              </span>
              <span>
                زمان <strong>{money(job.time_total)}</strong>
              </span>
              {Number(job.settlement_discount || 0) > 0 ? (
                <span>
                  رند/تخفیف{' '}
                  <strong>{money(job.settlement_discount)}</strong>
                </span>
              ) : null}
              <span>
                جمع <strong>{money(job.grand_total)}</strong>
              </span>
              <span>
                پرداخت‌شده <strong>{money(job.paid_total)}</strong>
              </span>
              <span>
                باقیمانده <strong>{money(balanceDue)}</strong>
              </span>
            </div>
          </section>

          {!isCanceled && job.technician ? (
            <TechRatingForm
              title="امتیاز مدیر به سرویسکار"
              subtitle={`${job.technician_name || 'سرویسکار'} — کیفیت، اخلاق، وقت‌شناسی و…`}
              existing={job.ratings?.manager || null}
              busy={busy}
              onSubmit={(payload) => rateTechnician(payload)}
            />
          ) : null}

          {job.ratings?.customer ? (
            <TechRatingForm
              title="امتیاز مشتری"
              subtitle="ثبت‌شده توسط مشتری"
              existing={job.ratings.customer}
            />
          ) : null}

          {!isCanceled ? (
            <section className={styles.doneArchiveBox}>
              <div className={styles.intakeCardHead}>
                <span className={styles.intakeCardIcon}>
                  <Bell size={14} />
                </span>
                <h3>یادآور سرویس دوره‌ای</h3>
              </div>
              <p className={styles.doneArchiveHint}>
                موعد سرویس بعدی را برای این دستگاه ثبت کنید تا در بخش یادآورها
                نمایش داده شود. می‌توانید تاریخ دقیق بگذارید یا از دورهٔ ماهانه
                استفاده کنید.
              </p>

              {!job.device ? (
                <p className={styles.intakeHintWarn}>
                  دستگاهی به این پرونده وصل نیست؛ یادآور قابل ثبت نیست.
                </p>
              ) : (
                <>
                  <div
                    className={`${styles.doneArchiveStatus} ${
                      hasReminder
                        ? reminderStatus === 'overdue'
                          ? styles.doneArchiveStatusBad
                          : styles.doneArchiveStatusOn
                        : styles.doneArchiveStatusOff
                    }`}
                  >
                    <span className={styles.doneArchiveStatusLabel}>
                      وضعیت یادآور
                    </span>
                    <strong className={styles.doneArchiveStatusValue}>
                      {hasReminder
                        ? shamsiLabel(job.next_service_at) ||
                          reminderShamsi ||
                          '—'
                        : 'ثبت نشده'}
                    </strong>
                    <span
                      className={`${styles.doneArchiveStatusBadge} ${
                        !hasReminder
                          ? styles.doneArchiveStatusBadgeOff
                          : reminderStatus === 'overdue'
                            ? styles.doneArchiveStatusBadgeBad
                            : ''
                      }`}
                    >
                      {!hasReminder
                        ? 'بدون موعد'
                        : reminderStatus === 'overdue'
                          ? 'سررسید گذشته'
                          : 'در راه'}
                    </span>
                  </div>

                  <div className={styles.doneArchiveFields}>
                    <label>
                      دوره سرویس (ماه)
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={serviceMonths}
                        onChange={(e) => setServiceMonths(e.target.value)}
                        placeholder="مثلاً ۶"
                        disabled={busy}
                      />
                    </label>
                    <label>
                      {hasReminder
                        ? 'تاریخ جدید موعد (شمسی)'
                        : 'تاریخ موعد سرویس (شمسی)'}
                      <PersianDatePicker
                        value={nextServiceAt}
                        onChange={(d) => setNextServiceAt(d || '')}
                        placeholder="انتخاب تاریخ شمسی"
                        disabled={busy}
                        zIndex={300100}
                      />
                    </label>
                  </div>

                  <div className={styles.reminderPresets}>
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={styles.reminderPresetBtn}
                        disabled={busy}
                        onClick={() => setServiceMonths(String(m))}
                      >
                        {m.toLocaleString('fa-IR')} ماه
                      </button>
                    ))}
                  </div>

                  <div className={styles.doneArchiveActions}>
                    <button
                      type="button"
                      className={styles.intakeBtnPrimary}
                      disabled={busy || !nextServiceAt}
                      title={
                        !nextServiceAt
                          ? 'ابتدا تاریخ شمسی را انتخاب کنید'
                          : hasReminder
                            ? 'به‌روزرسانی موعد یادآور'
                            : 'ثبت یادآور سرویس'
                      }
                      onClick={async () => {
                        if (!nextServiceAt) return
                        const dateLabel =
                          formatPersianDate(
                            toPersianDate(nextServiceAt),
                            'full',
                          ) || shamsiLabel(nextServiceAt)
                        const res = await setServiceReminder({
                          next_service_at: nextServiceAt,
                          service_interval_months:
                            Number(serviceMonths) || undefined,
                        })
                        if (!res?.success) return
                        setReminderToast({
                          kind: hasReminder ? 'updated' : 'active',
                          dateLabel,
                        })
                      }}
                    >
                      <Bell size={14} />
                      {hasReminder ? 'به‌روزرسانی یادآور' : 'ثبت یادآور'}
                    </button>
                    <button
                      type="button"
                      className={styles.intakeBtnGhost}
                      disabled={busy || !Number(serviceMonths)}
                      title="موعد را بر اساس دوره ماهانه از امروز حساب کن"
                      onClick={async () => {
                        const months = Number(serviceMonths) || 6
                        const res = await setServiceReminder({
                          service_interval_months: months,
                          schedule_from_interval: true,
                        })
                        if (!res?.success) return
                        const due = res.data?.next_service_at
                        const dateLabel = due
                          ? formatPersianDate(toPersianDate(due), 'full') ||
                            shamsiLabel(due)
                          : `${months.toLocaleString('fa-IR')} ماه بعد`
                        setReminderToast({
                          kind: hasReminder ? 'updated' : 'active',
                          dateLabel,
                        })
                      }}
                    >
                      محاسبه با دورهٔ ماهانه
                    </button>
                    {hasReminder ? (
                      <button
                        type="button"
                        className={styles.doneArchiveDanger}
                        disabled={busy}
                        onClick={async () => {
                          const res = await setServiceReminder({
                            clear_reminder: true,
                          })
                          if (!res?.success) return
                          setNextServiceAt('')
                          setReminderToast({
                            kind: 'cleared',
                            dateLabel: '',
                          })
                        }}
                      >
                        حذف یادآور
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          ) : null}

          <section className={styles.doneArchiveBox}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <ShieldCheck size={14} />
              </span>
              <h3>گارانتی و آرشیو</h3>
            </div>
            <p className={styles.doneArchiveHint}>
              تاریخ را شمسی انتخاب کنید. بعد از فعال‌شدن می‌توانید تاریخ را
              به‌روز کنید یا گارانتی را غیرفعال کنید. آرشیو فقط برای
              پرونده‌های پرداخت‌شده است.
            </p>

            <div
              className={`${styles.doneArchiveStatus} ${
                hasWarranty
                  ? job.warranty_status === 'expired'
                    ? styles.doneArchiveStatusBad
                    : styles.doneArchiveStatusOn
                  : styles.doneArchiveStatusOff
              }`}
            >
              <span className={styles.doneArchiveStatusLabel}>وضعیت گارانتی</span>
              <strong className={styles.doneArchiveStatusValue}>
                {hasWarranty
                  ? shamsiLabel(job.warranty_until) || warrantyShamsi || '—'
                  : 'ثبت نشده'}
              </strong>
              <span
                className={`${styles.doneArchiveStatusBadge} ${
                  !hasWarranty
                    ? styles.doneArchiveStatusBadgeOff
                    : job.warranty_status === 'expired'
                      ? styles.doneArchiveStatusBadgeBad
                      : ''
                }`}
              >
                {!hasWarranty
                  ? 'غیرفعال'
                  : job.warranty_status === 'expired'
                    ? 'منقضی'
                    : 'فعال'}
              </span>
            </div>

            {!isArchived && !canArchive && archiveBlock ? (
              <p className={styles.intakeHintWarn}>{archiveBlock}</p>
            ) : null}
            {depositDeferredUnpaid ? (
              <p className={styles.intakeHintWarn}>
                این پرونده بیعانهٔ موکول‌شده دارد — تا پرداخت کامل، آرشیو در
                دسترس نیست.
              </p>
            ) : null}

            <div className={styles.doneArchiveFields}>
              <label>
                {hasWarranty
                  ? 'تاریخ جدید گارانتی (شمسی)'
                  : 'تاریخ پایان گارانتی (شمسی)'}
                <PersianDatePicker
                  value={warrantyUntil}
                  onChange={(d) => setWarrantyUntil(d || '')}
                  placeholder="انتخاب تاریخ شمسی"
                  disabled={busy}
                  zIndex={300100}
                />
              </label>
              <label>
                یادداشت آرشیو
                <input
                  value={archiveNote}
                  onChange={(e) => setArchiveNote(e.target.value)}
                  placeholder="مثلاً تحویل حضوری / گارانتی ۶ ماهه"
                  disabled={busy || (!canArchive && !isArchived)}
                />
              </label>
            </div>

            {isArchived && job.archived_at ? (
              <p className={styles.doneArchiveHint}>
                آرشیو شده در{' '}
                <strong>{shamsiLabel(job.archived_at, true)}</strong>
              </p>
            ) : null}

            <div className={styles.doneArchiveActions}>
              <button
                type="button"
                className={styles.intakeBtnPrimary}
                disabled={busy || !warrantyUntil}
                title={
                  !warrantyUntil
                    ? 'ابتدا تاریخ شمسی را انتخاب کنید'
                    : hasWarranty
                      ? 'به‌روزرسانی تاریخ گارانتی فعال'
                      : 'فعال‌سازی گارانتی'
                }
                onClick={async () => {
                  if (!warrantyUntil) return
                  const dateLabel =
                    formatPersianDate(toPersianDate(warrantyUntil), 'full') ||
                    shamsiLabel(warrantyUntil)
                  const res = await setWarranty(warrantyUntil, false)
                  if (!res?.success) return
                  setWarrantyToast({
                    kind: hasWarranty ? 'updated' : 'active',
                    dateLabel,
                  })
                }}
              >
                <ShieldCheck size={14} />
                {hasWarranty ? 'به‌روزرسانی گارانتی' : 'فعال‌سازی گارانتی'}
              </button>
              {hasWarranty ? (
                <button
                  type="button"
                  className={styles.doneArchiveDanger}
                  disabled={busy}
                  onClick={async () => {
                    const res = await setWarranty(null, true)
                    if (!res?.success) return
                    setWarrantyUntil('')
                    setWarrantyToast({ kind: 'cleared', dateLabel: '' })
                  }}
                >
                  غیرفعال کردن گارانتی
                </button>
              ) : null}
              {isArchived ? (
                <button
                  type="button"
                  className={styles.intakeBtnGhost}
                  disabled={busy}
                  onClick={() => unarchiveJob()}
                >
                  <ArchiveRestore size={14} />
                  خروج از آرشیو
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.intakeBtnGhost}
                  disabled={busy || !canArchive}
                  title={!canArchive ? archiveBlock : 'آرشیو پرونده'}
                  onClick={() =>
                    archiveJob({
                      warranty_until: warrantyUntil || undefined,
                      note: archiveNote,
                    })
                  }
                >
                  <Archive size={14} />
                  آرشیو کردن
                </button>
              )}
            </div>
          </section>

          <div className={styles.doneActions}>
            {job.tracking_token ? (
              <Link
                href={`/repairs/track/${job.tracking_token}`}
                target="_blank"
                className={styles.fieldTrackLink}
              >
                <ExternalLink size={13} /> دید مشتری / پیگیری
              </Link>
            ) : null}
            {canDownloadRepairInvoice(job) ? (
              <InvoicePrintButton
                job={job}
                className={styles.donePrintLink}
                label="دانلود PDF فاکتور"
              />
            ) : null}
          </div>
        </div>

        <footer className={styles.modalFoot}>
          {canDownloadRepairInvoice(job) ? (
            <InvoicePrintButton
              job={job}
              className={styles.intakeBtnPrimary}
              label="دانلود PDF فاکتور"
            />
          ) : null}
          <button type="button" className={styles.intakeBtnGhost} onClick={closeJob}>
            بستن
          </button>
        </footer>
      </div>
    </div>
  )

  const warrantyOk = warrantyToast ? (
    <div
      className={styles.payAltOverlay}
      onClick={() => setWarrantyToast(null)}
      role="presentation"
    >
      <div
        className={`${styles.payAltCard} ${styles.payAltCardSuccess}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="warranty-ok-title"
      >
        <span
          className={`${styles.payAltIcon} ${styles.payAltIconSuccess}`}
          aria-hidden
        >
          <ShieldCheck size={20} />
        </span>
        <h3 id="warranty-ok-title" className={styles.payAltTitle}>
          {warrantyToast.kind === 'cleared'
            ? 'گارانتی غیرفعال شد'
            : warrantyToast.kind === 'updated'
              ? 'گارانتی به‌روز شد'
              : 'گارانتی فعال شد'}
        </h3>
        {warrantyToast.kind === 'cleared' ? (
          <p className={styles.payAltText}>
            گارانتی این پرونده غیرفعال شد و دیگر تاریخ پایان ندارد.
          </p>
        ) : (
          <>
            <p className={styles.payAltText}>
              {warrantyToast.kind === 'updated'
                ? 'تاریخ پایان گارانتی با موفقیت تغییر کرد.'
                : 'گارانتی این پرونده تا تاریخ زیر ثبت و فعال شد.'}
            </p>
            <span className={styles.payAltDateChip}>
              {warrantyToast.dateLabel}
            </span>
          </>
        )}
        <div className={styles.payAltActions}>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            onClick={() => setWarrantyToast(null)}
          >
            باشه
          </button>
        </div>
      </div>
    </div>
  ) : null

  const reminderOk = reminderToast ? (
    <div
      className={styles.payAltOverlay}
      onClick={() => setReminderToast(null)}
      role="presentation"
    >
      <div
        className={`${styles.payAltCard} ${styles.payAltCardSuccess}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-ok-title"
      >
        <span
          className={`${styles.payAltIcon} ${styles.payAltIconSuccess}`}
          aria-hidden
        >
          <Bell size={20} />
        </span>
        <h3 id="reminder-ok-title" className={styles.payAltTitle}>
          {reminderToast.kind === 'cleared'
            ? 'یادآور حذف شد'
            : reminderToast.kind === 'updated'
              ? 'یادآور به‌روز شد'
              : 'یادآور ثبت شد'}
        </h3>
        {reminderToast.kind === 'cleared' ? (
          <p className={styles.payAltText}>
            موعد سرویس دوره‌ای این دستگاه پاک شد.
          </p>
        ) : (
          <>
            <p className={styles.payAltText}>
              {reminderToast.kind === 'updated'
                ? 'تاریخ موعد سرویس با موفقیت تغییر کرد.'
                : 'یادآور سرویس دوره‌ای برای این دستگاه ثبت شد.'}
            </p>
            <span className={styles.payAltDateChip}>
              {reminderToast.dateLabel}
            </span>
          </>
        )}
        <div className={styles.payAltActions}>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            onClick={() => setReminderToast(null)}
          >
            باشه
          </button>
        </div>
      </div>
    </div>
  ) : null

  return createPortal(
    <>
      {dialog}
      {warrantyOk}
      {reminderOk}
    </>,
    document.body,
  )
}
