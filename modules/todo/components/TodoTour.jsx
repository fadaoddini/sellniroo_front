'use client'

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Columns3,
  Filter,
  GripVertical,
  HelpCircle,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import styles from '../styles/TodoTour.module.css'

const STORAGE_KEY = 'aria_todo_tour_seen_v1'

export const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    icon: Sparkles,
    title: 'راهنمای میزکار وظایف',
    body: 'در میزکار وظایف، کارت‌ها را بین ستون‌ها جابه‌جا کنید، به کارمندان بسپارید، گزارش فعالیت ثبت کنید و کارهای تمام‌شده را آرشیو کنید.',
    placement: 'center',
  },
  {
    id: 'header',
    target: 'todo-header',
    icon: ClipboardList,
    title: 'نوار بالا',
    body: 'از اینجا میزکار را بروزرسانی کنید، آرشیو را ببینید، تور را دوباره اجرا کنید یا وظیفه جدید بسازید.',
    placement: 'bottom',
  },
  {
    id: 'stats',
    target: 'todo-stats',
    icon: Filter,
    title: 'آمار سریع',
    body: 'تعداد کارت‌ها در هر وضعیت را یک‌نگاه می‌بینید: انتظار، در حال انجام، بررسی، انجام‌شده و آرشیو.',
    placement: 'bottom',
  },
  {
    id: 'filters',
    target: 'todo-filters',
    icon: Search,
    title: 'فیلتر و جستجو',
    body: 'با فیلتر وضعیت یا جستجوی عنوان/کارمند، کارت موردنظر را سریع پیدا کنید.',
    placement: 'bottom',
  },
  {
    id: 'assignees',
    target: 'todo-assignees',
    icon: User,
    title: 'فیلتر کارمند',
    body: 'می‌توانید فقط وظایف یک نفر را ببینید. مدیر همه کارمندان را می‌بیند؛ کارمند معمولاً کارهای خودش را.',
    placement: 'bottom',
  },
  {
    id: 'board',
    target: 'todo-board',
    icon: Columns3,
    title: 'چهار ستون وضعیت',
    body: 'هر ستون رنگ ملایم خودش را دارد: نارنجی کم‌رنگ = انتظار، آبی = در حال انجام، بنفش = بررسی، سبز = انجام‌شده.',
    placement: 'top',
  },
  {
    id: 'col-todo',
    target: 'todo-col-todo',
    icon: Columns3,
    title: 'ستون در انتظار',
    body: 'کارهای جدید یا شروع‌نشده اینجا می‌مانند تا مسئول شروع کند.',
    placement: 'bottom',
  },
  {
    id: 'col-progress',
    target: 'todo-col-progress',
    icon: GripVertical,
    title: 'جابه‌جایی وضعیت',
    body: 'کارمند با ثبت گزارش، کارت را مرحله‌به‌مرحله به ستون مربوط می‌فرستد. فقط مدیر می‌تواند کارت را دستی جابه‌جا کند.',
    placement: 'bottom',
  },
  {
    id: 'card',
    target: 'todo-card',
    icon: MessageCircle,
    title: 'کارت وظیفه و گزارش',
    body: 'با «ثبت فعالیت» متن، ویس یا فایل بفرستید. در صورت نیاز با «ارجاع» به کارمند دیگر بسپارید. مدیر گزارش‌ها را تأیید/رد می‌کند.',
    placement: 'left',
  },
  {
    id: 'create',
    target: 'todo-create',
    icon: Plus,
    title: 'ساخت وظیفه جدید',
    body: 'عنوان، مسئول، سررسید و اولویت را بزنید. کارمند فقط به خودش اختصاص می‌دهد؛ مدیر می‌تواند به دیگران بسپارد.',
    placement: 'bottom',
  },
  {
    id: 'archive',
    target: 'todo-archive',
    icon: Archive,
    title: 'آرشیو',
    body: 'کارهای انجام‌شده را آرشیو کنید تا میزکار خلوت بماند. بعداً از همین دکمه بازگردانی کنید.',
    placement: 'bottom',
  },
  {
    id: 'done',
    target: null,
    icon: HelpCircle,
    title: 'آماده کار هستید',
    body: 'هر وقت خواستید دوباره این راهنما را ببینید، روی «تور راهنما» بزنید. حالا اولین وظیفه را بسازید یا یک کارت را جابه‌جا کنید.',
    placement: 'center',
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
  }
}

export function hasSeenTodoTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markTodoTourSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export default function TodoTour({ open, onClose }) {
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
      document
        .querySelector(`[data-tour="${current.target}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
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

  const finish = () => {
    markTodoTourSeen()
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
  const cardW = Math.min(390, vw - 28)
  const cardH = 290

  let spotlight = null
  let useSheet = isMobile || !rect || current.placement === 'center'
  if (rect) {
    let top = Math.max(8, rect.top - pad)
    let left = Math.max(8, rect.left - pad)
    let width = Math.min(vw - 16, rect.width + pad * 2)
    let height = Math.min(vh - 16, rect.height + pad * 2)
    if (height > vh * 0.45 || width > vw * 0.92) {
      height = Math.min(height, Math.max(110, vh * 0.32))
      width = Math.min(width, vw - 32)
      left = Math.max(16, Math.min(left, vw - width - 16))
      top = Math.max(16, Math.min(top, vh - height - cardH - 36))
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
      if (spotlight.top < cardH + 24) {
        floatStyle = {
          top: Math.min(spotlight.top + spotlight.height + 16, vh - cardH - 16),
          left: Math.min(Math.max(16, spotlight.left), vw - cardW - 16),
          transform: 'none',
        }
      } else {
        floatStyle = {
          top: Math.max(cardH + 16, spotlight.top - 12),
          left: Math.min(Math.max(16, spotlight.left), vw - cardW - 16),
          transform: 'translateY(-100%)',
        }
      }
    } else {
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
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="تور راهنمای میزکار وظایف">
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
        <button type="button" className={styles.closeBtn} onClick={finish} aria-label="بستن">
          <X size={16} />
        </button>

        <div className={styles.cardHead}>
          <span className={styles.iconWrap}>
            <Icon size={18} />
          </span>
          <div>
            <p className={styles.stepLabel}>
              گام {(step + 1).toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')}
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
