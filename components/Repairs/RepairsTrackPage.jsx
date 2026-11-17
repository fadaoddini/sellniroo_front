'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Search,
  ShoppingBag,
  User,
  UserCog,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { useAuth } from '@/contexts/AuthContext'
import repairsService from '@/components/Repairs/services/repairsService'
import InvoicePrintButton, {
  canDownloadRepairInvoice,
} from '@/components/Repairs/InvoicePrintButton'
import ReceiptDropzone from '@/components/Repairs/ReceiptDropzone'
import RepairsBankCard from '@/components/Repairs/RepairsBankCard'
import TechRatingForm from '@/components/Repairs/TechRatingForm'
import styles from './Repairs.module.css'

function formatMoney(n) {
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


function formatDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return String(value)
  }
}

const PIPELINE = [
  {
    id: 'request',
    label: 'ثبت',
    hint: 'درخواست',
    statuses: ['draft', 'awaiting_deposit'],
  },
  {
    id: 'booked',
    label: 'رزرو',
    hint: 'تایید رزرو',
    statuses: ['booked'],
  },
  {
    id: 'visit',
    label: 'بازدید',
    hint: 'گزارش فنی',
    // بعد از تخصیص سرویسکار (حتی با بیعانه معوق) وارد بازدید می‌شود
    statuses: ['assigned', 'visited', 'awaiting_mid'],
  },
  {
    id: 'repair',
    label: 'تعمیر',
    hint: 'در حال کار',
    statuses: ['mid_paid', 'in_progress'],
  },
  {
    id: 'settle',
    label: 'تسویه',
    hint: 'پرداخت نهایی',
    statuses: ['awaiting_final'],
  },
  {
    id: 'done',
    label: 'تکمیل',
    hint: 'تحویل',
    statuses: ['completed'],
  },
]

function pipelineIndex(status) {
  if (status === 'canceled') return -1
  const i = PIPELINE.findIndex((s) => s.statuses.includes(status))
  return i >= 0 ? i : 0
}

function balanceDue(job) {
  if (!job) return 0
  if (job.balance_due != null) return Math.max(0, Number(job.balance_due) || 0)
  return Math.max(0, (job.grand_total || 0) - (job.paid_total || 0))
}

function nextStage(job) {
  if (!job) return null
  if (job.status === 'awaiting_deposit' || job.status === 'draft') return 'deposit'
  if (job.status === 'visited' || job.status === 'awaiting_mid') return 'mid'
  // باقیمانده فاکتور — حتی حین تعمیر / تسویه موکول پس از تکمیل
  if (
    ['mid_paid', 'in_progress', 'awaiting_final', 'completed'].includes(
      job.status,
    ) &&
    balanceDue(job) > 0
  ) {
    return 'final'
  }
  return null
}

function stageAmount(job, stage) {
  if (!job) return 0
  if (stage === 'deposit') return job.deposit_amount
  if (stage === 'mid') return job.mid_amount
  if (stage === 'final') return balanceDue(job)
  return 0
}

function stageTitle(stage) {
  if (stage === 'deposit') return 'پیش‌پرداخت رزرو'
  if (stage === 'mid') return 'پرداخت برآورد / قطعات'
  if (stage === 'final') return 'پرداخت باقیمانده / تسویه'
  return 'پرداخت'
}

function paymentStageLabel(stage) {
  if (stage === 'deposit') return 'رزرو'
  if (stage === 'mid') return 'برآورد'
  if (stage === 'final') return 'نهایی'
  if (stage === 'extra') return 'پیشنهاد مدیر'
  return stage || '—'
}

function paymentStatusLabel(status) {
  const map = {
    pending: 'در انتظار',
    paid: 'پرداخت‌شده',
    failed: 'ناموفق',
    rejected: 'رد شده',
    awaiting_confirm: 'منتظر تایید',
  }
  return map[status] || status || '—'
}

function paymentMethodLabel(method) {
  if (method === 'gateway') return 'درگاه'
  if (method === 'card_transfer') return 'کارت‌به‌کارت'
  if (method === 'wallet') return 'کیف پول'
  if (method === 'cash') return 'نقدی'
  return method || '—'
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
      (p) =>
        p.status === 'pending' &&
        (p.receipt_url || p.receipt_image || p.ref_id),
    ) || null
  )
}

function latestRejectedCard(job, opts = {}) {
  const rejected = cardPaymentsFor(job, opts)
    .filter((p) => p.status === 'rejected')
    .sort((a, b) => Number(b.id) - Number(a.id))
  return rejected[0] || null
}

function TrackShell({ children }) {
  return (
    <div className={styles.trackPage} dir="rtl" data-repairs-track="1">
      {children}
    </div>
  )
}

function TrackInner({ token }) {
  const { isAuthenticated } = useAuth()
  const [job, setJob] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [msgOk, setMsgOk] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [refId, setRefId] = useState('')
  const [showManualPay, setShowManualPay] = useState(false)
  const [activeProposalId, setActiveProposalId] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const [gatewayHint, setGatewayHint] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await repairsService.track(token)
    setLoading(false)
    if (!res.success) {
      setErr(res.error || 'سفارش یافت نشد')
      setJob(null)
      return
    }
    setJob(res.data)
    setConfig(res.data?.public_config || null)
    setErr(null)
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await repairsService.walletBalance()
      if (cancelled) return
      if (res.success) {
        setWalletBalance(Number(res.data?.balance ?? 0) || 0)
      } else {
        setWalletBalance(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, job?.id])

  const stage = nextStage(job)
  const amount = stageAmount(job, stage)
  const step = useMemo(() => pipelineIndex(job?.status), [job?.status])
  const inv = job?.invoice || {}
  const company = config?.company_title || inv.company_title || 'صدرا'
  const pendingProposals = useMemo(
    () =>
      (job?.proposals || []).filter(
        (p) =>
          p.status === 'pending' &&
          !(p.title || '').includes('بیعانه معوق'),
      ),
    [job?.proposals],
  )
  const depositDeferred = !!(
    job?.deposit_deferred ||
    (job?.tech_notes || '').includes('بیعانه معوق')
  )
  const resolvedProposals = useMemo(
    () =>
      (job?.proposals || []).filter((p) =>
        ['paid', 'purchased', 'canceled'].includes(p.status),
      ),
    [job?.proposals],
  )

  const payGateway = async (opts = {}) => {
    const payStage = opts.stage || stage
    if (!payStage) return
    const ctx = {
      stage: payStage,
      proposalId: opts.proposalId || undefined,
      purpose: opts.purpose || undefined,
    }
    setBusy(true)
    setMsg(null)
    const res = await repairsService.payGateway(token, payStage, {
      proposal_id: ctx.proposalId,
      purpose: ctx.purpose,
    })
    setBusy(false)
    if (isGatewayUnavailable(res)) {
      setGatewayHint(ctx)
      return
    }
    if (!res.success) {
      setMsgOk(false)
      setMsg(res.error || 'خطا در شروع پرداخت')
      return
    }
    if (res.data?.payment_url) {
      window.location.href = res.data.payment_url
      return
    }
    setGatewayHint(ctx)
  }

  const payWallet = async (opts = {}) => {
    const payStage = opts.stage || stage
    if (!payStage) return
    setBusy(true)
    setMsg(null)
    const res = await repairsService.payWallet(token, payStage, {
      proposal_id: opts.proposalId || undefined,
      purpose: opts.purpose || undefined,
    })
    setBusy(false)
    if (!res.success) {
      setMsgOk(false)
      setMsg(res.error || 'خطا در پرداخت کیف پول')
      return
    }
    setMsgOk(true)
    setMsg(res.message || 'پرداخت از کیف پول انجام شد')
    const bal = await repairsService.walletBalance()
    if (bal.success) setWalletBalance(Number(bal.data?.balance ?? 0) || 0)
    load()
  }

  const payCard = async (opts = {}) => {
    const payStage = opts.stage || stage
    if (!payStage) return
    if (!receiptFile) {
      setMsgOk(false)
      setMsg('تصویر رسید واریز را انتخاب کنید')
      return
    }
    const fd = new FormData()
    fd.append('stage', payStage)
    fd.append('method', 'card_transfer')
    if (opts.proposalId) fd.append('proposal_id', String(opts.proposalId))
    if (opts.purpose) fd.append('purpose', opts.purpose)
    if (refId) fd.append('ref_id', refId)
    fd.append('receipt_image', receiptFile)
    setBusy(true)
    setMsg(null)
    const res = await repairsService.payCard(token, payStage, fd)
    setBusy(false)
    if (!res.success) {
      setMsgOk(false)
      setMsg(res.error || 'خطا در ثبت رسید')
      return
    }
    setMsgOk(true)
    setMsg(
      res.message ||
        'سند شما ارسال شد؛ پس از بررسی مدیر تایید یا رد خواهد شد',
    )
    setRefId('')
    setReceiptFile(null)
    setActiveProposalId(null)
    setShowManualPay(false)
    load()
  }

  const markPurchased = async (proposalId) => {
    setBusy(true)
    setMsg(null)
    const res = await repairsService.proposalAction(token, proposalId, {
      action: 'mark_purchased',
    })
    setBusy(false)
    if (!res.success) {
      setMsgOk(false)
      setMsg(res.error || 'خطا در ثبت خرید')
      return
    }
    setMsgOk(true)
    setMsg('خرید در گزارش سرویس ثبت شد')
    load()
  }

  if (loading) {
    return (
      <TrackShell>
        <div className={styles.trackInner}>
          <div className={styles.trackSkeleton}>
            <div className={styles.trackSkelHero} />
            <div className={styles.trackSkelRow} />
            <div className={styles.trackSkelCard} />
            <div className={styles.trackSkelCard} />
          </div>
          <p className={styles.trackMuted}>در حال بارگذاری پرونده سرویس…</p>
        </div>
      </TrackShell>
    )
  }

  if (err || !job) {
    return (
      <TrackShell>
        <div className={styles.trackInner}>
          <div className={styles.trackEmpty}>
            <Search size={28} strokeWidth={1.75} aria-hidden />
            <h1>سفارش پیدا نشد</h1>
            <p>{err || 'لینک پیگیری نامعتبر است یا سفارش حذف شده.'}</p>
            <div className={styles.trackEmptyActions}>
              <Link href="/repairs?tab=track" className={styles.trackBtn}>
                جستجوی کد سفارش
              </Link>
              <Link href="/repairs" className={styles.trackBtnGhost}>
                بازگشت به تعمیرات
              </Link>
            </div>
          </div>
        </div>
      </TrackShell>
    )
  }

  const canceled = job.status === 'canceled'
  const needsPay = !canceled && stage && amount > 0
  const awaitingReceiptReview = stage
    ? pendingCardReceipt(job, { stage })
    : null
  const rejectedReceipt =
    stage && !awaitingReceiptReview
      ? latestRejectedCard(job, { stage })
      : null

  return (
    <TrackShell>
      <div className={styles.trackInner}>
        <header className={styles.trackHero}>
          <div className={styles.trackHeroTop}>
            <Link href="/repairs?tab=track" className={styles.trackBack}>
              <ArrowRight size={16} aria-hidden />
              بازگشت به پیگیری
            </Link>
            <div className={styles.trackHeroActions}>
              {isAuthenticated ? (
                <Link href="/todoservice" className={styles.trackDeskLink}>
                  میز خدمت
                </Link>
              ) : null}
              {canDownloadRepairInvoice(job) ? (
                <InvoicePrintButton
                  job={job}
                  companyTitle={company}
                  className={styles.trackPrintBtn}
                  label="دانلود PDF فاکتور"
                />
              ) : (
                <span className={styles.trackPrintWait}>
                  {job.status === 'completed' && Number(inv.remaining) > 0
                    ? 'چاپ پس از تسویه قطعی'
                    : 'چاپ پس از تکمیل و تسویه'}
                </span>
              )}
            </div>
          </div>
          <p className={styles.trackEyebrow}>{company}</p>
          <div className={styles.trackTitleRow}>
            <div className={styles.trackTitleMain}>
              <h1>
                سفارش <span dir="ltr">{job.code}</span>
              </h1>
              <p className={styles.trackLead}>
                {job.status === 'completed'
                  ? 'سفارش تکمیل شده است؛ فاکتور و گزارش آماده چاپ است.'
                  : Number(inv.remaining) > 0 &&
                      ['mid_paid', 'in_progress', 'awaiting_final'].includes(
                        job.status,
                      )
                    ? 'مبلغ باقیمانده را از بخش پرداخت پایین صفحه تسویه کنید.'
                    : job.status === 'awaiting_final'
                      ? 'پرداخت‌ها انجام شده؛ منتظر تایید نهایی مدیر.'
                      : 'وضعیت سرویس، فاکتور و پرداخت‌های این پرونده'}
              </p>
            </div>
            <span
              className={`${styles.trackBadge} ${
                canceled
                  ? styles.trackBadgeBad
                  : job.status === 'completed'
                    ? styles.trackBadgeOk
                    : styles.trackBadgeLive
              }`}
            >
              {job.status_label}
            </span>
          </div>
        </header>

        {depositDeferred && !canceled && !job.deposit_paid ? (
          <div className={styles.trackDeferNote} role="status">
            <CheckCircle2 size={16} aria-hidden />
            <div>
              <strong>بیعانه با تایید مدیر موکول شد</strong>
              <p>
                کار ادامه دارد؛ مبلغ{' '}
                {formatMoney(
                  job.invoice?.deferred_deposit_amount ?? job.deposit_amount,
                )}{' '}
                تومان در تسویه نهایی لحاظ می‌شود و الان نیازی به پرداخت نیست.
              </p>
            </div>
          </div>
        ) : null}

        {!canceled ? (
          <nav className={styles.trackPipeline} aria-label="مراحل سرویس">
            {PIPELINE.map((item, i) => {
              const done = step > i || job.status === 'completed'
              const on = step === i && job.status !== 'completed'
              const finalOn = job.status === 'completed' && i === PIPELINE.length - 1
              const active = on || finalOn
              return (
                <div
                  key={item.id}
                  className={`${styles.trackPipeStep} ${
                    done || finalOn ? styles.trackPipeDone : ''
                  } ${active ? styles.trackPipeOn : ''}`}
                >
                  <span className={styles.trackPipeDot} aria-hidden>
                    {done || finalOn ? <CheckCircle2 size={14} /> : i + 1}
                  </span>
                  <span className={styles.trackPipeLabel}>{item.label}</span>
                  <span className={styles.trackPipeHint}>{item.hint}</span>
                </div>
              )
            })}
          </nav>
        ) : (
          <p className={styles.trackCancelNote}>این سفارش لغو شده است.</p>
        )}

        <div className={styles.trackStatWidgets}>
          <article className={styles.trackStatWidget}>
            <span className={styles.trackStatLabel}>جمع کل</span>
            <strong className={styles.trackStatValue}>
              {formatMoney(inv.grand_total)} <em>ت</em>
            </strong>
          </article>
          <article className={styles.trackStatWidget}>
            <span className={styles.trackStatLabel}>پرداخت‌شده</span>
            <strong className={styles.trackStatValue}>
              {formatMoney(inv.paid_total)} <em>ت</em>
            </strong>
          </article>
          <article
            className={`${styles.trackStatWidget} ${styles.trackStatWidgetAccent}`}
          >
            <span className={styles.trackStatLabel}>باقیمانده</span>
            <strong className={styles.trackStatValue}>
              {formatMoney(inv.remaining)} <em>ت</em>
            </strong>
          </article>
          <article className={styles.trackStatWidget}>
            <span className={styles.trackStatLabel}>زمان کار</span>
            <strong className={styles.trackStatValue}>
              {Number(inv.labor_minutes || 0).toLocaleString('fa-IR')}{' '}
              <em>دقیقه</em>
            </strong>
          </article>
        </div>

        <section className={`${styles.trackCard} ${styles.trackInfoCard}`}>
          <header className={styles.trackCardHead}>
            <User size={16} aria-hidden />
            <h2>اطلاعات سفارش</h2>
          </header>
          <div className={styles.trackInfoGrid}>
            <div className={styles.trackInfoItem}>
              <span className={styles.trackInfoKey}>نام</span>
              <span className={styles.trackInfoVal}>
                {job.customer_name || '—'}
              </span>
            </div>
            <div className={styles.trackInfoItem}>
              <span className={styles.trackInfoKey}>موبایل</span>
              <span className={styles.trackInfoVal} dir="ltr">
                {job.customer_mobile || '—'}
              </span>
            </div>
            <div className={styles.trackInfoItem}>
              <span className={styles.trackInfoKey}>دستگاه</span>
              <span className={styles.trackInfoVal}>
                {job.device_title || '—'}
              </span>
            </div>
            <div className={styles.trackInfoItem}>
              <span className={styles.trackInfoKey}>سرویسکار</span>
              <span className={styles.trackInfoVal}>
                {job.technician_name || 'هنوز تخصیص نشده'}
              </span>
            </div>
            <div className={styles.trackInfoItem}>
              <span className={styles.trackInfoKey}>زمان برنامه‌ریزی</span>
              <span className={styles.trackInfoVal}>
                {formatDate(job.scheduled_at) || '—'}
              </span>
            </div>
            {job.visited_at ? (
              <div className={styles.trackInfoItem}>
                <span className={styles.trackInfoKey}>زمان بازدید</span>
                <span className={styles.trackInfoVal}>
                  {formatDate(job.visited_at)}
                </span>
              </div>
            ) : null}
            {job.completed_at ? (
              <div className={styles.trackInfoItem}>
                <span className={styles.trackInfoKey}>زمان تکمیل</span>
                <span className={styles.trackInfoVal}>
                  {formatDate(job.completed_at)}
                </span>
              </div>
            ) : null}
            <div className={`${styles.trackInfoItem} ${styles.trackInfoWide}`}>
              <span className={styles.trackInfoKey}>شهر / آدرس</span>
              <span className={styles.trackInfoVal}>
                {job.city || '—'}
                {job.address ? ` — ${job.address}` : ''}
              </span>
            </div>
          </div>
        </section>

        {job.customer_request ? (
          <section className={`${styles.trackCard} ${styles.trackFullRow}`}>
            <header className={styles.trackCardHead}>
              <FileText size={16} aria-hidden />
              <h2>شرح درخواست مشتری</h2>
            </header>
            <p className={styles.trackReport}>{job.customer_request}</p>
          </section>
        ) : null}

        {job.tech_report ? (
          <section
            className={`${styles.trackCard} ${styles.trackCardAccent} ${styles.trackFullRow}`}
          >
            <header className={styles.trackCardHead}>
              <ClipboardList size={16} aria-hidden />
              <h2>گزارش تعمیرکار</h2>
            </header>
            <p className={styles.trackReport}>{job.tech_report}</p>
          </section>
        ) : null}

        {(job.labor_lines?.length > 0 || job.part_lines?.length > 0) && (
          <div className={styles.trackInvoicePair}>
            {job.labor_lines?.length ? (
              <article className={styles.trackInvoiceDoc}>
                <header className={styles.trackInvoiceDocHead}>
                  <div>
                    <span>فاکتور خدمات</span>
                    <h3>اجرت و خدمات</h3>
                  </div>
                  <strong>
                    {formatMoney(
                      job.labor_lines.reduce(
                        (s, l) => s + Number(l.amount || 0),
                        0,
                      ),
                    )}{' '}
                    ت
                  </strong>
                </header>
                <ul className={styles.trackInvoiceDocList}>
                  {job.labor_lines.map((l) => (
                    <li key={l.id}>
                      <div>
                        <strong>{l.title}</strong>
                        {l.note ? (
                          <span className={styles.trackLineNote}>{l.note}</span>
                        ) : null}
                      </div>
                      <div className={styles.trackInvoiceDocMeta}>
                        <span>
                          {Number(l.quantity || 0).toLocaleString('fa-IR')} ×{' '}
                          {formatMoney(l.unit_price)}
                        </span>
                        <em>{formatMoney(l.amount)} ت</em>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
            {job.part_lines?.length ? (
              <article className={styles.trackInvoiceDoc}>
                <header className={styles.trackInvoiceDocHead}>
                  <div>
                    <span>فاکتور قطعات</span>
                    <h3>قطعات مصرفی</h3>
                  </div>
                  <strong>
                    {formatMoney(
                      job.part_lines.reduce(
                        (s, p) => s + Number(p.amount || 0),
                        0,
                      ),
                    )}{' '}
                    ت
                  </strong>
                </header>
                <ul className={styles.trackInvoiceDocList}>
                  {job.part_lines.map((p) => (
                    <li key={p.id}>
                      <div>
                        <strong>{p.title}</strong>
                        {p.note ? (
                          <span className={styles.trackLineNote}>{p.note}</span>
                        ) : null}
                      </div>
                      <div className={styles.trackInvoiceDocMeta}>
                        <span>
                          {Number(p.quantity || 0).toLocaleString('fa-IR')} ×{' '}
                          {formatMoney(p.unit_price)}
                        </span>
                        <em>{formatMoney(p.amount)} ت</em>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>
        )}

        {pendingProposals.length ? (
          <section className={`${styles.trackCard} ${styles.trackProposeCard}`}>
            <header className={styles.trackCardHead}>
              <ClipboardList size={16} aria-hidden />
              <h2>پیشنهادهای مدیر برای ادامه تعمیر</h2>
            </header>
            <p className={styles.trackProposeIntro}>
              برای ادامه کار، این موارد از طرف مرکز سرویس پیشنهاد شده است.
            </p>
            <div className={styles.trackProposeList}>
              {pendingProposals.map((p) => (
                <article key={p.id} className={styles.trackProposeItem}>
                  <div className={styles.trackProposeTop}>
                    <span className={styles.trackProposeType}>
                      {p.proposal_type === 'shop_product' ? (
                        <>
                          <ShoppingBag size={14} aria-hidden /> خرید فروشگاه
                        </>
                      ) : (
                        <>
                          <CreditCard size={14} aria-hidden /> پرداخت فاکتور
                        </>
                      )}
                    </span>
                    <strong className={styles.trackProposeAmount}>
                      {formatMoney(p.amount)} ت
                    </strong>
                  </div>
                  <h3>{p.title}</h3>
                  {p.description ? (
                    <p className={styles.trackProposeDesc}>{p.description}</p>
                  ) : null}

                  {p.proposal_type === 'shop_product' ? (
                    <div className={styles.trackProposeShop}>
                      <span>
                        محصول: <strong>{p.product_title || p.title}</strong>
                        {p.quantity > 1
                          ? ` × ${Number(p.quantity).toLocaleString('fa-IR')}`
                          : ''}
                      </span>
                      <div className={styles.trackPayActions}>
                        {p.product_path ? (
                          <Link
                            href={p.product_path}
                            className={styles.trackBtn}
                            target="_blank"
                          >
                            مشاهده و خرید از فروشگاه
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          className={styles.trackBtnGhost}
                          disabled={busy}
                          onClick={() => markPurchased(p.id)}
                        >
                          خریدم — ثبت در گزارش
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.trackProposePay}>
                      <div className={styles.trackPayActions}>
                        <button
                          type="button"
                          className={styles.trackBtn}
                          disabled={busy}
                          onClick={() =>
                            payGateway({
                              stage: 'extra',
                              proposalId: p.id,
                              purpose: p.title,
                            })
                          }
                        >
                          پرداخت اینترنتی این مورد
                        </button>
                        <button
                          type="button"
                          className={styles.trackBtnGhost}
                          disabled={busy}
                          onClick={() =>
                            setActiveProposalId(
                              activeProposalId === p.id ? null : p.id,
                            )
                          }
                        >
                          ثبت رسید کارت‌به‌کارت
                        </button>
                      </div>
                      {activeProposalId === p.id ? (
                        <div className={styles.trackCardForm} data-track-card-form>
                          <RepairsBankCard
                            cardNumber={config?.bank_card_number}
                            holder={config?.bank_card_holder}
                            bankName={config?.bank_name}
                            instructions={config?.payment_instructions}
                            amount={p.amount}
                            amountLabel="مبلغ این مورد"
                            formatMoney={formatMoney}
                          />
                          <div className={styles.trackFields}>
                            <label className={styles.trackField}>
                              کد پیگیری واریز
                              <input
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                dir="ltr"
                              />
                            </label>
                            <ReceiptDropzone
                              file={receiptFile}
                              onChange={setReceiptFile}
                              disabled={busy}
                            />
                          </div>
                          <button
                            type="button"
                            className={styles.trackBtn}
                            disabled={busy}
                            onClick={() =>
                              payCard({
                                stage: 'extra',
                                proposalId: p.id,
                                purpose: p.title,
                              })
                            }
                          >
                            ثبت رسید بابت «{p.title}»
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {resolvedProposals.length ? (
          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <ClipboardList size={16} aria-hidden />
              <h2>سوابق پیشنهادها در گزارش</h2>
            </header>
            <div className={styles.trackTableWrap}>
              <table className={styles.trackTable}>
                <thead>
                  <tr>
                    <th>موضوع</th>
                    <th>نوع</th>
                    <th>مبلغ</th>
                    <th>نتیجه</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedProposals.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.title}</strong>
                        {p.customer_note ? (
                          <span className={styles.trackLineNote}>
                            {p.customer_note}
                          </span>
                        ) : null}
                      </td>
                      <td>{p.type_label || p.proposal_type}</td>
                      <td>{formatMoney(p.amount)}</td>
                      <td>{p.status_label || p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div
          className={`${styles.trackFinanceLayout} ${
            needsPay && showManualPay && !awaitingReceiptReview
              ? ''
              : styles.trackFinanceLayoutSolo
          }`}
        >
          <section className={`${styles.trackCard} ${styles.trackFinanceCard}`}>
            <header className={styles.trackCardHead}>
              <CreditCard size={16} aria-hidden />
              <h2>بخش مالی</h2>
            </header>
            <div className={styles.trackFinanceChips}>
              <span>
                اجرت <strong>{formatMoney(inv.labor_total)}</strong>
              </span>
              <span>
                قطعات <strong>{formatMoney(inv.parts_total)}</strong>
              </span>
              <span>
                زمان{' '}
                <strong>
                  {formatMoney(inv.time_total)}
                  <small>
                    ({Number(inv.labor_minutes || 0).toLocaleString('fa-IR')}د)
                  </small>
                </strong>
              </span>
              <span>
                جمع <strong>{formatMoney(inv.grand_total)}</strong>
              </span>
              <span>
                پرداخت‌شده <strong>{formatMoney(inv.paid_total)}</strong>
              </span>
              <span className={styles.trackFinanceRemain}>
                باقیمانده{' '}
                <strong>
                  {formatMoney(
                    inv.remaining != null ? inv.remaining : balanceDue(job),
                  )}
                </strong>
              </span>
            </div>
            {(inv.deferred_deposit_amount > 0 ||
              (depositDeferred && Number(job.deposit_amount) > 0)) && (
              <p className={styles.trackFinanceNote}>
                بیعانه معوق:{' '}
                <strong>
                  {formatMoney(
                    inv.deferred_deposit_amount ?? job.deposit_amount,
                  )}{' '}
                  تومان
                </strong>
              </p>
            )}

            {job.payments?.length ? (
              <div className={styles.trackPayHistory}>
                <h3 className={styles.trackBandTitle}>تاریخچه پرداخت</h3>
                <ul className={styles.trackPayHistoryList}>
                  {job.payments.map((p) => (
                    <li key={p.id} className={styles.trackPayHistoryRow}>
                      <div className={styles.trackBandMain}>
                        <strong>
                          {p.purpose_label ||
                            p.purpose ||
                            paymentStageLabel(p.stage)}
                        </strong>
                        <span className={styles.trackLineNote}>
                          {(p.method_label || paymentMethodLabel(p.method)) +
                            ' · ' +
                            (p.stage_label || paymentStageLabel(p.stage))}
                          {formatDate(p.paid_at || p.created_at)
                            ? ` · ${formatDate(p.paid_at || p.created_at)}`
                            : ''}
                        </span>
                      </div>
                      <div className={styles.trackBandMeta}>
                        <span className={styles.trackPayStatus}>
                          {p.status_label || paymentStatusLabel(p.status)}
                        </span>
                        <em>{formatMoney(p.amount)} ت</em>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {needsPay ? (
              <div className={styles.trackPayInline}>
                <div className={styles.trackPayInlineHead}>
                  <h3>{stageTitle(stage)}</h3>
                  <strong>{formatMoney(amount)} تومان</strong>
                </div>
                {stage === 'final' ? (
                  <p className={styles.trackFinanceNote}>
                    {job.status === 'completed'
                      ? 'سفارش تکمیل شده؛ تسویه باقیمانده را از یکی از روش‌های زیر انجام دهید.'
                      : 'بعد از پرداخت و تایید مدیر، سفارش تکمیل و فاکتور قابل چاپ می‌شود.'}
                  </p>
                ) : null}

                {awaitingReceiptReview ? (
                  <div className={styles.trackReceiptWaiting}>
                    <p className={styles.trackFlashOk}>
                      سند شما ارسال شد. پس از بررسی مدیر، تایید یا رد خواهد شد.
                    </p>
                    <p className={styles.trackMutedCenter}>
                      تا زمان بررسی، امکان پرداخت مجدد وجود ندارد.
                      {awaitingReceiptReview.ref_id
                        ? ` کد پیگیری: ${awaitingReceiptReview.ref_id}`
                        : ''}
                    </p>
                  </div>
                ) : (
                  <>
                    {rejectedReceipt ? (
                      <p className={styles.trackFlash} style={{ marginBottom: 8 }}>
                        رسید قبلی رد شد. لطفاً دوباره از یکی از روش‌های زیر پرداخت
                        کنید.
                      </p>
                    ) : null}

                    <div className={styles.trackPayActions}>
                      <button
                        type="button"
                        className={styles.trackBtn}
                        disabled={busy}
                        onClick={() => payGateway()}
                      >
                        پرداخت اینترنتی (درگاه)
                      </button>
                      <button
                        type="button"
                        className={styles.trackBtnGhost}
                        disabled={
                          busy ||
                          walletBalance == null ||
                          walletBalance < amount
                        }
                        title={
                          walletBalance == null
                            ? 'برای پرداخت از کیف پول وارد حساب شوید'
                            : walletBalance < amount
                              ? `موجودی ناکافی (${formatMoney(walletBalance)} ت)`
                              : `موجودی: ${formatMoney(walletBalance)} ت`
                        }
                        onClick={() => payWallet()}
                      >
                        کیف پول
                        {walletBalance != null
                          ? ` (${formatMoney(walletBalance)} ت)`
                          : ''}
                      </button>
                      <button
                        type="button"
                        className={`${styles.trackBtnGhost} ${
                          showManualPay ? styles.trackBtnGhostOn : ''
                        }`}
                        disabled={busy}
                        onClick={() =>
                          setShowManualPay((open) => {
                            if (open) {
                              setReceiptFile(null)
                              setRefId('')
                            }
                            return !open
                          })
                        }
                      >
                        واریز دستی
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : job.status === 'completed' && balanceDue(job) <= 0 ? (
              <p className={`${styles.trackFlash} ${styles.trackFlashOk}`}>
                سفارش تکمیل و تسویه شده است.
              </p>
            ) : !canceled && !pendingProposals.length ? (
              <p className={styles.trackMutedCenter}>
                در این مرحله پرداخت مرحله‌ای لازم نیست — اگر مدیر پیشنهادی
                بفرستد اینجا نمایش داده می‌شود.
              </p>
            ) : null}
          </section>

          {needsPay && showManualPay && !awaitingReceiptReview ? (
            <aside className={styles.trackFinanceBank}>
              {config?.bank_card_number ? (
                <RepairsBankCard
                  cardNumber={config.bank_card_number}
                  holder={config.bank_card_holder}
                  bankName={config.bank_name}
                  instructions={config.payment_instructions}
                  amount={amount}
                  amountLabel="مبلغ قابل پرداخت"
                  formatMoney={formatMoney}
                  compact
                />
              ) : (
                <p className={styles.trackFinanceNote}>
                  شماره کارت واریز هنوز در تنظیمات ثبت نشده است.
                </p>
              )}
              <div className={styles.trackManualForm}>
                <p className={styles.trackFormLabel}>ثبت رسید کارت‌به‌کارت</p>
                <div className={styles.trackManualFields}>
                  <label className={styles.trackField}>
                    کد پیگیری واریز
                    <input
                      value={refId}
                      onChange={(e) => setRefId(e.target.value)}
                      dir="ltr"
                      placeholder="کد پیگیری بانکی"
                    />
                  </label>
                  <ReceiptDropzone
                    file={receiptFile}
                    onChange={setReceiptFile}
                    disabled={busy}
                  />
                </div>
                <button
                  type="button"
                  className={styles.trackBtn}
                  disabled={busy || !receiptFile}
                  onClick={() => payCard()}
                >
                  ثبت رسید واریز
                </button>
              </div>
            </aside>
          ) : null}
        </div>

        {job.status === 'completed' && job.technician ? (
          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <UserCog size={16} aria-hidden />
              <h2>امتیاز به سرویسکار</h2>
            </header>
            <TechRatingForm
              title={job.technician_name || 'سرویسکار'}
              subtitle="کیفیت کار، اخلاق حرفه‌ای، وقت‌شناسی، ارتباط و نظم"
              existing={job.ratings?.customer || null}
              busy={busy}
              onSubmit={
                job.ratings?.can_rate
                  ? async (payload) => {
                      setBusy(true)
                      const res = await repairsService.trackRate(token, payload)
                      setBusy(false)
                      if (!res.success) {
                        setMsg(res.error || 'خطا در ثبت امتیاز')
                        setMsgOk(false)
                        return
                      }
                      if (res.data?.job) setJob(res.data.job)
                      else await load()
                      setMsg(res.message || 'امتیاز ثبت شد')
                      setMsgOk(true)
                    }
                  : undefined
              }
            />
          </section>
        ) : null}

        {msg ? (
          <p
            className={`${styles.trackFlash} ${
              msgOk ? styles.trackFlashOk : styles.trackFlashErr
            }`}
          >
            {msg}
          </p>
        ) : null}
      </div>

      {gatewayHint ? (
        <div
          className={styles.trackPayAltOverlay}
          onClick={() => setGatewayHint(null)}
          role="presentation"
        >
          <div
            className={styles.trackPayAltCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-pay-alt-title"
          >
            <span className={styles.trackPayAltIcon} aria-hidden>
              <AlertCircle size={20} />
            </span>
            <h3 id="track-pay-alt-title" className={styles.trackPayAltTitle}>
              درگاه پرداخت فعال نیست
            </h3>
            <p className={styles.trackPayAltText}>
              الان امکان پرداخت اینترنتی وجود ندارد. برای ادامه مبلغ را
              کارت‌به‌کارت واریز کنید و رسید را همین پایین ثبت کنید
              {walletBalance != null && walletBalance >= amount
                ? '، یا از کیف پول استفاده کنید'
                : ''}
              .
            </p>
            <div className={styles.trackPayAltActions}>
              <button
                type="button"
                className={styles.trackBtn}
                onClick={() => {
                  setActiveProposalId(gatewayHint.proposalId || null)
                  setGatewayHint(null)
                  if (typeof document !== 'undefined') {
                    document
                      .querySelector('[data-track-card-form]')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }}
              >
                <CreditCard size={14} />
                کارت‌به‌کارت
              </button>
              {walletBalance != null && walletBalance >= amount ? (
                <button
                  type="button"
                  className={styles.trackBtnGhost}
                  disabled={busy}
                  onClick={() => {
                    const ctx = gatewayHint
                    setGatewayHint(null)
                    payWallet({
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
                className={styles.trackBtnGhost}
                onClick={() => setGatewayHint(null)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </TrackShell>
  )
}

export default function RepairsTrackPage({ token }) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS} notFoundWhenInactive>
      <TrackInner token={token} />
    </ModuleGate>
  )
}
