'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  Search,
  User,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

const INBOX_STATUSES = new Set(['draft', 'awaiting_deposit', 'booked'])

export function isIntakeJob(job) {
  return !!(job && INBOX_STATUSES.has(job.status))
}

export default function IntakeAssignDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    technicians,
    intakeAssign,
  } = useTodoService()

  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [techId, setTechId] = useState('')
  const [deferDeposit, setDeferDeposit] = useState(false)
  const [note, setNote] = useState('')
  const [techQuery, setTechQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!job) return
    setTechId(job.technician ? String(job.technician) : '')
    setDeferDeposit(false)
    setNote('')
    setTechQuery('')
  }, [job?.id])

  const activeTechs = useMemo(() => {
    const list = (technicians || []).filter((t) => t.is_active !== false)
    const q = techQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((t) => {
      const hay = [t.name, t.specialty, t.city, t.mobile]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [technicians, techQuery])

  if (role !== 'admin' || !job || !isIntakeJob(job) || !mounted) return null

  const depositAmount = Number(job.deposit_amount || 0)
  const depositPaid = !!job.deposit_paid
  const depositDeferred = !!job.deposit_deferred
  const needsDepositGate =
    depositAmount > 0 &&
    !depositPaid &&
    !depositDeferred &&
    (job.status === 'draft' || job.status === 'awaiting_deposit')

  const canSubmit =
    !!techId && (!needsDepositGate || deferDeposit) && !busy

  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={styles.modalCard}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پذیرش درخواست ورودی</p>
            <h2 id="intake-title">
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
          {/* مشتری — حداکثر دو خط فشرده */}
          <article className={`${styles.intakeCard} ${styles.intakeCardSlim}`}>
            <div className={styles.intakeSlimRow}>
              <User size={13} className={styles.intakeSlimIcon} />
              <span className={styles.intakeSlimName}>
                {job.customer_name || '—'}
              </span>
              <span className={styles.intakeSlimDot} aria-hidden>
                ·
              </span>
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

          {/* دستگاه و درخواست — حداکثر دو خط باریک */}
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
              <span className={styles.intakeSlimValue} title={job.customer_request || ''}>
                {job.customer_request || '—'}
              </span>
            </div>
          </article>

          {/* بیعانه */}
          <section
            className={`${styles.depositBox} ${
              depositPaid
                ? styles.depositOk
                : needsDepositGate
                  ? styles.depositWarn
                  : styles.depositMuted
            }`}
          >
            <div className={styles.depositTop}>
              <CreditCard size={15} />
              <strong>پیش‌پرداخت رزرو</strong>
              <span>{money(depositAmount)} ت</span>
            </div>
            {depositPaid ? (
              <p className={styles.intakeHintOk}>
                <CheckCircle2 size={13} /> بیعانه پرداخت و تایید شده است.
              </p>
            ) : depositDeferred ? (
              <p className={styles.intakeHintWarn}>
                <AlertTriangle size={13} /> بیعانه قبلاً به تسویه بعدی موکول شده.
              </p>
            ) : depositAmount <= 0 ? (
              <p className={styles.intakeHint}>برای این سفارش بیعانه‌ای تعریف نشده.</p>
            ) : (
              <p className={styles.intakeHintWarn}>
                <AlertTriangle size={13} /> هنوز پرداخت نشده — می‌توانید موکول
                کنید.
              </p>
            )}

            {needsDepositGate ? (
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={deferDeposit}
                  onChange={(e) => setDeferDeposit(e.target.checked)}
                />
                <span>
                  تایید مدیر: بیعانه الان لازم نیست؛ مبلغ{' '}
                  <strong>{money(depositAmount)} تومان</strong> در تسویه نهایی
                  لحاظ شود.
                </span>
              </label>
            ) : null}

            {needsDepositGate && deferDeposit ? (
              <div className={styles.intakeNote}>
                <label htmlFor="defer-note">دلیل (اختیاری)</label>
                <textarea
                  id="defer-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثلاً واحد تسویه در دسترس نیست…"
                />
              </div>
            ) : null}
          </section>

          {/* سرویسکار */}
          <section className={styles.intakeTechBlock}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <UserCog size={14} />
              </span>
              <h3>انتخاب سرویسکار</h3>
              <span className={styles.intakeCount}>
                {activeTechs.length.toLocaleString('fa-IR')} نفر
              </span>
            </div>

            {(technicians || []).length === 0 ? (
              <p className={styles.intakeHint}>
                سرویسکاری تعریف نشده — از تب عملیات اضافه کنید.
              </p>
            ) : (
              <>
                <div className={styles.techSearch}>
                  <Search size={14} />
                  <input
                    value={techQuery}
                    onChange={(e) => setTechQuery(e.target.value)}
                    placeholder="جستجو نام، تخصص، شهر یا موبایل…"
                    autoComplete="off"
                  />
                </div>
                <div className={styles.techList}>
                  {activeTechs.length === 0 ? (
                    <p className={styles.intakeHint}>نتیجه‌ای نیست.</p>
                  ) : (
                    activeTechs.map((t) => {
                      const on = String(techId) === String(t.id)
                      const meta = [t.specialty, t.city]
                        .filter(Boolean)
                        .join(' · ')
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`${styles.techRow} ${on ? styles.techRowOn : ''}`}
                          onClick={() => setTechId(String(t.id))}
                        >
                          <span className={styles.techRowRadio} aria-hidden />
                          <span className={styles.techRowMain}>
                            <span className={styles.techRowName}>{t.name}</span>
                            {meta ? (
                              <span className={styles.techRowMeta}>{meta}</span>
                            ) : null}
                          </span>
                          {t.mobile ? (
                            <span className={styles.techRowMobile} dir="ltr">
                              {t.mobile}
                            </span>
                          ) : null}
                        </button>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        <footer className={styles.modalFoot}>
          <button type="button" className={styles.intakeBtnGhost} onClick={closeJob}>
            انصراف
          </button>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            disabled={!canSubmit}
            onClick={() =>
              intakeAssign({
                technicianId: techId,
                deferDeposit: needsDepositGate ? deferDeposit : false,
                note,
              })
            }
          >
            {busy
              ? 'در حال ثبت…'
              : needsDepositGate && deferDeposit
                ? 'تخصیص + موکول بیعانه'
                : 'تخصیص سرویسکار'}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
