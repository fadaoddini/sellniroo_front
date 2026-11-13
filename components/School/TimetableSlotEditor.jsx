'use client'

import React from 'react'
import {
  BookMarked, BookOpen, BookText, Calculator, Check, Clock, Eraser,
  FlaskConical, Globe2, Languages, MapPin, Palette, Palmtree, PenLine,
  MousePointerClick, Users, UserRound,
} from 'lucide-react'
import { toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

const SUBJECT_PRESETS = [
  { title: 'ریاضی', color: '#1e4d6b', Icon: Calculator },
  { title: 'فارسی', color: '#7c3aed', Icon: BookText },
  { title: 'علوم', color: '#0f766e', Icon: FlaskConical },
  { title: 'قرآن', color: '#15803d', Icon: BookMarked },
  { title: 'هدیه‌های آسمان', color: '#0369a1', Icon: BookOpen },
  { title: 'هنر', color: '#be123c', Icon: Palette },
  { title: 'ورزش', color: '#b45309', Icon: Users },
  { title: 'انگلیسی', color: '#4338ca', Icon: Languages },
  { title: 'اجتماعی', color: '#a16207', Icon: Globe2 },
  { title: 'نگارش', color: '#9f1239', Icon: PenLine },
]

const COLOR_PRESETS = [
  '#1e4d6b', '#0f766e', '#7c3aed', '#b45309', '#be123c',
  '#0369a1', '#15803d', '#4338ca', '#a16207', '#2d5a45',
]

const HOLIDAY_COLORS = ['#94a3b8', '#64748b', '#f59e0b', '#ef4444']

export default function TimetableSlotEditor({
  active = false,
  weekdayLabel = '',
  period = null,
  value = { kind: 'lesson', subject_title: '', subject: '', teacher: '', room: '', color: '#2d5a45' },
  teachers = [],
  subjects = [],
  onChange,
  onApply,
  onClear,
}) {
  if (!active) {
    return (
      <aside className={styles.ttSide}>
        <div className={styles.ttSideEmpty}>
          <MousePointerClick size={22} strokeWidth={1.75} />
          <strong>یک خانه را انتخاب کنید</strong>
          <p>درس بگذارید یا تعطیل کنید. روی نام روز هم می‌توان کل روز را تعطیل کرد.</p>
        </div>
      </aside>
    )
  }

  const set = (patch) => onChange?.({ ...value, ...patch })
  const kind = value.kind === 'holiday' ? 'holiday' : 'lesson'
  const previewColor = kind === 'holiday' ? (value.color || '#94a3b8') : (value.color || '#2d5a45')
  const selectedTeacher = teachers.find((t) => String(t.id) === String(value.teacher))
  const catalog = (subjects || []).filter((s) => s.is_active !== false)
  const teacherSubjects = value.teacher
    ? catalog.filter((s) => String(s.teacher) === String(value.teacher))
    : catalog
  const isEdit = !!(value.subject_title || value.teacher || value.subject || kind === 'holiday')

  const pickCatalogSubject = (s) => {
    set({
      kind: 'lesson',
      subject: s.id,
      subject_title: s.title,
      teacher: s.teacher,
      color: s.color || value.color || '#2d5a45',
    })
  }

  return (
    <aside className={styles.ttSide}>
      <header className={styles.ttSideHead}>
        <span className={styles.ttSideBadge}>{isEdit ? 'ویرایش' : 'جدید'}</span>
        <h3>
          {weekdayLabel}
          {period?.title ? ` · ${period.title}` : ''}
        </h3>
        {period?.time_label ? (
          <p><Clock size={11} strokeWidth={2} />{toFaDigits(period.time_label)}</p>
        ) : null}
      </header>

      <div className={styles.ttKindRow}>
        <button
          type="button"
          className={`${styles.ttKindBtn} ${kind === 'lesson' ? styles.ttKindBtnOn : ''}`}
          onClick={() => set({
            kind: 'lesson',
            subject_title: value.subject_title === 'تعطیل' ? '' : value.subject_title,
            color: value.color === '#94a3b8' ? '#2d5a45' : value.color,
          })}
        >
          <BookOpen size={12} strokeWidth={2} />
          درس
        </button>
        <button
          type="button"
          className={`${styles.ttKindBtn} ${kind === 'holiday' ? styles.ttKindBtnOn : ''}`}
          onClick={() => set({
            kind: 'holiday',
            subject_title: value.subject_title && value.subject_title !== 'تعطیل' ? value.subject_title : 'تعطیل',
            subject: '',
            teacher: '',
            color: '#94a3b8',
            room: '',
          })}
        >
          <Palmtree size={12} strokeWidth={2} />
          تعطیل
        </button>
      </div>

      <div className={styles.ttSidePreview} style={{ '--slot-color': previewColor }}>
        <em>{kind === 'holiday' ? (value.subject_title || 'تعطیل') : (value.subject_title || 'بدون درس')}</em>
        <span>
          {kind === 'holiday'
            ? 'بدون کلاس'
            : `${selectedTeacher?.display_name || 'بدون معلم'}${value.room ? ` · ${toFaDigits(value.room)}` : ''}`}
        </span>
      </div>

      <div className={styles.ttSideScroll}>
        {kind === 'holiday' ? (
          <>
            <label className={styles.ttModalField}>
              <span>عنوان تعطیلی</span>
              <input
                value={value.subject_title || ''}
                onChange={(e) => set({ subject_title: e.target.value })}
                placeholder="تعطیل / مناسبت"
              />
            </label>
            <section className={styles.ttModalSection}>
              <div className={styles.ttModalSectionHead}>
                <Palette size={12} strokeWidth={2} />
                <strong>رنگ</strong>
              </div>
              <div className={styles.ttColorRow}>
                {HOLIDAY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.ttColorDot} ${value.color === c ? styles.ttColorDotOn : ''}`}
                    style={{ background: c }}
                    onClick={() => set({ color: c })}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className={styles.ttModalSection}>
              <div className={styles.ttModalSectionHead}>
                <BookOpen size={12} strokeWidth={2} />
                <strong>درس اختصاص‌یافته</strong>
              </div>
              {catalog.length ? (
                <div className={styles.ttSubjectGrid}>
                  {(value.teacher ? teacherSubjects : catalog).map((s) => {
                    const on = String(value.subject) === String(s.id)
                      || (!value.subject && value.subject_title === s.title
                        && String(value.teacher) === String(s.teacher))
                    const teacherLabel = teachers.find((t) => String(t.id) === String(s.teacher))?.display_name
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`${styles.ttSubjectChip} ${on ? styles.ttSubjectChipOn : ''}`}
                        style={{ '--chip-color': s.color || '#2d5a45' }}
                        onClick={() => pickCatalogSubject(s)}
                        title={teacherLabel || ''}
                      >
                        <BookOpen size={11} strokeWidth={2} />
                        {s.title}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.ttModalHint}>
                  ابتدا در «دروس معلمان» درس را به معلم اختصاص دهید
                </p>
              )}
              {value.teacher && !teacherSubjects.length && catalog.length ? (
                <p className={styles.ttModalHint}>این معلم هنوز درس اختصاصی ندارد</p>
              ) : null}
            </section>

            <section className={styles.ttModalSection}>
              <div className={styles.ttModalSectionHead}>
                <UserRound size={12} strokeWidth={2} />
                <strong>معلم</strong>
              </div>
              <div className={styles.ttTeacherStack}>
                {teachers.map((t) => {
                  const on = String(value.teacher) === String(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.ttTeacherCard} ${on ? styles.ttTeacherCardOn : ''}`}
                      onClick={() => set({
                        teacher: on ? '' : t.id,
                        subject: '',
                        subject_title: on ? '' : value.subject_title,
                      })}
                    >
                      <span className={styles.ttTeacherAvatar}>
                        {(t.display_name || '?').trim().charAt(0)}
                      </span>
                      <span>
                        <strong>{t.display_name}</strong>
                        {t.specialty ? <em>{t.specialty}</em> : null}
                      </span>
                      {on ? <Check size={12} strokeWidth={2.4} className={styles.ttTeacherCheck} /> : null}
                    </button>
                  )
                })}
                {!teachers.length ? <p className={styles.ttModalHint}>معلمی ثبت نشده</p> : null}
              </div>
            </section>

            {!catalog.length ? (
              <section className={styles.ttModalSection}>
                <div className={styles.ttModalSectionHead}>
                  <BookOpen size={12} strokeWidth={2} />
                  <strong>عنوان سریع</strong>
                </div>
                <div className={styles.ttSubjectGrid}>
                  {SUBJECT_PRESETS.map(({ title, color, Icon }) => {
                    const on = value.subject_title === title
                    return (
                      <button
                        key={title}
                        type="button"
                        className={`${styles.ttSubjectChip} ${on ? styles.ttSubjectChipOn : ''}`}
                        style={{ '--chip-color': color }}
                        onClick={() => set({
                          kind: 'lesson',
                          subject: '',
                          subject_title: title,
                          color: (!value.color || value.color === '#2d5a45' || value.color === '#94a3b8') ? color : value.color,
                        })}
                      >
                        <Icon size={11} strokeWidth={2} />
                        {title}
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : null}

            <label className={styles.ttModalField}>
              <span><MapPin size={11} strokeWidth={2} /> اتاق</span>
              <input
                value={value.room || ''}
                onChange={(e) => set({ room: e.target.value })}
                placeholder="۱۰۱"
              />
            </label>

            <section className={styles.ttModalSection}>
              <div className={styles.ttModalSectionHead}>
                <Palette size={12} strokeWidth={2} />
                <strong>رنگ</strong>
              </div>
              <div className={styles.ttColorRow}>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.ttColorDot} ${value.color === c ? styles.ttColorDotOn : ''}`}
                    style={{ background: c }}
                    onClick={() => set({ color: c })}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <footer className={styles.ttSideFoot}>
        <button type="button" className={styles.ttModalBtnDanger} onClick={onClear}>
          <Eraser size={13} strokeWidth={2} />
          خالی
        </button>
        <button type="button" className={styles.ttModalBtnPrimary} onClick={onApply}>
          <Check size={13} strokeWidth={2.4} />
          اعمال
        </button>
      </footer>
    </aside>
  )
}
