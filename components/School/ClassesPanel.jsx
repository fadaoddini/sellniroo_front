'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Bell, BookOpen, CalendarDays, Check, DoorOpen, MapPin,
  Pencil, Plus, RefreshCw, Save, Trash2, UserRound, Users, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import WeeklyScheduleGrid from '@/components/School/WeeklyScheduleGrid'
import TimetableSlotEditor from '@/components/School/TimetableSlotEditor'
import PeriodsManager from '@/components/School/PeriodsManager'
import { faNum, toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

const GRADE_SUGGESTIONS = [
  'اول دبستان', 'دوم دبستان', 'سوم دبستان', 'چهارم دبستان',
  'پنجم دبستان', 'ششم دبستان', 'هفتم', 'هشتم', 'نهم',
]
const SECTION_SUGGESTIONS = ['الف', 'ب', 'ج', 'د', '۱', '۲', '۳']
const CLASS_COLORS = [
  '#1e4d6b', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#2d5a45',
]

export default function ClassesPanel({ teachers = [], students = [], onNotify }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('list') // list | create | edit | schedule | students | periods
  const [form, setForm] = useState({
    grade_label: 'اول دبستان',
    section: 'الف',
    room: '',
    academic_year: '۱۴۰۴-۱۴۰۵',
    homeroom_teacher: '',
    teacher_ids: [],
    capacity: 30,
    color: '#2d5a45',
  })
  const [timetable, setTimetable] = useState(null)
  const [draftSlots, setDraftSlots] = useState({})
  const [editCell, setEditCell] = useState(null)
  const [cellForm, setCellForm] = useState({
    kind: 'lesson', subject_title: '', subject: '', teacher: '', room: '', color: '',
  })
  const [pickedStudents, setPickedStudents] = useState([])
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState([])

  const selected = useMemo(
    () => classes.find((c) => c.id === selectedId) || null,
    [classes, selectedId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    const [res, subRes] = await Promise.all([
      schoolService.classes(),
      schoolService.listSubjects({ include_inactive: '1' }),
    ])
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت کلاس‌ها', true)
      return
    }
    setClasses(res.data || [])
    if (subRes.success) setSubjects(subRes.data || [])
  }, [onNotify])

  useEffect(() => {
    load()
  }, [load])

  const resolveClassTeacherIds = (cls) => {
    const fromApi = Array.isArray(cls?.teacher_ids)
      ? cls.teacher_ids
      : Array.isArray(cls?.teachers_info)
        ? cls.teachers_info.map((t) => t.id)
        : []
    const ids = fromApi.map((id) => Number(id)).filter(Boolean)
    if (cls?.homeroom_teacher && !ids.includes(Number(cls.homeroom_teacher))) {
      ids.unshift(Number(cls.homeroom_teacher))
    }
    return [...new Set(ids)]
  }

  const openCreate = () => {
    setMode('create')
    setSelectedId(null)
    const home = teachers[0]?.id || ''
    setForm({
      grade_label: 'اول دبستان',
      section: 'الف',
      room: '',
      academic_year: '۱۴۰۴-۱۴۰۵',
      homeroom_teacher: home,
      teacher_ids: home ? [Number(home)] : [],
      capacity: 30,
      color: '#2d5a45',
    })
  }

  const openEdit = (cls) => {
    setSelectedId(cls.id)
    setMode('edit')
    setForm({
      grade_label: cls.grade_label || '',
      section: cls.section || '',
      room: cls.room || '',
      academic_year: cls.academic_year || '',
      homeroom_teacher: cls.homeroom_teacher || '',
      teacher_ids: resolveClassTeacherIds(cls),
      capacity: cls.capacity || 30,
      color: cls.color || '#2d5a45',
      title: cls.title || '',
    })
  }

  const toggleAccessTeacher = (teacherId) => {
    const id = Number(teacherId)
    if (!id) return
    setForm((p) => {
      const current = (p.teacher_ids || []).map(Number)
      const has = current.includes(id)
      if (has && String(p.homeroom_teacher) === String(id)) {
        // معلم راهنما را نمی‌شود از دسترسی حذف کرد
        return p
      }
      return {
        ...p,
        teacher_ids: has
          ? current.filter((x) => x !== id)
          : [...current, id],
      }
    })
  }

  const setHomeroomTeacher = (teacherId) => {
    setForm((p) => {
      const nextHome = teacherId || ''
      const ids = (p.teacher_ids || []).map(Number)
      if (nextHome && !ids.includes(Number(nextHome))) {
        ids.push(Number(nextHome))
      }
      return {
        ...p,
        homeroom_teacher: nextHome,
        teacher_ids: [...new Set(ids)],
      }
    })
  }

  const saveClass = async () => {
    if (!form.grade_label?.trim() || !form.section?.trim()) {
      onNotify?.('پایه و بخش الزامی است', true)
      return
    }
    setSaving(true)
    let teacherIds = (form.teacher_ids || []).map(Number).filter(Boolean)
    if (form.homeroom_teacher) {
      const hid = Number(form.homeroom_teacher)
      if (hid && !teacherIds.includes(hid)) teacherIds = [hid, ...teacherIds]
    }
    const payload = {
      ...form,
      homeroom_teacher: form.homeroom_teacher ? Number(form.homeroom_teacher) : null,
      teacher_ids: teacherIds,
      capacity: Number(form.capacity) || 30,
    }
    const res = mode === 'edit' && selectedId
      ? await schoolService.updateClass(selectedId, payload)
      : await schoolService.createClass(payload)
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره ناموفق', true)
      return
    }
    onNotify?.(mode === 'edit' ? 'کلاس بروزرسانی شد' : 'کلاس ساخته شد')
    await load()
    setSelectedId(res.data.id)
    setMode('list')
  }

  const removeClass = async (cls) => {
    if (!window.confirm(`کلاس «${cls.display_title || cls.title}» غیرفعال شود؟`)) return
    const res = await schoolService.deleteClass(cls.id)
    if (!res.success) {
      onNotify?.(res.error || 'حذف ناموفق', true)
      return
    }
    onNotify?.('کلاس غیرفعال شد')
    if (selectedId === cls.id) {
      setSelectedId(null)
      setMode('list')
    }
    load()
  }

  const openSchedule = async (cls) => {
    setSelectedId(cls.id)
    setMode('schedule')
    setEditCell(null)
    const res = await schoolService.classTimetable(cls.id)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در برنامه', true)
      return
    }
    setTimetable(res.data)
    setDraftSlots({ ...(res.data.grid || {}) })
  }

  const openStudents = async (cls) => {
    setSelectedId(cls.id)
    setMode('students')
    const res = await schoolService.getClass(cls.id)
    if (!res.success) {
      onNotify?.(res.error || 'خطا', true)
      return
    }
    setPickedStudents(res.data.student_ids || [])
  }

  const saveStudents = async () => {
    if (!selectedId) return
    setSaving(true)
    const res = await schoolService.setClassStudents(selectedId, pickedStudents)
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره ناموفق', true)
      return
    }
    onNotify?.('دانش‌آموزان کلاس ذخیره شد')
    load()
  }

  const selectedTeacherIds = useMemo(
    () => (selected ? resolveClassTeacherIds(selected) : []),
    [selected],
  )

  const openCell = ({ weekday, period, slot }) => {
    if (period?.is_break) return
    setEditCell({ weekday, period })
    const kind = slot?.kind === 'holiday' ? 'holiday' : 'lesson'
    const defaultTeacher = slot?.teacher
      || selected?.homeroom_teacher
      || selectedTeacherIds[0]
      || ''
    setCellForm({
      kind,
      subject_title: slot?.subject_title || slot?.display_subject || (kind === 'holiday' ? 'تعطیل' : ''),
      subject: kind === 'holiday' ? '' : (slot?.subject || ''),
      teacher: kind === 'holiday' ? '' : defaultTeacher,
      room: kind === 'holiday' ? '' : (slot?.room || selected?.room || ''),
      color: slot?.color || slot?.display_color || (kind === 'holiday' ? '#94a3b8' : selected?.color || '#2d5a45'),
    })
  }

  const applyCell = () => {
    if (!editCell) return
    const key = `${editCell.weekday}:${editCell.period.id}`
    const kind = cellForm.kind === 'holiday' ? 'holiday' : 'lesson'
    if (kind === 'lesson' && !cellForm.subject_title?.trim() && !cellForm.teacher) {
      setDraftSlots((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }
    const teacherObj = teachers.find((t) => String(t.id) === String(cellForm.teacher))
    const title = kind === 'holiday'
      ? (cellForm.subject_title.trim() || 'تعطیل')
      : cellForm.subject_title.trim()
    const color = cellForm.color || (kind === 'holiday' ? '#94a3b8' : '#2d5a45')
    setDraftSlots((prev) => ({
      ...prev,
      [key]: {
        weekday: editCell.weekday,
        period: editCell.period.id,
        kind,
        subject_title: title,
        subject: kind === 'holiday' ? null : (cellForm.subject ? Number(cellForm.subject) : null),
        teacher: kind === 'holiday' ? null : (cellForm.teacher ? Number(cellForm.teacher) : null),
        teacher_name: kind === 'holiday' ? '' : (teacherObj?.display_name || ''),
        room: kind === 'holiday' ? '' : cellForm.room,
        color,
        display_subject: title,
        display_color: color,
      },
    }))
  }

  const clearCell = () => {
    if (!editCell) return
    const key = `${editCell.weekday}:${editCell.period.id}`
    setDraftSlots((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setCellForm({
      kind: 'lesson',
      subject_title: '',
      subject: '',
      teacher: selected?.homeroom_teacher || selectedTeacherIds[0] || '',
      room: selected?.room || '',
      color: selected?.color || '#2d5a45',
    })
  }

  const toggleDayHoliday = (day) => {
    const lessonPeriods = (timetable?.periods || []).filter((p) => !p.is_break)
    if (!lessonPeriods.length) return
    const allHoliday = lessonPeriods.every((p) => {
      const s = draftSlots[`${day.id}:${p.id}`]
      return s?.kind === 'holiday'
    })
    setDraftSlots((prev) => {
      const next = { ...prev }
      lessonPeriods.forEach((p) => {
        const key = `${day.id}:${p.id}`
        if (allHoliday) {
          delete next[key]
        } else {
          next[key] = {
            weekday: day.id,
            period: p.id,
            kind: 'holiday',
            subject_title: 'تعطیل',
            teacher: null,
            teacher_name: '',
            room: '',
            color: '#94a3b8',
            display_subject: 'تعطیل',
            display_color: '#94a3b8',
          }
        }
      })
      return next
    })
    setEditCell(null)
    onNotify?.(allHoliday ? `روز ${day.label} عادی شد` : `روز ${day.label} تعطیل شد`)
  }

  const saveTimetable = async () => {
    if (!selectedId) return
    const slots = Object.values(draftSlots).map((s) => ({
      weekday: s.weekday,
      period: s.period,
      kind: s.kind === 'holiday' ? 'holiday' : 'lesson',
      subject_title: s.subject_title || s.display_subject || '',
      subject: s.kind === 'holiday' ? null : (s.subject || null),
      teacher: s.kind === 'holiday' ? null : (s.teacher || null),
      room: s.room || '',
      color: s.color || s.display_color || '',
    }))
    setSaving(true)
    const res = await schoolService.saveClassTimetable(selectedId, slots)
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره برنامه ناموفق', true)
      return
    }
    setTimetable(res.data)
    setDraftSlots({ ...(res.data.grid || {}) })
    onNotify?.('برنامه هفتگی ذخیره شد')
    load()
  }

  const onPeriodsSaved = async (periods) => {
    if (selectedId && mode === 'schedule') {
      const res = await schoolService.classTimetable(selectedId)
      if (res.success) {
        setTimetable(res.data)
        setDraftSlots({ ...(res.data.grid || {}) })
      }
    } else if (timetable) {
      setTimetable((prev) => (prev ? { ...prev, periods: periods || prev.periods } : prev))
    }
  }

  const byGrade = useMemo(() => {
    const map = new Map()
    classes.forEach((c) => {
      const g = c.grade_label || 'سایر'
      if (!map.has(g)) map.set(g, [])
      map.get(g).push(c)
    })
    return Array.from(map.entries())
  }, [classes])

  if (loading && !classes.length) {
    return <div className={styles.empty}>در حال بارگذاری کلاس‌ها…</div>
  }

  return (
    <div className={styles.clsPanel}>
      <div className={styles.clsTopBar}>
        <h2 className={styles.clsTopTitle}>
          <BookOpen size={14} strokeWidth={2} />
          کلاس‌ها و برنامه
        </h2>
        <div className={styles.clsTopActions}>
          <button type="button" className={styles.clsIconBtn} onClick={load} title="بروزرسانی" aria-label="بروزرسانی">
            <RefreshCw size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={styles.clsActionBtn}
            onClick={() => { setMode('periods'); setEditCell(null) }}
            title="تعریف زنگ‌ها"
          >
            <Bell size={12} strokeWidth={2} />
            زنگ‌ها
          </button>
          <button type="button" className={styles.clsPrimaryBtn} onClick={openCreate}>
            <Plus size={13} strokeWidth={2.2} />
            کلاس
          </button>
        </div>
      </div>

      {mode === 'periods' ? (
        <div className={styles.clsScheduleCard}>
          <div className={styles.attSheetHead}>
            <div>
              <strong>زنگ‌های مدرسه</strong>
              <p>تعداد، ساعت و تفریح‌ها را تعریف کنید</p>
            </div>
            <button type="button" className={styles.clsIconBtn} onClick={() => setMode('list')} aria-label="بازگشت">
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
          <div className={styles.clsFormBody}>
            <PeriodsManager
              onNotify={onNotify}
              onSaved={onPeriodsSaved}
            />
          </div>
        </div>
      ) : null}

      {(mode === 'create' || mode === 'edit') ? (
        <div className={styles.clsFormCard}>
          <div className={styles.attSheetHead}>
            <div>
              <strong>{mode === 'edit' ? 'ویرایش کلاس' : 'کلاس جدید'}</strong>
              <p>پایه + بخش = هویت کلاس (مثلاً سوم دبستان · ج)</p>
            </div>
            <button type="button" className={styles.clsIconBtn} onClick={() => setMode('list')} aria-label="بستن">
              <X size={14} strokeWidth={2} />
            </button>
          </div>
          <div className={styles.clsFormBody}>
            <div className={styles.clsFormSection}>
              <strong className={styles.clsFormLabel}>پایه</strong>
              <div className={styles.ttSubjectGrid}>
                {GRADE_SUGGESTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`${styles.ttSubjectChip} ${form.grade_label === g ? styles.ttSubjectChipOn : ''}`}
                    style={{ '--chip-color': '#b89200' }}
                    onClick={() => setForm((p) => ({ ...p, grade_label: g }))}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <label className={styles.ttModalField}>
                <span>یا پایه دلخواه</span>
                <input
                  value={form.grade_label}
                  onChange={(e) => setForm((p) => ({ ...p, grade_label: e.target.value }))}
                  placeholder="اول دبستان"
                />
              </label>
            </div>

            <div className={styles.clsFormSection}>
              <strong className={styles.clsFormLabel}>بخش / شعبه</strong>
              <div className={styles.ttSubjectGrid}>
                {SECTION_SUGGESTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`${styles.ttSubjectChip} ${form.section === g ? styles.ttSubjectChipOn : ''}`}
                    style={{ '--chip-color': '#0369a1' }}
                    onClick={() => setForm((p) => ({ ...p, section: g }))}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.clsFormSection}>
              <strong className={styles.clsFormLabel}>معلم راهنما</strong>
              <p className={styles.ttModalHint}>مسئول اصلی کلاس — در برنامه و لیست کلاس نمایش داده می‌شود</p>
              <div className={styles.ttTeacherGrid}>
                <button
                  type="button"
                  className={`${styles.ttTeacherCard} ${!form.homeroom_teacher ? styles.ttTeacherCardOn : ''}`}
                  onClick={() => setHomeroomTeacher('')}
                >
                  <span className={styles.ttTeacherAvatar}>—</span>
                  <span><strong>بدون راهنما</strong><em>اختیاری</em></span>
                </button>
                {teachers.map((t) => {
                  const on = String(form.homeroom_teacher) === String(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.ttTeacherCard} ${on ? styles.ttTeacherCardOn : ''}`}
                      onClick={() => setHomeroomTeacher(t.id)}
                    >
                      <span className={styles.ttTeacherAvatar}>{(t.display_name || '?').charAt(0)}</span>
                      <span>
                        <strong>{t.display_name}</strong>
                        <em>{t.specialty || 'معلم'}</em>
                      </span>
                      {on ? <Check size={12} strokeWidth={2.4} className={styles.ttTeacherCheck} /> : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.clsFormSection}>
              <strong className={styles.clsFormLabel}>معلمان دارای دسترسی</strong>
              <p className={styles.ttModalHint}>
                چند معلم با تخصص‌های مختلف می‌توانند به این کلاس دسترسی داشته باشند؛
                در برنامه فقط دروس همین معلمان نمایش داده می‌شود
              </p>
              <div className={styles.ttTeacherGrid}>
                {teachers.map((t) => {
                  const on = (form.teacher_ids || []).some((id) => String(id) === String(t.id))
                  const isHome = String(form.homeroom_teacher) === String(t.id)
                  return (
                    <button
                      key={`access-${t.id}`}
                      type="button"
                      className={`${styles.ttTeacherCard} ${on ? styles.ttTeacherCardOn : ''}`}
                      onClick={() => toggleAccessTeacher(t.id)}
                      title={isHome ? 'معلم راهنما همیشه دسترسی دارد' : ''}
                    >
                      <span className={styles.ttTeacherAvatar}>{(t.display_name || '?').charAt(0)}</span>
                      <span>
                        <strong>{t.display_name}</strong>
                        <em>
                          {t.specialty || 'معلم'}
                          {isHome ? ' · راهنما' : ''}
                        </em>
                      </span>
                      {on ? <Check size={12} strokeWidth={2.4} className={styles.ttTeacherCheck} /> : null}
                    </button>
                  )
                })}
                {!teachers.length ? (
                  <p className={styles.ttModalHint}>ابتدا معلم ثبت کنید</p>
                ) : null}
              </div>
            </div>

            <div className={styles.clsFormMetaRow}>
              <label className={styles.ttModalField}>
                <span>سال تحصیلی</span>
                <input
                  value={form.academic_year}
                  onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
                />
              </label>
              <label className={styles.ttModalField}>
                <span>اتاق</span>
                <input
                  value={form.room}
                  onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                  placeholder="۱۰۱"
                />
              </label>
              <label className={styles.ttModalField}>
                <span>ظرفیت</span>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                />
              </label>
            </div>

            <div className={styles.clsFormSection}>
              <strong className={styles.clsFormLabel}>رنگ کلاس</strong>
              <div className={styles.ttColorRow}>
                {CLASS_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.ttColorDot} ${form.color === c ? styles.ttColorDotOn : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                  />
                ))}
              </div>
            </div>

            <button type="button" className={styles.clsPrimaryBtn} disabled={saving} onClick={saveClass}>
              <Check size={13} strokeWidth={2.4} /> {saving ? '…' : 'ذخیره'}
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'schedule' && selected && timetable ? (
        <div className={styles.clsScheduleCard}>
          <div className={styles.clsSchedHead}>
            <div
              className={styles.clsSchedIdentity}
              style={{ '--cls-color': selected.color || '#2d5a45' }}
            >
              <div className={styles.clsDoorBadge}>
                <span className={styles.clsDoorGrade}>{selected.grade_label}</span>
                <strong className={styles.clsDoorSection}>{selected.section}</strong>
              </div>
              <div>
                <strong>{selected.display_title || selected.title}</strong>
                <p>
                  {selected.room ? `اتاق ${toFaDigits(selected.room)}` : 'بدون اتاق'}
                  {selected.homeroom_teacher_name ? ` · راهنما: ${selected.homeroom_teacher_name}` : ''}
                  {selectedTeacherIds.length
                    ? ` · ${faNum(selectedTeacherIds.length)} معلم`
                    : ''}
                  {' · '}ویرایش از ستون چپ
                </p>
              </div>
            </div>
            <div className={styles.clsTopActions}>
              <button type="button" className={styles.clsIconBtn} onClick={() => setMode('list')} title="بازگشت" aria-label="بازگشت">
                <ArrowRight size={14} strokeWidth={2} />
              </button>
              <button type="button" className={styles.clsPrimaryBtn} disabled={saving} onClick={saveTimetable}>
                <Save size={13} strokeWidth={2} /> {saving ? '…' : 'ذخیره'}
              </button>
            </div>
          </div>

          <div className={styles.ttSplit}>
            <div className={styles.ttSplitMain}>
              <WeeklyScheduleGrid
                weekdays={timetable.weekdays}
                periods={timetable.periods}
                grid={draftSlots}
                todayWeekday={null}
                onCellClick={openCell}
                onDayClick={toggleDayHoliday}
                selectedKey={editCell ? `${editCell.weekday}:${editCell.period.id}` : null}
              />
            </div>
            <TimetableSlotEditor
              active={!!editCell}
              weekdayLabel={timetable.weekdays?.find((d) => d.id === editCell?.weekday)?.label || ''}
              period={editCell?.period || null}
              value={cellForm}
              teachers={teachers}
              subjects={subjects}
              classTeacherIds={selectedTeacherIds}
              classTeacherName={selected.homeroom_teacher_name || ''}
              onChange={setCellForm}
              onApply={applyCell}
              onClear={clearCell}
            />
          </div>
        </div>
      ) : null}

      {mode === 'students' && selected ? (
        <div className={styles.clsScheduleCard}>
          <div className={styles.attSheetHead}>
            <div>
              <strong>دانش‌آموزان · {selected.display_title || selected.title}</strong>
              <p>{faNum(pickedStudents.length)} نفر انتخاب‌شده</p>
            </div>
            <div className={styles.clsTopActions}>
              <button type="button" className={styles.clsIconBtn} onClick={() => setMode('list')} title="بازگشت" aria-label="بازگشت">
                <ArrowRight size={14} strokeWidth={2} />
              </button>
              <button type="button" className={styles.clsPrimaryBtn} disabled={saving} onClick={saveStudents}>
                <Check size={13} strokeWidth={2.4} /> ذخیره
              </button>
            </div>
          </div>
          <div className={`${styles.ttTeacherGrid} ${styles.clsPickPad}`}>
            {students.map((s) => {
              const on = pickedStudents.includes(s.id)
              const otherClass = s.school_class && s.school_class !== selectedId && !on
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.ttTeacherCard} ${on ? styles.ttTeacherCardOn : ''}`}
                  onClick={() => {
                    setPickedStudents((prev) => (
                      on ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                    ))
                  }}
                >
                  <span className={styles.ttTeacherAvatar}>{(s.display_name || '?').charAt(0)}</span>
                  <span>
                    <strong>{s.display_name}</strong>
                    <em>
                      {s.grade || '—'}
                      {s.school_class_title && otherClass ? ` · ${s.school_class_title}` : ''}
                    </em>
                  </span>
                  {on ? <Check size={12} strokeWidth={2.4} className={styles.ttTeacherCheck} /> : null}
                </button>
              )
            })}
            {!students.length ? <p className={styles.empty}>دانش‌آموزی نیست</p> : null}
          </div>
        </div>
      ) : null}

      {(mode === 'list' || mode === 'create' || mode === 'edit') ? (
      <div className={styles.clsGroups}>
        {byGrade.map(([grade, list]) => (
          <section key={grade} className={styles.clsGradeBlock}>
            <header className={styles.clsGradeHead}>
              <div className={styles.clsGradeHeadMain}>
                <DoorOpen size={14} strokeWidth={2} />
                <div>
                  <h3>{grade}</h3>
                  <p>{faNum(list.length)} شعبه در این پایه</p>
                </div>
              </div>
            </header>
            <div className={styles.clsCards}>
              {list.map((c) => {
                const filled = Number(c.student_count) || 0
                const cap = Number(c.capacity) || 0
                const fillPct = cap ? Math.min(100, Math.round((filled / cap) * 100)) : 0
                const hasSchedule = (Number(c.slot_count) || 0) > 0
                return (
                  <article
                    key={c.id}
                    className={styles.clsDoor}
                    style={{ '--cls-color': c.color || '#2d5a45' }}
                  >
                    <div className={styles.clsDoorPlate}>
                      <div className={styles.clsDoorBadge}>
                        <span className={styles.clsDoorGrade}>{c.grade_label || grade}</span>
                        <strong className={styles.clsDoorSection}>{c.section}</strong>
                      </div>
                      <div className={styles.clsDoorTitle}>
                        <em>{c.display_title || c.title}</em>
                        {c.academic_year ? (
                          <span>سال {toFaDigits(c.academic_year)}</span>
                        ) : null}
                      </div>
                    </div>

                    <ul className={styles.clsDoorFacts}>
                      <li>
                        <MapPin size={12} strokeWidth={2} />
                        <span>اتاق</span>
                        <strong>{c.room ? toFaDigits(c.room) : '—'}</strong>
                      </li>
                      <li>
                        <UserRound size={12} strokeWidth={2} />
                        <span>معلم راهنما</span>
                        <strong>{c.homeroom_teacher_name || 'تعیین نشده'}</strong>
                      </li>
                      <li>
                        <Users size={12} strokeWidth={2} />
                        <span>معلمان کلاس</span>
                        <strong>
                          {faNum(
                            Array.isArray(c.teacher_ids)
                              ? c.teacher_ids.length
                              : Array.isArray(c.teachers_info)
                                ? c.teachers_info.length
                                : (c.homeroom_teacher ? 1 : 0),
                          )}
                        </strong>
                      </li>
                      <li>
                        <Users size={12} strokeWidth={2} />
                        <span>دانش‌آموز</span>
                        <strong>
                          {faNum(filled)}
                          {cap ? ` از ${faNum(cap)}` : ''}
                        </strong>
                      </li>
                      <li>
                        <CalendarDays size={12} strokeWidth={2} />
                        <span>برنامه هفتگی</span>
                        <strong className={hasSchedule ? styles.clsFactOk : styles.clsFactWarn}>
                          {hasSchedule ? `${faNum(c.slot_count)} جلسه` : 'چیده نشده'}
                        </strong>
                      </li>
                    </ul>

                    {cap ? (
                      <div className={styles.clsFill}>
                        <div className={styles.clsFillTrack}>
                          <div className={styles.clsFillBar} style={{ width: `${fillPct}%` }} />
                        </div>
                        <span>ظرفیت {toFaDigits(`${fillPct}٪`)}</span>
                      </div>
                    ) : null}

                    <div className={styles.clsDoorActions}>
                      <button
                        type="button"
                        className={styles.clsDoorPrimary}
                        onClick={() => openSchedule(c)}
                      >
                        <CalendarDays size={13} strokeWidth={2} />
                        {hasSchedule ? 'برنامه هفتگی' : 'چیدن برنامه'}
                      </button>
                      <button
                        type="button"
                        className={styles.clsDoorGhost}
                        onClick={() => openStudents(c)}
                        title="دانش‌آموزان"
                      >
                        <Users size={13} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={styles.clsDoorGhost}
                        onClick={() => openEdit(c)}
                        title="ویرایش"
                        aria-label="ویرایش"
                      >
                        <Pencil size={12} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={styles.clsDoorDanger}
                        onClick={() => removeClass(c)}
                        title="حذف"
                        aria-label="حذف"
                      >
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
        {!classes.length ? (
          <div className={styles.attEmpty}>
            <p>کلاسی نیست — «کلاس» را بزنید.</p>
          </div>
        ) : null}
      </div>
      ) : null}
    </div>
  )
}
