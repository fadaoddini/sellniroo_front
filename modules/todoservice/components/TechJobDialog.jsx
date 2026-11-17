'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPin,
  Navigation,
  Phone,
  Play,
  Timer,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { FilterSelectTrigger } from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import MultiPickDialog from '@/components/Repairs/MultiPickDialog'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

const TEHRAN_OFFSET = '+03:30'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

/** زمان ذخیره‌شده را به‌عنوان ساعت تهران می‌خواند (نه UTC مرورگر). */
function parseTehranMs(value) {
  if (!value) return null
  const s = String(value).trim()
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) {
    const t = new Date(s).getTime()
    return Number.isNaN(t) ? null : t
  }
  const m = s.match(
    /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?/,
  )
  if (!m) {
    const t = new Date(s).getTime()
    return Number.isNaN(t) ? null : t
  }
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || '00'}${TEHRAN_OFFSET}`
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? null : t
}

function formatTehranClock(ms) {
  if (!ms) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(ms))
  } catch {
    return '—'
  }
}

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}

export default function TechJobDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    rates,
    parts,
    report,
    setReport,
    submitReport,
    markArrived,
    startWork,
    finishWork,
  } = useTodoService()

  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [picker, setPicker] = useState(null)
  const [nowTs, setNowTs] = useState(() => Date.now())

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
  }, [job])

  const timerActive =
    !!job?.work_started_at &&
    (job.status === 'in_progress' || job.status === 'mid_paid')

  useEffect(() => {
    if (!timerActive) return undefined
    const id = window.setInterval(() => setNowTs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [timerActive, job?.id, job?.work_started_at])

  const startedMs = useMemo(
    () => parseTehranMs(job?.work_started_at),
    [job?.work_started_at],
  )

  const elapsedSeconds = useMemo(() => {
    if (!startedMs) return 0
    return Math.max(0, Math.floor((nowTs - startedMs) / 1000))
  }, [startedMs, nowTs])

  const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60))
  const liveTimeCost = useMemo(() => {
    const rate = Number(job?.hourly_rate || 0)
    if (!rate || !elapsedMinutes) return 0
    return Math.round((elapsedMinutes / 60) * rate)
  }, [elapsedMinutes, job?.hourly_rate])

  const rateOptions = useMemo(
    () =>
      (rates || [])
        .filter((r) => r.is_active !== false)
        .map((r) => ({
          id: r.id,
          name: r.title,
          meta: `${r.unit === 'hourly' ? 'ساعتی' : 'ثابت'} · ${money(r.price)} ت`,
        })),
    [rates],
  )

  const partOptions = useMemo(
    () =>
      (parts || [])
        .filter((p) => p.is_active !== false)
        .map((p) => ({
          id: p.id,
          name: p.name,
          meta: `${p.sku || '—'} · ${money(p.unit_price)} ت`,
        })),
    [parts],
  )

  const selectedRates = (rates || []).filter((r) =>
    (report.labor_rate_ids || []).some((id) => String(id) === String(r.id)),
  )
  const selectedParts = (parts || []).filter((p) =>
    (report.part_ids || []).some((id) => String(id) === String(p.id)),
  )

  if (role !== 'tech' || !job || !mounted) return null

  const locked =
    job.status === 'completed' ||
    job.status === 'awaiting_final' ||
    job.status === 'canceled'
  const linesLocked = !!job.lines_locked
  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'
  const balanceDue = Number(
    job.balance_due ??
      Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
  )
  const canArrive = !!job.can_tech_arrive || job.status === 'assigned'
  const canStart = !!job.can_tech_start || job.status === 'visited'
  const workStarted = !!job.work_started_at || job.status === 'in_progress'
  const showReportTools = workStarted && !locked

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={`${styles.modalCard} ${styles.techModalCard}`}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tech-job-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پرونده سرویسکار</p>
            <h2 id="tech-job-title">
              {job.code}
              <span className={styles.intakeBadge}>
                {job.status_label || job.status}
              </span>
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
            <div className={styles.intakeSlimRow}>
              <span className={styles.intakeSlimLabel}>درخواست</span>
              <span
                className={styles.intakeSlimValue}
                title={job.customer_request || ''}
              >
                {job.customer_request || '—'}
              </span>
            </div>
          </article>

          {job.deposit_deferred && !job.deposit_paid ? (
            <p className={styles.intakeHintWarn}>
              بیعانه با تایید مدیر موکول شده — کار را ادامه دهید.
            </p>
          ) : null}

          {canArrive || canStart ? (
            <section className={styles.techStepCard}>
              <div className={styles.techSteps}>
                <div
                  className={`${styles.techStep} ${
                    !canArrive ? styles.techStepDone : styles.techStepOn
                  }`}
                >
                  <span className={styles.techStepNum}>۱</span>
                  <div>
                    <strong>رسیدن به محل</strong>
                    <p>
                      {canArrive
                        ? 'وقتی رسیدید اعلام کنید'
                        : 'ثبت شد'}
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.techStep} ${
                    canStart
                      ? styles.techStepOn
                      : canArrive
                        ? ''
                        : styles.techStepDone
                  }`}
                >
                  <span className={styles.techStepNum}>۲</span>
                  <div>
                    <strong>شروع کار</strong>
                    <p>شمارنده و هزینه ساعتی از این لحظه</p>
                  </div>
                </div>
              </div>
              {canArrive ? (
                <button
                  type="button"
                  className={styles.intakeBtnPrimary}
                  disabled={busy}
                  onClick={markArrived}
                >
                  <Navigation size={14} /> به محل رسیدم
                </button>
              ) : null}
              {canStart ? (
                <button
                  type="button"
                  className={styles.intakeBtnPrimary}
                  disabled={busy}
                  onClick={startWork}
                >
                  <Play size={14} /> شروع به کار کردم
                </button>
              ) : null}
            </section>
          ) : null}

          {timerActive ? (
            <section className={styles.techTimerBox}>
              <div className={styles.techTimerHead}>
                <span className={styles.techTimerIcon}>
                  <Timer size={15} />
                </span>
                <div>
                  <strong>زمان کار</strong>
                  <p>مبنای محاسبه: ساعت تهران</p>
                </div>
              </div>
              <div className={styles.techTimerValue} dir="ltr">
                {formatElapsed(elapsedSeconds)}
              </div>
              <div className={styles.techTimerMeta}>
                <span>
                  شروع <b dir="ltr">{formatTehranClock(startedMs)}</b>
                </span>
                <span>
                  {money(Math.max(elapsedMinutes, 1))} دقیقه
                </span>
                <span>
                  {money(job.hourly_rate)} ت / ساعت
                </span>
                <span>
                  هزینه <b>{money(liveTimeCost)} ت</b>
                </span>
              </div>
              {job.can_tech_finish ? (
                <button
                  type="button"
                  className={styles.techTimerFinish}
                  disabled={busy}
                  onClick={finishWork}
                >
                  اعلام پایان کار
                </button>
              ) : null}
            </section>
          ) : null}

          {!timerActive && job.can_tech_finish ? (
            <section className={styles.techGuideBox}>
              <strong>کار تمام شد؟</strong>
              <p>با اعلام پایان، پرونده برای تسویه و تایید مدیر می‌رود.</p>
              <button
                type="button"
                className={styles.intakeBtnPrimary}
                disabled={busy}
                onClick={finishWork}
              >
                اعلام پایان کار
              </button>
            </section>
          ) : null}

          {job.status === 'awaiting_final' ? (
            <section className={styles.techGuideBox}>
              <strong>منتظر تایید مدیر</strong>
              <p>
                بدهی مشتری: <strong>{money(balanceDue)} تومان</strong>
                {balanceDue > 0
                  ? ' — مشتری باید تسویه کند، بعد مدیر تایید می‌کند.'
                  : ' — بدهی صفر است؛ مدیر می‌تواند تکمیل کند.'}
              </p>
            </section>
          ) : null}

          {showReportTools ? (
            <section className={styles.intakeTechBlock}>
              <div className={styles.intakeCardHead}>
                <span className={styles.intakeCardIcon}>
                  <ClipboardList size={14} />
                </span>
                <h3>گزارش بازدید / تعمیر</h3>
              </div>
              {linesLocked ? (
                <p className={styles.intakeHint}>
                  اجرت و قطعات پرداخت‌شده قفل‌اند؛ فقط یادداشت قابل ویرایش است.
                </p>
              ) : null}
              <div className={styles.intakeNote}>
                <label>شرح بازدید و اقدامات</label>
                <textarea
                  rows={4}
                  value={report.tech_report}
                  disabled={locked}
                  onChange={(e) =>
                    setReport((r) => ({ ...r, tech_report: e.target.value }))
                  }
                  placeholder="عیب‌یابی، قطعات، توصیه به مشتری…"
                />
              </div>

              {linesLocked ? (
                <div className={styles.techMoneyChips}>
                  <span>
                    زمان{' '}
                    <strong>
                      {money(
                        Math.max(job.labor_minutes || 0, elapsedMinutes),
                      )}{' '}
                      دقیقه
                    </strong>
                  </span>
                  <span>
                    اجرت{' '}
                    <strong>
                      {(job.labor_lines || [])
                        .map((l) => l.title)
                        .filter(Boolean)
                        .join('، ') || '—'}
                    </strong>
                  </span>
                  <span>
                    قطعه{' '}
                    <strong>
                      {(job.part_lines || [])
                        .map((l) => l.title)
                        .filter(Boolean)
                        .join('، ') || '—'}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className={styles.techReportTools}>
                  <div className={styles.intakeNote}>
                    <label>زمان (دقیقه) — از شمارنده</label>
                    <input
                      type="number"
                      value={Math.max(
                        Number(report.labor_minutes || 0),
                        elapsedMinutes || 1,
                      )}
                      disabled
                      readOnly
                    />
                  </div>
                  <FilterSelectTrigger
                    label="اجرت‌ها"
                    displayValue={
                      selectedRates.length
                        ? selectedRates.map((r) => r.title).join('، ')
                        : ''
                    }
                    placeholder="انتخاب اجرت"
                    disabled={locked}
                    onClick={() => setPicker('rates')}
                  />
                  <FilterSelectTrigger
                    label="قطعات"
                    displayValue={
                      selectedParts.length
                        ? selectedParts.map((p) => p.name).join('، ')
                        : ''
                    }
                    placeholder="انتخاب قطعه"
                    disabled={locked}
                    onClick={() => setPicker('parts')}
                  />
                </div>
              )}

              <div className={styles.techActionRow}>
                <button
                  type="button"
                  className={styles.intakeBtnPrimary}
                  disabled={busy || locked}
                  onClick={submitReport}
                >
                  {linesLocked ? 'ذخیره یادداشت' : 'ذخیره گزارش'}
                </button>
                {job.can_tech_finish ? (
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    disabled={busy}
                    onClick={finishWork}
                  >
                    اعلام پایان کار
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {workStarted ? (
            <section className={styles.techInvoiceBox}>
              <div className={styles.intakeCardHead}>
                <span className={styles.intakeCardIcon}>
                  <CreditCard size={14} />
                </span>
                <h3>فاکتور فعلی</h3>
              </div>
              <div className={styles.techMoneyChips}>
                <span>
                  اجرت <strong>{money(job.labor_total)}</strong>
                </span>
                <span>
                  قطعه <strong>{money(job.parts_total)}</strong>
                </span>
                <span>
                  زمان{' '}
                  <strong>
                    {money(Math.max(job.time_total || 0, liveTimeCost))}
                  </strong>
                </span>
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
              {job.status === 'completed' ? (
                <p className={styles.intakeHintOk}>
                  <CheckCircle2 size={13} /> این سفارش تکمیل شده است.
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className={styles.modalFoot}>
          <button type="button" className={styles.intakeBtnGhost} onClick={closeJob}>
            بستن
          </button>
          {showReportTools && !locked ? (
            <button
              type="button"
              className={styles.intakeBtnPrimary}
              disabled={busy}
              onClick={submitReport}
            >
              {busy ? '…' : linesLocked ? 'ذخیره یادداشت' : 'ذخیره گزارش'}
            </button>
          ) : null}
        </footer>
      </div>

    </div>
  )

  return (
    <>
      {createPortal(dialog, document.body)}
      <MultiPickDialog
        isOpen={picker === 'rates'}
        title="انتخاب اجرت‌ها"
        options={rateOptions}
        values={report.labor_rate_ids || []}
        zIndex={300000}
        compact
        onChange={(ids) =>
          setReport((r) => ({
            ...r,
            labor_rate_ids: ids.map(Number),
          }))
        }
        onClose={() => setPicker(null)}
      />
      <MultiPickDialog
        isOpen={picker === 'parts'}
        title="انتخاب قطعات"
        options={partOptions}
        values={report.part_ids || []}
        zIndex={300000}
        compact
        onChange={(ids) =>
          setReport((r) => ({
            ...r,
            part_ids: ids.map(Number),
          }))
        }
        onClose={() => setPicker(null)}
      />
    </>
  )
}
