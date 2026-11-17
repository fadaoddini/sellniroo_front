'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, UserRound, X } from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import styles from '../styles/Board.module.css'

export default function ReferAssignModal({
  isOpen,
  onClose,
  task,
  onSubmit,
  loading = false,
}) {
  const { assignees, currentUser } = useTodo()
  const [assignee, setAssignee] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const options = useMemo(
    () =>
      (assignees || []).filter(
        (emp) => String(emp.id) !== String(task?.assignee)
      ),
    [assignees, task?.assignee]
  )

  useEffect(() => {
    if (isOpen) {
      setAssignee('')
      setNote('')
      setError('')
    }
  }, [isOpen, task?.id])

  if (!isOpen || !task) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!assignee) {
      setError('کارمند مقصد را انتخاب کنید')
      return
    }
    try {
      await onSubmit({
        assignee: Number(assignee),
        note: note.trim(),
      })
    } catch (err) {
      setError(err?.message || err?.error || 'ارجاع ناموفق بود')
    }
  }

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.modalHead}>
          <h2>ارجاع وظیفه</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <p className={styles.cardDesc} style={{ marginBottom: '0.85rem' }}>
          «{task.title}» — مسئول فعلی:{' '}
          <strong>{task.assignee_name || '—'}</strong>
          {currentUser?.isAdmin ? ' (مدیر)' : ''}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>
              <UserRound size={13} /> ارجاع به
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={loading}
            >
              <option value="">انتخاب کارمند...</option>
              {options.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>توضیح ارجاع (اختیاری)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: لطفاً ادامه پیگیری را انجام دهید..."
              rows={3}
              disabled={loading}
            />
          </div>

          {error ? <p className={styles.formError}>{error}</p> : null}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={onClose}
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : null}
              ثبت ارجاع
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
