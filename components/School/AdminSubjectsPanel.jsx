'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen, Check, ChevronDown, Loader2, Plus, Save, Trash2, UserRound, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const COLORS = ['#2d5a45', '#0ea5e9', '#7c3aed', '#b45309', '#be123c', '#0f766e']

function TeacherPickerDialog({ open, teachers, value, onPick, onClose }) {
  if (!open) return null
  return (
    <div className={styles.rcDlgBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.rcDlg}
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب معلم"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.rcDlgHead}>
          <div className={styles.rcDlgTitle}>
            <UserRound size={15} />
            <h3>تخصیص به معلم</h3>
          </div>
          <button type="button" className={styles.rcDlgClose} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>
        <div className={styles.rcDlgBody}>
          <div className={styles.rcOptList}>
            {teachers.map((t) => {
              const on = Number(t.id) === Number(value)
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.rcOpt} ${on ? styles.rcOptOn : ''}`}
                  onClick={() => onPick(t.id)}
                >
                  <span className={styles.rcOptDot} style={{ background: '#2d5a45' }} />
                  <span className={styles.rcOptLabel}>
                    {t.display_name || t.mobile || `معلم ${t.id}`}
                    {t.specialty ? ` · ${t.specialty}` : ''}
                  </span>
                  {on ? <Check size={14} /> : null}
                </button>
              )
            })}
            {!teachers.length ? <p className={styles.rcDlgEmpty}>معلمی ثبت نشده</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminSubjectsPanel({ teachers = [], onNotify }) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', teacher: '', color: COLORS[0] })
  const [pickerFor, setPickerFor] = useState(null) // 'create' | subjectId
  const [filterTeacher, setFilterTeacher] = useState('')

  const activeTeachers = useMemo(
    () => (teachers || []).filter((t) => t.is_active !== false),
    [teachers],
  )

  const load = useCallback(async () => {
    setLoading(true)
    const res = await schoolService.listSubjects({ include_inactive: '1' })
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت دروس', true)
      return
    }
    setSubjects(res.data || [])
  }, [onNotify])

  useEffect(() => { load() }, [load])

  const teacherName = (id) => {
    const t = activeTeachers.find((x) => Number(x.id) === Number(id))
    return t?.display_name || t?.mobile || '—'
  }

  const create = async () => {
    if (!form.title.trim()) {
      onNotify?.('عنوان درس الزامی است', true)
      return
    }
    if (!form.teacher) {
      onNotify?.('معلم را انتخاب کنید', true)
      return
    }
    setSaving(true)
    const res = await schoolService.createSubject({
      title: form.title.trim(),
      teacher: Number(form.teacher),
      color: form.color || COLORS[0],
      is_active: true,
    })
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ثبت ناموفق', true)
      return
    }
    setForm({ title: '', teacher: '', color: COLORS[0] })
    onNotify?.('درس به معلم اختصاص داده شد', false)
    load()
  }

  const reassign = async (subjectId, teacherId) => {
    const res = await schoolService.updateSubject(subjectId, { teacher: Number(teacherId) })
    if (!res.success) {
      onNotify?.(res.error || 'تغییر معلم ناموفق', true)
      return
    }
    onNotify?.('معلم درس به‌روز شد', false)
    setPickerFor(null)
    load()
  }

  const toggleActive = async (s) => {
    const res = await schoolService.updateSubject(s.id, { is_active: !s.is_active })
    if (!res.success) {
      onNotify?.(res.error || 'خطا', true)
      return
    }
    load()
  }

  const remove = async (s) => {
    if (!window.confirm(`حذف درس «${s.title}» و تمام فصول/دروس آن؟`)) return
    const res = await schoolService.deleteSubject(s.id)
    if (!res.success) {
      onNotify?.(res.error || 'حذف ناموفق', true)
      return
    }
    onNotify?.('حذف شد', false)
    load()
  }

  const rows = useMemo(() => {
    let list = subjects
    if (filterTeacher) {
      list = list.filter((s) => String(s.teacher) === String(filterTeacher))
    }
    return list
  }, [subjects, filterTeacher])

  const createTeacherLabel = form.teacher
    ? teacherName(form.teacher)
    : 'انتخاب معلم…'

  return (
    <div className={styles.asPanel}>
      <div className={styles.asHead}>
        <div className={styles.rcTopTitle}>
          <span className={styles.rcTopIcon}><BookOpen size={14} /></span>
          <div>
            <h2>تخصیص دروس به معلمان</h2>
            <p>هر معلم فقط به درس‌هایی که اینجا تعیین می‌کنید دسترسی دارد</p>
          </div>
        </div>
      </div>

      <div className={styles.asCreate}>
        <div className={styles.asCreateRow}>
          <input
            className={styles.asInput}
            placeholder="عنوان درس (مثلاً ریاضی)"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          <button
            type="button"
            className={styles.asTeacherBtn}
            onClick={() => setPickerFor('create')}
          >
            <UserRound size={13} />
            <span>{createTeacherLabel}</span>
            <ChevronDown size={13} />
          </button>
          <div className={styles.asColors}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.asColor} ${form.color === c ? styles.asColorOn : ''}`}
                style={{ background: c }}
                onClick={() => setForm((p) => ({ ...p, color: c }))}
                aria-label={c}
              />
            ))}
          </div>
          <button type="button" className={styles.rcSaveBtn} disabled={saving} onClick={create}>
            {saving ? <Loader2 size={13} className={styles.rcSpin} /> : <Plus size={13} />}
            افزودن
          </button>
        </div>
      </div>

      <div className={styles.asFilter}>
        <BookOpen size={12} />
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
        >
          <option value="">همه معلمان</option>
          {activeTeachers.map((t) => (
            <option key={t.id} value={t.id}>{t.display_name || t.mobile}</option>
          ))}
        </select>
        <span className={styles.asCount}>
          {loading ? '…' : `${rows.length} درس`}
        </span>
      </div>

      {!rows.length && !loading ? (
        <div className={styles.rcEmpty}>
          <BookOpen size={20} />
          <p>هنوز درسی تعریف نشده</p>
        </div>
      ) : (
        <div className={styles.asGrid}>
          {rows.map((s) => (
            <article
              key={s.id}
              className={`${styles.asCard} ${s.is_active ? '' : styles.asCardOff}`}
            >
              <div className={styles.asCardTop}>
                <span className={styles.asCardDot} style={{ background: s.color || '#2d5a45' }} />
                <div className={styles.asCardBody}>
                  <strong>{s.title}</strong>
                  <span>{s.chapter_count ?? 0} فصل · {s.teacher_name || teacherName(s.teacher)}</span>
                </div>
              </div>
              <div className={styles.asCardActs}>
                <button
                  type="button"
                  className={styles.asAct}
                  onClick={() => setPickerFor(s.id)}
                  title="تغییر معلم"
                >
                  <UserRound size={12} />
                  تغییر معلم
                </button>
                <button
                  type="button"
                  className={styles.asAct}
                  onClick={() => toggleActive(s)}
                  title={s.is_active ? 'غیرفعال' : 'فعال'}
                >
                  <Save size={12} />
                  {s.is_active ? 'فعال' : 'غیرفعال'}
                </button>
                <button
                  type="button"
                  className={`${styles.asAct} ${styles.asActDanger}`}
                  onClick={() => remove(s)}
                  title="حذف"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <TeacherPickerDialog
        open={pickerFor != null}
        teachers={activeTeachers}
        value={pickerFor === 'create' ? form.teacher : subjects.find((s) => s.id === pickerFor)?.teacher}
        onClose={() => setPickerFor(null)}
        onPick={(tid) => {
          if (pickerFor === 'create') {
            setForm((p) => ({ ...p, teacher: tid }))
            setPickerFor(null)
          } else if (pickerFor) {
            reassign(pickerFor, tid)
          }
        }}
      />
    </div>
  )
}
