'use client'

import React, { useState } from 'react'
import { X, User, Calendar, Tag, FileText, Loader2 } from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import styles from '../styles/Board.module.css'

const CreateTaskModal = ({ isOpen, onClose }) => {
  const { addTask, assignees, priorities, isAdmin, currentUser } = useTodo()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    due_date: '',
    priority: 'medium',
    status: 'todo',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const next = {}
    if (!formData.title.trim()) next.title = 'عنوان الزامی است'
    if (isAdmin && !formData.assignee) next.assignee = 'انتخاب کارمند الزامی است'
    if (!formData.due_date) next.due_date = 'سررسید الزامی است'
    if (!formData.priority) next.priority = 'اولویت الزامی است'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setSaving(true)
    try {
      await addTask({
        title: formData.title.trim(),
        description: formData.description || '',
        assignee: isAdmin
          ? Number(formData.assignee)
          : currentUser.id || undefined,
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status || 'todo',
      })
      setFormData({
        title: '',
        description: '',
        assignee: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
      })
      onClose()
    } catch (err) {
      setFormError(
        err?.title?.[0] ||
          err?.assignee?.[0] ||
          err?.message ||
          err?.error ||
          'ثبت وظیفه ناموفق بود'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>{isAdmin ? 'تعریف وظیفه برای کارمند' : 'ثبت کار / گزارش روزانه'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            {isAdmin ? (
              <div className={styles.formGroup}>
                <label>
                  <User size={13} /> مسئول
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                >
                  <option value="">انتخاب کارمند...</option>
                  {assignees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.assignee ? (
                  <span className={styles.formError}>{errors.assignee}</span>
                ) : null}
              </div>
            ) : null}
            <div className={styles.formGroup}>
              <label>
                <Calendar size={13} /> سررسید
              </label>
              <PersianDatePicker
                value={formData.due_date}
                onChange={(date) => {
                  setFormData((prev) => ({ ...prev, due_date: date }))
                  if (errors.due_date) {
                    setErrors((prev) => ({ ...prev, due_date: '' }))
                  }
                }}
                placeholder="انتخاب تاریخ"
                theme="light"
              />
              {errors.due_date ? (
                <span className={styles.formError}>{errors.due_date}</span>
              ) : null}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FileText size={13} /> عنوان
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="مثلاً: پیگیری مدارک پروژه شمال"
            />
            {errors.title ? (
              <span className={styles.formError}>{errors.title}</span>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label>
              <FileText size={13} /> توضیحات
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="جزئیات کار..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <Tag size={13} /> اولویت
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {formError ? <div className={styles.formError}>{formError}</div> : null}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={14} className={styles.spin} /> : null}
              ایجاد وظیفه
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
