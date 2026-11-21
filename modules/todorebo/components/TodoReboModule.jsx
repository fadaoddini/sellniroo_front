'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Cloud,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  Megaphone,
  Phone,
  RefreshCw,
  Receipt,
  Server,
  Shield,
  Timer,
  Wallet,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { formatRial } from '@/config/reboPricing'
import { isPlatformOwner } from '@/utils/ownerAccess'
import ReceiptDropzone from '@/components/Repairs/ReceiptDropzone'
import {
  buildContractArticles,
  openContractPrintWindow,
} from '../contractDocument'
import styles from '../styles/TodoRebo.module.css'

const COL_CLASS = {
  deposit: styles.colDeposit,
  layout: styles.colLayout,
  launch: styles.colLaunch,
  support: styles.colSupport,
}

const BADGE = {
  locked: styles.badgeLocked,
  open: styles.badgeOpen,
  awaiting_review: styles.badgeReview,
  paid: styles.badgePaid,
  done: styles.badgeDone,
}

const METHODS = [
  { id: 'gateway', label: 'درگاه آنلاین', icon: CreditCard, flag: 'allow_gateway' },
  { id: 'wallet', label: 'کیف پول', icon: Wallet, flag: 'allow_wallet' },
  { id: 'receipt', label: 'واریز کارت', icon: Receipt, flag: 'allow_receipt' },
]

function money(n, cur = 'تومان') {
  return `${formatRial(n)} ${cur}`
}

function splitMs(ms) {
  const total = Math.max(0, Math.floor(Number(ms || 0) / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds, total }
}

function useCountdown(deadlineIso, { enabled = true } = {}) {
  const [leftMs, setLeftMs] = useState(null)

  useEffect(() => {
    if (!enabled || !deadlineIso) {
      setLeftMs(null)
      return undefined
    }
    const tick = () => {
      const end = new Date(deadlineIso).getTime()
      if (Number.isNaN(end)) {
        setLeftMs(null)
        return
      }
      setLeftMs(Math.max(0, end - Date.now()))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [deadlineIso, enabled])

  return leftMs
}

function DepositTimerCard({
  deadlineIso,
  hoursWindow = 72,
  expired = false,
  expireMessage = '',
  onExpired,
}) {
  const leftMs = useCountdown(deadlineIso, { enabled: !expired && !!deadlineIso })
  const parts = splitMs(leftMs ?? 0)
  const urgent = !expired && parts.total > 0 && parts.total <= 6 * 3600

  useEffect(() => {
    if (!expired && leftMs === 0 && deadlineIso && onExpired) {
      onExpired()
    }
  }, [leftMs, expired, deadlineIso, onExpired])

  if (expired) {
    return (
      <section className={`${styles.timerCard} ${styles.timerCardExpired}`}>
        <div className={styles.timerHead}>
          <div>
            <h2>مهلت پیش‌پرداخت تمام شد</h2>
            <p>
              این سفارش لغو شد. برای ادامه باید دوباره بسته را انتخاب و قرارداد جدید
              ثبت کنید.
            </p>
          </div>
          <Timer size={18} />
        </div>
        <p className={styles.timerWarn}>
          {expireMessage ||
            'ممکن است قیمت‌ها تغییر کنند. پرداخت را هرچه سریع‌تر انجام دهید تا سفارش به مرحله «در حال انجام» برسد.'}
        </p>
      </section>
    )
  }

  if (!deadlineIso || leftMs == null) return null

  return (
    <section
      className={`${styles.timerCard} ${urgent ? styles.timerCardUrgent : ''}`}
    >
      <div className={styles.timerHead}>
        <div>
          <h2>مهلت پرداخت پیش‌پرداخت</h2>
          <p>
            از لحظه تأیید قرارداد، {hoursWindow} ساعت فرصت دارید پیش‌پرداخت را
            انجام دهید. با پرداخت، سفارش به «در حال انجام» می‌رود.
          </p>
        </div>
        <Timer size={18} />
      </div>
      <div className={styles.timerDigits} dir="ltr">
        <div className={styles.timerUnit}>
          <strong>{String(parts.days).padStart(2, '0')}</strong>
          <span>روز</span>
        </div>
        <div className={styles.timerUnit}>
          <strong>{String(parts.hours).padStart(2, '0')}</strong>
          <span>ساعت</span>
        </div>
        <div className={styles.timerUnit}>
          <strong>{String(parts.minutes).padStart(2, '0')}</strong>
          <span>دقیقه</span>
        </div>
        <div className={styles.timerUnit}>
          <strong>{String(parts.seconds).padStart(2, '0')}</strong>
          <span>ثانیه</span>
        </div>
      </div>
      <p className={styles.timerWarn}>
        اگر در این مهلت پرداخت نکنید، سفارش حذف/لغو می‌شود و ممکن است قیمت‌ها تغییر
        کنند. هرچه سریع‌تر پرداخت کنید تا پروژه شروع شود.
      </p>
    </section>
  )
}

const ADMIN_PAY_REASONS = [
  { id: 'barter', label: 'تهاتر' },
  { id: 'offline', label: 'واریز خارج از سیستم' },
  { id: 'cash', label: 'نقدی / حضوری' },
  { id: 'other', label: 'سایر' },
]

function AdminMarkPaidModal({ open, stage, currency, busy, onClose, onConfirm }) {
  const [reasonId, setReasonId] = useState('barter')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setReasonId('barter')
      setNote('')
    }
  }, [open, stage?.id])

  if (!open || !stage) return null
  const reason = ADMIN_PAY_REASONS.find((r) => r.id === reasonId)

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="تأیید پرداخت مرحله"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <h2>تأیید پرداخت مرحله</h2>
            <p>این مرحله به‌صورت دستی به‌عنوان پرداخت‌شده ثبت می‌شود.</p>
          </div>
          <button type="button" className={styles.miniBtn} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>

        <div className={styles.confirmCard}>
          <div className={styles.confirmCardRow}>
            <span>مرحله</span>
            <strong>{stage.title}</strong>
          </div>
          <div className={styles.confirmCardRow}>
            <span>مبلغ قسط</span>
            <strong>{money(stage.amount, currency)}</strong>
          </div>
          <div className={styles.confirmCardRow}>
            <span>درصد</span>
            <strong>{stage.percent}٪</strong>
          </div>
        </div>

        <div className={styles.field}>
          <label>دلیل تأیید</label>
          <div className={styles.reasonGrid}>
            {ADMIN_PAY_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${styles.reasonChip} ${
                  reasonId === r.id ? styles.reasonChipOn : ''
                }`}
                onClick={() => setReasonId(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="admin-pay-note">یادداشت (اختیاری)</label>
          <textarea
            id="admin-pay-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً جزئیات تهاتر یا شماره پیگیری واریز"
          />
        </div>

        <div className={styles.modalFoot}>
          <button type="button" className={styles.btnGhost} onClick={onClose} disabled={busy}>
            انصراف
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={busy}
            onClick={() =>
              onConfirm({
                reason: reason?.label || 'تأیید دستی مدیر',
                note,
              })
            }
          >
            {busy ? <Loader2 size={13} className={styles.spin} /> : <CheckCircle2 size={13} />}
            تأیید پرداخت‌شده
          </button>
        </div>
      </div>
    </div>
  )
}

function ContractModal({ open, board, onClose }) {
  const doc = useMemo(
    () => (open && board ? buildContractArticles(board) : null),
    [open, board],
  )
  if (!open || !doc) return null

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="متن کامل قرارداد"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <h2>{doc.title}</h2>
            <p>{doc.subtitle}</p>
          </div>
          <button type="button" className={styles.miniBtn} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>
        <div className={styles.modalMeta}>
          <div>
            کد سفارش: <b dir="ltr">{doc.meta.code}</b>
          </div>
          <div>
            تاریخ: <b>{doc.meta.date}</b>
          </div>
          <div>
            کارفرما: <b>{doc.meta.customer}</b>
          </div>
          <div>
            موبایل: <b dir="ltr">{doc.meta.mobile}</b>
          </div>
          <div>
            پیگیری: <b dir="ltr">{doc.meta.request}</b>
          </div>
          <div>
            مبلغ کل: <b>{doc.meta.totalLabel}</b>
          </div>
        </div>
        {doc.articles.map((a) => (
          <section key={a.id} className={styles.article}>
            <h3>{a.title}</h3>
            <pre>{a.body}</pre>
          </section>
        ))}
        <div className={styles.modalFoot}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            بستن
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => openContractPrintWindow(doc)}
          >
            <Download size={13} />
            دانلود PDF
          </button>
        </div>
      </div>
    </div>
  )
}

function HostingChoiceBox({
  stage,
  cloudOffer,
  contactChannels,
  cloudSub,
  hostingChoice,
  hostingBusy,
  ownNote,
  setOwnNote,
  acceptPolicy,
  setAcceptPolicy,
  onChoose,
}) {
  if (stage?.key !== 'launch' || stage.status === 'locked') return null

  const offer = cloudOffer || {}
  const channels = contactChannels || {}
  const currency = offer.currency_label || 'تومان'
  const warnDays = offer.warning_days || 5

  if (hostingChoice === 'our_cloud') {
    const days = cloudSub?.days_remaining
    const inWarn = !!cloudSub?.in_warning
    return (
      <div className={styles.hostingBox}>
        <div className={styles.hostingHead}>
          <Cloud size={14} />
          <strong>سرور ابری ربو انتخاب شد</strong>
        </div>
        {cloudSub ? (
          <div className={styles.hostingStats}>
            <div>
              <b>{cloudSub.status_display || cloudSub.status}</b>
              <span>وضعیت</span>
            </div>
            <div>
              <b>{(days ?? 0).toLocaleString('fa-IR')} روز</b>
              <span>تقریبی باقی‌مانده</span>
            </div>
            <div>
              <b>{formatRial(cloudSub.balance || 0)} {currency}</b>
              <span>موجودی</span>
            </div>
          </div>
        ) : null}
        {inWarn ? (
          <p className={styles.hostingWarn}>
            <AlertTriangle size={12} />
            کمتر از {warnDays} روز اعتبار دارید — هرچه سریع‌تر شارژ کنید.
          </p>
        ) : null}
        <Link href="/reboserver" className={styles.hostingCta}>
          <ExternalLink size={13} />
          مدیریت سرور در /reboserver
        </Link>
      </div>
    )
  }

  if (hostingChoice === 'own_server') {
    return (
      <div className={styles.hostingBox}>
        <div className={styles.hostingHead}>
          <Server size={14} />
          <strong>سرور اختصاصی شما ثبت شد</strong>
        </div>
        <p className={styles.hostingHint}>
          {channels.hint ||
            'اطلاعات سرور را هرچه سریع‌تر از راه‌های ارتباطی زیر برای ما بفرستید.'}
        </p>
        <div className={styles.contactList}>
          {channels.phone ? (
            <a href={`tel:${channels.phone}`}>
              <Phone size={12} />
              {channels.phone_label || 'تلفن'}: {channels.phone}
            </a>
          ) : null}
          {channels.mobile ? (
            <a href={`tel:${channels.mobile}`}>
              <Phone size={12} />
              {channels.mobile_label || 'موبایل'}: {channels.mobile}
            </a>
          ) : null}
          {channels.email ? (
            <a href={`mailto:${channels.email}`}>
              <Mail size={12} />
              {channels.email_label || 'ایمیل'}: {channels.email}
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.hostingBox}>
      <div className={styles.hostingHead}>
        <Server size={14} />
        <strong>انتخاب میزبانی برای راه‌اندازی</strong>
      </div>
      <p className={styles.hostingHint}>
        یکی از گزینه‌ها را انتخاب کنید: سرور ابری ربو، یا ارسال اطلاعات سرور خودتان.
      </p>

      {offer.enabled !== false ? (
        <div className={styles.hostingOption}>
          <div className={styles.hostingOptionTop}>
            <Cloud size={15} />
            <div>
              <b>{offer.title || 'سرور ابری ربو'}</b>
              <span>
                {offer.description ||
                  'شارژ اعتبار و کسر روزانه — مدیریت کامل در پنل سرور'}
              </span>
            </div>
          </div>
          <p className={styles.hostingHint}>
            با انتخاب سرور ابری ربو،{' '}
            <b>{(5).toLocaleString('fa-IR')} روز شارژ تشویقی</b> به پنل سرور شما
            اضافه می‌شود.
          </p>
          <div className={styles.hostingStats}>
            <div>
              <b>{formatRial(offer.daily_price || 0)} {currency}</b>
              <span>روزانه</span>
            </div>
            <div>
              <b>{formatRial(offer.monthly_estimate || 0)} {currency}</b>
              <span>برآورد ۳۰ روز</span>
            </div>
            <div>
              <b>{String(warnDays).toLocaleString('fa-IR')} روز</b>
              <span>آستانه هشدار</span>
            </div>
          </div>
          {(offer.specs || []).length ? (
            <ul className={styles.hostingSpecs}>
              {offer.specs.slice(0, 6).map((s, i) => (
                <li key={i}>
                  <b>{s.label}</b> {s.value}
                </li>
              ))}
            </ul>
          ) : null}
          <label className={styles.hostingCheck}>
            <input
              type="checkbox"
              checked={acceptPolicy}
              onChange={(e) => setAcceptPolicy(e.target.checked)}
            />
            شرایط حذف داده پس از اتمام اعتبار را می‌پذیرم
          </label>
          <button
            type="button"
            className={styles.hostingCta}
            disabled={hostingBusy || !acceptPolicy}
            onClick={() => onChoose('our_cloud')}
          >
            {hostingBusy ? <Loader2 size={13} className={styles.spin} /> : <Cloud size={13} />}
            انتخاب سرور ابری و باز کردن پنل
          </button>
        </div>
      ) : (
        <p className={styles.hostingHint}>فعلاً سفارش سرور ابری باز نیست.</p>
      )}

      <div className={styles.hostingOption}>
        <div className={styles.hostingOptionTop}>
          <Server size={15} />
          <div>
            <b>سرور خودم</b>
            <span>
              اطلاعات دسترسی سرور را هرچه سریع‌تر از کانال‌های ارتباطی سایت بفرستید.
            </span>
          </div>
        </div>
        <div className={styles.contactList}>
          {channels.phone ? (
            <a href={`tel:${channels.phone}`}>
              <Phone size={12} />
              {channels.phone_label || 'تلفن'}: {channels.phone}
            </a>
          ) : null}
          {channels.mobile ? (
            <a href={`tel:${channels.mobile}`}>
              <Phone size={12} />
              {channels.mobile_label || 'موبایل'}: {channels.mobile}
            </a>
          ) : null}
          {channels.email ? (
            <a href={`mailto:${channels.email}`}>
              <Mail size={12} />
              {channels.email_label || 'ایمیل'}: {channels.email}
            </a>
          ) : null}
          {!channels.phone && !channels.mobile && !channels.email ? (
            <span className={styles.hostingHint}>
              راه‌های ارتباطی را از تنظیمات سایت تکمیل کنید.
            </span>
          ) : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="own-server-note">یادداشت کوتاه (اختیاری)</label>
          <input
            id="own-server-note"
            value={ownNote}
            onChange={(e) => setOwnNote(e.target.value)}
            placeholder="مثلاً: اطلاعات را در واتساپ می‌فرستم"
          />
        </div>
        <button
          type="button"
          className={styles.hostingCtaGhost}
          disabled={hostingBusy}
          onClick={() => onChoose('own_server')}
        >
          {hostingBusy ? <Loader2 size={13} className={styles.spin} /> : <Server size={13} />}
          سرور خودم را اعلام می‌کنم
        </button>
      </div>
    </div>
  )
}

function SupportPanel({
  stage,
  support,
  payCfg,
  busy,
  onAck,
  onRenew,
}) {
  const [termsOpen, setTermsOpen] = useState(false)
  const [ackLocal, setAckLocal] = useState(false)
  const [planId, setPlanId] = useState('')
  const [planDetailId, setPlanDetailId] = useState('')
  const [method, setMethod] = useState('receipt')
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptNote, setReceiptNote] = useState('')
  const [copied, setCopied] = useState(false)

  if (stage?.key !== 'support') return null

  const info = support || {}
  const currency = info.currency_label || 'تومان'
  const plans = info.plans || []
  const terms = info.terms || []
  const coverage = info.coverage || []
  const termsAcked = !!info.terms_acked || ackLocal
  const locked = stage.status === 'locked' || !info.launch_completed
  const active = !!info.active
  const expired = info.status === 'expired'
  const renewWindowDays = Number(info.renew_window_days || 10)
  const freeMonths = Number(info.free_months || 3)
  const totalDaysApprox = Math.max(1, freeMonths * 30)
  const daysLeft = info.days_remaining
  const daysNum = daysLeft == null ? null : Number(daysLeft)
  const progressPct =
    daysNum == null
      ? 0
      : Math.max(0, Math.min(100, Math.round((daysNum / totalDaysApprox) * 100)))
  const inRenewWindow =
    info.in_renew_window != null
      ? !!info.in_renew_window
      : expired || daysNum == null || daysNum <= renewWindowDays
  const renewEligible =
    info.renew_eligible != null
      ? !!info.renew_eligible
      : !!info.can_renew || (!!info.plans?.length && !locked)
  const canRenew = renewEligible && inRenewWindow && !locked
  const selected =
    plans.find((p) => p.id === planId) || plans[0] || null
  const activeMethodId = (() => {
    const allowed = METHODS.filter((m) => payCfg?.[m.flag] !== false)
    if (allowed.some((m) => m.id === method)) return method
    return allowed[0]?.id || 'receipt'
  })()

  useEffect(() => {
    if (!planId && plans[0]?.id) setPlanId(plans[0].id)
  }, [planId, plans])

  useEffect(() => {
    if (info.terms_acked) setAckLocal(true)
  }, [info.terms_acked])

  const copyCard = async () => {
    const text = String(payCfg?.bank_card || '').replace(/\s+/g, '')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  if (locked) {
    return (
      <div className={styles.supportBox}>
        <div className={styles.supportHero}>
          <span className={styles.supportHeroIcon} aria-hidden>
            <Shield size={16} />
          </span>
          <div>
            <strong>پشتیبانی پس از تحویل</strong>
            <p>
              با «اتمام کار» در ستون تحویل نهایی،{' '}
              <b>{freeMonths.toLocaleString('fa-IR')} ماه رایگان</b> از اینجا
              شروع می‌شود.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.supportBox}>
      <div className={styles.supportHero}>
        <span className={styles.supportHeroIcon} aria-hidden>
          <Shield size={16} />
        </span>
        <div>
          <strong>{info.title || 'پشتیبانی پس از تحویل'}</strong>
          {info.desc ? <p>{info.desc}</p> : null}
        </div>
      </div>

      <div className={styles.supportMeter}>
        <div className={styles.supportMeterTop}>
          <span className={styles.supportStatusPill} data-state={info.status || 'inactive'}>
            {info.status_display || info.status || '—'}
          </span>
          <span className={styles.supportDaysBig}>
            {(daysNum ?? 0).toLocaleString('fa-IR')}
            <small>روز باقی</small>
          </span>
        </div>
        <div
          className={styles.supportMeterBar}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${progressPct}%` }} />
        </div>
        <div className={styles.supportMeterMeta}>
          <span>
            پایان:{' '}
            <b>
              {info.until
                ? new Date(info.until).toLocaleDateString('fa-IR')
                : '—'}
            </b>
          </span>
          {info.plan_name ? (
            <span>
              پلن: <b>{info.plan_name}</b>
            </span>
          ) : null}
        </div>
      </div>

      {active && info.status === 'free_active' ? (
        <p className={styles.supportOk}>
          <CheckCircle2 size={12} />
          دوره رایگان فعال — {freeMonths.toLocaleString('fa-IR')} ماه از اتمام
          تحویل نهایی
        </p>
      ) : null}
      {expired ? (
        <p className={styles.hostingWarn}>
          <AlertTriangle size={12} />
          دوره تمام شده — برای ادامه، پلن تمدید را انتخاب کنید.
        </p>
      ) : null}
      {!expired &&
      daysNum != null &&
      daysNum <= renewWindowDays &&
      daysNum > 0 ? (
        <p className={styles.supportWarnSoft}>
          <Timer size={12} />
          کمتر از {renewWindowDays.toLocaleString('fa-IR')} روز مانده — تمدید
          باز است.
        </p>
      ) : null}

      <div className={styles.supportTerms}>
        <button
          type="button"
          className={styles.supportToggle}
          onClick={() => setTermsOpen((v) => !v)}
        >
          <FileText size={13} />
          <span>{termsOpen ? 'بستن پوشش و مفاد' : 'پوشش و مفاد پشتیبانی'}</span>
          <span className={styles.supportToggleHint}>
            {termsAcked ? 'تأییدشده' : 'نیاز به تأیید'}
          </span>
        </button>

        {termsOpen || !termsAcked ? (
          <div className={styles.supportTermsBody}>
            {info.intro ? (
              <p className={styles.supportIntro}>{info.intro}</p>
            ) : null}
            {coverage.length ? (
              <ul className={styles.supportCoverage}>
                {coverage.map((item) => (
                  <li key={item.id || item.title}>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ol className={styles.supportTermsList}>
                {terms.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ol>
            )}
            <div className={styles.supportFacts}>
              <span>
                {freeMonths.toLocaleString('fa-IR')} ماه رایگان پس از تحویل
              </span>
              <span>
                تمدید از {renewWindowDays.toLocaleString('fa-IR')} روز مانده
              </span>
              {info.inflation_note ? <span>{info.inflation_note}</span> : null}
            </div>
            {!termsAcked ? (
              <>
                <label className={styles.hostingCheck}>
                  <input
                    type="checkbox"
                    checked={ackLocal}
                    onChange={(e) => setAckLocal(e.target.checked)}
                  />
                  مفاد پشتیبانی را خواندم و آگاهم.
                </label>
                <button
                  type="button"
                  className={styles.supportAckBtn}
                  disabled={!ackLocal || busy}
                  onClick={() => onAck?.()}
                >
                  {busy ? (
                    <Loader2 size={13} className={styles.spin} />
                  ) : (
                    <Shield size={13} />
                  )}
                  تأیید آگاهی از مفاد
                </button>
              </>
            ) : (
              <p className={styles.supportOk}>
                <CheckCircle2 size={12} />
                مفاد تأیید شده
                {info.terms_acked_at
                  ? ` · ${new Date(info.terms_acked_at).toLocaleString('fa-IR')}`
                  : ''}
              </p>
            )}
          </div>
        ) : (
          <p className={styles.supportOk}>
            <CheckCircle2 size={12} />
            مفاد پشتیبانی تأیید شده
          </p>
        )}
      </div>

      {renewEligible && plans.length ? (
        <div
          className={`${styles.supportRenew} ${
            canRenew ? '' : styles.supportRenewDim
          }`}
          aria-disabled={!canRenew}
        >
          <div className={styles.supportRenewHead}>
            <div>
              <strong>
                <RefreshCw size={13} /> تمدید ماهانه
              </strong>
              <p>
                {canRenew
                  ? 'پلن را انتخاب کنید و پرداخت را انجام دهید.'
                  : `از ${renewWindowDays.toLocaleString('fa-IR')} روز مانده فعال می‌شود${
                      daysNum != null
                        ? ` — الان ${daysNum.toLocaleString('fa-IR')} روز باقی است`
                        : ''
                    }.`}
              </p>
            </div>
          </div>

          <div className={styles.supportPlanStrip} role="radiogroup" aria-label="پلن پشتیبانی">
            {plans.map((p) => {
              const on = canRenew && (selected?.id || '') === p.id
              const amount = p.monthly_price || p.price || 0
              const showDetail = planDetailId === p.id || (canRenew && on)
              return (
                <div
                  key={p.id}
                  className={`${styles.supportPlan} ${on ? styles.supportPlanOn : ''} ${
                    p.id === 'gold'
                      ? styles.supportPlanGold
                      : p.id === 'silver'
                        ? styles.supportPlanSilver
                        : p.id === 'basic'
                          ? styles.supportPlanBasic
                          : styles.supportPlanBronze
                  }`}
                >
                  <button
                    type="button"
                    className={styles.supportPlanMain}
                    disabled={!canRenew}
                    onClick={() => {
                      if (!canRenew) return
                      setPlanId(p.id)
                      setPlanDetailId(p.id)
                    }}
                  >
                    <span className={styles.supportPlanBadge}>{p.name}</span>
                    <span className={styles.supportPlanPrice}>
                      {formatRial(amount)}
                      <small>{currency}/ماه</small>
                    </span>
                    {p.hours_per_month ? (
                      <span className={styles.supportPlanHours}>
                        ≈ {Number(p.hours_per_month).toLocaleString('fa-IR')} ساعت
                      </span>
                    ) : null}
                    {p.suitable_for ? (
                      <span className={styles.supportPlanSuit}>{p.suitable_for}</span>
                    ) : null}
                  </button>
                  {(p.breakdown || []).length ? (
                    <>
                      <button
                        type="button"
                        className={styles.supportPlanMore}
                        onClick={() =>
                          setPlanDetailId((cur) => (cur === p.id ? '' : p.id))
                        }
                      >
                        {showDetail ? 'بستن جزئیات جلسات' : 'جزئیات جلسات'}
                      </button>
                      {showDetail ? (
                        <ul className={styles.supportPlanBreak}>
                          {p.breakdown.map((b) => (
                            <li key={b.id || b.title}>
                              <strong>{b.title}</strong>
                              {b.detail ? <span>{b.detail}</span> : null}
                              {b.monthly ? <i>{b.monthly}</i> : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>

          {canRenew ? (
            <div className={styles.supportPayBlock}>
              <div className={styles.methods} role="radiogroup" aria-label="روش پرداخت تمدید">
                {METHODS.filter((m) => payCfg?.[m.flag] !== false).map((m) => {
                  const Icon = m.icon
                  const on = activeMethodId === m.id
                  return (
                    <label
                      key={m.id}
                      className={`${styles.method} ${on ? styles.methodOn : ''}`}
                    >
                      <input
                        type="radio"
                        name="support-pay"
                        checked={on}
                        onChange={() => setMethod(m.id)}
                        hidden
                      />
                      <Icon size={13} />
                      {m.label}
                    </label>
                  )
                })}
              </div>

              {activeMethodId === 'receipt' ? (
                <>
                  <div className={styles.bankBox}>
                    {payCfg?.bank_card ? (
                      <>
                        <span>شماره کارت</span>
                        <strong dir="ltr">{payCfg.bank_card}</strong>
                        <button type="button" className={styles.miniBtn} onClick={copyCard}>
                          <Copy size={11} />
                          {copied ? 'کپی شد' : 'کپی کارت'}
                        </button>
                      </>
                    ) : (
                      <span>شماره کارت در تنظیمات پرداخت ربو ثبت نشده است.</span>
                    )}
                  </div>
                  <ReceiptDropzone
                    file={receiptFile}
                    onChange={setReceiptFile}
                    disabled={busy}
                    label="تصویر رسید تمدید"
                    hint="بکشید و رها کنید، یا کلیک کنید"
                  />
                  <div className={styles.field}>
                    <label htmlFor="support-receipt-note">توضیح رسید</label>
                    <input
                      id="support-receipt-note"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      placeholder="اختیاری"
                    />
                  </div>
                </>
              ) : null}

              <button
                type="button"
                className={styles.supportPayBtn}
                disabled={busy || !selected || !termsAcked}
                onClick={() =>
                  onRenew?.({
                    planId: selected.id,
                    method: activeMethodId,
                    receiptFile,
                    receiptNote,
                    ackTerms: termsAcked,
                  })
                }
              >
                {busy ? (
                  <Loader2 size={13} className={styles.spin} />
                ) : (
                  <CreditCard size={13} />
                )}
                تمدید {selected?.name || ''} —{' '}
                {formatRial(selected?.monthly_price || selected?.price || 0)}{' '}
                {currency}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function StageCard({
  stage,
  currency,
  payCfg,
  isStaff,
  busyId,
  onPay,
  onAction,
  onAskMarkPaid,
  contractAccepted,
  paymentBlocked = false,
  cloudOffer = null,
  contactChannels = null,
  cloudSub = null,
  hostingChoice = '',
  hostingBusy = false,
  ownNote = '',
  setOwnNote,
  acceptPolicy = false,
  setAcceptPolicy,
  onChooseHosting,
  support = null,
  supportBusy = false,
  onSupportAck,
  onSupportRenew,
}) {
  const [method, setMethod] = useState('receipt')
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptNote, setReceiptNote] = useState('')
  const [copied, setCopied] = useState(false)

  const allowedMethods = METHODS.filter((m) => payCfg?.[m.flag] !== false)
  const activeMethod = allowedMethods.some((m) => m.id === method)
    ? method
    : allowedMethods[0]?.id || 'receipt'

  const needsContract =
    stage.key === 'deposit' && !contractAccepted
  const canPay =
    !needsContract &&
    !paymentBlocked &&
    stage.requires_payment &&
    (stage.status === 'open' || stage.status === 'awaiting_review')

  const copyCard = async () => {
    const text = String(payCfg?.bank_card || '').replace(/\s+/g, '')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className={styles.stageCard}>
      <div className={styles.stageTop}>
        <h3>{stage.title}</h3>
        <span className={`${styles.badge} ${BADGE[stage.status] || styles.badgeLocked}`}>
          {stage.status === 'locked' ? <Lock size={10} /> : null}
          {stage.status_display || stage.status}
        </span>
      </div>
      <p className={styles.stageDesc}>{stage.description}</p>
      {stage.requires_payment ? (
        <>
          <div className={styles.stageAmount}>
            {money(stage.amount, currency)}
            <small>/ قسط</small>
          </div>
          <div className={styles.stagePercent}>{stage.percent}٪ مبلغ قرارداد</div>
        </>
      ) : (
        <div className={styles.stagePercent}>بدون قسط جداگانه</div>
      )}

      {paymentBlocked && stage.key === 'deposit' ? (
        <p className={styles.lockedNote}>
          مهلت ۷۲ ساعته تمام شده و این سفارش لغو شده است.
        </p>
      ) : null}
      {needsContract ? (
        <p className={styles.lockedNote}>
          برای باز شدن پیش‌پرداخت، ابتدا متن قرارداد را بخوانید و موافقت کنید.
        </p>
      ) : null}
      {stage.status === 'locked' && !needsContract && !paymentBlocked ? (
        <p className={styles.lockedNote}>
          {stage.key === 'support'
            ? 'پس از اتمام کار مرحله تحویل نهایی و راه‌اندازی، پشتیبانی با سه ماه رایگان فعال می‌شود.'
            : 'این مرحله بعد از تکمیل/پرداخت مرحله قبلی باز می‌شود.'}
        </p>
      ) : null}

      {canPay ? (
        <div className={styles.payBox}>
          <div className={styles.methods} role="radiogroup" aria-label="روش پرداخت قسط">
            {allowedMethods.map((m) => {
              const Icon = m.icon
              const on = activeMethod === m.id
              return (
                <label
                  key={m.id}
                  className={`${styles.method} ${on ? styles.methodOn : ''}`}
                >
                  <input
                    type="radio"
                    name={`pay-${stage.id}`}
                    checked={on}
                    onChange={() => setMethod(m.id)}
                    hidden
                  />
                  <Icon size={13} />
                  {m.label}
                </label>
              )
            })}
          </div>

          {activeMethod === 'receipt' ? (
            <>
              <div className={styles.bankBox}>
                {payCfg?.bank_card ? (
                  <>
                    <span>شماره کارت</span>
                    <strong dir="ltr">{payCfg.bank_card}</strong>
                    <button type="button" className={styles.miniBtn} onClick={copyCard}>
                      <Copy size={11} />
                      {copied ? 'کپی شد' : 'کپی کارت'}
                    </button>
                    {payCfg.bank_owner ? <div>به نام {payCfg.bank_owner}</div> : null}
                    {payCfg.bank_sheba ? (
                      <div dir="ltr">شبا: {payCfg.bank_sheba}</div>
                    ) : null}
                  </>
                ) : (
                  <span>
                    شماره کارت هنوز در تنظیمات پرداخت ربو (`/rebo-manage`) ثبت نشده است.
                  </span>
                )}
                {payCfg?.payment_instructions ? (
                  <p className={styles.hint} style={{ marginTop: 6 }}>
                    {payCfg.payment_instructions}
                  </p>
                ) : null}
              </div>
              <ReceiptDropzone
                file={receiptFile}
                onChange={setReceiptFile}
                disabled={busyId === stage.id}
                label="تصویر رسید واریز"
                hint="بکشید و رها کنید، یا کلیک کنید"
              />
              <div className={styles.field}>
                <label htmlFor={`note-${stage.id}`}>توضیح رسید</label>
                <input
                  id={`note-${stage.id}`}
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="اختیاری"
                />
              </div>
            </>
          ) : null}

          <button
            type="button"
            className={styles.payBtn}
            disabled={busyId === stage.id}
            onClick={() =>
              onPay(stage, {
                method: activeMethod,
                receiptFile,
                receiptNote,
              })
            }
          >
            {busyId === stage.id ? (
              <Loader2 size={13} className={styles.spin} />
            ) : (
              <CreditCard size={13} />
            )}
            پرداخت این قسط
          </button>
        </div>
      ) : null}

      {stage.status === 'paid' || stage.status === 'done' ? (
        <p className={styles.emptyNote}>
          {stage.paid_at
            ? `پرداخت: ${new Date(stage.paid_at).toLocaleString('fa-IR')}`
            : 'این مرحله تسویه شده است.'}
        </p>
      ) : null}

      <HostingChoiceBox
        stage={stage}
        cloudOffer={cloudOffer}
        contactChannels={contactChannels}
        cloudSub={cloudSub}
        hostingChoice={hostingChoice}
        hostingBusy={hostingBusy}
        ownNote={ownNote}
        setOwnNote={setOwnNote}
        acceptPolicy={acceptPolicy}
        setAcceptPolicy={setAcceptPolicy}
        onChoose={onChooseHosting}
      />

      <SupportPanel
        stage={stage}
        support={support}
        payCfg={payCfg}
        busy={supportBusy || busyId === stage.id}
        onAck={onSupportAck}
        onRenew={onSupportRenew}
      />

      {isStaff ? (
        <div className={`${styles.adminActions} ${styles.adminBar}`}>
          {stage.requires_payment &&
          stage.status !== 'paid' &&
          stage.status !== 'done' &&
          !paymentBlocked ? (
            <button
              type="button"
              className={`${styles.miniBtn} ${styles.miniBtnPaid}`}
              disabled={busyId === stage.id}
              onClick={() => onAskMarkPaid?.(stage)}
            >
              <CheckCircle2 size={12} />
              تأیید پرداخت
            </button>
          ) : null}
          {stage.status === 'awaiting_review' ? (
            <button
              type="button"
              className={`${styles.miniBtn} ${styles.miniBtnOk}`}
              disabled={busyId === stage.id}
              onClick={() => onAction(stage, 'approve')}
            >
              تأیید فیش
            </button>
          ) : null}
          {(stage.status === 'paid' ||
            (stage.status === 'open' && !stage.requires_payment)) &&
          stage.status !== 'done' ? (
            <button
              type="button"
              className={styles.miniBtn}
              disabled={busyId === stage.id}
              onClick={() => onAction(stage, 'complete')}
            >
              اتمام کار مرحله
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function TodoReboInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeParam = (searchParams.get('code') || searchParams.get('order') || '').trim()
  const {
    isAuthenticated,
    loading,
    user,
    getAuthHeaders,
    canManageEmployees,
  } = useAuth()

  const isStaff =
    !!user?.is_superuser ||
    !!user?.is_staff ||
    !!canManageEmployees ||
    isPlatformOwner(user)

  const [board, setBoard] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [contractOpen, setContractOpen] = useState(false)
  const [agreeChecked, setAgreeChecked] = useState(false)
  const [acceptBusy, setAcceptBusy] = useState(false)
  const [marketerBusy, setMarketerBusy] = useState(false)
  const [markPaidStage, setMarkPaidStage] = useState(null)
  const [ownNote, setOwnNote] = useState('')
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [hostingBusy, setHostingBusy] = useState(false)
  const [supportBusy, setSupportBusy] = useState(false)
  const [deskMode, setDeskMode] = useState('0') // 0 active | 1 archived
  const [deskMeta, setDeskMeta] = useState({ is_staff: false, count: 0 })

  const loadBoard = useCallback(
    async (code) => {
      if (!code) return null
      const res = await axios.get(Config.endpoints.reboOrders.contractBoard(code), {
        headers: getAuthHeaders(),
      })
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'بارگذاری قرارداد ناموفق بود')
      }
      setBoard(res.data.data)
      return res.data.data
    },
    [getAuthHeaders],
  )

  const loadOrders = useCallback(
    async (archived = deskMode) => {
      const res = await axios.get(Config.endpoints.reboOrders.my(), {
        headers: getAuthHeaders(),
        params: { archived },
      })
      setOrders(res.data?.data || [])
      setDeskMeta({
        is_staff: !!res.data?.meta?.is_staff,
        count: Number(res.data?.meta?.count || 0),
        archived: res.data?.meta?.archived || archived,
      })
    },
    [getAuthHeaders, deskMode],
  )

  const refresh = useCallback(async () => {
    setLoadingData(true)
    setErr('')
    try {
      if (codeParam) {
        await loadBoard(codeParam)
      } else {
        await loadOrders(deskMode)
        setBoard(null)
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در بارگذاری')
    } finally {
      setLoadingData(false)
    }
  }, [codeParam, loadBoard, loadOrders, deskMode])

  const onArchiveOrder = async (order, archive = true) => {
    if (!order?.id || !isStaff) return
    setBusyId(`desk-${order.id}`)
    setErr('')
    setOk('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.manageOrderAction(order.id),
        { action: archive ? 'archive' : 'unarchive' },
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'عملیات ناموفق')
      }
      setOk(archive ? 'سفارش آرشیو شد' : 'از آرشیو خارج شد')
      await loadOrders(deskMode)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا')
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/todorebo')}`)
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) refresh()
  }, [isAuthenticated, refresh])

  const payCfg = board?.pay_config || {}
  const currency = board?.summary?.currency_label || 'تومان'
  const cloudOffer = board?.cloud_offer || null
  const contactChannels = board?.contact_channels || null
  const cloudSub = board?.cloud_subscription || null
  const hostingChoice =
    board?.summary?.hosting_choice || board?.order?.hosting_choice || ''
  const supportInfo = board?.support || null
  const stages = board?.stages || []
  const columns = board?.columns?.length
    ? board.columns
    : [
        { id: 'deposit', title: 'پیش‌پرداخت', percent: 40 },
        { id: 'layout', title: 'طراحی قالب و تایید چیدمان', percent: 30 },
        { id: 'launch', title: 'تحویل نهایی و راه‌اندازی', percent: 30 },
        { id: 'support', title: 'پشتیبانی', percent: 0 },
      ]

  useEffect(() => {
    if (board?.order?.own_server_note) {
      setOwnNote(board.order.own_server_note)
    }
  }, [board?.order?.own_server_note])

  const stagesByKey = useMemo(() => {
    const map = {}
    stages.forEach((s) => {
      map[s.key] = s
    })
    return map
  }, [stages])

  const downloadPdf = () => {
    if (!board) return
    openContractPrintWindow(buildContractArticles(board))
  }

  const contractAccepted = !!board?.summary?.contract_accepted
  const depositPaid = !!board?.summary?.deposit_paid
  const depositExpired = !!board?.summary?.deposit_expired
  const depositDeadline = board?.summary?.deposit_deadline_at || null

  const onDepositTimerExpired = useCallback(() => {
    // یک‌بار رفرش تا سرور سفارش را لغو کند
    refresh()
  }, [refresh])

  const acceptContract = async () => {
    if (!board?.order?.code || !agreeChecked) return
    setAcceptBusy(true)
    setErr('')
    setOk('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.contractAccept(board.order.code),
        { agreed: true },
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'تأیید قرارداد ناموفق بود')
      }
      setBoard(res.data.data)
      setOk(res.data.message || 'قرارداد تأیید شد')
      setAgreeChecked(false)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در تأیید قرارداد')
    } finally {
      setAcceptBusy(false)
    }
  }

  const assignMarketer = async (marketerId) => {
    if (!board?.order?.code || !(isStaff || deskMeta.is_staff)) return
    setMarketerBusy(true)
    setErr('')
    setOk('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.contractMarketer(board.order.code),
        { marketer_id: marketerId || null },
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'اتصال بازاریاب ناموفق بود')
      }
      setBoard(res.data.data)
      setOk(res.data.message || 'بازاریاب به‌روز شد')
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در اتصال بازاریاب')
    } finally {
      setMarketerBusy(false)
    }
  }

  const onPay = async (stage, { method, receiptFile, receiptNote }) => {
    if (!board?.order?.code) return
    setBusyId(stage.id)
    setErr('')
    setOk('')
    try {
      const fd = new FormData()
      fd.append('method', method)
      if (method === 'receipt') {
        if (!receiptFile) throw new Error('تصویر رسید را انتخاب کنید')
        fd.append('receipt_image', receiptFile)
        fd.append('receipt_note', receiptNote || '')
      }
      const res = await axios.post(
        Config.endpoints.reboOrders.contractStagePay(board.order.code, stage.id),
        fd,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'پرداخت ناموفق')
      }
      if (res.data.data?.payment_url) {
        window.location.href = res.data.data.payment_url
        return
      }
      setBoard(res.data.data.board)
      setOk(res.data.message || 'ثبت شد')
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در پرداخت قسط')
    } finally {
      setBusyId(null)
    }
  }

  const onAction = async (stage, action, extra = {}) => {
    if (!board?.order?.code) return
    setBusyId(stage.id)
    setErr('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.contractStageAction(board.order.code, stage.id),
        { action, ...extra },
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'عملیات ناموفق')
      }
      setBoard(res.data.data)
      setOk(
        action === 'approve'
          ? 'فیش تأیید شد'
          : action === 'mark_paid'
            ? 'پرداخت مرحله تأیید شد'
            : 'مرحله به‌روز شد',
      )
      setMarkPaidStage(null)
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا')
    } finally {
      setBusyId(null)
    }
  }

  const confirmMarkPaid = async ({ reason, note }) => {
    if (!markPaidStage) return
    await onAction(markPaidStage, 'mark_paid', { reason, note })
  }

  const onChooseHosting = async (choice) => {
    if (!board?.order?.code || !choice) return
    setHostingBusy(true)
    setErr('')
    setOk('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.contractHosting(board.order.code),
        {
          choice,
          note: ownNote,
          accepted_policy: acceptPolicy,
          display_name: board.order.customer_name || '',
        },
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'ثبت انتخاب میزبانی ناموفق بود')
      }
      if (res.data.data?.board) setBoard(res.data.data.board)
      setOk(res.data.message || 'ثبت شد')
      const redirect = res.data.data?.redirect
      if (redirect) {
        router.push(redirect)
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در انتخاب میزبانی')
    } finally {
      setHostingBusy(false)
    }
  }

  const onSupportAck = async () => {
    if (!board?.order?.code) return
    setSupportBusy(true)
    setErr('')
    setOk('')
    try {
      const res = await axios.post(
        Config.endpoints.reboOrders.contractSupportAck(board.order.code),
        {},
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'تأیید مفاد ناموفق بود')
      }
      setBoard(res.data.data)
      setOk(res.data.message || 'مفاد پشتیبانی تأیید شد')
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در تأیید مفاد')
    } finally {
      setSupportBusy(false)
    }
  }

  const onSupportRenew = async ({
    planId,
    method,
    receiptFile,
    receiptNote,
    ackTerms,
  }) => {
    if (!board?.order?.code || !planId) return
    setSupportBusy(true)
    setErr('')
    setOk('')
    try {
      const fd = new FormData()
      fd.append('plan_id', planId)
      fd.append('method', method)
      fd.append('ack_terms', ackTerms ? '1' : '0')
      if (method === 'receipt') {
        if (!receiptFile) throw new Error('تصویر رسید را انتخاب کنید')
        fd.append('receipt_image', receiptFile)
        fd.append('receipt_note', receiptNote || '')
      }
      const res = await axios.post(
        Config.endpoints.reboOrders.contractSupportRenew(board.order.code),
        fd,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'تمدید پشتیبانی ناموفق بود')
      }
      if (res.data.data?.board) setBoard(res.data.data.board)
      setOk(res.data.message || 'ثبت شد')
      const payUrl = res.data.data?.payment_url
      if (payUrl) {
        window.location.href = payUrl
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در تمدید پشتیبانی')
    } finally {
      setSupportBusy(false)
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <Loader2 className={styles.spin} size={24} />
          <p>در حال بررسی دسترسی…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              <ClipboardList size={18} />
            </span>
            <div>
              <h1>میزکار قرارداد ربو</h1>
              <p>اقساط قرارداد موتور ربو — مشابه میزکار وظایف</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {isStaff ? (
              <Link href="/reboaccunting" className={styles.btn}>
                <LayoutDashboard size={13} />
                حسابداری ربو
              </Link>
            ) : null}
            {board ? (
              <>
                <Link href="/todorebo" className={styles.btn}>
                  <Boxes size={13} />
                  همه سفارش‌ها
                </Link>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setContractOpen(true)}
                >
                  <FileText size={13} />
                  متن قرارداد
                </button>
                <button type="button" className={styles.btn} onClick={downloadPdf}>
                  <Download size={13} />
                  PDF
                </button>
              </>
            ) : null}
            <Link href="/profile?tab=packages" className={styles.btn}>
              <Boxes size={13} />
              سبد
            </Link>
            <Link href="/dashboard" className={styles.btn}>
              <LayoutDashboard size={13} />
              داشبورد
            </Link>
            <button type="button" className={styles.btn} onClick={refresh} disabled={loadingData}>
              <RefreshCw size={13} className={loadingData ? styles.spin : undefined} />
              بروزرسانی
            </button>
          </div>
        </header>

        {err ? (
          <div className={styles.err}>
            <AlertCircle size={14} />
            {err}
          </div>
        ) : null}
        {ok ? (
          <div className={styles.ok}>
            <CheckCircle2 size={14} />
            {ok}
          </div>
        ) : null}

        {loadingData ? (
          <div className={styles.stateBox}>
            <Loader2 className={styles.spin} size={22} />
            <p>در حال بارگذاری…</p>
          </div>
        ) : null}

        {!loadingData && !codeParam ? (
          <section className={styles.card}>
            <div className={styles.deskHead}>
              <div>
                <h2>
                  {deskMeta.is_staff || isStaff
                    ? 'میزکار همه سفارش‌های ربو'
                    : 'سفارش‌های قرارداد شما'}
                </h2>
                <p className={styles.hint}>
                  {deskMeta.is_staff || isStaff
                    ? 'همه کاربران — با کد سفارش وارد جزئیات شوید؛ موارد قطعی را آرشیو کنید.'
                    : 'پس از ثبت سفارش، قرارداد اقساطی همین‌جا باز می‌شود.'}
                </p>
              </div>
              <div className={styles.deskTabs}>
                <button
                  type="button"
                  className={deskMode === '0' ? styles.deskTabOn : styles.deskTab}
                  onClick={() => setDeskMode('0')}
                >
                  فعال ({deskMode === '0' ? deskMeta.count : '…'})
                </button>
                <button
                  type="button"
                  className={deskMode === '1' ? styles.deskTabOn : styles.deskTab}
                  onClick={() => setDeskMode('1')}
                >
                  آرشیو
                </button>
              </div>
            </div>
            {orders.length ? (
              <div className={styles.orderPicker} style={{ marginTop: 12 }}>
                {orders.map((o) => (
                  <div key={o.id} className={styles.orderCard}>
                    <Link
                      href={`/todorebo?code=${encodeURIComponent(o.code)}`}
                      className={styles.orderPick}
                    >
                      <div className={styles.orderPickMain}>
                        <div className={styles.orderPickTop}>
                          <strong dir="ltr">{o.code}</strong>
                          <span className={styles.orderStatus}>
                            {o.status_display || o.status}
                          </span>
                        </div>
                        {(isStaff || deskMeta.is_staff) && (
                          <div className={styles.orderUser}>
                            {o.customer_name || o.user_name || '—'}
                            {o.customer_mobile || o.user_mobile
                              ? ` · ${o.customer_mobile || o.user_mobile}`
                              : ''}
                          </div>
                        )}
                        {(o.lines || []).length ? (
                          <div className={styles.orderLines}>
                            {o.lines.slice(0, 3).map((l, i) => (
                              <span key={`${o.id}-l-${i}`}>{l.title}</span>
                            ))}
                            {o.lines_count > 3 ? (
                              <span>+{o.lines_count - 3}</span>
                            ) : null}
                          </div>
                        ) : null}
                        <div className={styles.orderMoney}>
                          <span>
                            کل: {money(o.amount, o.currency_label)}
                          </span>
                          <span>
                            پرداختی: {money(o.paid_amount, o.currency_label)}
                          </span>
                          <span>
                            مانده: {money(o.remaining_amount, o.currency_label)}
                          </span>
                        </div>
                      </div>
                    </Link>
                    {isStaff ? (
                      <button
                        type="button"
                        className={styles.orderArchiveBtn}
                        disabled={busyId === `desk-${o.id}`}
                        onClick={() => onArchiveOrder(o, deskMode !== '1')}
                        title={deskMode === '1' ? 'خروج از آرشیو' : 'آرشیو'}
                      >
                        {busyId === `desk-${o.id}` ? (
                          <Loader2 size={14} className={styles.spin} />
                        ) : deskMode === '1' ? (
                          <ArchiveRestore size={14} />
                        ) : (
                          <Archive size={14} />
                        )}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNote} style={{ marginTop: 10 }}>
                {deskMode === '1'
                  ? 'آرشیوی نیست.'
                  : 'هنوز سفارشی نیست. از صفحه قیمت‌گذاری بسته را به سبد اضافه کنید.'}
              </p>
            )}
          </section>
        ) : null}

        {!loadingData && board ? (
          <>
            {contractAccepted && !depositPaid ? (
              <DepositTimerCard
                deadlineIso={depositDeadline}
                hoursWindow={board.summary?.deposit_window_hours || 72}
                expired={depositExpired || board.order?.status === 'cancelled'}
                expireMessage={board.summary?.expire_message || ''}
                onExpired={onDepositTimerExpired}
              />
            ) : null}

            <section className={styles.acceptCard}>
              <h2>تأیید قرارداد</h2>
              {contractAccepted ? (
                <div className={styles.acceptDone}>
                  <CheckCircle2 size={14} />
                  متن قرارداد تأیید شده
                  {board.summary?.contract_accepted_at
                    ? ` · ${new Date(board.summary.contract_accepted_at).toLocaleString('fa-IR')}`
                    : ''}
                </div>
              ) : (
                <>
                  <p>
                    پیش از دسترسی به قسط پیش‌پرداخت، متن کامل قرارداد را بخوانید و
                    موافقت خود را اعلام کنید.
                  </p>
                  <label
                    className={`${styles.acceptRow} ${agreeChecked ? styles.acceptRowOn : ''}`}
                  >
                    <span className={styles.acceptBox} aria-hidden>
                      {agreeChecked ? <CheckCircle2 size={13} /> : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={agreeChecked}
                      onChange={(e) => setAgreeChecked(e.target.checked)}
                      hidden
                    />
                    <span className={styles.acceptText}>
                      <strong>
                        متن کامل قرارداد طراحی و راه‌اندازی وب‌سایت اختصاصی (از جمله ماده
                        پشتیبانی پس از تحویل) را مطالعه کردم و با آن موافقم.
                      </strong>
                      <span>
                        با زدن این گزینه، قسط پیش‌پرداخت (۴۰٪) برای پرداخت باز می‌شود.
                      </span>
                    </span>
                  </label>
                  <div className={styles.acceptActions}>
                    <button
                      type="button"
                      className={styles.miniBtn}
                      onClick={() => setContractOpen(true)}
                    >
                      <FileText size={12} />
                      مشاهده متن قرارداد
                    </button>
                    <button
                      type="button"
                      className={styles.acceptBtn}
                      disabled={!agreeChecked || acceptBusy}
                      onClick={acceptContract}
                    >
                      {acceptBusy ? (
                        <Loader2 size={13} className={styles.spin} />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      تأیید و باز کردن پیش‌پرداخت
                    </button>
                  </div>
                </>
              )}

              {(isStaff || deskMeta.is_staff) ? (
                <div className={styles.marketerAssign}>
                  <div className={styles.marketerAssignHead}>
                    <Megaphone size={13} />
                    <strong>بازاریاب این سفارش</strong>
                  </div>
                  <div className={styles.marketerAssignRow}>
                    <select
                      className={styles.marketerSelect}
                      disabled={marketerBusy}
                      value={board.marketer?.id || ''}
                      onChange={(e) => assignMarketer(e.target.value)}
                    >
                      <option value="">بدون بازاریاب</option>
                      {(board.marketers || []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {m.pay_mode_display ? ` · ${m.pay_mode_display}` : ''}
                          {m.has_commission
                            ? ` · ${Number(m.commission_percent).toLocaleString('fa-IR')}٪`
                            : ''}
                        </option>
                      ))}
                    </select>
                    {marketerBusy ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : null}
                  </div>
                  {board.marketer ? (
                    <div className={styles.marketerMeta}>
                      {board.marketer.mobile ? `${board.marketer.mobile} · ` : ''}
                      {board.marketer.pay_mode_display || ''}
                      {board.marketer_commission_preview
                        ? ` · پورسانت فعلی ${formatRial(board.marketer_commission_preview)}`
                        : ''}
                      <Link className={styles.marketerAccLink} href="/reboaccunting">
                        مدیریت در حسابداری
                      </Link>
                    </div>
                  ) : (
                    <p className={styles.marketerHint}>
                      بازاریاب را انتخاب کنید تا سهم پورسانت در حسابداری ثبت شود.
                    </p>
                  )}
                </div>
              ) : null}
            </section>

            <div className={styles.summary}>
              <section className={styles.card}>
                <h2>قرارداد سفارش موتور ربو</h2>
                <p>{board.summary?.contract_article}</p>
                <div className={styles.metaRow}>
                  <span>
                    کد: <strong dir="ltr">{board.order?.code}</strong>
                  </span>
                  <span>
                    وضعیت: <strong>{board.order?.status_display}</strong>
                  </span>
                  {board.order?.request_number ? (
                    <span>
                      پیگیری: <strong dir="ltr">{board.order.request_number}</strong>
                    </span>
                  ) : null}
                </div>
                <ul className={styles.lines}>
                  {(board.order?.lines_json || []).map((line, idx) => (
                    <li key={`${line.id || line.title}-${idx}`}>
                      <span>{line.title}</span>
                      <strong>{money(line.price, currency)}</strong>
                    </li>
                  ))}
                </ul>
                <div className={styles.contractActions}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ background: '#1e3b2f', color: '#fff' }}
                    onClick={() => setContractOpen(true)}
                  >
                    <FileText size={13} />
                    مشاهده متن کامل قرارداد
                  </button>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={downloadPdf}
                  >
                    <Download size={12} />
                    دانلود PDF
                  </button>
                </div>
              </section>

              <section className={styles.card}>
                <h2>جمع مالی</h2>
                <div className={styles.moneyGrid}>
                  <div className={styles.moneyItem}>
                    <label>مبلغ کل قرارداد</label>
                    <strong>{money(board.summary?.total, currency)}</strong>
                  </div>
                  <div className={styles.moneyItem}>
                    <label>پرداخت‌شده</label>
                    <strong>{money(board.summary?.paid, currency)}</strong>
                  </div>
                  <div className={styles.moneyItem}>
                    <label>مانده</label>
                    <strong>{money(board.summary?.remaining, currency)}</strong>
                  </div>
                </div>
                <p className={styles.hint} style={{ marginTop: 8 }}>
                  قسط اول (۴۰٪) از همین لحظه باز است. اقساط بعدی طبق پیشرفت پروژه آزاد می‌شوند.
                </p>
              </section>
            </div>

            <div className={styles.board}>
              {columns.map((col) => {
                const stage = stagesByKey[col.id]
                return (
                  <section
                    key={col.id}
                    className={`${styles.column} ${COL_CLASS[col.id] || ''}`}
                  >
                    <div className={styles.columnHead}>
                      <h2 className={styles.columnTitle}>
                        <span className={styles.columnDot} aria-hidden />
                        {col.title}
                      </h2>
                      <span className={styles.columnCount}>
                        {col.percent ? `${col.percent}٪` : '—'}
                      </span>
                    </div>
                    {stage ? (
                      <StageCard
                        stage={stage}
                        currency={currency}
                        payCfg={payCfg}
                        isStaff={isStaff}
                        busyId={busyId}
                        onPay={onPay}
                        onAction={onAction}
                        onAskMarkPaid={setMarkPaidStage}
                        contractAccepted={contractAccepted}
                        paymentBlocked={
                          depositExpired || board.order?.status === 'cancelled'
                        }
                        cloudOffer={cloudOffer}
                        contactChannels={contactChannels}
                        cloudSub={cloudSub}
                        hostingChoice={hostingChoice}
                        hostingBusy={hostingBusy}
                        ownNote={ownNote}
                        setOwnNote={setOwnNote}
                        acceptPolicy={acceptPolicy}
                        setAcceptPolicy={setAcceptPolicy}
                        onChooseHosting={onChooseHosting}
                        support={supportInfo}
                        supportBusy={supportBusy}
                        onSupportAck={onSupportAck}
                        onSupportRenew={onSupportRenew}
                      />
                    ) : (
                      <p className={styles.emptyNote}>مرحله تعریف نشده</p>
                    )}
                  </section>
                )
              })}
            </div>
          </>
        ) : null}

        {!loadingData && codeParam && !board && !err ? (
          <div className={styles.denied}>
            <Shield size={24} />
            <p>قراردادی برای این کد پیدا نشد.</p>
          </div>
        ) : null}
      </div>

      <ContractModal
        open={contractOpen}
        board={board}
        onClose={() => setContractOpen(false)}
      />
      <AdminMarkPaidModal
        open={!!markPaidStage}
        stage={markPaidStage}
        currency={currency}
        busy={busyId === markPaidStage?.id}
        onClose={() => setMarkPaidStage(null)}
        onConfirm={confirmMarkPaid}
      />
    </div>
  )
}

export default function TodoReboModule() {
  return <TodoReboInner />
}
