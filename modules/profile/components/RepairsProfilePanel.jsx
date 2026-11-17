'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  UserCog,
  Wrench,
} from 'lucide-react'
import repairsService from '@/components/Repairs/services/repairsService'
import styles from '../styles/RepairsProfilePanel.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function badgeClass(status) {
  if (status === 'completed' || status === 'paid' || status === 'purchased') {
    return styles.badgeOk
  }
  if (
    String(status || '').includes('awaiting') ||
    status === 'pending' ||
    status === 'in_progress' ||
    status === 'visited' ||
    status === 'assigned' ||
    status === 'mid_paid'
  ) {
    return styles.badgeWarn
  }
  if (status === 'canceled' || status === 'rejected') return styles.badgeBad
  return ''
}

function attentionKindLabel(item) {
  if (item.kind === 'proposal' && item.proposal_type === 'shop_product') {
    return 'خرید از فروشگاه'
  }
  if (item.kind === 'proposal') return 'پرداخت پیشنهادی'
  if (item.kind === 'stage_payment') return 'پرداخت باقیمانده'
  if (item.kind === 'receipt_pending') return 'رسید در انتظار تایید'
  return 'اقدام لازم'
}

function jobBalance(job) {
  const inv = job?.invoice || {}
  if (inv.remaining != null) return Number(inv.remaining) || 0
  if (job?.balance_due != null) return Number(job.balance_due) || 0
  return Math.max(0, Number(job?.grand_total || 0) - Number(job?.paid_total || 0))
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

function JobPipeline({ status }) {
  const step = pipelineIndex(status)
  if (step < 0) {
    return <p className={styles.pipeCancel}>این سفارش لغو شده است.</p>
  }
  const completed = status === 'completed'

  return (
    <nav className={styles.pipeline} aria-label="مراحل سفارش">
      {PIPELINE.map((item, i) => {
        const done = completed || step > i
        const current = !completed && step === i
        return (
          <div
            key={item.id}
            className={`${styles.pipeStep} ${done ? styles.pipeDone : ''} ${
              current ? styles.pipeOn : ''
            }`}
          >
            <span className={styles.pipeDot} aria-hidden>
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </span>
            <span className={styles.pipeLabel}>{item.label}</span>
            <span className={styles.pipeHint}>
              {current ? 'الان اینجا هستید' : item.hint}
            </span>
          </div>
        )
      })}
    </nav>
  )
}

function JobCard({ job, showPipeline = false }) {
  const inv = job.invoice || {}
  const due = jobBalance(job)
  const pendingProps = (job.proposals || []).filter((p) => p.status === 'pending')
  const paidCount = (job.payments || []).filter((p) => p.status === 'paid').length
  const step = pipelineIndex(job.status)
  const currentStep =
    step >= 0 ? PIPELINE[Math.min(step, PIPELINE.length - 1)] : null

  return (
    <article className={styles.jobCard}>
      <div className={styles.jobHead}>
        <div>
          <p className={styles.jobEyebrow}>پرونده سرویس</p>
          <h3>سفارش {job.code}</h3>
        </div>
        <span className={`${styles.badge} ${badgeClass(job.status)}`}>
          {job.status_label}
        </span>
      </div>

      {showPipeline ? (
        <div className={styles.pipeWrap}>
          {currentStep && job.status !== 'completed' ? (
            <p className={styles.pipeNow}>
              مرحله فعلی: <strong>{currentStep.label}</strong>
              <span> — {currentStep.hint}</span>
            </p>
          ) : null}
          <JobPipeline status={job.status} />
        </div>
      ) : null}

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden>
            <Wrench size={14} />
          </span>
          <div>
            <span className={styles.infoLabel}>دستگاه</span>
            <strong>{job.device_title || '—'}</strong>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden>
            <UserCog size={14} />
          </span>
          <div>
            <span className={styles.infoLabel}>سرویسکار</span>
            <strong>{job.technician_name || 'هنوز تخصیص نشده'}</strong>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden>
            <MapPin size={14} />
          </span>
          <div>
            <span className={styles.infoLabel}>محل</span>
            <strong>
              {job.city || '—'}
              {job.address ? ` — ${job.address}` : ''}
            </strong>
          </div>
        </div>
      </div>

      <div className={styles.moneyRow}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>جمع فاکتور</span>
          <strong>{money(inv.grand_total ?? job.grand_total)} ت</strong>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>پرداخت‌شده</span>
          <strong>{money(inv.paid_total ?? job.paid_total)} ت</strong>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>باقیمانده</span>
          <strong className={due > 0 ? styles.remainWarn : undefined}>
            {money(due)} ت
          </strong>
        </div>
      </div>

      {(pendingProps.length || paidCount) ? (
        <div className={styles.chipRow}>
          {pendingProps.length ? (
            <span className={`${styles.chip} ${styles.chipWarn}`}>
              {pendingProps.length} پیشنهاد باز
            </span>
          ) : null}
          {paidCount ? (
            <span className={`${styles.chip} ${styles.chipOk}`}>
              {paidCount} پرداخت ثبت‌شده
            </span>
          ) : null}
          {due > 0 ? (
            <span className={`${styles.chip} ${styles.chipWarn}`}>نیاز به تسویه</span>
          ) : null}
        </div>
      ) : null}

      <div className={styles.attActions}>
        <Link
          href={`/repairs/track/${job.tracking_token}`}
          className={styles.btn}
        >
          {due > 0 ? 'پرداخت و پیگیری' : 'جزئیات و فاکتور'}
          <ArrowLeft size={13} />
        </Link>
      </div>
    </article>
  )
}

export default function RepairsProfilePanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [innerTab, setInnerTab] = useState('action')
  const [isTechnician, setIsTechnician] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    const [res, techRes] = await Promise.all([
      repairsService.my(),
      repairsService.techMe(),
    ])
    setIsTechnician(!!(techRes.success && techRes.data?.technician))
    setLoading(false)
    if (!res.success) {
      setErr(res.error || 'خطا در بارگذاری')
      setData(null)
      return
    }
    setData(res.data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const jobs = data?.jobs || []
  const attention = data?.attention || []
  const summary = data?.summary || {}

  const openJobs = useMemo(
    () =>
      jobs.filter(
        (j) => j.status !== 'completed' && j.status !== 'canceled',
      ),
    [jobs],
  )
  const doneJobs = useMemo(
    () => jobs.filter((j) => j.status === 'completed'),
    [jobs],
  )

  useEffect(() => {
    if (!data) return
    if (attention.length) setInnerTab('action')
    else if (openJobs.length) setInnerTab('open')
    else if (doneJobs.length) setInnerTab('done')
    else setInnerTab('all')
  }, [data, attention.length, openJobs.length, doneJobs.length])

  const tabs = [
    {
      id: 'action',
      label: 'اقدام لازم',
      count: attention.length,
      icon: CreditCard,
    },
    {
      id: 'open',
      label: 'در جریان',
      count: openJobs.length,
      icon: ClipboardList,
    },
    {
      id: 'done',
      label: 'تکمیل‌شده',
      count: doneJobs.length,
      icon: CheckCircle2,
    },
    {
      id: 'all',
      label: 'همه',
      count: jobs.length,
      icon: Wrench,
    },
  ]

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 size={18} className={styles.spin} /> در حال بارگذاری پرونده‌های
        تعمیر…
      </div>
    )
  }

  if (err) {
    return (
      <div className={styles.error}>
        {err}
        <div style={{ marginTop: 8 }}>
          <button type="button" className={styles.btnGhost} onClick={load}>
            تلاش دوباره
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap} dir="rtl">
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <h2>
            <Wrench size={15} strokeWidth={2.1} aria-hidden />
            تعمیرات من
          </h2>
          <p className={styles.lead}>
            وضعیت سرویس، پرداخت‌ها و پیشنهادهای باز
          </p>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.btnGhost} onClick={load}>
            <RefreshCw size={13} /> بروزرسانی
          </button>
          <Link href="/repairs" className={styles.btn}>
            <Wrench size={13} /> درخواست جدید
          </Link>
          <Link href="/repairs?tab=track" className={styles.btnGhost}>
            <ClipboardList size={13} /> پیگیری
          </Link>
          {isTechnician ? (
            <Link href="/todoservice" className={styles.btnGhost}>
              <UserCog size={13} /> میزکار
            </Link>
          ) : null}
        </div>
      </header>

      <div className={styles.stats} aria-hidden={false}>
        <div className={styles.stat}>
          <strong>{money(summary.total ?? jobs.length)}</strong>
          <span>کل</span>
        </div>
        <div className={styles.stat}>
          <strong>{money(summary.open ?? openJobs.length)}</strong>
          <span>در جریان</span>
        </div>
        <div className={`${styles.stat} ${styles.statAlert}`}>
          <strong>{money(summary.attention_count ?? attention.length)}</strong>
          <span>اقدام لازم</span>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="بخش‌های تعمیرات">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${
                innerTab === t.id ? styles.tabOn : ''
              }`}
              onClick={() => setInnerTab(t.id)}
            >
              <Icon size={12} aria-hidden />
              {t.label}
              <span className={styles.tabCount}>{money(t.count)}</span>
            </button>
          )
        })}
      </nav>

      {innerTab === 'action' ? (
        <section className={styles.section}>
          {attention.length ? (
            <>
              <p className={styles.sectionHint}>
                این موارد الان به پرداخت یا خرید شما نیاز دارند.
              </p>
              {attention.map((item, idx) => (
                <article
                  key={`${item.job_id}-${item.kind}-${item.title}-${idx}`}
                  className={styles.attItem}
                >
                  <div className={styles.attTop}>
                    <span className={styles.attKind}>
                      {item.kind === 'proposal' &&
                      item.proposal_type === 'shop_product' ? (
                        <ShoppingBag size={13} aria-hidden />
                      ) : (
                        <CreditCard size={13} aria-hidden />
                      )}
                      {attentionKindLabel(item)}
                    </span>
                    {item.amount ? (
                      <span className={styles.attAmount}>
                        {money(item.amount)} ت
                      </span>
                    ) : null}
                  </div>
                  <h4>{item.title}</h4>
                  {item.description ? <p>{item.description}</p> : null}
                  {item.product_title ? (
                    <p>محصول: {item.product_title}</p>
                  ) : null}
                  <div className={styles.attMeta}>سفارش {item.job_code}</div>
                  <div className={styles.attActions}>
                    <Link href={item.track_path} className={styles.btn}>
                      رفتن به پرونده
                      <ArrowLeft size={13} />
                    </Link>
                    {item.product_path ? (
                      <Link
                        href={item.product_path}
                        className={styles.btnGhost}
                        target="_blank"
                      >
                        خرید از فروشگاه
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </>
          ) : (
            <div className={styles.emptySoft}>
              <CheckCircle2 size={20} color="#1e3b2f" />
              <h3>اقدام فوری ندارید</h3>
              <p>پرداخت یا خرید معلقی برای شما ثبت نشده است.</p>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setInnerTab('open')}
              >
                دیدن سفارش‌های در جریان
              </button>
            </div>
          )}
        </section>
      ) : null}

      {innerTab === 'open' ? (
        <section className={styles.section}>
          <p className={styles.sectionHint}>
            سفارش‌هایی که هنوز تمام نشده‌اند.
          </p>
          {openJobs.length ? (
            openJobs.map((job) => (
              <JobCard key={job.id} job={job} showPipeline />
            ))
          ) : (
            <div className={styles.emptySoft}>
              <ClipboardList size={20} color="#7f8c6a" />
              <h3>سفارش بازی نیست</h3>
              <p>اگر نیاز به سرویس دارید، درخواست جدید ثبت کنید.</p>
              <Link href="/repairs" className={styles.btn}>
                ثبت درخواست
              </Link>
            </div>
          )}
        </section>
      ) : null}

      {innerTab === 'done' ? (
        <section className={styles.section}>
          <p className={styles.sectionHint}>
            سفارش‌های تکمیل‌شده — فاکتور از صفحه پیگیری قابل چاپ است.
          </p>
          {doneJobs.length ? (
            doneJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className={styles.emptySoft}>
              <CheckCircle2 size={20} color="#7f8c6a" />
              <h3>هنوز سفارشی تکمیل نشده</h3>
              <p>بعد از تایید نهایی مدیر، اینجا نمایش داده می‌شود.</p>
            </div>
          )}
        </section>
      ) : null}

      {innerTab === 'all' ? (
        <section className={styles.section}>
          {!jobs.length ? (
            <div className={styles.empty}>
              <Wrench size={22} color="#7f8c6a" />
              <h3>هنوز سفارش تعمیری ندارید</h3>
              <p>
                درخواست سرویس ثبت کنید تا وضعیت، پرداخت و پیشنهادها اینجا بیاید.
              </p>
              <Link href="/repairs" className={styles.btn}>
                ثبت درخواست سرویس
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.sectionHint}>همه پرونده‌های سرویس شما</p>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
