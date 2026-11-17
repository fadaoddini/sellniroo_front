'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MapPin,
  Phone,
  User,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import InvoicePrintButton, {
  canDownloadRepairInvoice,
} from '@/components/Repairs/InvoicePrintButton'
import ReceiptDropzone from '@/components/Repairs/ReceiptDropzone'
import RepairsBankCard from '@/components/Repairs/RepairsBankCard'
import TechRatingForm from '@/components/Repairs/TechRatingForm'
import repairsService from '@/components/Repairs/services/repairsService'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function isGatewayUnavailable(res) {
  if (!res) return true
  if (!res.success) {
    const code = (res.code || '').toLowerCase()
    const err = res.error || ''
    if (code === 'no_gateway') return true
    if (res.httpStatus === 503) return true
    if (/درگاه|gateway/i.test(err)) return true
    return false
  }
  return !(res.data?.payment_url || res.data?.redirect_url)
}


const STAGES = [
  { key: 'request', label: 'ثبت', statuses: ['draft', 'awaiting_deposit'] },
  { key: 'booked', label: 'رزرو', statuses: ['booked'] },
  { key: 'dispatch', label: 'اعزام', statuses: ['assigned', 'visited'] },
  {
    key: 'repair',
    label: 'تعمیر',
    statuses: ['awaiting_mid', 'mid_paid', 'in_progress'],
  },
  { key: 'settle', label: 'تسویه', statuses: ['awaiting_final'] },
  { key: 'done', label: 'پایان', statuses: ['completed', 'canceled'] },
]

function stageIndex(status) {
  const i = STAGES.findIndex((s) => s.statuses.includes(status))
  return i < 0 ? 0 : i
}

function stageHint(job, balanceDue) {
  const st = job?.status
  if (st === 'canceled') return 'این سفارش لغو شده است.'
  if (st === 'completed') {
    if (balanceDue > 0) {
      return `سفارش تکمیل شد؛ تسویه ${money(job.final_amount || balanceDue)} ت هنوز مانده — لطفاً از یکی از روش‌های زیر پرداخت کنید.`
    }
    return 'سفارش تکمیل شده — می‌توانید فاکتور را دریافت کنید و به سرویسکار امتیاز دهید.'
  }
  if (st === 'awaiting_deposit') {
    return 'برای ادامه، پیش‌پرداخت رزرو را انجام دهید.'
  }
  if (st === 'draft') return 'درخواست ثبت شده و در صف بررسی است.'
  if (st === 'booked') return 'رزرو تایید شد؛ به‌زودی سرویسکار اعزام می‌شود.'
  if (st === 'assigned') return 'سرویسکار تخصیص یافته و در مسیر اعزام است.'
  if (st === 'visited' || st === 'in_progress' || st === 'mid_paid') {
    return 'سرویسکار در حال بازدید / تعمیر است.'
  }
  if (st === 'awaiting_mid') {
    return 'برآورد اعلام شده — لطفاً مبلغ را پرداخت کنید.'
  }
  if (st === 'awaiting_final') {
    if (balanceDue > 0) {
      if (job.deposit_deferred && !job.deposit_paid) {
        return `زمان تسویه است — مبلغ باقیمانده (${money(balanceDue)} ت) شامل بیعانهٔ موکول‌شده هم می‌شود؛ لطفاً پرداخت کنید.`
      }
      return `لطفاً تسویه نهایی (${money(balanceDue)} ت) را پرداخت کنید.`
    }
    return 'پرداخت‌ها انجام شده — منتظر تایید نهایی مدیر.'
  }
  return 'وضعیت سفارش را از اینجا پیگیری کنید.'
}

function nextPayStage(job, due) {
  if (!job) return null
  const depositPaid = !!job.deposit_paid
  const depositDeferred = !!job.deposit_deferred
  if (
    (job.status === 'awaiting_deposit' || job.status === 'draft') &&
    !depositPaid &&
    !depositDeferred &&
    Number(job.deposit_amount || 0) > 0
  ) {
    return 'deposit'
  }
  if (job.status === 'visited' || job.status === 'awaiting_mid') {
    if (Number(job.mid_amount || 0) > 0 || due > 0) return 'mid'
  }
  if (
    ['mid_paid', 'in_progress', 'awaiting_final', 'completed'].includes(
      job.status,
    ) &&
    due > 0
  ) {
    return 'final'
  }
  return null
}

function payStageAmount(job, stage, due) {
  if (stage === 'deposit') return Number(job.deposit_amount || 0)
  if (stage === 'mid') {
    return Number(job.mid_amount || 0) || due
  }
  if (stage === 'final') return due
  return 0
}

function payStageTitle(stage) {
  if (stage === 'deposit') return 'پیش‌پرداخت رزرو'
  if (stage === 'mid') return 'پرداخت برآورد / قطعات'
  if (stage === 'final') return 'پرداخت باقیمانده / تسویه'
  if (stage === 'extra') return 'پرداخت پیشنهاد مدیر'
  return 'پرداخت'
}

function cardPaymentsFor(job, { stage, proposalId } = {}) {
  const list = Array.isArray(job?.payments) ? job.payments : []
  return list.filter((p) => {
    if (p.method !== 'card_transfer') return false
    if (stage && p.stage !== stage) return false
    if (proposalId) return Number(p.proposal) === Number(proposalId)
    return !p.proposal
  })
}

function pendingCardReceipt(job, opts = {}) {
  return (
    cardPaymentsFor(job, opts).find(
      (p) => p.status === 'pending' && (p.receipt_url || p.receipt_image || p.ref_id),
    ) || null
  )
}

function latestRejectedCard(job, opts = {}) {
  const rejected = cardPaymentsFor(job, opts)
    .filter((p) => p.status === 'rejected')
    .sort((a, b) => Number(b.id) - Number(a.id))
  return rejected[0] || null
}

export default function CustomerJobDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    flash,
    openJob,
    customerPayGateway,
    customerPayWallet,
    customerPayCard,
    customerProposalAction,
  } = useTodoService()

  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [rateBusy, setRateBusy] = useState(false)
  const [payBusy, setPayBusy] = useState(false)
  const [refId, setRefId] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [cardTarget, setCardTarget] = useState(null) // { stage, proposalId?, purpose? }
  const [gatewayHint, setGatewayHint] = useState(null) // { stage, proposalId?, purpose? }
  const [walletBalance, setWalletBalance] = useState(null)
  const [receiptSentToast, setReceiptSentToast] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!job) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setRefId('')
    setReceiptFile(null)
    setCardTarget(null)
    setGatewayHint(null)
    return () => {
      document.body.style.overflow = prev
    }
  }, [job?.id])

  useEffect(() => {
    if (!job) return undefined
    let cancelled = false
    ;(async () => {
      const res = await repairsService.walletBalance()
      if (cancelled) return
      if (res.success) {
        setWalletBalance(
          Number(res.data?.balance ?? res.data?.amount ?? 0) || 0,
        )
      } else {
        setWalletBalance(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [job?.id])

  const balanceDue = useMemo(() => {
    if (!job) return 0
    return Number(
      job.balance_due ??
        job.invoice?.remaining ??
        Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
    )
  }, [job])

  const payStage = useMemo(
    () => nextPayStage(job, balanceDue),
    [job, balanceDue],
  )
  const payAmount = useMemo(
    () => (payStage ? payStageAmount(job, payStage, balanceDue) : 0),
    [job, payStage, balanceDue],
  )
  const needsPay =
    !!job &&
    job.status !== 'canceled' &&
    !!payStage &&
    payAmount > 0

  const awaitingReceiptReview = useMemo(
    () => (job && payStage ? pendingCardReceipt(job, { stage: payStage }) : null),
    [job, payStage],
  )
  const rejectedReceipt = useMemo(
    () =>
      job && payStage && !awaitingReceiptReview
        ? latestRejectedCard(job, { stage: payStage })
        : null,
    [job, payStage, awaitingReceiptReview],
  )

  const pendingProposals = useMemo(
    () =>
      (job?.proposals || []).filter(
        (p) =>
          p.status === 'pending' &&
          p.proposal_type !== 'shop_product' &&
          !(p.title || '').includes('بیعانه معوق'),
      ),
    [job],
  )

  const bank = job?.public_config || {}

  const startGateway = async ({ stage, proposalId, purpose } = {}) => {
    const st = stage || payStage
    if (!st || !job?.tracking_token) return
    const ctx = {
      stage: st,
      proposalId: proposalId || undefined,
      purpose: purpose || payStageTitle(st),
    }
    setPayBusy(true)
    const res = await customerPayGateway(job.tracking_token, st, {
      proposal_id: ctx.proposalId,
      purpose: ctx.purpose,
    })
    setPayBusy(false)
    if (isGatewayUnavailable(res)) {
      setGatewayHint(ctx)
      return
    }
    if (!res.success) {
      return flash(false, res.error || 'خطا در شروع پرداخت درگاه')
    }
    const url = res.data?.payment_url || res.data?.redirect_url
    if (url) {
      window.location.href = url
      return
    }
    setGatewayHint(ctx)
  }

  const openCardFromGatewayHint = () => {
    if (!gatewayHint?.stage) return
    setCardTarget({
      stage: gatewayHint.stage,
      proposalId: gatewayHint.proposalId,
      purpose: gatewayHint.purpose || payStageTitle(gatewayHint.stage),
    })
    setGatewayHint(null)
  }

  const startWallet = async ({ stage, proposalId, purpose } = {}) => {
    const st = stage || payStage
    if (!st || !job?.tracking_token) return
    setPayBusy(true)
    const res = await customerPayWallet(job.tracking_token, st, {
      proposal_id: proposalId || undefined,
      purpose: purpose || undefined,
    })
    setPayBusy(false)
    if (!res.success) return flash(false, res.error || 'خطا در پرداخت کیف پول')
    flash(true, res.message || 'پرداخت از کیف پول انجام شد')
    if (typeof res.data?.balance === 'number') {
      setWalletBalance(res.data.balance)
    } else {
      const bal = await repairsService.walletBalance()
      if (bal.success) {
        setWalletBalance(Number(bal.data?.balance ?? 0) || 0)
      }
    }
    openJob(job.tracking_token)
  }

  const submitCard = async () => {
    if (!cardTarget?.stage || !job?.tracking_token) return
    if (!receiptFile) {
      return flash(false, 'تصویر رسید واریز را انتخاب کنید')
    }
    const fd = new FormData()
    fd.append('stage', cardTarget.stage)
    fd.append('method', 'card_transfer')
    if (cardTarget.proposalId) {
      fd.append('proposal_id', String(cardTarget.proposalId))
    }
    if (cardTarget.purpose) fd.append('purpose', cardTarget.purpose)
    if (refId) fd.append('ref_id', refId)
    fd.append('receipt_image', receiptFile)
    setPayBusy(true)
    const res = await customerPayCard(
      job.tracking_token,
      cardTarget.stage,
      fd,
    )
    setPayBusy(false)
    if (!res.success) return flash(false, res.error || 'خطا در ثبت رسید')
    setRefId('')
    setReceiptFile(null)
    setCardTarget(null)
    setReceiptSentToast(true)
    if (res.data?.job) {
      // openJob will refresh; keep toast
    }
    openJob(job.tracking_token)
  }

  if (role !== 'customer' || !job || !mounted) return null

  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'
  const idx = stageIndex(job.status)
  const isDone = job.status === 'completed' || job.status === 'canceled'
  const company =
    job.invoice?.company_title || job.public_config?.company_title || ''

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={`${styles.modalCard} ${styles.customerModalCard}`}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-job-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پرونده مشتری</p>
            <h2 id="customer-job-title">
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
          <nav className={styles.customerStageRail} aria-label="مراحل سفارش">
            {STAGES.map((s, i) => {
              const done = i < idx || (isDone && i <= idx)
              const on = i === idx
              return (
                <div
                  key={s.key}
                  className={`${styles.workStage} ${
                    done ? styles.workStageDone : ''
                  } ${on ? styles.workStageOn : ''}`}
                >
                  <span className={styles.workStageDot}>
                    {done && !on ? <CheckCircle2 size={12} /> : i + 1}
                  </span>
                  <span className={styles.workStageLabel}>{s.label}</span>
                </div>
              )
            })}
          </nav>

          <p className={styles.workStageHint}>{stageHint(job, balanceDue)}</p>

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

          {job.deposit_deferred &&
          !job.deposit_paid &&
          !['awaiting_final', 'completed', 'canceled'].includes(job.status) ? (
            <p className={styles.intakeHintWarn}>
              بیعانه با تایید مدیر به تسویه نهایی موکول شده و در پایان کار دریافت
              می‌شود.
            </p>
          ) : null}

          {job.deposit_deferred &&
          !job.deposit_paid &&
          job.status === 'awaiting_final' &&
          balanceDue > 0 ? (
            <p className={styles.intakeHintWarn}>
              بیعانهٔ موکول‌شده در مبلغ قابل پرداخت پایین لحاظ شده — همین حالا
              تسویه کنید.
            </p>
          ) : null}

          <section className={styles.techInvoiceBox}>
            <div className={styles.intakeCardHead}>
              <span className={styles.intakeCardIcon}>
                <CreditCard size={14} />
              </span>
              <h3>خلاصه مالی</h3>
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
                  تخفیف <strong>{money(job.settlement_discount)}</strong>
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

          {needsPay ? (
            <section className={styles.customerPayBox}>
              <div className={styles.intakeCardHead}>
                <span className={styles.intakeCardIcon}>
                  <CreditCard size={14} />
                </span>
                <h3>{payStageTitle(payStage)}</h3>
              </div>
              <p className={styles.customerPayAmount}>
                مبلغ قابل پرداخت:{' '}
                <strong>{money(payAmount)} تومان</strong>
              </p>

              {awaitingReceiptReview ? (
                <div className={styles.customerReceiptWaiting}>
                  <p className={styles.intakeHintOk}>
                    سند شما ارسال شد. پس از بررسی مدیر، تایید یا رد خواهد شد.
                  </p>
                  <p className={styles.opsMuted}>
                    تا زمان بررسی، امکان پرداخت مجدد وجود ندارد.
                    {awaitingReceiptReview.ref_id
                      ? ` کد پیگیری: ${awaitingReceiptReview.ref_id}`
                      : ''}
                  </p>
                  {awaitingReceiptReview.receipt_url ? (
                    <a
                      href={awaitingReceiptReview.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.fieldTrackLink}
                    >
                      مشاهده سند ارسال‌شده
                    </a>
                  ) : null}
                </div>
              ) : (
                <>
                  {rejectedReceipt ? (
                    <p className={styles.intakeHintWarn}>
                      رسید قبلی رد شد. لطفاً دوباره از یکی از روش‌های زیر پرداخت
                      کنید.
                    </p>
                  ) : null}

                  <RepairsBankCard
                    cardNumber={bank.bank_card_number}
                    holder={bank.bank_card_holder}
                    bankName={bank.bank_name}
                    instructions={bank.payment_instructions}
                    amount={payAmount}
                    amountLabel="مبلغ قابل پرداخت"
                    formatMoney={money}
                  />

                  <div className={styles.customerPayMethods}>
                    <button
                      type="button"
                      className={styles.intakeBtnPrimary}
                      disabled={busy || payBusy}
                      onClick={() => startGateway({ stage: payStage })}
                    >
                      پرداخت اینترنتی (درگاه)
                    </button>
                    <button
                      type="button"
                      className={styles.intakeBtnGhost}
                      disabled={
                        busy ||
                        payBusy ||
                        walletBalance == null ||
                        walletBalance < payAmount
                      }
                      title={
                        walletBalance == null
                          ? 'موجودی کیف پول در دسترس نیست'
                          : walletBalance < payAmount
                            ? `موجودی ناکافی (${money(walletBalance)} ت)`
                            : `موجودی: ${money(walletBalance)} ت`
                      }
                      onClick={() => startWallet({ stage: payStage })}
                    >
                      کیف پول
                      {walletBalance != null
                        ? ` (${money(walletBalance)} ت)`
                        : ''}
                    </button>
                    <button
                      type="button"
                      className={styles.intakeBtnGhost}
                      disabled={busy || payBusy}
                      onClick={() =>
                        setCardTarget({
                          stage: payStage,
                          purpose: payStageTitle(payStage),
                        })
                      }
                    >
                      بانک / کارت‌به‌کارت
                    </button>
                  </div>

                  {cardTarget &&
                  cardTarget.stage === payStage &&
                  !cardTarget.proposalId ? (
                    <div className={styles.customerCardForm}>
                      <div className={styles.intakeNote}>
                        <label>کد پیگیری واریز</label>
                        <input
                          value={refId}
                          onChange={(e) => setRefId(e.target.value)}
                          dir="ltr"
                          placeholder="کد پیگیری بانکی"
                        />
                      </div>
                      <ReceiptDropzone
                        file={receiptFile}
                        onChange={setReceiptFile}
                        disabled={busy || payBusy}
                      />
                      <div className={styles.techActionRow}>
                        <button
                          type="button"
                          className={styles.intakeBtnPrimary}
                          disabled={busy || payBusy || !receiptFile}
                          onClick={submitCard}
                        >
                          ثبت رسید واریز
                        </button>
                        <button
                          type="button"
                          className={styles.intakeBtnGhost}
                          onClick={() => {
                            setCardTarget(null)
                            setReceiptFile(null)
                          }}
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          ) : null}

          {pendingProposals.length ? (
            <section className={styles.workActionCard}>
              <strong>پیشنهادهای مدیر</strong>
              {pendingProposals.map((p) => {
                const propWaiting = pendingCardReceipt(job, {
                  stage: 'extra',
                  proposalId: p.id,
                })
                const propRejected =
                  !propWaiting &&
                  latestRejectedCard(job, {
                    stage: 'extra',
                    proposalId: p.id,
                  })
                return (
                  <div key={p.id} className={styles.customerProposalBlock}>
                    <div className={styles.workActionRow}>
                      <span>
                        {p.title} — {money(p.amount)} ت
                      </span>
                    </div>
                    {propWaiting ? (
                      <div className={styles.customerReceiptWaiting}>
                        <p className={styles.intakeHintOk}>
                          سند شما ارسال شد. پس از بررسی مدیر، تایید یا رد خواهد
                          شد.
                        </p>
                      </div>
                    ) : (
                      <>
                        {propRejected ? (
                          <p className={styles.intakeHintWarn}>
                            رسید قبلی رد شد — دوباره پرداخت کنید.
                          </p>
                        ) : null}
                        <div className={styles.customerPayMethods}>
                          <button
                            type="button"
                            className={styles.intakeBtnPrimary}
                            disabled={busy || payBusy}
                            onClick={() =>
                              startGateway({
                                stage: 'extra',
                                proposalId: p.id,
                                purpose: p.title,
                              })
                            }
                          >
                            پرداخت درگاه
                          </button>
                          <button
                            type="button"
                            className={styles.intakeBtnGhost}
                            disabled={
                              busy ||
                              payBusy ||
                              walletBalance == null ||
                              walletBalance < Number(p.amount || 0)
                            }
                            onClick={() =>
                              startWallet({
                                stage: 'extra',
                                proposalId: p.id,
                                purpose: p.title,
                              })
                            }
                          >
                            کیف پول
                          </button>
                          <button
                            type="button"
                            className={styles.intakeBtnGhost}
                            disabled={busy || payBusy}
                            onClick={() =>
                              setCardTarget({
                                stage: 'extra',
                                proposalId: p.id,
                                purpose: p.title,
                              })
                            }
                          >
                            بانک / کارت
                          </button>
                          <button
                            type="button"
                            className={styles.intakeBtnGhost}
                            disabled={busy}
                            onClick={async () => {
                              const res = await customerProposalAction(
                                job.tracking_token,
                                p.id,
                                { action: 'reject' },
                              )
                              if (!res.success) return flash(false, res.error)
                              flash(true, 'پیشنهاد رد شد')
                              openJob(job.tracking_token)
                            }}
                          >
                            رد پیشنهاد
                          </button>
                        </div>
                        {cardTarget?.proposalId === p.id ? (
                          <div className={styles.customerCardForm}>
                            <div className={styles.intakeNote}>
                              <label>کد پیگیری واریز</label>
                              <input
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                dir="ltr"
                              />
                            </div>
                            <ReceiptDropzone
                              file={receiptFile}
                              onChange={setReceiptFile}
                              disabled={busy || payBusy}
                            />
                            <div className={styles.techActionRow}>
                              <button
                                type="button"
                                className={styles.intakeBtnPrimary}
                                disabled={busy || payBusy || !receiptFile}
                                onClick={submitCard}
                              >
                                ثبت رسید
                              </button>
                              <button
                                type="button"
                                className={styles.intakeBtnGhost}
                                onClick={() => {
                                  setCardTarget(null)
                                  setReceiptFile(null)
                                }}
                              >
                                انصراف
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )
              })}
            </section>
          ) : null}

          {job.status === 'completed' && job.technician ? (
            <TechRatingForm
              title="امتیاز به سرویسکار"
              subtitle={`${job.technician_name || 'سرویسکار'} — کیفیت، اخلاق، وقت‌شناسی و…`}
              existing={job.ratings?.customer || null}
              busy={rateBusy}
              onSubmit={
                job.ratings?.can_rate !== false
                  ? async (payload) => {
                      setRateBusy(true)
                      const res = await repairsService.trackRate(
                        job.tracking_token,
                        payload,
                      )
                      setRateBusy(false)
                      if (!res.success) return flash(false, res.error)
                      flash(true, res.message || 'امتیاز ثبت شد')
                      if (res.data?.job) {
                        // refresh via openJob
                      }
                      openJob(job.tracking_token)
                    }
                  : undefined
              }
            />
          ) : null}

          <div className={styles.doneActions}>
            {job.tracking_token ? (
              <Link
                href={`/repairs/track/${job.tracking_token}`}
                target="_blank"
                className={styles.fieldTrackLink}
              >
                <ExternalLink size={13} /> صفحه کامل پیگیری
              </Link>
            ) : null}
            {canDownloadRepairInvoice(job) ? (
              <InvoicePrintButton
                job={job}
                companyTitle={company}
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
              companyTitle={company}
              className={styles.intakeBtnPrimary}
              label="دانلود PDF فاکتور"
            />
          ) : null}
          <button
            type="button"
            className={styles.intakeBtnGhost}
            onClick={closeJob}
          >
            بستن
          </button>
        </footer>
      </div>
    </div>
  )

  const gatewayAlt = gatewayHint ? (
    <div
      className={styles.payAltOverlay}
      onClick={() => setGatewayHint(null)}
      role="presentation"
    >
      <div
        className={styles.payAltCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-alt-title"
      >
        <span className={styles.payAltIcon} aria-hidden>
          <AlertCircle size={20} />
        </span>
        <h3 id="pay-alt-title" className={styles.payAltTitle}>
          درگاه پرداخت فعال نیست
        </h3>
        <p className={styles.payAltText}>
          الان امکان پرداخت اینترنتی وجود ندارد. برای ادامه می‌توانید مبلغ را
          کارت‌به‌کارت واریز کنید و رسید را ثبت کنید
          {walletBalance != null &&
          walletBalance >= (payAmount || 0) &&
          payAmount > 0
            ? '، یا از موجودی کیف پول استفاده کنید'
            : ''}
          .
        </p>
        <div className={styles.payAltActions}>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            onClick={openCardFromGatewayHint}
          >
            <CreditCard size={14} />
            کارت‌به‌کارت
          </button>
          {walletBalance != null &&
          walletBalance >= (payAmount || 0) &&
          payAmount > 0 &&
          !gatewayHint.proposalId ? (
            <button
              type="button"
              className={styles.intakeBtnGhost}
              disabled={busy || payBusy}
              onClick={() => {
                const ctx = gatewayHint
                setGatewayHint(null)
                startWallet({
                  stage: ctx.stage,
                  proposalId: ctx.proposalId,
                  purpose: ctx.purpose,
                })
              }}
            >
              کیف پول
            </button>
          ) : null}
          <button
            type="button"
            className={styles.intakeBtnGhost}
            onClick={() => setGatewayHint(null)}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  ) : null

  const receiptSentOk = receiptSentToast ? (
    <div
      className={styles.payAltOverlay}
      onClick={() => setReceiptSentToast(false)}
      role="presentation"
    >
      <div
        className={`${styles.payAltCard} ${styles.payAltCardSuccess}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-sent-title"
      >
        <span
          className={`${styles.payAltIcon} ${styles.payAltIconSuccess}`}
          aria-hidden
        >
          <CheckCircle2 size={20} />
        </span>
        <h3 id="receipt-sent-title" className={styles.payAltTitle}>
          سند شما ارسال شد
        </h3>
        <p className={styles.payAltText}>
          پس از بررسی مدیر، رسید تایید یا رد خواهد شد. در صورت تایید، پرداخت
          ثبت می‌شود؛ اگر رد شود، دوباره می‌توانید از روش‌های پرداخت استفاده
          کنید.
        </p>
        <div className={styles.payAltActions}>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            onClick={() => setReceiptSentToast(false)}
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
      {gatewayAlt}
      {receiptSentOk}
    </>,
    document.body,
  )
}

