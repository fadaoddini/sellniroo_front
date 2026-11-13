'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Printer,
  Search,
  ShoppingBag,
  Smartphone,
  User,
  UserCog,
  Wrench,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import repairsService from '@/components/Repairs/services/repairsService'
import styles from './Repairs.module.css'

function formatMoney(n) {
  return Number(n || 0).toLocaleString('fa-IR')
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
    hint: 'تایید / تخصیص',
    statuses: ['booked', 'assigned'],
  },
  {
    id: 'visit',
    label: 'بازدید',
    hint: 'گزارش فنی',
    statuses: ['visited', 'awaiting_mid'],
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
  // باقیمانده فاکتور — حتی حین تعمیر / بعد از اعلام پایان کار
  if (
    ['mid_paid', 'in_progress', 'awaiting_final'].includes(job.status) &&
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
  if (method === 'cash') return 'نقدی'
  return method || '—'
}

function TrackShell({ children }) {
  return (
    <div className={styles.trackPage} dir="rtl" data-repairs-track="1">
      {children}
    </div>
  )
}

function TrackInner({ token }) {
  const [job, setJob] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [msgOk, setMsgOk] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [refId, setRefId] = useState('')
  const [activeProposalId, setActiveProposalId] = useState(null)

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

  const stage = nextStage(job)
  const amount = stageAmount(job, stage)
  const step = useMemo(() => pipelineIndex(job?.status), [job?.status])
  const inv = job?.invoice || {}
  const company = config?.company_title || inv.company_title || 'صدرا'
  const pendingProposals = useMemo(
    () => (job?.proposals || []).filter((p) => p.status === 'pending'),
    [job?.proposals],
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
    setBusy(true)
    setMsg(null)
    const res = await repairsService.payGateway(token, payStage, {
      proposal_id: opts.proposalId || undefined,
      purpose: opts.purpose || undefined,
    })
    setBusy(false)
    if (!res.success) {
      setMsgOk(false)
      setMsg(res.error || 'خطا در شروع پرداخت')
      return
    }
    if (res.data?.payment_url) {
      window.location.href = res.data.payment_url
      return
    }
    setMsgOk(false)
    setMsg('لینک درگاه در دسترس نیست')
  }

  const payCard = async (opts = {}) => {
    const payStage = opts.stage || stage
    if (!payStage) return
    const fd = new FormData()
    fd.append('stage', payStage)
    fd.append('method', 'card_transfer')
    if (opts.proposalId) fd.append('proposal_id', String(opts.proposalId))
    if (opts.purpose) fd.append('purpose', opts.purpose)
    if (refId) fd.append('ref_id', refId)
    if (receiptFile) fd.append('receipt_image', receiptFile)
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
    setMsg('رسید ثبت شد و منتظر تایید مدیر است')
    setRefId('')
    setReceiptFile(null)
    setActiveProposalId(null)
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

  return (
    <TrackShell>
      <div className={styles.trackInner}>
        <header className={styles.trackHero}>
          <div className={styles.trackHeroTop}>
            <Link href="/repairs?tab=track" className={styles.trackBack}>
              <ArrowRight size={16} aria-hidden />
              پیگیری سفارش‌ها
            </Link>
            {job.printable || job.status === 'completed' ? (
              <button
                type="button"
                className={styles.trackPrintBtn}
                onClick={() => window.print()}
              >
                <Printer size={15} aria-hidden />
                چاپ فاکتور و گزارش
              </button>
            ) : (
              <span className={styles.trackPrintWait}>
                چاپ پس از تایید تکمیل توسط مدیر
              </span>
            )}
          </div>
          <p className={styles.trackEyebrow}>{company} · گزارش سرویس</p>
          <div className={styles.trackTitleRow}>
            <h1>پیگیری سفارش {job.code}</h1>
            <span
              className={`${styles.trackBadge} ${
                canceled
                  ? styles.trackBadgeBad
                  : job.status === 'completed'
                    ? styles.trackBadgeOk
                    : ''
              }`}
            >
              {job.status_label}
            </span>
          </div>
          <p className={styles.trackLead}>
            {job.status === 'completed'
              ? 'سفارش تکمیل شده است. می‌توانید فاکتور و گزارش را چاپ کنید.'
              : Number(inv.remaining) > 0 &&
                  ['mid_paid', 'in_progress', 'awaiting_final'].includes(job.status)
                ? 'مبلغ باقیمانده فاکتور را از بخش پایین صفحه پرداخت کنید (درگاه یا ثبت رسید کارت).'
                : job.status === 'awaiting_final'
                  ? 'پرداخت‌ها انجام شده — منتظر تایید نهایی مدیر برای صدور فاکتور قابل چاپ.'
                  : 'وضعیت سرویس، فاکتور و پرداخت‌های این پرونده'}
          </p>
        </header>

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

        <div className={styles.trackStats}>
          <div className={styles.trackStat}>
            <span>جمع کل</span>
            <strong>{formatMoney(inv.grand_total)} ت</strong>
          </div>
          <div className={styles.trackStat}>
            <span>پرداخت‌شده</span>
            <strong>{formatMoney(inv.paid_total)} ت</strong>
          </div>
          <div className={styles.trackStat}>
            <span>باقیمانده</span>
            <strong className={styles.trackStatRemain}>
              {formatMoney(inv.remaining)} ت
            </strong>
          </div>
          <div className={styles.trackStat}>
            <span>زمان کار</span>
            <strong>{Number(inv.labor_minutes || 0).toLocaleString('fa-IR')} دقیقه</strong>
          </div>
        </div>

        <div className={styles.trackGrid}>
          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <User size={16} aria-hidden />
              <h2>مشتری و محل سرویس</h2>
            </header>
            <dl className={styles.trackDl}>
              <div>
                <dt>نام</dt>
                <dd>{job.customer_name || '—'}</dd>
              </div>
              <div>
                <dt>
                  <Smartphone size={12} aria-hidden /> موبایل
                </dt>
                <dd dir="ltr">{job.customer_mobile || '—'}</dd>
              </div>
              <div>
                <dt>
                  <MapPin size={12} aria-hidden /> شهر / آدرس
                </dt>
                <dd>
                  {job.city || '—'}
                  {job.address ? ` — ${job.address}` : ''}
                </dd>
              </div>
              {job.scheduled_at ? (
                <div>
                  <dt>زمان برنامه‌ریزی</dt>
                  <dd>{formatDate(job.scheduled_at)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <Wrench size={16} aria-hidden />
              <h2>دستگاه و تکنسین</h2>
            </header>
            <dl className={styles.trackDl}>
              <div>
                <dt>دستگاه</dt>
                <dd>{job.device_title || '—'}</dd>
              </div>
              <div>
                <dt>
                  <UserCog size={12} aria-hidden /> سرویسکار اعزامی
                </dt>
                <dd>{job.technician_name || 'هنوز تخصیص نشده'}</dd>
              </div>
              {job.visited_at ? (
                <div>
                  <dt>زمان بازدید</dt>
                  <dd>{formatDate(job.visited_at)}</dd>
                </div>
              ) : null}
              {job.completed_at ? (
                <div>
                  <dt>زمان تکمیل</dt>
                  <dd>{formatDate(job.completed_at)}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        {(job.customer_request || job.tech_report) && (
          <div className={styles.trackGrid}>
            {job.customer_request ? (
              <section className={styles.trackCard}>
                <header className={styles.trackCardHead}>
                  <FileText size={16} aria-hidden />
                  <h2>شرح درخواست مشتری</h2>
                </header>
                <p className={styles.trackReport}>{job.customer_request}</p>
              </section>
            ) : null}
            {job.tech_report ? (
              <section className={`${styles.trackCard} ${styles.trackCardAccent}`}>
                <header className={styles.trackCardHead}>
                  <ClipboardList size={16} aria-hidden />
                  <h2>گزارش تعمیرکار</h2>
                </header>
                <p className={styles.trackReport}>{job.tech_report}</p>
              </section>
            ) : null}
          </div>
        )}

        {(job.labor_lines?.length > 0 || job.part_lines?.length > 0) && (
          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <Package size={16} aria-hidden />
              <h2>خدمات و قطعات</h2>
            </header>
            {job.labor_lines?.length ? (
              <div className={styles.trackTableWrap}>
                <table className={styles.trackTable}>
                  <thead>
                    <tr>
                      <th>اجرت / خدمت</th>
                      <th>تعداد</th>
                      <th>مبلغ واحد</th>
                      <th>جمع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.labor_lines.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <strong>{l.title}</strong>
                          {l.note ? (
                            <span className={styles.trackLineNote}>{l.note}</span>
                          ) : null}
                        </td>
                        <td>{Number(l.quantity || 0).toLocaleString('fa-IR')}</td>
                        <td>{formatMoney(l.unit_price)}</td>
                        <td>{formatMoney(l.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {job.part_lines?.length ? (
              <div className={styles.trackTableWrap}>
                <table className={styles.trackTable}>
                  <thead>
                    <tr>
                      <th>قطعه</th>
                      <th>تعداد</th>
                      <th>مبلغ واحد</th>
                      <th>جمع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.part_lines.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                          {p.note ? (
                            <span className={styles.trackLineNote}>{p.note}</span>
                          ) : null}
                        </td>
                        <td>{Number(p.quantity || 0).toLocaleString('fa-IR')}</td>
                        <td>{formatMoney(p.unit_price)}</td>
                        <td>{formatMoney(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
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
                        <div className={styles.trackCardForm}>
                          {config?.bank_card_number ? (
                            <div className={styles.trackBank}>
                              <div>
                                <span>کارت</span>
                                <strong dir="ltr">
                                  {config.bank_card_number}
                                </strong>
                              </div>
                              <div>
                                <span>به‌نام</span>
                                <strong>
                                  {config.bank_card_holder || '—'}
                                </strong>
                              </div>
                            </div>
                          ) : null}
                          <div className={styles.trackFields}>
                            <label className={styles.trackField}>
                              کد پیگیری واریز
                              <input
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                dir="ltr"
                              />
                            </label>
                            <label className={styles.trackField}>
                              تصویر رسید
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setReceiptFile(e.target.files?.[0] || null)
                                }
                              />
                            </label>
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

        <section className={`${styles.trackCard} ${styles.trackInvoice}`}>
          <header className={styles.trackCardHead}>
            <CreditCard size={16} aria-hidden />
            <h2>فاکتور سرویس</h2>
          </header>
          <div className={styles.trackInvoiceRows}>
            <div>
              <span>جمع اجرت‌ها</span>
              <strong>{formatMoney(inv.labor_total)} تومان</strong>
            </div>
            <div>
              <span>جمع قطعات</span>
              <strong>{formatMoney(inv.parts_total)} تومان</strong>
            </div>
            <div>
              <span>
                هزینه زمان ({Number(inv.labor_minutes || 0).toLocaleString('fa-IR')} دقیقه
                {inv.hourly_rate
                  ? ` · نرخ ${formatMoney(inv.hourly_rate)}`
                  : ''}
                )
              </span>
              <strong>{formatMoney(inv.time_total)} تومان</strong>
            </div>
          </div>
          <div className={styles.trackInvoiceTotals}>
            <div className={styles.trackTotalRow}>
              <span>جمع کل</span>
              <span>{formatMoney(inv.grand_total)} تومان</span>
            </div>
            <div className={styles.trackTotalRow}>
              <span>پرداخت‌شده</span>
              <span>{formatMoney(inv.paid_total)} تومان</span>
            </div>
            <div className={`${styles.trackTotalRow} ${styles.trackTotalRemain}`}>
              <span>باقیمانده</span>
              <span>{formatMoney(inv.remaining)} تومان</span>
            </div>
          </div>
        </section>

        {job.payments?.length ? (
          <section className={styles.trackCard}>
            <header className={styles.trackCardHead}>
              <CreditCard size={16} aria-hidden />
              <h2>تاریخچه پرداخت — بابت چه موضوعی</h2>
            </header>
            <div className={styles.trackTableWrap}>
              <table className={styles.trackTable}>
                <thead>
                  <tr>
                    <th>موضوع پرداخت</th>
                    <th>مرحله</th>
                    <th>روش</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                    <th>زمان</th>
                  </tr>
                </thead>
                <tbody>
                  {job.payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {p.purpose_label || p.purpose || paymentStageLabel(p.stage)}
                        </strong>
                      </td>
                      <td>{p.stage_label || paymentStageLabel(p.stage)}</td>
                      <td>{p.method_label || paymentMethodLabel(p.method)}</td>
                      <td>{formatMoney(p.amount)}</td>
                      <td>
                        <span className={styles.trackPayStatus}>
                          {p.status_label || paymentStatusLabel(p.status)}
                        </span>
                      </td>
                      <td>{formatDate(p.paid_at || p.created_at) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {needsPay ? (
          <section className={`${styles.trackCard} ${styles.trackPayCard}`}>
            <header className={styles.trackCardHead}>
              <CreditCard size={16} aria-hidden />
              <h2>{stageTitle(stage)}</h2>
            </header>
            <p className={styles.trackPayAmount}>
              مبلغ باقیمانده قابل پرداخت:{' '}
              <strong>{formatMoney(amount)} تومان</strong>
            </p>
            {stage === 'final' ? (
              <p className={styles.trackMutedCenter} style={{ marginTop: 0 }}>
                بعد از پرداخت و تایید مدیر، سفارش تکمیل و فاکتور قابل چاپ می‌شود.
              </p>
            ) : null}

            {config?.bank_card_number ? (
              <div className={styles.trackBank}>
                <div>
                  <span>شماره کارت</span>
                  <strong dir="ltr">{config.bank_card_number}</strong>
                </div>
                <div>
                  <span>به‌نام</span>
                  <strong>
                    {config.bank_card_holder || '—'}
                    {config.bank_name ? ` · ${config.bank_name}` : ''}
                  </strong>
                </div>
                {config.payment_instructions ? (
                  <p>{config.payment_instructions}</p>
                ) : null}
              </div>
            ) : null}

            <div className={styles.trackPayActions}>
              <button
                type="button"
                className={styles.trackBtn}
                disabled={busy}
                onClick={() => payGateway()}
              >
                پرداخت اینترنتی
              </button>
            </div>

            <div className={styles.trackCardForm}>
              <p className={styles.trackFormLabel}>یا ثبت رسید کارت‌به‌کارت</p>
              <div className={styles.trackFields}>
                <label className={styles.trackField}>
                  کد پیگیری واریز
                  <input
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    dir="ltr"
                    placeholder="کد پیگیری بانکی"
                  />
                </label>
                <label className={styles.trackField}>
                  تصویر رسید
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <button
                type="button"
                className={styles.trackBtnGhost}
                disabled={busy}
                onClick={() => payCard()}
              >
                ثبت رسید واریز
              </button>
            </div>
          </section>
        ) : job.status === 'completed' ? (
          <p className={`${styles.trackFlash} ${styles.trackFlashOk}`}>
            سفارش تکمیل و تسویه شده است.
          </p>
        ) : !canceled && !pendingProposals.length ? (
          <p className={styles.trackMutedCenter}>
            در این مرحله پرداخت مرحله‌ای لازم نیست — اگر مدیر پیشنهادی بفرستد اینجا
            نمایش داده می‌شود.
          </p>
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
