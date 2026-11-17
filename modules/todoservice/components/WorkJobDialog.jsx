'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  MapPin,
  Phone,
  Timer,
  User,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import FilterDialog from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

const WORK_STATUSES = new Set([
  'awaiting_mid',
  'mid_paid',
  'in_progress',
  'awaiting_final',
])

export function isWorkJob(job) {
  return !!(job && WORK_STATUSES.has(job.status))
}

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

const TEHRAN_OFFSET = '+03:30'

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
  if (!m) return null
  const t = new Date(
    `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || '00'}${TEHRAN_OFFSET}`,
  ).getTime()
  return Number.isNaN(t) ? null : t
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

function formatTehranClock(ms) {
  if (!ms) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(ms))
  } catch {
    return '—'
  }
}

const STAGES = [
  { key: 'started', label: 'شروع' },
  { key: 'working', label: 'تعمیر' },
  { key: 'mid', label: 'برآورد' },
  { key: 'tech_done', label: 'پایان کار' },
  { key: 'manager', label: 'تایید مدیر' },
]

function stageIndexFor(job) {
  if (!job) return 0
  if (job.status === 'awaiting_final') return 3
  if (job.status === 'awaiting_mid') return 2
  if (job.status === 'mid_paid' || job.status === 'in_progress') {
    return job.work_started_at || job.tech_report ? 1 : 0
  }
  return 0
}

function stageHint(job) {
  switch (job?.status) {
    case 'in_progress':
      return job.tech_report
        ? 'سرویسکار گزارش را ذخیره کرده؛ هنوز پایان کار اعلام نشده.'
        : 'سرویسکار در محل مشغول تعمیر است.'
    case 'mid_paid':
      return 'برآورد پرداخت شده — تعمیر ادامه دارد.'
    case 'awaiting_mid':
      return 'منتظر پرداخت برآورد توسط مشتری.'
    case 'awaiting_final':
      return job.can_manager_complete
        ? 'سرویسکار کار را تمام کرده — می‌توانید تکمیل را تایید کنید.'
        : job.complete_block_reason ||
          'سرویسکار پایان کار را اعلام کرده؛ تسویه یا رسید باز مانده.'
    default:
      return 'وضعیت پرونده را بررسی کنید.'
  }
}

export default function WorkJobDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    technicians,
    report,
    setReport,
    payProposal,
    setPayProposal,
    assignTech,
    submitReport,
    approveComplete,
    adjustPayable,
    createPayProposal,
    cancelProposal,
    confirmPayment,
  } = useTodoService()

  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [picker, setPicker] = useState(null)
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [deferSettlement, setDeferSettlement] = useState(false)
  const [deferNote, setDeferNote] = useState('')
  const [payableInput, setPayableInput] = useState('')

  useEffect(() => {
    setDeferSettlement(false)
    setDeferNote('')
    if (!job) return
    const due = Number(
      job.balance_due ??
        Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
    )
    setPayableInput(String(due || 0))
  }, [job?.id, job?.balance_due, job?.settlement_discount])

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

  const techOptions = useMemo(
    () =>
      (technicians || [])
        .filter((t) => t.is_active !== false)
        .map((t) => ({
          id: t.id,
          name: t.name,
          meta: [t.specialty, t.city, t.mobile].filter(Boolean).join(' · '),
        })),
    [technicians],
  )

  const selectedTech = useMemo(() => {
    if (!job) return null
    return (
      (technicians || []).find((t) => String(t.id) === String(job.technician)) ||
      (job.technician_name
        ? { id: job.technician, name: job.technician_name }
        : null)
    )
  }, [job, technicians])

  if (role !== 'admin' || !job || !isWorkJob(job) || !mounted) return null

  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'
  const balanceDue = Number(
    job.balance_due ??
      Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
  )
  const stageIdx = stageIndexFor(job)
  const pendingPayments = (job.payments || []).filter(
    (p) => p.status === 'pending' && p.method === 'card_transfer',
  )
  const pendingProposals = (job.proposals || []).filter(
    (p) => p.status === 'pending',
  )
  const laborTitles = (job.labor_lines || [])
    .map((l) => l.title)
    .filter(Boolean)
  const partTitles = (job.part_lines || [])
    .map((l) => l.title)
    .filter(Boolean)
  const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60))
  const liveTimeCost = (() => {
    const rate = Number(job.hourly_rate || 0)
    if (!rate || !elapsedMinutes) return Number(job.time_total || 0)
    return Math.round((elapsedMinutes / 60) * rate)
  })()

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={`${styles.modalCard} ${styles.workModalCard}`}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-job-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پرونده در حال تعمیر</p>
            <h2 id="work-job-title">
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
          <nav className={styles.workStageRail} aria-label="مراحل پرونده">
            {STAGES.map((s, i) => {
              const done = i < stageIdx
              const on = i === stageIdx
              return (
                <div
                  key={s.key}
                  className={`${styles.workStage} ${
                    done ? styles.workStageDone : ''
                  } ${on ? styles.workStageOn : ''}`}
                >
                  <span className={styles.workStageDot}>
                    {done ? <CheckCircle2 size={12} /> : i + 1}
                  </span>
                  <span className={styles.workStageLabel}>{s.label}</span>
                </div>
              )
            })}
          </nav>

          <p className={styles.workStageHint}>{stageHint(job)}</p>

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

          <section className={styles.fieldTechBanner}>
            <div className={styles.fieldTechBannerTop}>
              <UserCog size={15} />
              <strong>سرویسکار</strong>
            </div>
            {selectedTech ? (
              <div className={styles.fieldTechCurrent}>
                <span className={styles.fieldTechAvatar}>
                  {(selectedTech.name || '?').charAt(0)}
                </span>
                <div className={styles.fieldTechInfo}>
                  <span className={styles.fieldTechName}>
                    {selectedTech.name}
                  </span>
                  <span className={styles.fieldTechMeta}>
                    {[selectedTech.specialty, selectedTech.city]
                      .filter(Boolean)
                      .join(' · ') || 'تخصیص‌یافته'}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.intakeBtnGhost}
                  onClick={() => setPicker('tech')}
                >
                  تغییر
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.intakeBtnPrimary}
                onClick={() => setPicker('tech')}
              >
                انتخاب سرویسکار
              </button>
            )}
          </section>

          {timerActive ? (
            <section className={styles.workTimerStrip}>
              <Timer size={14} />
              <span dir="ltr">{formatElapsed(elapsedSeconds)}</span>
              <span className={styles.workTimerSep}>·</span>
              <span>شروع {formatTehranClock(startedMs)}</span>
              <span className={styles.workTimerSep}>·</span>
              <span>{money(liveTimeCost)} ت زمان</span>
            </section>
          ) : null}

          <section className={styles.intakeTechBlock}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <ClipboardList size={14} />
              </span>
              <h3>گزارش سرویسکار</h3>
            </div>
            {job.tech_report || report.tech_report ? (
              <div className={styles.intakeNote}>
                <label>متن گزارش</label>
                <textarea
                  rows={3}
                  value={report.tech_report}
                  onChange={(e) =>
                    setReport((r) => ({ ...r, tech_report: e.target.value }))
                  }
                />
              </div>
            ) : (
              <p className={styles.intakeHint}>هنوز گزارشی ثبت نشده است.</p>
            )}
            <div className={styles.techMoneyChips}>
              {laborTitles.length ? (
                <span>
                  اجرت <strong>{laborTitles.join('، ')}</strong>
                </span>
              ) : null}
              {partTitles.length ? (
                <span>
                  قطعه <strong>{partTitles.join('، ')}</strong>
                </span>
              ) : null}
              <span>
                زمان{' '}
                <strong>
                  {money(
                    Math.max(Number(job.labor_minutes || 0), elapsedMinutes),
                  )}{' '}
                  دقیقه
                </strong>
              </span>
            </div>
            {job.tech_report || report.tech_report ? (
              <div className={styles.techActionRow}>
                <button
                  type="button"
                  className={styles.intakeBtnGhost}
                  disabled={busy}
                  onClick={submitReport}
                >
                  ذخیره یادداشت مدیر
                </button>
              </div>
            ) : null}
          </section>

          <section className={styles.techInvoiceBox}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <CreditCard size={14} />
              </span>
              <h3>فاکتور</h3>
            </div>
            <div className={styles.techMoneyChips}>
              <span>
                اجرت <strong>{money(job.labor_total)}</strong>
              </span>
              <span>
                قطعه <strong>{money(job.parts_total)}</strong>
              </span>
              <span>
                زمان <strong>{money(Math.max(job.time_total || 0, liveTimeCost))}</strong>
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
          </section>

          {pendingPayments.length ? (
            <section className={styles.workActionCard}>
              <strong>رسیدهای در انتظار تایید</strong>
              {pendingPayments.map((p) => (
                <div key={p.id} className={styles.workActionRow}>
                  <span>
                    {p.purpose_label || p.purpose || p.stage_label || 'پرداخت'} —{' '}
                    {money(p.amount)} ت
                  </span>
                  <button
                    type="button"
                    className={styles.intakeBtnPrimary}
                    disabled={busy}
                    onClick={() => confirmPayment(p.id)}
                  >
                    تایید رسید
                  </button>
                </div>
              ))}
            </section>
          ) : null}

          {pendingProposals.length ? (
            <section className={styles.workActionCard}>
              <strong>پیشنهادهای باز</strong>
              {pendingProposals.map((p) => (
                <div key={p.id} className={styles.workActionRow}>
                  <span>
                    {p.title} — {money(p.amount)} ت
                  </span>
                  {!p.is_final ? (
                    <button
                      type="button"
                      className={styles.intakeBtnGhost}
                      disabled={busy}
                      onClick={() => cancelProposal(p.id)}
                    >
                      لغو
                    </button>
                  ) : null}
                </div>
              ))}
            </section>
          ) : null}

          {job.can_add_proposal !== false && job.status !== 'awaiting_final' ? (
            <section className={styles.intakeTechBlock}>
              <div className={styles.intakeCardHead}>
                <h3>پیشنهاد پرداخت به مشتری</h3>
              </div>
              <div className={styles.workPayRow}>
                <input
                  placeholder="موضوع"
                  value={payProposal.title}
                  onChange={(e) =>
                    setPayProposal((f) => ({ ...f, title: e.target.value }))
                  }
                />
                <input
                  type="number"
                  placeholder="مبلغ"
                  value={payProposal.amount}
                  onChange={(e) =>
                    setPayProposal((f) => ({ ...f, amount: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className={styles.intakeBtnPrimary}
                  disabled={busy}
                  onClick={createPayProposal}
                >
                  ارسال
                </button>
              </div>
            </section>
          ) : null}

          {job.status === 'awaiting_final' ? (
            <section className={styles.techGuideBox}>
              <strong>تسویه و تایید تکمیل</strong>
              <p>
                {job.can_manager_complete
                  ? 'بدهی و رسیدها آماده‌اند — می‌توانید تکمیل را تایید کنید.'
                  : job.complete_block_reason ||
                    'تا تسویه کامل، تایید ممکن نیست.'}
              </p>

              <div className={styles.workPayableBox}>
                <div className={styles.workPayableMeta}>
                  <span>
                    بدهی سیستمی{' '}
                    <strong>
                      {money(job.system_balance_due ?? balanceDue)} ت
                    </strong>
                  </span>
                  {Number(job.settlement_discount || 0) > 0 ? (
                    <span>
                      تخفیف/رند{' '}
                      <strong>{money(job.settlement_discount)} ت</strong>
                    </span>
                  ) : null}
                  <span>
                    قابل پرداخت مشتری{' '}
                    <strong>{money(balanceDue)} ت</strong>
                  </span>
                </div>
                <div className={styles.intakeNote}>
                  <label htmlFor="payable-amount">مبلغ قابل پرداخت (تومان)</label>
                  <input
                    id="payable-amount"
                    type="number"
                    min={0}
                    value={payableInput}
                    onChange={(e) => setPayableInput(e.target.value)}
                  />
                </div>
                <div className={styles.workRoundRow}>
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    disabled={busy}
                    onClick={() => {
                      const raw = Number(
                        job.system_balance_due ?? balanceDue ?? 0,
                      )
                      setPayableInput(String(Math.floor(raw / 1000) * 1000))
                    }}
                  >
                    رند به هزار
                  </button>
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    disabled={busy}
                    onClick={() => {
                      const raw = Number(
                        job.system_balance_due ?? balanceDue ?? 0,
                      )
                      setPayableInput(String(Math.floor(raw / 10000) * 10000))
                    }}
                  >
                    رند به ده‌هزار
                  </button>
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    disabled={busy}
                    onClick={() =>
                      setPayableInput(
                        String(Number(job.system_balance_due ?? balanceDue ?? 0)),
                      )
                    }
                  >
                    مبلغ کامل
                  </button>
                  <button
                    type="button"
                    className={styles.intakeBtnPrimary}
                    disabled={busy || payableInput === ''}
                    onClick={() =>
                      adjustPayable({
                        payableAmount: Number(payableInput),
                        note: deferNote,
                      })
                    }
                  >
                    اعمال مبلغ
                  </button>
                </div>
              </div>

              {(job.can_manager_defer_settlement || balanceDue > 0) &&
              !job.can_manager_complete ? (
                <>
                  <p className={styles.intakeHintWarn}>
                    <AlertTriangle size={13} /> اگر الان امکان دریافت نیست،
                    تسویه را موکول کنید.
                  </p>
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={deferSettlement}
                      onChange={(e) => setDeferSettlement(e.target.checked)}
                    />
                    <span>
                      تسویه الان لازم نیست؛ مبلغ{' '}
                      <strong>
                        {money(Number(payableInput || balanceDue))} تومان
                      </strong>{' '}
                      به بعد موکول شود.
                    </span>
                  </label>
                  {deferSettlement ? (
                    <div className={styles.intakeNote}>
                      <label htmlFor="defer-settle-note">دلیل موکول‌کردن</label>
                      <textarea
                        id="defer-settle-note"
                        rows={2}
                        value={deferNote}
                        onChange={(e) => setDeferNote(e.target.value)}
                        placeholder="مثلاً واحد مالی در این ساعت در محل نبود…"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}

              <button
                type="button"
                className={styles.intakeBtnPrimary}
                disabled={
                  busy ||
                  !(
                    job.can_manager_complete ||
                    (deferSettlement &&
                      (job.can_manager_defer_settlement || balanceDue > 0))
                  )
                }
                onClick={() =>
                  approveComplete({
                    deferSettlement:
                      !!deferSettlement && !job.can_manager_complete,
                    note: deferNote,
                    payableAmount:
                      payableInput !== '' ? Number(payableInput) : undefined,
                  })
                }
              >
                {deferSettlement && !job.can_manager_complete
                  ? 'تایید تکمیل با تسویه موکول'
                  : 'تایید تکمیل سفارش'}
              </button>
            </section>
          ) : null}

          {job.tracking_token ? (
            <Link
              href={`/repairs/track/${job.tracking_token}`}
              target="_blank"
              className={styles.fieldTrackLink}
            >
              <ExternalLink size={13} /> دید مشتری / پیگیری
            </Link>
          ) : null}
        </div>

        <footer className={styles.modalFoot}>
          <button type="button" className={styles.intakeBtnGhost} onClick={closeJob}>
            بستن
          </button>
          {job.status === 'awaiting_final' &&
          (job.can_manager_complete ||
            (deferSettlement &&
              (job.can_manager_defer_settlement || balanceDue > 0))) ? (
            <button
              type="button"
              className={styles.intakeBtnPrimary}
              disabled={busy}
              onClick={() =>
                approveComplete({
                  deferSettlement:
                    !!deferSettlement && !job.can_manager_complete,
                  note: deferNote,
                  payableAmount:
                    payableInput !== '' ? Number(payableInput) : undefined,
                })
              }
            >
              {deferSettlement && !job.can_manager_complete
                ? 'تکمیل با تسویه موکول'
                : 'تایید تکمیل'}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(dialog, document.body)}
      <FilterDialog
        isOpen={picker === 'tech'}
        title="تغییر سرویسکار"
        options={techOptions}
        value={job.technician || ''}
        showEmpty={false}
        searchable={techOptions.length > 4}
        zIndex={300000}
        onChange={async (v) => {
          setPicker(null)
          if (v) await assignTech(v)
        }}
        onClose={() => setPicker(null)}
      />
    </>
  )
}
