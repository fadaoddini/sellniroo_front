'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Clock, RefreshCw } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import WeeklyScheduleGrid from '@/components/School/WeeklyScheduleGrid'
import { faNum, toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

export default function MySchedulePanel({
  role = 'student',
  params = {},
  onNotify,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const studentKey = params?.student ?? ''
  const teacherKey = params?.teacher ?? ''

  const load = useCallback(async () => {
    setLoading(true)
    const scope = {
      ...(studentKey ? { student: studentKey } : {}),
      ...(teacherKey ? { teacher: teacherKey } : {}),
    }
    const res = await schoolService.myTimetable({ role, ...scope })
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت برنامه', true)
      return
    }
    setData(res.data)
  }, [role, studentKey, teacherKey, onNotify])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !data) {
    return <div className={styles.empty}>بارگذاری برنامه…</div>
  }

  if (!data) {
    return <div className={styles.attEmpty}><p>برنامه‌ای نیست.</p></div>
  }

  const todayLabel = data.weekdays?.find((d) => d.id === data.today_weekday)?.label
  const title = role === 'teacher'
    ? `برنامه · ${data.teacher?.display_name || ''}`
    : data.school_class
      ? `برنامه · ${data.school_class.display_title || data.school_class.title}`
      : 'برنامه هفتگی'

  return (
    <div className={styles.clsPanel}>
      <div className={styles.clsTopBar}>
        <h2 className={styles.clsTopTitle}>
          <CalendarDays size={14} strokeWidth={2} />
          {title}
        </h2>
        <button type="button" className={styles.clsIconBtn} onClick={load} title="بروزرسانی" aria-label="بروزرسانی">
          <RefreshCw size={13} strokeWidth={2} />
        </button>
      </div>

      {data.message ? <div className={styles.attEmpty}><p>{data.message}</p></div> : null}

      {(data.today_slots || []).length ? (
        <div className={styles.ttTodayBar}>
          <div className={styles.ttTodayLabel}>
            <Clock size={13} strokeWidth={2} />
            <div>
              <strong>امروز · {todayLabel || '—'}</strong>
              <p>{faNum(data.today_slots.length)} جلسه</p>
            </div>
          </div>
          <div className={styles.ttTodayList}>
            {data.today_slots.map((s) => (
              <div
                key={s.id || `${s.weekday}-${s.period}`}
                className={styles.ttTodayItem}
                style={{ '--slot-color': s.display_color || s.color || '#2d5a45' }}
              >
                <em>{s.period_title}</em>
                <strong>{s.display_subject || s.subject_title}</strong>
                <span>
                  {s.period_time ? toFaDigits(s.period_time) : ''}
                  {role === 'teacher' && s.class_title ? ` · ${s.class_title}` : ''}
                  {role === 'student' && s.teacher_name ? ` · ${s.teacher_name}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : data.today_weekday === 6 ? (
        <div className={styles.ttTodayBarMuted}>جمعه — تعطیل</div>
      ) : data.today_weekday != null && data.today_weekday <= 5 ? (
        <div className={styles.ttTodayBarMuted}>امروز جلسه‌ای نیست</div>
      ) : null}

      {role === 'teacher' && (data.classes || []).length ? (
        <div className={styles.ttClassPills}>
          {(data.classes || []).map((c) => (
            <span key={c.id} className={styles.ttClassPill} style={{ '--cls-color': c.color || '#2d5a45' }}>
              {c.display_title || c.title}
            </span>
          ))}
        </div>
      ) : null}

      {(data.periods || []).length ? (
        <WeeklyScheduleGrid
          weekdays={data.weekdays}
          periods={data.periods}
          grid={data.grid || {}}
          todayWeekday={data.today_weekday}
          highlightTeacherId={role === 'teacher' ? data.teacher?.id : null}
        />
      ) : (
        <div className={styles.attEmpty}><p>برنامه‌ای چیده نشده.</p></div>
      )}
    </div>
  )
}
