'use client'

import React, { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import styles from './TechRatingForm.module.css'

export const RATING_ASPECTS = [
  { key: 'work_quality', label: 'کیفیت کار فنی' },
  { key: 'punctuality', label: 'وقت‌شناسی' },
  { key: 'ethics', label: 'اخلاق حرفه‌ای' },
  { key: 'communication', label: 'ارتباط و پاسخ‌گویی' },
  { key: 'neatness', label: 'نظم و پاکیزگی' },
]

function emptyScores(seed = 5) {
  return RATING_ASPECTS.reduce((acc, a) => {
    acc[a.key] = seed
    return acc
  }, {})
}

function StarRow({ value, onChange, readOnly }) {
  return (
    <div className={styles.stars} dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${n <= value ? styles.starOn : ''}`}
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} از ۵`}
        >
          <Star size={16} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function TechRatingForm({
  existing,
  busy = false,
  title = 'امتیاز به سرویسکار',
  subtitle = 'از چند جنبه امتیاز دهید',
  onSubmit,
}) {
  const [scores, setScores] = useState(() => emptyScores(5))
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!existing) {
      setScores(emptyScores(5))
      setComment('')
      return
    }
    setScores({
      work_quality: existing.work_quality || 5,
      punctuality: existing.punctuality || 5,
      ethics: existing.ethics || 5,
      communication: existing.communication || 5,
      neatness: existing.neatness || 5,
    })
    setComment(existing.comment || '')
  }, [existing])

  const avg =
    RATING_ASPECTS.reduce((s, a) => s + Number(scores[a.key] || 0), 0) /
    RATING_ASPECTS.length

  const readOnly = !!existing && !onSubmit

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <strong>{title}</strong>
          <p>{subtitle}</p>
        </div>
        <span className={styles.avg}>
          میانگین {avg.toFixed(1).replace('.', '٫')}
        </span>
      </header>

      <div className={styles.list}>
        {RATING_ASPECTS.map((a) => (
          <div key={a.key} className={styles.row}>
            <span>{a.label}</span>
            <StarRow
              value={Number(scores[a.key] || 0)}
              readOnly={readOnly || !onSubmit}
              onChange={(n) =>
                setScores((s) => ({
                  ...s,
                  [a.key]: n,
                }))
              }
            />
          </div>
        ))}
      </div>

      <label className={styles.comment}>
        <span>توضیح (اختیاری)</span>
        <textarea
          rows={2}
          value={comment}
          disabled={readOnly || !onSubmit}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نکته‌ای درباره رفتار، کیفیت یا زمان‌بندی…"
        />
      </label>

      {onSubmit ? (
        <button
          type="button"
          className={styles.submit}
          disabled={busy}
          onClick={() =>
            onSubmit({
              ...scores,
              comment,
            })
          }
        >
          {existing ? 'به‌روزرسانی امتیاز' : 'ثبت امتیاز'}
        </button>
      ) : existing ? (
        <p className={styles.saved}>امتیاز شما قبلاً ثبت شده است.</p>
      ) : null}
    </section>
  )
}
