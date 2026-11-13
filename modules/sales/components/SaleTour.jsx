'use client'

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  ListFilter,
  MessageSquare,
  Route,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import styles from '../styles/SaleTour.module.css'

const STORAGE_KEY = 'aria_sale_tour_seen_v1'

export const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    icon: Sparkles,
    title: 'راهنمای سریع فروش',
    body: 'این تور خیلی کوتاه به شما نشان می‌دهد صفحه فروش چطور کار می‌کند: کارت‌ها، دکمه‌ها، ثبت گزارش و دیالوگ جزئیات.',
    placement: 'center',
    dialog: false,
  },
  {
    id: 'board',
    target: 'sale-board',
    icon: ListFilter,
    title: 'تابلو وضعیت‌ها',
    body: 'موارد در ستون‌های «جدید»، «پیگیری»، «قرارداد» و «بسته» چیده می‌شوند. هر مورد فقط در یک وضعیت است و با اقدامات شما جابه‌جا می‌شود.',
    placement: 'bottom',
    dialog: false,
  },
  {
    id: 'search',
    target: 'sale-search',
    icon: Search,
    title: 'جستجو و فیلتر',
    body: 'با جستجو عنوان، موبایل، مشتری یا کد پیگیری را پیدا کنید. تب‌ها هم لیست را سریع فیلتر می‌کنند.',
    placement: 'bottom',
    dialog: false,
  },
  {
    id: 'card',
    target: 'sale-card',
    icon: Eye,
    title: 'کارت هر مورد',
    body: 'روی کارت کد پیگیری، وضعیت، مشتری، موبایل و پیگیری بعدی را می‌بینید. برای جزئیات کامل روی کارت یا دکمه چشم بزنید.',
    placement: 'bottom',
    dialog: false,
  },
  {
    id: 'actions',
    target: 'sale-card-actions',
    icon: CalendarClock,
    title: 'دکمه‌های رنگی کارت',
    body: 'سفید = مشاهده · زرد = ثبت پیگیری · سبز = قرارداد · قرمز کم‌رنگ = بستن · آبی = آرشیو (فقط بعد از قرارداد/بسته شدن).',
    placement: 'top',
    dialog: false,
  },
  {
    id: 'dialog',
    target: 'sale-dialog',
    icon: MessageSquare,
    title: 'دیالوگ جزئیات',
    body: 'اینجا همه چیز یک مورد را یکجا می‌بینید: مشخصات، اقدامات، مسیر مسئولیت و تاریخچه گزارش‌ها.',
    placement: 'left',
    dialog: true,
  },
  {
    id: 'dialog-actions',
    target: 'sale-dialog-actions',
    icon: FileText,
    title: 'اقدامات داخل دیالوگ',
    body: 'ثبت پیگیری، قرارداد و بستن از اینجا هم انجام می‌شود. صدور پیش‌فاکتور و فاکتور فقط داخل همین دیالوگ است.',
    placement: 'left',
    dialog: true,
  },
  {
    id: 'dialog-path',
    target: 'sale-dialog-path',
    icon: Route,
    title: 'مسیر و گزارش‌ها',
    body: 'هر گزارش کارمند با توضیح، صوت و فایل پیوست اینجا ثبت می‌شود تا مدیر و تیم ببینند در طول مسیر چه اتفاقی افتاده.',
    placement: 'left',
    dialog: true,
  },
  {
    id: 'archive',
    target: 'sale-archive-tab',
    icon: Archive,
    title: 'آرشیو',
    body: 'موارد قرارداد یا بسته‌شده را می‌توانید آرشیو کنید تا تابلو خلوت بماند؛ بعداً از تب آرشیو قابل جستجو و بازگردانی هستند.',
    placement: 'bottom',
    dialog: false,
  },
  {
    id: 'done',
    target: null,
    icon: HelpCircle,
    title: 'آماده کار هستید',
    body: 'هر وقت دوباره لازم شد، روی دکمه «؟ تور راهنما» بزنید. حالا می‌توانید اولین مورد را بسازید یا یک کارت را باز کنید.',
    placement: 'center',
    dialog: false,
  },
]

function getTargetRect(targetId) {
  if (!targetId || typeof document === 'undefined') return null
  const el = document.querySelector(`[data-tour="${targetId}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    bottom: r.bottom,
    right: r.right,
  }
}

export function hasSeenSaleTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markSaleTourSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export default function SaleTour({ open, onClose, onDialogRequired }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  const current = TOUR_STEPS[step] || TOUR_STEPS[0]
  const total = TOUR_STEPS.length
  const Icon = current.icon || HelpCircle

  const measure = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
    if (!current.target) {
      setRect(null)
      return
    }
    const r = getTargetRect(current.target)
    setRect(r)
    if (r) {
      const el = document.querySelector(`[data-tour="${current.target}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [current.target])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    const t = setTimeout(measure, 120)
    const t2 = setTimeout(measure, 360)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [open, step, measure])

  useEffect(() => {
    if (!open) return undefined
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  useEffect(() => {
    if (!open) {
      onDialogRequired?.(false)
      return
    }
    onDialogRequired?.(!!current.dialog)
  }, [open, current.dialog, step, onDialogRequired])

  const finish = () => {
    markSaleTourSeen()
    onDialogRequired?.(false)
    onClose?.()
  }

  const next = () => {
    if (step >= total - 1) finish()
    else setStep((s) => s + 1)
  }

  const prev = () => setStep((s) => Math.max(0, s - 1))

  if (!open) return null

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const pad = isMobile ? 8 : 12
  const cardW = Math.min(380, vw - 28)
  const cardH = 280

  // هدف‌های خیلی بزرگ (مثل کل تابلو) را محدود کن تا کارت از صفحه بیرون نزند
  let spotlight = null
  let useSheet = isMobile || !rect || current.placement === 'center'
  if (rect) {
    let top = Math.max(8, rect.top - pad)
    let left = Math.max(8, rect.left - pad)
    let width = Math.min(vw - 16, rect.width + pad * 2)
    let height = Math.min(vh - 16, rect.height + pad * 2)

    const tooTall = height > vh * 0.48
    const tooWide = width > vw * 0.92
    if (tooTall || tooWide) {
      // فقط بخش بالایی هدف را هایلایت کن و کارت را پایین صفحه بگذار
      height = Math.min(height, Math.max(120, vh * 0.34))
      width = Math.min(width, vw - 32)
      left = Math.max(16, Math.min(left, vw - width - 16))
      top = Math.max(16, Math.min(top, vh - height - cardH - 40))
      useSheet = true
    }

    spotlight = { top, left, width, height }
  }

  let floatStyle
  if (!useSheet && spotlight && current.placement !== 'center') {
    if (current.placement === 'left') {
      const preferLeft = spotlight.left - cardW - 16
      const left =
        preferLeft >= 16
          ? preferLeft
          : Math.min(spotlight.left + spotlight.width + 16, vw - cardW - 16)
      floatStyle = {
        top: Math.min(Math.max(16, spotlight.top), vh - cardH - 16),
        left: Math.max(16, left),
        transform: 'none',
      }
    } else if (current.placement === 'top') {
      const top = spotlight.top - 12
      floatStyle = {
        top: Math.max(cardH + 16, top),
        left: Math.min(Math.max(16, spotlight.left), vw - cardW - 16),
        transform: 'translateY(-100%)',
      }
      // اگر بالای صفحه جا نبود، پایین هدف بگذار
      if (spotlight.top < cardH + 24) {
        floatStyle = {
          top: Math.min(spotlight.top + spotlight.height + 16, vh - cardH - 16),
          left: Math.min(Math.max(16, spotlight.left), vw - cardW - 16),
          transform: 'none',
        }
      }
    } else {
      // bottom — اگر پایین صفحه جا نبود، شیت پایین
      const below = spotlight.top + spotlight.height + 16
      if (below + cardH > vh - 12) {
        useSheet = true
        floatStyle = undefined
      } else {
        floatStyle = {
          top: below,
          left: Math.min(Math.max(16, spotlight.left), vw - cardW - 16),
          transform: 'none',
        }
      }
    }
  }

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="تور راهنمای فروش">
      {spotlight ? (
        <button
          type="button"
          className={styles.spotlightHit}
          aria-label="بستن تور"
          onClick={finish}
        />
      ) : (
        <div className={styles.backdrop} onClick={finish} />
      )}

      {spotlight ? (
        <div
          className={styles.spotlight}
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      ) : null}

      <div
        className={`${styles.card} ${
          useSheet
            ? styles.cardSheet
            : !spotlight
              ? styles.cardCenter
              : styles.cardFloat
        }`}
        style={useSheet ? undefined : floatStyle}
      >
        <div className={styles.cardGlow} />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={finish}
          aria-label="بستن"
        >
          <X size={16} />
        </button>

        <div className={styles.cardHead}>
          <span className={styles.iconWrap}>
            <Icon size={20} />
          </span>
          <div>
            <p className={styles.stepLabel}>
              گام {step + 1} از {total}
            </p>
            <h3 className={styles.title}>{current.title}</h3>
          </div>
        </div>

        <p className={styles.body}>{current.body}</p>

        <div className={styles.progress}>
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${
                i < step ? styles.dotDone : ''
              }`}
              onClick={() => setStep(i)}
              aria-label={`گام ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={finish}>
            رد کردن
          </button>
          <div className={styles.navBtns}>
            {step > 0 ? (
              <button type="button" className={styles.btnSecondary} onClick={prev}>
                <ChevronRight size={16} />
                قبلی
              </button>
            ) : null}
            <button type="button" className={styles.btnPrimary} onClick={next}>
              {step >= total - 1 ? (
                <>
                  شروع کار
                  <CheckCircle2 size={16} />
                </>
              ) : (
                <>
                  بعدی
                  <ChevronLeft size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
