'use client'

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { GraduationCap, X } from 'lucide-react'
import styles from './GuidedTour.module.css'

const PAD = 8

function toFa(n) {
  return Number(n).toLocaleString('fa-IR')
}

/**
 * تور با لایه تیره؛ حفرهٔ هدف قابل کلیک است (بدون z-index روی عنصر صفحه).
 * advanceOn اختیاری است — همیشه «مرحله بعد / رد کردن / پایان» هست.
 */
export default function GuidedTour({
  open,
  steps = [],
  stepIndex = 0,
  onStepChange,
  onClose,
  tipClassName = '',
  theme = 'default',
}) {
  const [rect, setRect] = useState(null)
  const [tipPos, setTipPos] = useState({ top: 24, left: 24, tipW: 300, mobile: false })
  const [mounted, setMounted] = useState(false)

  const step = steps[stepIndex] || null
  const total = steps.length
  const isLast = stepIndex >= total - 1

  useEffect(() => {
    setMounted(true)
  }, [])

  const findTargetEl = useCallback((selector) => {
    if (!selector || typeof document === 'undefined') return null
    const parts = String(selector)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const sel of parts) {
      const el = document.querySelector(sel)
      if (el) return el
    }
    return null
  }, [])

  const measure = useCallback(() => {
    if (!open || !step?.target) {
      setRect(null)
      return
    }
    const el = findTargetEl(step.target)
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    const hole = {
      top: Math.max(4, r.top - PAD),
      left: Math.max(4, r.left - PAD),
      width: Math.min(window.innerWidth - 8, r.width + PAD * 2),
      height: Math.min(window.innerHeight - 8, r.height + PAD * 2),
    }
    setRect(hole)

    const vw = window.innerWidth
    const vh = window.innerHeight
    const mobile = vw < 720
    const tipW = Math.min(mobile ? vw - 20 : 340, vw - 20)
    const tipH = mobile ? Math.min(320, Math.floor(vh * 0.42)) : 280
    const spaceLeft = hole.left
    const spaceRight = vw - (hole.left + hole.width)
    let top = hole.top + 8
    let left = 10

    if (mobile) {
      // موبایل: کارت راهنما پایین صفحه تا با انگشت راحت باشد و هدف بالا بماند
      left = Math.max(10, (vw - tipW) / 2)
      const spaceBelow = vh - (hole.top + hole.height)
      if (spaceBelow >= tipH + 16) {
        top = Math.min(hole.top + hole.height + 12, vh - tipH - 12)
      } else {
        top = Math.max(10, vh - tipH - 12)
      }
    } else if (spaceLeft >= tipW + 20) {
      left = hole.left - tipW - 14
      top = Math.min(hole.top, vh - tipH - 12)
    } else if (spaceRight >= tipW + 20) {
      left = hole.left + hole.width + 14
      top = Math.min(hole.top, vh - tipH - 12)
    } else {
      const spaceBelow = vh - (hole.top + hole.height)
      if (spaceBelow >= tipH + 12) {
        top = hole.top + hole.height + 12
      } else {
        top = Math.max(12, hole.top - tipH - 12)
      }
      left = Math.min(Math.max(12, hole.left), vw - tipW - 12)
    }
    top = Math.max(10, Math.min(top, vh - tipH - 10))
    left = Math.max(10, Math.min(left, vw - tipW - 10))
    setTipPos({ top, left, tipW, mobile })
  }, [open, step, findTargetEl])

  useLayoutEffect(() => {
    if (!open || !step?.target) return
    const el = findTargetEl(step.target)
    el?.scrollIntoView({
      block: window.innerWidth < 720 ? 'center' : 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    })
    // بعد از اسکرول / تعویض تب اندازه بگیر
    const t1 = requestAnimationFrame(() => measure())
    const t2 = window.setTimeout(measure, 280)
    return () => {
      cancelAnimationFrame(t1)
      window.clearTimeout(t2)
    }
  }, [open, step, stepIndex, measure, findTargetEl])

  useEffect(() => {
    if (!open) return undefined
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    const t = setInterval(measure, 350)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      clearInterval(t)
    }
  }, [open, measure])

  if (!mounted || !open || !step) return null

  const goNext = () => {
    if (isLast) onClose?.()
    else onStepChange?.(stepIndex + 1)
  }

  const shade = rect
    ? [
        { top: 0, left: 0, right: 0, height: Math.max(0, rect.top) },
        {
          top: rect.top + rect.height,
          left: 0,
          right: 0,
          bottom: 0,
        },
        {
          top: rect.top,
          left: 0,
          width: Math.max(0, rect.left),
          height: rect.height,
        },
        {
          top: rect.top,
          left: rect.left + rect.width,
          right: 0,
          height: rect.height,
        },
      ]
    : [{ top: 0, left: 0, right: 0, bottom: 0 }]

  return createPortal(
    <div className={styles.root} dir="rtl" aria-live="polite">
      {shade.map((s, i) => (
        <div key={i} className={styles.shade} style={s} />
      ))}
      {rect ? (
        <div
          className={styles.hole}
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : null}

      <div
        className={[
          styles.tip,
          theme === 'job' ? styles.tipJob : '',
          theme === 'school' ? styles.tipSchool : '',
          tipPos.mobile ? styles.tipMobile : '',
          tipClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          top: tipPos.top,
          left: tipPos.left,
          width: tipPos.tipW,
        }}
        role="dialog"
        aria-label={`آموزش مرحله ${stepIndex + 1}`}
      >
        <div className={styles.tipHead}>
          <span className={styles.stepBadge}>
            <GraduationCap size={13} />
            مرحله {toFa(stepIndex + 1)} از {toFa(total)}
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onClose?.()}
            aria-label="پایان آموزش"
          >
            <X size={14} />
          </button>
        </div>
        <h4 className={styles.tipTitle}>{step.title}</h4>
        <p className={styles.tipText}>{step.text}</p>
        {Array.isArray(step.howTo) && step.howTo.length ? (
          <ol className={styles.tipHowTo}>
            {step.howTo.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        ) : null}
        {step.hint ? <p className={styles.tipHint}>{step.hint}</p> : null}
        <div className={styles.tipActions}>
          <button
            type="button"
            className={styles.endBtn}
            onClick={() => onClose?.()}
          >
            پایان آموزش
          </button>
          {!isLast ? (
            <button type="button" className={styles.skipBtn} onClick={goNext}>
              رد کردن
            </button>
          ) : null}
          <button type="button" className={styles.nextBtn} onClick={goNext}>
            {isLast ? 'تمام' : 'مرحله بعد'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function useGuidedTour(initialSteps = []) {
  const [steps, setSteps] = useState(initialSteps)
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  /**
   * شروع تور.
   * - بدون آرگومان: همان initialSteps
   * - آرایه: تور سفارشی (مثلاً راهنمای یک بخش)
   */
  const start = useCallback(
    (overrideSteps) => {
      const next =
        Array.isArray(overrideSteps) && overrideSteps.length
          ? overrideSteps
          : initialSteps
      setSteps(next)
      setStepIndex(0)
      setOpen(true)
    },
    [initialSteps],
  )

  const close = useCallback(() => {
    setOpen(false)
    setStepIndex(0)
  }, [])

  /** اگر مرحله فعلی منتظر این سیگنال باشد، جلو برو — الزامی نیست */
  const advance = useCallback(
    (signal) => {
      if (!open) return
      const current = steps[stepIndex]
      if (!current?.advanceOn || current.advanceOn === 'manual') return
      if (current.advanceOn !== signal) return
      if (stepIndex >= steps.length - 1) {
        setOpen(false)
        setStepIndex(0)
      } else {
        setStepIndex((i) => i + 1)
      }
    },
    [open, stepIndex, steps],
  )

  return { open, stepIndex, setStepIndex, start, close, advance, steps }
}
