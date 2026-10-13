'use client'

import React, { useEffect, useState } from 'react'
import { Check, X, ImageIcon } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const APPROVE_PRESETS = [
  '🌟 آفرین!',
  '🎉 عالی بود!',
  '👍 خوب بود',
  '💪 کارت تمیز بود',
  '✨ خیلی خوب پیش رفتی',
]

const REJECT_PRESETS = [
  '🧐 بیشتر باید دقت می‌کردی',
  '📷 تصویر واضح نیست؛ دوباره بفرست',
  '📝 جواب ناقصه؛ کامل‌ترش کن',
  '🔍 لطفاً با توضیح بیشتر دوباره ارسال کن',
  '✏️ نیاز به اصلاح داره',
]

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

export default function HomeworkReviewPanel({
  submissions = [],
  onNotify,
  onDone,
  compact = false,
}) {
  const [reviewing, setReviewing] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [note, setNote] = useState('')
  const [action, setAction] = useState('approved')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!reviewing && !lightbox) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setReviewing(null)
        setLightbox(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reviewing, lightbox])

  const openReview = (sub, nextAction = 'approved') => {
    setReviewing(sub)
    setAction(nextAction)
    setNote('')
  }

  const applyPreset = (text) => {
    setNote((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
  }

  const submitReview = async () => {
    if (!reviewing) return
    const trimmed = note.trim()
    if (action === 'rejected' && !trimmed) {
      onNotify?.('برای رد تکلیف باید دلیل را بنویسید', true)
      return
    }
    setBusy(true)
    const res = await schoolService.reviewSubmission(reviewing.id, {
      status: action,
      teacher_note: trimmed,
    })
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بررسی', true)
      return
    }
    onNotify?.(action === 'approved' ? 'تأیید شد و پیام برای دانش‌آموز ثبت شد' : 'رد شد و دلیل برای دانش‌آموز ثبت شد')
    setReviewing(null)
    setNote('')
    onDone?.()
  }

  const presets = action === 'approved' ? APPROVE_PRESETS : REJECT_PRESETS

  if (!submissions.length) {
    return (
      <div className={styles.hwReviewEmpty}>
        <p>تکلیفی برای بررسی نیست</p>
      </div>
    )
  }

  return (
    <div className={styles.hwReview}>
      {!compact ? (
        <div className={styles.hwReviewHead}>
          <h2 className={styles.panelTitle}>بررسی تکالیف</h2>
          <span className={styles.metaMuted}>{faNum(submissions.length)}</span>
        </div>
      ) : null}

      <div className={styles.hwReviewList} role="list">
        {submissions.map((s) => (
          <article key={s.id} className={styles.hwReviewRow} role="listitem">
            <div className={styles.hwReviewMain}>
              <strong className={styles.hwReviewName}>{s.student_name || 'دانش‌آموز'}</strong>
              <p className={styles.hwReviewExercise}>
                {s.exercise_title || 'تکلیف'}
                {s.lesson_title ? ` · ${s.lesson_title}` : ''}
              </p>
              {s.note ? <p className={styles.hwReviewNote}>{s.note}</p> : null}
            </div>

            <div className={styles.hwReviewSide}>
              {s.proof_url ? (
                <button
                  type="button"
                  className={styles.hwListThumbBtn}
                  onClick={() => setLightbox(s.proof_url)}
                  title="مشاهده تصویر"
                >
                  <img src={s.proof_url} alt="" className={styles.hwListThumb} />
                </button>
              ) : (
                <span className={styles.hwListThumbEmpty} title="بدون تصویر">
                  <ImageIcon size={14} />
                </span>
              )}
              <button
                type="button"
                className={styles.hwReviewIconOk}
                onClick={() => openReview(s, 'approved')}
                title="تأیید"
                aria-label="تأیید"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                className={styles.hwReviewIconNo}
                onClick={() => openReview(s, 'rejected')}
                title="رد"
                aria-label="رد"
              >
                <X size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {lightbox ? (
        <div
          className={styles.hwModalBackdrop}
          role="presentation"
          onClick={() => setLightbox(null)}
        >
          <div
            className={styles.hwLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="پیش‌نمایش تصویر تکلیف"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.hwModalClose}
              onClick={() => setLightbox(null)}
            >
              <X size={16} />
            </button>
            <img src={lightbox} alt="پیش‌نمایش تکلیف" />
          </div>
        </div>
      ) : null}

      {reviewing ? (
        <div
          className={styles.hwModalBackdrop}
          role="presentation"
          onClick={() => !busy && setReviewing(null)}
        >
          <div
            className={styles.hwReviewModal}
            role="dialog"
            aria-modal="true"
            aria-label="بررسی تکلیف"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.hwReviewModalHead}>
              <div>
                <h3>
                  {action === 'approved' ? 'تأیید تکلیف' : 'رد تکلیف'}
                </h3>
                <p>
                  {reviewing.student_name}
                  {' · '}
                  {reviewing.exercise_title}
                </p>
              </div>
              <button
                type="button"
                className={styles.hwModalClose}
                onClick={() => !busy && setReviewing(null)}
              >
                <X size={16} />
              </button>
            </div>

            {reviewing.proof_url ? (
              <button
                type="button"
                className={styles.hwReviewModalThumb}
                onClick={() => setLightbox(reviewing.proof_url)}
              >
                <img src={reviewing.proof_url} alt="" />
                <span>بزرگ‌نمایی تصویر</span>
              </button>
            ) : null}

            <div className={styles.hwActionTabs}>
              <button
                type="button"
                className={action === 'approved' ? styles.hwActionOn : ''}
                onClick={() => { setAction('approved'); setNote('') }}
              >
                تأیید
              </button>
              <button
                type="button"
                className={action === 'rejected' ? styles.hwActionOnReject : ''}
                onClick={() => { setAction('rejected'); setNote('') }}
              >
                رد
              </button>
            </div>

            <div className={styles.field}>
              <label>
                پیام برای دانش‌آموز
                {action === 'rejected' ? ' (الزامی)' : ' (اختیاری)'}
              </label>
              <div className={styles.hwPresetGrid}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.hwPreset}
                    onClick={() => applyPreset(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  action === 'approved'
                    ? 'مثلاً: آفرین! عالی بود'
                    : 'دلیل رد را بنویسید؛ مثلاً بیشتر باید دقت می‌کردی'
                }
              />
              {action === 'rejected' ? (
                <p className={styles.fieldHint}>بدون توضیح، تکلیف رد نمی‌شود</p>
              ) : null}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={action === 'approved' ? styles.btnAccent : styles.btn}
                disabled={busy}
                onClick={submitReview}
              >
                {action === 'approved' ? <Check size={14} /> : <X size={14} />}
                {action === 'approved' ? 'ثبت تأیید' : 'ثبت رد'}
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                disabled={busy}
                onClick={() => setReviewing(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
